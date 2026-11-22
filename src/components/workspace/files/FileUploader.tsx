'use client';

import { useRef, useState, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { CheckCircle2, Loader2, UploadCloud, XCircle } from 'lucide-react';
import { registerUpload } from '@/app/workspace-q/[offeringId]/files/actions';
import { MAX_STUDENT_FILE_BYTES, allowedShareLevels, buildStudentBlobPathname, type ShareLevel } from '@/lib/workspace-files';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { fieldClass } from './ui';

type ItemState = { name: string; progress: number; state: 'uploading' | 'saving' | 'done' | 'error'; error?: string };

/** Sends one file to storage, then saves it. Returns an error message, or null on success. */
export async function uploadOne(
  file: File,
  opts: {
    offeringId: string;
    space: 'personal' | 'team';
    shareLevel?: ShareLevel;
    fileId?: string;
    onProgress?: (percentage: number) => void;
    onSaving?: () => void;
  },
): Promise<string | null> {
  if (file.size > MAX_STUDENT_FILE_BYTES) return 'tooBig';
  try {
    const pathname = buildStudentBlobPathname(opts.offeringId, crypto.randomUUID(), file.name);
    await upload(pathname, file, {
      access: 'private',
      handleUploadUrl: '/api/workspace-q/files/upload',
      clientPayload: JSON.stringify({ offeringId: opts.offeringId, space: opts.space, fileId: opts.fileId }),
      onUploadProgress: ({ percentage }) => opts.onProgress?.(Math.round(percentage)),
    });
    opts.onSaving?.();
    const result = await registerUpload({
      offeringId: opts.offeringId,
      pathname,
      fileName: file.name,
      space: opts.space,
      shareLevel: opts.shareLevel,
      fileId: opts.fileId,
    });
    return result.ok ? null : result.error;
  } catch (error) {
    return error instanceof Error ? error.message : 'Upload failed';
  }
}

export default function FileUploader({
  offeringId,
  space,
  hasTeam,
  disabled,
}: {
  offeringId: string;
  space: 'personal' | 'team';
  hasTeam: boolean;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const levels = allowedShareLevels(space === 'team');
  const [level, setLevel] = useState<ShareLevel>(levels[0]);
  const [items, setItems] = useState<ItemState[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  function patch(index: number, update: Partial<ItemState>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...update } : item)));
  }

  async function handleFiles(list: FileList | File[] | null) {
    const files = Array.from(list ?? []);
    if (files.length === 0 || busy || disabled) return;
    setBusy(true);
    setItems(files.map((f) => ({ name: f.name, progress: 0, state: 'uploading' })));
    // One at a time: keeps the order and gives clear progress.
    for (const [index, file] of files.entries()) {
      const error = await uploadOne(file, {
        offeringId,
        space,
        shareLevel: level,
        onProgress: (progress) => patch(index, { progress }),
        onSaving: () => patch(index, { state: 'saving', progress: 100 }),
      });
      patch(index, error ? { state: 'error', error: error === 'tooBig' ? t('files.tooBig') : error } : { state: 'done' });
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
    router.refresh();
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    void handleFiles(e.dataTransfer.files);
  }

  const levelLabel = (l: ShareLevel) => t(l === 'TEAM' && space === 'team' ? 'files.level.TEAM.team' : `files.level.${l}`);

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition',
          dragging
            ? 'border-[var(--wq-accent)] bg-[var(--wq-accent-glow)]/10'
            : 'border-[var(--wq-border-hover)] bg-[var(--wq-card-surface)]',
          disabled && 'opacity-60',
        )}
      >
        {busy ? (
          <Loader2 className="h-8 w-8 animate-spin text-[var(--wq-accent)]" aria-hidden="true" />
        ) : (
          <UploadCloud className="h-8 w-8 text-[var(--wq-accent)]" aria-hidden="true" />
        )}
        <p className="text-sm text-[var(--wq-text)]">
          {busy ? (
            t('files.uploading')
          ) : (
            <>
              {t('files.drop')}{' '}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                className="font-semibold text-[var(--wq-accent)] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)] rounded disabled:cursor-not-allowed"
              >
                {t('files.choose')}
              </button>
            </>
          )}
        </p>
        <p className="text-xs text-[var(--wq-text-muted)]">{t('files.dropHint')}</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled || busy}
        />
      </div>

      <label className="flex flex-wrap items-center gap-2 text-sm text-[var(--wq-text-muted)]">
        <span>{t('files.whoSees')}</span>
        <select
          className={cn(fieldClass, 'py-1.5')}
          value={level}
          onChange={(e) => setLevel(e.target.value as ShareLevel)}
          disabled={busy || disabled}
        >
          {levels.map((l) => (
            <option key={l} value={l} disabled={l === 'TEAM' && space === 'personal' && !hasTeam}>
              {levelLabel(l)}
            </option>
          ))}
        </select>
      </label>

      {items.length > 0 && (
        <ul className="space-y-1.5" aria-live="polite">
          {items.map((item, i) => (
            <li key={`${item.name}-${i}`} className="flex items-center gap-2 text-sm">
              {item.state === 'done' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />}
              {item.state === 'error' && <XCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />}
              {(item.state === 'uploading' || item.state === 'saving') && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--wq-accent)]" aria-hidden="true" />
              )}
              <span className="truncate text-[var(--wq-text)]">{item.name}</span>
              <span className="shrink-0 text-xs text-[var(--wq-text-muted)]">
                {item.state === 'uploading' && `${item.progress}%`}
                {item.state === 'saving' && t('files.saving')}
                {item.state === 'done' && t('files.added')}
                {item.state === 'error' && <span className="text-red-600">{item.error}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
