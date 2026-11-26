'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { retentionStatus } from '@/lib/privacy';
import { cn } from '@/lib/utils';

/**
 * A line on the class page: students see until when the class's data is kept
 * (a reminder to download their work in the last 30 days); staff are nudged to
 * set a deletion date when there is none.
 */
export default function RetentionNotice({
  offeringId,
  staff,
  deleteAfter,
}: {
  offeringId: string;
  staff: boolean;
  deleteAfter: string | null;
}) {
  const { t, lang } = useTranslation();
  const status = retentionStatus(deleteAfter ? new Date(deleteAfter) : null, null);
  const date = (d: Date) => d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });

  let body: React.ReactNode = null;
  if (staff && status.state === 'unset') {
    body = (
      <>
        {t('privacy.setDate')}{' '}
        <Link href={`/workspace-q/${offeringId}/manage`} className="font-medium underline">
          {t('privacy.setDateLink')}
        </Link>
      </>
    );
  } else if (!staff && (status.state === 'scheduled' || status.state === 'soon' || status.state === 'due')) {
    body = (
      <>
        {status.state === 'scheduled' ? t('privacy.keptUntil', { date: date(status.on) }) : t('privacy.soon', { date: date(status.on) })}{' '}
        <Link href="/workspace-q/account" className="font-medium underline">
          {t('privacy.myData')}
        </Link>
      </>
    );
  }
  if (!body) return null;
  const urgent = status.state === 'soon' || status.state === 'due' || (staff && status.state === 'unset');
  return (
    <div className="bg-[var(--wq-canvas)] px-4 pt-6 sm:px-6">
      <p
        data-testid="retention-notice"
        className={cn(
          'mx-auto flex max-w-5xl items-start gap-2 rounded-lg px-3 py-2 text-xs',
          urgent ? 'bg-amber-50 text-amber-900' : 'bg-[var(--wq-canvas-alt)] text-[var(--wq-text-muted)]',
        )}
      >
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{body}</span>
      </p>
    </div>
  );
}
