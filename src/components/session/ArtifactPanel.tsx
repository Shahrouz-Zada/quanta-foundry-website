// =============================================================================
// ArtifactPanel — Learning Sessions Prototype
// Displays the Prediction Problem Brief template structure
// =============================================================================

import { FileText, Download } from 'lucide-react';

interface BriefField {
  label: string;
  placeholder: string;
  hint?: string;
}

const BRIEF_FIELDS: BriefField[] = [
  {
    label: 'Problem Statement',
    placeholder: 'What are we trying to predict and why does it matter?',
    hint: 'One or two sentences. Avoid vague financial jargon.',
  },
  {
    label: 'Target Variable',
    placeholder: 'The specific quantity or category being predicted',
    hint: 'e.g. "market-stress binary label, threshold VIX > 25"',
  },
  {
    label: 'Prediction Horizon',
    placeholder: 'How far in advance is the prediction made?',
    hint: 'e.g. "5 trading days ahead"',
  },
  {
    label: 'Available Data',
    placeholder: 'What features are available before the prediction date?',
    hint: 'List data sources; note any look-ahead risk.',
  },
  {
    label: 'Benchmark Model',
    placeholder: 'The naive or simple model used as comparison baseline',
    hint: 'e.g. "previous-day label (persistence model)"',
  },
  {
    label: 'Evaluation Metric',
    placeholder: 'How will model performance be measured?',
    hint: 'e.g. "balanced accuracy, because classes are imbalanced"',
  },
  {
    label: 'Main Limitation',
    placeholder: 'What is the most significant weakness of this setup?',
    hint: 'Be honest. This strengthens, not weakens, the work.',
  },
  {
    label: 'Next Experiment',
    placeholder: 'What would you test if you had one more iteration?',
    hint: 'Connects the brief to the research cycle.',
  },
];

export default function ArtifactPanel() {
  return (
    <div className="rounded-xl border border-[#4A90E2]/20 bg-[#4A90E2]/4 overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#4A90E2]/8 border-b border-[#4A90E2]/15">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4A90E2]/15 border border-[#4A90E2]/25 flex items-center justify-center">
            <FileText size={15} className="text-[#4A90E2]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Prediction Problem Brief</p>
            <p className="text-xs text-gray-500">Project artifact · Session 01</p>
          </div>
        </div>
        <button
          disabled
          title="Template download (placeholder — will be enabled in Phase 2)"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 border border-white/8 cursor-not-allowed"
        >
          <Download size={12} />
          Download template
          <span className="text-[10px] bg-gray-800 text-gray-600 px-1.5 py-0.5 rounded ml-1">
            Phase 2
          </span>
        </button>
      </div>

      {/* Field grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
        {BRIEF_FIELDS.map((field) => (
          <div
            key={field.label}
            className="rounded-lg border border-white/8 bg-white/3 p-4 flex flex-col gap-1.5"
          >
            <p className="text-xs font-semibold text-[#4A90E2] uppercase tracking-wide">
              {field.label}
            </p>
            <p className="text-sm text-gray-500 italic leading-relaxed">{field.placeholder}</p>
            {field.hint && (
              <p className="text-xs text-gray-700 mt-1 leading-relaxed border-t border-white/5 pt-2">
                ↳ {field.hint}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="px-6 pb-5">
        <p className="text-xs text-gray-600 leading-relaxed border-t border-white/8 pt-4">
          In Phase 2, this brief will be editable and saved to your personal project workspace.
          Completed briefs may be nominated for Projects &amp; Notes review after consent and attribution confirmation.
        </p>
      </div>
    </div>
  );
}
