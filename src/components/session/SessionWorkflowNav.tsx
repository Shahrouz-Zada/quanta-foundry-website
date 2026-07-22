'use client';
// =============================================================================
// SessionWorkflowNav — Learning Sessions Prototype
// Chrome: deep navy-teal (#08212C) — matches header and global Navbar
// Active indicator: interactive emerald (#2F8174)
// Past stages: gold tint (milestone feel)
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { LearningStage, StageId } from '@/types/learning-session';

interface Props {
  stages: LearningStage[];
}

const STAGE_NUMBERS: Record<StageId, string> = {
  prepare:    '01',
  explore:    '02',
  experiment: '03',
  interpret:  '04',
  build:      '05',
  reflect:    '06',
  publish:    '07',
};

export default function SessionWorkflowNav({ stages }: Props) {
  const [activeStage, setActiveStage] = useState<StageId>(stages[0]?.id ?? 'prepare');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    stages.forEach((stage) => {
      const el = document.getElementById(`stage-${stage.id}`);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveStage(stage.id);
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [stages]);

  const scrollToStage = useCallback((id: StageId) => {
    const el = document.getElementById(`stage-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const activeIndex = stages.findIndex((s) => s.id === activeStage);

  return (
    <nav
      aria-label="Session workflow navigation"
      className={cn(
        'sticky top-16 z-40 bg-[#08212C] border-b border-white/8 transition-shadow duration-300',
        isScrolled && 'shadow-lg shadow-black/40'
      )}
    >
      {/* Active progress bar */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-[2px] bg-[#2F8174] transition-all duration-500 ease-out"
        style={{ width: `${((activeIndex + 1) / stages.length) * 100}%` }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-stretch overflow-x-auto scrollbar-none">
          {stages.map((stage, index) => {
            const isActive = stage.id === activeStage;
            const isPast   = index < activeIndex;

            return (
              <button
                key={stage.id}
                onClick={() => scrollToStage(stage.id)}
                aria-label={`Jump to ${stage.title}`}
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-2 px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium shrink-0',
                  'transition-all duration-200 whitespace-nowrap focus-visible:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-[#2F8174] focus-visible:ring-inset',
                  isActive
                    ? 'text-white'
                    : isPast
                    ? 'text-[#D4AF37]/50 hover:text-[#D4AF37]/80'
                    : 'text-white/30 hover:text-white/60'
                )}
              >
                {/* Stage number dot */}
                <span
                  className={cn(
                    'w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-xs font-bold',
                    'flex items-center justify-center shrink-0 transition-all duration-300',
                    isActive
                      ? 'bg-[#2F8174] text-white shadow-[0_0_10px_rgba(47,129,116,0.5)]'
                      : isPast
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37]/70'
                      : 'bg-white/8 text-white/30'
                  )}
                >
                  {STAGE_NUMBERS[stage.id]}
                </span>
                <span className="hidden sm:inline">{stage.title}</span>
                <span className="sm:hidden">{stage.title.slice(0, 4)}</span>

                {/* Separator dot */}
                {index < stages.length - 1 && (
                  <span aria-hidden="true" className="text-white/15 text-xs ml-1 select-none">·</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
