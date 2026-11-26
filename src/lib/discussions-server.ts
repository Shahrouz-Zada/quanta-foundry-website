import 'server-only';

// =============================================================================
// Workspace Q · team discussion threads — who may read and write a thread,
// loading messages, and "new" counts. Every request checks access again from
// the thing the thread is about, so moving a student to another team, or a
// file being deleted, takes effect at once.
// =============================================================================

import type { DiscussionKind, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isPlatformAdmin } from '@/lib/courses';
import { accessFacts, getClassViewer, loadFile } from '@/lib/workspace-files-server';
import { canEditFile, type FileViewer } from '@/lib/workspace-files';
import { ownerKeyFor } from '@/lib/workspace-activities';
import { INITIAL_MESSAGES, POLL_OVERLAP_MS, parseThreadKey, type MessageView, type ThreadTarget } from '@/lib/discussions';

export const discussionsDb = prisma as PrismaClient;

export type ThreadAccess =
  | {
      ok: true;
      key: string;
      target: ThreadTarget;
      offeringId: string;
      viewer: FileViewer;
      user: { id: string; name: string | null };
      /** Staff may delete anyone's message. */
      canModerate: boolean;
      /** What a new thread row stores. */
      record: { kind: DiscussionKind; teamId: string | null; fileId: string | null; activityId: string | null; ownerKey: string | null };
    }
  | { ok: false; reason: 'signed-out' | 'not-found' };

const NOT_FOUND = { ok: false, reason: 'not-found' } as const;

/**
 * Decides whether the signed-in person may read and write a thread. The same
 * answer ("not found") is given whether the thing doesn't exist or isn't theirs.
 */
export async function resolveThread(key: unknown): Promise<ThreadAccess> {
  const target = parseThreadKey(key);
  if (!target) return NOT_FOUND;

  let offeringId: string;
  let allowed: (viewer: FileViewer) => boolean | Promise<boolean>;
  let record: Extract<ThreadAccess, { ok: true }>['record'];

  if (target.kind === 'TEAM') {
    const team = await discussionsDb.team.findUnique({ where: { id: target.teamId }, select: { offeringId: true } });
    if (!team) return NOT_FOUND;
    offeringId = team.offeringId;
    allowed = (v) => v.role === 'staff' || (v.role === 'learner' && v.teamId === target.teamId);
    record = { kind: 'TEAM', teamId: target.teamId, fileId: null, activityId: null, ownerKey: null };
  } else if (target.kind === 'FILE') {
    const file = await loadFile(target.fileId);
    if (!file) return NOT_FOUND;
    offeringId = file.offeringId;
    // The people who can edit the file (its owner, or its team) and staff. Readers through
    // "whole class" sharing or an audit pairing don't join its conversation.
    allowed = (v) => v.role === 'staff' || canEditFile(v, accessFacts(file));
    record = { kind: 'FILE', teamId: null, fileId: file.id, activityId: null, ownerKey: null };
  } else {
    const activity = await discussionsDb.activity.findUnique({
      where: { id: target.activityId },
      select: { offeringId: true, visible: true, submitter: true },
    });
    if (!activity) return NOT_FOUND;
    offeringId = activity.offeringId;
    // The owner must fit the activity: a team answer for a team activity, a student's for an individual one.
    if ((activity.submitter === 'TEAM') !== (target.ownerTeamId !== null)) return NOT_FOUND;
    allowed = async (v) => {
      if (v.role === 'staff') {
        // Only real owners in this class, so staff can't create stray threads.
        if (target.ownerTeamId) {
          return (await discussionsDb.team.count({ where: { id: target.ownerTeamId, offeringId } })) === 1;
        }
        return (
          (await discussionsDb.enrollment.count({ where: { offeringId, userId: target.ownerUserId ?? '', role: 'LEARNER' } })) === 1
        );
      }
      return v.role === 'learner' && activity.visible && ownerKeyFor(activity.submitter, v.userId, v.teamId) === target.ownerKey;
    };
    record = { kind: 'ACTIVITY', teamId: target.ownerTeamId, fileId: null, activityId: target.activityId, ownerKey: target.ownerKey };
  }

  const check = await getClassViewer(offeringId);
  if (check.status === 'signed-out') return { ok: false, reason: 'signed-out' };
  if (check.status !== 'ok') return NOT_FOUND;
  if (!(await allowed(check.viewer))) return NOT_FOUND;

  return {
    ok: true,
    key: key as string,
    target,
    offeringId,
    viewer: check.viewer,
    user: { id: check.user.id, name: check.user.name },
    canModerate: check.viewer.role === 'staff',
    record,
  };
}

