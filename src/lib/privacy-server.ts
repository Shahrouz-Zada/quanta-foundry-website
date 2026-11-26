import 'server-only';

// =============================================================================
// Workspace Q · privacy — deleting a class's student data on its deletion
// date, deleting one person's account, and exporting a student's work.
//
// What "student data" means here: enrolments of students and observers, teams,
// files (and their stored copies), activity answers, discussions, the class
// activity log. Teaching content (sessions, materials, activities) is the
// instructor's and stays, so the class can be taught again.
//
// Deleting an account erases what identifies the person and deletes what was
// theirs alone. What they made together with a team (team files, team
// answers) stays with the team, shown as by "Unnamed".
// =============================================================================

import type { Prisma, PrismaClient } from '@prisma/client';
import { get } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { isPlatformAdmin } from '@/lib/courses';
import { readAnswers, readConfig } from '@/lib/workspace-activities';
import { submissionMarkdown } from '@/lib/privacy';
import { uniqueNamer, zipSafeName, type ZipEntry } from '@/lib/zip-stream';

export const privacyDb = prisma as PrismaClient;

type Tx = Prisma.TransactionClient;
export type DeleteBlobs = (pathnames: string[]) => Promise<void>;

const TX_OPTIONS = { timeout: 60_000, maxWait: 10_000 };

// -----------------------------------------------------------------------------
// One person's account
// -----------------------------------------------------------------------------

export type AccountCheck = { ok: true } | { ok: false; reason: 'not-found' | 'staff' | 'already-deleted' };

/** Staff and admins can't delete their account here (their classes depend on it). */
export async function canDeleteAccount(userId: string): Promise<AccountCheck> {
  const user = await privacyDb.user.findUnique({
    where: { id: userId },
    select: { email: true, globalRole: true, deletedAt: true, enrollments: { select: { role: true } } },
  });
  if (!user) return { ok: false, reason: 'not-found' };
  if (user.deletedAt) return { ok: false, reason: 'already-deleted' };
  if (isPlatformAdmin(user) || user.enrollments.some((e) => e.role === 'INSTRUCTOR')) return { ok: false, reason: 'staff' };
  return { ok: true };
}

/**
 * Deletes everything that is one person's alone and erases what identifies
 * them. Returns the stored files to remove once the database change is saved.
 */
async function eraseAccountTx(tx: Tx, userId: string, now: Date): Promise<{ pathnames: string[]; classes: string[] }> {
  const classes = (await tx.enrollment.findMany({ where: { userId }, select: { offeringId: true } })).map((e) => e.offeringId);

  // Personal files (not team files) and their stored copies.
  const personal = await tx.studentFileVersion.findMany({
    where: { file: { ownerId: userId, teamId: null } },
    select: { id: true, blobPathname: true },
  });
  const pending = await tx.pendingUpload.findMany({ where: { userId }, select: { blobPathname: true } });
  await tx.activitySubmissionFile.deleteMany({ where: { fileVersionId: { in: personal.map((v) => v.id) } } });
  await tx.studentFile.deleteMany({ where: { ownerId: userId, teamId: null } });
  await tx.pendingUpload.deleteMany({ where: { userId } });

  // Individual activity answers, and the conversations about them.
  await tx.activitySubmission.deleteMany({ where: { userId } });
  await tx.discussionThread.deleteMany({ where: { ownerKey: `user:${userId}` } });

  // Messages elsewhere (team boards, team files): the text is erased.
  await tx.discussionMessage.updateMany({
    where: { authorId: userId, deletedAt: null },
    data: { body: '', deletedAt: now, deletedById: userId, updatedAt: now },
  });
  await tx.discussionRead.deleteMany({ where: { userId } });

  // Older Workspace Q session data (prediction locks, progress, briefs).
  await tx.predictionLockAudit.deleteMany({ where: { response: { userId } } });
  await tx.response.deleteMany({ where: { userId } });
  await tx.progress.deleteMany({ where: { userId } });
  await tx.artifactVersion.deleteMany({ where: { artifact: { project: { ownerId: userId } } } });
  await tx.artifact.deleteMany({ where: { project: { ownerId: userId } } });
  await tx.projectMember.deleteMany({ where: { OR: [{ userId }, { project: { ownerId: userId } }] } });
  await tx.project.deleteMany({ where: { ownerId: userId } });

  // Memberships, sign-in links, and finally who they were.
  await tx.teamMember.deleteMany({ where: { userId } });
  await tx.joinAttempt.deleteMany({ where: { userId } });
  await tx.enrollment.deleteMany({ where: { userId } });
  await tx.account.deleteMany({ where: { userId } });
  await tx.user.update({
    where: { id: userId },
    data: { name: null, email: `deleted-${userId}@deleted.invalid`, emailVerified: null, image: null, deletedAt: now },
  });

  for (const offeringId of classes) {
    await tx.workspaceAuditLog.create({
      data: { offeringId, actorId: userId, action: 'account.delete', entity: 'Enrollment', entityId: userId },
    });
  }
  return { pathnames: [...personal.map((v) => v.blobPathname), ...pending.map((p) => p.blobPathname)], classes };
}

