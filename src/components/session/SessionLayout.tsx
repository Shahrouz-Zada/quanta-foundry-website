'use client';
// =============================================================================
// SessionLayout — Learning Sessions Prototype
// Orchestrates: two-column layout, active stage, URL state, sidebar,
// mobile drawer, lifted textarea answers, prev/next navigation.
//
// URL contract: ?stage=<StageId>  (invalid values fall back to 'prepare')
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LearningSession, StageId } from '@/types/learning-session';
import SessionHeader from './SessionHeader';
import SessionSidebar from './SessionSidebar';
import StageContent from './StageContent';

// ── Constants ─────────────────────────────────────────────────────────────────

const STAGE_IDS: StageId[] = [
  'prepare',
  'explore',
  'experiment',
  'interpret',
  'build',
  'reflect',
  'publish',
];

function isValidStageId(s: string | null): s is StageId {
  return s !== null && (STAGE_IDS as string[]).includes(s);
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  session: LearningSession;
}

export default function SessionLayout({ session }: Props) {
  // ── Active stage ──────────────────────────────────────────────────────────
  const [activeStageId, setActiveStageId] = useState<StageId>('prepare');

  // ── Visited stages (marks checkmarks in sidebar) ─────────────────────────
  const [visitedStages, setVisitedStages] = useState<Set<StageId>>(
    () => new Set<StageId>(['prepare'])
  );

  // ── Mobile drawer ─────────────────────────────────────────────────────────
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // ── Lifted textarea answers ───────────────────────────────────────────────
  // Kept in the parent so they survive stage switches.
  const interpretPromptCount =
    session.stages.find((s) => s.id === 'interpret')?.prompts?.length ?? 0;
  const reflectPromptCount =
    session.stages.find((s) => s.id === 'reflect')?.prompts?.length ?? 0;

  const [interpretAnswers, setInterpretAnswers] = useState<string[]>(() =>
    Array<string>(interpretPromptCount).fill('')
  );
  const [reflectAnswers, setReflectAnswers] = useState<string[]>(() =>
    Array<string>(reflectPromptCount).fill('')
  );

  // ── URL read on mount + popstate ──────────────────────────────────────────
  useEffect(() => {
    function readUrlStage() {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('stage');
      if (isValidStageId(s)) {
        setActiveStageId(s);
        setVisitedStages((prev) => new Set([...prev, s]));
      }
    }
    readUrlStage();
    window.addEventListener('popstate', readUrlStage);
    return () => window.removeEventListener('popstate', readUrlStage);
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────────
  const navigateToStage = useCallback((id: StageId) => {
    setActiveStageId(id);
    setVisitedStages((prev) => new Set([...prev, id]));
    setMobileDrawerOpen(false);

    // Push to browser history so back/forward and refresh work
    const url = new URL(window.location.href);
    url.searchParams.set('stage', id);
    history.pushState({ stage: id }, '', url.toString());

    // Scroll: bring stage heading into view, accounting for fixed navbar
    // Use instant scroll to avoid a jarring animated scroll on tab switch
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const activeIndex = STAGE_IDS.indexOf(activeStageId);

  const goToPrev = useCallback(() => {
    if (activeIndex > 0) navigateToStage(STAGE_IDS[activeIndex - 1]);
  }, [activeIndex, navigateToStage]);

  const goToNext = useCallback(() => {
    if (activeIndex < STAGE_IDS.length - 1) navigateToStage(STAGE_IDS[activeIndex + 1]);
  }, [activeIndex, navigateToStage]);

  // ── Answer handlers ───────────────────────────────────────────────────────
  const handleInterpretChange = useCallback((i: number, v: string) => {
    setInterpretAnswers((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  }, []);

  const handleReflectChange = useCallback((i: number, v: string) => {
    setReflectAnswers((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  }, []);

  // ── Current stage label for mobile bar ───────────────────────────────────
  const activeStage = session.stages.find((s) => s.id === activeStageId);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0E3B35] flex flex-col">

      {/* ── Session header ─────────────────────────────────────────────── */}
      <SessionHeader session={session} />

      {/* ── Mobile stage bar (hidden on lg+) ─────────────────────────── */}
      <div
        className="lg:hidden sticky top-16 z-30 bg-[#08212C] border-b border-white/8
                   flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            aria-hidden="true"
            className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full
                       bg-[#2F8174] text-white text-[10px] font-bold"
          >
            {String(activeIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-sm font-semibold text-white truncate">
            {activeStage?.title}
          </span>
        </div>

        <button
          onClick={() => setMobileDrawerOpen((p) => !p)}
          aria-label={mobileDrawerOpen ? 'Close stage menu' : 'Open stage menu'}
          aria-expanded={mobileDrawerOpen}
          aria-controls="mobile-stage-drawer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                     text-white/55 hover:text-white hover:bg-white/8 transition-colors
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8174]"
        >
          {mobileDrawerOpen ? <X size={14} aria-hidden="true" /> : <Menu size={14} aria-hidden="true" />}
          Stages
        </button>
      </div>

      {/* ── Mobile drawer overlay ─────────────────────────────────────── */}
      {mobileDrawerOpen && (
        <div
          id="mobile-stage-drawer"
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Stage navigation"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div className="relative ml-auto w-72 max-w-[88vw] h-full bg-[#08212C] border-l border-white/10 flex flex-col overflow-y-auto">
            <div className="px-4 py-5 border-b border-white/8 flex items-center justify-between">
              <p className="text-xs font-semibold text-white/35 uppercase tracking-[0.14em]">
                Learning Path
              </p>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close stage menu"
                className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/8
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8174]"
              >
                <X size={16} />
              </button>
            </div>

            <nav className="flex flex-col py-3 px-2 gap-0.5 flex-1">
              {session.stages.map((stage, index) => {
                const isActive  = stage.id === activeStageId;
                const isVisited = visitedStages.has(stage.id) && !isActive;
                return (
                  <button
                    key={stage.id}
                    onClick={() => navigateToStage(stage.id)}
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={`Stage ${index + 1}: ${stage.title}`}
                    className={cn(
                      'flex items-center gap-3 mx-1 px-3 py-3 rounded-lg text-left',
                      'transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8174] focus-visible:ring-inset',
                      isActive
                        ? 'bg-[#2F8174]/18 text-white'
                        : isVisited
                        ? 'text-white/45 hover:bg-white/5 hover:text-white/70'
                        : 'text-white/22 hover:bg-white/4 hover:text-white/45'
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                        isActive
                          ? 'bg-[#2F8174] text-white'
                          : isVisited
                          ? 'bg-[#2F8174]/18 text-[#2F8174]'
                          : 'bg-white/8 text-white/28'
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-medium truncate">{stage.title}</span>
                    {isActive && (
                      <span className="ml-auto text-[10px] text-[#2F8174] font-semibold shrink-0">
                        Current
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Progress */}
            <div className="shrink-0 border-t border-white/8 px-4 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/28 uppercase tracking-wider">Progress</span>
                <span className="text-[10px] text-white/45 font-medium tabular-nums">
                  {visitedStages.size} / {session.stages.length}
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#2F8174] transition-all duration-500 motion-reduce:transition-none"
                  style={{ width: `${(visitedStages.size / session.stages.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Two-column layout ─────────────────────────────────────────── */}
      <div className="flex flex-1">

        {/* Desktop sidebar (hidden on mobile) */}
        <div className="hidden lg:flex">
          <SessionSidebar
            stages={session.stages}
            activeStageId={activeStageId}
            visitedStages={visitedStages}
            onSelectStage={navigateToStage}
          />
        </div>

        {/* Stage content — fills remaining width */}
        <main
          className="flex-1 min-h-[calc(100vh-4rem)]"
          aria-label={`Stage: ${activeStage?.title ?? ''}`}
          aria-live="polite"
          aria-atomic="false"
        >
          <StageContent
            session={session}
            activeStageId={activeStageId}
            interpretAnswers={interpretAnswers}
            onInterpretAnswerChange={handleInterpretChange}
            reflectAnswers={reflectAnswers}
            onReflectAnswerChange={handleReflectChange}
            hasPrev={activeIndex > 0}
            hasNext={activeIndex < STAGE_IDS.length - 1}
            onPrev={goToPrev}
            onNext={goToNext}
          />
        </main>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="bg-[#08212C] border-t border-white/5 py-6">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-white/20">
            Finance, Data &amp; AI · Session 01 · Prototype — not indexed, not linked from navigation.
          </p>
          <span className="text-xs text-amber-500/50 font-medium">
            ⚗ prototype / feature/learning-sessions-prototype
          </span>
        </div>
      </footer>
    </div>
  );
}
