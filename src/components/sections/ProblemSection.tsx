import { Cpu, Zap, Target } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';

const problems = [
  {
    icon: Target,
    title: 'The Theory-to-Practice Gap',
    description:
      'Many learners encounter advanced AI, quantitative finance, and research concepts in theory, but rarely get structured opportunities to apply them through realistic projects and technical collaboration.',
  },
  {
    icon: Zap,
    title: 'Accelerating Technical Complexity',
    description:
      'AI, quantitative finance, neuroscience, and emerging deep-tech methods are evolving faster than many traditional learning environments can adapt.',
  },
  {
    icon: Cpu,
    title: 'The Need for Applied Communities',
    description:
      'Strong technical judgment is built through reading, discussion, experimentation, real datasets, and project-based collaboration, not only lectures or generic tutorials.',
  },
];

export default function ProblemSection() {
  return (
    <section id="the-challenge" className="py-24 bg-[#F5F7FA]">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          title="The Challenge"
          subtitle="Advanced technologies are evolving quickly, but many students, researchers, and professionals still lack structured spaces to connect theory, research, and real-world application."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem) => (
            <Card key={problem.title} id={`problem-${problem.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-[#4A90E2]/10 mb-5">
                <problem.icon className="text-[#4A90E2]" size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#0A1929] mb-3">{problem.title}</h3>
              <p className="text-[#2C3E50] leading-relaxed">{problem.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
