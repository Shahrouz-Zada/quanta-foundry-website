import type { Metadata } from 'next';
import { Target, Wrench, Sparkles, BarChart3, Award } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { founder } from '@/data/team';

export const metadata: Metadata = {
  title: 'About',
  description:
    "Learn about Quanta Foundry's mission to bridge academia and industry through applied AI, quantitative finance, and project-based learning.",
};

const pillars = [
  { icon: Target, title: 'Rigor', description: 'We engage seriously with original papers, technical articles, mathematical ideas, and source material.' },
  { icon: Wrench, title: 'Application', description: 'Ideas are explored through notebooks, datasets, simulations, technical notes, and project-based collaboration.' },
  { icon: Sparkles, title: 'Innovation', description: 'We explore emerging methods in AI, quantitative finance, neuroscience, market systems, and future deep-tech fields.' },
  { icon: BarChart3, title: 'Impact', description: 'We aim to transform technical curiosity into shared understanding, practical outputs, and meaningful collaboration.' },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#0A1929]">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            About Quanta Foundry
          </h1>
          <div className="h-[3px] w-16 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E0C35C] mx-auto mb-6" />
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            An independent applied research and project-based learning community exploring AI, quantitative finance, neuroscience and markets, and emerging deep-tech methods.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-[#F5F7FA]">
        <div className="mx-auto max-w-4xl px-6">
          <SectionHeading title="Our Mission" accentColor="electric" />
          <div className="text-center">
            <blockquote className="text-xl sm:text-2xl font-medium text-[#0A1929] leading-relaxed mb-8 italic">
              &ldquo;To build an applied research and learning community that connects rigorous reading, project-based collaboration, and shared technical curiosity.&rdquo;
            </blockquote>
            <p className="text-[#2C3E50] leading-relaxed max-w-3xl mx-auto">
              Quanta Foundry was created for people who want to go beyond passive learning. It brings together motivated students, researchers, professionals, and technical contributors to read, discuss, test, and apply complex ideas in a structured and collaborative environment.
            </p>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading title="Our Approach" subtitle="Four principles that guide the Quanta Foundry ecosystem." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300" id={`about-pillar-${pillar.title.toLowerCase()}`}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#4A90E2]/10 mb-4">
                  <pillar.icon className="text-[#4A90E2]" size={26} />
                </div>
                <h3 className="text-lg font-bold text-[#0A1929] mb-2">{pillar.title}</h3>
                <p className="text-sm text-[#2C3E50]">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20 bg-gradient-to-b from-[#0A1929] to-[#0D2137]">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading title="Founder" light accentColor="gold" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-2 flex justify-center">
              <div className="w-64 h-64 rounded-2xl bg-gradient-to-br from-[#4A90E2]/20 to-[#D4AF37]/10 border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-[#4A90E2]/20 border border-[#4A90E2]/30 flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl font-bold text-[#4A90E2]">
                      {founder.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Photo coming soon</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <h3 className="text-2xl font-bold text-white mb-1">{founder.name}</h3>
              <p className="text-[#4A90E2] font-medium mb-5">{founder.role}</p>
              <p className="text-gray-400 leading-relaxed mb-6">{founder.bio}</p>
              <div className="flex flex-wrap gap-2">
                {founder.credentials.map((cred) => (
                  <Badge key={cred} variant="gold" size="sm">
                    <Award size={12} className="mr-1" />
                    {cred}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <SectionHeading title="Our Vision" subtitle="Building a research-to-practice ecosystem." accentColor="gold" />
          <p className="text-[#2C3E50] leading-relaxed mb-8">
            Quanta Foundry is designed to grow gradually. It begins as a reading club, applied research community, and Workspace Q project environment. Over time, it can evolve into a broader collaboration platform connecting technical contributors, research ideas, partner use cases, and AI-assisted learning tools.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href="/workspace-q" id="about-workspace-cta">Explore Workspace Q</Button>
            <Button href="/community" variant="secondary" id="about-partner-cta">Join Reading Club</Button>
          </div>
        </div>
      </section>
    </>
  );
}
