import 'server-only';

import { auth } from '@/auth';
import { isPlatformAdmin } from '@/lib/courses';
import { prisma } from '@/lib/prisma';
import type { PrismaClient } from '@prisma/client';

const db = prisma as PrismaClient;

export interface ClassCard {
  id: string;
  name: string;
  /** staff can open class settings; learners and observers only the files */
  staff: boolean;
  roleLabel: string;
}

export interface MyClasses {
  signedIn: boolean;
  admin: boolean;
  classes: ClassCard[];
}

/**
 * The classes the signed-in person belongs to. Administrators see every
 * class, so they can reach the settings of classes they were never enrolled in.
 */
export async function loadMyClasses(): Promise<MyClasses> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { signedIn: false, admin: false, classes: [] };

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      globalRole: true,
      enrollments: { select: { role: true, offering: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } },
    },
  });
  if (!user) return { signedIn: false, admin: false, classes: [] };

  const admin = isPlatformAdmin(user);
  if (admin) {
    const all = await db.offering.findMany({ select: { id: true, name: true }, orderBy: { createdAt: 'desc' } });
    return { signedIn: true, admin, classes: all.map((o) => ({ id: o.id, name: o.name, staff: true, roleLabel: 'Instructor' })) };
  }
  return {
    signedIn: true,
    admin,
    classes: user.enrollments.map((e) => ({
      id: e.offering.id,
      name: e.offering.name,
      staff: e.role === 'INSTRUCTOR',
      roleLabel: e.role === 'INSTRUCTOR' ? 'Instructor' : e.role === 'OBSERVER' ? 'Observer' : 'Student',
    })),
  };
}
