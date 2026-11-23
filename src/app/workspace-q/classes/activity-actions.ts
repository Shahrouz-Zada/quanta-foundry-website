'use server';

// =============================================================================
// Workspace Q · activities, the virtual handouts (spec F6, part A): server
// actions. Staff create and edit activities; students (learners) save and
// submit their own or their team's answers. Every action checks again who is
// asking and whether the activity is open, whatever the page showed.
// =============================================================================

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { audit, getClassViewer } from '@/lib/workspace-files-server';
import {
  activitiesDb as db,
  attachableFiles,
  loadActivity,
  loadSubmissionView,
  viewerOwnerKey,
  type LoadedActivity,
  type SubmissionView,
} from '@/lib/workspace-activities-server';
import {
  ACTIVITY_KINDS,
  VERSION_MERGE_MS,
  activityWindow,
  canWork,
  checkConfig,
  cleanChanges,
  mergeAnswers,
  newItemId,
  problemsBeforeSubmit,
  readAnswers,
  readConfig,
  resultsVisible,
  type ActivityConfig,
  type ActivityKind,
  type Answers,
  type SubmitProblem,
} from '@/lib/workspace-activities';
import { zonedLocalToUtc } from '@/lib/workspace-materials';

export type ActivityActionResult = { ok: true; activityId?: string } | { ok: false; error: string };
export type AnswerResult =
  | { ok: true; submission: SubmissionView }
  | { ok: false; error: string; errorKey?: string; problems?: SubmitProblem[] };

/** A refusal with a message for the page; `key` lets the student page show it in French. */
class UserError extends Error {
  constructor(message: string, readonly key?: string) {
    super(message);
  }
}

function fail(error: unknown): { ok: false; error: string; errorKey?: string } {
  if (error instanceof UserError) return { ok: false, error: error.message, errorKey: error.key };
  if (error instanceof z.ZodError) return { ok: false, error: error.issues[0]?.message ?? 'Invalid input.' };
  console.error('Workspace activity action failed:', error);
  const code = (error as { code?: unknown } | null)?.code;
  if (code === 'P2025') return { ok: false, error: 'This item no longer exists. Refresh the page.' };
  return { ok: false, error: 'Something went wrong. Please try again.', errorKey: 'activity.err.failed' };
}

const id = z.string().min(1).max(64);

function refresh(offeringId: string, activityId?: string) {
  revalidatePath(`/workspace-q/${offeringId}`);
  if (activityId) revalidatePath(`/workspace-q/${offeringId}/activities/${activityId}`);
}

function parseLocal(value: string | null | undefined, label: string): Date | null {
  if (!value) return null;
  const date = zonedLocalToUtc(value);
  if (!date) throw new UserError(`Please enter a valid ${label}.`);
  return date;
}

// -----------------------------------------------------------------------------
// Staff: create, edit, delete
// -----------------------------------------------------------------------------

async function requireStaff(offeringId: string) {
  const check = await getClassViewer(offeringId);
  if (check.status !== 'ok' || check.viewer.role !== 'staff') throw new UserError('You don’t have permission to do this.');
  return check;
}

async function checkSession(offeringId: string, sessionId: string | null | undefined) {
  if (!sessionId) return null;
  const s = await db.classSession.findUnique({ where: { id: sessionId }, select: { offeringId: true } });
  if (!s || s.offeringId !== offeringId) throw new UserError('That session no longer exists. Refresh the page.');
  return sessionId;
}