export async function deleteAccount(userId: string, deleteBlobs: DeleteBlobs): Promise<AccountCheck> {
  const check = await canDeleteAccount(userId);
  if (!check.ok) return check;
  const { pathnames } = await privacyDb.$transaction((tx) => eraseAccountTx(tx, userId, new Date()), TX_OPTIONS);
  await deleteBlobs(pathnames);
  return { ok: true };
}

// -----------------------------------------------------------------------------
// A class's student data
// -----------------------------------------------------------------------------

export interface PurgeResult {
  students: number;
  files: number;
  answers: number;
  threads: number;
  teams: number;
  accountsErased: number;
}

/**
 * Deletes all student data of a class (see the top of this file) and closes
 * joining. Students left with no class at all have their account erased too.
 */
export async function purgeClassData(offeringId: string, actorId: string | null, deleteBlobs: DeleteBlobs): Promise<PurgeResult | null> {
  const offering = await privacyDb.offering.findUnique({ where: { id: offeringId }, select: { id: true, dataDeletedAt: true } });
  if (!offering) return null;
  const now = new Date();

  const result = await privacyDb.$transaction(async (tx) => {
    const learners = (
      await tx.enrollment.findMany({ where: { offeringId, role: { in: ['LEARNER', 'OBSERVER'] } }, select: { userId: true } })
    ).map((e) => e.userId);
    const versions = await tx.studentFileVersion.findMany({ where: { file: { offeringId } }, select: { blobPathname: true } });
    const pending = await tx.pendingUpload.findMany({ where: { offeringId }, select: { blobPathname: true } });

    const threads = await tx.discussionThread.deleteMany({ where: { offeringId } });
    const answers = await tx.activitySubmission.deleteMany({ where: { offeringId } });
    const files = await tx.studentFile.deleteMany({ where: { offeringId } });
    await tx.teamAudit.deleteMany({ where: { offeringId } });
    await tx.teamMember.deleteMany({ where: { offeringId } });
    const teams = await tx.team.deleteMany({ where: { offeringId } });
    await tx.pendingUpload.deleteMany({ where: { offeringId } });

    // Older Workspace Q session data of this class's students.
    const ofClass = { offeringSession: { offeringId }, userId: { in: learners } };
    await tx.predictionLockAudit.deleteMany({ where: { response: ofClass } });
    await tx.response.deleteMany({ where: ofClass });
    await tx.progress.deleteMany({ where: ofClass });
    const artifactWhere = { offeringSession: { offeringId }, project: { ownerId: { in: learners } } };
    await tx.artifactVersion.deleteMany({ where: { artifact: artifactWhere } });
    await tx.artifact.deleteMany({ where: artifactWhere });

    await tx.enrollment.deleteMany({ where: { offeringId, role: { in: ['LEARNER', 'OBSERVER'] } } });
    await tx.workspaceAuditLog.deleteMany({ where: { offeringId } });
    await tx.offering.update({ where: { id: offeringId }, data: { dataDeletedAt: now, joinCode: null, joinCodeExpiresAt: null } });

    // Students who now have no class at all: their account goes too.
    const leftovers = await tx.user.findMany({
      where: { id: { in: learners }, deletedAt: null, enrollments: { none: {} }, globalRole: { not: 'ADMIN' } },
      select: { id: true, email: true, globalRole: true },
    });
    const extraPaths: string[] = [];
    let accountsErased = 0;
    for (const u of leftovers) {
      if (isPlatformAdmin(u)) continue;
      const erased = await eraseAccountTx(tx, u.id, now);
      extraPaths.push(...erased.pathnames);
      accountsErased++;
    }

    const counts = { students: learners.length, files: files.count, answers: answers.count, threads: threads.count, teams: teams.count, accountsErased };
    // A new log starts with this one line, which holds no personal data.
    await tx.workspaceAuditLog.create({
      data: { offeringId, actorId: actorId ?? 'system', action: 'class.data_deleted', entity: 'Offering', entityId: offeringId, details: counts },
    });
    return { counts, pathnames: [...versions.map((v) => v.blobPathname), ...pending.map((p) => p.blobPathname), ...extraPaths] };
  }, TX_OPTIONS);

  await deleteBlobs(result.pathnames);
  return result.counts;
}

