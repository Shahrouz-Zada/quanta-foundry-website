'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { isNotebookFile } from '@/lib/notebook';
import { cn } from '@/lib/utils';

/** Address of the read-only notebook page for one stored version of a file. */
export function notebookHref(offeringId: string, fileId: string, versionId?: string): string {
  return `/workspace-q/${offeringId}/files/${fileId}/notebook${versionId ? `?version=${encodeURIComponent(versionId)}` : ''}`;
}

/** "Preview" link for a notebook file; renders nothing for any other kind of file. */
export default function NotebookPreviewLink({
  offeringId,
  fileId,
  versionId,
  fileName,
  className,
  plain = false,
}: {
  offeringId: string;
  fileId: string;
  versionId?: string;
  fileName: string;
  className?: string;
  /** Text link instead of a bordered button (for compact lists). */
  plain?: boolean;
}) {
  const { t } = useTranslation();
  if (!isNotebookFile(fileName)) return null;
  return (
    <Link
      href={notebookHref(offeringId, fileId, versionId)}
      data-testid="notebook-preview-link"
      className={cn(
        plain
          ? 'inline-flex items-center gap-1 text-xs font-medium text-[var(--wq-accent)] hover:underline'
          : 'inline-flex items-center gap-1.5 rounded-lg border border-[var(--wq-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--wq-text)] hover:border-[var(--wq-border-hover)]',
        className,
      )}
    >
      <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
      {t('notebook.preview')}
    </Link>
  );
}
