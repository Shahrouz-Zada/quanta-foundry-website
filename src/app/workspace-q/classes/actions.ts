'use server';

// =============================================================================
// Workspace Q · classes and pass codes (spec F1, F2) — server actions.
// Creating a class is for platform administrators. Managing one (code, roster)
// is for its staff. Joining is for any signed-in person who has the code.
// =============================================================================

import { randomInt } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth, signOut } from '@/auth';
import { checkCourseAdmin } from '@/lib/courses';
import { prisma } from '@/lib/prisma';
import { audit, getClassViewer } from '@/lib/workspace-files-server';
import {
  cleanFullName,
  generateJoinCode,
  isFailedJoinLockout,
  isPlausibleJoinCode,
  joinCodeStatus,
  normalizeJoinCode,
  slugify,
  FAILED_JOIN_WINDOW_MS,
} from '@/lib/workspace-classes';
import type { PrismaClient } from '@prisma/client';

const db = prisma as PrismaClient;

export type ClassActionResult = { ok: true; offeringId?: string } | { ok: false; error: string };

class UserError extends Error {}

function fail(error: unknown): { ok: false; error: string } {
  if (error instanceof UserError) return { ok: false, error: error.message };
  if (error instanceof z.ZodError) return { ok: false, error: error.issues[0]?.message ?? 'Invalid input.' };
  console.error('Workspace classes action failed:', error);
  const code = (error as { code?: unknown } | null)?.code;
  if (code === 'P2025') return { ok: false, error: 'This item no longer exists. Refresh the page.' };
  return { ok: false, error: 'Something went wrong. Please try again.' };
}

const id = z.string().min(1).max(64);
const isUniqueViolation = (error: unknown) => (error as { code?: unknown } | null)?.code === 'P2002';

async function requireStaff(offeringId: string) {
  const check = await getClassViewer(offeringId);
  if (check.status !== 'ok' || check.viewer.role !== 'staff') {
    throw new UserError('You don’t have permission to do this.');
  }
  return check;
}

function refresh(offeringId: string) {
  revalidatePath(`/workspace-q/${offeringId}/manage`);
  revalidatePath(`/workspace-q/${offeringId}/files`);
  revalidatePath('/workspace-q');
}

// -----------------------------------------------------------------------------
// Pass codes
// -----------------------------------------------------------------------------

/** Writes a fresh code to the class, retrying in the (very unlikely) event it is already taken. */
async function assignFreshCode(offeringId: string, expiresAt: Date | null | undefined): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateJoinCode(randomInt);
    try {
      await db.offering.update({
        where: { id: offeringId },
        data: { joinCode: code, ...(expiresAt !== undefined ? { joinCodeExpiresAt: expiresAt } : {}) },
      });
      return code;
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  throw new Error('Could not generate a unique pass code.');
}

