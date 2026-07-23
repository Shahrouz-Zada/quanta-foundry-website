'use client';
// =============================================================================
// ReportProblemModal — focus-trapped modal with prototype notice
// Opened from WorkspaceQHeader profile menu.
// Collects: category, description, auto-filled session context + device info.
// Screenshot upload is a Phase 2 feature (placeholder only).
// =============================================================================

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation, type MessageKey } from '@/lib/i18n';

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

const CATEGORIES: { key: MessageKey; value: string }[] = [
  { key: 'report.cat.technical',     value: 'technical' },
  { key: 'report.cat.content',       value: 'content' },
  { key: 'report.cat.link',          value: 'link' },
  { key: 'report.cat.display',       value: 'display' },
  { key: 'report.cat.accessibility', value: 'accessibility' },
  { key: 'report.cat.other',         value: 'other' },
];

export default function ReportProblemModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const modalRef   = useRef<HTMLDivElement>(null);
  const firstRef   = useRef<HTMLSelectElement>(null);

  const [category,    setCategory]    = useState('');
  const [description, setDescription] = useState('');
  const [submitted,   setSubmitted]   = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCategory('');
      setDescription('');
      setSubmitted(false);
    }
  }, [isOpen]);

  // Focus trap + keyboard handling
  useEffect(() => {
    if (!isOpen) return;
    firstRef.current?.focus();

    const modal = modalRef.current;
    if (!modal) return;

    const focusable = (): HTMLElement[] =>
      Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const els = focusable();
      const first = els[0];
      const last  = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-fill session context
  const sessionContext =
    typeof window !== 'undefined' ? window.location.href : '';
  const deviceInfo =
    typeof window !== 'undefined'
      ? `${navigator.userAgent.slice(0, 80)}…`
      : '';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Prototype: log to console only; no network request
    console.info('[ReportProblem prototype]', { category, description, sessionContext });
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label={t('report.title')}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={modalRef}
        className={cn(
          'relative w-full max-w-lg rounded-2xl shadow-2xl',
          'bg-[var(--wq-shell)] border border-[var(--wq-shell-border)]',
          'flex flex-col overflow-hidden',
          'max-h-[90vh]'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--wq-shell-border)] shrink-0">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="text-[var(--wq-gold)]" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-white">{t('report.title')}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label={t('action.close')}
            className="text-white/35 hover:text-white p-1.5 rounded-lg hover:bg-white/8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {submitted ? (
            /* Success state */
            <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
              <CheckCircle size={36} className="text-[var(--wq-accent)]" aria-hidden="true" />
              <p className="text-sm text-white/70 leading-relaxed max-w-xs">
                {t('report.successMsg')}
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 rounded-lg bg-[var(--wq-accent)] text-white text-sm font-medium hover:bg-[var(--wq-accent-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)] focus-visible:ring-offset-2"
              >
                {t('action.close')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5" noValidate>

              {/* Prototype notice */}
              <div className="flex items-start gap-2.5 bg-amber-500/8 border border-amber-400/20 rounded-lg px-4 py-3">
                <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs text-amber-400/80 leading-relaxed">{t('report.protoNote')}</p>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label
                  htmlFor="report-category"
                  className="block text-xs font-semibold text-white/55 uppercase tracking-wider"
                >
                  {t('report.categoryLabel')}
                </label>
                <select
                  id="report-category"
                  ref={firstRef}
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={cn(
                    'w-full rounded-lg px-3 py-2.5 text-sm bg-white/5 border border-white/10',
                    'text-white focus:outline-none focus:ring-2 focus:ring-[var(--wq-accent)] focus:border-transparent',
                    '[&>option]:bg-[#08212C]'
                  )}
                >
                  <option value="" disabled>— select —</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{t(c.key)}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label
                  htmlFor="report-description"
                  className="block text-xs font-semibold text-white/55 uppercase tracking-wider"
                >
                  {t('report.descriptionLabel')}
                </label>
                <textarea
                  id="report-description"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('report.descriptionHint')}
                  className={cn(
                    'w-full rounded-lg px-3 py-2.5 text-sm bg-white/5 border border-white/10 resize-none',
                    'text-white placeholder:text-white/25',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--wq-accent)] focus:border-transparent',
                  )}
                />
              </div>

              {/* Auto-filled metadata (read-only) */}
              <div className="space-y-2 text-xs text-white/30">
                <p className="font-semibold uppercase tracking-wider">{t('report.metaLabel')}</p>
                <p className="font-mono break-all leading-relaxed bg-white/3 rounded px-2 py-1.5">
                  {sessionContext}
                </p>
                <p className="font-semibold uppercase tracking-wider mt-3">{t('report.deviceLabel')}</p>
                <p className="font-mono break-all leading-relaxed bg-white/3 rounded px-2 py-1.5">
                  {deviceInfo}
                </p>
              </div>

              {/* Screenshot placeholder */}
              <div className="border border-dashed border-white/10 rounded-lg px-4 py-3 flex items-center gap-2.5">
                <span className="text-white/18 text-lg" aria-hidden="true">📎</span>
                <p className="text-xs text-white/22 leading-relaxed">{t('report.screenshotNote')}</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!category || description.trim().length < 10}
                className={cn(
                  'w-full py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)] focus-visible:ring-offset-2',
                  category && description.trim().length >= 10
                    ? 'bg-[var(--wq-accent)] text-white hover:bg-[var(--wq-accent-hover)]'
                    : 'bg-white/8 text-white/28 cursor-not-allowed'
                )}
              >
                {t('report.submit')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
