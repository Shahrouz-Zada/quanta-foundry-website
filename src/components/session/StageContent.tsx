'use client';
// =============================================================================
// StageContent — renders Overview OR the active stage body + Prev/Next footer
// All state is controlled from SessionLayout.
// =============================================================================

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Layers, FlaskConical } from 'lucide-react';
import type { LearningSession, LearningStage, StageId } from '@/types/learning-session';
import type { NavItem } from './SessionSidebar';
import type { CompletionState } from '@/lib/completion-rules';
import type { PublishState } from './SessionLayout';
import { useTranslation, type MessageKey } from '@/lib/i18n';
import { CORE_STAGE_IDS } from '@/lib/completion-rules';
import ResourceCard from './ResourceCard';
import PromptBlock from './PromptBlock';
import EmbeddedDeck from './EmbeddedDeck';
import ArtifactPanel from './ArtifactPanel';
import PublicationPathway from './PublicationPathway';
import StageCompletionPanel from './StageCompletionPanel';

// ── Status badge styles ────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  prototype: 'bg-amber-500/12 text-amber-700 border border-amber-400/30',
  active:    'bg-[var(--wq-accent)]/12 text-[var(--wq-accent)] border border-[var(--wq-accent)]/25',
  archived:  'bg-[var(--wq-border)] text-[var(--wq-text-muted)] border border-[var(--wq-border)]',
};
const STATUS_ICONS: Record<string, string> = {
  prototype: '⚗',
  active:    '●',
  archived:  '○',
};

// ── ALL nav items in order ────────────────────────────────────────────────────

