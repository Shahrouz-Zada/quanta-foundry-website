import type { Metadata } from 'next';
import { BookOpen, Calendar, Clock, MapPin, Users, Sparkles, MessageCircle, Lightbulb } from 'lucide-react';
import { upcomingEvents, pastEvents } from '@/data/events';
import { formatDate } from '@/lib/utils';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ReadingClubForm from '@/components/forms/ReadingClubForm';

export const metadata: Metadata = {
  title: 'Community',
  description:
    'Join the Quanta Foundry community. Participate in our Reading Club, attend events, and connect with fellow deep-tech professionals.',
};

const values = [
  { icon: BookOpen, title: 'Rigorous Reading', description: 'We engage with original papers, technical articles, and serious source material.' },
  { icon: MessageCircle, title: 'Open Discussion', description: 'Every serious perspective is welcome. We debate ideas, assumptions, and methods, not people.' },
  { icon: Users, title: 'Collaboration', description: 'Learning is a collective process. We build understanding through discussion and shared technical curiosity.' },
  { icon: Lightbulb, title: 'Intellectual Curiosity', description: 'We follow questions across disciplines, from AI and markets to neuroscience, decision-making, and emerging technologies.' },
];

export default function CommunityPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#0A1929]">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Quanta Reading Club
          </h1>
          <div className="h-[3px] w-16 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E0C35C] mx-auto mb-6" />
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            A bi-weekly technical reading community exploring AI, quantitative finance, neuroscience, market behavior, and emerging deep-tech ideas.
          </p>
        </div>
      </section>

      {/* Reading Club */}
      <section className="py-20 bg-[#F5F7FA]">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading title="The Reading Club" subtitle="Bi-weekly discussions around research papers, technical articles, and applied ideas in AI, quantitative finance, neuroscience, market behavior, and complex systems." accentColor="electric" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div>
              <p className="text-[#2C3E50] leading-relaxed mb-6">
                The Quanta Foundry Reading Club is a bi-weekly gathering where we discuss research papers, technical articles, and emerging ideas across AI, machine learning, quantitative finance, neuroscience, market behavior, and complex systems. Each session is structured around one or two selected readings, with a facilitator guiding the discussion and participants contributing their perspectives.
              </p>
              <p className="text-[#2C3E50] leading-relaxed mb-6">
                You do not need to be enrolled in any program to participate. The Reading Club is open to motivated students, researchers, professionals, and curious minds willing to engage seriously with technical material.
              </p>
              <div className="flex items-center gap-2 text-sm text-[#4A90E2]">
                <Sparkles size={16} />
                <span>Free to attend · No enrollment required</span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full max-w-sm p-8 rounded-2xl bg-gradient-to-br from-[#4A90E2]/10 to-[#D4AF37]/5 border border-[#4A90E2]/10 text-center">
                <BookOpen className="mx-auto text-[#4A90E2] mb-4" size={40} />
                <p className="text-2xl font-bold text-[#0A1929] mb-1">Bi-Weekly Reading Sessions</p>
                <p className="text-[#2C3E50] text-sm">Papers · Articles · Discussion · Applications</p>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <div className="mb-16 bg-white border border-[#4A90E2]/10 rounded-2xl p-8 shadow-sm" id="reading-club-signup">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-[#0A1929] mb-2">Join the Reading List</h3>
              <p className="text-[#2C3E50]">Receive upcoming reading topics, session dates, and discussion notes.</p>
            </div>
            <div className="max-w-xl mx-auto">
              <ReadingClubForm />
            </div>
          </div>

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <>
              <h3 className="text-xl font-bold text-[#0A1929] mb-6">Planned Discussion Themes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} id={`event-${event.id}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={event.status === 'planned' ? 'warning' : 'success'}>
                        {event.status === 'planned' ? 'Planned' : 'Upcoming'}
                      </Badge>
                      <Badge variant="info">{event.topic}</Badge>
                    </div>
                    <h4 className="text-lg font-bold text-[#0A1929] mb-2">{event.title}</h4>
                    <p className="text-sm text-[#2C3E50] leading-relaxed mb-4">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {event.date === 'TBA' ? 'Date to be announced' : formatDate(event.date)}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {event.time}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <>
              <h3 className="text-xl font-bold text-[#0A1929] mb-6">Example Reading Themes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastEvents.map((event) => (
                  <Card key={event.id} className="opacity-80" id={`event-${event.id}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="default">Past</Badge>
                      <Badge variant="info">{event.topic}</Badge>
                    </div>
                    <h4 className="text-lg font-bold text-[#0A1929] mb-2">{event.title}</h4>
                    <p className="text-sm text-[#2C3E50] leading-relaxed mb-4">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(event.date)}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Community Values */}
      <section className="py-20 bg-[#0A1929]">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading title="Our Values" light accentColor="gold" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v) => (
              <div key={v.title} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#4A90E2]/10 mb-4">
                  <v.icon className="text-[#4A90E2]" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{v.title}</h3>
                <p className="text-sm text-gray-400">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
