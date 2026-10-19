import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Download, ExternalLink, FileText, Settings } from 'lucide-react';
import CoursePageTracker from '@/components/courses/CoursePageTracker';
import { checkCourseAdmin, getPublishedCourses, type PublishedCourse } from '@/lib/courses';
import { fileTypeLabel, formatBytes, inlineViewKind } from '@/lib/course-files';

export const metadata: Metadata = {
  title: 'Courses',
  description: 'Course materials and session slide decks from Quanta Foundry.',
};

// Always read the latest courses, so anything added or renamed on the admin
// page shows up immediately.
export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  const [courses, adminCheck] = await Promise.all([getPublishedCourses(), checkCourseAdmin()]);
  const isAdmin = adminCheck.status === 'ok';

  return (
    <>
      <CoursePageTracker />

      {/* Hero, same pattern as the About / Insights pages */}
      <section className="bg-[#0A1929] pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Courses</h1>
          <div className="mx-auto mb-6 h-[3px] w-16 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E0C35C]" />
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Find your course below to open or download the materials for each session.
          </p>

          {isAdmin && (
            <div className="mt-6">
              <Link
                href="/courses/admin"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-2 text-sm font-medium text-[#D4AF37] transition hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/20"
              >
                <Settings className="h-3.5 w-3.5" aria-hidden="true" />
                Manage courses
              </Link>
            </div>
          )}

          {courses.length > 1 && (
            <nav aria-label="Jump to a course" className="mt-8 flex flex-wrap justify-center gap-2">
              {courses.map((course) => (
                <a
                  key={course.id}
                  href={`#course-${course.id}`}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-[#4A90E2] hover:bg-white/10 hover:text-white"
                >
                  {course.title}
                </a>
              ))}
            </nav>
          )}
        </div>
      </section>

      <section aria-label="Course list" className="min-h-[40vh] bg-[#F5F7FA] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {courses.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-xl shadow-gray-200/50">
              <BookOpen className="mx-auto mb-4 h-10 w-10 text-[#4A90E2]" aria-hidden="true" />
              <p className="text-[#2C3E50]">No course materials are available yet. Please check back soon.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {courses.map((course) => (
                <CourseBlock key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function CourseBlock({ course }: { course: PublishedCourse }) {
  return (
    <section
      id={`course-${course.id}`}
      aria-labelledby={`course-${course.id}-title`}
      className="scroll-mt-28 overflow-hidden rounded-2xl bg-white shadow-xl shadow-gray-200/50"
    >
      <header className="border-b border-gray-100 bg-gradient-to-r from-[#0A1929] to-[#0D2137] px-6 py-6 sm:px-8">
        <h2 id={`course-${course.id}-title`} className="text-xl font-bold text-white sm:text-2xl">
          {course.title}
        </h2>
        {course.description && (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-300">{course.description}</p>
        )}
        <p className="mt-3 text-xs font-medium uppercase tracking-wider text-[#D4AF37]">
          {course.materials.length} {course.materials.length === 1 ? 'file' : 'files'}
        </p>
      </header>

      {course.materials.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm italic text-[#2C3E50]/70 sm:px-8">
          Materials for this course will be added soon.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {course.materials.map((material) => {
            const viewable = inlineViewKind(material.fileName, material.contentType) !== null;
            return (
              <li
                key={material.id}
                className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <span
                    className="mt-0.5 flex h-10 w-12 shrink-0 items-center justify-center rounded-lg bg-[#4A90E2]/10 text-[11px] font-bold tracking-wide text-[#3A7BD0]"
                    aria-hidden="true"
                  >
                    {fileTypeLabel(material.fileName)}
                  </span>
                  <div className="min-w-0">
                    {material.sessionLabel && (
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                        {material.sessionLabel}
                      </p>
                    )}
                    <p className="break-words font-semibold text-[#0A1929]">{material.title}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#2C3E50]/60">
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="truncate">{material.fileName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="shrink-0">{formatBytes(material.sizeBytes)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2 sm:ml-4">
                  {viewable && (
                    <a
                      href={`/api/courses/materials/${material.id}/view`}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#0A1929]/15 px-4 py-2 text-sm font-medium text-[#0A1929] transition hover:border-[#4A90E2] hover:text-[#3A7BD0] sm:flex-none"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      Open
                    </a>
                  )}
                  <a
                    href={`/api/courses/materials/${material.id}/download`}
                    rel="nofollow"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0A1929] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0D2137] sm:flex-none"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
