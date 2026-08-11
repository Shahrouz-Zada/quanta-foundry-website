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
import SessionLayout from '@/components/session/SessionLayout';

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
  // ── Environment gate ────────────────────────────────────────────────────
  if (process.env.LEARNING_SESSIONS_PROTOTYPE !== 'true') {
    notFound();
  }

  return <SessionLayout session={SESSION_01} />;
}
