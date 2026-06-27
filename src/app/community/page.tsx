import type { Metadata } from 'next';
import {
  BookOpen,
  TrendingUp,
  Brain,
  Activity,
  Cpu,
  MessageCircle,
  Users,
  Lightbulb,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ArrowRight,
  Sparkles,
  ChevronRight,
  FileText,
  Code,
} from 'lucide-react';
import { readingTracks } from '@/data/readingClub/tracks';
import { getPublicSessionsByTrack } from '@/data/readingClub/sessions';
import { getFeaturedReadingList } from '@/data/readingClub/readingList';
import { insights } from '@/data/insights';
import ReadingClubRegistrationForm from '@/components/forms/ReadingClubRegistrationForm';

export const metadata: Metadata = {
  title: 'Reading Club',
  description:
    'Quanta Reading Club — a multi-track technical reading community exploring Applied AI, Quantitative Finance, Neuroscience & Markets, and Quantum Software through structured biweekly sessions.',
};

// Icon map for track icons
const trackIconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  TrendingUp,
  Brain,
  Activity,
  Cpu,
  BookOpen,
};

// Community values
const values = [
  {
    icon: BookOpen,
    title: 'Rigorous Reading',
    description: 'We engage with original papers, technical articles, and serious source material.',
  },
  {
    icon: MessageCircle,
    title: 'Open Discussion',
    description: 'Every serious perspective is welcome. We debate ideas, assumptions, and methods, not people.',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'Learning is a collective process. We build understanding through discussion and shared curiosity.',
  },
  {
    icon: Lightbulb,
    title: 'Intellectual Curiosity',
    description: 'We follow questions across disciplines — from AI and markets to neuroscience and emerging technologies.',
  },
];

// 90-minute session format breakdown
const sessionFormat = [
  { duration: '15 min', label: 'Context & Intuition', description: 'Facilitator sets the scene — why this topic matters, real-world framing, key visuals' },
  { duration: '25 min', label: 'Paper Discussion', description: 'Structured discussion of the core reading — key claims, methodology, limitations' },
  { duration: '20 min', label: 'Notebook Walkthrough', description: 'Live code demo or pre-recorded walkthrough of the session\'s Python notebook' },
  { duration: '20 min', label: 'Open Discussion', description: 'Discussion questions, debate, connections to previous sessions' },
  { duration: '10 min', label: 'Project Ideas & Next Steps', description: 'Mini-project announcement, preview of next session, participant feedback' },
];

