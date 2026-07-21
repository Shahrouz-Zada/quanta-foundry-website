// =============================================================================
// Learning Session 01 — Prototype Page
// Route: /workspace-q/learning-sessions/session-01
//
// SAFEGUARDS:
//   • robots: { index: false, follow: false }  — excluded from search engines
//   • Returns 404 unless LEARNING_SESSIONS_PROTOTYPE=true in environment
//   • No links from production navigation point here
//   • Do NOT merge to main until reviewed and approved via Vercel Preview
// =============================================================================

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { SESSION_01 } from '@/data/learning-sessions';

import SessionHeader from '@/components/session/SessionHeader';
import SessionWorkflowNav from '@/components/session/SessionWorkflowNav';
import SessionStageSection from '@/components/session/SessionStageSection';
import ResourceCard from '@/components/session/ResourceCard';
import PromptBlock from '@/components/session/PromptBlock';
import EmbeddedDeck from '@/components/session/EmbeddedDeck';
import ArtifactPanel from '@/components/session/ArtifactPanel';
import PublicationPathway from '@/components/session/PublicationPathway';

export const metadata: Metadata = {
  title: 'Session 01 — From Financial Question to Prediction Problem (Prototype)',
  description:
    'Prototype learning session: Workspace Q — Finance, Data & AI track. Not a public page.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LearningSession01Page() {
  // ── Environment gate ─────────────────────────────────────────────────────
  // Add LEARNING_SESSIONS_PROTOTYPE=true to your .env.local (dev) or
  // Vercel Project → Settings → Environment Variables (preview / production).
  if (process.env.LEARNING_SESSIONS_PROTOTYPE !== 'true') {
    notFound();
  }

  const session = SESSION_01;

  // Stage helpers
  const prepareStage    = session.stages.find((s) => s.id === 'prepare')!;
  const exploreStage    = session.stages.find((s) => s.id === 'explore')!;
  const experimentStage = session.stages.find((s) => s.id === 'experiment')!;
  const interpretStage  = session.stages.find((s) => s.id === 'interpret')!;
  const buildStage      = session.stages.find((s) => s.id === 'build')!;
  const reflectStage    = session.stages.find((s) => s.id === 'reflect')!;
  const publishStage    = session.stages.find((s) => s.id === 'publish')!;

  const deckResource = exploreStage.resources?.find((r) => r.type === 'deck');

  return (
    <div className="min-h-screen bg-[#0A1929]">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <SessionHeader session={session} />

      {/* ── Workflow Navigation ─────────────────────────────────────────────── */}
      <SessionWorkflowNav stages={session.stages} />

      {/* ══════════════════════════════════════════════════════════════════════
          01 · PREPARE
      ══════════════════════════════════════════════════════════════════════ */}
      <SessionStageSection
        stageId="prepare"
        stageNumber={1}
        title={prepareStage.title}
        description={prepareStage.description}
        variant="dark"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Reading resources */}
          <div>
            <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-5">
              Reading
            </h3>
            <div className="grid gap-4">
              {prepareStage.resources?.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </div>

          {/* Pre-session questions */}
          <div>
            <PromptBlock
              prompts={prepareStage.prompts ?? []}
              title="Pre-session Questions"
              withTextarea={false}
            />
          </div>
        </div>
      </SessionStageSection>

      {/* ══════════════════════════════════════════════════════════════════════
          02 · EXPLORE
      ══════════════════════════════════════════════════════════════════════ */}
      <SessionStageSection
        stageId="explore"
        stageNumber={2}
        title={exploreStage.title}
        description={exploreStage.description}
        variant="darker"
      >
        <EmbeddedDeck
          src={deckResource?.url}
          title={deckResource?.title ?? 'Session 01 Teaching Deck'}
        />

        {/* Embed instructions */}
        <p className="mt-4 text-xs text-gray-600 leading-relaxed">
          The deck runs in embed mode (<code className="text-gray-500 bg-white/5 px-1 rounded">?embed=true</code>) — no external navigation or branding shown.
          Place the HTML file at <code className="text-gray-500 bg-white/5 px-1 rounded">/public/courses/finance-data-ai/session-01/deck.html</code> to activate the viewer.
        </p>
      </SessionStageSection>

      {/* ══════════════════════════════════════════════════════════════════════
          03 · EXPERIMENT
      ══════════════════════════════════════════════════════════════════════ */}
      <SessionStageSection
        stageId="experiment"
        stageNumber={3}
        title={experimentStage.title}
        description={experimentStage.description}
        variant="dark"
      >
        {/* Experiment framing callout */}
        <div className="flex items-start gap-3 bg-[#D4AF37]/6 border border-[#D4AF37]/15 rounded-xl px-5 py-4 mb-8 max-w-2xl">
          <span className="text-[#D4AF37] text-lg mt-0.5 shrink-0">⚗</span>
          <div>
            <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-1">
              Experiment 1
            </p>
            <p className="text-sm text-white/80 leading-relaxed">
              Naive benchmark vs logistic regression for market-stress classification.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {experimentStage.resources?.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>

        {/* Note on Python execution */}
        <p className="mt-6 text-xs text-gray-600 border-t border-white/5 pt-5 max-w-xl leading-relaxed">
          Python execution stays in Colab or your local environment. Workspace Q launches the notebook but does not run code directly.
        </p>
      </SessionStageSection>

      {/* ══════════════════════════════════════════════════════════════════════
          04 · INTERPRET
      ══════════════════════════════════════════════════════════════════════ */}
      <SessionStageSection
        stageId="interpret"
        stageNumber={4}
        title={interpretStage.title}
        description={interpretStage.description}
        variant="darker"
      >
        <div className="max-w-3xl">
          <PromptBlock
            prompts={interpretStage.prompts ?? []}
            title="Interpretation Prompts"
            withTextarea={true}
          />
        </div>
      </SessionStageSection>

      {/* ══════════════════════════════════════════════════════════════════════
          05 · BUILD
      ══════════════════════════════════════════════════════════════════════ */}
      <SessionStageSection
        stageId="build"
        stageNumber={5}
        title={buildStage.title}
        description={buildStage.description}
        variant="dark"
      >
        <ArtifactPanel />
      </SessionStageSection>

      {/* ══════════════════════════════════════════════════════════════════════
          06 · REFLECT
      ══════════════════════════════════════════════════════════════════════ */}
      <SessionStageSection
        stageId="reflect"
        stageNumber={6}
        title={reflectStage.title}
        description={reflectStage.description}
        variant="darker"
      >
        <div className="max-w-3xl">
          <PromptBlock
            prompts={reflectStage.prompts ?? []}
            title="Reflection Prompts"
            withTextarea={true}
          />
        </div>
      </SessionStageSection>

      {/* ══════════════════════════════════════════════════════════════════════
          07 · PUBLISH
      ══════════════════════════════════════════════════════════════════════ */}
      <SessionStageSection
        stageId="publish"
        stageNumber={7}
        title={publishStage.title}
        description={publishStage.description}
        variant="dark"
      >
        <PublicationPathway />
      </SessionStageSection>

      {/* ── Footer note ─────────────────────────────────────────────────────── */}
      <div className="bg-[#060F1A] border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-gray-700">
            Finance, Data &amp; AI · Session 01 · Prototype — not indexed, not linked from navigation.
          </p>
          <span className="text-xs text-amber-500/60 font-medium">
            ⚗ prototype / feature/learning-sessions-prototype
          </span>
        </div>
      </div>
    </div>
  );
}
