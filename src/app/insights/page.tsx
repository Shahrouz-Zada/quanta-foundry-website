'use client';

import { useState } from 'react';
import { insights } from '@/data/insights';
import { formatDate } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Clock } from 'lucide-react';

const categories: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ai-ml', label: 'AI & Machine Learning' },
  { key: 'quantitative-finance', label: 'Quantitative Finance' },
  { key: 'neuroscience-markets', label: 'Neuroscience & Markets' },
  { key: 'quantum-software', label: 'Quantum Software' },
  { key: 'complex-systems', label: 'Complex Systems' },
];

export default function InsightsPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all'
    ? insights
    : insights.filter((i) => i.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#0A1929]">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Research & Insights
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
          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.key
                    ? 'bg-[#4A90E2] text-white shadow-lg shadow-[#4A90E2]/25'
                    : 'bg-white text-[#2C3E50] border border-gray-200 hover:border-[#4A90E2] hover:text-[#4A90E2]'
                }`}
                id={`filter-${cat.key}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((insight) => (
              <Card key={insight.id} id={`insight-${insight.id}`}>
                <div className="mb-4">
                  <Badge variant="info">
                    {CATEGORY_LABELS[insight.category] || insight.category}
                  </Badge>
                  {insight.featured && (
                    <Badge variant="gold" className="ml-2">Featured</Badge>
                  )}
                </div>
                <h3 className="text-lg font-bold text-[#0A1929] mb-3 leading-snug">
                  {insight.title}
                </h3>
                <p className="text-sm text-[#2C3E50] leading-relaxed mb-5 line-clamp-3">
                  {insight.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <span>{insight.date === 'Coming Soon' ? 'Coming Soon' : formatDate(insight.date)}</span>
                  {insight.readTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {insight.readTime}
                    </span>
                  )}
                </div>
              </Card>
            ))}
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