export default function CommunityPage() {
  const quantSessions = getPublicSessionsByTrack('quant-finance');
  const featuredReadings = getFeaturedReadingList();
  // Past technical notes = published insights linked to reading club
  const publishedNotes = insights.filter(
    (i) => i.date !== 'Coming Soon' && i.tags.includes('reading club')
  );

  return (
    <>
      {/* ===================================================================
          1. HERO
      ==================================================================== */}
      <section className="pt-32 pb-20 bg-[#0A1929] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4A90E2]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4AF37]/6 rounded-full blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles size={12} /> Community
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Quanta Reading Club
          </h1>
          <div className="h-[3px] w-16 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E0C35C] mx-auto mb-6" />
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            A biweekly technical reading community exploring AI, quantitative finance, neuroscience, and quantum computing — through structured sessions, reproducible notebooks, and serious discussion.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#4A90E2]" /> 90 minutes per session</span>
            <span className="text-gray-600">·</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#4A90E2]" /> Online via Zoom</span>
            <span className="text-gray-600">·</span>
            <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-[#4A90E2]" /> Open to all backgrounds</span>
          </div>
        </div>
      </section>

      {/* ===================================================================
          2. TRACK OVERVIEW
      ==================================================================== */}
      <section className="py-20 bg-[#F5F7FA]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0A1929] mb-3">Reading Tracks</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Each track is a structured season of biweekly sessions focused on one technical domain. Tracks run independently — you can join one or follow multiple.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {readingTracks.map((track) => {
              const Icon = trackIconMap[track.icon] || BookOpen;
              const isActive = track.status === 'active';
              return (
                <div
                  key={track.id}
                  className={`relative rounded-2xl p-6 border transition-all duration-300 ${
                    isActive
                      ? 'bg-[#0A1929] border-[#D4AF37]/30 shadow-lg shadow-black/10'
                      : 'bg-white border-gray-200 opacity-75'
                  }`}
                >
                  {/* Status badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive ? 'bg-[#D4AF37]/15' : 'bg-gray-100'
                      }`}
                    >
                      <Icon
                        size={20}
                        className={isActive ? 'text-[#D4AF37]' : 'text-gray-400'}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                        isActive
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isActive ? 'Active' : 'Coming Soon'}
                    </span>
                  </div>

                  <h3
                    className={`text-base font-bold mb-2 leading-snug ${
                      isActive ? 'text-white' : 'text-[#0A1929]'
                    }`}
                  >
                    {track.shortTitle}
                  </h3>
                  <p
                    className={`text-xs leading-relaxed mb-3 ${
                      isActive ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {track.description}
                  </p>
                  {isActive && (
                    <div className="flex items-center gap-1 text-xs text-[#D4AF37] font-semibold">
                      <a href="#featured-track" className="hover:underline">
                        Season 1 — Upcoming
                      </a>
                      <ChevronRight size={12} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================================
          3. FEATURED TRACK SPOTLIGHT
      ==================================================================== */}
      <section id="featured-track" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Featured Track</span>
            <span className="flex-1 h-px bg-[#D4AF37]/20" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Track info */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#8B6914] text-xs font-semibold mb-4">
                <TrendingUp size={12} /> Season 1 — Upcoming
              </div>
              <h2 className="text-3xl font-bold text-[#0A1929] mb-4 leading-tight">
                Market Regimes, Risk &amp; Applied ML in Finance
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                A biweekly technical reading group exploring how financial markets shift across regimes, how risk behaves under stress, and how machine learning can support quantitative research. Each session pairs one accessible reading with one serious paper and a reproducible Python notebook.
              </p>

              {/* Format details */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Cadence', value: 'Biweekly' },
                  { label: 'Duration', value: '90 min/session' },
                  { label: 'Location', value: 'Online (Zoom)' },
                  { label: 'Cohort size', value: '25–30 participants' },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-[#F5F7FA] border border-gray-100">
                    <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                    <p className="text-sm font-semibold text-[#0A1929]">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Prerequisites */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-[#0A1929] mb-2">Prerequisites</p>
                <ul className="space-y-1.5">
                  {[
                    'Basic Python proficiency (numpy, pandas)',
                    'Curiosity about financial markets — no finance degree required',
                    'Willingness to engage with one paper and one notebook every two weeks',
                  ].map((req) => (
                    <li key={req} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="#register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#0A1929] font-semibold rounded-xl hover:bg-[#E0C35C] transition-colors text-sm shadow-md shadow-[#D4AF37]/20"
              >
                Register for Updates <ArrowRight size={16} />
              </a>
            </div>

            {/* Right: Session format */}
            <div>
              <p className="text-sm font-semibold text-[#0A1929] mb-4">Session Format (90 minutes)</p>
              <div className="space-y-3">
                {sessionFormat.map((block, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-xl bg-[#F5F7FA] border border-gray-100 hover:border-[#4A90E2]/20 transition-colors"
                  >
                    <div className="flex-shrink-0 w-16 text-right">
                      <span className="text-xs font-bold text-[#4A90E2]">{block.duration}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0A1929] mb-0.5">{block.label}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{block.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Per-session outputs */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-[#4A90E2]/8 to-[#D4AF37]/5 border border-[#4A90E2]/15">
                <p className="text-sm font-semibold text-[#0A1929] mb-3">What each session produces</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Technical note (website)',
                    'Reproducible notebook (GitHub)',
                    'Reading list entry',
                    'Mini-project idea',
                  ].map((output) => (
                    <div key={output} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="w-1 h-1 rounded-full bg-[#4A90E2] flex-shrink-0" />
                      {output}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          4. UPCOMING SESSIONS (first 4 public sessions)
      ==================================================================== */}
      <section id="sessions" className="py-20 bg-[#F5F7FA]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-[#D4AF37]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Quant Finance Track · Season 1</span>
              </div>
              <h2 className="text-3xl font-bold text-[#0A1929]">Upcoming Sessions</h2>
              <p className="text-gray-500 mt-1 text-sm">First 4 sessions announced. Full 12-session roadmap revealed after Session 4.</p>
            </div>
            <a
              href="#register"
              className="self-start md:self-auto inline-flex items-center gap-2 text-sm text-[#4A90E2] font-semibold hover:text-[#357ABD] transition-colors"
            >
              Register for session updates <ArrowRight size={14} />
            </a>
          </div>

          <div className="space-y-4">
            {quantSessions.map((session, index) => (
              <div
                key={session.id}
                id={`session-${session.id}`}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#D4AF37]/30 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Session number */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-[#8B6914]">{session.number}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                          session.status === 'past'
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-[#4A90E2]/10 text-[#4A90E2]'
                        }`}
                      >
                        {session.status === 'past' ? 'Past' : session.date === 'TBA' ? 'Date TBA' : session.date}
                      </span>
                      {session.time && session.date !== 'TBA' && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={10} /> {session.time}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#0A1929] mb-1.5 leading-snug">
                      {session.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      {session.theme}
                    </p>

                    {/* Readings */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {session.accessibleReading?.title && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-[#F5F7FA] border border-gray-100 flex-1">
                          <BookOpen size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-0.5">Accessible Reading</p>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {session.accessibleReading.url ? (
                                <a
                                  href={session.accessibleReading.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#4A90E2] hover:underline inline-flex items-center gap-0.5"
                                >
                                  {session.accessibleReading.title} <ExternalLink size={10} />
                                </a>
                              ) : (
                                session.accessibleReading.title
                              )}
                              {session.accessibleReading.authors && (
                                <span className="text-gray-400"> — {session.accessibleReading.authors}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                      {session.corePaper?.title && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-[#F5F7FA] border border-gray-100 flex-1">
                          <FileText size={14} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-0.5">Core Paper</p>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {session.corePaper.url ? (
                                <a
                                  href={session.corePaper.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#4A90E2] hover:underline inline-flex items-center gap-0.5"
                                >
                                  {session.corePaper.title} <ExternalLink size={10} />
                                </a>
                              ) : (
                                session.corePaper.title
                              )}
                              {session.corePaper.authors && (
                                <span className="text-gray-400"> — {session.corePaper.authors}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Links to notebook/note if available */}
                    {(session.notebookUrl || session.noteSlug) && (
                      <div className="flex flex-wrap gap-3 mt-3">
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
                  </div>

                  {/* Index indicator for desktop */}
                  <div className="hidden md:flex items-center text-gray-200 text-4xl font-bold flex-shrink-0 select-none">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          5. REGISTRATION FORM
      ==================================================================== */}
      <section id="register" className="py-20 bg-[#0A1929]">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles size={12} /> Register
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Register for Reading Club Updates</h2>
            <p className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">
              Register to receive session invitations, reading materials, and notebook releases for the tracks that interest you. No commitment required — you can start with updates and join live sessions when you are ready.
            </p>
          </div>

          {/* Form card — white on dark background */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8 sm:p-10">
            <ReadingClubRegistrationForm />
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            The Reading Club is free to join. Live session participation is limited to 25–30 members per cohort.
          </p>
        </div>
      </section>

      {/* ===================================================================
          6. READING LIST
      ==================================================================== */}
      <section id="reading-list" className="py-20 bg-[#F5F7FA]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-[#4A90E2]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#4A90E2]">Curated Resources</span>
              </div>
              <h2 className="text-3xl font-bold text-[#0A1929]">Reading List</h2>
              <p className="text-gray-500 mt-1 text-sm">Core papers, books, and resources referenced across sessions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredReadings.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[#4A90E2]/30 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#4A90E2] bg-[#4A90E2]/8 px-2 py-0.5 rounded-full">
                    {entry.type}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{entry.year}</span>
                </div>
                <h4 className="text-sm font-bold text-[#0A1929] mb-1 leading-snug">
                  {entry.url ? (
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#4A90E2] transition-colors inline-flex items-center gap-1"
                    >
                      {entry.title} <ExternalLink size={11} className="flex-shrink-0 text-gray-400" />
                    </a>
                  ) : (
                    entry.title
                  )}
                </h4>
                <p className="text-xs text-gray-500 mb-2">{entry.authors}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{entry.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          7. SESSION NOTES (past outputs) — only shown if notes exist
      ==================================================================== */}
      {publishedNotes.length > 0 && (
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Outputs</span>
            </div>
            <h2 className="text-3xl font-bold text-[#0A1929] mb-8">Session Notes & Technical Outputs</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedNotes.map((note) => (
                <a
                  key={note.id}
                  href={`/insights/${note.slug}`}
                  className="group block bg-[#F5F7FA] rounded-xl border border-gray-200 p-5 hover:border-[#4A90E2]/30 hover:bg-white hover:shadow-md transition-all duration-200"
                >
                  <p className="text-xs text-gray-400 mb-2">{note.date}</p>
                  <h3 className="text-sm font-bold text-[#0A1929] mb-2 leading-snug group-hover:text-[#4A90E2] transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{note.excerpt}</p>
                  <div className="flex items-center gap-1 text-xs text-[#4A90E2] font-semibold mt-3">
                    Read note <ArrowRight size={12} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================
          8. COMMUNITY VALUES
      ==================================================================== */}
      <section className="py-20 bg-[#0A1929]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Our Values</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm">
              The principles that guide how we read, discuss, and build understanding together.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v) => (
              <div key={v.title} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#4A90E2]/10 mb-4">
                  <v.icon className="text-[#4A90E2]" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{v.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
