import type { Metadata } from 'next';
import {
  BookOpen,
  MessageCircle,
  Users,
  Lightbulb,
  Clock,
  MapPin,
  ExternalLink,
  ArrowRight,
  Sparkles,
  FileText,
} from 'lucide-react';
import { getFeaturedReadingList } from '@/data/readingClub/readingList';
import { insights } from '@/data/insights';
import ReadingClubRegistrationForm from '@/components/forms/ReadingClubRegistrationForm';
import ReadingTracksPanel from '@/components/community/ReadingTracksPanel';

export const metadata: Metadata = {
  title: 'Reading Club',
  description:
    'Quanta Reading Club — a multi-track technical reading community exploring Applied AI, Quantitative Finance, Neuroscience & Markets, and Quantum Software through structured biweekly sessions.',
  alternates: { canonical: 'https://www.quantafoundry.com/community' },
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
    description:
      'Every serious perspective is welcome. We debate ideas, assumptions, and methods, not people.',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description:
      'Learning is a collective process. We build understanding through discussion and shared curiosity.',
  },
  {
    icon: Lightbulb,
    title: 'Intellectual Curiosity',
    description:
      'We follow questions across disciplines — from AI and markets to neuroscience and emerging technologies.',
  },
];

export default function CommunityPage() {
  const featuredReadings = getFeaturedReadingList();
  // Past technical notes = published insights tagged with 'reading club'
  const publishedNotes = insights.filter(
    (i) => i.date !== 'Coming Soon' && i.tags.includes('reading club')
  );

  return (
    <>
      {/* ===================================================================
          1. HERO
      ==================================================================== */}
      <section className="pt-32 pb-20 bg-[#0A1929] relative overflow-hidden">
        {/* Background glows */}
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
            A biweekly technical reading community exploring AI, quantitative finance,
            neuroscience, and quantum computing — through structured sessions, reproducible
            notebooks, and serious discussion.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#4A90E2]" /> 90 minutes per session
            </span>
            <span className="text-gray-600">·</span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-[#4A90E2]" /> Online via Zoom
            </span>
            <span className="text-gray-600">·</span>
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-[#4A90E2]" /> Open to all backgrounds
            </span>
          </div>
        </div>
      </section>

      {/* ===================================================================
          2. READING TRACKS (interactive tabbed panel)
      ==================================================================== */}
      <ReadingTracksPanel />

      {/* ===================================================================
          3. REGISTRATION FORM
      ==================================================================== */}
      <section id="register" className="py-20 bg-[#0A1929]">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles size={12} /> Register
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Register for Reading Club Updates
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">
              Register to receive session invitations, reading materials, and notebook releases for
              the tracks that interest you. No commitment required — you can start with updates and
              join live sessions when you are ready.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8 sm:p-10">
            <ReadingClubRegistrationForm />
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            The Reading Club is free to join. Live session participation is limited to 25–30
            members per cohort.
          </p>
        </div>
      </section>

      {/* ===================================================================
          4. READING LIST
      ==================================================================== */}
      <section id="reading-list" className="py-20 bg-[#F5F7FA]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-[#4A90E2]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#4A90E2]">
                  Curated Resources
                </span>
              </div>
              <h2 className="text-3xl font-bold text-[#0A1929]">Reading List</h2>
              <p className="text-gray-500 mt-1 text-sm">
                Core papers, books, and resources referenced across sessions.
              </p>
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
                      {entry.title}{' '}
                      <ExternalLink size={11} className="flex-shrink-0 text-gray-400" />
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
          5. SESSION NOTES (past outputs) — only shown if notes exist
      ==================================================================== */}
      {publishedNotes.length > 0 && (
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                Outputs
              </span>
            </div>
            <h2 className="text-3xl font-bold text-[#0A1929] mb-8">
              Session Notes &amp; Technical Outputs
            </h2>

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
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {note.excerpt}
                  </p>
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
          6. COMMUNITY VALUES
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
