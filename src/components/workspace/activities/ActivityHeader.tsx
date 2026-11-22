'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { SubmissionStatus } from '@/lib/workspace-activities';
import type { ActivityInfo } from '@/lib/workspace-activities-server';
import { formatClassDate, pickTitle } from '@/lib/workspace-materials';

export function StatusPill({ status }: { status: SubmissionStatus }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[11px] font-semibold',
        status === 'submitted' && 'bg-emerald-100 text-emerald-800',
        status === 'late' && 'bg-amber-100 text-amber-900',
        status === 'in-progress' && 'bg-sky-100 text-sky-800',
        status === 'not-started' && 'bg-[var(--wq-canvas-alt)] text-[var(--wq-text-muted)]',
      )}
    >
      {t(`activity.status.${status}`)}
    </span>
  );
}

/** Title, timing and instructions, shared by the student and staff pages. */
export function ActivityHeader({ activity, children }: { activity: ActivityInfo; children?: ReactNode }) {
  const { t, lang } = useTranslation();
  const instructions = (lang === 'fr' && activity.instructionsFr) || activity.instructionsEn;
  return (
    <header className="space-y-3">
      <Link href={`/workspace-q/${activity.offeringId}`} className="inline-flex items-center gap-1 text-sm text-[var(--wq-text-muted)] hover:text-[var(--wq-text)]">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('class.back')}
      </Link>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--wq-accent)]">{t(`activity.kind.${activity.kind}`)}</p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--wq-text)] sm:text-3xl">{pickTitle(activity, lang)}</h1>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--wq-text-muted)]">
        {activity.dueAt && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {t('activity.due', { date: formatClassDate(activity.dueAt, lang) })}
          </span>
        )}
        {activity.window === 'not-open' && activity.opensAt && <span>{t('activity.opens', { date: formatClassDate(activity.opensAt, lang) })}</span>}
        {activity.window === 'late' && <span className="font-medium text-amber-800">{t('activity.window.late')}</span>}
        {activity.window === 'closed' && <span className="font-medium text-red-700">{t('activity.window.closed')}</span>}
      </div>
      {children}
      {instructions && (
        <div className="whitespace-pre-line rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-4 text-sm leading-relaxed text-[var(--wq-text)]">
          {instructions}
        </div>
      )}
    </header>
  );
}
