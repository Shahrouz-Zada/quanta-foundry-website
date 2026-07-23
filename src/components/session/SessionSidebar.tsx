'use client';
// =============================================================================
// SessionSidebar — Learning Sessions Prototype
// Collapsible rail: Overview tab → Stages list
// Uses completedStages (not visitedStages) for checkmarks.
// CSS variables for theme-awareness. i18n for all text.
// Publish stage labelled as optional.
// =============================================================================

import { useState, useCallback } from 'react';
import { Check, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LearningStage, StageId } from '@/types/learning-session';
import { useTranslation, type MessageKey } from '@/lib/i18n';
import { CORE_STAGE_IDS } from '@/lib/completion-rules';

export type NavItem = 'overview' | StageId;

interface Props {
  stages:          LearningStage[];
  activeItem:      NavItem;
  completedStages: Set<StageId>;
  coreCompleted:   number;
  onSelectItem:    (item: NavItem) => void;
}

export default function SessionSidebar({
  stages,
  activeItem,
  completedStages,
  coreCompleted,
  onSelectItem,
}: Props) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const toggle = useCallback(() => setIsExpanded((p) => !p), []);

  const isOverviewActive = activeItem === 'overview';

  return (
    <aside
      className={cn(
        'sticky top-[var(--wq-header-h)] h-[calc(100vh-var(--wq-header-h))]',
        'flex flex-col overflow-y-auto overflow-x-hidden shrink-0',
        'bg-[var(--wq-shell)] border-r border-[var(--wq-shell-border)]',
        'transition-[width] duration-300 ease-in-out motion-reduce:transition-none',
        isExpanded ? 'w-56' : 'w-16'
      )}
      aria-label={t('nav.learningPath')}
    >
      {/* ── Toggle ──────────────────────────────────────────────────── */}
      <div className={cn('flex items-center shrink-0 border-b border-[var(--wq-shell-border)] py-4', isExpanded ? 'justify-between px-4' : 'justify-center')}>
        {isExpanded && (
          <span className="text-[10px] font-semibold text-[var(--wq-shell-label)] uppercase tracking-[0.14em] whitespace-nowrap select-none">
            {t('nav.learningPath')}
          </span>
        )}
        <button
          onClick={toggle}
          aria-label={t(isExpanded ? 'header.collapseNav' : 'header.expandNav')}
          aria-expanded={isExpanded}
          className="flex items-center justify-center w-7 h-7 rounded-lg text-[var(--wq-shell-label)] hover:text-white hover:bg-white/8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)] focus-visible:ring-inset"
        >
          {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* ── Overview tab ────────────────────────────────────────────── */}
      <div className="shrink-0 pt-3 pb-2 px-2">
        <button
          onClick={() => onSelectItem('overview')}
          aria-current={isOverviewActive ? 'page' : undefined}
          aria-label={t('stage.overview')}
          className={cn(
            'flex items-center text-left w-full transition-colors duration-150 rounded-lg',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--wq-accent)]',
            isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center mx-auto w-10 h-10',
            isOverviewActive ? 'bg-[var(--wq-accent)]/18 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/70'
          )}
        >
          <span aria-hidden="true" className={cn('shrink-0 flex items-center justify-center rounded-lg transition-all duration-200', isExpanded ? 'w-5 h-5' : 'w-6 h-6', isOverviewActive ? 'text-[var(--wq-accent)]' : 'text-white/35')}>
            <LayoutDashboard size={isExpanded ? 14 : 15} />
          </span>
          {isExpanded && (
            <span className="flex flex-col min-w-0 flex-1">
              <span className={cn('text-xs font-semibold leading-tight', isOverviewActive ? 'text-white' : 'text-white/45')}>
                {t('stage.overview')}
              </span>
              {isOverviewActive && <span className="text-[10px] text-[var(--wq-accent)] font-medium mt-0.5 leading-tight">{t('action.current')}</span>}
            </span>
          )}
        </button>
      </div>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <div className={cn('shrink-0 flex items-center gap-2 px-3 pb-2', isExpanded ? '' : 'justify-center')}>
        {isExpanded ? (
          <>
            <div className="h-px flex-1 bg-white/8" aria-hidden="true" />
            <span className="text-[9px] font-semibold text-white/22 uppercase tracking-[0.16em] shrink-0 select-none">{t('nav.stages')}</span>
            <div className="h-px flex-1 bg-white/8" aria-hidden="true" />
          </>
        ) : (
          <div className="w-5 h-px bg-white/12 my-1" aria-hidden="true" />
        )}
      </div>

      {/* ── Stage list ──────────────────────────────────────────────── */}
      <nav role="list" className="flex flex-col px-2 flex-1 gap-0.5">
        {stages.map((stage, index) => {
          const isActive   = activeItem === stage.id;
          const isDone     = completedStages.has(stage.id);
          const isOptional = stage.id === 'publish';
          const stageLabel = t(`stage.${stage.id}` as MessageKey);

          return (
            <button
              key={stage.id}
              role="listitem"
              onClick={() => onSelectItem(stage.id)}
              aria-current={isActive ? 'step' : undefined}
              aria-label={
                `${stageLabel}` +
                (isActive ? ` — ${t('action.current')}` : isDone ? ` — ${t('action.done')}` : '') +
                (isOptional ? ` (${t('completion.optional')})` : '')
              }
              className={cn(
                'flex items-center text-left transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--wq-accent)]',
                isExpanded ? 'gap-3 px-3 py-2.5 rounded-lg' : 'justify-center mx-auto w-10 h-10 rounded-lg my-0.5',
                isActive
                  ? 'bg-[var(--wq-accent)]/18 text-white'
                  : isDone
                  ? 'text-white/55 hover:bg-white/5 hover:text-white/75'
                  : 'text-white/22 hover:bg-white/4 hover:text-white/45'
              )}
            >
              {/* Number / check dot */}
              <span
                aria-hidden="true"
                className={cn(
                  'shrink-0 flex items-center justify-center rounded-full font-bold transition-all duration-200',
                  isExpanded ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-[10px]',
                  isActive
                    ? 'bg-[var(--wq-accent)] text-white shadow-[0_0_8px_var(--wq-accent-glow)]'
                    : isDone
                    ? 'bg-[var(--wq-accent)]/18 text-[var(--wq-accent)]'
                    : isOptional
                    ? 'bg-[var(--wq-gold-muted)] border border-[var(--wq-gold)]/20 text-[var(--wq-gold)]/50'
                    : 'bg-white/8 text-white/28'
                )}
              >
                {isDone ? <Check size={9} strokeWidth={3} /> : String(index + 1).padStart(2, '00')}
              </span>

              {/* Labels */}
              {isExpanded && (
                <span className="flex flex-col min-w-0 flex-1">
                  <span className={cn('text-xs font-semibold leading-tight truncate', isActive ? 'text-white' : isDone ? 'text-white/55' : 'text-white/25')}>
                    {stageLabel}
                  </span>
                  <span className="text-[10px] leading-tight mt-0.5">
                    {isActive && !isOptional && <span className="text-[var(--wq-accent)] font-medium">{t('action.current')}</span>}
                    {isDone && !isActive && <span className="text-[var(--wq-accent)]">{t('action.done')}</span>}
                    {isOptional && !isActive && !isDone && <span className="text-[var(--wq-gold)]/50">({t('completion.optional')})</span>}
                    {isOptional && isActive && <span className="text-[var(--wq-accent)] font-medium">{t('action.current')}</span>}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Progress (expanded) ──────────────────────────────────────── */}
      {isExpanded && (
        <div className="shrink-0 border-t border-[var(--wq-shell-border)] px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[var(--wq-shell-label)] uppercase tracking-wider select-none">
              {t('nav.progress')}
            </span>
            <span className="text-[10px] text-white/45 font-medium tabular-nums">
              {coreCompleted} / {CORE_STAGE_IDS.length}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={coreCompleted}
            aria-valuemin={0}
            aria-valuemax={CORE_STAGE_IDS.length}
            aria-label={t('completion.progress', { n: coreCompleted })}
            className="h-1 rounded-full bg-white/8 overflow-hidden"
          >
            <div
              className="h-full rounded-full bg-[var(--wq-accent)] transition-all duration-500 ease-out motion-reduce:transition-none"
              style={{ width: `${(coreCompleted / CORE_STAGE_IDS.length) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-[var(--wq-shell-label)] leading-snug">
            {t('completion.progress', { n: coreCompleted })}
          </p>
        </div>
      )}
    </aside>
  );
}