const ALL_NAV_ITEMS: NavItem[] = [
  'overview', 'prepare', 'explore', 'experiment', 'interpret', 'build', 'reflect', 'publish',
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  session:         LearningSession;
  activeItem:      NavItem;
  completionState: CompletionState;
  completedStages: Set<StageId>;
  publishState:    PublishState;
  onPublishStateChange: (s: PublishState) => void;

  // Lifted answer state
  prepareAnswers:          string[];
  onPrepareAnswerChange:   (i: number, v: string) => void;
  exploreConfirmed:        boolean;
  onExploreConfirm:        () => void;
  experimentConfirmed:     boolean;
  onExperimentConfirm:     () => void;
  experimentUrl:           string;
  onExperimentUrlChange:   (url: string) => void;
  interpretAnswers:        string[];
  onInterpretAnswerChange: (i: number, v: string) => void;
  buildConfirmed:          boolean;
  onBuildConfirm:          () => void;
  reflectAnswers:          string[];
  onReflectAnswerChange:   (i: number, v: string) => void;

  // Completion
  onStageComplete:     (id: StageId) => void;
  onUndoStageComplete: (id: StageId) => void;

  // Navigation (with stage labels)
  hasPrev:         boolean;
  hasNext:         boolean;
  prevStageLabel:  string;
  nextStageLabel:  string;
  isOverview:      boolean;
  isLastStage:     boolean;   // When true: hide Next button entirely
  onPrev:          () => void;
  onNext:          () => void;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StageContent({
  session, activeItem,
  completionState, completedStages, publishState, onPublishStateChange,
  prepareAnswers, onPrepareAnswerChange,
  exploreConfirmed, onExploreConfirm,
  experimentConfirmed, onExperimentConfirm,
  experimentUrl, onExperimentUrlChange,
  interpretAnswers, onInterpretAnswerChange,
  buildConfirmed, onBuildConfirm,
  reflectAnswers, onReflectAnswerChange,
  onStageComplete, onUndoStageComplete,
  hasPrev, hasNext, prevStageLabel, nextStageLabel, isOverview, isLastStage,
  onPrev, onNext,
}: Props) {
  const { t } = useTranslation();

  const stage = useMemo(
    () => isOverview ? null : session.stages.find((s) => s.id === activeItem) ?? null,
    [session.stages, activeItem, isOverview]
  );
  const stageIndex = useMemo(
    () => isOverview ? -1 : session.stages.findIndex((s) => s.id === activeItem),
    [session.stages, activeItem, isOverview]
  );

  const isCompleted = !isOverview && completedStages.has(activeItem as StageId);

  // ── Prev / Next button labels ─────────────────────────────────────────────
  const prevBtnLabel = prevStageLabel
    ? `${t('action.previous')}: ${prevStageLabel}`
    : t('action.previous');

  const nextBtnLabel = isOverview && nextStageLabel
    ? `${t('action.begin')} ${nextStageLabel}`
    : nextStageLabel
    ? `${t('action.next')}: ${nextStageLabel}`
    : t('action.next');

  return (
    <div className="min-h-full flex flex-col bg-[var(--wq-canvas)]">

      {/* ── Stage heading ─────────────────────────────────────────────── */}
      <div className="bg-[var(--wq-canvas-alt)] border-b border-[var(--wq-border)] px-6 sm:px-10 py-7">
        {isOverview ? (
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="text-[var(--wq-accent)] text-lg">≡</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--wq-text)]">{t('stage.overview')}</h2>
          </div>
        ) : stage ? (
          <div className="flex items-start gap-4 max-w-3xl">
            <span aria-hidden="true" className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--wq-shell)] text-[var(--wq-shell-text)] text-sm font-bold mt-0.5">
              {String(stageIndex + 1).padStart(2, '0')}
            </span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--wq-text)] mb-1.5 leading-tight">
                {t(`stage.${stage.id}` as MessageKey)}
              </h2>
              <p className="text-[var(--wq-text-muted)] text-base leading-relaxed">{stage.description}</p>
            </div>
          </div>
        ) : null}
        {!isOverview && (
          <div aria-hidden="true" className="w-8 h-0.5 rounded-full mt-6 ml-14" style={{ background: 'linear-gradient(90deg, var(--wq-gold), #E0C35C)' }} />
        )}
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="flex-1 px-6 sm:px-10 py-10">
        {isOverview && <OverviewBody session={session} t={t} />}

        {!isOverview && stage && activeItem === 'prepare' && (
          <>
            <PrepareBody stage={stage} answers={prepareAnswers} onAnswerChange={onPrepareAnswerChange} />
            <StageCompletionPanel
              stageId="prepare"
              completionState={completionState}
              isCompleted={isCompleted}
              onComplete={onStageComplete}
              onUndoComplete={onUndoStageComplete}
            />
          </>
        )}

        {!isOverview && stage && activeItem === 'explore' && (
          <>
            <ExploreBody
              deckUrl={stage.resources?.find((r) => r.type === 'deck')?.url}
              deckTitle={stage.resources?.find((r) => r.type === 'deck')?.title ?? 'Session 01 Teaching Deck'}
              deckAvailable={completionState.deckAvailable}
            />
            <StageCompletionPanel
              stageId="explore"
              completionState={completionState}
              isCompleted={isCompleted}
              onComplete={onStageComplete}
              onUndoComplete={onUndoStageComplete}
              exploreConfirmed={exploreConfirmed}
              onExploreConfirm={onExploreConfirm}
            />
          </>
        )}

        {!isOverview && stage && activeItem === 'experiment' && (
          <>
            <ExperimentBody stage={stage} resourceAvailable={completionState.experimentResourceAvailable} />
            <StageCompletionPanel
              stageId="experiment"
              completionState={completionState}
              isCompleted={isCompleted}
              onComplete={onStageComplete}
              onUndoComplete={onUndoStageComplete}
              experimentUrl={experimentUrl}
              onExperimentUrlChange={onExperimentUrlChange}
              onExperimentConfirm={onExperimentConfirm}
            />
          </>
        )}

        {!isOverview && stage && activeItem === 'interpret' && (
          <>
            <PromptSection title={t('stage.interpret')} stage={stage} answers={interpretAnswers} onAnswerChange={onInterpretAnswerChange} />
            <StageCompletionPanel
              stageId="interpret"
              completionState={completionState}
              isCompleted={isCompleted}
              onComplete={onStageComplete}
              onUndoComplete={onUndoStageComplete}
            />
          </>
        )}

        {!isOverview && stage && activeItem === 'build' && (
          <>
            <ArtifactPanel />
            <StageCompletionPanel
              stageId="build"
              completionState={completionState}
              isCompleted={isCompleted}
              onComplete={onStageComplete}
              onUndoComplete={onUndoStageComplete}
              buildConfirmed={buildConfirmed}
              onBuildConfirm={onBuildConfirm}
            />
          </>
        )}

        {!isOverview && stage && activeItem === 'reflect' && (
          <>
            <PromptSection title={t('stage.reflect')} stage={stage} answers={reflectAnswers} onAnswerChange={onReflectAnswerChange} />
            <StageCompletionPanel
              stageId="reflect"
              completionState={completionState}
              isCompleted={isCompleted}
              onComplete={onStageComplete}
              onUndoComplete={onUndoStageComplete}
            />
          </>
        )}

        {!isOverview && stage && activeItem === 'publish' && (
          <PublishBody publishState={publishState} onStateChange={onPublishStateChange} t={t} />
        )}
      </div>

      {/* ── Previous / Next footer ────────────────────────────────────── */}
      <div className="shrink-0 bg-[var(--wq-canvas-alt)] border-t border-[var(--wq-border)] px-6 sm:px-10 py-5">
        <div className="flex items-center gap-4">

          {/* Previous */}
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label={prevBtnLabel}
            className={[
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-[var(--wq-border)] text-[var(--wq-text)] transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]',
              hasPrev
                ? 'hover:border-[var(--wq-border-hover)] hover:bg-[var(--wq-border)] cursor-pointer'
                : 'opacity-30 cursor-not-allowed',
            ].join(' ')}
          >
            <ChevronLeft size={15} aria-hidden="true" />
            <span className="flex flex-col items-start leading-none">
              <span className="text-[10px] text-[var(--wq-text-muted)] font-normal hidden sm:block">
                {t('action.previous')}
              </span>
              <span className={prevStageLabel ? 'font-semibold' : ''}>
                {prevStageLabel || t('action.previous')}
              </span>
            </span>
          </button>

          {/* Progress dots */}
          <div className="flex-1 flex items-center justify-center gap-1.5" aria-hidden="true">
            {ALL_NAV_ITEMS.map((item) => (
              <span
                key={item}
                className={[
                  'rounded-full transition-all duration-300 motion-reduce:transition-none',
                  item === activeItem
                    ? 'w-5 h-1.5 bg-[var(--wq-accent)]'
                    : 'w-1.5 h-1.5 bg-[var(--wq-border)]',
                ].join(' ')}
              />
            ))}
          </div>

          {/* Next — hidden on last stage (Publish) */}
          {!isLastStage && (
            <button
              onClick={onNext}
              disabled={!hasNext}
              aria-label={nextBtnLabel}
              className={[
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150',
                'bg-[var(--wq-accent)] text-white shadow-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)] focus-visible:ring-offset-2',
                'focus-visible:ring-offset-[var(--wq-canvas-alt)]',
                hasNext
                  ? 'hover:bg-[var(--wq-accent-hover)] cursor-pointer'
                  : 'opacity-30 cursor-not-allowed',
              ].join(' ')}
            >
              <span className="flex flex-col items-end leading-none">
                <span className="text-[10px] text-white/70 font-normal hidden sm:block">
                  {isOverview ? t('action.begin') : t('action.next')}
                </span>
                <span className="font-semibold">{nextStageLabel || (isOverview ? t('action.begin') : t('action.next'))}</span>
              </span>
              <ChevronRight size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Stage body sub-components ─────────────────────────────────────────────────

type TFn = (key: MessageKey, v?: Record<string, string | number>) => string;

function OverviewBody({ session, t }: { session: LearningSession; t: TFn }) {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h3 className="text-2xl sm:text-3xl font-bold text-[var(--wq-text)] mb-4 leading-tight">{session.title}</h3>
        <p className="text-base text-[var(--wq-text-muted)] leading-relaxed">{session.description}</p>
      </div>

      {/* Central question */}
      <div className="flex items-start gap-3 bg-[var(--wq-shell)] rounded-xl px-5 py-4">
        <span className="text-[var(--wq-gold)] text-lg mt-0.5 shrink-0" aria-hidden="true">⊙</span>
        <div>
          <p className="text-xs font-semibold text-[var(--wq-gold)] uppercase tracking-wider mb-1.5">Central Question</p>
          <p className="text-sm text-white/80 italic leading-relaxed">&ldquo;{session.centralQuestion}&rdquo;</p>
        </div>
      </div>

      {/* Course language indicator */}
      <p className="text-xs text-[var(--wq-text-muted)] flex items-center gap-1.5">
        <span aria-hidden="true">🌐</span>
        {t('overview.contentLanguage')}
      </p>

      {/* Metadata badges */}
      <div className="flex flex-wrap items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${STATUS_STYLES[session.status] ?? STATUS_STYLES.active}`}>
          {STATUS_ICONS[session.status] ?? '●'} {session.status}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--wq-border)] text-[var(--wq-text)] border border-[var(--wq-border)]">
          <Clock size={12} aria-hidden="true" />{session.estimatedTime}
        </span>
        {session.outputBadges.map((badge) => (
          <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--wq-accent)]/10 text-[var(--wq-accent)] border border-[var(--wq-accent)]/20">
            <Layers size={11} aria-hidden="true" />{badge}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--wq-border)] text-[var(--wq-text-muted)] border border-[var(--wq-border)] ml-auto">
          <FlaskConical size={11} aria-hidden="true" />{CORE_STAGE_IDS.length + 1} stages
        </span>
      </div>

      {/* Learning path list */}
      <div>
        <h4 className="text-xs font-semibold text-[var(--wq-text-muted)] uppercase tracking-wider mb-4">
          {t('nav.learningPath')}
        </h4>
        <ol className="space-y-2" aria-label="Session stages">
          {session.stages.map((stg, index) => (
            <li key={stg.id} className="flex items-start gap-3">
              <span aria-hidden="true" className="shrink-0 w-6 h-6 rounded-full bg-[var(--wq-shell)] text-[var(--wq-shell-text)] text-[10px] font-bold flex items-center justify-center mt-0.5">
                {String(index + 1).padStart(2, '00')}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--wq-text)]">{stg.title}</p>
                <p className="text-xs text-[var(--wq-text-muted)] leading-relaxed mt-0.5">{stg.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div aria-hidden="true" className="w-10 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, var(--wq-gold), #E0C35C)' }} />
      <p className="text-xs text-[var(--wq-text-muted)] leading-relaxed">
        Click <strong className="text-[var(--wq-text)] font-semibold">Begin</strong> below or select a stage in the sidebar to start.
      </p>
    </div>
  );
}

