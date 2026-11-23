import 'server-only';

// =============================================================================
// Workspace Q · activities (spec F6, part A): server side reads.
// Students only ever get their own (or their team's) submission; staff get
// every team's or student's.
// =============================================================================

import type { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { FileViewer } from '@/lib/workspace-files';
import {
  activityWindow,
  ownerKeyFor,
  readAnswers,
  readConfig,
  resultsVisible,
  scoreAnswers,
  studentConfig,
  submissionStatus,
  type ActivityConfig,
  type ActivityKind,
  type ActivitySubmitter,
  type ActivityWindow,
  type Answers,
  type Score,
  type SubmissionStatus,
} from '@/lib/workspace-activities';
import { utcToZonedLocal } from '@/lib/workspace-materials';

export const activitiesDb = prisma as PrismaClient;

export async function loadActivity(activityId: string) {
  return activitiesDb.activity.findUnique({ where: { id: activityId } });
}
export type LoadedActivity = NonNullable<Awaited<ReturnType<typeof loadActivity>>>;

export interface ActivityInfo {
  id: string;
  offeringId: string;
  sessionId: string | null;
  kind: ActivityKind;
  submitter: ActivitySubmitter;
  titleEn: string;
  titleFr: string | null;
  instructionsEn: string;
  instructionsFr: string | null;
  config: ActivityConfig;
  visible: boolean;
  opensAt: string | null;
  dueAt: string | null;
  allowLate: boolean;
  window: ActivityWindow;
  /** Quiz and card sort: results (and the right answers) are shown to this viewer */
  resultsShown: boolean;
  resultsRevealedAt: string | null;
  modelMaterialId: string | null;
  // staff editor only
  opensAtLocal: string;
  dueAtLocal: string;
}

/**
 * What the page receives about an activity. For students, `submittedAt` is
 * their own submission's: the answer key stays out of the browser until
 * their results are shown.
 */
export function toActivityInfo(a: LoadedActivity, staff: boolean, now = new Date(), submittedAt: Date | null = null): ActivityInfo {
  const config = readConfig(a.config);
  const shown = staff || resultsVisible(a, config, submittedAt, now);
  return {
    id: a.id,
    offeringId: a.offeringId,
    sessionId: a.sessionId,
    kind: a.kind,
    submitter: a.submitter,
    titleEn: a.titleEn,
    titleFr: a.titleFr,
    instructionsEn: a.instructionsEn,
    instructionsFr: a.instructionsFr,
    config: staff ? config : studentConfig(config, shown),
    visible: a.visible,
    opensAt: a.opensAt?.toISOString() ?? null,
    dueAt: a.dueAt?.toISOString() ?? null,
    allowLate: a.allowLate,
    window: activityWindow(a, now),
    resultsShown: shown,
    resultsRevealedAt: a.resultsRevealedAt?.toISOString() ?? null,
    modelMaterialId: staff ? a.modelMaterialId : null,
    opensAtLocal: staff ? utcToZonedLocal(a.opensAt) : '',
    dueAtLocal: staff ? utcToZonedLocal(a.dueAt) : '',
  };
}

// -----------------------------------------------------------------------------
// One submission
// -----------------------------------------------------------------------------

export interface SubmissionView {
  id: string | null;
  answers: Answers;
  status: SubmissionStatus;
  submittedAt: string | null;
  lastSavedAt: string | null;
  lastSavedBy: string | null;
  versions: { id: string; author: string | null; createdAt: string; updatedAt: string }[];
}

const nameOf = (u: { name: string | null } | null | undefined) => u?.name?.trim() || null;

export async function loadSubmissionView(activity: LoadedActivity, ownerKey: string): Promise<SubmissionView> {
  const s = await activitiesDb.activitySubmission.findUnique({
    where: { activityId_ownerKey: { activityId: activity.id, ownerKey } },
    include: { versions: { orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true } } } } },
  });
  if (!s) return { id: null, answers: { values: {} }, status: 'not-started', submittedAt: null, lastSavedAt: null, lastSavedBy: null, versions: [] };
  const lastBy = s.lastSavedById ? await activitiesDb.user.findUnique({ where: { id: s.lastSavedById }, select: { name: true } }) : null;
  return {
    id: s.id,
    answers: readAnswers(s.answers),
    status: submissionStatus(s, activity.dueAt),
    submittedAt: s.submittedAt?.toISOString() ?? null,
    lastSavedAt: s.lastSavedAt.toISOString(),
    lastSavedBy: nameOf(lastBy),
    versions: s.versions.map((v) => ({ id: v.id, author: nameOf(v.author), createdAt: v.createdAt.toISOString(), updatedAt: v.updatedAt.toISOString() })),
  };
}

