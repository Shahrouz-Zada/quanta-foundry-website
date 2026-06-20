import { Send, Users, Handshake } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const actions = [
  {
    icon: Users,
    title: 'Join the Reading Club',
    description: 'Participate in bi-weekly discussions around papers, technical articles, and ideas in AI, quantitative finance, neuroscience, and market systems.',
    href: '/community',
    cta: 'Join Reading Club',
    variant: 'primary' as const,
  },
  {
    icon: Send,
    title: 'Explore Workspace Q',
    description: 'Access selected project resources, technical briefs, datasets, notebooks, and contributor opportunities through the private project workspace.',
    href: '/workspace-q',
    cta: 'Enter Workspace Q',
    variant: 'secondary' as const,
  },
  {
    icon: Handshake,
    title: 'Propose a Use Case',
    description: 'Companies, schools, labs, or institutions can propose relevant technical challenges, project ideas, or discussion topics.',
    href: '/companies',
    cta: 'Propose a Use Case',
    variant: 'secondary' as const,
  },
];

export default function CTASection() {
  return (
    <section id="cta" className="py-24 bg-gradient-to-br from-[#4A90E2] via-[#3A7BD0] to-[#0A1929]">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
          Join the Quanta Foundry Ecosystem
        </h2>
        <div className="h-[3px] w-16 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E0C35C] mx-auto mb-6" />
        <p className="text-lg text-white/80 max-w-2xl mx-auto mb-14 leading-relaxed">
          Start with the Reading Club, explore Workspace Q, or propose a relevant use case as a future partner.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {actions.map((action) => (
            <Card key={action.title} variant="dark" className="text-center bg-white/5 backdrop-blur-sm border-white/10" id={`cta-${action.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mx-auto mb-5">
                <action.icon className="text-white" size={26} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{action.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6">{action.description}</p>
              <Button href={action.href} variant={action.variant} size="sm" className="w-full">
                {action.cta}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