function PrepareBody({
  stage, answers, onAnswerChange,
}: { stage: LearningStage; answers: string[]; onAnswerChange: (i: number, v: string) => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl">
      <div>
        <h3 className="text-xs font-semibold text-[var(--wq-gold)]/80 uppercase tracking-wider mb-4">Reading</h3>
        <div className="grid gap-3">
          {stage.resources?.map((r) => <ResourceCard key={r.id} resource={r} />)}
        </div>
      </div>
      <div>
        <PromptBlock
          prompts={stage.prompts ?? []}
          title="Pre-session Questions"
          withTextarea
          answers={answers}
          onAnswerChange={onAnswerChange}
        />
      </div>
    </div>
  );
}

function ExploreBody({
  deckUrl, deckTitle, deckAvailable,
}: { deckUrl: string | undefined; deckTitle: string; deckAvailable: boolean }) {
  return (
    <div className="max-w-5xl">
      <EmbeddedDeck src={deckUrl} title={deckTitle} />
      {!deckAvailable && (
        <p className="mt-3 text-xs text-[var(--wq-text-muted)] leading-relaxed">
          Place the HTML file at{' '}
          <code className="bg-[var(--wq-border)] px-1 py-0.5 rounded font-mono">
            /public/courses/finance-data-ai/session-01/deck.html
          </code>{' '}
          to activate the viewer and enable stage completion.
        </p>
      )}
    </div>
  );
}

