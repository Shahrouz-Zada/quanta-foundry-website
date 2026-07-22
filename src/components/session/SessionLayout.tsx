'use client';
// =============================================================================
// SessionLayout — Learning Sessions Prototype
// Orchestrates: two-column layout, active item (overview | stage), URL state,
// sidebar, mobile drawer, lifted textarea answers, prev/next navigation.
//
// URL contract: ?stage=overview | ?stage=<StageId>  (no param → overview)
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LearningSession, StageId } from '@/types/learning-session';
import SessionHeader from './SessionHeader';
import SessionSidebar, { type NavItem } from './SessionSidebar';
import StageContent from './StageContent';

// ── Constants ─────────────────────────────────────────────────────────────────

const STAGE_IDS: StageId[] = [
  'prepare', 'explore', 'experiment', 'interpret', 'build', 'reflect', 'publish',
];

// Full sequential order: overview is item 0
const ALL_NAV_ITEMS: NavItem[] = ['overview', ...STAGE_IDS];

function isValidNavItem(s: string | null): s is NavItem {
  return s !== null && (ALL_NAV_ITEMS as string[]).includes(s);
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  session: LearningSession;
}

export default function SessionLayout({ session }: Props) {
  // ── Active item (overview or stage) ──────────────────────────────────────
  const [activeItem, setActiveItem] = useState<NavItem>('overview');

  // ── Visited stages (only tracks actual stages, not overview) ─────────────
  const [visitedStages, setVisitedStages] = useState<Set<StageId>>(new Set<StageId>());

  // ── Mobile drawer ─────────────────────────────────────────────────────────
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // ── Lifted textarea answers (survive stage switches) ─────────────────────
  const interpretCount = session.stages.find((s) => s.id === 'interpret')?.prompts?.length ?? 0;
  const reflectCount   = session.stages.find((s) => s.id === 'reflect')?.prompts?.length ?? 0;
  const [interpretAnswers, setInterpretAnswers] = useState<string[]>(() => Array(interpretCount).fill(''));
  const [reflectAnswers,   setReflectAnswers]   = useState<string[]>(() => Array(reflectCount).fill(''));

  // ── Read URL on mount + handle back/forward ───────────────────────────────
  useEffect(() => {
    function syncFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('stage');
      const item: NavItem = isValidNavItem(s) ? s : 'overview';
      setActiveItem(item);
      if (item !== 'overview') {
        setVisitedStages((prev) => new Set([...prev, item as StageId]));
      }
    }
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  // ── Navigate ──────────────────────────────────────────────────────────────
  const navigateTo = useCallback((item: NavItem) => {
    setActiveItem(item);
    if (item !== 'overview') {
      setVisitedStages((prev) => new Set([...prev, item as StageId]));
    }
    setMobileDrawerOpen(false);

    const url = new URL(window.location.href);
    url.searchParams.set('stage', item);
    history.pushState({ stage: item }, '', url.toString());

    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const activeIndex = ALL_NAV_ITEMS.indexOf(activeItem);

  const goToPrev = useCallback(() => {
    if (activeIndex > 0) navigateTo(ALL_NAV_ITEMS[activeIndex - 1]);
  }, [activeIndex, navigateTo]);

  const goToNext = useCallback(() => {
    if (activeIndex < ALL_NAV_ITEMS.length - 1) navigateTo(ALL_NAV_ITEMS[activeIndex + 1]);
  }, [activeIndex, navigateTo]);

  // ── Answer handlers ───────────────────────────────────────────────────────
  const handleInterpretChange = useCallback((i: number, v: string) => {
    setInterpretAnswers((prev) => { const n = [...prev]; n[i] = v; return n; });
  }, []);
  const handleReflectChange = useCallback((i: number, v: string) => {
    setReflectAnswers((prev) => { const n = [...prev]; n[i] = v; return n; });
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeStage      = session.stages.find((s) => s.id === activeItem);
  const activeLabel      = activeItem === 'overview' ? 'Overview' : (activeStage?.title ?? '');
  const activeItemIndex  = activeItem === 'overview' ? 0 : session.stages.findIndex((s) => s.id === activeItem) + 1;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0E3B35] flex flex-col">

      {/* ── Session header (compact identity bar) ─────────────────────── */}
      <SessionHeader session={session} />

      {/* ── Mobile stage bar ──────────────────────────────────────────── */}
      <div className="lg:hidden sticky top-16 z-30 bg-[#08212C] border-b border-white/8 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span aria-hidden="true" className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#2F8174] text-white text-[10px] font-bold">
            {activeItem === 'overview' ? '≡' : String(activeItemIndex).padStart(2, '0')}
          </span>
          <span className="text-sm font-semibold text-white truncate">{activeLabel}</span>
        </div>
        <button
          onClick={() => setMobileDrawerOpen((p) => !p)}
          aria-label={mobileDrawerOpen ? 'Close stage menu' : 'Open stage menu'}
          aria-expanded={mobileDrawerOpen}
          aria-controls="mobile-stage-drawer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/55 hover:text-white hover:bg-white/8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8174]"
        >
          {mobileDrawerOpen ? <X size={14} aria-hidden="true" /> : <Menu size={14} aria-hidden="true" />}
          Stages
        </button>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────────────── */}
      {mobileDrawerOpen && (
        <div id="mobile-stage-drawer" className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Session navigation">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setMobileDrawerOpen(false)} aria-hidden="true" />
          <div className="relative ml-auto w-72 max-w-[88vw] h-full bg-[#08212C] border-l border-white/10 flex flex-col overflow-y-auto">
            <div className="px-4 py-5 border-b border-white/8 flex items-center justify-between">
              <p className="text-xs font-semibold text-white/35 uppercase tracking-[0.14em]">Learning Path</p>
              <button onClick={() => setMobileDrawerOpen(false)} aria-label="Close stage menu" className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8174]">
                <X size={16} />
              </button>
            </div>
            <nav className="flex flex-col py-3 px-2 gap-0.5 flex-1">
              {/* Overview */}
              <button
                onClick={() => navigateTo('overview')}
                aria-current={activeItem === 'overview' ? 'page' : undefined}
                className={cn('flex items-center gap-3 mx-1 px-3 py-3 rounded-lg text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8174] focus-visible:ring-inset', activeItem === 'overview' ? 'bg-[#2F8174]/18 text-white' : 'text-white/45 hover:bg-white/5 hover:text-white/70')}
              >
                <span aria-hidden="true" className={cn('shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm', activeItem === 'overview' ? 'bg-[#2F8174] text-white' : 'bg-white/8 text-white/35')}>≡</span>
                <span className="text-sm font-medium">Overview</span>
              </button>
              {/* Divider */}
              <div className="flex items-center gap-2 px-3 py-1" aria-hidden="true">
                <div className="h-px flex-1 bg-white/8" />
                <span className="text-[9px] text-white/22 uppercase tracking-wider">Stages</span>
                <div className="h-px flex-1 bg-white/8" />
              </div>
              {/* Stages */}
              {session.stages.map((stage, index) => {
                const isActive  = activeItem === stage.id;
                const isVisited = visitedStages.has(stage.id) && !isActive;
                return (
                  <button
                    key={stage.id}
                    onClick={() => navigateTo(stage.id)}
                    aria-current={isActive ? 'step' : undefined}
                    className={cn('flex items-center gap-3 mx-1 px-3 py-3 rounded-lg text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8174] focus-visible:ring-inset', isActive ? 'bg-[#2F8174]/18 text-white' : isVisited ? 'text-white/45 hover:bg-white/5 hover:text-white/70' : 'text-white/22 hover:bg-white/4 hover:text-white/45')}
                  >
                    <span aria-hidden="true" className={cn('shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold', isActive ? 'bg-[#2F8174] text-white' : isVisited ? 'bg-[#2F8174]/18 text-[#2F8174]' : 'bg-white/8 text-white/28')}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-medium truncate">{stage.title}</span>
                    {isActive && <span className="ml-auto text-[10px] text-[#2F8174] font-semibold shrink-0">Current</span>}
                  </button>
                );
              })}
            </nav>
            {/* Progress */}
            <div className="shrink-0 border-t border-white/8 px-4 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/28 uppercase tracking-wider">Stages visited</span>
                <span className="text-[10px] text-white/45 font-medium tabular-nums">{visitedStages.size} / {session.stages.length}</span>
              </div>
              <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                <div className="h-full rounded-full bg-[#2F8174] transition-all duration-500 motion-reduce:transition-none" style={{ width: `${(visitedStages.size / session.stages.length) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Two-column layout ─────────────────────────────────────────── */}
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex">
          <SessionSidebar
            stages={session.stages}
            activeItem={activeItem}
            visitedStages={visitedStages}
            onSelectItem={navigateTo}
          />
        </div>

        {/* Main content */}
        <main
          className="flex-1 min-h-[calc(100vh-4rem)]"
          aria-label={activeLabel}
          aria-live="polite"
          aria-atomic="false"
        >
          <StageContent
            session={session}
            activeItem={activeItem}
            interpretAnswers={interpretAnswers}
            onInterpretAnswerChange={handleInterpretChange}
            reflectAnswers={reflectAnswers}
            onReflectAnswerChange={handleReflectChange}
            hasPrev={activeIndex > 0}
            hasNext={activeIndex < ALL_NAV_ITEMS.length - 1}
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
          <span className="text-xs text-amber-500/50 font-medium">⚗ prototype / feature/learning-sessions-prototype</span>
        </div>
      </footer>
    </div>
  );
}
