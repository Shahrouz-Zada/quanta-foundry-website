import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { EnrollmentRole, GlobalRole, Prisma } from '@prisma/client';
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
 */
export async function saveLearnerResponse(offeringSessionId: string, blockId: string, value: Prisma.InputJsonValue) {
  const user = await requireAuth();
  await requireOfferingSessionRole(offeringSessionId, [EnrollmentRole.LEARNER, EnrollmentRole.INSTRUCTOR]);

  // Upsert the response
  return prisma.response.upsert({
    where: {
      userId_offeringSessionId_blockId: {
        userId: user.id,
        offeringSessionId,
        blockId,
      }
    },
    update: {
      value,
    },
    create: {
      userId: user.id,
      offeringSessionId,
      blockId,
      value,
    }
  });
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