/** New code; the old one stops working at once (F2.3). Also used to turn joining on for a class that has no code. */
export async function regenerateJoinCode(input: { offeringId: string }): Promise<ClassActionResult> {
  try {
    const data = z.object({ offeringId: id }).parse(input);
    const { user } = await requireStaff(data.offeringId);
    await assignFreshCode(data.offeringId, undefined);
    await audit(db, {
      offeringId: data.offeringId, actorId: user.id, action: 'class.code.regenerate', entity: 'Offering', entityId: data.offeringId,
    });
    refresh(data.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/** Turns joining off: the code is removed, so nobody can join until a new one is made. */
export async function turnOffJoining(input: { offeringId: string }): Promise<ClassActionResult> {
  try {
    const data = z.object({ offeringId: id }).parse(input);
    const { user } = await requireStaff(data.offeringId);
    await db.offering.update({ where: { id: data.offeringId }, data: { joinCode: null, joinCodeExpiresAt: null } });
    await audit(db, {
      offeringId: data.offeringId, actorId: user.id, action: 'class.code.off', entity: 'Offering', entityId: data.offeringId,
    });
    refresh(data.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/** Last day the code works (inclusive, end of day UTC), or null for no expiry. */
export async function setJoinCodeExpiry(input: { offeringId: string; date: string | null }): Promise<ClassActionResult> {
  try {
    const data = z
      .object({ offeringId: id, date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please pick a date.').nullable() })
      .parse(input);
    const { user } = await requireStaff(data.offeringId);
    let expiresAt: Date | null = null;
    if (data.date) {
      expiresAt = new Date(`${data.date}T23:59:59.999Z`);
      if (Number.isNaN(expiresAt.getTime())) throw new UserError('Please pick a valid date.');
      if (expiresAt.getTime() <= Date.now()) throw new UserError('Please pick a date that is not in the past.');
    }
    await db.offering.update({ where: { id: data.offeringId }, data: { joinCodeExpiresAt: expiresAt } });
    await audit(db, {
      offeringId: data.offeringId, actorId: user.id, action: 'class.code.expiry', entity: 'Offering', entityId: data.offeringId,
      details: { expiresAt: expiresAt?.toISOString() ?? null },
    });
    refresh(data.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

// -----------------------------------------------------------------------------
// Creating a class (F1.2)
// -----------------------------------------------------------------------------

/**
 * A class is one run of a course for one cohort. The new class gets a pass
 * code at once. If `copyFromOfferingId` is given, its sessions are copied
 * (without dates), so the instructor does not rebuild the course each time.
 */
export async function createClass(input: { name: string; copyFromOfferingId?: string | null }): Promise<ClassActionResult> {
  try {
    const data = z
      .object({
        name: z.string().trim().min(3, 'Please enter a class name (at least 3 characters).').max(120, 'That name is too long.'),
        copyFromOfferingId: id.nullish(),
      })
      .parse(input);
    const admin = await checkCourseAdmin();
    if (admin.status !== 'ok') throw new UserError('Only administrators can create classes.');

    const source = data.copyFromOfferingId
      ? await db.offering.findUnique({
          where: { id: data.copyFromOfferingId },
          select: {
            trackId: true,
            offeringSessions: { select: { sessionVersionId: true, order: true } },
            classSessions: {
              select: { number: true, titleEn: true, titleFr: true, room: true, offeringSession: { select: { sessionVersionId: true } } },
            },
            tools: { select: { label: true, url: true, order: true } },
          },
        })
      : null;
    if (data.copyFromOfferingId && !source) throw new UserError('The class to copy from no longer exists.');

    for (let attempt = 0; attempt < 6; attempt++) {
      const slug = `${slugify(data.name)}-${randomInt(1000, 10000)}`;
      try {
        const offering = await db.$transaction(async (tx) => {
          const created = await tx.offering.create({
            data: {
              slug,
              name: data.name,
              audience: 'COHORT',
              visibility: 'COHORT',
              trackId: source?.trackId ?? null,
              joinCode: generateJoinCode(randomInt),
            },
          });
          await tx.enrollment.create({ data: { offeringId: created.id, userId: admin.user.id, role: 'INSTRUCTOR' } });
          if (source && source.offeringSessions.length > 0) {
            await tx.offeringSession.createMany({
              data: source.offeringSessions.map((s) => ({
                offeringId: created.id,
                sessionVersionId: s.sessionVersionId,
                order: s.order,
              })),
            });
          }
          if (source && source.classSessions.length > 0) {
            // Sessions are copied without dates (F1.2: the instructor sets them); a link to an
            // interactive session follows the copied interactive session.
            const copied = await tx.offeringSession.findMany({ where: { offeringId: created.id }, select: { id: true, sessionVersionId: true } });
            const byVersion = new Map(copied.map((o) => [o.sessionVersionId, o.id]));
            await tx.classSession.createMany({
              data: source.classSessions.map((cs) => ({
                offeringId: created.id,
                number: cs.number,
                titleEn: cs.titleEn,
                titleFr: cs.titleFr,
                room: cs.room,
                offeringSessionId: cs.offeringSession ? byVersion.get(cs.offeringSession.sessionVersionId) ?? null : null,
              })),
            });
          }
          if (source && source.tools.length > 0) {
            await tx.classTool.createMany({ data: source.tools.map((t) => ({ offeringId: created.id, label: t.label, url: t.url, order: t.order })) });
          }
          await audit(tx, {
            offeringId: created.id, actorId: admin.user.id, action: 'class.create', entity: 'Offering', entityId: created.id,
            details: { copiedFrom: data.copyFromOfferingId ?? null, sessions: source?.offeringSessions.length ?? 0 },
          });
          return created;
        });
        revalidatePath('/workspace-q');
        return { ok: true, offeringId: offering.id };
      } catch (error) {
        // slug or join code collided: try again with new random parts
        if (!isUniqueViolation(error)) throw error;
      }
    }
    throw new Error('Could not create a unique class.');
  } catch (error) {
    return fail(error);
  }
}

// -----------------------------------------------------------------------------
// Joining (F2.4)
// -----------------------------------------------------------------------------

const WRONG_CODE = 'That pass code isn’t right. Check it with your instructor and try again.';

/**
 * A signed-in person enters their full name and the class pass code.
 * Wrong tries are counted per person: 5 in 15 minutes means a wait.
 */
export async function joinClass(input: { fullName: string; code: string }): Promise<ClassActionResult> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new UserError('Please sign in first.');
    const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new UserError('Please sign in first.');

    const data = z.object({ fullName: z.string().max(200), code: z.string().max(64) }).parse(input);
    const fullName = cleanFullName(data.fullName);
    if (!fullName) throw new UserError('Please enter your full name (first and last name).');
    const code = normalizeJoinCode(data.code);
    if (!code) throw new UserError('Please enter the pass code your instructor gave you.');

    // Everything below runs one person at a time (advisory lock on their id), so a
    // burst of parallel guesses cannot slip past the "5 wrong tries" limit.
    const outcome = await db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`class-join:${userId}`}))`;

      const since = new Date(Date.now() - FAILED_JOIN_WINDOW_MS);
      const failures = await tx.joinAttempt.count({ where: { userId, success: false, createdAt: { gte: since } } });
      if (isFailedJoinLockout(failures)) return { kind: 'locked' as const };

      const offering = isPlausibleJoinCode(code)
        ? await tx.offering.findUnique({
            where: { joinCode: code },
            select: { id: true, joinCode: true, joinCodeExpiresAt: true },
          })
        : null;
      const status = offering ? joinCodeStatus(offering.joinCode, offering.joinCodeExpiresAt) : 'off';
      if (!offering || status !== 'active') {
        await tx.joinAttempt.create({ data: { userId, success: false } });
        // keep the table small: attempts older than a day are of no use
        await tx.joinAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
        return { kind: offering && status === 'expired' ? ('expired' as const) : ('wrong' as const) };
      }

      const existing = await tx.enrollment.findUnique({
        where: { offeringId_userId: { offeringId: offering.id, userId } },
        select: { role: true },
      });
      if (!existing) {
        await tx.enrollment.create({ data: { offeringId: offering.id, userId, role: 'LEARNER' } });
        // The name typed here is the one the instructor and classmates see.
        await tx.user.update({ where: { id: userId }, data: { name: fullName } });
        await tx.joinAttempt.create({ data: { userId, success: true } });
        await audit(tx, {
          offeringId: offering.id, actorId: userId, action: 'class.join', entity: 'Enrollment', entityId: userId,
          details: { fullName },
        });
      }
      return { kind: 'ok' as const, offeringId: offering.id };
    });

    if (outcome.kind === 'locked') throw new UserError('Too many wrong codes. Please wait 15 minutes, then try again.');
    if (outcome.kind === 'expired') throw new UserError('This pass code has expired. Please ask your instructor for a new one.');
    if (outcome.kind === 'wrong') throw new UserError(WRONG_CODE);
    const offering = { id: outcome.offeringId };
    revalidatePath(`/workspace-q/${offering.id}/manage`);
    revalidatePath('/workspace-q');
    return { ok: true, offeringId: offering.id };
  } catch (error) {
    return fail(error);
  }
}

// -----------------------------------------------------------------------------
// Roster (F2.5)
// -----------------------------------------------------------------------------

/** Takes a student out of the class and out of their team. Their files stay (staff can still see and delete them). */
export async function removeStudent(input: { offeringId: string; userId: string }): Promise<ClassActionResult> {
  try {
    const data = z.object({ offeringId: id, userId: id }).parse(input);
    const { user } = await requireStaff(data.offeringId);
    const enrolment = await db.enrollment.findUnique({
      where: { offeringId_userId: { offeringId: data.offeringId, userId: data.userId } },
    });
    if (enrolment?.role !== 'LEARNER') throw new UserError('Only students can be removed here.');
    await db.$transaction(async (tx) => {
      await tx.teamMember.deleteMany({ where: { offeringId: data.offeringId, userId: data.userId } });
      await tx.enrollment.delete({ where: { id: enrolment.id } });
      await audit(tx, {
        offeringId: data.offeringId, actorId: user.id, action: 'class.remove', entity: 'Enrollment', entityId: data.userId,
      });
    });
    refresh(data.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

// -----------------------------------------------------------------------------
// Switching Google account (wrong account when joining)
// -----------------------------------------------------------------------------

/** Signs out and returns to the sign-in page, which sends the person back to `returnTo` afterwards. */
export async function switchAccountTo(returnTo: string): Promise<void> {
  // Only paths inside Workspace Q; never an address someone else supplied.
  const safe = /^\/workspace-q(\/[A-Za-z0-9_\-./?=&%]*)?$/.test(returnTo) && !returnTo.includes('//') ? returnTo : '/workspace-q';
  await signOut({ redirectTo: `/workspace-q/signin?callbackUrl=${encodeURIComponent(safe)}` });
}
