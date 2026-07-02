import { MetadataRoute } from 'next';
import { insights } from '@/data/insights';
import { projectsAndNotes } from '@/data/projects';
import { isPublicWebProject } from '@/lib/project-utils';

const BASE_URL = 'https://www.quantafoundry.com';

export default function sitemap(): MetadataRoute.Sitemap {
  // ---------------------------------------------------------------------------
  // Static public pages
  // ---------------------------------------------------------------------------
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                          lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/focus-areas`,         lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/workspace-q`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/insights`,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/companies`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/community`,           lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/about`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/privacy`,             lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];

  // ---------------------------------------------------------------------------
  // Dynamic: /insights/[slug]
  // Only include articles with a real published date (not 'Coming Soon').
  // ---------------------------------------------------------------------------
  const insightPages: MetadataRoute.Sitemap = insights
    .filter((article) => article.date !== 'Coming Soon')
    .map((article) => ({
      url: `${BASE_URL}/insights/${article.slug}`,
      lastModified: new Date(article.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  // ---------------------------------------------------------------------------
  // Dynamic: /projects/[slug]
  // Only include projects where approvalStatus === 'public-web'.
  // ---------------------------------------------------------------------------
  const publicProjects = projectsAndNotes.filter(isPublicWebProject);

  // Only include the /projects index page if there is at least one public project.
  const projectIndexPage: MetadataRoute.Sitemap = publicProjects.length > 0
    ? [{ url: `${BASE_URL}/projects`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 }]
    : [];

  const projectPages: MetadataRoute.Sitemap = publicProjects.map((project) => ({
    url: `${BASE_URL}/projects/${project.slug}`,
    lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // /fellowships is intentionally excluded (noindex — not a current active offer).

  return [...staticPages, ...insightPages, ...projectIndexPage, ...projectPages];
}
