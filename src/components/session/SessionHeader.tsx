// =============================================================================
// SessionHeader — Learning Sessions Prototype
// Chrome: deep navy-teal (#08212C) behind the transparent Navbar
// Title block: deep emerald (#0E3B35) blending into workspace body
// =============================================================================

import { Clock, Layers, FlaskConical } from 'lucide-react';
import type { LearningSession } from '@/types/learning-session';

interface Props {
  session: LearningSession;
}

const STATUS_STYLES = {
  prototype: 'bg-amber-500/15 text-amber-600 border border-amber-500/30',
  active:    'bg-[#2F8174]/15 text-[#2F8174] border border-[#2F8174]/30',
  archived:  'bg-[#5F6B70]/10 text-[#5F6B70] border border-[#5F6B70]/25',
};

const STATUS_LABELS = {
  prototype: '⚗ Prototype',
  active:    '● Active Session',
  archived:  '○ Archived',
};

export default function SessionHeader({ session }: Props) {
  return (
    <header className="relative overflow-hidden">
      {/* ── Navy chrome block — sits behind the transparent global Navbar ─── */}
      <div className="bg-[#08212C] h-[88px]" aria-hidden="true" />

      {/* ── Emerald title block — blends into the workspace body below ──── */}
      <div className="relative bg-[#0E3B35]">
        {/* Subtle radial highlight */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 80% at 75% 30%, rgba(47,129,116,0.18) 0%, transparent 65%)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 pt-12 pb-14 sm:pt-14 sm:pb-16">
          {/* Track breadcrumb */}
          <p className="text-xs font-semibold text-[#4A90E2] uppercase tracking-[0.15em] mb-4">
            {session.track} · Session {String(session.sessionNumber).padStart(2, '0')}
          </p>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5 max-w-3xl">
            {session.title}
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-white/60 leading-relaxed mb-8 max-w-2xl">
            {session.description}
          </p>

          {/* Central question callout */}
          <div className="flex items-start gap-3 bg-[#08212C]/50 border border-white/10 rounded-xl px-5 py-4 mb-8 max-w-2xl backdrop-blur-sm">
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10">
              <Clock size={12} />
              {session.estimatedTime}
            </span>

            {/* Output badges */}
            {session.outputBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#2F8174]/15 text-[#2F8174] border border-[#2F8174]/25"
              >
                <Layers size={11} />
                {badge}
              </span>
            ))}

            {/* Stage count */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/40 border border-white/10 ml-auto">
              <FlaskConical size={11} />
              7 stages
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
