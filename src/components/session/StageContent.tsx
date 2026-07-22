'use client';
// =============================================================================
// StageContent — Learning Sessions Prototype
// Renders Overview OR the selected stage content + Previous / Next navigation.
// activeItem = 'overview' | StageId
// =============================================================================

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Layers, FlaskConical } from 'lucide-react';
import type { LearningSession, LearningStage, StageId } from '@/types/learning-session';
import type { NavItem } from './SessionSidebar';
import ResourceCard from './ResourceCard';
import PromptBlock from './PromptBlock';
import EmbeddedDeck from './EmbeddedDeck';
import ArtifactPanel from './ArtifactPanel';
import PublicationPathway from './PublicationPathway';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  prototype: 'bg-amber-500/12 text-amber-700 border border-amber-400/30',
  active:    'bg-[#2F8174]/12 text-[#1A6655] border border-[#2F8174]/25',
  archived:  'bg-[#5F6B70]/10 text-[#5F6B70] border border-[#5F6B70]/20',
};
const STATUS_LABELS = {
  prototype: '⚗ Prototype',
  active:    '● Active Session',
  archived:  '○ Archived',
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  session: LearningSession;
  activeItem: NavItem;
  interpretAnswers: string[];
  onInterpretAnswerChange: (index: number, value: string) => void;
  reflectAnswers: string[];
  onReflectAnswerChange: (index: number, value: string) => void;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StageContent({
  session,
  activeItem,
  interpretAnswers,
  onInterpretAnswerChange,
  reflectAnswers,
  onReflectAnswerChange,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: Props) {
  const isOverview = activeItem === 'overview';
  const stage = useMemo(
    () => (isOverview ? null : session.stages.find((s) => s.id === activeItem) ?? null),
    [session.stages, activeItem, isOverview]
  );
  const stageIndex = useMemo(
    () => (isOverview ? -1 : session.stages.findIndex((s) => s.id === activeItem)),
    [session.stages, activeItem, isOverview]
  );

  return (
    <div className="min-h-full flex flex-col bg-[#F4F1E8]">

      {/* ── Heading block ─────────────────────────────────────────────── */}
      <div
        id="stage-heading"
        className="bg-[#EAE7DC] border-b border-[#18242B]/8 px-6 sm:px-10 py-7 scroll-mt-16"
      >
        {isOverview ? (
          /* Overview heading */
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="text-[#2F8174] text-lg">≡</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#18242B]">Session Overview</h2>
          </div>
        ) : stage ? (
          /* Stage heading */
          <div className="flex items-start gap-4 max-w-3xl">
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
        ) : null}

        {/* Thin gold rule */}
        {!isOverview && (
          <div
            aria-hidden="true"
            className="w-8 h-0.5 rounded-full mt-6 ml-14"
            style={{ background: 'linear-gradient(90deg, #D4AF37, #E0C35C)' }}
          />
        )}
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="flex-1 px-6 sm:px-10 py-10">
        {isOverview && <OverviewBody session={session} />}
        {!isOverview && stage && activeItem === 'prepare'    && <PrepareBody stage={stage} />}
        {!isOverview && stage && activeItem === 'explore'    && (
          <ExploreBody
            deckUrl={stage.resources?.find((r) => r.type === 'deck')?.url}
            deckTitle={stage.resources?.find((r) => r.type === 'deck')?.title ?? 'Session 01 Teaching Deck'}
          />
        )}
        {!isOverview && stage && activeItem === 'experiment' && <ExperimentBody stage={stage} />}
        {!isOverview && stage && activeItem === 'interpret'  && (
          <PromptBody stage={stage} title="Interpretation Prompts" answers={interpretAnswers} onAnswerChange={onInterpretAnswerChange} />
        )}
        {!isOverview && stage && activeItem === 'build'      && <ArtifactPanel />}
        {!isOverview && stage && activeItem === 'reflect'    && (
          <PromptBody stage={stage} title="Reflection Prompts" answers={reflectAnswers} onAnswerChange={onReflectAnswerChange} />
        )}
        {!isOverview && stage && activeItem === 'publish'    && <PublicationPathway />}
      </div>

      {/* ── Previous / Next ───────────────────────────────────────────── */}
      <div className="shrink-0 bg-[#EAE7DC] border-t border-[#18242B]/8 px-6 sm:px-10 py-5 flex items-center gap-4">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="Go to previous"
          className={[
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium',
            'border border-[#18242B]/15 text-[#18242B]',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8174]',
            hasPrev ? 'hover:border-[#18242B]/30 hover:bg-[#18242B]/5 cursor-pointer' : 'opacity-30 cursor-not-allowed',
          ].join(' ')}
        >
          <ChevronLeft size={15} aria-hidden="true" />
          Previous
        </button>

        {/* Progress dots — overview + 7 stages */}
        <div className="flex-1 flex items-center justify-center gap-1.5" aria-hidden="true">
          {/* Overview dot */}
          <span className={[
            'rounded-full transition-all duration-300 motion-reduce:transition-none',
            activeItem === 'overview' ? 'w-5 h-1.5 bg-[#2F8174]' : 'w-1.5 h-1.5 bg-[#18242B]/15',
          ].join(' ')} />
          {/* Stage dots */}
          {session.stages.map((s) => (
            <span
              key={s.id}
              className={[
                'rounded-full transition-all duration-300 motion-reduce:transition-none',
                s.id === activeItem ? 'w-5 h-1.5 bg-[#2F8174]' : 'w-1.5 h-1.5 bg-[#18242B]/15',
              ].join(' ')}
            />
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Go to next"
          className={[
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold',
            'bg-[#2F8174] text-white shadow-sm',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8174] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EAE7DC]',
            hasNext ? 'hover:bg-[#266B62] cursor-pointer' : 'opacity-30 cursor-not-allowed',
          ].join(' ')}
        >
          {activeItem === 'overview' ? 'Start' : 'Next'}
          <ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ── Stage body components ─────────────────────────────────────────────────────

function OverviewBody({ session }: { session: LearningSession }) {
  return (
    <div className="max-w-3xl space-y-8">
      {/* Title + description */}
      <div>
        <h3 className="text-2xl sm:text-3xl font-bold text-[#18242B] mb-4 leading-tight">
          {session.title}
        </h3>
        <p className="text-base text-[#5F6B70] leading-relaxed">{session.description}</p>
      </div>

      {/* Central question */}
      <div className="flex items-start gap-3 bg-[#08212C] rounded-xl px-5 py-4">
        <span className="text-[#D4AF37] text-lg mt-0.5 shrink-0">⊙</span>
        <div>
          <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-1.5">
            Central Question
          </p>
          <p className="text-sm text-white/80 italic leading-relaxed">
            &ldquo;{session.centralQuestion}&rdquo;
          </p>
        </div>
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${STATUS_STYLES[session.status]}`}>
          {STATUS_LABELS[session.status]}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#18242B]/8 text-[#18242B] border border-[#18242B]/12">
          <Clock size={12} aria-hidden="true" />
          {session.estimatedTime}
        </span>
        {session.outputBadges.map((badge) => (
          <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#2F8174]/10 text-[#1A6655] border border-[#2F8174]/20">
            <Layers size={11} aria-hidden="true" />
            {badge}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#18242B]/6 text-[#5F6B70] border border-[#18242B]/10 ml-auto">
          <FlaskConical size={11} aria-hidden="true" />
          {session.stages.length} stages
        </span>
      </div>

      {/* Stage map */}
      <div>
        <h4 className="text-xs font-semibold text-[#5F6B70] uppercase tracking-wider mb-4">
          Learning Path
        </h4>
        <ol className="space-y-2" aria-label="Session stages">
          {session.stages.map((stage, index) => (
            <li key={stage.id} className="flex items-start gap-3">
              <span aria-hidden="true" className="shrink-0 w-6 h-6 rounded-full bg-[#08212C] text-white/55 text-[10px] font-bold flex items-center justify-center mt-0.5">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#18242B]">{stage.title}</p>
                <p className="text-xs text-[#5F6B70] leading-relaxed mt-0.5">{stage.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Thin gold rule before CTA */}
      <div
        aria-hidden="true"
        className="w-10 h-0.5 rounded-full"
        style={{ background: 'linear-gradient(90deg, #D4AF37, #E0C35C)' }}
      />
      <p className="text-xs text-[#5F6B70] leading-relaxed">
        Click <strong className="text-[#18242B] font-semibold">Start</strong> below or select a stage in the sidebar to begin.
      </p>
    </div>
  );
}

function PrepareBody({ stage }: { stage: LearningStage }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl">
      <div>
        <h3 className="text-xs font-semibold text-[#D4AF37]/80 uppercase tracking-wider mb-4">Reading</h3>
        <div className="grid gap-3">
          {stage.resources?.map((r) => <ResourceCard key={r.id} resource={r} />)}
        </div>
      </div>
      <div>
        <PromptBlock prompts={stage.prompts ?? []} title="Pre-session Questions" withTextarea={false} />
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
        <code className="bg-[#18242B]/5 px-1 py-0.5 rounded font-mono">?embed=true</code>).
        Place the HTML file at{' '}
        <code className="bg-[#18242B]/5 px-1 py-0.5 rounded font-mono">
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
      <div className="flex items-start gap-3 bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-xl px-5 py-4 mb-8">
        <span className="text-[#D4AF37] text-lg mt-0.5 shrink-0" aria-hidden="true">⚗</span>
        <div>
          <p className="text-xs font-semibold text-[#7A6120] uppercase tracking-wider mb-1">Experiment 1</p>
          <p className="text-sm text-[#18242B]/80 leading-relaxed">
            Naive benchmark vs logistic regression for market-stress classification.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stage.resources?.map((r) => <ResourceCard key={r.id} resource={r} />)}
      </div>
      <p className="mt-6 text-xs text-[#5F6B70] border-t border-[#18242B]/8 pt-5 leading-relaxed max-w-2xl">
        Python execution stays in Colab or your local environment. Workspace Q launches the notebook but does not run code directly.
      </p>
    </div>
  );
}

function PromptBody({ stage, title, answers, onAnswerChange }: {
  stage: LearningStage;
  title: string;
  answers: string[];
  onAnswerChange: (i: number, v: string) => void;
}) {
  return (
    <div className="max-w-3xl">
      <PromptBlock prompts={stage.prompts ?? []} title={title} withTextarea answers={answers} onAnswerChange={onAnswerChange} />
    </div>
  );
}
