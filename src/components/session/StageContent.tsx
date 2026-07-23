'use client';
// =============================================================================
// StageContent — renders Overview OR the active stage + Prev/Next navigation
// All props are controlled from SessionLayout.
// Uses CSS variables for full theme-awareness. i18n for all text.
// =============================================================================

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Layers, FlaskConical } from 'lucide-react';
import type { LearningSession, LearningStage, StageId } from '@/types/learning-session';
import type { NavItem } from './SessionSidebar';
import type { CompletionState } from '@/lib/completion-rules';
import { useTranslation, type MessageKey } from '@/lib/i18n';
import { CORE_STAGE_IDS } from '@/lib/completion-rules';
import ResourceCard from './ResourceCard';
import PromptBlock from './PromptBlock';
import EmbeddedDeck from './EmbeddedDeck';
import ArtifactPanel from './ArtifactPanel';
import PublicationPathway from './PublicationPathway';
import StageCompletionPanel from './StageCompletionPanel';

// ── Status badge styles ────────────────────────────────────────────────────────

const STATUS_STYLES = {
  prototype: 'bg-amber-500/12 text-amber-700 border border-amber-400/30',
  active:    'bg-[var(--wq-accent)]/12 text-[var(--wq-accent)] border border-[var(--wq-accent)]/25',
  archived:  'bg-[var(--wq-border)] text-[var(--wq-text-muted)] border border-[var(--wq-border)]',
};
const STATUS_LABELS = {
  prototype: '⚗ Prototype',
  active:    '● Active Session',
  archived:  '○ Archived',
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  session:       LearningSession;
  activeItem:    NavItem;
  completionState: CompletionState;
  completedStages: Set<StageId>;
  publishState:  'none' | 'drafting' | 'submitted';
  onPublishStateChange: (s: 'none' | 'drafting' | 'submitted') => void;

  // Lifted answer state
  prepareAnswers:             string[];
  onPrepareAnswerChange:      (i: number, v: string) => void;
  prepareReadingAcknowledged: boolean;
  onPrepareReadingAcknowledge:(v: boolean) => void;
  exploreConfirmed:           boolean;
  onExploreConfirm:           () => void;
  experimentConfirmed:        boolean;
  onExperimentConfirm:        () => void;
  experimentUrl:              string;
  onExperimentUrlChange:      (url: string) => void;
  interpretAnswers:           string[];
  onInterpretAnswerChange:    (i: number, v: string) => void;
  buildConfirmed:             boolean;
  onBuildConfirm:             () => void;
  reflectAnswers:             string[];
  onReflectAnswerChange:      (i: number, v: string) => void;

  // Completion
  onStageComplete:     (id: StageId) => void;
  onUndoStageComplete: (id: StageId) => void;

  // Navigation
  hasPrev: boolean;
  hasNext: boolean;
  onPrev:  () => void;
  onNext:  () => void;
}

const ALL_NAV_ITEMS: NavItem[] = ['overview', 'prepare', 'explore', 'experiment', 'interpret', 'build', 'reflect', 'publish'];

// ── Main component ────────────────────────────────────────────────────────────

