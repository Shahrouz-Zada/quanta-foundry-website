'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClipboardList, Plus } from 'lucide-react';
import { createActivity } from '@/app/workspace-q/classes/activity-actions';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ACTIVITY_KINDS, type ActivityKind } from '@/lib/workspace-activities';
import type { ActivitySummary } from '@/lib/workspace-activities-server';
import { formatClassDate, pickTitle } from '@/lib/workspace-materials';
import { Button, ErrorText, fieldClass, useAction } from '@/components/workspace/files/ui';
import { StatusPill } from './ActivityHeader';

const kindEn: Record<ActivityKind, string> = {
  SHORT_ANSWER: 'Short answers',
  FORM: 'Structured form',
  QUIZ: 'Quiz (marked automatically)',
  CARD_SORT: 'Card sort',
  FILE: 'File upload',
  LINK: 'Link',
};

/** Activities of one session on the class page (students: their status; staff: counts and drafts). */
export default function ActivityList({
  offeringId,
  sessionId,
  activities,
  staff,
}: {
  offeringId: string;
  sessionId: string | null;
  activities: ActivitySummary[];
  staff: boolean;
}) {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<ActivityKind>('SHORT_ANSWER');
  const create = useAction();

  if (!staff && activities.length === 0) return null;

  return (
    <div className="space-y-2">
      {activities.length > 0 && (
        <ul className="space-y-2">
          {activities.map((a) => (
            <li key={a.id}>
              <Link
                href={`/workspace-q/${offeringId}/activities/${a.id}`}
                data-testid="activity"
                className="flex flex-col gap-2 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-3 transition hover:border-[var(--wq-accent)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--wq-accent-glow)]/20 text-[var(--wq-accent)]">
                    <ClipboardList className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--wq-text)]">{pickTitle(a, lang)}</p>
                    <p className="text-xs text-[var(--wq-text-muted)]">
                      {t(`activity.kind.${a.kind}`)}
                      {a.dueAt && ` · ${t('activity.due', { date: formatClassDate(a.dueAt, lang) })}`}
                      {a.window === 'not-open' && a.opensAt && ` · ${t('activity.opens', { date: formatClassDate(a.opensAt, lang) })}`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs">
                  {staff ? (
                    <>
                      {!a.visible && <span className="rounded-full bg-[var(--wq-canvas-alt)] px-2 py-0.5 font-semibold text-[var(--wq-text-muted)]">Draft</span>}
                      {a.counts && (
                        <span className="text-[var(--wq-text-muted)]">
                          {a.counts.submitted}/{a.counts.total} submitted
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {a.window === 'closed' && a.myStatus !== 'submitted' && a.myStatus !== 'late' && (
                        <span className="font-semibold text-red-700">{t('activity.window.closed')}</span>
                      )}
                      {a.myStatus && <StatusPill status={a.myStatus} />}
                    </>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {staff &&
        (adding ? (
          <form
            className="flex flex-col gap-2 rounded-xl border border-dashed border-[var(--wq-border-hover)] p-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              create.run(async () => {
                const r = await createActivity({ offeringId, sessionId, kind, titleEn: title });
                if (r.ok && r.activityId) router.push(`/workspace-q/${offeringId}/activities/${r.activityId}`);
                return r;
              });
            }}
          >
            <input className={cn(fieldClass, 'min-w-0 flex-1')} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Activity title, e.g. Mission 4" aria-label="Activity title" maxLength={200} autoFocus />
            <select className={fieldClass} value={kind} onChange={(e) => setKind(e.target.value as ActivityKind)} aria-label="Activity type">
              {ACTIVITY_KINDS.map((k) => (
                <option key={k} value={k}>
                  {kindEn[k]}
                </option>
              ))}
            </select>
            <Button type="submit" variant="primary" pending={create.pending} disabled={!title.trim()}>
              Create
            </Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </form>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add activity
          </Button>
        ))}
      <ErrorText>{create.error}</ErrorText>
    </div>
  );
}
