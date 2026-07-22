// =============================================================================
// SessionStageSection — Learning Sessions Prototype
// Work surfaces: warm cream (#F4F1E8 / #EAE7DC) with dark text
// Generous spacing, clear heading hierarchy, restrained gold accent
// WCAG: #18242B on #F4F1E8 ≈ 14:1  ✓ | #5F6B70 on #F4F1E8 ≈ 4.6:1 ✓
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
        variant === 'dark' ? 'bg-[#F4F1E8]' : 'bg-[#EAE7DC]'
      )}
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Stage heading */}
        <div className="flex items-start gap-4 mb-10">
          {/* Stage number — subtle, navy */}
          <div className="shrink-0 mt-1">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#08212C] text-white/70 text-sm font-bold">
              {String(stageNumber).padStart(2, '0')}
            </span>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#18242B] mb-2">{title}</h2>
            <p className="text-[#5F6B70] text-base leading-relaxed max-w-2xl">{description}</p>
          </div>
        </div>

        {/* Thin gold accent rule */}
        <div
          aria-hidden="true"
          className="w-10 h-0.5 rounded-full mb-10"
          style={{ background: 'linear-gradient(90deg, #D4AF37, #E0C35C)' }}
        />

        {/* Stage content */}
        {children}
      </div>
    </section>
  );
}