// -----------------------------------------------------------------------------
// Messages
// -----------------------------------------------------------------------------

/** What a message needs from the database; the author's email is only used to recognise a platform admin, never sent. */
export function messageSelect(offeringId: string) {
  return {
    id: true,
    authorId: true,
    body: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    author: {
      select: { name: true, email: true, globalRole: true, enrollments: { where: { offeringId }, select: { offeringId: true, role: true } } },
    },
  } as const;
}

type MessageRow = {
  id: string;
  authorId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: { name: string | null; email: string; globalRole: string; enrollments: { offeringId: string; role: string }[] };
};

export function toMessageView(m: MessageRow, offeringId: string): MessageView {
  const staff = isPlatformAdmin(m.author) || m.author.enrollments.some((e) => e.offeringId === offeringId && e.role === 'INSTRUCTOR');
  return {
    id: m.id,
    authorId: m.authorId,
    // Names only, never derived from an email address.
    authorName: m.author.name?.trim() || null,
    authorIsStaff: staff,
    body: m.deletedAt ? '' : m.body,
    deleted: m.deletedAt !== null,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

/**
 * The latest messages of a thread, or (with `sinceMs`) every message created
 * or deleted since a little before that moment.
 */
export async function listMessages(key: string, offeringId: string, sinceMs?: number): Promise<MessageView[]> {
  const thread = await discussionsDb.discussionThread.findUnique({ where: { targetKey: key }, select: { id: true } });
  if (!thread) return [];
  if (sinceMs !== undefined) {
    const rows = await discussionsDb.discussionMessage.findMany({
      where: { threadId: thread.id, updatedAt: { gte: new Date(sinceMs - POLL_OVERLAP_MS) } },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: 500,
      select: messageSelect(offeringId),
    });
    return rows.map((m) => toMessageView(m, offeringId));
  }
  const rows = await discussionsDb.discussionMessage.findMany({
    where: { threadId: thread.id },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: INITIAL_MESSAGES,
    select: messageSelect(offeringId),
  });
  return rows.reverse().map((m) => toMessageView(m, offeringId));
}


// -----------------------------------------------------------------------------
// Counts for lists: how many messages, how many new for this person
// -----------------------------------------------------------------------------

export interface ThreadStats {
  total: number;
  unread: number;
}

/** Message counts for several threads at once (threads that don't exist yet are left out). */
export async function threadStats(userId: string, keys: string[]): Promise<Map<string, ThreadStats>> {
  const out = new Map<string, ThreadStats>();
  if (keys.length === 0) return out;
  const rows = await discussionsDb.$queryRaw<{ targetKey: string; total: bigint | number; unread: bigint | number }[]>`
    SELECT t."targetKey",
           COUNT(m."id") FILTER (WHERE m."deletedAt" IS NULL) AS total,
           COUNT(m."id") FILTER (
             WHERE m."deletedAt" IS NULL AND m."authorId" <> ${userId}
               AND m."createdAt" > COALESCE(r."lastReadAt", 'epoch'::timestamp)
           ) AS unread
    FROM "DiscussionThread" t
    LEFT JOIN "DiscussionMessage" m ON m."threadId" = t."id"
    LEFT JOIN "DiscussionRead" r ON r."threadId" = t."id" AND r."userId" = ${userId}
    WHERE t."targetKey" = ANY(${keys})
    GROUP BY t."targetKey"`;
  for (const r of rows) out.set(r.targetKey, { total: Number(r.total), unread: Number(r.unread) });
  return out;
}

// -----------------------------------------------------------------------------
// The "recent comments" list on the Discussion page
// -----------------------------------------------------------------------------

export interface RecentThread {
  key: string;
  kind: 'FILE' | 'ACTIVITY';
  title: string;
  titleFr: string | null;
  /** Team or student the thread belongs to (shown to staff). */
  owner: string | null;
  href: string;
  lastMessageAt: string;
  total: number;
  unread: number;
}

/**
 * Comment threads on files and activity answers that this person can open,
 * newest first. Students get their own team's and their own; staff get all.
 */
export async function recentThreads(offeringId: string, viewer: FileViewer, limit = 15): Promise<RecentThread[]> {
  if (viewer.role !== 'staff' && viewer.role !== 'learner') return [];
  const mine = [`user:${viewer.userId}`, ...(viewer.teamId ? [`team:${viewer.teamId}`] : [])];
  const threads = await discussionsDb.discussionThread.findMany({
    where:
      viewer.role === 'staff'
        ? { offeringId, kind: { in: ['FILE', 'ACTIVITY'] }, lastMessageAt: { not: null } }
        : {
            offeringId,
            lastMessageAt: { not: null },
            OR: [
              {
                kind: 'FILE',
                file: { OR: [{ teamId: viewer.teamId ?? '__none__' }, { teamId: null, ownerId: viewer.userId }] },
              },
              { kind: 'ACTIVITY', ownerKey: { in: mine }, activity: { visible: true } },
            ],
          },
    orderBy: { lastMessageAt: 'desc' },
    take: limit,
    select: {
      targetKey: true,
      kind: true,
      lastMessageAt: true,
      ownerKey: true,
      fileId: true,
      activityId: true,
      file: { select: { title: true, teamId: true, team: { select: { name: true } }, owner: { select: { name: true } } } },
      activity: { select: { titleEn: true, titleFr: true } },
      team: { select: { name: true } },
    },
  });
  const userIds = threads.map((t) => (t.ownerKey?.startsWith('user:') ? t.ownerKey.slice(5) : null)).filter((v): v is string => !!v);
  const users = new Map(
    (await discussionsDb.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })).map((u) => [u.id, u.name]),
  );
  const stats = await threadStats(viewer.userId, threads.map((t) => t.targetKey));
  return threads.map((t) => {
    const s = stats.get(t.targetKey) ?? { total: 0, unread: 0 };
    if (t.kind === 'FILE') {
      const team = t.file?.teamId !== null && t.file?.teamId !== undefined;
      return {
        key: t.targetKey,
        kind: 'FILE' as const,
        title: t.file?.title ?? '—',
        titleFr: null,
        owner: (team ? t.file?.team?.name : t.file?.owner.name?.trim()) || null,
        href: `/workspace-q/${offeringId}/files?${new URLSearchParams({ tab: viewer.role === 'staff' ? 'all' : team ? 'team' : 'mine', comments: t.fileId ?? '' })}`,
        lastMessageAt: (t.lastMessageAt ?? new Date(0)).toISOString(),
        ...s,
      };
    }
    const owner = t.ownerKey?.startsWith('team:') ? (t.team?.name ?? null) : (users.get(t.ownerKey?.slice(5) ?? '')?.trim() || null);
    return {
      key: t.targetKey,
      kind: 'ACTIVITY' as const,
      title: t.activity?.titleEn ?? '—',
      titleFr: t.activity?.titleFr ?? null,
      owner,
      href: `/workspace-q/${offeringId}/activities/${t.activityId}${viewer.role === 'staff' ? `?review=${encodeURIComponent(t.ownerKey ?? '')}` : ''}#discussion`,
      lastMessageAt: (t.lastMessageAt ?? new Date(0)).toISOString(),
      ...s,
    };
  });
}
