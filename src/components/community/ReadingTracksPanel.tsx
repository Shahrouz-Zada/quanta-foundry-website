'use client';

// =============================================================================
// ReadingTracksPanel — Interactive tabbed track + accordion session interface
// =============================================================================

import { useState, useCallback, useRef, KeyboardEvent } from 'react';
import {
  TrendingUp,
  Brain,
  Activity,
  Cpu,
  BookOpen,
  ChevronDown,
  ExternalLink,
  FileText,
  Code,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { readingTracks, ReadingTrack, TrackModule } from '@/data/readingClub/tracks';
import { readingClubSessions, ReadingClubSession } from '@/data/readingClub/sessions';

// ============================================================
// Constants
// ============================================================

const TRACK_ICON_MAP: Record<
  string,
  React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
> = { TrendingUp, Brain, Activity, Cpu, BookOpen };

const SESSION_FORMAT = [
  {
    duration: '15 min',
    label: 'Context & Intuition',
    description: 'Facilitator sets the scene — why this topic matters, real-world framing, key visuals',
  },
  {
    duration: '25 min',
    label: 'Paper Discussion',
    description: 'Structured discussion of the core reading — key claims, methodology, limitations',
  },
  {
    duration: '20 min',
    label: 'Notebook Walkthrough',
    description: "Live code demo or pre-recorded walkthrough of the session's Python notebook",
  },
  {
    duration: '20 min',
    label: 'Open Discussion',
    description: 'Discussion questions, debate, connections to previous sessions',
  },
  {
    duration: '10 min',
    label: 'Project Ideas & Next Steps',
    description: 'Mini-project announcement, preview of next session, participant feedback',
  },
];

const SESSION_OUTPUTS = [
  'Technical note (website)',
  'Reproducible notebook (GitHub)',
  'Reading list entry',
  'Mini-project idea',
];

// ============================================================
// Helpers
// ============================================================

function getSessionsForModule(
  allSessions: ReadingClubSession[],
  sessionIds: string[]
): ReadingClubSession[] {
  return sessionIds
    .map((id) => allSessions.find((s) => s.id === id))
    .filter((s): s is ReadingClubSession => s !== undefined);
}

function getFirstSessionId(
  track: ReadingTrack,
  allSessions: ReadingClubSession[]
): string | null {
  if (track.modules.length === 0) return null;
  const firstIds = track.modules[0]?.sessionIds ?? [];
  return allSessions.find((s) => firstIds.includes(s.id))?.id ?? null;
}

// ============================================================
// Small display components
// ============================================================

function StatusBadge({ status }: { status: ReadingClubSession['status'] }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    upcoming: { bg: 'bg-[#4A90E2]/10', text: 'text-[#4A90E2]', label: 'Upcoming' },
    past: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Past' },
    planned: { bg: 'bg-gray-100', text: 'text-gray-400', label: 'Planned' },
  };
  const c = config[status] ?? config.planned;
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}
    >
      {c.label}
    </span>
  );
}

