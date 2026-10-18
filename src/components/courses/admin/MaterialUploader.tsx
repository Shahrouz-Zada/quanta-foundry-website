'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, Loader2, Upload, XCircle } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';
import { addMaterial } from '@/app/courses/admin/actions';
import {
  MAX_COURSE_FILE_BYTES,
  buildCourseBlobPathname,
  formatBytes,
  titleFromFileName,
} from '@/lib/course-files';
import { Button, inputClass } from './ui';

type ItemStatus = { name: string; progress: number; state: 'uploading' | 'saving' | 'done' | 'error'; error?: string };

const MULTIPART_THRESHOLD = 20 * 1024 * 1024;

export default function MaterialUploader({ courseId, disabled }: { courseId: string; disabled?: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [sessionLabel, setSessionLabel] = useState('');
  const [items, setItems] = useState<ItemStatus[]>([]);
  const [busy, setBusy] = useState(false);

  function patch(index: number, update: Partial<ItemStatus>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...update } : item)));
  }

  async function handleFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    setBusy(true);
    setItems(files.map((f) => ({ name: f.name, progress: 0, state: 'uploading' })));

    // One at a time keeps the order of the files as selected.
    for (const [index, file] of files.entries()) {
      if (file.size > MAX_COURSE_FILE_BYTES) {
        patch(index, { state: 'error', error: `Larger than ${formatBytes(MAX_COURSE_FILE_BYTES)}` });
        continue;
      }
      try {
        const pathname = buildCourseBlobPathname(courseId, crypto.randomUUID(), file.name);
        const blob = await upload(pathname, file, {
          access: 'public',
          handleUploadUrl: '/api/courses/upload',
          clientPayload: JSON.stringify({ courseId }),
          multipart: file.size > MULTIPART_THRESHOLD,
          onUploadProgress: ({ percentage }) => patch(index, { progress: Math.round(percentage) }),
        });
        patch(index, { state: 'saving', progress: 100 });
        const result = await addMaterial({
          courseId,
          blobUrl: blob.url,
          fileName: file.name,
          title: titleFromFileName(file.name),
          sessionLabel,
        });
        patch(index, result.ok ? { state: 'done' } : { state: 'error', error: result.error });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        patch(index, { state: 'error', error: message });
      }
    }

    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
    router.refresh();
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-[#0A1929]">Upload files</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block sm:w-56">
          <span className="mb-1 block text-xs text-[#2C3E50]/70">Session label (optional)</span>
          <input
            className={inputClass}
            value={sessionLabel}
            onChange={(e) => setSessionLabel(e.target.value)}
            placeholder="e.g. Session 2"
            maxLength={100}
            disabled={disabled || busy}
          />
        </label>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          id={`upload-${courseId}`}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled || busy}
        />
        <Button
          variant="primary"
          pending={busy}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {!busy && <Upload className="h-4 w-4" aria-hidden="true" />}
          {busy ? 'Uploading…' : 'Choose files'}
        </Button>
      </div>
      <p className="mt-2 text-xs text-[#2C3E50]/60">
        Any file type, up to {formatBytes(MAX_COURSE_FILE_BYTES)} each. The file name becomes the title; you can
        rename it afterwards. HTML decks and PDFs get an &ldquo;Open&rdquo; button as well as Download.
      </p>

      {items.length > 0 && (
        <ul className="mt-3 space-y-1.5" aria-live="polite">
          {items.map((item, i) => (
            <li key={`${item.name}-${i}`} className="flex items-center gap-2 text-sm">
              {item.state === 'done' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />}
              {item.state === 'error' && <XCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />}
              {(item.state === 'uploading' || item.state === 'saving') && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#4A90E2]" aria-hidden="true" />
              )}
              <span className="truncate text-[#0A1929]">{item.name}</span>
              <span className="shrink-0 text-xs text-[#2C3E50]/60">
                {item.state === 'uploading' && `${item.progress}%`}
                {item.state === 'saving' && 'saving…'}
                {item.state === 'done' && 'added'}
                {item.state === 'error' && <span className="text-red-600">{item.error}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
