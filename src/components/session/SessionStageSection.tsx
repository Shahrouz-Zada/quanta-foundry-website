// =============================================================================
// SessionStageSection — Learning Sessions Prototype
// Semantic section wrapper with consistent heading style and scroll anchor
// =============================================================================

import { cn } from '@/lib/utils';
import type { StageId } from '@/types/learning-session';

interface Props {
  stageId: StageId;
  stageNumber: number;
  title: string;
  description: string;
  variant?: 'dark' | 'darker';
  children: React.ReactNode;
}

export default function SessionStageSection({
  stageId,
  stageNumber,
  title,
  description,
  variant = 'dark',
  children,
}: Props) {
  return (
    <section
      id={`stage-${stageId}`}
      aria-label={title}
      className={cn(
        'py-20 scroll-mt-32',
        variant === 'dark' ? 'bg-[#0A1929]' : 'bg-[#0D2137]'
      )}
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Stage heading */}
        <div className="flex items-start gap-4 mb-10">
          {/* Stage number accent */}
          <div className="shrink-0 mt-1">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37] text-sm font-bold">
              {String(stageNumber).padStart(2, '0')}
            </span>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-400 text-base leading-relaxed max-w-2xl">{description}</p>
          </div>
        </div>

        {/* Gold accent line */}
        <div
          aria-hidden="true"
          className="w-12 h-0.5 rounded-full mb-10"
          style={{
            background: 'linear-gradient(90deg, #D4AF37, #E0C35C)',
          }}
        />

        {/* Stage content */}
        {children}
      </div>
    </section>
  );
}