function starterConfig(kind: ActivityKind): ActivityConfig {
  const empty = readConfig({});
  if (kind === 'SHORT_ANSWER') {
    return { ...empty, questions: [{ id: newItemId(), promptEn: 'Your answer', promptFr: 'Votre réponse', long: true, required: true }] };
  }
  if (kind === 'FORM') {
    return { ...empty, fields: [{ id: newItemId(), labelEn: 'First field', labelFr: undefined, type: 'text', options: [], min: null, max: null, required: true }] };
  }
  if (kind === 'QUIZ') {
    const a = newItemId();
    const b = newItemId();
    return {
      ...empty,
      quiz: [
        {
          id: newItemId(),
          promptEn: 'First question',
          promptFr: undefined,
          options: [
            { id: a, textEn: 'Right answer', textFr: undefined },
            { id: b, textEn: 'Wrong answer', textFr: undefined },
          ],
          correct: [a],
          multiple: false,
          points: 1,
        },
      ],
    };
  }
  if (kind === 'CARD_SORT') {
    const c1 = newItemId();
    const c2 = newItemId();
    return {
      ...empty,
      categories: [
        { id: c1, labelEn: 'Category 1', labelFr: undefined },
        { id: c2, labelEn: 'Category 2', labelFr: undefined },
      ],
      cards: [
        { id: newItemId(), textEn: 'First card', textFr: undefined, expected: null },
        { id: newItemId(), textEn: 'Second card', textFr: undefined, expected: null },
      ],
    };
  }
  return empty;
}

/** New activities start hidden ("draft"), so students only see them once you publish. */
export async function createActivity(input: {
  offeringId: string;
  sessionId: string | null;
  kind: string;
  titleEn: string;
}): Promise<ActivityActionResult> {
  try {
    const data = z
      .object({
        offeringId: id,
        sessionId: id.nullish(),
        kind: z.enum(ACTIVITY_KINDS as [ActivityKind, ...ActivityKind[]]),
        titleEn: z.string().trim().min(1, 'Please enter a title.').max(200, 'That title is too long.'),
      })
      .parse(input);
    const { user } = await requireStaff(data.offeringId);
    const sessionId = await checkSession(data.offeringId, data.sessionId);
    const last = await db.activity.aggregate({ where: { offeringId: data.offeringId, sessionId }, _max: { order: true } });
    const activity = await db.activity.create({
      data: {
        offeringId: data.offeringId,
        sessionId,
        kind: data.kind,
        titleEn: data.titleEn,
        config: starterConfig(data.kind),
        order: (last._max.order ?? 0) + 1,
      },
    });
    await audit(db, { offeringId: data.offeringId, actorId: user.id, action: 'activity.create', entity: 'Activity', entityId: activity.id });
    refresh(data.offeringId);
    return { ok: true, activityId: activity.id };
  } catch (error) {
    return fail(error);
  }
}

const updateSchema = z.object({
  activityId: id,
  titleEn: z.string().trim().min(1, 'Please enter a title.').max(200, 'That title is too long.'),
  titleFr: z.string().max(200).nullish(),
  instructionsEn: z.string().max(20_000, 'The instructions are too long.'),
  instructionsFr: z.string().max(20_000, 'The instructions are too long.').nullish(),
  submitter: z.enum(['TEAM', 'INDIVIDUAL']),
  sessionId: id.nullish(),
  visible: z.boolean(),
  opensAt: z.string().max(40).nullish(),
  dueAt: z.string().max(40).nullish(),
  allowLate: z.boolean(),
  config: z.unknown(),
});

