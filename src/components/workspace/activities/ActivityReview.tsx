'use client';

import { useState } from 'react';
import { ChevronDown, History } from 'lucide-react';
import { getSubmissionVersion } from '@/app/workspace-q/classes/activity-actions';
import { cn } from '@/lib/utils';
import type { Answers } from '@/lib/workspace-activities';
import { scoreAnswers } from '@/lib/workspace-activities';
import type { ActivityInfo, ReviewRow } from '@/lib/workspace-activities-server';
import { formatClassDate } from '@/lib/workspace-materials';
import AnswerFields from './AnswerFields';
import { StatusPill } from './ActivityHeader';

/** Staff: every team (or student), its status and answer, and the history of saves. */
export default function ActivityReview({ activity, rows }: { activity: ActivityInfo; rows: ReviewRow[] }) {
  const [filter, setFilter] = useState<'all' | 'submitted' | 'missing'>('all');
  const submitted = rows.filter((r) => r.submission.status === 'submitted' || r.submission.status === 'late').length;
  const shown = rows.filter((r) =>
    filter === 'all' ? true : filter === 'submitted' ? r.submission.submittedAt : !r.submission.submittedAt,
  );

  // Quiz and card sort: average score and how often each question (or card) is right, over submitted answers.
  const scoredRows = rows.filter((r) => r.score && r.submission.submittedAt);
  const average = scoredRows.length > 0 ? scoredRows.reduce((sum, r) => sum + r.score!.score, 0) / scoredRows.length : null;
  const max = scoredRows[0]?.score?.max ?? null;
  const items =
    activity.kind === 'QUIZ'
      ? activity.config.quiz.filter((q) => q.correct.length > 0).map((q) => ({ id: q.id, label: q.promptEn }))
      : activity.kind === 'CARD_SORT'
        ? activity.config.cards.filter((c) => c.expected).map((c) => ({ id: c.id, label: c.textEn }))
        : [];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--wq-text)]">
          <strong>{submitted}</strong> of {rows.length} {activity.submitter === 'TEAM' ? 'teams' : 'students'} submitted
          {average !== null && max !== null && (
            <span className="ml-2 text-[var(--wq-text-muted)]" data-testid="average">
              · average {Number.isInteger(average) ? average : average.toFixed(1)} / {max}
            </span>
          )}
        </p>
        <div className="flex gap-1 text-xs" role="group" aria-label="Filter">
          {(['all', 'submitted', 'missing'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                'rounded-full px-3 py-1 font-medium',
                filter === f ? 'bg-[var(--wq-accent)] text-white' : 'bg-[var(--wq-canvas-alt)] text-[var(--wq-text-muted)]',
              )}
            >
              {f === 'all' ? 'All' : f === 'submitted' ? 'Submitted' : 'Not submitted'}
            </button>
          ))}
        </div>
      </div>
      {scoredRows.length > 0 && items.length > 0 && (
        <details className="rounded-xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-3 text-sm">
          <summary className="cursor-pointer font-medium text-[var(--wq-text)]">{activity.kind === 'QUIZ' ? 'Right answers per question' : 'Right placements per card'}</summary>
          <ul className="mt-2 space-y-1.5">
            {items.map((it) => {
              const right = scoredRows.filter((r) => r.score!.items[it.id]).length;
              const pct = Math.round((right / scoredRows.length) * 100);
              return (
                <li key={it.id} className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <span className="truncate text-[var(--wq-text)]">{it.label}</span>
                  <span className="flex items-center gap-2 text-xs text-[var(--wq-text-muted)]">
                    <span className="h-2 w-24 overflow-hidden rounded-full bg-[var(--wq-canvas-alt)]" aria-hidden="true">
                      <span className="block h-full bg-[var(--wq-accent)]" style={{ width: `${pct}%` }} />
                    </span>
                    {right}/{scoredRows.length}
                  </span>
                </li>
              );
            })}
          </ul>
        </details>
      )}
      {rows.length === 0 && (
        <p className="rounded-xl bg-[var(--wq-card)] p-4 text-sm text-[var(--wq-text-muted)]">
          {activity.submitter === 'TEAM' ? 'No teams yet. Create them on the class settings page.' : 'No students yet.'}
        </p>
      )}
      <ul className="space-y-2">
        {shown.map((row) => (
          <ReviewItem key={row.ownerKey} activity={activity} row={row} />
        ))}
      </ul>
    </section>
  );
}

function ReviewItem({ activity, row }: { activity: ActivityInfo; row: ReviewRow }) {
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState<{ id: string; answers: Answers } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const s = row.submission;
  const editedAfterDeadline = activity.dueAt && s.lastSavedAt && new Date(s.lastSavedAt) > new Date(activity.dueAt);

  async function showVersion(id: string) {
    if (version?.id === id) return setVersion(null);
    const result = await getSubmissionVersion({ versionId: id });
    if (result.ok) setVersion({ id, answers: result.answers });
    else setError(result.error);
  }

  return (
    <li className="rounded-xl border border-[var(--wq-border)] bg-[var(--wq-card)]" data-testid="review-row">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
        <div className="min-w-0">
          <p className="font-semibold text-[var(--wq-text)]">{row.label}</p>
          {row.members.length > 0 && <p className="truncate text-xs text-[var(--wq-text-muted)]">{row.members.join(', ')}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs text-[var(--wq-text-muted)]">
          {row.score && <span className="font-semibold text-[var(--wq-text)]" data-testid="row-score">{row.score.score}/{row.score.max}</span>}
          {s.submittedAt && <span className="hidden sm:inline">{formatClassDate(s.submittedAt, 'en')}</span>}
          <StatusPill status={s.status} />
          <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} aria-hidden="true" />
        </div>
      </button>
      {open && (
        <div className="space-y-4 border-t border-[var(--wq-border)] px-4 py-4">
          {s.id === null ? (
            <p className="text-sm text-[var(--wq-text-muted)]">Nothing saved yet.</p>
          ) : (
            <>
              <p className="text-xs text-[var(--wq-text-muted)]">
                Last saved {s.lastSavedAt ? formatClassDate(s.lastSavedAt, 'en') : '—'} by {s.lastSavedBy ?? '—'}
                {s.submittedAt && ` · submitted ${formatClassDate(s.submittedAt, 'en')}`}
                {editedAfterDeadline && <span className="font-semibold text-amber-800"> · changed after the deadline</span>}
              </p>
              <AnswerFields
                kind={activity.kind}
                config={activity.config}
                answers={version?.answers ?? s.answers}
                editable={false}
                score={scoreAnswers(activity.kind, activity.config, version?.answers ?? s.answers)}
                offeringId={activity.offeringId}
              />
              {version && <p className="text-xs font-semibold text-amber-800">Showing an earlier version. Click it again to go back to the current answer.</p>}
              {s.versions.length > 0 && (
                <div>
                  <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-[var(--wq-text-muted)]">
                    <History className="h-3.5 w-3.5" aria-hidden="true" /> History
                  </p>
                  <ul className="space-y-0.5 border-l-2 border-[var(--wq-border)] pl-3 text-xs">
                    {s.versions.map((v) => (
                      <li key={v.id}>
                        <button type="button" onClick={() => showVersion(v.id)} className={cn('hover:underline', version?.id === v.id ? 'font-semibold text-[var(--wq-accent)]' : 'text-[var(--wq-text-muted)]')}>
                          {formatClassDate(v.updatedAt, 'en')} · {v.author ?? '—'}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {error && <p className="text-xs text-red-600">{error}</p>}
            </>
          )}
        </div>
      )}
    </li>
  );
}
