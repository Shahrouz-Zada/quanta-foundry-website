import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import CoursesAdmin from '@/components/courses/admin/CoursesAdmin';
import { checkCourseAdmin, getAllCoursesForAdmin, getCourseStats } from '@/lib/courses';

export const metadata: Metadata = {
  title: 'Manage courses',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function CoursesAdminPage() {
  const check = await checkCourseAdmin();

  if (check.status === 'signed-out') {
    redirect(`/workspace-q/signin?callbackUrl=${encodeURIComponent('/courses/admin')}`);
  }

  if (check.status === 'forbidden') {
    return (
      <div className="min-h-screen bg-[#F5F7FA] px-4 pb-24">
        <div className="-mx-4 mb-10 bg-[#0A1929] pt-28 pb-8" aria-hidden="true" />
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl shadow-gray-200/50">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-[#D4AF37]" aria-hidden="true" />
          <h1 className="mb-2 text-xl font-bold text-[#0A1929]">Administrators only</h1>
          <p className="text-sm text-[#2C3E50]">
            You&apos;re signed in as <strong>{check.email ?? 'an unknown account'}</strong>, which doesn&apos;t
            have permission to manage courses.
          </p>
          <Link href="/courses" className="mt-6 inline-block text-sm font-medium text-[#3A7BD0] hover:underline">
            Go to the Courses page
          </Link>
        </div>
      </div>
    );
  }

  const [courses, stats] = await Promise.all([getAllCoursesForAdmin(), getCourseStats()]);

  return (
    <CoursesAdmin
      courses={courses}
      stats={stats}
      adminEmail={check.user.email}
      storageConnected={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
    />
  );
}