export async function updateActivity(input: z.input<typeof updateSchema>): Promise<ActivityActionResult> {
  try {
    const data = updateSchema.parse(input);
    const activity = await loadActivity(data.activityId);
    if (!activity) throw new UserError('This activity no longer exists. Refresh the page.');
    const { user } = await requireStaff(activity.offeringId);
    let config: ActivityConfig;
    try {
      config = checkConfig(activity.kind, data.config);
    } catch (error) {
      if (error instanceof z.ZodError) throw new UserError(error.issues[0]?.message ?? 'Please check the questions.');
      throw new UserError(error instanceof Error ? error.message : 'Please check the questions.');
    }
    if (data.submitter !== activity.submitter && (await db.activitySubmission.count({ where: { activityId: activity.id } })) > 0) {
      throw new UserError('Students have already answered, so “team or individual” can no longer change.');
    }
    const opensAt = parseLocal(data.opensAt, 'opening time');
    const dueAt = parseLocal(data.dueAt, 'due time');
    if (opensAt && dueAt && dueAt <= opensAt) throw new UserError('The due time must be after the opening time.');
    const sessionId = await checkSession(activity.offeringId, data.sessionId);
    await db.activity.update({
      where: { id: activity.id },
      data: {
        titleEn: data.titleEn,
        titleFr: data.titleFr?.trim() || null,
        instructionsEn: data.instructionsEn.trim(),
        instructionsFr: data.instructionsFr?.trim() || null,
        submitter: data.submitter,
        sessionId,
        visible: data.visible,
        opensAt,
        dueAt,
        allowLate: data.allowLate,
        config,
      },
    });
    await audit(db, {
      offeringId: activity.offeringId, actorId: user.id, action: 'activity.update', entity: 'Activity', entityId: activity.id,
      details: { visible: data.visible, dueAt: dueAt?.toISOString() ?? null },
    });
    refresh(activity.offeringId, activity.id);
    return { ok: true, activityId: activity.id };
  } catch (error) {
    return fail(error);
  }
}

