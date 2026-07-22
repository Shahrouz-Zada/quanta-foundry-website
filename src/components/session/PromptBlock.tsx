'use client';
// =============================================================================
// PromptBlock — Learning Sessions Prototype
// Supports two modes:
//   • Uncontrolled: local useState — for stages that don't need persistence
//   • Controlled: answers + onAnswerChange props — for Interpret / Reflect
//     where answers must survive stage switching (state lifted to SessionLayout)
// WCAG: #18242B on white ≈ 15:1 ✓ | #5F6B70 on #FAF8F2 ≈ 4.9:1 ✓
// =============================================================================

import { useState } from 'react';
import { MessageSquare, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  prompts: string[];
  withTextarea?: boolean;
  title?: string;
  /** Controlled mode — pass from SessionLayout to preserve across stage switches */
  answers?: string[];
  onAnswerChange?: (index: number, value: string) => void;
}

export default function PromptBlock({
  prompts,
  withTextarea = false,
  title,
  answers: controlledAnswers,
  onAnswerChange,
}: Props) {
  // Uncontrolled fallback for stages that do not need state preservation
  const [localAnswers, setLocalAnswers] = useState<string[]>(() =>
    prompts.map(() => '')
  );

  const isControlled =
    controlledAnswers !== undefined && onAnswerChange !== undefined;
  const answers = isControlled ? controlledAnswers : localAnswers;

  const handleChange = (index: number, value: string) => {
    if (isControlled) {
      onAnswerChange!(index, value);
    } else {
      setLocalAnswers((prev) => {
        const next = [...prev];
        next[index] = value;
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-base font-semibold text-[#18242B] mb-5 flex items-center gap-2">
          <MessageSquare size={16} className="text-[#2F8174]" aria-hidden="true" />
          {title}
        </h3>
      )}

      {/* Prototype persistence warning */}
      {withTextarea && (
        <div
          role="note"
          className="flex items-start gap-3 bg-amber-50 border border-amber-300/50 rounded-lg px-4 py-3 mb-6"
        >
          <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-amber-700 leading-relaxed">
            <span className="font-semibold text-amber-800">Prototype mode:</span> your notes will
            be lost if you refresh or leave this page. Saving responses to a personal workspace is
            planned for Phase 2.
          </p>
        </div>
      )}

      {prompts.map((prompt, index) => (
        <div
          key={index}
          className={cn(
            'rounded-xl border bg-white p-5 transition-colors duration-150',
            withTextarea && (answers[index] ?? '')
              ? 'border-[#2F8174]/40 shadow-sm'
              : 'border-[#18242B]/10 hover:border-[#18242B]/18'
          )}
        >
          {/* Question row */}
          <div className="flex items-start gap-3 mb-3">
            <span
              aria-hidden="true"
              className="shrink-0 w-5 h-5 rounded-full bg-[#08212C] text-white text-[10px] font-bold flex items-center justify-center mt-0.5"
            >
              {index + 1}
            </span>
            <p className="text-sm text-[#18242B] leading-relaxed">{prompt}</p>
          </div>

          {/* Textarea (controlled or uncontrolled) */}
          {withTextarea && (
            <textarea
              value={answers[index] ?? ''}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder="Write your response here…"
              rows={3}
              className={cn(
                'w-full mt-2 rounded-lg border bg-[#FAF8F2] px-4 py-3 text-sm text-[#18242B]',
                'placeholder:text-[#5F6B70]/55 resize-y min-h-[80px] transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-[#2F8174] focus:border-[#2F8174]',
                (answers[index] ?? '')
                  ? 'border-[#2F8174]/30'
                  : 'border-[#18242B]/10 hover:border-[#18242B]/18'
              )}
              aria-label={`Response to question ${index + 1}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