export default function StageContent({
  session, activeItem,
  completionState, completedStages, publishState, onPublishStateChange,
  prepareAnswers, onPrepareAnswerChange, prepareReadingAcknowledged, onPrepareReadingAcknowledge,
  exploreConfirmed, onExploreConfirm,
  experimentConfirmed, onExperimentConfirm, experimentUrl, onExperimentUrlChange,
  interpretAnswers, onInterpretAnswerChange,
  buildConfirmed, onBuildConfirm,
  reflectAnswers, onReflectAnswerChange,
  onStageComplete, onUndoStageComplete,
  hasPrev, hasNext, onPrev, onNext,
}: Props) {
  const { t } = useTranslation();

  const isOverview = activeItem === 'overview';
  const stage = useMemo(
    () => isOverview ? null : session.stages.find((s) => s.id === activeItem) ?? null,
    [session.stages, activeItem, isOverview]
  );
  const stageIndex = useMemo(
    () => isOverview ? -1 : session.stages.findIndex((s) => s.id === activeItem),
    [session.stages, activeItem, isOverview]
  );

  const isCompleted = !isOverview && completedStages.has(activeItem as StageId);

  return (
    <div className="min-h-full flex flex-col bg-[var(--wq-canvas)]">

      {/* ── Stage heading ─────────────────────────────────────────────── */}
      <div className="bg-[var(--wq-canvas-alt)] border-b border-[var(--wq-border)] px-6 sm:px-10 py-7 scroll-mt-[var(--wq-header-h)]">
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
              stageId="prepare" completionState={completionState}
              isCompleted={isCompleted} onComplete={onStageComplete} onUndoComplete={onUndoStageComplete}
              readingAcknowledged={prepareReadingAcknowledged} onReadingAcknowledge={onPrepareReadingAcknowledge}
            />
          </>
        )}
        {!isOverview && stage && activeItem === 'explore' && (
          <>
            <ExploreBody deckUrl={stage.resources?.find((r) => r.type === 'deck')?.url} deckTitle={stage.resources?.find((r) => r.type === 'deck')?.title ?? 'Session 01 Teaching Deck'} />
            <StageCompletionPanel stageId="explore" completionState={completionState} isCompleted={isCompleted} onComplete={onStageComplete} onUndoComplete={onUndoStageComplete} exploreConfirmed={exploreConfirmed} onExploreConfirm={onExploreConfirm} />
          </>
        )}
        {!isOverview && stage && activeItem === 'experiment' && (
          <>
            <ExperimentBody stage={stage} />
            <StageCompletionPanel stageId="experiment" completionState={completionState} isCompleted={isCompleted} onComplete={onStageComplete} onUndoComplete={onUndoStageComplete} experimentUrl={experimentUrl} onExperimentUrlChange={onExperimentUrlChange} buildConfirmed={experimentConfirmed} onBuildConfirm={onExperimentConfirm} />
          </>
        )}
        {!isOverview && stage && activeItem === 'interpret' && (
          <>
            <PromptSection title={t('stage.interpret')} stage={stage} answers={interpretAnswers} onAnswerChange={onInterpretAnswerChange} />
            <StageCompletionPanel stageId="interpret" completionState={completionState} isCompleted={isCompleted} onComplete={onStageComplete} onUndoComplete={onUndoStageComplete} />
          </>
        )}
        {!isOverview && stage && activeItem === 'build' && (
          <>
            <ArtifactPanel />
            <StageCompletionPanel stageId="build" completionState={completionState} isCompleted={isCompleted} onComplete={onStageComplete} onUndoComplete={onUndoStageComplete} buildConfirmed={buildConfirmed} onBuildConfirm={onBuildConfirm} />
          </>
        )}
        {!isOverview && stage && activeItem === 'reflect' && (
          <>
            <PromptSection title={t('stage.reflect')} stage={stage} answers={reflectAnswers} onAnswerChange={onReflectAnswerChange} />
            <StageCompletionPanel stageId="reflect" completionState={completionState} isCompleted={isCompleted} onComplete={onStageComplete} onUndoComplete={onUndoStageComplete} />
          </>
        )}
        {!isOverview && stage && activeItem === 'publish' && (
          <PublishBody publishState={publishState} onStateChange={onPublishStateChange} t={t} />
        )}
      </div>

      {/* ── Previous / Next ───────────────────────────────────────────── */}
      <div className="shrink-0 bg-[var(--wq-canvas-alt)] border-t border-[var(--wq-border)] px-6 sm:px-10 py-5 flex items-center gap-4">
        <button onClick={onPrev} disabled={!hasPrev} aria-label={t('action.previous')}
          className={['inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-[var(--wq-border)] text-[var(--wq-text)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]', hasPrev ? 'hover:border-[var(--wq-border-hover)] hover:bg-[var(--wq-border)] cursor-pointer' : 'opacity-30 cursor-not-allowed'].join(' ')}>
          <ChevronLeft size={15} aria-hidden="true" />
          {t('action.previous')}
        </button>

        {/* Progress dots */}
        <div className="flex-1 flex items-center justify-center gap-1.5" aria-hidden="true">
          {ALL_NAV_ITEMS.map((item) => (
            <span key={item} className={['rounded-full transition-all duration-300 motion-reduce:transition-none', item === activeItem ? 'w-5 h-1.5 bg-[var(--wq-accent)]' : 'w-1.5 h-1.5 bg-[var(--wq-border)]'].join(' ')} />
          ))}
        </div>

        <button onClick={onNext} disabled={!hasNext} aria-label={t('action.next')}
          className={['inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--wq-accent)] text-white shadow-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--wq-canvas-alt)]', hasNext ? 'hover:bg-[var(--wq-accent-hover)] cursor-pointer' : 'opacity-30 cursor-not-allowed'].join(' ')}>
          {activeItem === 'overview' ? t('action.start') : t('action.next')}
          <ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ── Stage body components ─────────────────────────────────────────────────────