function OutputBadge({ type }: { type: 'Note' | 'Notebook' | 'Project' }) {
  const config: Record<string, string> = {
    Note: 'bg-[#D4AF37]/10 text-[#8B6914]',
    Notebook: 'bg-emerald-50 text-emerald-700',
    Project: 'bg-purple-50 text-purple-700',
  };
  const emoji: Record<string, string> = { Note: '📄', Notebook: '💻', Project: '🎯' };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config[type]}`}>
      {emoji[type]} {type}
    </span>
  );
}

// ============================================================
// Session Accordion
// ============================================================

function SessionAccordion({
  session,
  isOpen,
  onToggle,
  accent,
}: {
  session: ReadingClubSession;
  isOpen: boolean;
  onToggle: () => void;
  accent: string;
}) {
  const numStr = String(session.number).padStart(2, '0');
  const isDetailed = session.status === 'upcoming' || session.status === 'past';

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200 bg-white ${
        isOpen ? 'border-gray-300 shadow-sm' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50/60 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2] focus-visible:ring-inset"
      >
        {/* Number badge */}
        <div
          className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-colors"
          style={{
            background: isOpen ? accent + '20' : '#F1F5F9',
            color: isOpen ? accent : '#94A3B8',
          }}
        >
          {numStr}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <StatusBadge status={session.status} />
            {session.outputBadges?.map((b) => (
              <OutputBadge key={b} type={b} />
            ))}
          </div>
          <p className="text-sm font-semibold text-[#0A1929] leading-snug group-hover:text-[#1e3a5f] transition-colors line-clamp-2">
            {session.title}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-1">{session.theme}</p>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={15}
          className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Body */}
      {isOpen && (
        <div className="px-4 pb-5 pt-2 border-t border-gray-100 space-y-4">
          {isDetailed ? (
            <>
              <p className="text-sm text-gray-600 leading-relaxed italic">{session.theme}</p>

              {/* Readings */}
              {(session.accessibleReading?.title || session.corePaper?.title) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {session.accessibleReading?.title && (
                    <div className="p-3 rounded-lg bg-[#F5F7FA] border border-gray-100">
                      <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1.5">
                        Accessible Reading
                      </p>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {session.accessibleReading.url ? (
                          <a
                            href={session.accessibleReading.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#4A90E2] hover:underline inline-flex items-center gap-0.5"
                          >
                            {session.accessibleReading.title} <ExternalLink size={9} />
                          </a>
                        ) : (
                          session.accessibleReading.title
                        )}
                        {session.accessibleReading.authors && (
                          <span className="text-gray-400">
                            {' '}— {session.accessibleReading.authors}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  {session.corePaper?.title && (
                    <div className="p-3 rounded-lg bg-[#F5F7FA] border border-gray-100">
                      <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1.5">
                        Core Paper
                      </p>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {session.corePaper.url ? (
                          <a
                            href={session.corePaper.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#4A90E2] hover:underline inline-flex items-center gap-0.5"
                          >
                            {session.corePaper.title} <ExternalLink size={9} />
                          </a>
                        ) : (
                          session.corePaper.title
                        )}
                        {session.corePaper.authors && (
                          <span className="text-gray-400"> — {session.corePaper.authors}</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Discussion questions */}
              {session.discussionQuestions && session.discussionQuestions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#0A1929] mb-2">Discussion Questions</p>
                  <ol className="space-y-1.5 list-none">
                    {session.discussionQuestions.map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <span
                          className="flex-shrink-0 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center mt-0.5 text-white"
                          style={{ background: accent }}
                        >
                          {i + 1}
                        </span>
                        {q}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Mini-project */}
              {session.miniProject && (
                <div
                  className="p-3 rounded-lg border"
                  style={{
                    background: accent + '08',
                    borderColor: accent + '20',
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-wide mb-1"
                    style={{ color: accent }}
                  >
                    Mini-Project Idea
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed">{session.miniProject}</p>
                </div>
              )}

              {/* Links */}
              {(session.notebookUrl || session.noteSlug) && (
                <div className="flex flex-wrap gap-4 pt-1">
                  {session.notebookUrl && (
                    <a
                      href={session.notebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <Code size={12} /> View Notebook
                    </a>
                  )}
                  {session.noteSlug && (
                    <a
                      href={`/insights/${session.noteSlug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A90E2] hover:text-[#357ABD] transition-colors"
                    >
                      <FileText size={12} /> Read Session Notes
                    </a>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Planned session — minimal content */
            <div className="flex items-start gap-2 text-xs text-gray-400">
              <Lock size={12} className="flex-shrink-0 mt-0.5" />
              <span>
                Reading materials and notebooks will be shared closer to the session date. Register
                for updates to be notified when this session is announced.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Module Section
// ============================================================

function ModuleSection({
  mod,
  allSessions,
  openSessionId,
  onToggleSession,
  accent,
}: {
  mod: TrackModule;
  allSessions: ReadingClubSession[];
  openSessionId: string | null;
  onToggleSession: (id: string) => void;
  accent: string;
}) {
  const sessions = getSessionsForModule(allSessions, mod.sessionIds);
  return (
    <div>
      {/* Module header */}
      <div className="pl-4 mb-3" style={{ borderLeft: `2px solid ${accent}40` }}>
        <h4 className="text-sm font-bold text-[#0A1929]">{mod.title}</h4>
        {mod.description && (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{mod.description}</p>
        )}
      </div>
      {/* Sessions */}
      <div className="space-y-2 ml-1">
        {sessions.map((s) => (
          <SessionAccordion
            key={s.id}
            session={s}
            isOpen={openSessionId === s.id}
            onToggle={() => onToggleSession(s.id)}
            accent={accent}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Track Overview (shared between Active + Coming Soon)
// ============================================================

function TrackOverviewGrid({ track }: { track: ReadingTrack }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {[
          { label: 'Cadence', value: track.format.cadence },
          { label: 'Duration', value: track.format.duration },
          { label: 'Location', value: track.format.location },
          { label: 'Cohort size', value: track.format.cohortSize },
        ].map((item) => (
          <div key={item.label} className="p-2.5 rounded-lg bg-[#F5F7FA] border border-gray-100">
            <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide font-semibold">
              {item.label}
            </p>
            <p className="text-xs font-semibold text-[#0A1929]">{item.value}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="text-xs font-semibold text-[#0A1929] mb-2">Prerequisites</p>
        <ul className="space-y-1.5">
          {track.prerequisites.map((req, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
              <span
                className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                style={{ background: track.accent }}
              />
              {req}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

// ============================================================
// Active Track Content
// ============================================================

function ActiveTrackContent({
  track,
  openSessionId,
  onToggleSession,
}: {
  track: ReadingTrack;
  openSessionId: string | null;
  onToggleSession: (id: string) => void;
}) {
  const trackSessions = readingClubSessions.filter((s) => s.trackId === track.id);
  const hasModules = track.modules.length > 0;

  return (
    <div className="space-y-8">
      {/* Track overview panel */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column */}
          <div>
            <div
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{
                background: track.accent + '18',
                color: track.accent,
                border: `1px solid ${track.accent}35`,
              }}
            >
              {track.badge}
            </div>
            <h3 className="text-xl font-bold text-[#0A1929] mb-3 leading-tight">{track.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">{track.longDescription}</p>
            <TrackOverviewGrid track={track} />
          </div>

          {/* Right column: session format */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#0A1929] mb-3">
              Session Format (90 minutes)
            </p>
            <div className="space-y-2 mb-5">
              {SESSION_FORMAT.map((block) => (
                <div
                  key={block.label}
                  className="flex gap-3 p-3 rounded-lg bg-[#F5F7FA] border border-gray-100"
                >
                  <div className="flex-shrink-0 w-12 text-right">
                    <span className="text-[11px] font-bold" style={{ color: track.accent }}>
                      {block.duration}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#0A1929]">{block.label}</p>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{block.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#F5F7FA] border border-gray-100">
              <p className="text-xs font-semibold text-[#0A1929] mb-2">Each session produces</p>
              <div className="grid grid-cols-2 gap-1.5">
                {SESSION_OUTPUTS.map((output) => (
                  <div key={output} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                    <span
                      className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{ background: track.accent }}
                    />
                    {output}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module roadmap */}
      {hasModules ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: track.accent }}
              >
                Season 1 Roadmap · {track.sessionCount ?? trackSessions.length} Sessions
              </p>
              <h3 className="text-xl font-bold text-[#0A1929]">Session Schedule</h3>
              <p className="text-sm text-gray-500 mt-1">
                First 4 sessions announced. Full roadmap revealed after Session 4.
              </p>
            </div>
            <a
              href="#register"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A90E2] hover:text-[#357ABD] transition-colors"
            >
              Register for updates <ArrowRight size={12} />
            </a>
          </div>

          <div className="space-y-8">
            {track.modules.map((mod) => (
              <ModuleSection
                key={mod.id}
                mod={mod}
                allSessions={trackSessions}
                openSessionId={openSessionId}
                onToggleSession={onToggleSession}
                accent={track.accent}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Active track, no roadmap yet (e.g. Applied AI) */
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6">
          <p className="text-sm font-semibold text-[#0A1929] mb-2">
            Session archive being compiled
          </p>
          <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-lg">
            This track is actively running. Session notes, notebooks, and the reading roadmap will
            be published here soon. Register for updates to be notified.
          </p>

          {track.plannedThemes && track.plannedThemes.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#0A1929] mb-3 uppercase tracking-wide">
                Topics covered in this track
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {track.plannedThemes.map((theme, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <span
                      className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
                      style={{ background: track.accent }}
                    />
                    {theme}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <div>
        <a
          href="#register"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 shadow-md hover:shadow-lg"
          style={{ background: track.accent }}
        >
          {track.ctaLabel} <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}

// ============================================================
// Coming-Soon Track Content
// ============================================================

function ComingSoonContent({ track }: { track: ReadingTrack }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column */}
        <div>
          <div
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{
              background: track.accent + '12',
              color: track.accent,
              border: `1px solid ${track.accent}25`,
            }}
          >
            {track.badge}
          </div>
          <h3 className="text-xl font-bold text-[#0A1929] mb-3 leading-tight">{track.title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-5">{track.longDescription}</p>

          <TrackOverviewGrid track={track} />

          <div className="mt-6">
            <a
              href="#register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 shadow-md hover:shadow-lg"
              style={{ background: track.accent }}
            >
              {track.ctaLabel} <ArrowRight size={14} />
            </a>
            <p className="text-xs text-gray-400 mt-3">
              First sessions will be announced to registered members.
            </p>
          </div>
        </div>

        {/* Right column: planned themes */}
        {track.plannedThemes && track.plannedThemes.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#0A1929] mb-4">
              Planned Reading Themes
            </p>
            <ul className="space-y-2.5">
              {track.plannedThemes.map((theme, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[#F5F7FA] border border-gray-100"
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ background: track.accent }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed">{theme}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Main Export
// ============================================================

export default function ReadingTracksPanel() {
  const [activeTrackId, setActiveTrackId] = useState('quant-finance');
  const [openSessionId, setOpenSessionId] = useState<string | null>('qf-s1');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeTrack = readingTracks.find((t) => t.id === activeTrackId) ?? readingTracks[0];

  const handleTrackChange = useCallback(
    (trackId: string) => {
      if (trackId === activeTrackId) return;
      setActiveTrackId(trackId);
      const track = readingTracks.find((t) => t.id === trackId);
      if (track?.readingTrackStatus === 'active' && track.modules.length > 0) {
        setOpenSessionId(getFirstSessionId(track, readingClubSessions));
      } else {
        setOpenSessionId(null);
      }
    },
    [activeTrackId]
  );

  const handleToggleSession = useCallback((sessionId: string) => {
    setOpenSessionId((prev) => (prev === sessionId ? null : sessionId));
  }, []);

  const handleTabKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const total = readingTracks.length;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = (index + 1) % total;
        tabRefs.current[next]?.focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = (index - 1 + total) % total;
        tabRefs.current[prev]?.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTrackChange(readingTracks[index].id);
      }
    },
    [handleTrackChange]
  );

  return (
    <section id="reading-tracks" className="py-20 bg-[#F5F7FA]">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#0A1929] mb-3">Reading Tracks</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            Structured biweekly reading tracks across quantitative finance, applied AI, neuroscience
            and markets, and emerging deep-tech methods.
          </p>
        </div>

        {/* Track Tab Cards */}
        <div
          role="tablist"
          aria-label="Reading Tracks"
          className="flex gap-3 mb-8 overflow-x-auto pb-2 snap-x scroll-pb-2"
        >
          {readingTracks.map((track, index) => {
            const Icon = TRACK_ICON_MAP[track.icon] ?? BookOpen;
            const isActive = track.id === activeTrackId;
            return (
              <button
                key={track.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                role="tab"
                aria-selected={isActive}
                aria-controls={`track-panel-${track.id}`}
                id={`track-tab-${track.id}`}
                onClick={() => handleTrackChange(track.id)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
                tabIndex={isActive ? 0 : -1}
                className={`relative flex-shrink-0 snap-start w-52 sm:w-56 p-4 rounded-2xl border text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4A90E2] ${
                  isActive
                    ? 'bg-[#0A1929] shadow-lg'
                    : 'bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
                style={{
                  borderColor: isActive ? track.accent + '55' : '#E2E8F0',
                }}
              >
                {/* Icon + badge */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: isActive ? track.accent + '20' : '#F1F5F9' }}
                  >
                    <Icon size={18} style={{ color: isActive ? track.accent : '#94A3B8' }} />
                  </div>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                    style={{
                      background: isActive ? track.accent + '25' : '#F1F5F9',
                      color: isActive ? track.accent : '#94A3B8',
                    }}
                  >
                    {track.badge}
                  </span>
                </div>

                <p
                  className={`text-sm font-bold mb-1.5 leading-snug ${
                    isActive ? 'text-white' : 'text-[#0A1929]'
                  }`}
                >
                  {track.shortTitle}
                </p>
                <p
                  className={`text-xs leading-relaxed line-clamp-2 ${
                    isActive ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {track.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Tab Panel */}
        <div
          id={`track-panel-${activeTrack.id}`}
          role="tabpanel"
          aria-labelledby={`track-tab-${activeTrack.id}`}
          tabIndex={-1}
          className="focus:outline-none"
        >
          {activeTrack.readingTrackStatus === 'active' ? (
            <ActiveTrackContent
              track={activeTrack}
              openSessionId={openSessionId}
              onToggleSession={handleToggleSession}
            />
          ) : (
            <ComingSoonContent track={activeTrack} />
          )}
        </div>
      </div>
    </section>
  );
}
