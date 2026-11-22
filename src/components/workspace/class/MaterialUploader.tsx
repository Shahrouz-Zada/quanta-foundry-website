'use client';

import { useRef, useState, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Link2, Loader2, UploadCloud, XCircle } from 'lucide-react';
import { addLinkMaterial } from '@/app/workspace-q/classes/materials-actions';
import { cn } from '@/lib/utils';
import { Button, ErrorText, fieldClass, useAction } from '@/components/workspace/files/ui';
import { uploadMaterial } from './uploadMaterial';

type ItemState = { name: string; progress: number; state: 'uploading' | 'saving' | 'done' | 'error'; error?: string };

/** Staff: drop several files into a session (type and title are guessed, fixable after), or add a link. */
export default function MaterialUploader({
  offeringId,
  sessionId,
  disabled,
}: {
  offeringId: string;
  sessionId: string | null;
  disabled?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [audience, setAudience] = useState<'STUDENTS' | 'STAFF'>('STUDENTS');
  const [items, setItems] = useState<ItemState[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const link = useAction();

  const patch = (index: number, update: Partial<ItemState>) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...update } : item)));

  async function handleFiles(list: FileList | File[] | null) {
    const files = Array.from(list ?? []);
    if (files.length === 0 || busy || disabled) return;
    setBusy(true);
    setItems(files.map((f) => ({ name: f.name, progress: 0, state: 'uploading' })));
    for (const [index, file] of files.entries()) {
      const error = await uploadMaterial(file, {
        offeringId,
        sessionId,
        audience,
        onProgress: (progress) => patch(index, { progress }),
        onSaving: () => patch(index, { state: 'saving', progress: 100 }),
      });
      patch(index, error ? { state: 'error', error } : { state: 'done' });
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

  return (
    <div className="space-y-2">
      <div
        data-testid={`drop-${sessionId ?? 'general'}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-4 text-center text-sm transition sm:flex-row sm:justify-between sm:text-left',
          dragging ? 'border-[var(--wq-accent)] bg-[var(--wq-accent-glow)]/10' : 'border-[var(--wq-border-hover)]',
          disabled && 'opacity-60',
        )}
      >
        <div className="flex items-center gap-2 text-[var(--wq-text-muted)]">
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin text-[var(--wq-accent)]" aria-hidden="true" />
          ) : (
            <UploadCloud className="h-5 w-5 text-[var(--wq-accent)]" aria-hidden="true" />
          )}
          <span>
            {busy ? 'Uploading…' : 'Drop materials here or '}
            {!busy && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                className="font-semibold text-[var(--wq-accent)] hover:underline disabled:cursor-not-allowed"
              >
                choose files
              </button>
            )}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <label className="text-xs text-[var(--wq-text-muted)]">
            For{' '}
            <select
              className={cn(fieldClass, 'py-1 text-xs')}
              value={audience}
              onChange={(e) => setAudience(e.target.value as 'STUDENTS' | 'STAFF')}
              aria-label="Who can see the new materials"
            >
              <option value="STUDENTS">Students</option>
              <option value="STAFF">Staff only</option>
            </select>
          </label>
          <Button size="sm" variant="ghost" onClick={() => setLinkOpen((v) => !v)}>
            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
            Add a link
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose material files"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {disabled && <p className="text-xs text-amber-700">File storage is not connected yet, so uploads are switched off.</p>}

      {items.length > 0 && (
        <ul aria-live="polite" className="space-y-1 text-xs">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-[var(--wq-text-muted)]">
              {item.state === 'done' ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              ) : item.state === 'error' ? (
                <XCircle className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
              ) : (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              )}
              <span className="truncate">{item.name}</span>
              <span>
                {item.state === 'uploading' && `${item.progress}%`}
                {item.state === 'saving' && 'Saving…'}
                {item.state === 'done' && 'Added'}
                {item.state === 'error' && <span className="text-red-600">{item.error}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      {linkOpen && (
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            link.run(() => addLinkMaterial({ offeringId, sessionId, titleEn: linkTitle, url: linkUrl }), () => {
              setLinkTitle('');
              setLinkUrl('');
              setLinkOpen(false);
              router.refresh();
            });
          }}
        >
          <input className={cn(fieldClass, 'sm:w-48')} value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} placeholder="Title" aria-label="Link title" maxLength={200} />
          <input className={cn(fieldClass, 'min-w-0 flex-1')} value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" aria-label="Link address" maxLength={2000} />
          <Button type="submit" variant="primary" pending={link.pending} disabled={!linkTitle.trim() || !linkUrl.trim()}>
            Add link
          </Button>
        </form>
      )}
      <ErrorText>{link.error}</ErrorText>
    </div>
  );
}