/** Only while nobody has answered: student work is never deleted with an activity. Hide it instead. */
export async function deleteActivity(input: { activityId: string }): Promise<ActivityActionResult> {
  try {
    const data = z.object({ activityId: id }).parse(input);
    const activity = await loadActivity(data.activityId);
    if (!activity) throw new UserError('This activity no longer exists. Refresh the page.');
    const { user } = await requireStaff(activity.offeringId);
    if ((await db.activitySubmission.count({ where: { activityId: activity.id } })) > 0) {
      throw new UserError('Students have already answered this activity, so it can’t be deleted. Untick “Published” to hide it instead.');
    }
    await db.activity.delete({ where: { id: activity.id } });
    await audit(db, { offeringId: activity.offeringId, actorId: user.id, action: 'activity.delete', entity: 'Activity', entityId: activity.id, details: { title: activity.titleEn } });
    refresh(activity.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

// -----------------------------------------------------------------------------
// Students: save, submit, attach files
// -----------------------------------------------------------------------------

/** Who is answering, and whether they may work on this activity now. */
async function requireWorker(activityId: string) {
  const activity = await loadActivity(activityId);
  if (!activity) throw new UserError('This activity no longer exists.', 'activity.err.gone');
  const check = await getClassViewer(activity.offeringId);
  if (check.status !== 'ok' || check.viewer.role !== 'learner' || !activity.visible) {
    throw new UserError('Only students of this class can answer this activity.', 'activity.err.notAllowed');
  }
  const window = activityWindow(activity);
  if (!canWork(window)) {
    throw window === 'not-open'
      ? new UserError('This activity is not open yet.', 'activity.err.notOpen')
      : new UserError('The deadline has passed; answers can no longer change.', 'activity.err.closed');
  }
  const ownerKey = viewerOwnerKey(activity, check.viewer);
  if (!ownerKey) throw new UserError('This is a team activity and you are not in a team yet. Ask your instructor.', 'activity.err.noTeam');
  return { activity, viewer: check.viewer, user: check.user, ownerKey };
}

const LOCKED = () => new UserError('Results are shown, so answers can no longer change.', 'activity.err.locked');

/** Quiz and card sort: once a team or student can see the right answers, their answer is final. */
function keyShownTo(activity: LoadedActivity, submittedAt: Date | null): boolean {
  return resultsVisible(activity, readConfig(activity.config), submittedAt);
}

type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0];

/**
 * One change to a submission, one team (or student) at a time. Creates the
 * submission on first save, applies `change` to the current answers, and
 * records the result as a version by this author (merging with their own
 * version from the last two minutes, so autosave does not create hundreds).
 */
async function changeSubmission(
  activity: LoadedActivity,
  ownerKey: string,
  userId: string,
  change: (answers: Answers, tx: Tx, submissionId: string) => Promise<Answers>,
) {
  await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`activity:${activity.id}:${ownerKey}`}))`;
    let submission = await tx.activitySubmission.findUnique({ where: { activityId_ownerKey: { activityId: activity.id, ownerKey } } });
    if (!submission) {
      submission = await tx.activitySubmission.create({
        data: {
          activityId: activity.id,
          offeringId: activity.offeringId,
          ownerKey,
          teamId: ownerKey.startsWith('team:') ? ownerKey.slice(5) : null,
          userId: ownerKey.startsWith('user:') ? ownerKey.slice(5) : null,
          answers: { values: {} },
        },
      });
    }
    if (keyShownTo(activity, submission.submittedAt)) throw LOCKED();
    const next = await change(readAnswers(submission.answers), tx, submission.id);
    const now = new Date();
    await tx.activitySubmission.update({
      where: { id: submission.id },
      data: { answers: next as object, lastSavedAt: now, lastSavedById: userId },
    });
    const latest = await tx.activitySubmissionVersion.findFirst({ where: { submissionId: submission.id }, orderBy: { createdAt: 'desc' } });
    if (latest && latest.authorId === userId && now.getTime() - latest.updatedAt.getTime() < VERSION_MERGE_MS) {
      await tx.activitySubmissionVersion.update({ where: { id: latest.id }, data: { answers: next as object } });
    } else {
      await tx.activitySubmissionVersion.create({ data: { submissionId: submission.id, authorId: userId, answers: next as object } });
    }
  });
}

const changesSchema = z.object({
  values: z.record(z.string(), z.string().max(20_000)).optional(),
  url: z.string().max(4000).optional(),
});

/** Autosave: only the fields that changed are sent, so teammates editing other fields don't overwrite each other. */
export async function saveAnswers(input: { activityId: string; changes: z.input<typeof changesSchema> }): Promise<AnswerResult> {
  try {
    const data = z.object({ activityId: id, changes: changesSchema }).parse(input);
    const { activity, user, ownerKey } = await requireWorker(data.activityId);
    const changes = cleanChanges(activity.kind, readConfig(activity.config), data.changes);
    if (changes.values || changes.url !== undefined) {
      await changeSubmission(activity, ownerKey, user.id, async (answers) => mergeAnswers(answers, changes));
    }
    return { ok: true, submission: await loadSubmissionView(activity, ownerKey) };
  } catch (error) {
    return fail(error);
  }
}

/** Marks the answer as handed in, after checking required answers and number ranges. Can be changed again until the deadline. */
export async function submitActivity(input: { activityId: string }): Promise<AnswerResult> {
  try {
    const data = z.object({ activityId: id }).parse(input);
    const { activity, user, ownerKey } = await requireWorker(data.activityId);
    const problems = await db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`activity:${activity.id}:${ownerKey}`}))`;
      const submission = await tx.activitySubmission.findUnique({ where: { activityId_ownerKey: { activityId: activity.id, ownerKey } } });
      if (submission && keyShownTo(activity, submission.submittedAt)) throw LOCKED();
      const found = problemsBeforeSubmit(activity.kind, readConfig(activity.config), readAnswers(submission?.answers));
      if (!submission || found.length > 0) return found.length > 0 ? found : [{ message: 'empty' }];
      const now = new Date();
      await tx.activitySubmission.update({ where: { id: submission.id }, data: { submittedAt: now, lastSavedById: user.id } });
      await audit(tx, {
        offeringId: activity.offeringId, actorId: user.id, action: 'activity.submit', entity: 'ActivitySubmission', entityId: submission.id,
        details: { activityId: activity.id, ownerKey, late: activity.dueAt ? now > activity.dueAt : false },
      });
      return [];
    });
    if (problems.length > 0) {
      return { ok: false, error: 'Some answers are missing or not valid yet.', errorKey: 'activity.err.problems', problems };
    }
    refresh(activity.offeringId, activity.id);
    return { ok: true, submission: await loadSubmissionView(activity, ownerKey) };
  } catch (error) {
    return fail(error);
  }
}

