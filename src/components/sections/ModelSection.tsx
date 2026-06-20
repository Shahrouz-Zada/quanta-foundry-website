import { BookOpen, Briefcase, Cpu, Users } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';

const pillars = [
  {
    icon: Users,
    title: 'Reading Club',
    description: 'We organize bi-weekly discussions around papers, technical articles, and emerging ideas in AI, quantitative finance, neuroscience, market systems, and deep-tech methods.',
  },
  {
    icon: Briefcase,
    title: 'Workspace Q',
    description: 'Workspace Q is the private project environment where selected students, researchers, and technical contributors work on structured applied projects and research challenges.',
  },
  {
    icon: Cpu,
    title: 'Applied Projects',
    description: 'Contributors explore realistic use cases, build notebooks, analyze datasets, document findings, and connect advanced concepts to practical applications.',
  },
  {
    icon: BookOpen,
    title: 'Partner Use Cases',
    description: 'Companies, schools, labs, and institutions can propose relevant use cases or technical challenges that may become structured project collaborations.',
  },
];

export default function ModelSection() {
  return (
    <section id="our-model" className="relative py-24 bg-[#0A1929] overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeading
          title="The Quanta Foundry Model"
          subtitle="Our model combines technical reading, applied research, project-based collaboration, and selected partner use cases to help motivated contributors move from advanced ideas to practical understanding."
          light
          accentColor="gold"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="text-center group" id={`pillar-${pillar.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#4A90E2]/10 border border-[#4A90E2]/20 mb-5 transition-all duration-300 group-hover:bg-[#4A90E2]/20 group-hover:shadow-lg group-hover:shadow-[#4A90E2]/10">
                <pillar.icon className="text-[#4A90E2]" size={30} />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{pillar.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
