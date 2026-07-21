// =============================================================================
// ResourceCard — Learning Sessions Prototype
// =============================================================================

import { BookOpen, Presentation, Code2, Database, FileText, ExternalLink } from 'lucide-react';
import type { SessionResource, ResourceType } from '@/types/learning-session';

interface Props {
  resource: SessionResource;
}

const RESOURCE_ICONS: Record<ResourceType, React.ReactNode> = {
  reading:  <BookOpen size={18} />,
  deck:     <Presentation size={18} />,
  notebook: <Code2 size={18} />,
  dataset:  <Database size={18} />,
  template: <FileText size={18} />,
  link:     <ExternalLink size={18} />,
};

const RESOURCE_COLORS: Record<ResourceType, string> = {
  reading:  'text-[#4A90E2] bg-[#4A90E2]/10 border-[#4A90E2]/20',
  deck:     'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20',
  notebook: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  dataset:  'text-purple-400 bg-purple-400/10 border-purple-400/20',
  template: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  link:     'text-gray-400 bg-gray-400/10 border-gray-400/20',
};

const RESOURCE_LABELS: Record<ResourceType, string> = {
  reading:  'Reading',
  deck:     'Teaching Deck',
  notebook: 'Notebook',
  dataset:  'Dataset',
  template: 'Template',
  link:     'Reference',
};

const CTA_LABELS: Record<ResourceType, string> = {
  reading:  'Read',
  deck:     'Open Deck',
  notebook: 'Open Notebook',
  dataset:  'Download',
  template: 'Download Template',
  link:     'Open Link',
};

export default function ResourceCard({ resource }: Props) {
  const isAvailable = !!resource.url;
  const colorClass = RESOURCE_COLORS[resource.type];

  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-white/4 p-5 hover:border-white/20 hover:bg-white/6 transition-all duration-200 group">
      {/* Type badge + icon */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
          {RESOURCE_ICONS[resource.type]}
          {RESOURCE_LABELS[resource.type]}
        </span>
        {!isAvailable && (
          <span className="text-xs text-gray-600 font-medium">Coming soon</span>
        )}
      </div>

      {/* Content */}
      <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-[#4A90E2] transition-colors">
        {resource.title}
      </h3>
      {resource.description && (
        <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">
          {resource.description}
        </p>
      )}

      {/* CTA */}
      {isAvailable ? (
        <a
          href={resource.url}
          target={resource.url?.startsWith('/') ? '_self' : '_blank'}
          rel={resource.url?.startsWith('/') ? undefined : 'noopener noreferrer'}
          className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A90E2] hover:text-[#6BA4E8] transition-colors"
        >
          {CTA_LABELS[resource.type]}
          <ExternalLink size={11} />
        </a>
      ) : (
        <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-not-allowed">
          {CTA_LABELS[resource.type]}
          <span className="text-[10px] bg-gray-800 text-gray-600 px-1.5 py-0.5 rounded">
            Placeholder
          </span>
        </span>
      )}
    </div>
  );
}