/** Attach a file from Files (F10.5): the team's files for a team activity, your own for an individual one. */
export async function attachFile(input: { activityId: string; fileId: string }): Promise<AnswerResult> {
  try {
    const data = z.object({ activityId: id, fileId: id }).parse(input);
    const { activity, viewer, user, ownerKey } = await requireWorker(data.activityId);
    if (activity.kind !== 'FILE') throw new UserError('This activity does not take files.', 'activity.err.notAllowed');
    const allowed = await attachableFiles(activity.offeringId, viewer, activity.submitter);
    const file = allowed.find((f) => f.fileId === data.fileId);
    if (!file) throw new UserError('You can only attach your own files (or your team’s, for a team activity).', 'activity.err.fileNotYours');
    const max = readConfig(activity.config).maxFiles;
    await changeSubmission(activity, ownerKey, user.id, async (answers, tx, submissionId) => {
      const files = answers.files ?? [];
      if (files.some((f) => f.fileId === file.fileId && f.versionId === file.versionId)) return answers;
      // Attaching a newer version of a file already attached replaces it.
      const others = files.filter((f) => f.fileId !== file.fileId);
      if (others.length >= max) throw new UserError(`This activity takes up to ${max} files.`, 'activity.err.tooManyFiles');
      const replaced = files.filter((f) => f.fileId === file.fileId).map((f) => f.versionId);
      if (replaced.length > 0) await tx.activitySubmissionFile.deleteMany({ where: { submissionId, fileVersionId: { in: replaced } } });
      await tx.activitySubmissionFile.create({ data: { submissionId, fileVersionId: file.versionId } });
      return { ...answers, files: [...others, { fileId: file.fileId, versionId: file.versionId, fileName: file.fileName }] };
    });
    return { ok: true, submission: await loadSubmissionView(activity, ownerKey) };
  } catch (error) {
    return fail(error);
  }
}

export async function detachFile(input: { activityId: string; versionId: string }): Promise<AnswerResult> {
  try {
    const data = z.object({ activityId: id, versionId: id }).parse(input);
    const { activity, user, ownerKey } = await requireWorker(data.activityId);
    await changeSubmission(activity, ownerKey, user.id, async (answers, tx, submissionId) => {
      await tx.activitySubmissionFile.deleteMany({ where: { submissionId, fileVersionId: data.versionId } });
      return { ...answers, files: (answers.files ?? []).filter((f) => f.versionId !== data.versionId) };
    });
    return { ok: true, submission: await loadSubmissionView(activity, ownerKey) };
  } catch (error) {
    return fail(error);
  }
}

/** The page polls this to pick up what teammates typed. */
export async function getMySubmission(input: { activityId: string }): Promise<AnswerResult> {
  try {
    const data = z.object({ activityId: id }).parse(input);
    const activity = await loadActivity(data.activityId);
    if (!activity) throw new UserError('This activity no longer exists.', 'activity.err.gone');
    const check = await getClassViewer(activity.offeringId);
    if (check.status !== 'ok' || check.viewer.role !== 'learner' || !activity.visible) {
      throw new UserError('Only students of this class can answer this activity.', 'activity.err.notAllowed');
    }
    const ownerKey = viewerOwnerKey(activity, check.viewer);
    if (!ownerKey) throw new UserError('You are not in a team yet.', 'activity.err.noTeam');
    return { ok: true, submission: await loadSubmissionView(activity, ownerKey) };
  } catch (error) {
    return fail(error);
  }
}

