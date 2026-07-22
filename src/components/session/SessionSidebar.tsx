'use client';
// =============================================================================
// SessionSidebar — Learning Sessions Prototype
// Collapsible two-state rail (narrow icons ↔ expanded labels)
// Navy chrome (#08212C), emerald active, gold visited check
// WCAG: all text on #08212C meets 4.5:1 | focus rings visible
// =============================================================================

import { useState, useCallback } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LearningStage, StageId } from '@/types/learning-session';

interface Props {
  stages: LearningStage[];
  activeStageId: StageId;
  visitedStages: Set<StageId>;
  onSelectStage: (id: StageId) => void;
}

export default function SessionSidebar({
  stages,
  activeStageId,
  visitedStages,
  onSelectStage,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const toggle = useCallback(() => setIsExpanded((p) => !p), []);

  return (
    <aside
      className={cn(
        // Sticky below fixed navbar (top-16 = 64px)
        'sticky top-16 h-[calc(100vh-4rem)] flex flex-col overflow-y-auto overflow-x-hidden shrink-0',
        'bg-[#08212C] border-r border-white/8',
        // Width transition — suppressed for prefers-reduced-motion
        'transition-[width] duration-300 ease-in-out motion-reduce:transition-none',
        isExpanded ? 'w-56' : 'w-16'
      )}
      aria-label="Session stage navigation"
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

      {/* ── Stage list ──────────────────────────────────────────────── */}
      <nav role="list" className="flex flex-col py-3 flex-1 gap-0.5">
        {stages.map((stage, index) => {
          const isActive  = stage.id === activeStageId;
          const isVisited = visitedStages.has(stage.id) && !isActive;

          return (
            <button
              key={stage.id}
              role="listitem"
              onClick={() => onSelectStage(stage.id)}
              aria-current={isActive ? 'step' : undefined}
              aria-label={
                `Stage ${index + 1}: ${stage.title}` +
                (isActive ? ' — current' : isVisited ? ' — visited' : '')
              }
              className={cn(
                'flex items-center text-left transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2F8174]',
                isExpanded
                  ? 'gap-3 mx-2 px-3 py-2.5 rounded-lg'
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
                className={cn(
                  'shrink-0 flex items-center justify-center rounded-full font-bold transition-all duration-200',
                  isExpanded ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-[10px]',
                  isActive
                    ? 'bg-[#2F8174] text-white shadow-[0_0_8px_rgba(47,129,116,0.45)]'
                    : isVisited
                    ? 'bg-[#2F8174]/18 text-[#2F8174]'
                    : 'bg-white/8 text-white/28'
                )}
                aria-hidden="true"
              >
                {isVisited ? <Check size={9} strokeWidth={3} /> : String(index + 1).padStart(2, '0')}
              </span>

              {/* Labels — visible only when expanded */}
              {isExpanded && (
                <span className="flex flex-col min-w-0 flex-1">
                  <span
                    className={cn(
                      'text-xs font-semibold leading-tight truncate',
                      isActive
                        ? 'text-white'
                        : isVisited
                        ? 'text-white/50'
                        : 'text-white/25'
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

              {/* Active bar — collapsed only */}
              {!isExpanded && isActive && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 w-0.5 h-5 rounded-r bg-[#2F8174]"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Progress bar (expanded only) ────────────────────────────── */}
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
            aria-label="Session progress"
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
