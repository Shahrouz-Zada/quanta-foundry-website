'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Download, ExternalLink, History, Pencil, Trash2, Upload } from 'lucide-react';
import { deleteFile, renameFile, setShareLevel } from '@/app/workspace-q/[offeringId]/files/actions';
import { fileTypeLabel, formatBytes } from '@/lib/course-files';
import { allowedShareLevels, inlineContentType, type ShareLevel } from '@/lib/workspace-files';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import NotebookPreviewLink from '@/components/workspace/notebook/NotebookPreviewLink';
import { uploadOne } from './FileUploader';
import { Button, ErrorText, fieldClass, formatDate, useAction } from './ui';
import type { FileView } from './types';

const badgeClass: Record<ShareLevel, string> = {
  STAFF: 'bg-[var(--wq-canvas-alt)] text-[var(--wq-text-muted)]',
  TEAM: 'bg-[var(--wq-accent-glow)]/20 text-[var(--wq-accent)]',
  CLASS: 'bg-[var(--wq-gold-muted)] text-[#9A7B1C]',
};

export default function FileRow({
  file,
  offeringId,
  showOwner,
}: {
  file: FileView;
  offeringId: string;
  showOwner?: boolean;
}) {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const versionInput = useRef<HTMLInputElement>(null);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(file.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versionState, setVersionState] = useState<string | null>(null);
  const action = useAction();

  const href = (versionId?: string, inline = false) => {
    const q = new URLSearchParams();
    if (versionId) q.set('version', versionId);
    if (inline) q.set('inline', '1');
    const qs = q.toString();
    return `/api/workspace-q/files/${file.id}/download${qs ? `?${qs}` : ''}`;
  };
  const canOpen = inlineContentType(file.current.fileName) !== null;
  const isTeamFile = file.teamId !== null;
  const levelLabel = (l: ShareLevel) => t(l === 'TEAM' && isTeamFile ? 'files.level.TEAM.team' : `files.level.${l}`);

  async function onNewVersion(list: FileList | null) {
    const chosen = list?.[0];
    if (!chosen) return;
    setVersionState('0%');
    const error = await uploadOne(chosen, {
      offeringId,
      space: isTeamFile ? 'team' : 'personal',
      fileId: file.id,
      onProgress: (p) => setVersionState(`${p}%`),
      onSaving: () => setVersionState(t('files.saving')),
    });
    if (versionInput.current) versionInput.current.value = '';
    setVersionState(null);
    if (error) action.setError(error === 'tooBig' ? t('files.tooBig') : error);
    else router.refresh();
  }

  return (
    <li className="rounded-xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-9 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--wq-canvas-alt)] text-[10px] font-bold tracking-wide text-[var(--wq-text-muted)]"
          >
            {fileTypeLabel(file.current.fileName)}
          </span>
          <div className="min-w-0 flex-1">
            {renaming ? (
              <form
                className="flex flex-wrap items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  action.run(() => renameFile({ fileId: file.id, title }), () => {
                    setRenaming(false);
                    router.refresh();
                  });
                }}
              >
                <input
                  className={cn(fieldClass, 'min-w-0 flex-1 py-1.5')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  aria-label={t('files.rename')}
                  autoFocus
                />
                <Button type="submit" size="sm" variant="primary" pending={action.pending} disabled={!title.trim()}>
                  {t('files.save')}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setRenaming(false); setTitle(file.title); }}>
                  {t('files.cancel')}
                </Button>
              </form>
            ) : (
              <p className="break-words font-semibold text-[var(--wq-text)]">{file.title}</p>
            )}
            <p className="mt-0.5 text-xs text-[var(--wq-text-muted)]">
              <span className="break-all">{file.current.fileName}</span>
              {' · '}
              {formatBytes(file.current.sizeBytes)}
              {' · '}
              {formatDate(file.current.uploadedAt, lang)}
              {' · '}
              {t('files.by', { name: file.current.uploadedBy ?? t('files.unnamed') })}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {file.canEdit ? (
                <select
                  className={cn(fieldClass, 'py-1 text-xs')}
                  value={file.shareLevel}
                  aria-label={t('files.whoSees')}
                  disabled={action.pending}
                  onChange={(e) =>
                    action.run(() => setShareLevel({ fileId: file.id, shareLevel: e.target.value }), () => router.refresh())
                  }
                >
                  {allowedShareLevels(isTeamFile).map((l) => (
                    <option key={l} value={l}>
                      {levelLabel(l)}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', badgeClass[file.shareLevel])}>
                  {t(`files.badge.${file.shareLevel}`)}
                </span>
              )}
              {showOwner && (
                <span className="text-xs text-[var(--wq-text-muted)]">
                  {file.teamName ? `${file.teamName} · ` : ''}
                  {file.ownerName ?? t('files.unnamed')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-1.5">
          {canOpen && (
            <a
              href={href(undefined, true)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--wq-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--wq-text)] hover:border-[var(--wq-border-hover)]"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              {t('files.open')}
            </a>
          )}
          <NotebookPreviewLink offeringId={offeringId} fileId={file.id} fileName={file.current.fileName} />
          <a
            href={href()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--wq-accent)] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[var(--wq-accent-hover)]"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {t('files.download')}
          </a>
          {file.canEdit && (
            <>
              <Button size="sm" variant="ghost" onClick={() => versionInput.current?.click()} pending={versionState !== null}>
                {versionState === null && <Upload className="h-3.5 w-3.5" aria-hidden="true" />}
                {versionState ?? t('files.newVersion')}
              </Button>
              <input
                ref={versionInput}
                type="file"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(e) => onNewVersion(e.target.files)}
              />
              {!renaming && (
                <Button size="sm" variant="ghost" onClick={() => setRenaming(true)} aria-label={t('files.rename')}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              )}
            </>
          )}
          {file.canDelete && !confirmDelete && (
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)} aria-label={t('files.delete')}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          <span>{t('files.deleteConfirm')}</span>
          <Button
            size="sm"
            variant="danger"
            pending={action.pending}
            onClick={() => action.run(() => deleteFile({ fileId: file.id }), () => router.refresh())}
          >
            {t('files.delete')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
            {t('files.cancel')}
          </Button>
        </div>
      )}

      <div className="mt-2">
        <ErrorText>{action.error}</ErrorText>
      </div>

      {file.older.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowVersions((v) => !v)}
            aria-expanded={showVersions}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--wq-text-muted)] hover:text-[var(--wq-text)]"
          >
            <History className="h-3.5 w-3.5" aria-hidden="true" />
            {showVersions
              ? t('files.hideVersions')
              : file.older.length === 1
                ? t('files.version1')
                : t('files.versions', { n: file.older.length })}
            <ChevronDown className={cn('h-3.5 w-3.5 transition', showVersions && 'rotate-180')} aria-hidden="true" />
          </button>
          {showVersions && (
            <ul className="mt-2 space-y-1 border-l-2 border-[var(--wq-border)] pl-3">
              {file.older.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center gap-x-2 text-xs text-[var(--wq-text-muted)]">
                  <a href={href(v.id)} className="font-medium text-[var(--wq-accent)] hover:underline">
                    {v.fileName}
                  </a>
                  <NotebookPreviewLink offeringId={offeringId} fileId={file.id} versionId={v.id} fileName={v.fileName} plain />
                  <span>
                    {formatBytes(v.sizeBytes)} · {formatDate(v.uploadedAt, lang)} · {t('files.by', { name: v.uploadedBy ?? t('files.unnamed') })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
