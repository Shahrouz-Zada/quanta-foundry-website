// =============================================================================
// SessionHeader — Learning Sessions Prototype (compact)
// Now just a slim identification bar; full content lives in the Overview tab.
// =============================================================================

import type { LearningSession } from '@/types/learning-session';

interface Props {
  session: LearningSession;
}

export default function SessionHeader({ session }: Props) {
  return (
    <header className="relative overflow-hidden">
      {/* Navy chrome block — sits behind the transparent global Navbar */}
      <div className="bg-[#08212C] h-[88px]" aria-hidden="true" />

      {/* Compact session identity bar */}
      <div className="bg-[#0E3B35] border-b border-white/8">
        <div className="px-6 py-3.5 flex items-center gap-2.5 min-w-0">
          <span className="text-xs font-semibold text-[#4A90E2] uppercase tracking-[0.12em] shrink-0 whitespace-nowrap">
            {session.track} · Session {String(session.sessionNumber).padStart(2, '0')}
          </span>
          <span className="text-white/15 text-xs" aria-hidden="true">·</span>
          <p className="text-sm font-medium text-white/55 truncate">{session.title}</p>
        </div>
      </div>
    </header>
  );
}