function OverviewBody({ session, t }: { session: LearningSession; t: (k: MessageKey, v?: Record<string, string | number>) => string }) {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h3 className="text-2xl sm:text-3xl font-bold text-[var(--wq-text)] mb-4 leading-tight">{session.title}</h3>
        <p className="text-base text-[var(--wq-text-muted)] leading-relaxed">{session.description}</p>
      </div>
      <div className="flex items-start gap-3 bg-[var(--wq-shell)] rounded-xl px-5 py-4">
        <span className="text-[var(--wq-gold)] text-lg mt-0.5 shrink-0">⊙</span>
        <div>
          <p className="text-xs font-semibold text-[var(--wq-gold)] uppercase tracking-wider mb-1.5">Central Question</p>
          <p className="text-sm text-white/80 italic leading-relaxed">&ldquo;{session.centralQuestion}&rdquo;</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${STATUS_STYLES[session.status]}`}>{STATUS_LABELS[session.status]}</span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--wq-border)] text-[var(--wq-text)] border border-[var(--wq-border)]">
          <Clock size={12} aria-hidden="true" />{session.estimatedTime}
        </span>
        {session.outputBadges.map((badge) => (
          <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--wq-accent)]/10 text-[var(--wq-accent)] border border-[var(--wq-accent)]/20">
            <Layers size={11} aria-hidden="true" />{badge}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--wq-border)] text-[var(--wq-text-muted)] border border-[var(--wq-border)] ml-auto">
          <FlaskConical size={11} aria-hidden="true" />{session.stages.length} stages
        </span>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-[var(--wq-text-muted)] uppercase tracking-wider mb-4">Learning Path</h4>
        <ol className="space-y-2" aria-label="Session stages">
          {session.stages.map((stage, index) => (
            <li key={stage.id} className="flex items-start gap-3">
              <span aria-hidden="true" className="shrink-0 w-6 h-6 rounded-full bg-[var(--wq-shell)] text-[var(--wq-shell-text)] text-[10px] font-bold flex items-center justify-center mt-0.5">{String(index + 1).padStart(2, '0')}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--wq-text)]">{stage.title}</p>
                <p className="text-xs text-[var(--wq-text-muted)] leading-relaxed mt-0.5">{stage.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div aria-hidden="true" className="w-10 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, var(--wq-gold), #E0C35C)' }} />
      <p className="text-xs text-[var(--wq-text-muted)] leading-relaxed">
        Click <strong className="text-[var(--wq-text)] font-semibold">Start</strong> below or select a stage in the sidebar to begin.
      </p>
    </div>
  );
}

function PrepareBody({ stage, answers, onAnswerChange }: { stage: LearningStage; answers: string[]; onAnswerChange: (i: number, v: string) => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl">
      <div>
        <h3 className="text-xs font-semibold text-[var(--wq-gold)]/80 uppercase tracking-wider mb-4">Reading</h3>
        <div className="grid gap-3">{stage.resources?.map((r) => <ResourceCard key={r.id} resource={r} />)}</div>
      </div>
      <div>
        <PromptBlock prompts={stage.prompts ?? []} title="Pre-session Questions" withTextarea answers={answers} onAnswerChange={onAnswerChange} />
      </div>
    </div>
  );
}

function ExploreBody({ deckUrl, deckTitle }: { deckUrl: string | undefined; deckTitle: string }) {
  return (
    <div className="max-w-5xl">
      <EmbeddedDeck src={deckUrl} title={deckTitle} />
      <p className="mt-4 text-xs text-[var(--wq-text-muted)] leading-relaxed">
        Place the HTML file at <code className="bg-[var(--wq-border)] px-1 py-0.5 rounded font-mono">/public/courses/finance-data-ai/session-01/deck.html</code> to activate the viewer.
      </p>
    </div>
  );
}

function ExperimentBody({ stage }: { stage: LearningStage }) {
  return (
    <div className="max-w-5xl">
      <div className="flex items-start gap-3 bg-[var(--wq-gold-muted)] border border-[var(--wq-gold)]/20 rounded-xl px-5 py-4 mb-8">
        <span className="text-[var(--wq-gold)] text-lg mt-0.5 shrink-0" aria-hidden="true">⚗</span>
        <div>
          <p className="text-xs font-semibold text-[var(--wq-gold)] uppercase tracking-wider mb-1">Experiment 1</p>
          <p className="text-sm text-[var(--wq-text-muted)] leading-relaxed">Naive benchmark vs logistic regression for market-stress classification.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{stage.resources?.map((r) => <ResourceCard key={r.id} resource={r} />)}</div>
      <p className="mt-6 text-xs text-[var(--wq-text-muted)] border-t border-[var(--wq-border)] pt-5 leading-relaxed max-w-2xl">Python execution stays in Colab or your local environment. Workspace Q launches the notebook but does not run code directly.</p>
    </div>
  );
}

function PromptSection({ stage, title, answers, onAnswerChange }: { stage: LearningStage; title: string; answers: string[]; onAnswerChange: (i: number, v: string) => void }) {
  return (
    <div className="max-w-3xl">
      <PromptBlock prompts={stage.prompts ?? []} title={title} withTextarea answers={answers} onAnswerChange={onAnswerChange} />
    </div>
  );
}

function PublishBody({ publishState, onStateChange, t }: { publishState: 'none' | 'drafting' | 'submitted'; onStateChange: (s: 'none' | 'drafting' | 'submitted') => void; t: (k: MessageKey) => string }) {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start gap-3 bg-[var(--wq-gold-muted)] border border-[var(--wq-gold)]/20 rounded-xl px-5 py-4">
        <span className="text-[var(--wq-gold)] text-base shrink-0 mt-0.5" aria-hidden="true">★</span>
        <p className="text-sm text-[var(--wq-text-muted)] leading-relaxed">{t('completion.optionalPublish')}</p>
      </div>
      <PublicationPathway />
      {/* Publish state control */}
      <div className="flex flex-wrap gap-3 mt-4">
        {publishState === 'none' && (
          <button onClick={() => onStateChange('drafting')} className="px-4 py-2.5 rounded-lg bg-[var(--wq-accent)] text-white text-sm font-semibold hover:bg-[var(--wq-accent-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]">
            {t('completion.startDraft')}
          </button>
        )}
        {publishState === 'drafting' && (
          <>
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--wq-accent)]/12 text-[var(--wq-accent)] border border-[var(--wq-accent)]/20">{t('completion.draftStatus')}</span>
            <button onClick={() => onStateChange('submitted')} className="px-4 py-2.5 rounded-lg bg-[var(--wq-gold)] text-white text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-gold)]">
              {t('completion.confirmPublish')}
            </button>
          </>
        )}
        {publishState === 'submitted' && (
          <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--wq-gold-muted)] text-[var(--wq-gold)] border border-[var(--wq-gold)]/20">✓ {t('completion.submittedStatus')}</span>
        )}
      </div>
    </div>
  );
}