/** One saved version: staff, or the team/student it belongs to. */
export async function getSubmissionVersion(input: { versionId: string }): Promise<{ ok: true; answers: Answers } | { ok: false; error: string }> {
  try {
    const data = z.object({ versionId: id }).parse(input);
    const version = await db.activitySubmissionVersion.findUnique({
      where: { id: data.versionId },
      include: { submission: { include: { activity: true } } },
    });
    if (!version) throw new UserError('This version no longer exists.');
    const check = await getClassViewer(version.submission.offeringId);
    if (check.status !== 'ok') throw new UserError('You don’t have permission to see this.');
    const mine = check.viewer.role === 'learner' && viewerOwnerKey(version.submission.activity, check.viewer) === version.submission.ownerKey;
    if (check.viewer.role !== 'staff' && !mine) throw new UserError('You don’t have permission to see this.');
    return { ok: true, answers: readAnswers(version.answers) };
  } catch (error) {
    return fail(error);
  }
}

// -----------------------------------------------------------------------------
// Staff: show results now (quiz, card sort) and the model answer (F6.4)
// -----------------------------------------------------------------------------

/** "Show results now" (or hide them again): students see their score and the right answers; answers then can't change. */
export async function setResultsShown(input: { activityId: string; shown: boolean }): Promise<ActivityActionResult> {
  try {
    const data = z.object({ activityId: id, shown: z.boolean() }).parse(input);
    const activity = await loadActivity(data.activityId);
    if (!activity) throw new UserError('This activity no longer exists. Refresh the page.');
    const { user } = await requireStaff(activity.offeringId);
    await db.activity.update({ where: { id: activity.id }, data: { resultsRevealedAt: data.shown ? new Date() : null } });
    await audit(db, {
      offeringId: activity.offeringId, actorId: user.id, action: data.shown ? 'activity.results.show' : 'activity.results.hide',
      entity: 'Activity', entityId: activity.id,
    });
    refresh(activity.offeringId, activity.id);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/**
 * Model answer (F6.4): link a material of the class to the activity and
 * decide when students get it. It uses the material's own settings, so the
 * same rules as every material apply (staff-only until shown).
 *  - "hide": staff only
 *  - "deadline": for students from the activity's due time
 *  - "now": for students at once
 */
export async function setModelAnswer(input: {
  activityId: string;
  materialId: string | null;
  reveal: 'hide' | 'deadline' | 'now';
}): Promise<ActivityActionResult> {
  try {
    const data = z.object({ activityId: id, materialId: id.nullable(), reveal: z.enum(['hide', 'deadline', 'now']) }).parse(input);
    const activity = await loadActivity(data.activityId);
    if (!activity) throw new UserError('This activity no longer exists. Refresh the page.');
    const { user } = await requireStaff(activity.offeringId);
    if (data.materialId) {
      const material = await db.classMaterial.findUnique({ where: { id: data.materialId }, select: { offeringId: true } });
      if (!material || material.offeringId !== activity.offeringId) throw new UserError('That material is not part of this class.');
      if (data.reveal === 'deadline' && !activity.dueAt) throw new UserError('Set a due time first, or choose “Show to students now”.');
      await db.$transaction([
        db.activity.update({ where: { id: activity.id }, data: { modelMaterialId: data.materialId } }),
        db.classMaterial.update({
          where: { id: data.materialId },
          data:
            data.reveal === 'hide'
              ? { audience: 'STAFF' }
              : { audience: 'STUDENTS', releaseAt: data.reveal === 'deadline' ? activity.dueAt : new Date() },
        }),
      ]);
    } else {
      await db.activity.update({ where: { id: activity.id }, data: { modelMaterialId: null } });
    }
    await audit(db, {
      offeringId: activity.offeringId, actorId: user.id, action: 'activity.model', entity: 'Activity', entityId: activity.id,
      details: { materialId: data.materialId, reveal: data.reveal },
    });
    refresh(activity.offeringId, activity.id);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
