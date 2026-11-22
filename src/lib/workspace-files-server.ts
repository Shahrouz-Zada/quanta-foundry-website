import 'server-only';

// =============================================================================
// Workspace Q · student files (spec F10) — server side: who the viewer is in
// a class, which files they may see, storage usage and the audit log.
// Every route and server action goes through getClassViewer() first.
// =============================================================================

import type { FileShareLevel, Prisma, PrismaClient } from '@prisma/client';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isPlatformAdmin } from '@/lib/courses';
import {
  PENDING_UPLOAD_TTL_MS,
  canDeleteFile,
  canEditFile,
  canSeeVersions,
  canViewFile,
  type FileAccessFacts,
  type FileViewer,
} from '@/lib/workspace-files';

// lib/prisma.ts exports `any` (because of $extends); re-typed here for type
// checking. Its extension only concerns SessionVersion.
export const filesDb = prisma as PrismaClient;

/** The private Blob store for student work has its own token (env prefix STUDENT_FILES). */
export function studentFilesToken(): string | undefined {
  return process.env.STUDENT_FILES_READ_WRITE_TOKEN || undefined;
}

export type ClassViewerCheck =
  | { status: 'signed-out' }
  | { status: 'not-found' }
  | { status: 'not-enrolled'; email: string | null }
  | {
      status: 'ok';
      viewer: FileViewer;
      user: { id: string; name: string | null; email: string };
      offering: { id: string; name: string };
    };

/**
 * Who is asking, in this class: staff (INSTRUCTOR enrolment or platform
 * ADMIN), learner, or observer. Anyone else gets nothing.
 */
export async function getClassViewer(offeringId: string): Promise<ClassViewerCheck> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { status: 'signed-out' };

  const [user, offering] = await Promise.all([
    filesDb.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        globalRole: true,
        enrollments: { where: { offeringId }, select: { role: true } },
        teamMemberships: { where: { offeringId }, select: { teamId: true } },
      },
    }),
    filesDb.offering.findUnique({ where: { id: offeringId }, select: { id: true, name: true } }),
  ]);

  if (!user) return { status: 'signed-out' };
  if (!offering) return { status: 'not-found' };

  const enrolment = user.enrollments[0];
  let role: FileViewer['role'] | null = null;
  if (isPlatformAdmin(user) || enrolment?.role === 'INSTRUCTOR') role = 'staff';
  else if (enrolment?.role === 'LEARNER') role = 'learner';
  else if (enrolment?.role === 'OBSERVER') role = 'observer';
  if (!role) return { status: 'not-enrolled', email: user.email };

  return {
    status: 'ok',
    viewer: { userId: user.id, role, teamId: user.teamMemberships[0]?.teamId ?? null },
    user: { id: user.id, name: user.name, email: user.email },
    offering,
  };
}

// -----------------------------------------------------------------------------
// Loading files with the facts the permission rules need
// -----------------------------------------------------------------------------

const fileInclude = {
  owner: {
    select: { id: true, name: true, teamMemberships: { select: { offeringId: true, teamId: true } } },
  },
  team: { select: { id: true, name: true } },
  versions: {
    orderBy: { createdAt: 'desc' },
    include: { uploadedBy: { select: { name: true } } },
  },
} satisfies Prisma.StudentFileInclude;

export type LoadedFile = Prisma.StudentFileGetPayload<{ include: typeof fileInclude }>;

export function accessFacts(file: LoadedFile): FileAccessFacts {
  return {
    ownerId: file.ownerId,
    teamId: file.teamId,
    shareLevel: file.shareLevel,
    ownerTeamId: file.owner.teamMemberships.find((m) => m.offeringId === file.offeringId)?.teamId ?? null,
  };
}

export async function loadFile(fileId: string): Promise<LoadedFile | null> {
  return filesDb.studentFile.findUnique({ where: { id: fileId }, include: fileInclude });
}

/** What the Files page shows for one file. Contains no storage paths or URLs. */
export interface FileView {
  id: string;
  title: string;
  shareLevel: FileShareLevel;
  teamId: string | null;
  teamName: string | null;
  ownerId: string;
  ownerName: string | null;
  isMine: boolean;
  canEdit: boolean;
  canDelete: boolean;
  current: VersionView;
  /** Older versions, newest first; empty unless the viewer may see them. */
  older: VersionView[];
  updatedAt: string;
}

export interface VersionView {
  id: string;
  fileName: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string | null;
}

/** A person's name as classmates see it. Never derived from their email; the page shows "Unnamed" instead. */
function displayName(u: { name: string | null }): string | null {
  return u.name?.trim() || null;
}

function toVersionView(v: LoadedFile['versions'][number]): VersionView {
  return {
    id: v.id,
    fileName: v.fileName,
    sizeBytes: v.sizeBytes,
    uploadedAt: v.createdAt.toISOString(),
    uploadedBy: displayName(v.uploadedBy),
  };
}

export function toFileView(viewer: FileViewer, file: LoadedFile): FileView | null {
  const facts = accessFacts(file);
  if (!canViewFile(viewer, facts) || file.versions.length === 0) return null;
  const [current, ...older] = file.versions;
  return {
    id: file.id,
    title: file.title,
    shareLevel: file.shareLevel,
    teamId: file.teamId,
    teamName: file.team?.name ?? null,
    ownerId: file.ownerId,
    ownerName: displayName(file.owner),
    isMine: file.ownerId === viewer.userId,
    canEdit: canEditFile(viewer, facts),
    canDelete: canDeleteFile(viewer, facts),
    current: toVersionView(current),
    older: canSeeVersions(viewer, facts) ? older.map(toVersionView) : [],
    updatedAt: file.updatedAt.toISOString(),
  };
}

