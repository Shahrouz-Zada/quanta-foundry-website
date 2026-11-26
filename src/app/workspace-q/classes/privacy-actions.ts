'use server';

// =============================================================================
// Workspace Q · privacy — server actions: the class deletion date (staff),
// deleting a class's student data now (staff), deleting one's own account.
// =============================================================================

import { revalidatePath } from 'next/cache';
import { del } from '@vercel/blob';
import { z } from 'zod';
import { auth } from '@/auth';
import { audit, getClassViewer, studentFilesToken } from '@/lib/workspace-files-server';
import { deleteAccount, privacyDb as db, purgeClassData, type PurgeResult } from '@/lib/privacy-server';
import { checkDeleteDate } from '@/lib/privacy';
import { zonedLocalToUtc } from '@/lib/workspace-materials';

export type PrivacyResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

class UserError extends Error {}

function fail(error: unknown): { ok: false; error: string } {
  if (error instanceof UserError) return { ok: false, error: error.message };
  if (error instanceof z.ZodError) return { ok: false, error: error.issues[0]?.message ?? 'Invalid input.' };
  console.error('Privacy action failed:', error);
  return { ok: false, error: 'Something went wrong. Please try again.' };
}

async function deleteStored(pathnames: string[]) {
  const token = studentFilesToken();
  if (!token || pathnames.length === 0) return;
  try {
    // A few hundred at a time keeps each request small.
    for (let i = 0; i < pathnames.length; i += 500) await del(pathnames.slice(i, i + 500), { token });
  } catch (error) {
    // The database rows are gone, so nothing can reach these copies any more; log them for clean-up.
    console.error('Could not delete stored files:', pathnames.length, error);
  }
}

async function requireStaff(offeringId: string) {
  const check = await getClassViewer(offeringId);
  if (check.status !== 'ok' || check.viewer.role !== 'staff') throw new UserError('You don’t have permission to do this.');
  return check;
}

/** Sets (or clears, with null) the day this class's student data is deleted. Dates are Paris time. */
export async function setClassDeleteDate(input: { offeringId: string; date: string | null }): Promise<PrivacyResult> {
  try {
    const data = z.object({ offeringId: z.string().min(1).max(64), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable() }).parse(input);
    const { user } = await requireStaff(data.offeringId);
    const offering = await db.offering.findUniqueOrThrow({ where: { id: data.offeringId }, select: { dataDeletedAt: true } });
    if (offering.dataDeletedAt) throw new UserError('This class’s student data was already deleted.');
    const when = data.date ? zonedLocalToUtc(`${data.date}T00:00`) : null;
    if (data.date) {
      const problem = when ? checkDeleteDate(when) : 'Please choose a valid date.';
      if (problem) throw new UserError(problem);
    }
    await db.$transaction(async (tx) => {
      await tx.offering.update({ where: { id: data.offeringId }, data: { dataDeleteAfter: when } });
      await audit(tx, {
        offeringId: data.offeringId, actorId: user.id, action: 'class.retention', entity: 'Offering', entityId: data.offeringId,
        details: { deleteOn: data.date },
      });
    });
    revalidatePath(`/workspace-q/${data.offeringId}/manage`);
    revalidatePath(`/workspace-q/${data.offeringId}`);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/** Deletes all student data of the class now. The instructor types the class name to confirm. */
export async function deleteClassDataNow(input: { offeringId: string; confirmName: string }): Promise<PrivacyResult<{ result: PurgeResult }>> {
  try {
    const data = z.object({ offeringId: z.string().min(1).max(64), confirmName: z.string().max(300) }).parse(input);
    const { user, offering } = await requireStaff(data.offeringId);
    const norm = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();
    if (norm(data.confirmName) !== norm(offering.name)) throw new UserError('Type the class name exactly to confirm.');
    const result = await purgeClassData(data.offeringId, user.id, deleteStored);
    if (!result) throw new UserError('This class no longer exists.');
    revalidatePath(`/workspace-q/${data.offeringId}/manage`);
    return { ok: true, result };
  } catch (error) {
    return fail(error);
  }
}

/** A student deletes their own account. They type DELETE to confirm; the page then signs them out. */
export async function deleteMyAccount(input: { confirm: string }): Promise<PrivacyResult> {
  try {
    const data = z.object({ confirm: z.string().max(20) }).parse(input);
    if (data.confirm.trim().toUpperCase() !== 'DELETE') throw new UserError('Type DELETE to confirm.');
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new UserError('Please sign in again.');
    const result = await deleteAccount(userId, deleteStored);
    if (!result.ok) {
      throw new UserError(
        result.reason === 'staff'
          ? 'Instructor and administrator accounts can’t be deleted here, because classes depend on them.'
          : result.reason === 'already-deleted'
            ? 'This account was already deleted.'
            : 'Please sign in again.',
      );
    }
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
