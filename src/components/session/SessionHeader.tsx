// =============================================================================
// SessionHeader — Learning Sessions Prototype
// =============================================================================

import { Clock, Layers, FlaskConical } from 'lucide-react';
import type { LearningSession } from '@/types/learning-session';

interface Props {
  session: LearningSession;
}

const STATUS_STYLES = {
  prototype: 'bg-amber-500/15 text-amber-400 border border-amber-400/30',
  active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-400/30',
  archived: 'bg-gray-500/15 text-gray-400 border border-gray-400/30',
};

const STATUS_LABELS = {
  prototype: '⚗ Prototype',
  active: '● Active Session',
  archived: '○ Archived',
};

export default function SessionHeader({ session }: Props) {
  return (
    <header className="relative bg-[#0A1929] border-b border-white/10 overflow-hidden">
      {/* Subtle background gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 60% -10%, rgba(74,144,226,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
        {/* Breadcrumb */}
        <p className="text-xs font-semibold text-[#4A90E2] uppercase tracking-[0.15em] mb-4">
          {session.track} · Session {String(session.sessionNumber).padStart(2, '0')}
        </p>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5 max-w-3xl">
          {session.title}
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-gray-400 leading-relaxed mb-8 max-w-2xl">
          {session.description}
        </p>

        {/* Central question callout */}
        <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-4 mb-8 max-w-2xl">
          <span className="text-[#D4AF37] mt-0.5 shrink-0 text-lg">⊙</span>
          <div>
            <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-1">
              Central Question
            </p>
            <p className="text-sm text-white/80 italic leading-relaxed">
              &ldquo;{session.centralQuestion}&rdquo;
            </p>
          </div>
        </div>

        {/* Badge row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[session.status]}`}
          >
            {STATUS_LABELS[session.status]}
          </span>

          {/* Time */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
            <Clock size={12} />
            {session.estimatedTime}
          </span>

          {/* Output badges */}
          {session.outputBadges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#4A90E2]/10 text-[#4A90E2] border border-[#4A90E2]/20"
            >
              <Layers size={11} />
              {badge}
            </span>
          ))}

          {/* Stage count */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-400 border border-white/10 ml-auto">
            <FlaskConical size={11} />
            7 stages
          </span>
        </div>
      </div>
    </header>
  );
}
