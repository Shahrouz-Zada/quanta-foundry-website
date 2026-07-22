// =============================================================================
// ResourceCard — Learning Sessions Prototype
// Light cream card on warm section background
// WCAG: #18242B on #FAF8F2 ≈ 15:1 ✓ | #5F6B70 on #FAF8F2 ≈ 4.9:1 ✓
// =============================================================================

import { BookOpen, Presentation, Code2, Database, FileText, ExternalLink } from 'lucide-react';
import type { SessionResource, ResourceType } from '@/types/learning-session';

interface Props {
  resource: SessionResource;
}

const RESOURCE_ICONS: Record<ResourceType, React.ReactNode> = {
  reading:  <BookOpen size={15} />,
  deck:     <Presentation size={15} />,
  notebook: <Code2 size={15} />,
  dataset:  <Database size={15} />,
  template: <FileText size={15} />,
  link:     <ExternalLink size={15} />,
};

// Badge colors — all chosen to meet 3:1 on #FAF8F2 for non-text, 4.5:1 for text labels
const RESOURCE_BADGE: Record<ResourceType, string> = {
  reading:  'text-[#08212C] bg-[#08212C]/8 border-[#08212C]/15',
  deck:     'text-[#7A6120] bg-[#D4AF37]/15 border-[#D4AF37]/30',
  notebook: 'text-[#1A6655] bg-[#2F8174]/10 border-[#2F8174]/20',
  dataset:  'text-[#2E5FA3] bg-[#4A90E2]/10 border-[#4A90E2]/20',
  template: 'text-[#2E5FA3] bg-[#4A90E2]/10 border-[#4A90E2]/20',
  link:     'text-[#5F6B70] bg-[#5F6B70]/8 border-[#5F6B70]/15',
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

  return (
    <div className="flex flex-col rounded-xl border border-[#18242B]/10 bg-[#FAF8F2] p-5 hover:border-[#2F8174]/30 hover:shadow-sm transition-all duration-200 group">
      {/* Type badge + availability */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${RESOURCE_BADGE[resource.type]}`}>
          {RESOURCE_ICONS[resource.type]}
          {RESOURCE_LABELS[resource.type]}
        </span>
        {!isAvailable && (
          <span className="text-xs text-[#5F6B70]">Coming soon</span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-[#18242B] mb-2 group-hover:text-[#2F8174] transition-colors">
        {resource.title}
      </h3>

      {/* Description */}
      {resource.description && (
        <p className="text-xs text-[#5F6B70] leading-relaxed mb-4 flex-1">
          {resource.description}
        </p>
      )}

      {/* CTA */}
      {isAvailable ? (
        <a
          href={resource.url}
          target={resource.url?.startsWith('/') ? '_self' : '_blank'}
          rel={resource.url?.startsWith('/') ? undefined : 'noopener noreferrer'}
          className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F8174] hover:text-[#1A6655] transition-colors"
        >
          {CTA_LABELS[resource.type]}
          <ExternalLink size={11} />
        </a>
      ) : (
        <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-medium text-[#5F6B70]/60 cursor-not-allowed">
          {CTA_LABELS[resource.type]}
          <span className="text-[10px] bg-[#18242B]/6 text-[#5F6B70] px-1.5 py-0.5 rounded">
            Placeholder
          </span>
        </span>
      )}
    </div>
  );
}
