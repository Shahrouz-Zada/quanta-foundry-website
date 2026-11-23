'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ActivityInfo, ReviewRow } from '@/lib/workspace-activities-server';
import ActivityEditor from './ActivityEditor';
import ActivityReview from './ActivityReview';
import { ResultsAndModel, type MaterialChoice } from './ScoredEditors';
import { SCORED_KINDS } from '@/lib/workspace-activities';
import { ActivityHeader } from './ActivityHeader';

/** Staff page of an activity: the answers, and the settings. Drafts open on the settings. */
export default function ActivityStaff({
  activity,
  rows,
  sessionOptions,
  materials,
}: {
  activity: ActivityInfo;
  rows: ReviewRow[];
  sessionOptions: { id: string; label: string }[];
  materials: MaterialChoice[];
}) {
  const [tab, setTab] = useState<'answers' | 'settings'>(activity.visible ? 'answers' : 'settings');
  const hasAnswers = rows.some((r) => r.submission.id !== null);
  return (
    <div className="flex-1 bg-[var(--wq-canvas)] pb-24">
      <div className="mx-auto max-w-4xl space-y-6 px-4 pt-8 sm:px-6">
        <ActivityHeader activity={activity}>
          <p className="text-sm">
            {activity.visible ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Published</span>
            ) : (
              <span className="rounded-full bg-[var(--wq-canvas-alt)] px-2 py-0.5 text-xs font-semibold text-[var(--wq-text-muted)]">Draft: students can’t see it</span>
            )}
            <span className="ml-2 text-[var(--wq-text-muted)]">{activity.submitter === 'TEAM' ? 'One answer per team' : 'Each student answers'}</span>
          </p>
        </ActivityHeader>
        <div role="tablist" className="flex gap-1 border-b border-[var(--wq-border)]">
          {(['answers', 'settings'] as const).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={cn(
                '-mb-px border-b-2 px-3 py-2.5 text-sm font-medium',
                tab === k ? 'border-[var(--wq-accent)] text-[var(--wq-text)]' : 'border-transparent text-[var(--wq-text-muted)] hover:text-[var(--wq-text)]',
              )}
            >
              {k === 'answers' ? 'Answers' : 'Settings and questions'}
            </button>
          ))}
        </div>
        {tab === 'answers' ? (
          <>
            <ActivityReview activity={activity} rows={rows} />
            <ResultsAndModel activity={activity} materials={materials} scored={SCORED_KINDS.includes(activity.kind)} />
          </>
        ) : (
          <>
            <ActivityEditor activity={activity} sessionOptions={sessionOptions} hasAnswers={hasAnswers} />
            <ResultsAndModel activity={activity} materials={materials} scored={SCORED_KINDS.includes(activity.kind)} />
          </>
        )}
      </div>
    </div>
  );
}
