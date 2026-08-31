import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { EnrollmentRole, GlobalRole, LockState, Prisma } from '@prisma/client';
import { cache } from 'react';

// ============================================================================
// Data Access Layer (DAL)
// All database queries must flow through these methods to enforce authorization.
// Never import `prisma` directly into Server Actions or Route Handlers if the 
// query depends on the current user's authorization.
// ============================================================================

/**
 * Retrieves the current authenticated user session, throwing if unauthorized.
 */
export const requireAuth = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized: You must be logged in.');
  }
  return { ...session.user, id: session.user.id };
});

/**
 * Ensures the user has a specific role in an offering.
 * Admins implicitly have INSTRUCTOR access to all offerings.
 */
export const requireOfferingRole = cache(
  async (offeringId: string, allowedRoles: EnrollmentRole[]) => {
    const user = await requireAuth();

    // Fetch the user's global role and specific enrollment
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        enrollments: {
          where: { offeringId },
        },
      },
    });

    if (!dbUser) throw new Error('User not found.');

    // Platform Admins implicitly have instructor-level access everywhere
    if (dbUser.globalRole === GlobalRole.ADMIN && allowedRoles.includes(EnrollmentRole.INSTRUCTOR)) {
      return { user: dbUser, enrollment: null }; // Admins don't need a specific enrollment
    }

    const enrollment = dbUser.enrollments[0];
    if (!enrollment) {
      throw new Error('Forbidden: You are not enrolled in this offering.');
    }

    if (!allowedRoles.includes(enrollment.role)) {
      throw new Error(`Forbidden: Requires one of [${allowedRoles.join(', ')}]`);
    }

    return { user: dbUser, enrollment };
  }
);

/**
 * GET: Retrieve all offerings a user is enrolled in (or all public/community offerings)
 */
export async function getEnrolledOfferings() {
  const user = await requireAuth();

  return prisma.offering.findMany({
    where: {
      OR: [
        { enrollments: { some: { userId: user.id } } },
        { visibility: 'COMMUNITY' },
      ]
    },
    include: {
      track: true,
      offeringSessions: {
        orderBy: { order: 'asc' },
        include: {
          sessionVersion: {
            select: {
              session: {
                select: { title: true, slug: true }
              },
              content: true // Needed to show summary on cards
            }
          }
        }
      }
    },
    orderBy: { startsAt: 'desc' },
  });
}

/**
 * Helper to require a role on an OfferingSession
 */
export const requireOfferingSessionRole = cache(
  async (offeringSessionId: string, allowedRoles: EnrollmentRole[]) => {
    const os = await prisma.offeringSession.findUnique({
      where: { id: offeringSessionId },
      select: { offeringId: true },
    });
    if (!os) throw new Error('OfferingSession not found.');
    return requireOfferingRole(os.offeringId, allowedRoles);
  }
);

/**
 * GET: Retrieve the full state of a Learning Session for a learner
 */
export async function getLearnerSessionState(offeringSessionId: string) {
  await requireOfferingSessionRole(offeringSessionId, [EnrollmentRole.LEARNER, EnrollmentRole.INSTRUCTOR]);
  
  // A learner (or instructor previewing) can only fetch their own progress, responses, and artifacts
  const user = await requireAuth();

  const offeringSession = await prisma.offeringSession.findUnique({
    where: { id: offeringSessionId },
    include: {
      sessionVersion: true,
      progress: {
        where: { userId: user.id },
      },
      responses: {
        where: { userId: user.id },
      },
      artifacts: {
        where: { 
          project: {
            ownerId: user.id 
          }
        }
      }
    },
  });

  if (!offeringSession) throw new Error('OfferingSession not found');

  return offeringSession;
}

/**
 * MUTATION: Save a Block Response
 *
 * A locked (or voided) response is read-only server-side, not just in the
 * UI — per spec section 28 ("never rely on hiding UI"), a learner must not
 * be able to POST over a locked prediction just because a disabled button
 * didn't stop them. See lockPredictionResponse() / setPredictionLockState()
 * for the Prediction Lock state machine this guards.
 */
