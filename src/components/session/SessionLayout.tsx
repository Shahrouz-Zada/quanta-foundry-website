'use client';
// =============================================================================
// SessionLayout — Learning Sessions Prototype
// Orchestrates: active item, URL sync, completion state, sidebar, mobile
// drawer, lifted textarea answers, prev/next navigation, breadcrumb sync.
// =============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LearningSession, StageId } from '@/types/learning-session';
import type { NavItem } from './SessionSidebar';
import { useTranslation, type MessageKey } from '@/lib/i18n';
import { useBreadcrumb } from '@/lib/breadcrumb-context';
import { countCoreCompleted } from '@/lib/completion-rules';
import type { CompletionState } from '@/lib/completion-rules';
import SessionSidebar from './SessionSidebar';
import StageContent from './StageContent';
import { saveResponseAction, saveProgressAction, lockPredictionAction } from '../../app/workspace-q/actions';
import type { Progress, Response, LockState } from '@prisma/client';

// ── Constants ─────────────────────────────────────────────────────────────────

export type PublishState = 'none' | 'drafting' | 'review-requested' | 'published';

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { 
  session: LearningSession;
  offeringSessionId: string;
  initialProgress: Progress[];
  initialResponses: Response[];
}

export default function SessionLayout({ session, offeringSessionId, initialProgress, initialResponses }: Props) {
  const { t } = useTranslation();
  const { setBreadcrumb } = useBreadcrumb();

  // ── Active navigation item ────────────────────────────────────────────────
  const [activeItem, setActiveItem] = useState<NavItem>('overview');

  // ── Completed stages (checkmark = truly completed, not just visited) ──────
  const [completedStages, setCompletedStages] = useState<Set<StageId>>(new Set());

  // Publish state — 4 phases, tracked separately from core 6-stage progress
  const [publishState, setPublishState] = useState<PublishState>('none');

  // ── Mobile drawer ─────────────────────────────────────────────────────────
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // ── Lifted textarea & confirmation state ──────────────────────────────────
  // Hydrate a stage's answers matched by each prompt's real content block ID.
  // (Previously matched on a synthetic `${stageId}-${index}` ID invented in
  // this component, which never corresponded to what saveLearnerResponse
  // actually stores — the adapter now carries the real blockId through, so
  // this matches the same key saveResponseAction saves under.)
  const getInitialAnswers = (stageId: StageId) => {
    const prompts = session.stages.find((s) => s.id === stageId)?.prompts ?? [];
    return prompts.map((p) => {
      const r = initialResponses.find((r) => r.blockId === p.blockId);
      return (r?.value as { text?: string } | null)?.text ?? '';
    });
  };

  const [prepareAnswers,      setPrepareAnswers]      = useState<string[]>(() => getInitialAnswers('prepare'));
  const [exploreConfirmed,    setExploreConfirmed]    = useState(() => initialProgress.some(p => p.stageId === 'explore' && p.state === 'COMPLETE'));
  const [experimentConfirmed, setExperimentConfirmed] = useState(() => initialProgress.some(p => p.stageId === 'experiment' && p.state === 'COMPLETE'));
  const [experimentUrl,       setExperimentUrl]       = useState('');
  const [interpretAnswers,    setInterpretAnswers]    = useState<string[]>(() => getInitialAnswers('interpret'));
  const [buildConfirmed,      setBuildConfirmed]      = useState(() => initialProgress.some(p => p.stageId === 'build' && p.state === 'COMPLETE'));
  const [reflectAnswers,      setReflectAnswers]      = useState<string[]>(() => getInitialAnswers('reflect'));

  // ── Prediction Lock state (Experiment stage) ──────────────────────────────
  // There is exactly one predictionLock block in the current content model;
  // this tracks that one prediction directly rather than a generic per-block
  // map. If a future session authors more than one, this is the place to
  // generalize to a keyed structure.
  const predictionStage = useMemo(
    () => session.stages.find((s) => s.id === 'experiment') ?? null,
    [session.stages]
  );
  const predictionBlock = useMemo(
    () => predictionStage?.prompts?.find((p) => p.type === 'predictionLock') ?? null,
    [predictionStage]
  );
  const initialPredictionResponse = useMemo(
    () => (predictionBlock ? initialResponses.find((r) => r.blockId === predictionBlock.blockId) ?? null : null),
    [predictionBlock, initialResponses]
  );
  const [predictionText, setPredictionText] = useState(
    () => (initialPredictionResponse?.value as { text?: string } | null)?.text ?? ''
  );
  const [predictionLockState, updatePredictionLockState] = useState<LockState>(
    () => (initialPredictionResponse?.lockState ?? 'DRAFT') as LockState
  );
  const [predictionLockedAt, setPredictionLockedAt] = useState<Date | null>(
    () => initialPredictionResponse?.lockedAt ?? null
  );
  const [predictionLockPending, setPredictionLockPending] = useState(false);
  const [predictionLockError, setPredictionLockError] = useState<string | null>(null);

  // ── Stage sequence & core-progress, derived from the real session data ────
  // These used to be a hardcoded 7-item module constant and a hardcoded
  // 6-item CORE_STAGE_IDS constant (spec section 9 explicitly says not to
  // hardcode the stage count globally). Deriving them from `session.stages`
  // means a session with a different stage set — fewer stages, or a
  // different one marked non-core — gets correct navigation and progress
  // with no code change, straight from the same SessionVersion data the
  // sidebar and Overview badge also read.
  const navItems = useMemo<NavItem[]>(
    () => ['overview', ...session.stages.map((s) => s.id)],
    [session.stages]
  );
  const coreStageIds = useMemo<StageId[]>(
    () => session.stages.filter((s) => s.isCore).map((s) => s.id),
    [session.stages]
  );
  const lastStageId = useMemo(
    () => session.stages[session.stages.length - 1]?.id ?? null,
    [session.stages]
  );
  const isValidNavItem = useCallback(
    (s: string | null): s is NavItem => s !== null && (navItems as string[]).includes(s),
    [navItems]
  );

  // Hydrate completed stages from initialProgress
  useEffect(() => {
    const completed = new Set(initialProgress.filter(p => p.state === 'COMPLETE').map(p => p.stageId as StageId));
    setCompletedStages(completed);
  }, [initialProgress]);

  // ── Resource availability (derived from session data, stable) ────────────
  // deckAvailable: true only when the deck file URL is non-null and non-empty
  const deckAvailable = useMemo(() => {
    const exploreStage = session.stages.find((s) => s.id === 'explore');
    return (
      exploreStage?.resources?.some(
        (r) => r.type === 'deck' && r.url != null && r.url.trim() !== ''
      ) ?? false
    );
  }, [session.stages]);

  // experimentResourceAvailable: true when at least one resource has a real URL
  const experimentResourceAvailable = useMemo(() => {
    const expStage = session.stages.find((s) => s.id === 'experiment');
    return (
      expStage?.resources?.some(
        (r) => r.url != null && r.url.trim() !== ''
      ) ?? false
    );
  }, [session.stages]);

  // ── Build CompletionState ─────────────────────────────────────────────────
  const completionState: CompletionState = {
    prepareAnswers,
    exploreConfirmed,
    deckAvailable,
    experimentConfirmed,
    experimentUrl,
    experimentResourceAvailable,
    interpretAnswers,
    buildConfirmed,
    reflectAnswers,
  };

  // ── URL read on mount + popstate ──────────────────────────────────────────
  useEffect(() => {
    function syncFromUrl() {
      const s = new URLSearchParams(window.location.search).get('stage');
      setActiveItem(isValidNavItem(s) ? s : 'overview');
    }
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [isValidNavItem]);

  // ── Sync breadcrumb with active item ──────────────────────────────────────
  useEffect(() => {
    const stageKey = `stage.${activeItem}` as MessageKey;
    const stageLabel = t(stageKey);
    setBreadcrumb({
      track:        session.track,
      sessionLabel: `Session ${String(session.sessionNumber).padStart(2, '0')}`,
      stageLabel,
    });
  }, [activeItem, session, t, setBreadcrumb]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const navigateTo = useCallback((item: NavItem) => {
    setActiveItem(item);
    setMobileDrawerOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set('stage', item);
    history.pushState({ stage: item }, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const activeIndex = navItems.indexOf(activeItem);

  const prevItem = activeIndex > 0 ? navItems[activeIndex - 1] : null;
  const nextItem = activeIndex < navItems.length - 1 ? navItems[activeIndex + 1] : null;

  const prevStageLabel = prevItem ? t(`stage.${prevItem}` as MessageKey) : '';
  const nextStageLabel = nextItem ? t(`stage.${nextItem}` as MessageKey) : '';

  const goToPrev = useCallback(() => {
    if (prevItem) navigateTo(prevItem);
  }, [prevItem, navigateTo]);

  const goToNext = useCallback(() => {
    if (nextItem) navigateTo(nextItem);
  }, [nextItem, navigateTo]);

  // ── Completion handlers ───────────────────────────────────────────────────
  const handleStageComplete = useCallback((stageId: StageId) => {
    // Guard: a non-core stage (e.g. Publish) is never added to
    // completedStages — it has its own tracking (publishState) and must
    // not count toward core progress. Derived from the stage's real
    // `isCore` flag rather than a hardcoded 'publish' check, so this holds
    // for any future session that marks a different stage optional.
    if (!coreStageIds.includes(stageId)) return;
    setCompletedStages((prev) => new Set([...prev, stageId]));
    saveProgressAction(offeringSessionId, stageId, 'COMPLETE').catch(console.error);
  }, [offeringSessionId, coreStageIds]);

  const handleUndoComplete = useCallback((stageId: StageId) => {
    setCompletedStages((prev) => {
      const next = new Set(prev);
      next.delete(stageId);
      return next;
    });
    saveProgressAction(offeringSessionId, stageId, 'IN_PROGRESS').catch(console.error);
  }, [offeringSessionId]);

  // ── Answer change handlers ────────────────────────────────────────────────
  // In a production app, wrap these saveResponseAction calls in useDebounceCallback
  const prepareStage   = useMemo(() => session.stages.find((s) => s.id === 'prepare') ?? null, [session.stages]);
  const interpretStage = useMemo(() => session.stages.find((s) => s.id === 'interpret') ?? null, [session.stages]);
  const reflectStage   = useMemo(() => session.stages.find((s) => s.id === 'reflect') ?? null, [session.stages]);

  const handlePrepareAnswerChange = useCallback((i: number, v: string) => {
    setPrepareAnswers((p) => { const n = [...p]; n[i] = v; return n; });
    const blockId = prepareStage?.prompts?.[i]?.blockId;
    if (blockId) saveResponseAction(offeringSessionId, blockId, { text: v }).catch(console.error);
  }, [offeringSessionId, prepareStage]);

  const handleInterpretChange = useCallback((i: number, v: string) => {
    setInterpretAnswers((p) => { const n = [...p]; n[i] = v; return n; });
    const blockId = interpretStage?.prompts?.[i]?.blockId;
    if (blockId) saveResponseAction(offeringSessionId, blockId, { text: v }).catch(console.error);
  }, [offeringSessionId, interpretStage]);

  const handleReflectChange = useCallback((i: number, v: string) => {
    setReflectAnswers((p) => { const n = [...p]; n[i] = v; return n; });
    const blockId = reflectStage?.prompts?.[i]?.blockId;
    if (blockId) saveResponseAction(offeringSessionId, blockId, { text: v }).catch(console.error);
  }, [offeringSessionId, reflectStage]);

  // ── Prediction Lock handlers ──────────────────────────────────────────────
  const handlePredictionChange = useCallback((v: string) => {
    setPredictionText(v);
    if (predictionBlock) {
      saveResponseAction(offeringSessionId, predictionBlock.blockId, { text: v }).catch(console.error);
    }
  }, [offeringSessionId, predictionBlock]);

  const handleLockPrediction = useCallback(async () => {
    if (!predictionBlock) return;
    setPredictionLockPending(true);
    setPredictionLockError(null);
    const result = await lockPredictionAction(offeringSessionId, predictionBlock.blockId);
    setPredictionLockPending(false);
    if (result.success) {
      updatePredictionLockState('LOCKED');
      setPredictionLockedAt(result.lockedAt ?? new Date());
    } else {
      setPredictionLockError(result.error ?? t('prediction.lockErrorFallback'));
    }
  }, [offeringSessionId, predictionBlock, t]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeStage  = session.stages.find((s) => s.id === activeItem);
  const activeLabel  = activeItem === 'overview'
    ? t('stage.overview')
    : (activeStage?.title ?? '');
  const coreCompleted = countCoreCompleted(coreStageIds, completedStages);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[var(--wq-shell-alt)]">

      {/* ── Mobile stage bar ──────────────────────────────────────────── */}
      <div
        className="lg:hidden sticky top-[var(--wq-header-h)] z-30
                   bg-[var(--wq-shell)] border-b border-[var(--wq-shell-border)]
                   flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span aria-hidden="true" className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[var(--wq-accent)] text-white text-[10px] font-bold">
            {activeItem === 'overview' ? '≡' : String(activeIndex).padStart(2, '0')}
          </span>
          <span className="text-sm font-semibold text-white truncate">{activeLabel}</span>
        </div>
        <button
          onClick={() => setMobileDrawerOpen((p) => !p)}
          aria-label={t(mobileDrawerOpen ? 'header.closeMenu' : 'header.openMenu')}
          aria-expanded={mobileDrawerOpen}
          aria-controls="mobile-stage-drawer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/55 hover:text-white hover:bg-white/8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]"
        >
          {mobileDrawerOpen
            ? <X size={14} aria-hidden="true" />
            : <Menu size={14} aria-hidden="true" />
          }
          {t('nav.stages')}
        </button>
      </div>

      {/* ── Mobile drawer overlay ─────────────────────────────────────── */}
      {mobileDrawerOpen && (
        <div id="mobile-stage-drawer" className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label={t('nav.learningPath')}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setMobileDrawerOpen(false)} aria-hidden="true" />
          <div className="relative ml-auto w-72 max-w-[88vw] h-full bg-[var(--wq-shell)] border-l border-[var(--wq-shell-border)] flex flex-col overflow-y-auto">
            <div className="px-4 py-5 border-b border-[var(--wq-shell-border)] flex items-center justify-between">
              <p className="text-xs font-semibold text-[var(--wq-shell-label)] uppercase tracking-[0.14em]">
                {t('nav.learningPath')}
              </p>
              <button onClick={() => setMobileDrawerOpen(false)} aria-label={t('header.closeMenu')} className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)]">
                <X size={16} />
              </button>
            </div>
            <nav className="flex flex-col py-3 px-2 gap-0.5 flex-1">
              {/* Overview */}
              <button onClick={() => navigateTo('overview')} aria-current={activeItem === 'overview' ? 'page' : undefined}
                className={cn('flex items-center gap-3 mx-1 px-3 py-3 rounded-lg text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)] focus-visible:ring-inset', activeItem === 'overview' ? 'bg-[var(--wq-accent)]/18 text-white' : 'text-white/45 hover:bg-white/5 hover:text-white/70')}>
                <span aria-hidden="true" className={cn('shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm', activeItem === 'overview' ? 'bg-[var(--wq-accent)] text-white' : 'bg-white/8 text-white/35')}>≡</span>
                <span className="text-sm font-medium">{t('stage.overview')}</span>
              </button>
              <div className="flex items-center gap-2 px-3 py-1" aria-hidden="true">
                <div className="h-px flex-1 bg-white/8" />
                <span className="text-[9px] text-white/22 uppercase tracking-wider">{t('nav.stages')}</span>
                <div className="h-px flex-1 bg-white/8" />
              </div>
              {session.stages.map((stage, index) => {
                const isActive   = activeItem === stage.id;
                const isDone     = completedStages.has(stage.id);
                // The DB/adapter now dictates optionality via isCore
                const isOptional = !stage.isCore;
                return (
                  <button key={stage.id} onClick={() => navigateTo(stage.id)} aria-current={isActive ? 'step' : undefined}
                    className={cn('flex items-center gap-3 mx-1 px-3 py-3 rounded-lg text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wq-accent)] focus-visible:ring-inset', isActive ? 'bg-[var(--wq-accent)]/18 text-white' : isDone ? 'text-white/55 hover:bg-white/5 hover:text-white/75' : 'text-white/22 hover:bg-white/4 hover:text-white/45')}>
                    <span aria-hidden="true" className={cn('shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold', isActive ? 'bg-[var(--wq-accent)] text-white' : isDone ? 'bg-[var(--wq-accent)]/18 text-[var(--wq-accent)]' : 'bg-white/8 text-white/28')}>
                      {isDone ? '✓' : String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-medium truncate">{t(`stage.${stage.id}` as MessageKey)}</span>
                    {isOptional && <span className="ml-auto text-[10px] text-[var(--wq-gold)]/60 font-medium shrink-0">({t('completion.optional')})</span>}
                    {isActive && !isOptional && <span className="ml-auto text-[10px] text-[var(--wq-accent)] font-semibold shrink-0">{t('action.current')}</span>}
                  </button>
                );
              })}
            </nav>
            <div className="shrink-0 border-t border-[var(--wq-shell-border)] px-4 py-4">
              <p className="text-xs text-[var(--wq-shell-label)] tabular-nums">
                {t('completion.progress', { n: coreCompleted, total: coreStageIds.length })}
              </p>
              <div className="h-1 rounded-full bg-white/8 overflow-hidden mt-2">
                <div className="h-full rounded-full bg-[var(--wq-accent)] transition-all duration-500 motion-reduce:transition-none" style={{ width: `${(coreCompleted / coreStageIds.length) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Two-column layout ─────────────────────────────────────────── */}
      <div className="flex flex-1">
        <div className="hidden lg:flex">
          <SessionSidebar
            stages={session.stages}
            activeItem={activeItem}
            completedStages={completedStages}
            coreCompleted={coreCompleted}
            onSelectItem={navigateTo}
          />
        </div>

        <main
          className="flex-1"
          aria-label={activeLabel}
          aria-live="polite"
          aria-atomic="false"
        >
          <StageContent
            session={session}
            activeItem={activeItem}
            completionState={completionState}
            completedStages={completedStages}
            publishState={publishState}
            onPublishStateChange={setPublishState}
            // Answer state
            prepareAnswers={prepareAnswers}
            onPrepareAnswerChange={handlePrepareAnswerChange}
            exploreConfirmed={exploreConfirmed}
            onExploreConfirm={() => {
              setExploreConfirmed(true);
              saveProgressAction(offeringSessionId, 'explore', 'COMPLETE').catch(console.error);
            }}
            experimentConfirmed={experimentConfirmed}
            onExperimentConfirm={() => {
              setExperimentConfirmed(true);
              saveProgressAction(offeringSessionId, 'experiment', 'COMPLETE').catch(console.error);
            }}
            experimentUrl={experimentUrl}
            onExperimentUrlChange={setExperimentUrl}
            interpretAnswers={interpretAnswers}
            onInterpretAnswerChange={handleInterpretChange}
            buildConfirmed={buildConfirmed}
            onBuildConfirm={() => {
              setBuildConfirmed(true);
              saveProgressAction(offeringSessionId, 'build', 'COMPLETE').catch(console.error);
            }}
            reflectAnswers={reflectAnswers}
            onReflectAnswerChange={handleReflectChange}
            // Prediction Lock
            predictionText={predictionText}
            predictionLockState={predictionLockState}
            predictionLockedAt={predictionLockedAt}
            predictionLockPending={predictionLockPending}
            predictionLockError={predictionLockError}
            onPredictionChange={handlePredictionChange}
            onLockPrediction={handleLockPrediction}
            // Completion
            onStageComplete={handleStageComplete}
            onUndoStageComplete={handleUndoComplete}
            // Navigation — with stage labels for prev/next buttons
            hasPrev={prevItem !== null}
            hasNext={nextItem !== null}
            prevStageLabel={prevStageLabel}
            nextStageLabel={nextStageLabel}
            isOverview={activeItem === 'overview'}
            isLastStage={activeItem === lastStageId}
            onPrev={goToPrev}
            onNext={goToNext}
          />
        </main>
      </div>
    </div>
  );
}
