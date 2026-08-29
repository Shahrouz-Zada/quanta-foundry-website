/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { CORE_STAGE_IDS, countCoreCompleted } from '@/lib/completion-rules';
import type { CompletionState } from '@/lib/completion-rules';
import SessionSidebar from './SessionSidebar';
import StageContent from './StageContent';
import { saveResponseAction, saveProgressAction } from '../../app/workspace-q/actions';
import type { Progress, Response } from '@prisma/client';

// ── Constants ─────────────────────────────────────────────────────────────────

export type PublishState = 'none' | 'drafting' | 'review-requested' | 'published';

const STAGE_IDS: StageId[] = [
  'prepare', 'explore', 'experiment', 'interpret', 'build', 'reflect', 'publish',
];
const ALL_NAV_ITEMS: NavItem[] = ['overview', ...STAGE_IDS];

function isValidNavItem(s: string | null): s is NavItem {
  return s !== null && (ALL_NAV_ITEMS as string[]).includes(s);
}

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
  const prepareCount   = session.stages.find((s) => s.id === 'prepare')?.prompts?.length ?? 0;
  const interpretCount = session.stages.find((s) => s.id === 'interpret')?.prompts?.length ?? 0;
  const reflectCount   = session.stages.find((s) => s.id === 'reflect')?.prompts?.length ?? 0;

  // Hydrate answers from initialResponses
  const getInitialAnswers = (stageId: string, count: number) => {
    const answers = Array(count).fill('');
    initialResponses.forEach(r => {
      if (r.blockId.startsWith(`${stageId}-`)) {
        const idx = parseInt(r.blockId.split('-')[1], 10);
        if (!isNaN(idx) && idx < count) {
          answers[idx] = (r.value as any)?.text || '';
        }
      }
    });
    return answers;
  };

  const [prepareAnswers,      setPrepareAnswers]      = useState<string[]>(() => getInitialAnswers('prepare', prepareCount));
  const [exploreConfirmed,    setExploreConfirmed]    = useState(() => initialProgress.some(p => p.stageId === 'explore' && p.state === 'COMPLETE'));
  const [experimentConfirmed, setExperimentConfirmed] = useState(() => initialProgress.some(p => p.stageId === 'experiment' && p.state === 'COMPLETE'));
  const [experimentUrl,       setExperimentUrl]       = useState('');
  const [interpretAnswers,    setInterpretAnswers]    = useState<string[]>(() => getInitialAnswers('interpret', interpretCount));
  const [buildConfirmed,      setBuildConfirmed]      = useState(() => initialProgress.some(p => p.stageId === 'build' && p.state === 'COMPLETE'));
  const [reflectAnswers,      setReflectAnswers]      = useState<string[]>(() => getInitialAnswers('reflect', reflectCount));

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
  }, []);

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

  const activeIndex = ALL_NAV_ITEMS.indexOf(activeItem);

  const prevItem = activeIndex > 0 ? ALL_NAV_ITEMS[activeIndex - 1] : null;
  const nextItem = activeIndex < ALL_NAV_ITEMS.length - 1 ? ALL_NAV_ITEMS[activeIndex + 1] : null;

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
    // Guard: publish is never added to completedStages
    if (stageId === 'publish') return;
    setCompletedStages((prev) => new Set([...prev, stageId]));
    saveProgressAction(offeringSessionId, stageId, 'COMPLETE').catch(console.error);
  }, [offeringSessionId]);

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
  const handlePrepareAnswerChange = useCallback((i: number, v: string) => {
    setPrepareAnswers((p) => { const n = [...p]; n[i] = v; return n; });
    saveResponseAction(offeringSessionId, `prepare-${i}`, { text: v }).catch(console.error);
  }, [offeringSessionId]);
  const handleInterpretChange = useCallback((i: number, v: string) => {
    setInterpretAnswers((p) => { const n = [...p]; n[i] = v; return n; });
    saveResponseAction(offeringSessionId, `interpret-${i}`, { text: v }).catch(console.error);
  }, [offeringSessionId]);
  const handleReflectChange = useCallback((i: number, v: string) => {
    setReflectAnswers((p) => { const n = [...p]; n[i] = v; return n; });
    saveResponseAction(offeringSessionId, `reflect-${i}`, { text: v }).catch(console.error);
  }, [offeringSessionId]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeStage  = session.stages.find((s) => s.id === activeItem);
  const activeLabel  = activeItem === 'overview'
    ? t('stage.overview')
    : (activeStage?.title ?? '');
  const coreCompleted = countCoreCompleted(completedStages);

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
                const isOptional = stage.id === 'publish';
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
                {t('completion.progress', { n: coreCompleted })}
              </p>
              <div className="h-1 rounded-full bg-white/8 overflow-hidden mt-2">
                <div className="h-full rounded-full bg-[var(--wq-accent)] transition-all duration-500 motion-reduce:transition-none" style={{ width: `${(coreCompleted / CORE_STAGE_IDS.length) * 100}%` }} />
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
            // Completion
            onStageComplete={handleStageComplete}
            onUndoStageComplete={handleUndoComplete}
            // Navigation — with stage labels for prev/next buttons
            hasPrev={prevItem !== null}
            hasNext={nextItem !== null}
            prevStageLabel={prevStageLabel}
            nextStageLabel={nextStageLabel}
            isOverview={activeItem === 'overview'}
            isLastStage={activeItem === 'publish'}
            onPrev={goToPrev}
            onNext={goToNext}
          />
        </main>
      </div>
    </div>
  );
}
