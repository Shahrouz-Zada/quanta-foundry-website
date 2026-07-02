import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { projectsAndNotes } from '@/data/projects';
import { contributors } from '@/data/contributors';
import {
  isPublicWebProject,
  getOutputTypeLabel,
  getContributorDisplay,
  getPublicProjectSlugs,
} from '@/lib/project-utils';

// =============================================================================
// generateStaticParams — only expose public-web project slugs at build time.
// Internal/draft/archived slugs are NEVER included → accessing them returns 404.
// =============================================================================
export async function generateStaticParams() {
  return getPublicProjectSlugs(projectsAndNotes).map((slug) => ({ slug }));
}

// =============================================================================
// generateMetadata — SEO only for public-web projects
// =============================================================================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projectsAndNotes.find((p) => p.slug === slug);

  if (!project || !isPublicWebProject(project)) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: project.title,
    description: project.shortDescription,
    alternates: { canonical: `https://www.quantafoundry.com/projects/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      url: `https://www.quantafoundry.com/projects/${project.slug}`,
      siteName: 'Quanta Foundry',
      type: 'article',
    },
  };
}

// =============================================================================
// Domain labels
// =============================================================================
const DOMAIN_LABELS: Record<string, string> = {
  'quantitative-finance':  'Quantitative Finance',
  'ai-ml':                 'AI & Machine Learning',
  'complex-systems':       'Complex Systems',
  'neuroscience-markets':  'Neuroscience & Markets',
  'quantum-software':      'Quantum Software',
  'research':              'Research',
};

const DOMAIN_COLORS: Record<string, string> = {
  'quantitative-finance':  '#D4AF37',
  'ai-ml':                 '#4A90E2',
  'complex-systems':       '#9B59B6',
  'neuroscience-markets':  '#27AE60',
  'quantum-software':      '#E74C3C',
  'research':              '#7F8C8D',
};

// =============================================================================
// Page Component
// =============================================================================
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectsAndNotes.find((p) => p.slug === slug);

  // If not found OR not public-web → 404 (guards internal/draft/archived projects)
  if (!project || !isPublicWebProject(project)) {
    notFound();
  }

  const domainLabel = DOMAIN_LABELS[project.domain] ?? String(project.domain);
  const domainColor = DOMAIN_COLORS[project.domain] ?? '#7F8C8D';
  const outputLabel = getOutputTypeLabel(project.outputType);

  // Resolve contributor display — respects consent and profileVisibility
  const contributorDisplays = (project.contributorIds ?? [])
    .map((id) => contributors.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => c !== undefined)
    .map((c) => ({ contributor: c, display: getContributorDisplay(c) }))
    .filter(({ display }) => display.name !== null || display.tier !== null);

  return (
    <main
      className="min-h-screen bg-[#0A1929] text-white pt-24 pb-20 relative overflow-hidden"
      aria-label={project.title}
    >
      {/* BreadcrumbList structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Projects', item: 'https://www.quantafoundry.com/projects' },
              { '@type': 'ListItem', position: 2, name: project.title },
            ],
          }),
        }}
      />
      {/* Background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4A90E2]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6 relative z-10">

        {/* Breadcrumb */}
        <nav className="mb-10 flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/projects" className="hover:text-gray-300 transition-colors">Projects &amp; Notes</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-400 truncate max-w-[200px]">{project.title}</span>
        </nav>

        {/* Header badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {/* Output type badge */}
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
            {outputLabel}
          </span>
          {/* Domain badge */}
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{
              background: `${domainColor}18`,
              border: `1px solid ${domainColor}40`,
              color: domainColor,
            }}
          >
            {domainLabel}
          </span>
          {/* Workspace Q provenance badge */}
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#4A90E2]/10 border border-[#4A90E2]/30 text-[#4A90E2]">
            ✦ Built through Workspace Q
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
          {project.title}
        </h1>

        {/* Short description lead */}
        <p className="text-lg text-gray-300 leading-relaxed mb-8 border-l-2 border-[#D4AF37]/50 pl-4">
          {project.shortDescription}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-10">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-gray-500"
            >
              #{tag}
            </span>
          ))}
        </div>

        <hr className="border-white/10 mb-10" />

        {/* Long description */}
        {project.longDescription && (
          <section className="mb-12" aria-labelledby="description-heading">
            <h2 id="description-heading" className="text-xl font-bold text-white mb-4">
              About this project
            </h2>
            <p className="text-gray-400 leading-relaxed text-[15px]">
              {project.longDescription}
            </p>
          </section>
        )}

        {/* Contributors section — only shown when at least one has public consent */}
        {contributorDisplays.length > 0 && (
          <section className="mb-12" aria-labelledby="contributors-heading">
            <h2 id="contributors-heading" className="text-xl font-bold text-white mb-4">
              Contributors
            </h2>
            <div className="flex flex-wrap gap-3">
              {contributorDisplays.map(({ contributor, display }) => (
                <div
                  key={contributor.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4A90E2] to-[#D4AF37] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {display.name ? display.name[0] : '?'}
                  </div>
                  <div>
                    {display.name && (
                      <p className="text-xs font-semibold text-white">{display.name}</p>
                    )}
                    {display.tier && (
                      <p className="text-xs text-gray-500">{display.tier}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* External links */}
        {(project.githubUrl || project.notebookUrl || project.articleUrl) && (
          <section className="mb-12" aria-labelledby="links-heading">
            <h2 id="links-heading" className="text-xl font-bold text-white mb-4">
              Resources
            </h2>
            <div className="flex flex-wrap gap-3">
              {project.githubUrl && project.codeVisibility === 'public' && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all"
                  id="project-github-link"
                >
                  GitHub Repository ↗
                </a>
              )}
              {project.notebookUrl && project.notebookUrl !== '#' && (
                <a
                  href={project.notebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4A90E2]/10 border border-[#4A90E2]/30 text-sm font-semibold text-[#4A90E2] hover:bg-[#4A90E2]/20 transition-all"
                  id="project-notebook-link"
                >
                  View Notebook ↗
                </a>
              )}
              {project.articleUrl && (
                <a
                  href={project.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-sm font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all"
                  id="project-article-link"
                >
                  Read Article ↗
                </a>
              )}
            </div>
          </section>
        )}

        {/* License & provenance footer */}
        <div className="mt-10 p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-gray-500 space-y-1">
          <p>
            <span className="text-gray-400 font-medium">Status:</span>{' '}
            Manually reviewed and approved by the Quanta Foundry team.
          </p>
          {project.publishedAt && (
            <p>
              <span className="text-gray-400 font-medium">Published:</span>{' '}
              {new Date(project.publishedAt).toLocaleDateString('en-GB', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          )}
          {project.license && (
            <p>
              <span className="text-gray-400 font-medium">License:</span>{' '}
              {project.license}
            </p>
          )}
        </div>

        {/* Back link */}
        <div className="mt-10">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Projects &amp; Notes
          </Link>
        </div>
      </div>
    </main>
  );
}
