'use client';

import { useTranslation } from '@/lib/i18n';

// Small pieces of the notebook page whose words depend on the EN/FR switch.

export function NotebookBackLabel() {
  const { t } = useTranslation();
  return <>{t('notebook.back')}</>;
}

export function NotebookDownloadLabel() {
  const { t } = useTranslation();
  return <>{t('notebook.download')}</>;
}

export function NotebookReadOnlyNote() {
  const { t } = useTranslation();
  return <p className="mb-4 rounded-lg bg-[var(--wq-canvas-alt)] px-3 py-2 text-xs text-[var(--wq-text-muted)]">{t('notebook.readOnly')}</p>;
}

export function NotebookEarlierTag() {
  const { t } = useTranslation();
  return <>{' · '}{t('notebook.earlier')}</>;
}
