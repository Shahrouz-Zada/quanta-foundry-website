'use server';

// =============================================================================
// Workspace Q · Files (spec F10) — server actions.
// Every action finds out who the caller is in this class first and checks the
// rules in lib/workspace-files.ts; hiding buttons on the page protects nothing.
// =============================================================================

import { revalidatePath } from 'next/cache';
import { del, head } from '@vercel/blob';
import { z } from 'zod';
import {
  accessFacts,
  audit,
  filesDb as db,
  getClassViewer,
  loadFile,
  storageUsedBytes,
  studentFilesToken,
} from '@/lib/workspace-files-server';
import {
  MAX_STUDENT_FILE_BYTES,
  allowedShareLevels,
  canDeleteFile,
  canEditFile,
  isValidStudentBlobPathname,
  storageQuotaBytes,
  type FileViewer,
} from '@/lib/workspace-files';
import { titleFromFileName } from '@/lib/course-files';

export type ActionResult = { ok: true; fileId?: string } | { ok: false; error: string };

class UserError extends Error {}

function fail(error: unknown): ActionResult {
  if (error instanceof UserError) return { ok: false, error: error.message };
  if (error instanceof z.ZodError) return { ok: false, error: error.issues[0]?.message ?? 'Invalid input.' };
  console.error('Workspace files action failed:', error);
  const code = (error as { code?: unknown } | null)?.code;
  if (code === 'P2025') return { ok: false, error: 'This item no longer exists. Refresh the page.' };
  if (code === 'P2002') return { ok: false, error: 'That was already saved. Refresh the page.' };
  return { ok: false, error: 'Something went wrong. Please try again.' };
}

const id = z.string().min(1).max(64);
const title = z.string().trim().min(1, 'Please enter a name.').max(200, 'That name is too long.');
const shareLevel = z.enum(['STAFF', 'TEAM', 'CLASS']);

function refresh(offeringId: string) {
  revalidatePath(`/workspace-q/${offeringId}/files`);
}

async function requireViewer(offeringId: string, roles: FileViewer['role'][]) {
  const check = await getClassViewer(offeringId);
  if (check.status !== 'ok' || !roles.includes(check.viewer.role)) {
    throw new UserError('You don’t have permission to do this.');
  }
  return check;
}

async function deleteBlobs(pathnames: string[]) {
  const token = studentFilesToken();
  if (pathnames.length === 0 || !token) return;
  try {
    await del(pathnames, { token });
  } catch (error) {
    // The database rows are gone, so nothing can reach these files any more;
    // log so they can be cleaned up.
    console.error('Could not delete student files from storage:', pathnames, error);
  }
}

// -----------------------------------------------------------------------------
// Files
// -----------------------------------------------------------------------------

const registerSchema = z.object({
  offeringId: id,
  pathname: z.string().min(1).max(400),
  fileName: z.string().trim().min(1).max(255),
  space: z.enum(['personal', 'team']),
  shareLevel: shareLevel.optional(),
  fileId: id.optional(), // new version of an existing file
});

/**
 * Called by the page right after a file reached storage. Needs the pending
 * upload this student started (so nobody can claim someone else's upload),
 * reads the real size from storage (never the browser's figure), checks the
 * quota while holding a lock on that storage space (so parallel saves can't
 * get past it), and saves the file or its new version.
 */