function ExperimentBody({
  stage, resourceAvailable,
}: { stage: LearningStage; resourceAvailable: boolean }) {
  return (
    <div className="max-w-5xl">
      <div className="flex items-start gap-3 bg-[var(--wq-gold-muted)] border border-[var(--wq-gold)]/20 rounded-xl px-5 py-4 mb-8">
        <span className="text-[var(--wq-gold)] text-lg mt-0.5 shrink-0" aria-hidden="true">⚗</span>
        <div>
          <p className="text-xs font-semibold text-[var(--wq-gold)] uppercase tracking-wider mb-1">Experiment 1</p>
          <p className="text-sm text-[var(--wq-text-muted)] leading-relaxed">
            Naive benchmark vs logistic regression for market-stress classification.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stage.resources?.map((r) => <ResourceCard key={r.id} resource={r} />)}
      </div>
      {!resourceAvailable && (
        <p className="mt-6 text-xs text-[var(--wq-text-muted)] border-t border-[var(--wq-border)] pt-5 leading-relaxed max-w-2xl">
          Experiment resources are coming soon. Stage completion will be enabled once at least one resource is available.
        </p>
      )}
    </div>
  );
}

function PromptSection({
  stage, title, answers, onAnswerChange,
}: { stage: LearningStage; title: string; answers: string[]; onAnswerChange: (i: number, v: string) => void }) {
  return (
    <div className="max-w-3xl">
      <PromptBlock
        prompts={stage.prompts ?? []}
        title={title}
        withTextarea
        answers={answers}
        onAnswerChange={onAnswerChange}
      />
    </div>
  );
}

