import 'server-only';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { EnrollmentRole, GlobalRole } from '@prisma/client';
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
 * GET: Retrieve the full state of a Learning Session for a learner
 */
export async function getLearnerSessionState(offeringSessionId: string) {
  await requireOfferingRole(offeringSessionId, [EnrollmentRole.LEARNER]);
  
  // A learner can only fetch their own progress, responses, and artifacts
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
export async function saveBlockResponse(
  offeringSessionId: string, 
  blockId: string, 
  value: any
) {
  const user = await requireAuth();
  await requireOfferingRole(offeringSessionId, [EnrollmentRole.LEARNER]);

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
