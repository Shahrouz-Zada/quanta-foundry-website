'use client';
// =============================================================================
// PromptBlock — Learning Sessions Prototype
// Client component: local textarea state, prototype persistence warning
// =============================================================================

import { useState } from 'react';
import { MessageSquare, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  prompts: string[];
  /** When true, renders a textarea under each question for local notes */
  withTextarea?: boolean;
  /** Optional title override */
  title?: string;
}

export default function PromptBlock({ prompts, withTextarea = false, title }: Props) {
  const [answers, setAnswers] = useState<string[]>(() => prompts.map(() => ''));

  const handleChange = (index: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <MessageSquare size={16} className="text-emerald-400" />
          {title}
        </h3>
      )}

      {/* Prototype persistence warning */}
      {withTextarea && (
        <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-lg px-4 py-3 mb-6">
          <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400/80 leading-relaxed">
            <span className="font-semibold text-amber-400">Prototype mode:</span> your notes will
            be lost if you refresh or leave this page. Saving responses to a personal workspace is
            planned for Phase 2.
          </p>
        </div>
      )}

      {prompts.map((prompt, index) => (
        <div
          key={index}
          className={cn(
            'rounded-xl border border-white/8 bg-white/3 p-5 transition-all duration-200',
            withTextarea && answers[index] ? 'border-emerald-400/20 bg-emerald-400/5' : ''
          )}
        >
          {/* Question */}
          <div className="flex items-start gap-3 mb-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-400/15 text-emerald-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
              {index + 1}
            </span>
            <p className="text-sm text-gray-300 leading-relaxed">{prompt}</p>
          </div>

          {/* Optional textarea */}
          {withTextarea && (
            <textarea
              value={answers[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder="Write your response here…"
              rows={3}
              className={cn(
                'w-full mt-2 rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-600',
                'resize-y min-h-[80px] transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400',
                answers[index]
                  ? 'border-emerald-400/30'
                  : 'border-white/10 hover:border-white/20'
              )}
              aria-label={`Response to question ${index + 1}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