/** Whose submission a learner works on: their team's or their own. null = team activity and no team yet. */
export function viewerOwnerKey(activity: { submitter: ActivitySubmitter }, viewer: FileViewer): string | null {
  return ownerKeyFor(activity.submitter, viewer.userId, viewer.teamId);
}

// -----------------------------------------------------------------------------
// Files a student may attach (F10.5): team activity → the team's files;
// individual activity → their own personal files.
// -----------------------------------------------------------------------------

export interface AttachableFile {
  fileId: string;
  title: string;
  fileName: string;
  versionId: string;
}

export async function attachableFiles(offeringId: string, viewer: FileViewer, submitter: ActivitySubmitter): Promise<AttachableFile[]> {
  if (viewer.role !== 'learner') return [];
  if (submitter === 'TEAM' && !viewer.teamId) return [];
  const files = await activitiesDb.studentFile.findMany({
    where: submitter === 'TEAM' ? { offeringId, teamId: viewer.teamId } : { offeringId, teamId: null, ownerId: viewer.userId },
    orderBy: { updatedAt: 'desc' },
    include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });
  return files
    .filter((f) => f.versions.length > 0)
    .map((f) => ({ fileId: f.id, title: f.title, fileName: f.versions[0].fileName, versionId: f.versions[0].id }));
}

// -----------------------------------------------------------------------------
// Class page: activities per session, with the viewer's status or staff counts
// -----------------------------------------------------------------------------

export interface ActivitySummary {
  id: string;
  sessionId: string | null;
  kind: ActivityKind;
  submitter: ActivitySubmitter;
  titleEn: string;
  titleFr: string | null;
  visible: boolean;
  dueAt: string | null;
  opensAt: string | null;
  window: ActivityWindow;
  /** learner: their own/team status */
  myStatus: SubmissionStatus | null;
  /** staff: how many teams/students submitted, out of how many */
  counts: { submitted: number; total: number } | null;
}