/**
 * Every file in the class the viewer may see. The database query already
 * narrows to candidate files; canViewFile() is the final word on each one.
 */
export async function getVisibleFiles(offeringId: string, viewer: FileViewer): Promise<FileView[]> {
  let where: Prisma.StudentFileWhereInput = { offeringId };
  if (viewer.role === 'observer') {
    where = { offeringId, shareLevel: 'CLASS' };
  } else if (viewer.role === 'learner') {
    const or: Prisma.StudentFileWhereInput[] = [{ ownerId: viewer.userId }, { shareLevel: 'CLASS' }];
    if (viewer.teamId) {
      or.push({ teamId: viewer.teamId });
      or.push({
        teamId: null,
        shareLevel: 'TEAM',
        owner: { teamMemberships: { some: { teamId: viewer.teamId } } },
      });
    }
    where = { offeringId, OR: or };
  }
  const files = await filesDb.studentFile.findMany({
    where,
    include: fileInclude,
    orderBy: { updatedAt: 'desc' },
  });
  return files.map((f) => toFileView(viewer, f)).filter((f): f is FileView => f !== null);
}

// -----------------------------------------------------------------------------
// Storage usage (F10.6)
// -----------------------------------------------------------------------------

/** Bytes used by a student's personal files, or by a team's files (all versions count). */
export async function storageUsedBytes(
  offeringId: string,
  space: { kind: 'personal'; userId: string } | { kind: 'team'; teamId: string },
  client: Pick<PrismaClient, 'studentFileVersion'> = filesDb,
): Promise<number> {
  const fileWhere: Prisma.StudentFileWhereInput =
    space.kind === 'team'
      ? { offeringId, teamId: space.teamId }
      : { offeringId, teamId: null, ownerId: space.userId };
  const sum = await client.studentFileVersion.aggregate({
    where: { file: fileWhere },
    _sum: { sizeBytes: true },
  });
  return sum._sum.sizeBytes ?? 0;
}

// -----------------------------------------------------------------------------
// Audit log (F10.7)
// -----------------------------------------------------------------------------

export async function audit(
  tx: Pick<PrismaClient, 'workspaceAuditLog'>,
  entry: {
    offeringId: string;
    actorId: string;
    action: string;
    entity: 'StudentFile' | 'Team' | 'TeamMember' | 'Offering' | 'Enrollment' | 'ClassSession' | 'ClassMaterial' | 'ClassTool';
    entityId: string;
    details?: Prisma.InputJsonValue;
  },
): Promise<void> {
  await tx.workspaceAuditLog.create({ data: entry });
}

// -----------------------------------------------------------------------------
// Abandoned uploads
// -----------------------------------------------------------------------------

/**
 * Deletes uploads that got a token more than an hour ago but were never saved,
 * both the stored file and the row. Runs whenever someone starts an upload,
 * so no scheduled job is needed. Never touches a file that was saved.
 */
export async function sweepAbandonedUploads(del: (pathnames: string[]) => Promise<void>, now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - PENDING_UPLOAD_TTL_MS);
  const stale = await filesDb.pendingUpload.findMany({
    where: { createdAt: { lt: cutoff } },
    orderBy: { createdAt: 'asc' },
    take: 50,
    select: { id: true, blobPathname: true },
  });
  if (stale.length === 0) return 0;
  // The same store holds student files and class materials: a path saved as either is never touched.
  const paths = stale.map((p) => p.blobPathname);
  const [savedFiles, savedMaterials] = await Promise.all([
    filesDb.studentFileVersion.findMany({ where: { blobPathname: { in: paths } }, select: { blobPathname: true } }),
    filesDb.classMaterialVersion.findMany({ where: { blobPathname: { in: paths } }, select: { blobPathname: true } }),
  ]);
  const savedSet = new Set([...savedFiles, ...savedMaterials].map((v) => v.blobPathname));
  const toDelete = stale.map((p) => p.blobPathname).filter((p) => !savedSet.has(p));
  if (toDelete.length > 0) {
    try {
      await del(toDelete);
    } catch (error) {
      console.error('Could not delete abandoned uploads; will retry later:', error);
      return 0; // keep the rows so the next sweep tries again
    }
  }
  await filesDb.pendingUpload.deleteMany({ where: { id: { in: stale.map((p) => p.id) } } });
  return toDelete.length;
}

// -----------------------------------------------------------------------------
// Class addresses: id or slug
// -----------------------------------------------------------------------------

/**
 * The interactive session pages use the class's slug in their address
 * (/workspace-q/<slug>/session/…), while the class pages use its id. When a
 * class page is opened with the slug (for example from the header on a
 * session page), this gives the id so the page can redirect.
 */
export async function offeringIdForSlug(param: string): Promise<string | null> {
  if (!/^[A-Za-z0-9_-]{1,120}$/.test(param)) return null;
  const bySlug = await filesDb.offering.findUnique({ where: { slug: param }, select: { id: true } });
  return bySlug && bySlug.id !== param ? bySlug.id : null;
}
