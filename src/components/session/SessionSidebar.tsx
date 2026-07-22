'use client';
// =============================================================================
// SessionSidebar — Learning Sessions Prototype
// Collapsible rail: Overview tab at top, then numbered stage list below.
// NavItem = 'overview' | StageId
// =============================================================================

import { useState, useCallback } from 'react';
import { Check, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LearningStage, StageId } from '@/types/learning-session';

export type NavItem = 'overview' | StageId;

interface Props {
  stages: LearningStage[];
  activeItem: NavItem;
  visitedStages: Set<StageId>;
  onSelectItem: (item: NavItem) => void;
}

export default function SessionSidebar({
  stages,
  activeItem,
  visitedStages,
  onSelectItem,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const toggle = useCallback(() => setIsExpanded((p) => !p), []);

  const isOverviewActive = activeItem === 'overview';

  return (
    <aside
      className={cn(
        'sticky top-16 h-[calc(100vh-4rem)] flex flex-col overflow-y-auto overflow-x-hidden shrink-0',
        'bg-[#08212C] border-r border-white/8',
        'transition-[width] duration-300 ease-in-out motion-reduce:transition-none',
        isExpanded ? 'w-56' : 'w-16'
      )}
      aria-label="Session navigation"
    >
      {/* ── Header / toggle ─────────────────────────────────────────── */}
      <div
        className={cn(
          'flex items-center shrink-0 border-b border-white/8 py-4',
          isExpanded ? 'justify-between px-4' : 'justify-center'
        )}
      >
        {isExpanded && (
          <span className="text-[10px] font-semibold text-white/35 uppercase tracking-[0.14em] whitespace-nowrap select-none">
            Learning Path
          </span>
        )}
        <button
          onClick={toggle}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={isExpanded}
          className={cn(
            'flex items-center justify-center rounded-lg text-white/35 hover:text-white',
            'hover:bg-white/8 transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8174] focus-visible:ring-inset',
            'w-7 h-7'
          )}
        >
          {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* ── Overview tab ────────────────────────────────────────────── */}
      <div className="shrink-0 pt-3 pb-2 px-2">
        <button
          onClick={() => onSelectItem('overview')}
          aria-current={isOverviewActive ? 'page' : undefined}
          aria-label="Session overview"
          className={cn(
            'flex items-center text-left w-full transition-colors duration-150 rounded-lg',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2F8174]',
            isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center mx-auto w-10 h-10',
            isOverviewActive
              ? 'bg-[#2F8174]/18 text-white'
              : 'text-white/40 hover:bg-white/5 hover:text-white/70'
          )}
        >
          {/* Icon */}
          <span
            aria-hidden="true"
            className={cn(
              'shrink-0 flex items-center justify-center rounded-lg transition-all duration-200',
              isExpanded ? 'w-5 h-5' : 'w-6 h-6',
              isOverviewActive
                ? 'text-[#2F8174] drop-shadow-[0_0_6px_rgba(47,129,116,0.5)]'
                : 'text-white/35'
            )}
          >
            <LayoutDashboard size={isExpanded ? 14 : 15} />
          </span>

          {/* Label */}
          {isExpanded && (
            <span className="flex flex-col min-w-0 flex-1">
              <span
                className={cn(
                  'text-xs font-semibold leading-tight',
                  isOverviewActive ? 'text-white' : 'text-white/45'
                )}
              >
                Overview
              </span>
              {isOverviewActive && (
                <span className="text-[10px] text-[#2F8174] font-medium mt-0.5 leading-tight">
                  Current
                </span>
              )}
            </span>
          )}
        </button>
      </div>

      {/* ── Divider with "Learning Path" label ─────────────────────── */}
      <div
        className={cn(
          'shrink-0 flex items-center gap-2 px-3 pb-2',
          isExpanded ? '' : 'justify-center'
        )}
      >
        {isExpanded ? (
          <>
            <div className="h-px flex-1 bg-white/8" aria-hidden="true" />
            <span className="text-[9px] font-semibold text-white/22 uppercase tracking-[0.16em] shrink-0 select-none">
              Stages
            </span>
            <div className="h-px flex-1 bg-white/8" aria-hidden="true" />
          </>
        ) : (
          <div className="w-5 h-px bg-white/12 my-1" aria-hidden="true" />
        )}
      </div>

      {/* ── Stage list ──────────────────────────────────────────────── */}
      <nav role="list" className="flex flex-col px-2 flex-1 gap-0.5">
        {stages.map((stage, index) => {
          const isActive  = activeItem === stage.id;
          const isVisited = visitedStages.has(stage.id) && !isActive;

          return (
            <button
              key={stage.id}
              role="listitem"
              onClick={() => onSelectItem(stage.id)}
              aria-current={isActive ? 'step' : undefined}
              aria-label={
                `Stage ${index + 1}: ${stage.title}` +
                (isActive ? ' — current' : isVisited ? ' — visited' : '')
              }
              className={cn(
                'flex items-center text-left transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2F8174]',
                isExpanded
                  ? 'gap-3 mx-0 px-3 py-2.5 rounded-lg'
                  : 'justify-center mx-auto w-10 h-10 rounded-lg my-0.5',
                isActive
                  ? 'bg-[#2F8174]/18 text-white'
                  : isVisited
                  ? 'text-white/45 hover:bg-white/5 hover:text-white/70'
                  : 'text-white/22 hover:bg-white/4 hover:text-white/45'
              )}
            >
              {/* Status dot / number */}
              <span
                aria-hidden="true"
                className={cn(
                  'shrink-0 flex items-center justify-center rounded-full font-bold transition-all duration-200',
                  isExpanded ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-[10px]',
                  isActive
                    ? 'bg-[#2F8174] text-white shadow-[0_0_8px_rgba(47,129,116,0.45)]'
                    : isVisited
                    ? 'bg-[#2F8174]/18 text-[#2F8174]'
                    : 'bg-white/8 text-white/28'
                )}
              >
                {isVisited ? <Check size={9} strokeWidth={3} /> : String(index + 1).padStart(2, '0')}
              </span>

              {/* Labels */}
              {isExpanded && (
                <span className="flex flex-col min-w-0 flex-1">
                  <span
                    className={cn(
                      'text-xs font-semibold leading-tight truncate',
                      isActive ? 'text-white' : isVisited ? 'text-white/50' : 'text-white/25'
                    )}
                  >
                    {stage.title}
                  </span>
                  {isActive && (
                    <span className="text-[10px] text-[#2F8174] font-medium mt-0.5 leading-tight">
                      Current
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Progress (expanded only) ─────────────────────────────────── */}
      {isExpanded && (
        <div className="shrink-0 border-t border-white/8 px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/28 uppercase tracking-wider select-none">
              Progress
            </span>
            <span className="text-[10px] text-white/45 font-medium tabular-nums">
              {visitedStages.size} / {stages.length}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={visitedStages.size}
            aria-valuemin={0}
            aria-valuemax={stages.length}
            aria-label="Session stage progress"
            className="h-1 rounded-full bg-white/8 overflow-hidden"
          >
            <div
              className="h-full rounded-full bg-[#2F8174] transition-all duration-500 ease-out motion-reduce:transition-none"
              style={{ width: `${(visitedStages.size / stages.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
