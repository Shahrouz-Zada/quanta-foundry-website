import AnimatedNeuralNet from '@/components/effects/AnimatedNeuralNet';
import AnimatedStochasticCurve from '@/components/effects/AnimatedStochasticCurve';
import AnimatedBlochSphere from '@/components/effects/AnimatedBlochSphere';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { focusAreas } from '@/data/focusAreas';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain: AnimatedNeuralNet,
  TrendingUp: AnimatedStochasticCurve,
  Atom: AnimatedBlochSphere,
};

export default function FocusAreasPreview() {
  return (
    <section id="focus-areas-preview" className="py-24 bg-[#F5F7FA]">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          title="Our Focus Areas"
          subtitle="Technical domains explored through reading groups, Workspace Q projects, applied research, and selected partner use cases."
          accentColor="electric"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {focusAreas.map((area) => {
            const Icon = iconMap[area.icon] || Brain;
            const isComingSoon = area.status === 'coming-soon';
            return (
              <Card
                key={area.id}
                variant={isComingSoon ? 'featured' : 'default'}
                className={`flex flex-col h-full ${isComingSoon ? 'opacity-90' : ''}`}
                id={`focus-area-preview-${area.id}`}
                noPadding={true}
              >
                {/* Hero Animation Header */}
                <div className="relative w-full h-56 bg-[#071321] flex items-center justify-center border-b border-white/5 group overflow-hidden">
                  <div className="absolute top-4 right-4 z-10">
                    {isComingSoon ? (
                      <Badge variant="gold">In Development</Badge>
                    ) : (
                      <Badge variant="success">Active Focus Area</Badge>
                    )}
                  </div>
                  {/* Subtle radial glow behind animation */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4A90E2]/5 to-transparent pointer-events-none" />
                  <Icon className="w-full h-full max-w-[220px] max-h-[220px] transition-transform duration-700 group-hover:scale-105" />
                </div>

                {/* Card Content */}
                <div className="p-8 flex flex-col flex-1">
                  <h3 className={`text-2xl font-bold mb-4 ${isComingSoon ? 'text-white' : 'text-[#0A1929]'}`}>
                    {area.shortTitle}
                  </h3>
                  <p className={`text-[15px] leading-relaxed mb-6 flex-1 ${isComingSoon ? 'text-gray-400' : 'text-[#2C3E50]'}`}>
                    {area.description.slice(0, 150)}…
                  </p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {area.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant={isComingSoon ? 'gold' : 'info'} size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    href={`/focus-areas#${area.id}`}
                    variant={isComingSoon ? 'gold' : 'primary'}
                    size="md"
                    className="w-full font-semibold"
                  >
                    {isComingSoon ? 'Explore Future Track' : 'Explore Focus Area'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
        <div className="text-center mt-10">
          <Button href="/focus-areas" variant="ghost" className="text-[#4A90E2]">
            View All Domains →
          </Button>
        </div>
      </div>
    </section>
  );
}
