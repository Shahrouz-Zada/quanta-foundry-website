import type { Metadata } from 'next';
import { Lightbulb, UserCheck, GraduationCap, ArrowRight, MessageSquare, Search, Handshake, Rocket } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import CorporateInquiryForm from '@/components/forms/CorporateInquiryForm';

export const metadata: Metadata = {
  title: 'For Partners',
  description:
    'Partner with Quanta Foundry: sponsor applied projects, hire trained talent, or commission custom executive training programs.',
};

const partnerships = [
  {
    icon: Lightbulb,
    title: 'Project Use Cases',
    description: 'Propose a technical, analytical, or research-oriented challenge that could become a Workspace Q project, feasibility note, applied case study, or discussion theme.',
    benefits: ['Realistic project-based exploration', 'Technical notes or prototype outputs', 'Fresh perspectives from selected contributors', 'Possible continuation into deeper collaboration'],
  },
  {
    icon: UserCheck,
    title: 'Contributor Collaboration',
    description: 'Engage with selected students, researchers, and technical contributors through project-based work, technical discussions, reading sessions, and applied research activities.',
    benefits: ['Access to motivated technical contributors', 'Project-based evaluation of skills', 'Research and discussion-driven engagement', 'Potential future collaboration or hiring pathway'],
  },
  {
    icon: GraduationCap,
    title: 'Technical Workshops & Discussions',
    description: 'Organize focused sessions around AI, quantitative finance, data workflows, market systems, neuroscience, or emerging deep-tech methods for teams, students, or research communities.',
    benefits: ['Tailored technical content', 'Practical examples and discussion formats', 'Alignment with community or organization needs', 'Clear learning and collaboration outcomes'],
  },
];

const steps = [
  { icon: MessageSquare, title: 'Initial Conversation', description: 'We discuss your idea, technical challenge, organization context, and potential collaboration format.' },
  { icon: Search, title: 'Define the Format', description: 'We define whether the idea fits a reading session, Workspace Q project, technical workshop, or partner use case.' },
  { icon: Handshake, title: 'Launch the Collaboration', description: 'We begin the agreed format, such as a reading discussion, project challenge, workshop, or exploratory collaboration.' },
  { icon: Rocket, title: 'Share Outputs & Next Steps', description: 'We share notes, findings, prototypes, discussion outcomes, or recommendations for possible next steps.' },
];

export default function CompaniesPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#0A1929]">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            For Partners
          </h1>
          <div className="h-[3px] w-16 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E0C35C] mx-auto mb-6" />
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Collaborate with Quanta Foundry by proposing use cases, supporting applied projects, contributing to reading discussions, or engaging with selected technical contributors.
          </p>
        </div>
      </section>

      {/* Partnership Models */}
      <section className="py-20 bg-[#F5F7FA]">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading title="Ways to Collaborate" subtitle="Flexible collaboration paths for organizations, schools, labs, and industry partners interested in applied AI, quantitative finance, neuroscience and markets, or emerging deep-tech methods." accentColor="electric" />
          <div className="space-y-8">
            {partnerships.map((p) => (
              <Card key={p.title} className="p-8" id={`partnership-${p.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4A90E2]/10">
                        <p.icon className="text-[#4A90E2]" size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-[#0A1929]">{p.title}</h3>
                    </div>
                    <p className="text-[#2C3E50] leading-relaxed">{p.description}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#0A1929] uppercase tracking-wider mb-3">Key Benefits</h4>
                    <ul className="space-y-2">
                      {p.benefits.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-sm text-[#2C3E50]">
                          <ArrowRight className="text-[#4A90E2] shrink-0" size={14} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading title="How It Works" subtitle="A simple process to explore whether an idea, use case, or discussion topic fits the Quanta Foundry ecosystem." accentColor="gold" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center" id={`step-${i + 1}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0A1929] mb-4">
                  <step.icon className="text-[#4A90E2]" size={24} />
                </div>
                <div className="text-sm font-bold text-[#4A90E2] mb-2">Step {i + 1}</div>
                <h3 className="text-lg font-bold text-[#0A1929] mb-2">{step.title}</h3>
                <p className="text-sm text-[#2C3E50]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-[#F5F7FA]" id="corporate-contact">
        <div className="mx-auto max-w-2xl px-6">
          <SectionHeading title="Get in Touch" subtitle="Tell us about your organization, idea, or use case and how you would like to collaborate." accentColor="electric" />
          <Card className="p-8">
            <CorporateInquiryForm />
          </Card>
        </div>
      </section>
    </>
  );
}
