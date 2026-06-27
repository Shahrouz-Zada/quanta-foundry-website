import type { Metadata } from 'next';
import Link from 'next/link';
import { insights } from '@/data/insights';
import { formatDate } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/lib/constants';
import { Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Research & Insights',
  description:
    'Technical essays, reading notes, and field observations on AI, quantitative finance, neuroscience, market behavior, and emerging deep-tech ideas from Quanta Foundry.',
};

const categories: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ai-ml', label: 'AI & Machine Learning' },
  { key: 'quantitative-finance', label: 'Quantitative Finance' },
  { key: 'neuroscience-markets', label: 'Neuroscience & Markets' },
  { key: 'quantum-software', label: 'Quantum Software' },
  { key: 'complex-systems', label: 'Complex Systems' },
];

// Server-rendered page — no client-side filter, use query param
export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: activeCategory = 'all' } = await searchParams;

  const filtered =
    activeCategory === 'all'
      ? insights
      : insights.filter((i) => i.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#0A1929]">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Research &amp; Insights
          </h1>
          <div className="h-[3px] w-16 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E0C35C] mx-auto mb-6" />
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Technical essays, reading notes, and field observations on AI, quantitative finance, neuroscience, market behavior, and emerging deep-tech ideas.
          </p>
        </div>
      </section>

      {/* Filter & Articles */}
      <section className="py-20 bg-[#F5F7FA]">
        <div className="mx-auto max-w-7xl px-6">
          {/* Category Filter — server-side via URL params */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {categories.map((cat) => (
              <Link
                key={cat.key}
                href={cat.key === 'all' ? '/insights' : `/insights?category=${cat.key}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.key
                    ? 'bg-[#4A90E2] text-white shadow-lg shadow-[#4A90E2]/25'
                    : 'bg-white text-[#2C3E50] border border-gray-200 hover:border-[#4A90E2] hover:text-[#4A90E2]'
                }`}
                id={`filter-${cat.key}`}
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((insight) => {
              const isPublished = insight.date !== 'Coming Soon';
              if (isPublished) {
                return (
                  <Link
                    key={insight.id}
                    id={`insight-${insight.id}`}
                    href={`/insights/${insight.slug}`}
                    className="group bg-white rounded-2xl border p-6 transition-all duration-200 border-gray-200 hover:border-[#4A90E2]/30 hover:shadow-lg cursor-pointer"
                  >
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-[#4A90E2]/10 text-[#4A90E2]">
                        {CATEGORY_LABELS[insight.category] || insight.category}
                      </span>
                      {insight.featured && (
                        <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-[#D4AF37]/15 text-[#8B6914]">
                          Featured
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#0A1929] mb-3 leading-snug group-hover:text-[#4A90E2] transition-colors">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-[#2C3E50] leading-relaxed mb-5 line-clamp-3">
                      {insight.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                      <span>{formatDate(insight.date)}</span>
                      {insight.readTime && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {insight.readTime}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-[#4A90E2] font-semibold mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      Read article <ArrowRight size={12} />
                    </div>
                  </Link>
                );
              }

              // Unpublished (Coming Soon) card
              return (
                <div
                  key={insight.id}
                  id={`insight-${insight.id}`}
                  className="group bg-white rounded-2xl border p-6 transition-all duration-200 border-gray-200 opacity-70 cursor-default"
                >
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-[#4A90E2]/10 text-[#4A90E2]">
                      {CATEGORY_LABELS[insight.category] || insight.category}
                    </span>
                    {insight.featured && (
                      <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-[#D4AF37]/15 text-[#8B6914]">
                        Featured
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-[#0A1929] mb-3 leading-snug">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-[#2C3E50] leading-relaxed mb-5 line-clamp-3">
                    {insight.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                    <span>Coming Soon</span>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[#2C3E50] text-lg">No articles in this category yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
