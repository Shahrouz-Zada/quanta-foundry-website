'use client';
// =============================================================================
// ArtifactPanel — Learning Sessions Prototype
// Prediction Problem Brief — paper-like work surface
// WCAG: #18242B on white ≈ 15:1 ✓ | #5F6B70 on white ≈ 4.9:1 ✓
//
// Editable + autosaved, backed by Project -> Artifact -> ArtifactVersion
// (see saveLearnerBrief in dal.ts). SessionLayout owns the actual content
// state and debounced save — this component is controlled: it renders
// `content`, reports keystrokes via `onFieldChange`, and reflects whatever
// `saveStatus` SessionLayout is currently in.
// =============================================================================

import { FileText, Download, Check, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation, type MessageKey } from '@/lib/i18n';
import type { BriefContent } from '@/types/learning-session';

export type BriefSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface BriefField {
  key: keyof BriefContent;
  label: string;
  placeholder: string;
  hint?: string;
}

// Field copy is authored, exercise-specific instructional text (what a
// Problem Statement or Benchmark Model means for THIS brief) rather than
// generic interface chrome, so — consistent with this file's own i18n scope
// rule ("course content stays in its original language") — it's left as
// plain English here rather than run through t(), unlike the panel chrome
// (title/status/footer) below.
const BRIEF_FIELDS: BriefField[] = [
  {
    key: 'problemStatement',
    label: 'Problem Statement',
    placeholder: 'What are we trying to predict and why does it matter?',
    hint: 'One or two sentences. Avoid vague financial jargon.',
  },
  {
    key: 'targetVariable',
    label: 'Target Variable',
    placeholder: 'The specific quantity or category being predicted',
    hint: 'e.g. "market-stress binary label, threshold VIX > 25"',
  },
  {
    key: 'predictionHorizon',
    label: 'Prediction Horizon',
    placeholder: 'How far in advance is the prediction made?',
    hint: 'e.g. "5 trading days ahead"',
  },
  {
    key: 'availableData',
    label: 'Available Data',
    placeholder: 'What features are available before the prediction date?',
    hint: 'List data sources; note any look-ahead risk.',
  },
  {
    key: 'benchmarkModel',
    label: 'Benchmark Model',
    placeholder: 'The naive or simple model used as comparison baseline',
    hint: 'e.g. "previous-day label (persistence model)"',
  },
  {
    key: 'evaluationMetric',
    label: 'Evaluation Metric',
    placeholder: 'How will model performance be measured?',
    hint: 'e.g. "balanced accuracy, because classes are imbalanced"',
  },
  {
    key: 'mainLimitation',
    label: 'Main Limitation',
    placeholder: 'What is the most significant weakness of this setup?',
    hint: 'Be honest. This strengthens, not weakens, the work.',
  },
  {
    key: 'nextExperiment',
    label: 'Next Experiment',
    placeholder: 'What would you test if you had one more iteration?',
    hint: 'Connects the brief to the research cycle.',
  },
];

interface Props {
  content: BriefContent;
  onFieldChange: (key: keyof BriefContent, value: string) => void;
  saveStatus: BriefSaveStatus;
  sessionLabel: string;
}

export default function ArtifactPanel({ content, onFieldChange, saveStatus, sessionLabel }: Props) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-[#18242B]/12 bg-white overflow-hidden shadow-sm">
      {/* Panel header — navy chrome */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#08212C] border-b border-white/10 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2F8174]/20 border border-[#2F8174]/30 flex items-center justify-center">
            <FileText size={15} className="text-[#2F8174]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Prediction Problem Brief</p>
            <p className="text-xs text-white/40">Project artifact · {sessionLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SaveStatusIndicator status={saveStatus} label={t(`brief.status.${saveStatus}` as MessageKey)} />
          <button
            disabled
            title="Template download (placeholder — will be enabled in Phase 2)"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white/30 border border-white/10 cursor-not-allowed"
          >
            <Download size={12} />
            Download template
            <span className="text-[10px] bg-white/8 text-white/25 px-1.5 py-0.5 rounded ml-1">
              Phase 2
            </span>
          </button>
        </div>
      </div>

      {/* Field grid — warm paper surface */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-[#FAF8F2]">
        {BRIEF_FIELDS.map((field) => (
          <label
            key={field.key}
            className="rounded-lg border border-[#18242B]/10 bg-white p-4 flex flex-col gap-1.5 hover:border-[#2F8174]/25 focus-within:border-[#2F8174]/40 transition-colors duration-200"
          >
            <span className="text-xs font-semibold text-[#2F8174] uppercase tracking-wide">
              {field.label}
            </span>
            <textarea
              value={content[field.key]}
              onChange={(e) => onFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={2}
              className="text-sm text-[#18242B] leading-relaxed bg-transparent resize-y outline-none placeholder:text-[#5F6B70] placeholder:italic"
            />
            {field.hint && (
              <p className="text-xs text-[#5F6B70]/70 mt-1 leading-relaxed border-t border-[#18242B]/6 pt-2">
                ↳ {field.hint}
              </p>
            )}
          </label>
        ))}
      </div>

      {/* Footer note */}
      <div className="px-6 pb-5 bg-[#FAF8F2] border-t border-[#18242B]/8">
        <p className="text-xs text-[#5F6B70] leading-relaxed pt-4">
          {t('brief.footerNote')}
        </p>
      </div>
    </div>
  );
}

function SaveStatusIndicator({ status, label }: { status: BriefSaveStatus; label: string }) {
  if (status === 'idle') return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-medium',
        status === 'error' ? 'text-amber-400' : 'text-white/45'
      )}
      role="status"
      aria-live="polite"
    >
      {status === 'saving' && <Loader2 size={11} className="animate-spin" aria-hidden="true" />}
      {status === 'saved' && <Check size={11} aria-hidden="true" />}
      {status === 'error' && <AlertTriangle size={11} aria-hidden="true" />}
      {label}
    </span>
  );
}
