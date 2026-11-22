'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function NotInClass({ email }: { email: string | null }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 items-center justify-center bg-[var(--wq-canvas)] px-4 py-16">
      <div className="max-w-md rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-8 text-center">
        <h1 className="mb-2 text-lg font-semibold text-[var(--wq-text)]">{t('class.notYours')}</h1>
        <p className="text-sm text-[var(--wq-text-muted)]">
          {email ?? '—'} · <Link className="font-medium text-[var(--wq-accent)] hover:underline" href="/workspace-q/join">Join a class</Link>
        </p>
      </div>
    </div>
  );
}