export async function registerUpload(input: z.input<typeof registerSchema>): Promise<ActionResult> {
  // Set only once we know the path is this student's own unsaved upload in
  // this class: only then may a failure below remove it from storage.
  let cleanupPathname = '';
  try {
    const data = registerSchema.parse(input);
    const { viewer, user } = await requireViewer(data.offeringId, ['learner']);
    if (!isValidStudentBlobPathname(data.pathname, data.offeringId)) throw new UserError('Invalid file location.');

    const token = studentFilesToken();
    if (!token) throw new UserError('File storage is not connected yet.');

    const pending = await db.pendingUpload.findUnique({ where: { blobPathname: data.pathname } });
    if (!pending || pending.userId !== user.id || pending.offeringId !== data.offeringId) {
      throw new UserError('This upload has expired. Please upload the file again.');
    }
    cleanupPathname = data.pathname;

    let existing = null;
    let teamId: string | null = null;
    if (data.fileId) {
      existing = await loadFile(data.fileId);
      if (!existing || existing.offeringId !== data.offeringId || !canEditFile(viewer, accessFacts(existing))) {
        throw new UserError('You can’t upload a new version of this file.');
      }
      teamId = existing.teamId;
    } else if (data.space === 'team') {
      if (!viewer.teamId) throw new UserError('You are not in a team yet.');
      teamId = viewer.teamId;
    }
    const level = data.shareLevel ?? (teamId ? 'TEAM' : 'STAFF');
    if (!existing && !allowedShareLevels(Boolean(teamId)).includes(level)) {
      throw new UserError('That sharing option isn’t available here.');
    }

    const blob = await head(data.pathname, { token }).catch(() => null);
    if (!blob) throw new UserError('The upload didn’t finish. Please try again.');
    if (blob.size > MAX_STUDENT_FILE_BYTES) throw new UserError('Files can be up to 20 MB.');

    const version = {
      blobPathname: data.pathname,
      fileName: data.fileName,
      contentType: blob.contentType || null,
      sizeBytes: blob.size,
      uploadedById: user.id,
    };
    const space = teamId ? ({ kind: 'team', teamId } as const) : ({ kind: 'personal', userId: viewer.userId } as const);

    let savedFileId = existing?.id;
    await db.$transaction(async (tx) => {
      // One save at a time per storage space, so the quota check below can't race.
      const lockKey = `workspace-files:${data.offeringId}:${teamId ?? viewer.userId}`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
      const used = await storageUsedBytes(data.offeringId, space, tx);
      if (used + blob.size > storageQuotaBytes()) {
        throw new UserError('Not enough space left. Delete some files first.');
      }
      // Consuming the pending record also stops a second save of the same upload.
      const consumed = await tx.pendingUpload.deleteMany({ where: { id: pending.id } });
      if (consumed.count !== 1) throw new UserError('That upload was already saved.');

      if (existing) {
        await tx.studentFileVersion.create({ data: { ...version, fileId: existing.id } });
        await tx.studentFile.update({ where: { id: existing.id }, data: { updatedAt: new Date() } });
        await audit(tx, {
          offeringId: data.offeringId,
          actorId: user.id,
          action: 'file.version',
          entity: 'StudentFile',
          entityId: existing.id,
          details: { fileName: data.fileName, sizeBytes: blob.size },
        });
        return;
      }
      const file = await tx.studentFile.create({
        data: {
          offeringId: data.offeringId,
          ownerId: user.id,
          teamId,
          title: titleFromFileName(data.fileName).slice(0, 200) || 'Untitled',
          shareLevel: level,
          versions: { create: version },
        },
      });
      savedFileId = file.id;
      await audit(tx, {
        offeringId: data.offeringId,
        actorId: user.id,
        action: 'file.upload',
        entity: 'StudentFile',
        entityId: file.id,
        details: { fileName: data.fileName, sizeBytes: blob.size, shareLevel: level, teamId },
      });
    });

    refresh(data.offeringId);
    return { ok: true, fileId: savedFileId };
  } catch (error) {
    if (cleanupPathname) await discardUnsavedUpload(cleanupPathname);
    return fail(error);
  }
}

/**
 * The file reached storage but won't be saved: remove it so it doesn't take
 * space. Checks first that no saved version uses it (a parallel save of the
 * same upload may have won), so a saved file is never deleted.
 */