export async function saveLearnerResponse(offeringSessionId: string, blockId: string, value: Prisma.InputJsonValue) {
  const user = await requireAuth();
  await requireOfferingSessionRole(offeringSessionId, [EnrollmentRole.LEARNER, EnrollmentRole.INSTRUCTOR]);

  const existing = await prisma.response.findUnique({
    where: {
      userId_offeringSessionId_blockId: {
        userId: user.id,
        offeringSessionId,
        blockId,
      },
    },
    select: { id: true, lockState: true },
  });

  if (existing) {
    if (existing.lockState === LockState.LOCKED) {
      throw new Error('This response is locked and cannot be edited. An instructor must reopen it first.');
    }
    if (existing.lockState === LockState.VOIDED) {
      throw new Error('This response was voided by an instructor and cannot be edited.');
    }
    // DRAFT or REOPENED — editable.
    return prisma.response.update({
      where: { id: existing.id },
      data: { value },
    });
  }

  return prisma.response.create({
    data: { userId: user.id, offeringSessionId, blockId, value },
  });
}

/**
 * MUTATION: Lock a prediction (learner action).
 *
 * Prediction Lock state machine (spec section 12): DRAFT -> LOCKED is the
 * only transition a learner can make, and only on a response that already
 * exists — you cannot lock a prediction that was never saved. Locking
 * stamps `lockedAt` and makes the response read-only (enforced above, in
 * saveLearnerResponse). REOPENED -> LOCKED is also allowed, so a learner
 * can re-lock after an instructor reopens their prediction.
 */
export async function lockPredictionResponse(offeringSessionId: string, blockId: string) {
  const user = await requireAuth();
  await requireOfferingSessionRole(offeringSessionId, [EnrollmentRole.LEARNER, EnrollmentRole.INSTRUCTOR]);

  const existing = await prisma.response.findUnique({
    where: {
      userId_offeringSessionId_blockId: {
        userId: user.id,
        offeringSessionId,
        blockId,
      },
    },
  });

  if (!existing) {
    throw new Error('Cannot lock a prediction that has not been saved yet. Write an answer first.');
  }
  if (existing.lockState === LockState.LOCKED) {
    throw new Error('This prediction is already locked.');
  }
  if (existing.lockState === LockState.VOIDED) {
    throw new Error('This prediction was voided by an instructor and cannot be locked.');
  }

  return prisma.response.update({
    where: { id: existing.id },
    data: { lockState: LockState.LOCKED, lockedAt: new Date() },
  });
}

/**
 * MUTATION: Reopen or void a locked prediction (instructor/admin only).
 *
 * Per spec section 12, only instructors/admins may perform this transition,
 * and every such action must be recorded in PredictionLockAudit — this is
 * the only place in the codebase that writes that table. `action` is typed
 * to just the two staff-initiated states so a caller can't smuggle DRAFT or
 * LOCKED through this path.
 */
export async function setPredictionLockState(
  responseId: string,
  action: typeof LockState.REOPENED | typeof LockState.VOIDED,
  reason?: string
) {
  const response = await prisma.response.findUnique({
    where: { id: responseId },
    include: { offeringSession: { select: { offeringId: true } } },
  });
  if (!response) throw new Error('Response not found.');

  const { user: actor } = await requireOfferingRole(response.offeringSession.offeringId, [EnrollmentRole.INSTRUCTOR]);

  if (response.lockState !== LockState.LOCKED) {
    throw new Error(
      `Cannot ${action === LockState.REOPENED ? 'reopen' : 'void'} a prediction that is not currently ` +
      `locked (current state: ${response.lockState}).`
    );
  }

  const [updated] = await prisma.$transaction([
    prisma.response.update({
      where: { id: responseId },
      data: { lockState: action, lockedAt: null },
    }),
    prisma.predictionLockAudit.create({
      data: { responseId, actorId: actor.id, action, reason },
    }),
  ]);

  return updated;
}

/**
 * MUTATION: Save Stage Progress
 */
import { ProgressState } from '@prisma/client';

export async function saveLearnerProgress(offeringSessionId: string, stageId: string, state: ProgressState) {
  const user = await requireAuth();
  await requireOfferingSessionRole(offeringSessionId, [EnrollmentRole.LEARNER, EnrollmentRole.INSTRUCTOR]);

  return prisma.progress.upsert({
    where: {
      userId_offeringSessionId_stageId: {
        userId: user.id,
        offeringSessionId,
        stageId,
      }
    },
    update: {
      state,
      completedAt: state === 'COMPLETE' ? new Date() : null,
    },
    create: {
      userId: user.id,
      offeringSessionId,
      stageId,
      state,
      completedAt: state === 'COMPLETE' ? new Date() : null,
    }
  });
}
