'use client';
// =============================================================================
// StageCompletionPanel — per-stage requirements checklist + completion action
// Renders at the bottom of each stage body.
// Shows requirements, enables the completion button when all are met,
// and displays a completed state after the learner confirms.
// =============================================================================

import { Check, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation, type MessageKey } from '@/lib/i18n';
import {
  COMPLETION_RULES,
  type CompletionState,
  type StageCompletionRule,
} from '@/lib/completion-rules';
import type { StageId } from '@/types/learning-session';

interface Props {
  stageId:          StageId;
  completionState:  CompletionState;
  isCompleted:      boolean;
  onComplete:       (stageId: StageId) => void;
  onUndoComplete:   (stageId: StageId) => void;

  // Experiment-specific extras
  experimentUrl?:         string;
  onExperimentUrlChange?: (url: string) => void;

  // Prepare-specific extras
  readingAcknowledged?:    boolean;
  onReadingAcknowledge?:  (v: boolean) => void;

  // Explore-specific
  exploreConfirmed?:       boolean;
  onExploreConfirm?:       () => void;

  // Build-specific
  buildConfirmed?:         boolean;
  onBuildConfirm?:         () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StageCompletionPanel({
  stageId,
  completionState,
  isCompleted,
  onComplete,
  onUndoComplete,
  experimentUrl = '',
  onExperimentUrlChange,
  readingAcknowledged = false,
  onReadingAcknowledge,
  exploreConfirmed = false,
  onExploreConfirm,
  buildConfirmed = false,
  onBuildConfirm,
}: Props) {
  const { t } = useTranslation();
  const rule  = COMPLETION_RULES[stageId] as StageCompletionRule | undefined;
  const isPublish = stageId === 'publish';

  // Publish has its own UI (separate optional tracking)
  if (isPublish) return null;
  if (!rule)     return null;

  const canComplete = rule.canComplete(completionState);
  const stageName   = t(`stage.${stageId}` as MessageKey);

  return (
    <div
      className={cn(
        'mt-8 rounded-xl border px-5 py-5',
        isCompleted
          ? 'border-[var(--wq-accent)]/25 bg-[var(--wq-accent)]/5'
          : 'border-[var(--wq-border)] bg-[var(--wq-card-surface)]'
      )}
    >
      {/* ── Completed state ───────────────────────────────────────────── */}
      {isCompleted ? (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-[var(--wq-accent)] shrink-0" aria-hidden="true" />
            <p className="text-sm font-semibold text-[var(--wq-text)]">
              {t('completion.completed', { stage: stageName })}
            </p>
          </div>
          <button
            onClick={() => onUndoComplete(stageId)}
            className={cn(
              'text-xs text-[var(--wq-text-muted)] underline underline-offset-2',
              'hover:text-[var(--wq-text)] transition-colors duration-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)] rounded'
            )}
          >
            {t('action.undo')}
          </button>
        </div>
      ) : (
        <>
          {/* ── Requirements list ─────────────────────────────────────── */}
          <p className="text-xs font-semibold text-[var(--wq-text-muted)] uppercase tracking-wider mb-3">
            {t('completion.requirements')}
          </p>

          <ul className="space-y-2 mb-5">
            {rule.requirements.map((req) => {
              const met = req.isMet(completionState);
              return (
                <li key={req.key} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5',
                      met
                        ? 'bg-[var(--wq-accent)] text-white'
                        : 'border border-[var(--wq-border)]'
                    )}
                  >
                    {met && <Check size={9} strokeWidth={3} />}
                  </span>
                  <span
                    className={cn(
                      'text-sm leading-snug',
                      met ? 'text-[var(--wq-text)]' : 'text-[var(--wq-text-muted)]'
                    )}
                  >
                    {t(req.key as MessageKey)}
                    {/* Screen-reader-only completion status */}
                    <span className="sr-only">{met ? ' — met' : ' — not yet met'}</span>
                  </span>
                </li>
              );
            })}
          </ul>

          {/* ── Stage-specific extras ─────────────────────────────────── */}

          {/* Prepare: reading acknowledgement checkbox */}
          {stageId === 'prepare' && onReadingAcknowledge && (
            <label className="flex items-center gap-2.5 mb-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={readingAcknowledged}
                onChange={(e) => onReadingAcknowledge(e.target.checked)}
                aria-label={t('req.prepare.reading')}
                className="w-4 h-4 rounded accent-[var(--wq-accent)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]"
              />
              <span className="text-sm text-[var(--wq-text-muted)] group-hover:text-[var(--wq-text)] transition-colors">
                {t('req.prepare.reading')}
              </span>
            </label>
          )}

          {/* Explore: manual confirm button */}
          {stageId === 'explore' && onExploreConfirm && (
            <button
              onClick={onExploreConfirm}
              disabled={exploreConfirmed}
              className={cn(
                'mb-4 px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]',
                exploreConfirmed
                  ? 'border-[var(--wq-accent)]/30 text-[var(--wq-accent)] bg-[var(--wq-accent)]/8 cursor-default'
                  : 'border-[var(--wq-border-hover)] text-[var(--wq-text)] hover:bg-[var(--wq-accent)]/8 hover:border-[var(--wq-accent)]/30'
              )}
            >
              {exploreConfirmed ? `✓ ${t('req.explore.manual')}` : t('req.explore.manual')}
            </button>
          )}

          {/* Experiment: notebook URL + confirm */}
          {stageId === 'experiment' && onExperimentUrlChange && onBuildConfirm && (
            <div className="mb-4 space-y-3">
              <input
                type="url"
                value={experimentUrl}
                onChange={(e) => onExperimentUrlChange(e.target.value)}
                placeholder={t('req.experiment.urlHint')}
                className={cn(
                  'w-full rounded-lg px-3 py-2 text-sm border bg-[var(--wq-card)] text-[var(--wq-text)]',
                  'border-[var(--wq-border)] placeholder:text-[var(--wq-text-subtle)]',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--wq-accent)] focus:border-transparent',
                )}
                aria-label={t('req.experiment.urlHint')}
              />
              {!experimentConfirmed(completionState) && (
                <button
                  onClick={() => {
                    // experimentConfirm is controlled by buildConfirm in the experiment context
                    onBuildConfirm();
                  }}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]',
                    'border-[var(--wq-border-hover)] text-[var(--wq-text)] hover:bg-[var(--wq-accent)]/8 hover:border-[var(--wq-accent)]/30'
                  )}
                >
                  {t('req.experiment.confirm')}
                </button>
              )}
            </div>
          )}

          {/* Build: confirmation */}
          {stageId === 'build' && onBuildConfirm && (
            <button
              onClick={onBuildConfirm}
              disabled={buildConfirmed}
              className={cn(
                'mb-4 px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]',
                buildConfirmed
                  ? 'border-[var(--wq-accent)]/30 text-[var(--wq-accent)] bg-[var(--wq-accent)]/8 cursor-default'
                  : 'border-[var(--wq-border-hover)] text-[var(--wq-text)] hover:bg-[var(--wq-accent)]/8 hover:border-[var(--wq-accent)]/30'
              )}
            >
              {buildConfirmed ? `✓ ${t('req.build.confirm')}` : t('req.build.confirm')}
            </button>
          )}

          {/* ── Complete button ───────────────────────────────────────── */}
          <button
            onClick={() => onComplete(stageId)}
            disabled={!canComplete}
            aria-disabled={!canComplete}
            className={cn(
              'w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)] focus-visible:ring-offset-2',
              'focus-visible:ring-offset-[var(--wq-card-surface)]',
              canComplete
                ? 'bg-[var(--wq-accent)] text-white hover:bg-[var(--wq-accent-hover)] shadow-sm hover:shadow-[0_0_12px_var(--wq-accent-glow)]'
                : 'bg-[var(--wq-border)] text-[var(--wq-text-subtle)] cursor-not-allowed'
            )}
          >
            {t('completion.markComplete', { stage: stageName })}
          </button>
        </>
      )}
    </div>
  );
}

// Helper (avoids prop confusion for experiment stage)
function experimentConfirmed(state: CompletionState) {
  return state.experimentConfirmed;
}
