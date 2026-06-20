import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { insights } from '@/data/insights';
import { formatDate } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/lib/constants';
import { Clock, ArrowRight } from 'lucide-react';

export default function InsightsPreview() {
  const featured = insights.filter((i) => i.featured).slice(0, 3);

  return (
    <section id="insights-preview" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          title="Research & Insights"
          subtitle="Technical essays, reading notes, and field observations on AI, quantitative finance, neuroscience, market systems, and emerging deep-tech methods."
          accentColor="electric"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((insight) => (
            <Card key={insight.id} id={`insight-${insight.id}`}>
              <div className="mb-4">
                <Badge variant="info">{CATEGORY_LABELS[insight.category] || insight.category}</Badge>
              </div>
              <h3 className="text-lg font-bold text-[#0A1929] mb-3 leading-snug">
                {insight.title}
              </h3>
              <p className="text-sm text-[#2C3E50] leading-relaxed mb-5 line-clamp-3">
                {insight.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatDate(insight.date)}</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {insight.readTime}
                </span>
              </div>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button href="/insights" variant="ghost" className="text-[#4A90E2]">
            View All Insights <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}
