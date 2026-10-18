'use server';

import { revalidatePath } from 'next/cache';
import { del, head } from '@vercel/blob';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { courseDb as db, requireCourseAdmin } from '@/lib/courses';
import { isValidCourseBlobPathname, isVercelBlobUrl, moveInList } from '@/lib/course-files';

// Every action re-checks admin access on the server: the admin page hiding
// buttons is not what protects these.

export type ActionResult = { ok: true } | { ok: false; error: string };

function fail(error: unknown): ActionResult {
  console.error('Course admin action failed:', error);
  if (error instanceof z.ZodError) {
    return { ok: false, error: error.issues[0]?.message ?? 'Invalid input.' };
  }
  // Database errors carry a code (e.g. P2025 = row not found). Don't show
  // their raw text, which is long and technical.
  const code = (error as { code?: unknown } | null)?.code;
  if (typeof code === 'string' && code.startsWith('P')) {
    return {
      ok: false,
      error: code === 'P2025'
        ? 'This item no longer exists. Refresh the page.'
        : 'Something went wrong while saving. Please try again.',
    };
  }
  // Our own errors (thrown above with a readable message) and Vercel Blob errors.
  return { ok: false, error: error instanceof Error ? error.message : 'Something went wrong.' };
}

function refresh() {
  revalidatePath('/courses');
  revalidatePath('/courses/admin');
}

const id = z.string().min(1).max(64);
const title = z.string().trim().min(1, 'Please enter a name.').max(200, 'That name is too long.');
const description = z.string().trim().max(2000, 'That description is too long.');
const sessionLabel = z.string().trim().max(100, 'That session label is too long.');
const direction = z.enum(['up', 'down']);

/** Deletes files from Vercel Blob. Logs instead of throwing on failure. */
async function deleteBlobs(urls: string[]) {
  if (urls.length === 0) return;
  try {
    await del(urls);
  } catch (error) {
    console.error('Could not delete course files from Vercel Blob:', error);
  }
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export async function createCourse(input: { title: string; description?: string }): Promise<ActionResult> {
  try {
    await requireCourseAdmin();
    const data = z.object({ title, description: description.optional() }).parse(input);
    const last = await db.course.aggregate({ _max: { order: true } });
    await db.course.create({
      data: {
        title: data.title,
        description: data.description || null,
        order: (last._max.order ?? -1) + 1,
      },
    });
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function updateCourse(input: {
  id: string;
  title?: string;
  description?: string;
  isPublished?: boolean;
}): Promise<ActionResult> {
  try {
    await requireCourseAdmin();
    const data = z
      .object({ id, title: title.optional(), description: description.optional(), isPublished: z.boolean().optional() })
      .parse(input);
    await db.course.update({
      where: { id: data.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      },
    });
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function moveCourse(input: { id: string; direction: 'up' | 'down' }): Promise<ActionResult> {
  try {
    await requireCourseAdmin();
    const data = z.object({ id, direction }).parse(input);
    const courses = await db.course.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: { id: true },
    });
    await reorder(courses.map((c) => c.id), data.id, data.direction, (rowId, order) =>
      db.course.update({ where: { id: rowId }, data: { order } }),
    );
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteCourse(input: { id: string }): Promise<ActionResult> {
  try {
    await requireCourseAdmin();
    const data = z.object({ id }).parse(input);
    const materials = await db.courseMaterial.findMany({
      where: { courseId: data.id },
      select: { blobUrl: true },
    });
    // Materials and their stats are removed by ON DELETE CASCADE.
    await db.course.delete({ where: { id: data.id } });
    await deleteBlobs(materials.map((m) => m.blobUrl));
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------

/**
 * Called by the admin page right after a file finished uploading to Vercel
 * Blob. Re-reads the file's real size and type from Blob rather than
 * trusting what the browser sent.
 */
export async function addMaterial(input: {
  courseId: string;
  blobUrl: string;
  fileName: string;
  title: string;
  sessionLabel?: string;
}): Promise<ActionResult> {
  try {
    await requireCourseAdmin();
    const data = z
      .object({
        courseId: id,
        blobUrl: z.string().url(),
        fileName: z.string().trim().min(1).max(255),
        title,
        sessionLabel: sessionLabel.optional(),
      })
      .parse(input);

    if (!isVercelBlobUrl(data.blobUrl)) throw new Error('Invalid file address.');
    const blob = await head(data.blobUrl);
    if (!isValidCourseBlobPathname(blob.pathname, data.courseId)) throw new Error('Invalid file location.');

    const course = await db.course.findUnique({ where: { id: data.courseId }, select: { id: true } });
    if (!course) {
      await deleteBlobs([blob.url]);
      throw new Error('That course no longer exists.');
    }

    const last = await db.courseMaterial.aggregate({
      where: { courseId: data.courseId },
      _max: { order: true },
    });
    await db.courseMaterial.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        sessionLabel: data.sessionLabel || null,
        fileName: data.fileName,
        blobUrl: blob.url,
        blobPathname: blob.pathname,
        contentType: blob.contentType || null,
        sizeBytes: blob.size,
        order: (last._max.order ?? -1) + 1,
      },
    });
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function updateMaterial(input: {
  id: string;
  title?: string;
  sessionLabel?: string;
}): Promise<ActionResult> {
  try {
    await requireCourseAdmin();
    const data = z.object({ id, title: title.optional(), sessionLabel: sessionLabel.optional() }).parse(input);
    await db.courseMaterial.update({
      where: { id: data.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.sessionLabel !== undefined && { sessionLabel: data.sessionLabel || null }),
      },
    });
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function moveMaterial(input: { id: string; direction: 'up' | 'down' }): Promise<ActionResult> {
  try {
    await requireCourseAdmin();
    const data = z.object({ id, direction }).parse(input);
    const material = await db.courseMaterial.findUniqueOrThrow({
      where: { id: data.id },
      select: { courseId: true },
    });
    const siblings = await db.courseMaterial.findMany({
      where: { courseId: material.courseId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: { id: true },
    });
    await reorder(siblings.map((m) => m.id), data.id, data.direction, (rowId, order) =>
      db.courseMaterial.update({ where: { id: rowId }, data: { order } }),
    );
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteMaterial(input: { id: string }): Promise<ActionResult> {
  try {
    await requireCourseAdmin();
    const data = z.object({ id }).parse(input);
    const material = await db.courseMaterial.delete({
      where: { id: data.id },
      select: { blobUrl: true },
    });
    await deleteBlobs([material.blobUrl]);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

// ---------------------------------------------------------------------------
// Ordering helper
// ---------------------------------------------------------------------------

/**
 * Moves one item up or down and rewrites every item's `order` as 0..n-1, in
 * one transaction. Rewriting all of them (rather than swapping two numbers)
 * also repairs any gaps or ties left by earlier deletes.
 */
async function reorder(
  orderedIds: string[],
  movingId: string,
  dir: 'up' | 'down',
  write: (id: string, order: number) => Prisma.PrismaPromise<unknown>,
) {
  const next = moveInList(orderedIds, movingId, dir);
  if (next === orderedIds) return;
  await db.$transaction(next.map((rowId, index) => write(rowId, index)));
}
