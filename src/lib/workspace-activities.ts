// =============================================================================
// Workspace Q · activities, the virtual handouts (spec F6, part A).
// Pure rules, no I/O: what an activity asks, what an answer may contain,
// when it can be worked on, and what "submitted" requires.
// =============================================================================

import { z } from 'zod';
import { cleanHttpUrl } from '@/lib/workspace-materials';

export type ActivityKind = 'SHORT_ANSWER' | 'FORM' | 'FILE' | 'LINK';
export type ActivitySubmitter = 'TEAM' | 'INDIVIDUAL';
export const ACTIVITY_KINDS: readonly ActivityKind[] = ['SHORT_ANSWER', 'FORM', 'FILE', 'LINK'];

export const FIELD_TYPES = ['text', 'longtext', 'number', 'euro', 'percent', 'choice'] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export const MAX_TEXT_ANSWER = 10_000;
export const MAX_ITEMS = 40;
export const MAX_FILES = 10;
/** Consecutive saves by the same person within this time update one version instead of adding one. */
export const VERSION_MERGE_MS = 2 * 60 * 1000;

// -----------------------------------------------------------------------------
// What the activity asks (Activity.config)
// -----------------------------------------------------------------------------

const itemId = z.string().regex(/^[a-z0-9]{1,24}$/, 'Invalid item id.');
const label = z.string().trim().min(1, 'Every question needs a text.').max(500, 'A question is too long.');
const optionalLabel = z.string().trim().max(500).optional().transform((v) => v || undefined);
const optionalNumber = z
  .union([z.number(), z.null()])
  .optional()
  .transform((v) => (typeof v === 'number' && Number.isFinite(v) ? v : null));

export const questionSchema = z.object({
  id: itemId,
  promptEn: label,
  promptFr: optionalLabel,
  long: z.boolean().optional().default(false),
  required: z.boolean().optional().default(true),
});
export type Question = z.output<typeof questionSchema>;

export const fieldSchema = z
  .object({
    id: itemId,
    labelEn: label,
    labelFr: optionalLabel,
    type: z.enum(FIELD_TYPES),
    options: z.array(z.string().trim().min(1).max(200)).max(30).optional().default([]),
    min: optionalNumber,
    max: optionalNumber,
    required: z.boolean().optional().default(true),
  })
  .refine((f) => f.type !== 'choice' || f.options.length >= 2, 'A choice field needs at least two options.')
  .refine((f) => f.min === null || f.max === null || f.min <= f.max, 'The minimum is above the maximum.');
export type FormField = z.output<typeof fieldSchema>;

export const configSchema = z.object({
  questions: z.array(questionSchema).max(MAX_ITEMS).optional().default([]),
  fields: z.array(fieldSchema).max(MAX_ITEMS).optional().default([]),
  maxFiles: z.number().int().min(1).max(MAX_FILES).optional().default(3),
});
export type ActivityConfig = z.output<typeof configSchema>;

/** Reads a stored config, never throwing: anything unreadable becomes empty. */
export function readConfig(raw: unknown): ActivityConfig {
  const parsed = configSchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : { questions: [], fields: [], maxFiles: 3 };
}

/** Checks a config from the editor; ids must be unique. Throws a ZodError or Error with a readable message. */
export function checkConfig(kind: ActivityKind, raw: unknown): ActivityConfig {
  const config = configSchema.parse(raw ?? {});
  const ids = [...config.questions.map((q) => q.id), ...config.fields.map((f) => f.id)];
  if (new Set(ids).size !== ids.length) throw new Error('Two questions have the same id.');
  if (kind === 'SHORT_ANSWER') return { ...config, fields: [] };
  if (kind === 'FORM') return { ...config, questions: [] };
  return { ...config, questions: [], fields: [] };
}

export function newItemId(random: () => number = Math.random): string {
  return Math.floor(random() * 36 ** 8).toString(36).padStart(8, '0');
}

// -----------------------------------------------------------------------------
// Answers (ActivitySubmission.answers)
// -----------------------------------------------------------------------------

export interface AttachedFile {
  fileId: string;
  versionId: string;
  fileName: string;
}

export interface Answers {
  /** question or field id → what was typed (kept as typed; numbers are checked on submit) */
  values: Record<string, string>;
  url?: string;
  files?: AttachedFile[];
}

export function readAnswers(raw: unknown): Answers {
  const r = (raw ?? {}) as Partial<Answers>;
  const values: Record<string, string> = {};
  if (r.values && typeof r.values === 'object') {
    for (const [k, v] of Object.entries(r.values)) if (typeof v === 'string') values[k] = v;
  }
  return {
    values,
    url: typeof r.url === 'string' ? r.url : undefined,
    files: Array.isArray(r.files)
      ? r.files.filter((f): f is AttachedFile => !!f && typeof f.fileId === 'string' && typeof f.versionId === 'string')
      : undefined,
  };
}

