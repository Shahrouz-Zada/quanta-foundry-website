'use client';
// =============================================================================
// StageCompletionPanel — per-stage requirements checklist + completion action
// Renders at the bottom of each stage body.
// Completion button only enables when ALL requirements in COMPLETION_RULES
// are satisfied AND the learner clicks it intentionally.
// Opening a stage never causes completion — that is enforced here.
// =============================================================================

import { Check, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation, type MessageKey } from '@/lib/i18n';
import {
  COMPLETION_RULES,
  type CompletionState,
  type StageCompletionRule,
} from '@/lib/completion-rules';
import type { StageId } from '@/types/learning-session';

interface Props {
  stageId:         StageId;
  completionState: CompletionState;
  isCompleted:     boolean;
  onComplete:      (stageId: StageId) => void;
  onUndoComplete:  (stageId: StageId) => void;

  // Explore-specific
  exploreConfirmed?: boolean;
  onExploreConfirm?: () => void;

  // Experiment-specific
  experimentUrl?:         string;
  onExperimentUrlChange?: (url: string) => void;
  onExperimentConfirm?:   () => void;

  // Build-specific
  buildConfirmed?: boolean;
  onBuildConfirm?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StageCompletionPanel({
  stageId,
  completionState,
  isCompleted,
  onComplete,
  onUndoComplete,
  exploreConfirmed = false,
  onExploreConfirm,
  experimentUrl = '',
  onExperimentUrlChange,
  onExperimentConfirm,
  buildConfirmed = false,
  onBuildConfirm,
}: Props) {
  const { t } = useTranslation();
  const rule  = COMPLETION_RULES[stageId] as StageCompletionRule | undefined;

  // Publish has its own separate UI — this panel is not rendered for it.
  // Note: Unlike progress bars/navigation, this explicit 'publish' check
  // remains hardcoded because it's a routing/layout decision (PublishBody
  // completely replaces this panel with a 4-phase review UI), not a data
  // modelling one.
  if (stageId === 'publish' || !rule) return null;

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
            <CheckCircle2
              size={18}
              className="text-[var(--wq-accent)] shrink-0"
              aria-hidden="true"
            />
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
                    <span className="sr-only">{met ? ' — met' : ' — not yet met'}</span>
                  </span>
                </li>
              );
            })}
          </ul>

          {/* ── Stage-specific interaction extras ─────────────────────── */}

          {/* EXPLORE — confirm button (disabled when deck unavailable) */}
          {stageId === 'explore' && onExploreConfirm && (
            <div className="mb-4">
              {!completionState.deckAvailable ? (
                // Deck not deployed — show unavailable notice
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-[var(--wq-border)] bg-[var(--wq-canvas-alt)]">
                  <Lock size={13} className="text-[var(--wq-text-muted)] shrink-0" aria-hidden="true" />
                  <span className="text-sm text-[var(--wq-text-muted)]">
                    {t('req.explore.deckUnavailable')}
                  </span>
                </div>
              ) : !exploreConfirmed ? (
                // Deck available — show confirm button
                <button
                  onClick={onExploreConfirm}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-150',
                    'border-[var(--wq-border-hover)] text-[var(--wq-text)]',
                    'hover:bg-[var(--wq-accent)]/8 hover:border-[var(--wq-accent)]/30',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]',
                  )}
                >
                  {t('req.explore.reviewBtn')}
                </button>
              ) : (
                // Confirmed
                <span className="text-sm text-[var(--wq-accent)] font-medium">
                  ✓ {t('req.explore.reviewBtn')}
                </span>
              )}
            </div>
          )}

          {/* EXPERIMENT — URL input + confirm (disabled when no resources) */}
          {stageId === 'experiment' && (
            <div className="mb-4 space-y-3">
              {!completionState.experimentResourceAvailable ? (
                // No resources available — disable everything
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg border border-[var(--wq-border)] bg-[var(--wq-canvas-alt)]">
                  <Lock size={13} className="text-[var(--wq-text-muted)] shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-sm text-[var(--wq-text-muted)] leading-relaxed">
                    {t('req.experiment.unavailable')}
                  </span>
                </div>
              ) : (
                <>
                  {/* Optional notebook URL */}
                  {onExperimentUrlChange && (
                    <input
                      type="url"
                      value={experimentUrl}
                      onChange={(e) => onExperimentUrlChange(e.target.value)}
                      placeholder={t('req.experiment.urlHint')}
                      className={cn(
                        'w-full rounded-lg px-3 py-2 text-sm border',
                        'bg-[var(--wq-card)] text-[var(--wq-text)]',
                        'border-[var(--wq-border)] placeholder:text-[var(--wq-text-subtle)]',
                        'focus:outline-none focus:ring-2 focus:ring-[var(--wq-accent)] focus:border-transparent',
                      )}
                      aria-label={t('req.experiment.urlHint')}
                    />
                  )}
                  {/* Confirm experiment completed */}
                  {onExperimentConfirm && !completionState.experimentConfirmed && (
                    <button
                      onClick={onExperimentConfirm}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-150',
                        'border-[var(--wq-border-hover)] text-[var(--wq-text)]',
                        'hover:bg-[var(--wq-accent)]/8 hover:border-[var(--wq-accent)]/30',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]',
                      )}
                    >
                      {t('req.experiment.confirm')}
                    </button>
                  )}
                  {completionState.experimentConfirmed && (
                    <span className="text-sm text-[var(--wq-accent)] font-medium">
                      ✓ {t('req.experiment.confirm')}
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          {/* BUILD — review confirmation */}
          {stageId === 'build' && onBuildConfirm && (
            <div className="mb-4">
              {!buildConfirmed ? (
                <button
                  onClick={onBuildConfirm}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-150',
                    'border-[var(--wq-border-hover)] text-[var(--wq-text)]',
                    'hover:bg-[var(--wq-accent)]/8 hover:border-[var(--wq-accent)]/30',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]',
                  )}
                >
                  {t('req.build.reviewBtn')}
                </button>
              ) : (
                <span className="text-sm text-[var(--wq-accent)] font-medium">
                  ✓ {t('req.build.reviewBtn')}
                </span>
              )}
            </div>
          )}

          {/* ── Mark as Complete button ───────────────────────────────── */}
          <button
            onClick={() => onComplete(stageId)}
            disabled={!canComplete}
            aria-disabled={!canComplete}
            className={cn(
              'w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)] focus-visible:ring-offset-2',
              'focus-visible:ring-offset-[var(--wq-card-surface)]',
              canComplete
                ? 'bg-[var(--wq-accent)] text-white hover:bg-[var(--wq-accent-hover)] shadow-sm'
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
