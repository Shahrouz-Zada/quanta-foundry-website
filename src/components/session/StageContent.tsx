'use client';
// =============================================================================
// StageContent — Learning Sessions Prototype
// Renders the selected stage's content + Previous / Next navigation
// All stage state (textarea answers) is lifted to SessionLayout to survive
// stage switches. Inner stage components receive controlled props.
// =============================================================================

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LearningSession, LearningStage, SessionResource, StageId } from '@/types/learning-session';
import ResourceCard from './ResourceCard';
import PromptBlock from './PromptBlock';
import EmbeddedDeck from './EmbeddedDeck';
import ArtifactPanel from './ArtifactPanel';
import PublicationPathway from './PublicationPathway';

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  session: LearningSession;
  activeStageId: StageId;
  // Lifted answer state — preserved when the user switches stages
  interpretAnswers: string[];
  onInterpretAnswerChange: (index: number, value: string) => void;
  reflectAnswers: string[];
  onReflectAnswerChange: (index: number, value: string) => void;
  // Navigation
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StageContent({
  session,
  activeStageId,
  interpretAnswers,
  onInterpretAnswerChange,
  reflectAnswers,
  onReflectAnswerChange,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: Props) {
  const stage = useMemo(
    () => session.stages.find((s) => s.id === activeStageId),
    [session.stages, activeStageId]
  );

  const stageIndex = useMemo(
    () => session.stages.findIndex((s) => s.id === activeStageId),
    [session.stages, activeStageId]
  );

  if (!stage) return null;

  return (
    // min-h-full ensures the cream fills the entire content area even when short
    <div className="min-h-full flex flex-col bg-[#F4F1E8]">

      {/* ── Stage heading ─────────────────────────────────────────────── */}
      <div
        id="stage-heading"
        className="bg-[#EAE7DC] border-b border-[#18242B]/8 px-6 sm:px-10 py-8 scroll-mt-16"
      >
        <div className="flex items-start gap-4 max-w-3xl">
          {/* Stage number circle */}
          <span
            aria-hidden="true"
            className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#08212C] text-white/70 text-sm font-bold mt-0.5"
          >
            {String(stageIndex + 1).padStart(2, '0')}
          </span>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#18242B] mb-1.5 leading-tight">
              {stage.title}
            </h2>
            <p className="text-[#5F6B70] text-base leading-relaxed">{stage.description}</p>
          </div>
        </div>

        {/* Thin gold rule */}
        <div
          aria-hidden="true"
          className="w-8 h-0.5 rounded-full mt-7 ml-14"
          style={{ background: 'linear-gradient(90deg, #D4AF37, #E0C35C)' }}
        />
      </div>

      {/* ── Stage body ────────────────────────────────────────────────── */}
      <div className="flex-1 px-6 sm:px-10 py-10">
        {activeStageId === 'prepare' && (
          <PrepareBody stage={stage} />
        )}
        {activeStageId === 'explore' && (
          <ExploreBody
            deckUrl={stage.resources?.find((r) => r.type === 'deck')?.url}
            deckTitle={
              stage.resources?.find((r) => r.type === 'deck')?.title ?? 'Session 01 Teaching Deck'
            }
          />
        )}
        {activeStageId === 'experiment' && (
          <ExperimentBody stage={stage} />
        )}
        {activeStageId === 'interpret' && (
          <PromptBody
            stage={stage}
            title="Interpretation Prompts"
            answers={interpretAnswers}
            onAnswerChange={onInterpretAnswerChange}
          />
        )}
        {activeStageId === 'build' && <ArtifactPanel />}
        {activeStageId === 'reflect' && (
          <PromptBody
            stage={stage}
            title="Reflection Prompts"
            answers={reflectAnswers}
            onAnswerChange={onReflectAnswerChange}
          />
        )}
        {activeStageId === 'publish' && <PublicationPathway />}
      </div>

      {/* ── Previous / Next navigation ────────────────────────────────── */}
      <div className="shrink-0 bg-[#EAE7DC] border-t border-[#18242B]/8 px-6 sm:px-10 py-5 flex items-center gap-4">
        {/* Prev button */}
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="Go to previous stage"
          className={[
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium',
            'border border-[#18242B]/15 text-[#18242B]',
            'transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8174]',
            hasPrev
              ? 'hover:border-[#18242B]/30 hover:bg-[#18242B]/5 cursor-pointer'
              : 'opacity-30 cursor-not-allowed',
          ].join(' ')}
        >
          <ChevronLeft size={15} aria-hidden="true" />
          Previous
        </button>

        {/* Stage progress dots */}
        <div
          className="flex-1 flex items-center justify-center gap-1.5"
          aria-hidden="true"
        >
          {session.stages.map((s) => (
            <span
              key={s.id}
              className={[
                'rounded-full transition-all duration-300 motion-reduce:transition-none',
                s.id === activeStageId
                  ? 'w-5 h-1.5 bg-[#2F8174]'
                  : 'w-1.5 h-1.5 bg-[#18242B]/15',
              ].join(' ')}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Go to next stage"
          className={[
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold',
            'bg-[#2F8174] text-white shadow-sm',
            'transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8174] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EAE7DC]',
            hasNext
              ? 'hover:bg-[#266B62] cursor-pointer'
              : 'opacity-30 cursor-not-allowed',
          ].join(' ')}
        >
          Next
          <ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ── Stage-specific body components ────────────────────────────────────────────
// Co-located here for readability. Each is a pure presentational component.

function PrepareBody({ stage }: { stage: LearningStage }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl">
      {/* Reading resources */}
      <div>
        <h3 className="text-xs font-semibold text-[#D4AF37]/80 uppercase tracking-wider mb-4">
          Reading
        </h3>
        <div className="grid gap-3">
          {stage.resources?.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      </div>

      {/* Pre-session questions */}
      <div>
        <PromptBlock
          prompts={stage.prompts ?? []}
          title="Pre-session Questions"
          withTextarea={false}
        />
      </div>
    </div>
  );
}

function ExploreBody({ deckUrl, deckTitle }: { deckUrl: string | undefined; deckTitle: string }) {
  return (
    <div className="max-w-5xl">
      <EmbeddedDeck src={deckUrl} title={deckTitle} />
      <p className="mt-4 text-xs text-[#5F6B70] leading-relaxed">
        The deck runs in embed mode (
        <code className="text-[#5F6B70]/80 bg-[#18242B]/5 px-1 py-0.5 rounded font-mono">
          ?embed=true
        </code>
        ). Place the HTML file at{' '}
        <code className="text-[#5F6B70]/80 bg-[#18242B]/5 px-1 py-0.5 rounded font-mono">
          /public/courses/finance-data-ai/session-01/deck.html
        </code>{' '}
        to activate the viewer.
      </p>
    </div>
  );
}

function ExperimentBody({ stage }: { stage: LearningStage }) {
  return (
    <div className="max-w-5xl">
      {/* Experiment callout */}
      <div className="flex items-start gap-3 bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-xl px-5 py-4 mb-8">
        <span className="text-[#D4AF37] text-lg mt-0.5 shrink-0" aria-hidden="true">
          ⚗
        </span>
        <div>
          <p className="text-xs font-semibold text-[#7A6120] uppercase tracking-wider mb-1">
            Experiment 1
          </p>
          <p className="text-sm text-[#18242B]/80 leading-relaxed">
            Naive benchmark vs logistic regression for market-stress classification.
          </p>
        </div>
      </div>

      {/* Resource grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stage.resources?.map((r) => (
          <ResourceCard key={r.id} resource={r} />
        ))}
      </div>

      <p className="mt-6 text-xs text-[#5F6B70] border-t border-[#18242B]/8 pt-5 leading-relaxed max-w-2xl">
        Python execution stays in Colab or your local environment. Workspace Q launches the
        notebook but does not run code directly.
      </p>
    </div>
  );
}

function PromptBody({
  stage,
  title,
  answers,
  onAnswerChange,
}: {
  stage: LearningStage;
  title: string;
  answers: string[];
  onAnswerChange: (index: number, value: string) => void;
}) {
  return (
    <div className="max-w-3xl">
      <PromptBlock
        prompts={stage.prompts ?? []}
        title={title}
        withTextarea
        answers={answers}
        onAnswerChange={onAnswerChange}
      />
    </div>
  );
}
