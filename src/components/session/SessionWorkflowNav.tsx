'use client';
// =============================================================================
// SessionWorkflowNav — Learning Sessions Prototype
// Client component: IntersectionObserver-based active stage tracking
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { LearningStage, StageId } from '@/types/learning-session';

interface Props {
  stages: LearningStage[];
}

const STAGE_ICONS: Record<StageId, string> = {
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
        'sticky top-16 z-40 bg-[#0A1929]/95 backdrop-blur-md border-b border-white/10 transition-shadow duration-300',
        isScrolled && 'shadow-lg shadow-black/30'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-stretch overflow-x-auto scrollbar-none">
          {stages.map((stage, index) => {
            const isActive = stage.id === activeStage;
            const isPast = index < activeIndex;
            const isLast = index === stages.length - 1;

            return (
              <div key={stage.id} className="flex items-center shrink-0">
                <button
                  onClick={() => scrollToStage(stage.id)}
                  aria-label={`Jump to ${stage.title}`}
                  aria-current={isActive ? 'step' : undefined}
                  className={cn(
                    'flex items-center gap-2 px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium',
                    'transition-all duration-300 border-b-2 whitespace-nowrap focus-visible:outline-none',
                    'focus-visible:ring-2 focus-visible:ring-[#4A90E2] focus-visible:ring-inset',
                    isActive
                      ? 'border-[#4A90E2] text-white'
                      : isPast
                      ? 'border-[#D4AF37]/30 text-[#D4AF37]/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/50'
                      : 'border-transparent text-gray-600 hover:text-gray-300 hover:border-gray-600'
                  )}
                >
                  <span
                    className={cn(
                      'w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-xs font-bold',
                      'flex items-center justify-center shrink-0 transition-all duration-300',
                      isActive
                        ? 'bg-[#4A90E2] text-white shadow-[0_0_8px_rgba(74,144,226,0.6)]'
                        : isPast
                        ? 'bg-[#D4AF37]/15 text-[#D4AF37]'
                        : 'bg-white/8 text-gray-500'
                    )}
                  >
                    {STAGE_ICONS[stage.id]}
                  </span>
                  <span className="hidden sm:inline">{stage.title}</span>
                  <span className="sm:hidden">{stage.title.slice(0, 4)}</span>
                </button>

                {/* Arrow separator */}
                {!isLast && (
                  <span aria-hidden="true" className="text-gray-700 text-xs px-0.5 select-none">
                    →
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
