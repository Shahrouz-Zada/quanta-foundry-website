/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { getLearnerSessionState, requireOfferingRole } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import SessionLayout from '@/components/session/SessionLayout';
import { EnrollmentRole } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Workspace Q — Learning Session',
  description: 'Quanta Foundry Learning Session',
  robots: { index: false, follow: false },
};

export default async function LearningSessionPage(
  props: { params: Promise<{ offeringId: string; sessionSlug: string }> }
) {
  const { offeringId, sessionSlug } = await props.params;

  // 1. Resolve the Offering from the URL slug
  const offering = await prisma.offering.findUnique({
    where: { slug: offeringId }
  });

  if (!offering) {
    notFound();
  }

  // 2. Authorize
  try {
    await requireOfferingRole(offering.id, [EnrollmentRole.LEARNER, EnrollmentRole.INSTRUCTOR]);
  } catch (err) {
    // If not enrolled or unauthenticated, Next.js will handle via Error boundary or redirect
    throw err;
  }

  // 3. Resolve the OfferingSession
  const offeringSession = await prisma.offeringSession.findFirst({
    where: {
      offeringId: offering.id,
      sessionVersion: {
        session: { slug: sessionSlug }
      }
    },
    select: { id: true }
  });

  if (!offeringSession) {
    notFound();
  }

  // 3. Fetch the full state (content + user progress + user responses)
  const state = await getLearnerSessionState(offeringSession.id);
  const sessionContent = state.sessionVersion.content as any;

  return (
    <SessionLayout 
      session={sessionContent} 
      offeringSessionId={offeringSession.id}
      initialProgress={state.progress}
      initialResponses={state.responses}
    />
  );
}
