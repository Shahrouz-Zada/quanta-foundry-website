import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { insights } from '@/data/insights';
import { formatDate } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/lib/constants';
import { ArrowLeft, Clock, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';

// =============================================================================
// Helpers
// =============================================================================
const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'notes');

function getMdxContent(slug: string): string | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { content } = matter(raw);
  return content;
}

// =============================================================================
// Static params — pre-render all published article pages at build time
// =============================================================================
export async function generateStaticParams() {
  return insights
    .filter((i) => i.date !== 'Coming Soon')
    .map((i) => ({ slug: i.slug }));
}

// =============================================================================
// SEO metadata
// =============================================================================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = insights.find((i) => i.slug === slug);
  if (!article) return { title: 'Article Not Found' };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.date !== 'Coming Soon' ? article.date : undefined,
      authors: [article.author],
    },
  };
}

// =============================================================================
// Page component
// =============================================================================
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = insights.find((i) => i.slug === slug);

  if (!article) notFound();

  // Coming Soon articles don't have a full page yet
  if (article.date === 'Coming Soon') {
    return (
      <div className="min-h-screen bg-[#F5F7FA] pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#4A90E2]/10 flex items-center justify-center mx-auto mb-6">
            <Clock className="text-[#4A90E2]" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-[#0A1929] mb-4">{article.title}</h1>
          <p className="text-gray-500 mb-8">{article.excerpt}</p>
          <p className="text-[#4A90E2] font-semibold mb-8">This article is coming soon.</p>
          <Link href="/insights" className="inline-flex items-center gap-2 text-sm text-[#4A90E2] hover:underline">
            <ArrowLeft size={16} /> Back to Insights
          </Link>
        </div>
      </div>
    );
  }

  const mdxContent = getMdxContent(slug);

  return (
    <>
      {/* Article Hero */}
      <section className="pt-32 pb-12 bg-[#0A1929]">
        <div className="mx-auto max-w-3xl px-6">
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Back to Insights
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-[#4A90E2]/20 text-[#4A90E2]">
              {CATEGORY_LABELS[article.category] || article.category}
            </span>
            {article.featured && (
              <span className="text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
                Featured
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            {article.title}
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">{article.excerpt}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> {formatDate(article.date)}
            </span>
            {article.readTime && (
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> {article.readTime}
              </span>
            )}
            <span className="text-gray-600">By {article.author}</span>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-6">
          {mdxContent ? (
            <article className="prose prose-lg prose-slate max-w-none
              prose-headings:font-bold prose-headings:text-[#0A1929]
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-p:text-gray-600 prose-p:leading-relaxed
              prose-a:text-[#4A90E2] prose-a:no-underline hover:prose-a:underline
              prose-code:bg-gray-100 prose-code:text-[#0A1929] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
              prose-pre:bg-[#0A1929] prose-pre:rounded-xl prose-pre:border prose-pre:border-white/10
              prose-blockquote:border-l-[#4A90E2] prose-blockquote:bg-[#F5F7FA] prose-blockquote:rounded-r-xl prose-blockquote:py-1
              prose-strong:text-[#0A1929]
              prose-ul:text-gray-600 prose-ol:text-gray-600
              prose-li:marker:text-[#4A90E2]
              prose-hr:border-gray-200">
              <MDXRemote source={mdxContent} />
            </article>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-2">Full article content coming soon.</p>
              <p className="text-gray-400 text-sm">Check back after the next reading session.</p>
            </div>
          )}

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={14} className="text-gray-400" />
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-sm text-[#4A90E2] font-semibold hover:underline"
            >
              <ArrowLeft size={16} /> Back to all Insights
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