function PublishBody({
  publishState, onStateChange, t,
}: { publishState: PublishState; onStateChange: (s: PublishState) => void; t: TFn }) {
  return (
    <div className="max-w-3xl space-y-6">
      {/* Optional notice */}
      <div className="flex items-start gap-3 bg-[var(--wq-gold-muted)] border border-[var(--wq-gold)]/20 rounded-xl px-5 py-4">
        <span className="text-[var(--wq-gold)] text-base shrink-0 mt-0.5" aria-hidden="true">★</span>
        <p className="text-sm text-[var(--wq-text-muted)] leading-relaxed">
          {t('completion.optionalPublish')}
        </p>
      </div>

      <PublicationPathway />

      {/* Publish state machine — 4 phases. Never affects core 6-stage count. */}
      <div className="flex flex-wrap gap-3 mt-4 items-center">
        {publishState === 'none' && (
          <button
            onClick={() => onStateChange('drafting')}
            className="px-4 py-2.5 rounded-lg bg-[var(--wq-accent)] text-white text-sm font-semibold hover:bg-[var(--wq-accent-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]"
          >
            {t('publish.startDraft')}
          </button>
        )}

        {publishState === 'drafting' && (
          <>
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--wq-accent)]/12 text-[var(--wq-accent)] border border-[var(--wq-accent)]/20">
              {t('publish.drafting')}
            </span>
            <button
              onClick={() => onStateChange('review-requested')}
              className="px-4 py-2.5 rounded-lg border border-[var(--wq-border-hover)] text-sm font-medium text-[var(--wq-text)] hover:bg-[var(--wq-accent)]/8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]"
            >
              {t('publish.requestReview')}
            </button>
          </>
        )}

        {publishState === 'review-requested' && (
          <>
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-400/25">
              {t('publish.reviewRequested')}
            </span>
            <button
              onClick={() => onStateChange('published')}
              className="px-4 py-2.5 rounded-lg bg-[var(--wq-gold)] text-white text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-gold)]"
            >
              {t('publish.published')}
            </button>
          </>
        )}

        {publishState === 'published' && (
          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--wq-gold-muted)] text-[var(--wq-gold)] border border-[var(--wq-gold)]/20">
            ★ {t('publish.published')}
          </span>
        )}
      </div>
    </div>
  );
}
