// =============================================================================
// Workspace Q · privacy — pure rules shared by the server and the pages:
// the join notice version, the class deletion date, and turning a student's
// answers into a readable file for "download my work". No server imports.
// =============================================================================

import type { ActivityConfig, ActivityKind, Answers } from '@/lib/workspace-activities';

/** Recorded with each join, so it is known which notice a student saw. */
export const PRIVACY_NOTICE_VERSION = '2026-11';

/** Students are reminded this many days before their class's data is deleted. */
export const REMINDER_DAYS = 30;

export type RetentionStatus =
  | { state: 'unset' }
  | { state: 'scheduled'; on: Date; daysLeft: number }
  | { state: 'soon'; on: Date; daysLeft: number }
  | { state: 'due'; on: Date }
  | { state: 'deleted'; on: Date };

const DAY = 24 * 60 * 60 * 1000;

export function retentionStatus(deleteAfter: Date | null, deletedAt: Date | null, now = new Date()): RetentionStatus {
  if (deletedAt) return { state: 'deleted', on: deletedAt };
  if (!deleteAfter) return { state: 'unset' };
  if (deleteAfter.getTime() <= now.getTime()) return { state: 'due', on: deleteAfter };
  const daysLeft = Math.ceil((deleteAfter.getTime() - now.getTime()) / DAY);
  return daysLeft <= REMINDER_DAYS ? { state: 'soon', on: deleteAfter, daysLeft } : { state: 'scheduled', on: deleteAfter, daysLeft };
}

/** A deletion date staff may choose: from tomorrow to five years ahead. */
export function checkDeleteDate(date: Date, now = new Date()): string | null {
  if (Number.isNaN(date.getTime())) return 'Please choose a valid date.';
  if (date.getTime() < now.getTime() + DAY / 2) return 'Choose a date from tomorrow on. To delete now, use “Delete student data now”.';
  if (date.getTime() > now.getTime() + 5 * 365 * DAY) return 'Choose a date within the next five years.';
  return null;
}

// -----------------------------------------------------------------------------
// Answers as a readable Markdown file
// -----------------------------------------------------------------------------

export interface ExportedSubmission {
  activityTitle: string;
  kind: ActivityKind;
  /** "Team A" or "individual" */
  owner: string;
  submittedAt: Date | null;
  lastSavedAt: Date | null;
  config: ActivityConfig;
  answers: Answers;
}

const fence = (text: string) => (text.trim() ? text.trim() : '_(empty)_');

/** One activity answer as Markdown: the questions and what was answered. No right answers are included. */
export function submissionMarkdown(s: ExportedSubmission): string {
  const lines: string[] = [`# ${s.activityTitle}`, ''];
  lines.push(`- Answer of: ${s.owner}`);
  lines.push(`- Submitted: ${s.submittedAt ? s.submittedAt.toISOString() : 'not submitted'}`);
  if (s.lastSavedAt) lines.push(`- Last saved: ${s.lastSavedAt.toISOString()}`);
  lines.push('');
  const v = s.answers.values;

  switch (s.kind) {
    case 'SHORT_ANSWER':
      for (const q of s.config.questions) lines.push(`## ${q.promptEn}`, '', fence(v[q.id] ?? ''), '');
      break;
    case 'FORM':
      for (const f of s.config.fields) lines.push(`- **${f.labelEn}**: ${v[f.id]?.trim() || '—'}`);
      lines.push('');
      break;
    case 'LINK':
      lines.push(`Link: ${s.answers.url?.trim() || '—'}`, '');
      break;
    case 'FILE':
      lines.push('Files attached:', '');
      for (const f of s.answers.files ?? []) lines.push(`- ${f.fileName}`);
      if (!s.answers.files?.length) lines.push('- none');
      lines.push('');
      break;
    case 'QUIZ':
      for (const q of s.config.quiz) {
        const chosen = (v[q.id] ?? '').split(',').filter(Boolean);
        const texts = q.options.filter((o) => chosen.includes(o.id)).map((o) => o.textEn);
        lines.push(`## ${q.promptEn}`, '', texts.length ? texts.map((t) => `- ${t}`).join('\n') : '_(no answer)_', '');
      }
      break;
    case 'CARD_SORT':
      for (const c of s.config.cards) {
        const cat = s.config.categories.find((x) => x.id === v[c.id]);
        lines.push(`- ${c.textEn} → ${cat ? cat.labelEn : 'not sorted'}`);
      }
      lines.push('');
      break;
  }
  return lines.join('\n');
}
