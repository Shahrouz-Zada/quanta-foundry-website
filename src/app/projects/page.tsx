import type { Metadata } from 'next';
import Link from 'next/link';
import { projectsAndNotes } from '@/data/projects';
import { isPublicWebProject, getOutputTypeLabel } from '@/lib/project-utils';

export const metadata: Metadata = {
  title: 'Projects & Notes',
  description:
    'Curated technical projects, research notes, prototype notebooks, and applied work from the Quanta Foundry ecosystem.',
  alternates: { canonical: 'https://www.quantafoundry.com/projects' },
  openGraph: {
    title: 'Projects & Notes',
    description:
      'Curated technical projects, research notes, prototype notebooks, and applied work from the Quanta Foundry ecosystem.',
    url: 'https://www.quantafoundry.com/projects',
    siteName: 'Quanta Foundry',
    type: 'website',
  },
};

const DOMAIN_LABELS: Record<string, string> = {
  'quantitative-finance':  'Quant Finance',
  'ai-ml':                 'AI & ML',
  'complex-systems':       'Complex Systems',
  'neuroscience-markets':  'Neuroscience & Markets',
  'quantum-software':      'Quantum Software',
  'research':              'Research',
};

const DOMAIN_COLORS: Record<string, string> = {
  'quantitative-finance':  'var(--color-gold)',
  'ai-ml':                 '#4A90E2',
  'complex-systems':       '#9B59B6',
  'neuroscience-markets':  '#27AE60',
  'quantum-software':      '#E74C3C',
  'research':              '#7F8C8D',
};

export default function ProjectsPage() {
  // Only public-web projects are rendered — all others are invisible by design
  const publicProjects = projectsAndNotes.filter(isPublicWebProject);

  return (
    <main
      className="min-h-screen bg-[#0A1929] text-white pt-24 pb-20 relative overflow-hidden"
      aria-label="Projects and Notes"
    >
      {/* Background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4A90E2]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">

        {/* Page Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-4">
            ✦ Curated Research Output
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white">
            Projects &amp;{' '}
            <span className="bg-gradient-to-r from-[#4A90E2] to-[#D4AF37] bg-clip-text text-transparent">
              Notes
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Curated technical projects, research notes, prototype notebooks, and applied
            work from contributors in the Quanta Foundry ecosystem. All outputs are
            manually reviewed before publication.
          </p>
        </div>

        {/* Empty state — shown when no public-web projects exist yet */}
        {publicProjects.length === 0 && (
          <div className="text-center py-24">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 mb-6 text-4xl"
              aria-hidden="true"
            >
              🔬
            </div>
            <h2 className="text-xl font-bold text-white mb-3">
              First projects coming soon
            </h2>
            <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
              This section will feature reviewed technical work from the Quanta Foundry
              contributor community. Projects are curated and approved before appearing
              here.
            </p>
            <Link
              href="/workspace-q"
              className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 rounded-full bg-[#4A90E2]/10 border border-[#4A90E2]/30 text-[#4A90E2] text-sm font-semibold hover:bg-[#4A90E2]/20 transition-colors"
            >
              Explore Workspace Q →
            </Link>
          </div>
        )}

        {/* Projects Grid */}
        {publicProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicProjects.map((project) => {
              const domainLabel = DOMAIN_LABELS[project.domain] ?? String(project.domain);
              const domainColor = DOMAIN_COLORS[project.domain] ?? '#7F8C8D';
              const outputLabel = getOutputTypeLabel(project.outputType);

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="group block p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-[#4A90E2]/30 hover:bg-white/[0.06] transition-all duration-300 relative overflow-hidden"
                  id={`project-card-${project.id}`}
                >
                  {/* Subtle glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4A90E2]/0 to-[#D4AF37]/0 group-hover:from-[#4A90E2]/5 group-hover:to-[#D4AF37]/5 transition-all duration-500 rounded-2xl" />

                  <div className="relative z-10">
                    {/* Output type badge */}
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300"
                      >
                        {outputLabel}
                      </span>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          background: `${domainColor}18`,
                          border: `1px solid ${domainColor}40`,
                          color: domainColor,
                        }}
                      >
                        {domainLabel}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-base font-bold text-white mb-2 group-hover:text-[#4A90E2] transition-colors leading-snug">
                      {project.title}
                    </h2>

                    {/* Short description */}
                    <p className="text-sm text-gray-400 leading-relaxed mb-5 line-clamp-3">
                      {project.shortDescription}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {project.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-500"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4A90E2] group-hover:gap-2.5 transition-all">
                      Read More <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-gray-600 mt-16">
          All projects are manually reviewed and curated by the Quanta Foundry team.
          No project is automatically published.
        </p>
      </div>
    </main>
  );
}
