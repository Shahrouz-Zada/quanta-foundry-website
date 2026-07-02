import type { Metadata } from 'next';
import { Clock, Users, MapPin, CheckCircle, Brain } from 'lucide-react';
import AnimatedNeuralNet from '@/components/effects/AnimatedNeuralNet';
import AnimatedStochasticCurve from '@/components/effects/AnimatedStochasticCurve';
import AnimatedBlochSphere from '@/components/effects/AnimatedBlochSphere';
import { focusAreas } from '@/data/focusAreas';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Focus Areas & R&D',
  description:
    'Explore our active R&D focus areas in Applied AI & Machine Learning, Quantitative Finance, and Quantum Software Engineering.',
  alternates: { canonical: 'https://www.quantafoundry.com/focus-areas' },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain: AnimatedNeuralNet,
  TrendingUp: AnimatedStochasticCurve,
  Atom: AnimatedBlochSphere,
};

export default function FocusAreasPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="pt-32 pb-16 bg-[#0A1929]">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Focus Areas
          </h1>
          <div className="h-[3px] w-16 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E0C35C] mx-auto mb-6" />
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Technical domains explored through reading groups, Workspace Q projects, applied research, and selected partner use cases.
          </p>
        </div>
      </section>

      {/* Focus Areas */}
      {focusAreas.map((area, index) => {
        const Icon = iconMap[area.icon] || Brain;
        const isComingSoon = area.status === 'coming-soon';
        const isDark = index % 2 === 0;

        return (
          <section
            key={area.id}
            id={area.id}
            className={`py-20 ${isDark ? 'bg-[#F5F7FA]' : 'bg-white'}`}
          >
            <div className="mx-auto max-w-7xl px-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center justify-center w-20 h-20 shrink-0 rounded-xl bg-[#4A90E2]/10 overflow-hidden">
                  <Icon className="w-14 h-14" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-[#0A1929]">{area.title}</h2>
                    {isComingSoon ? (
                      <Badge variant="gold" size="md">In Development</Badge>
                    ) : (
                      <Badge variant="success" size="md">Active Focus Area</Badge>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-[#2C3E50] leading-relaxed max-w-4xl mb-10 text-lg">
                {area.longDescription}
              </p>

              {/* Engagement Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
                {[
                  { icon: Clock, label: area.engagementModel.durationLabel, value: area.engagementModel.duration },
                  { icon: Clock, label: area.engagementModel.commitmentLabel, value: area.engagementModel.commitment },
                  { icon: MapPin, label: area.engagementModel.deliveryLabel, value: area.engagementModel.delivery },
                  { icon: Users, label: area.engagementModel.teamScaleLabel, value: area.engagementModel.teamScale },
                ].map((detail) => (
                  <div key={detail.label} className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <detail.icon className="text-[#4A90E2] mb-2" size={18} />
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{detail.label}</p>
                    <p className="text-sm font-semibold text-[#0A1929]">{detail.value}</p>
                  </div>
                ))}
              </div>

              {/* Technical Capabilities */}
              <h3 className="text-xl font-bold text-[#0A1929] mb-6">Technical Workstreams</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {area.technicalTracks.map((track) => (
                  <div key={track.title} className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-[#0A1929]">{track.title}</h4>
                      <Badge variant="info" size="sm">{track.phase}</Badge>
                    </div>
                    <p className="text-sm text-[#2C3E50] mb-4">{track.description}</p>
                    <ul className="space-y-2">
                      {track.topics.map((topic) => (
                        <li key={topic} className="flex items-start gap-2 text-sm text-[#2C3E50]">
                          <CheckCircle className="text-[#4A90E2] shrink-0 mt-0.5" size={14} />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Outcomes & Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                <div>
                  <h3 className="text-xl font-bold text-[#0A1929] mb-4">Target Outcomes</h3>
                  <ul className="space-y-3">
                    {area.outcomes.map((outcome) => (
                      <li key={outcome} className="flex items-start gap-3 text-[#2C3E50]">
                        <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0A1929] mb-4">Contributor Requirements</h3>
                  <ul className="space-y-3">
                    {area.requirements.map((req) => (
                      <li key={req} className="flex items-start gap-3 text-[#2C3E50]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4A90E2] shrink-0 mt-2" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom CTA Section */}
              <div className="bg-[#0A1929] rounded-2xl overflow-hidden shadow-xl mt-16">
                {area.statusLabel && area.statusText && (
                  <div className="bg-white/5 border-b border-white/10 p-4 px-8 flex items-center justify-between">
                    <p className="text-sm text-gray-400">{area.statusLabel}</p>
                    <p className="text-sm font-bold text-[#D4AF37]">{area.statusText}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
                  {area.ctas.map((cta, i) => (
                    <div key={i} className="p-8 flex flex-col items-start text-white">
                      <p className="text-sm font-semibold text-[#4A90E2] uppercase tracking-wider mb-2">{cta.target}</p>
                      <p className="text-gray-300 mb-6 flex-1 text-sm leading-relaxed">{cta.description}</p>
                      <Button href={cta.buttonLink} variant={i === 0 ? "secondary" : "primary"} className="w-full sm:w-auto justify-center" id={`focus-area-cta-${area.id}-${i}`}>
                        {cta.buttonText}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