export interface AnswerChanges {
  values?: Record<string, string>;
  url?: string;
}

/**
 * Keeps only what this activity asks for: known ids, text up to 10 000
 * characters, a URL only for link activities. Everything else is dropped.
 */
export function cleanChanges(kind: ActivityKind, config: ActivityConfig, changes: AnswerChanges): AnswerChanges {
  const allowed = new Set(kind === 'SHORT_ANSWER' ? config.questions.map((q) => q.id) : kind === 'FORM' ? config.fields.map((f) => f.id) : []);
  const out: AnswerChanges = {};
  if (changes.values && typeof changes.values === 'object') {
    for (const [k, v] of Object.entries(changes.values)) {
      if (allowed.has(k) && typeof v === 'string') (out.values ??= {})[k] = v.slice(0, MAX_TEXT_ANSWER);
    }
  }
  if (kind === 'LINK' && typeof changes.url === 'string') out.url = changes.url.trim().slice(0, 2000);
  return out;
}

export function mergeAnswers(current: Answers, changes: AnswerChanges): Answers {
  return {
    ...current,
    values: { ...current.values, ...(changes.values ?? {}) },
    ...(changes.url !== undefined ? { url: changes.url } : {}),
  };
}

/** "1 234,5", "€12.50", "15 %", "-3" → number. Anything else → null. */
export function parseNumber(input: string): number | null {
  const cleaned = input.replace(/[\s  €$£%]/g, '');
  if (cleaned === '') return null;
  // One comma and no dot: French decimal comma. Otherwise commas are thousands separators.
  const normalized = /^-?\d+,\d+$/.test(cleaned) ? cleaned.replace(',', '.') : cleaned.replace(/,/g, '');
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export type SubmitProblem = { id?: string; message: string };

/** What has to be true before a submission counts (F6.2 range checks, required answers). */
export function problemsBeforeSubmit(kind: ActivityKind, config: ActivityConfig, answers: Answers): SubmitProblem[] {
  const problems: SubmitProblem[] = [];
  const val = (id: string) => (answers.values[id] ?? '').trim();
  if (kind === 'SHORT_ANSWER') {
    for (const q of config.questions) if (q.required && !val(q.id)) problems.push({ id: q.id, message: 'required' });
  } else if (kind === 'FORM') {
    for (const f of config.fields) {
      const v = val(f.id);
      if (!v) {
        if (f.required) problems.push({ id: f.id, message: 'required' });
        continue;
      }
      if (f.type === 'number' || f.type === 'euro' || f.type === 'percent') {
        const n = parseNumber(v);
        if (n === null) problems.push({ id: f.id, message: 'number' });
        else if ((f.min !== null && n < f.min) || (f.max !== null && n > f.max)) problems.push({ id: f.id, message: 'range' });
      } else if (f.type === 'choice' && !f.options.includes(v)) {
        problems.push({ id: f.id, message: 'choice' });
      }
    }
  } else if (kind === 'LINK') {
    if (!answers.url || !cleanHttpUrl(answers.url)) problems.push({ message: 'url' });
  } else if (kind === 'FILE') {
    if (!answers.files || answers.files.length === 0) problems.push({ message: 'file' });
  }
  return problems;
}

/** Started = anything typed, linked or attached. */
export function hasContent(answers: Answers): boolean {
  return Object.values(answers.values).some((v) => v.trim() !== '') || !!answers.url?.trim() || (answers.files?.length ?? 0) > 0;
}

// -----------------------------------------------------------------------------
// When students can work on it
// -----------------------------------------------------------------------------

export type ActivityWindow = 'hidden' | 'not-open' | 'open' | 'late' | 'closed';

export function activityWindow(
  a: { visible: boolean; opensAt: Date | null; dueAt: Date | null; allowLate: boolean },
  now = new Date(),
): ActivityWindow {
  if (!a.visible) return 'hidden';
  if (a.opensAt && now < a.opensAt) return 'not-open';
  if (a.dueAt && now > a.dueAt) return a.allowLate ? 'late' : 'closed';
  return 'open';
}

export function canWork(window: ActivityWindow): boolean {
  return window === 'open' || window === 'late';
}

export function ownerKeyFor(submitter: ActivitySubmitter, userId: string, teamId: string | null): string | null {
  if (submitter === 'TEAM') return teamId ? `team:${teamId}` : null;
  return `user:${userId}`;
}

export type SubmissionStatus = 'not-started' | 'in-progress' | 'submitted' | 'late';

export function submissionStatus(
  s: { submittedAt: Date | null; answers: unknown } | null,
  dueAt: Date | null,
): SubmissionStatus {
  if (!s) return 'not-started';
  if (s.submittedAt) return dueAt && s.submittedAt > dueAt ? 'late' : 'submitted';
  return hasContent(readAnswers(s.answers)) ? 'in-progress' : 'not-started';
}