async function discardUnsavedUpload(pathname: string) {
  try {
    const saved = await db.studentFileVersion.findUnique({ where: { blobPathname: pathname }, select: { id: true } });
    if (saved) return;
    await deleteBlobs([pathname]);
    await db.pendingUpload.deleteMany({ where: { blobPathname: pathname } });
  } catch (error) {
    console.error('Could not discard an unsaved upload:', pathname, error);
  }
}

export async function renameFile(input: { fileId: string; title: string }): Promise<ActionResult> {
  try {
    const data = z.object({ fileId: id, title }).parse(input);
    const file = await loadFile(data.fileId);
    if (!file) throw new UserError('This file no longer exists. Refresh the page.');
    const { viewer, user } = await requireViewer(file.offeringId, ['learner']);
    if (!canEditFile(viewer, accessFacts(file))) throw new UserError('You can’t rename this file.');
    await db.$transaction([
      db.studentFile.update({ where: { id: file.id }, data: { title: data.title } }),
      db.workspaceAuditLog.create({
        data: {
          offeringId: file.offeringId, actorId: user.id, action: 'file.rename', entity: 'StudentFile',
          entityId: file.id, details: { from: file.title, to: data.title },
        },
      }),
    ]);
    refresh(file.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function setShareLevel(input: { fileId: string; shareLevel: string }): Promise<ActionResult> {
  try {
    const data = z.object({ fileId: id, shareLevel }).parse(input);
    const file = await loadFile(data.fileId);
    if (!file) throw new UserError('This file no longer exists. Refresh the page.');
    const { viewer, user } = await requireViewer(file.offeringId, ['learner']);
    if (!canEditFile(viewer, accessFacts(file))) throw new UserError('You can’t change who sees this file.');
    if (!allowedShareLevels(Boolean(file.teamId)).includes(data.shareLevel)) {
      throw new UserError('That sharing option isn’t available here.');
    }
    if (file.shareLevel === data.shareLevel) return { ok: true };
    await db.$transaction([
      db.studentFile.update({ where: { id: file.id }, data: { shareLevel: data.shareLevel } }),
      db.workspaceAuditLog.create({
        data: {
          offeringId: file.offeringId, actorId: user.id, action: 'file.share', entity: 'StudentFile',
          entityId: file.id, details: { from: file.shareLevel, to: data.shareLevel },
        },
      }),
    ]);
    refresh(file.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteFile(input: { fileId: string }): Promise<ActionResult> {
  try {
    const data = z.object({ fileId: id }).parse(input);
    const file = await loadFile(data.fileId);
    if (!file) throw new UserError('This file no longer exists. Refresh the page.');
    const { viewer, user } = await requireViewer(file.offeringId, ['learner', 'staff']);
    if (!canDeleteFile(viewer, accessFacts(file))) throw new UserError('You can’t delete this file.');
    const attached = await db.activitySubmissionFile.count({ where: { fileVersion: { fileId: file.id } } });
    if (attached > 0) {
      throw new UserError('This file is attached to an activity. Remove it from the activity first, so submitted work is not lost.');
    }
    await db.$transaction([
      db.studentFile.delete({ where: { id: file.id } }),
      db.workspaceAuditLog.create({
        data: {
          offeringId: file.offeringId, actorId: user.id, action: 'file.delete', entity: 'StudentFile',
          entityId: file.id,
          details: { title: file.title, ownerId: file.ownerId, teamId: file.teamId, versions: file.versions.length },
        },
      }),
    ]);
    await deleteBlobs(file.versions.map((v) => v.blobPathname));
    refresh(file.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

// -----------------------------------------------------------------------------
// Teams (staff only) — the minimum F10 needs; F3 will extend this.
// -----------------------------------------------------------------------------

const teamName = z.string().trim().min(1, 'Please enter a team name.').max(80, 'That name is too long.');

export async function createTeam(input: { offeringId: string; name: string }): Promise<ActionResult> {
  try {
    const data = z.object({ offeringId: id, name: teamName }).parse(input);
    const { user } = await requireViewer(data.offeringId, ['staff']);
    const count = await db.team.count({ where: { offeringId: data.offeringId } });
    await db.$transaction(async (tx) => {
      const team = await tx.team.create({ data: { offeringId: data.offeringId, name: data.name, order: count } });
      await audit(tx, {
        offeringId: data.offeringId, actorId: user.id, action: 'team.create', entity: 'Team',
        entityId: team.id, details: { name: data.name },
      });
    });
    refresh(data.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function renameTeam(input: { teamId: string; name: string }): Promise<ActionResult> {
  try {
    const data = z.object({ teamId: id, name: teamName }).parse(input);
    const team = await db.team.findUnique({ where: { id: data.teamId } });
    if (!team) throw new UserError('This team no longer exists. Refresh the page.');
    const { user } = await requireViewer(team.offeringId, ['staff']);
    await db.$transaction([
      db.team.update({ where: { id: team.id }, data: { name: data.name } }),
      db.workspaceAuditLog.create({
        data: {
          offeringId: team.offeringId, actorId: user.id, action: 'team.rename', entity: 'Team',
          entityId: team.id, details: { from: team.name, to: data.name },
        },
      }),
    ]);
    refresh(team.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteTeam(input: { teamId: string }): Promise<ActionResult> {
  try {
    const data = z.object({ teamId: id }).parse(input);
    const team = await db.team.findUnique({
      where: { id: data.teamId },
      include: { _count: { select: { files: true } }, members: { select: { userId: true } } },
    });
    if (!team) throw new UserError('This team no longer exists. Refresh the page.');
    const { user } = await requireViewer(team.offeringId, ['staff']);
    if (team._count.files > 0) {
      throw new UserError('This team still has files. Delete them first, so no student work is lost by accident.');
    }
    if ((await db.activitySubmission.count({ where: { teamId: team.id } })) > 0) {
      throw new UserError('This team has activity answers, so it can’t be deleted (its work would be lost). Rename it instead.');
    }
    await db.$transaction([
      db.team.delete({ where: { id: team.id } }), // memberships go with it
      db.workspaceAuditLog.create({
        data: {
          offeringId: team.offeringId, actorId: user.id, action: 'team.delete', entity: 'Team',
          entityId: team.id, details: { name: team.name, removedMembers: team.members.map((m) => m.userId) },
        },
      }),
    ]);
    refresh(team.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/** Puts a student in a team, moves them, or (teamId null) takes them out of any team. */
export async function assignTeam(input: { offeringId: string; userId: string; teamId: string | null }): Promise<ActionResult> {
  try {
    const data = z.object({ offeringId: id, userId: id, teamId: id.nullable() }).parse(input);
    const { user } = await requireViewer(data.offeringId, ['staff']);
    const enrolment = await db.enrollment.findUnique({
      where: { offeringId_userId: { offeringId: data.offeringId, userId: data.userId } },
    });
    if (enrolment?.role !== 'LEARNER') throw new UserError('Only students of this class can be put in a team.');
    if (data.teamId) {
      const team = await db.team.findUnique({ where: { id: data.teamId } });
      if (!team || team.offeringId !== data.offeringId) throw new UserError('This team no longer exists. Refresh the page.');
    }
    const current = await db.teamMember.findUnique({
      where: { offeringId_userId: { offeringId: data.offeringId, userId: data.userId } },
    });
    if ((current?.teamId ?? null) === data.teamId) return { ok: true };

    await db.$transaction(async (tx) => {
      if (current) await tx.teamMember.delete({ where: { id: current.id } });
      if (data.teamId) {
        await tx.teamMember.create({ data: { teamId: data.teamId, offeringId: data.offeringId, userId: data.userId } });
      }
      await audit(tx, {
        offeringId: data.offeringId, actorId: user.id, action: 'team.assign', entity: 'TeamMember',
        entityId: data.userId, details: { from: current?.teamId ?? null, to: data.teamId },
      });
    });
    refresh(data.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
