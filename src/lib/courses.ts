import 'server-only';

import type { CourseEventType, PrismaClient } from '@prisma/client';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// `prisma` is exported as `any` (see lib/prisma.ts, because of $extends).
// Re-typing it here gives the course queries full type checking. The
// extension in lib/prisma.ts only touches SessionVersion, so nothing about
// these models behaves differently.
const db = prisma as PrismaClient;

// =============================================================================
// Admin access
// =============================================================================

export type CourseAdminCheck =
  | { status: 'ok'; user: { id: string; email: string } }
  | { status: 'signed-out' }
  | { status: 'forbidden'; email: string | null };

/** Comma-separated list in the ADMIN_EMAILS environment variable. */
function adminEmailsFromEnv(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Who may manage courses: anyone whose User row has globalRole ADMIN (the
 * same rule the rest of the platform uses), plus any email listed in the
 * ADMIN_EMAILS environment variable, so access can be granted from the
 * Vercel dashboard without touching the database.
 */
export async function checkCourseAdmin(): Promise<CourseAdminCheck> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { status: 'signed-out' };

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, globalRole: true },
  });
  if (!user) return { status: 'signed-out' };

  const isAdmin =
    user.globalRole === 'ADMIN' || adminEmailsFromEnv().includes(user.email.toLowerCase());

  return isAdmin
    ? { status: 'ok', user: { id: user.id, email: user.email } }
    : { status: 'forbidden', email: user.email };
}

export async function requireCourseAdmin() {
  const check = await checkCourseAdmin();
  if (check.status !== 'ok') {
    throw new Error('Forbidden: only administrators can manage courses.');
  }
  return check.user;
}

// =============================================================================
// Public reads
// =============================================================================

const materialSelect = {
  id: true,
  title: true,
  sessionLabel: true,
  fileName: true,
  contentType: true,
  sizeBytes: true,
  order: true,
  updatedAt: true,
} as const;

/** Visible courses, in order, each with its materials in order. */
export async function getPublishedCourses() {
  return db.course.findMany({
    where: { isPublished: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      title: true,
      description: true,
      materials: {
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        select: materialSelect,
      },
    },
  });
}

export type PublishedCourse = Awaited<ReturnType<typeof getPublishedCourses>>[number];

/**
 * The material behind a view/download link. Materials of a hidden course
 * are only reachable by admins (so you can still preview before publishing).
 */
export async function getDeliverableMaterial(materialId: string) {
  const material = await db.courseMaterial.findUnique({
    where: { id: materialId },
    select: {
      id: true,
      courseId: true,
      fileName: true,
      contentType: true,
      sizeBytes: true,
      blobUrl: true,
      course: { select: { isPublished: true } },
    },
  });
  if (!material) return null;
  if (!material.course.isPublished) {
    const check = await checkCourseAdmin();
    if (check.status !== 'ok') return null;
  }
  return material;
}

// =============================================================================
// Statistics
// =============================================================================

/** Records one view / download / page visit. Never throws. */
export async function recordCourseEvent(
  type: CourseEventType,
  ids: { courseId?: string | null; materialId?: string | null } = {},
) {
  try {
    await db.courseEvent.create({
      data: { type, courseId: ids.courseId ?? null, materialId: ids.materialId ?? null },
    });
  } catch (error) {
    // Stats are nice-to-have: a failed insert must never block a download.
    console.error('Failed to record course event:', error);
  }
}

export interface MaterialStats {
  views: number;
  downloads: number;
  views7d: number;
  downloads7d: number;
}

export interface CourseStatsSummary {
  pageViews: number;
  pageViews7d: number;
  pageViews30d: number;
  views: number;
  downloads: number;
  views7d: number;
  downloads7d: number;
  byMaterial: Record<string, MaterialStats>;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getCourseStats(now: Date = new Date()): Promise<CourseStatsSummary> {
  const since7 = new Date(now.getTime() - 7 * DAY_MS);
  const since30 = new Date(now.getTime() - 30 * DAY_MS);
  const materialTypes: CourseEventType[] = ['MATERIAL_VIEW', 'MATERIAL_DOWNLOAD'];

  const [allTime, last7, pageViews, pageViews7d, pageViews30d] = await Promise.all([
    db.courseEvent.groupBy({
      by: ['materialId', 'type'],
      where: { materialId: { not: null }, type: { in: materialTypes } },
      _count: { _all: true },
    }),
    db.courseEvent.groupBy({
      by: ['materialId', 'type'],
      where: { materialId: { not: null }, type: { in: materialTypes }, createdAt: { gte: since7 } },
      _count: { _all: true },
    }),
    db.courseEvent.count({ where: { type: 'PAGE_VIEW' } }),
    db.courseEvent.count({ where: { type: 'PAGE_VIEW', createdAt: { gte: since7 } } }),
    db.courseEvent.count({ where: { type: 'PAGE_VIEW', createdAt: { gte: since30 } } }),
  ]);

  const byMaterial: Record<string, MaterialStats> = {};
  const entry = (id: string) =>
    (byMaterial[id] ??= { views: 0, downloads: 0, views7d: 0, downloads7d: 0 });

  for (const row of allTime) {
    if (!row.materialId) continue;
    const e = entry(row.materialId);
    if (row.type === 'MATERIAL_VIEW') e.views += row._count._all;
    else e.downloads += row._count._all;
  }
  for (const row of last7) {
    if (!row.materialId) continue;
    const e = entry(row.materialId);
    if (row.type === 'MATERIAL_VIEW') e.views7d += row._count._all;
    else e.downloads7d += row._count._all;
  }

  const totals = Object.values(byMaterial).reduce(
    (acc, s) => ({
      views: acc.views + s.views,
      downloads: acc.downloads + s.downloads,
      views7d: acc.views7d + s.views7d,
      downloads7d: acc.downloads7d + s.downloads7d,
    }),
    { views: 0, downloads: 0, views7d: 0, downloads7d: 0 },
  );

  return { pageViews, pageViews7d, pageViews30d, ...totals, byMaterial };
}

// =============================================================================
// Admin reads
// =============================================================================

/** Every course (including hidden ones) with materials, for the admin page. */
export async function getAllCoursesForAdmin() {
  return db.course.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      title: true,
      description: true,
      isPublished: true,
      materials: {
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        select: { ...materialSelect, createdAt: true },
      },
    },
  });
}

export type AdminCourse = Awaited<ReturnType<typeof getAllCoursesForAdmin>>[number];

export { db as courseDb };