/** Classes whose deletion date has passed and whose data is still there. */
export async function classesDueForDeletion(now = new Date(), limit = 5): Promise<string[]> {
  const rows = await privacyDb.offering.findMany({
    where: { dataDeleteAfter: { lte: now }, dataDeletedAt: null },
    orderBy: { dataDeleteAfter: 'asc' },
    take: limit,
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

// -----------------------------------------------------------------------------
// "Download my work": one student, one class
// -----------------------------------------------------------------------------

async function readStored(pathname: string, token: string): Promise<Uint8Array | null> {
  try {
    const stored = await get(pathname, { access: 'private', token, useCache: false });
    if (!stored || stored.statusCode !== 200 || !stored.stream) return null;
    return new Uint8Array(await new Response(stored.stream).arrayBuffer());
  } catch (error) {
    console.error('Export: could not read a stored file', pathname, error);
    return null;
  }
}

const stamp = (d: Date) => d.toISOString().slice(0, 16).replace('T', ' ').replace(':', 'h');

/**
 * The files of a student's export, read one by one as the ZIP is sent.
 * Contents: their own files (every version), their team's files (current
 * versions), their answers (individual and team), the messages they wrote,
 * and a short profile.
 */
export async function* myDataEntries(userId: string, offeringId: string, token: string): AsyncGenerator<ZipEntry> {
  const now = new Date();
  const [user, offering, enrolment, membership] = await Promise.all([
    privacyDb.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true, email: true } }),
    privacyDb.offering.findUniqueOrThrow({ where: { id: offeringId }, select: { name: true, dataDeleteAfter: true } }),
    privacyDb.enrollment.findUnique({ where: { offeringId_userId: { offeringId, userId } }, select: { role: true, createdAt: true } }),
    privacyDb.teamMember.findUnique({ where: { offeringId_userId: { offeringId, userId } }, select: { team: { select: { id: true, name: true } } } }),
  ]);
  const team = membership?.team ?? null;
  const missing: string[] = [];

  yield {
    name: 'README.txt',
    data: [
      `Your work in "${offering.name}" (Workspace Q, Quanta Foundry)`,
      `Exported on ${now.toISOString()}`,
      '',
      'profile.json      who you are in this class',
      'my-files/         files you uploaded for yourself, with their earlier versions',
      'team-files/       your team’s shared files (current versions)',
      'answers/          your activity answers, and your team’s',
      'messages.md       the messages you wrote',
      '',
      offering.dataDeleteAfter ? `This class's student data is deleted on ${offering.dataDeleteAfter.toISOString().slice(0, 10)}.` : '',
    ].join('\r\n'),
    date: now,
  };
  yield {
    name: 'profile.json',
    data: JSON.stringify(
      { name: user.name, email: user.email, class: offering.name, role: enrolment?.role ?? null, team: team?.name ?? null, joinedAt: enrolment?.createdAt ?? null, exportedAt: now },
      null,
      2,
    ),
    date: now,
  };

  // Files
  const own = await privacyDb.studentFile.findMany({
    where: { offeringId, ownerId: userId, teamId: null },
    orderBy: { createdAt: 'asc' },
    select: { title: true, versions: { orderBy: { createdAt: 'desc' }, select: { blobPathname: true, fileName: true, createdAt: true } } },
  });
  const ownName = uniqueNamer();
  for (const f of own) {
    const [current, ...older] = f.versions;
    if (!current) continue;
    const name = ownName(zipSafeName(current.fileName));
    yield { name: `my-files/${name}`, date: current.createdAt, data: async () => (await readStored(current.blobPathname, token)) ?? (missing.push(name), null) };
    for (const v of older) {
      const oldName = ownName(zipSafeName(`${stamp(v.createdAt)} ${v.fileName}`));
      yield { name: `my-files/earlier versions/${oldName}`, date: v.createdAt, data: async () => (await readStored(v.blobPathname, token)) ?? (missing.push(oldName), null) };
    }
  }
  if (team) {
    const teamFiles = await privacyDb.studentFile.findMany({
      where: { offeringId, teamId: team.id },
      orderBy: { createdAt: 'asc' },
      select: { versions: { orderBy: { createdAt: 'desc' }, take: 1, select: { blobPathname: true, fileName: true, createdAt: true } } },
    });
    const teamName = uniqueNamer();
    for (const f of teamFiles) {
      const v = f.versions[0];
      if (!v) continue;
      const name = teamName(zipSafeName(v.fileName));
      yield { name: `team-files/${name}`, date: v.createdAt, data: async () => (await readStored(v.blobPathname, token)) ?? (missing.push(name), null) };
    }
  }

  // Answers
  const keys = [`user:${userId}`, ...(team ? [`team:${team.id}`] : [])];
  const submissions = await privacyDb.activitySubmission.findMany({
    where: { offeringId, ownerKey: { in: keys }, activity: { visible: true } },
    orderBy: { createdAt: 'asc' },
    select: {
      ownerKey: true, answers: true, submittedAt: true, lastSavedAt: true,
      activity: { select: { titleEn: true, kind: true, config: true } },
    },
  });
  const answerName = uniqueNamer();
  const allAnswers: unknown[] = [];
  for (const s of submissions) {
    const config = readConfig(s.activity.config);
    const answers = readAnswers(s.answers);
    const owner = s.ownerKey.startsWith('team:') ? (team?.name ?? 'team') : 'individual';
    allAnswers.push({ activity: s.activity.titleEn, kind: s.activity.kind, owner, submittedAt: s.submittedAt, answers });
    yield {
      name: `answers/${answerName(zipSafeName(`${s.activity.titleEn}.md`))}`,
      date: s.lastSavedAt,
      data: submissionMarkdown({ activityTitle: s.activity.titleEn, kind: s.activity.kind, owner, submittedAt: s.submittedAt, lastSavedAt: s.lastSavedAt, config, answers }),
    };
  }
  if (allAnswers.length) yield { name: 'answers/answers.json', data: JSON.stringify(allAnswers, null, 2), date: now };

  // Messages they wrote
  const messages = await privacyDb.discussionMessage.findMany({
    where: { authorId: userId, deletedAt: null, thread: { offeringId } },
    orderBy: { createdAt: 'asc' },
    select: {
      body: true, createdAt: true,
      thread: { select: { kind: true, team: { select: { name: true } }, file: { select: { title: true } }, activity: { select: { titleEn: true } } } },
    },
  });
  const lines = [`# Messages you wrote in "${offering.name}"`, ''];
  for (const m of messages) {
    const where = m.thread.kind === 'TEAM' ? `Team board (${m.thread.team?.name ?? '—'})` : m.thread.kind === 'FILE' ? `File: ${m.thread.file?.title ?? '—'}` : `Activity: ${m.thread.activity?.titleEn ?? '—'}`;
    lines.push(`**${m.createdAt.toISOString().slice(0, 16).replace('T', ' ')}** · ${where}`, '', m.body, '');
  }
  if (!messages.length) lines.push('_No messages._');
  yield { name: 'messages.md', data: lines.join('\n'), date: now };

  if (missing.length) {
    yield { name: 'missing-files.txt', data: `These files could not be read from storage and are not in this archive:\r\n${missing.join('\r\n')}\r\n`, date: now };
  }
}