export async function loadActivitySummaries(offeringId: string, viewer: FileViewer, now = new Date()): Promise<ActivitySummary[]> {
  const staff = viewer.role === 'staff';
  const activities = await activitiesDb.activity.findMany({
    where: staff ? { offeringId } : { offeringId, visible: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
  if (activities.length === 0) return [];
  const ids = activities.map((a) => a.id);

  let mine = new Map<string, { submittedAt: Date | null; answers: unknown }>();
  let counts = new Map<string, number>();
  let teams = 0;
  let learners = 0;
  if (viewer.role === 'learner') {
    const keys = [`user:${viewer.userId}`, ...(viewer.teamId ? [`team:${viewer.teamId}`] : [])];
    const subs = await activitiesDb.activitySubmission.findMany({
      where: { activityId: { in: ids }, ownerKey: { in: keys } },
      select: { activityId: true, ownerKey: true, submittedAt: true, answers: true },
    });
    mine = new Map(
      subs
        .filter((s) => s.ownerKey === viewerOwnerKey(activities.find((a) => a.id === s.activityId)!, viewer))
        .map((s) => [s.activityId, s]),
    );
  } else if (staff) {
    const grouped = await activitiesDb.activitySubmission.groupBy({
      by: ['activityId'],
      where: { activityId: { in: ids }, submittedAt: { not: null } },
      _count: { _all: true },
    });
    counts = new Map(grouped.map((g) => [g.activityId, g._count._all]));
    [teams, learners] = await Promise.all([
      activitiesDb.team.count({ where: { offeringId } }),
      activitiesDb.enrollment.count({ where: { offeringId, role: 'LEARNER' } }),
    ]);
  }

  return activities.map((a) => ({
    id: a.id,
    sessionId: a.sessionId,
    kind: a.kind,
    submitter: a.submitter,
    titleEn: a.titleEn,
    titleFr: a.titleFr,
    visible: a.visible,
    dueAt: a.dueAt?.toISOString() ?? null,
    opensAt: a.opensAt?.toISOString() ?? null,
    window: activityWindow(a, now),
    myStatus: viewer.role === 'learner' ? submissionStatus(mine.get(a.id) ?? null, a.dueAt) : null,
    counts: staff ? { submitted: counts.get(a.id) ?? 0, total: a.submitter === 'TEAM' ? teams : learners } : null,
  }));
}

// -----------------------------------------------------------------------------
// Staff review: every team or student, with status and answers
// -----------------------------------------------------------------------------

export interface ReviewRow {
  ownerKey: string;
  label: string;
  members: string[];
  submission: SubmissionView;
  /** Quiz and card sort with a key: score of the current answer */
  score: Score | null;
}

export async function loadReview(activity: LoadedActivity): Promise<ReviewRow[]> {
  const subs = await activitiesDb.activitySubmission.findMany({
    where: { activityId: activity.id },
    include: { versions: { orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true } } } } },
  });
  const byKey = new Map(subs.map((s) => [s.ownerKey, s]));
  const userIds = subs.map((s) => s.lastSavedById).filter((v): v is string => !!v);
  const savers = new Map(
    (await activitiesDb.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })).map((u) => [u.id, nameOf(u)]),
  );
  const view = (key: string): SubmissionView => {
    const s = byKey.get(key);
    if (!s) return { id: null, answers: { values: {} }, status: 'not-started', submittedAt: null, lastSavedAt: null, lastSavedBy: null, versions: [] };
    return {
      id: s.id,
      answers: readAnswers(s.answers),
      status: submissionStatus(s, activity.dueAt),
      submittedAt: s.submittedAt?.toISOString() ?? null,
      lastSavedAt: s.lastSavedAt.toISOString(),
      lastSavedBy: s.lastSavedById ? savers.get(s.lastSavedById) ?? null : null,
      versions: s.versions.map((v) => ({ id: v.id, author: nameOf(v.author), createdAt: v.createdAt.toISOString(), updatedAt: v.updatedAt.toISOString() })),
    };
  };

  let rows: ReviewRow[];
  if (activity.submitter === 'TEAM') {
    const teams = await activitiesDb.team.findMany({
      where: { offeringId: activity.offeringId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: { members: { include: { user: { select: { name: true, email: true } } } } },
    });
    rows = teams.map((t) => ({
      ownerKey: `team:${t.id}`,
      label: t.name,
      members: t.members.map((m) => nameOf(m.user) ?? m.user.email),
      submission: view(`team:${t.id}`),
      score: null,
    }));
  } else {
    const learners = await activitiesDb.enrollment.findMany({
      where: { offeringId: activity.offeringId, role: 'LEARNER' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    rows = learners
      .map((e) => ({
        ownerKey: `user:${e.user.id}`,
        label: nameOf(e.user) ?? e.user.email,
        members: [e.user.email],
        submission: view(`user:${e.user.id}`),
        score: null,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }
  // Work from a team or student no longer in the class is still shown.
  const known = new Set(rows.map((r) => r.ownerKey));
  for (const s of subs) {
    if (!known.has(s.ownerKey)) rows.push({ ownerKey: s.ownerKey, label: 'Former team or student', members: [], submission: view(s.ownerKey), score: null });
  }
  const config = readConfig(activity.config);
  return rows.map((r) => ({ ...r, score: r.submission.id ? scoreAnswers(activity.kind, config, r.submission.answers) : null }));
}
