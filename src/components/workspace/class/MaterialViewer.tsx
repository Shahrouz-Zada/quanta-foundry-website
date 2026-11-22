'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Maximize2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { pickTitle } from '@/lib/workspace-materials';

/**
 * Full-screen material. HTML decks run in a sandboxed frame (their own
 * navigation and EN/FR switch keep working; they can't touch this site or the
 * account). Keyboard focus goes to the deck so arrow keys move the slides.
 */
export default function MaterialViewer({
  offeringId,
  materialId,
  titleEn,
  titleFr,
  mode,
  canDownload,
}: {
  offeringId: string;
  materialId: string;
  titleEn: string;
  titleFr: string | null;
  mode: 'html' | 'pdf' | 'image' | 'text';
  canDownload: boolean;
}) {
  const { t, lang } = useTranslation();
  const frame = useRef<HTMLIFrameElement>(null);
  const src = `/api/workspace-q/materials/${materialId}/file`;
  const title = pickTitle({ titleEn, titleFr }, lang);

  return (
    <div className="flex h-[calc(100vh-var(--wq-header-h))] flex-col bg-[var(--wq-canvas)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--wq-border)] bg-[var(--wq-card)] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href={`/workspace-q/${offeringId}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm text-[var(--wq-text-muted)] hover:bg-[var(--wq-canvas-alt)] hover:text-[var(--wq-text)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('class.back')}</span>
          </Link>
          <h1 className="truncate text-sm font-semibold text-[var(--wq-text)]">{title}</h1>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {mode !== 'image' && (
            <button
              type="button"
              onClick={() => frame.current?.requestFullscreen?.()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--wq-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--wq-text)]"
              aria-label="Full screen"
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
          {canDownload && (
            <a
              href={`${src}?download=1`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--wq-accent)] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[var(--wq-accent-hover)]"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{t('class.download')}</span>
            </a>
          )}
        </div>
      </div>
      {mode === 'image' ? (
        <div className="flex flex-1 items-center justify-center overflow-auto p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={title} className="max-h-full max-w-full" />
        </div>
      ) : (
        <iframe
          ref={frame}
          src={src}
          title={title}
          className="w-full flex-1 border-0 bg-white"
          allow="fullscreen"
          allowFullScreen
          // PDFs need the browser's own viewer, which a sandbox would block; decks and text are sandboxed.
          sandbox={mode === 'pdf' ? undefined : 'allow-scripts allow-popups allow-modals allow-downloads'}
          onLoad={() => mode === 'html' && frame.current?.focus()}
        />
      )}
    </div>
  );
}
