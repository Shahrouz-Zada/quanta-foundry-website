import { Lightbulb, UserCheck, GraduationCap } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const services = [
  {
    icon: Lightbulb,
    title: 'Project Use Cases',
    description: 'Propose a technical, analytical, or research-oriented challenge that could become a structured Workspace Q project, feasibility note, or applied case study.',
  },
  {
    icon: UserCheck,
    title: 'Contributor Collaboration',
    description: 'Engage with selected students, researchers, and technical contributors through project-based work, technical discussions, and applied research activities.',
  },
  {
    icon: GraduationCap,
    title: 'Technical Workshops',
    description: 'Organize focused sessions around AI, quantitative finance, data workflows, market systems, or emerging deep-tech methods for teams, students, or research communities.',
  },
];

export default function CompaniesPreview() {
  return (
    <section id="for-companies" className="py-24 bg-[#0A1929]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Value Proposition */}
          <div>
            <SectionHeading
              title="For Partners"
              subtitle="Companies, schools, labs, and institutions can collaborate with Quanta Foundry by proposing use cases, supporting applied projects, or contributing to technical discussions."
              centered={false}
              light
            />
            <p className="text-gray-400 leading-relaxed mb-8">
              Quanta Foundry welcomes partners who want to connect research-oriented ideas with motivated students, researchers, and technical contributors. Collaborations may take the form of project use cases, reading club contributions, technical workshops, or structured Workspace Q challenges.
            </p>
            <Button href="/companies" variant="secondary" id="companies-cta">
              Propose a Use Case →
            </Button>
          </div>

          {/* Right: Service Cards */}
          <div className="space-y-6">
            {services.map((service) => (
              <Card key={service.title} variant="dark" id={`service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4A90E2]/10 shrink-0 mt-1">
                    <service.icon className="text-[#4A90E2]" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
