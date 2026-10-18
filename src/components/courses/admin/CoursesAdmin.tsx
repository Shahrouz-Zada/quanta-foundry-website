'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, BarChart3, Download, ExternalLink, Eye, Plus, Users } from 'lucide-react';
import type { AdminCourse, CourseStatsSummary } from '@/lib/courses';
import { createCourse } from '@/app/courses/admin/actions';
import CourseCard from './CourseCard';
import { Button, ErrorText, inputClass, useAction } from './ui';

interface Props {
  courses: AdminCourse[];
  stats: CourseStatsSummary;
  adminEmail: string;
  storageConnected: boolean;
}

export default function CoursesAdmin({ courses, stats, adminEmail, storageConnected }: Props) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      <header className="bg-[#0A1929] pt-32 pb-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Manage courses</h1>
            <p className="mt-2 text-sm text-gray-400">Signed in as {adminEmail}</p>
          </div>
          <Link
            href="/courses"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6BA4E8] hover:text-white"
          >
            View the public Courses page
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-5xl space-y-8 px-4 sm:px-6">
        {!storageConnected && (
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">File storage isn&apos;t connected yet, so uploads won&apos;t work.</p>
              <p className="mt-1">
                In Vercel, open this project, go to <strong>Storage</strong>, create a <strong>Blob</strong> store
                with <strong>Public</strong> access and connect it to this project, then redeploy. You can still
                create and rename courses in the meantime.
              </p>
            </div>
          </div>
        )}

        <StatsOverview stats={stats} />

        <NewCourseForm />

        {courses.length === 0 ? (
          <p className="rounded-2xl bg-white p-10 text-center text-sm text-[#2C3E50]/70 shadow-sm">
            No courses yet. Create your first one above.
          </p>
        ) : (
          <div className="space-y-6">
            {courses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                stats={stats.byMaterial}
                isFirst={index === 0}
                isLast={index === courses.length - 1}
                storageConnected={storageConnected}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatsOverview({ stats }: { stats: CourseStatsSummary }) {
  const tiles = [
    { icon: Users, label: 'Courses page visits', value: stats.pageViews7d, sub: `${stats.pageViews30d} in 30 days · ${stats.pageViews} total` },
    { icon: Eye, label: 'Files opened', value: stats.views7d, sub: `${stats.views} total` },
    { icon: Download, label: 'Files downloaded', value: stats.downloads7d, sub: `${stats.downloads} total` },
  ];

  return (
    <section aria-labelledby="stats-title" className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-[#4A90E2]" aria-hidden="true" />
        <h2 id="stats-title" className="font-semibold text-[#0A1929]">
          Last 7 days
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {tiles.map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="rounded-xl border border-gray-100 bg-[#F5F7FA] p-4">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#2C3E50]/70">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-[#0A1929]">{value}</p>
            <p className="mt-1 text-xs text-[#2C3E50]/60">{sub}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-[#2C3E50]/60">
        Counts are clicks, not unique students. Your own clicks from this admin page aren&apos;t counted; known
        bots and link previews are filtered out. A page visit counts once per browser tab.
      </p>
    </section>
  );
}

function NewCourseForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { pending, error, run } = useAction();

  return (
    <section aria-labelledby="new-course-title" className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 id="new-course-title" className="mb-4 font-semibold text-[#0A1929]">
        Add a course
      </h2>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => createCourse({ title, description }), () => {
            setTitle('');
            setDescription('');
          });
        }}
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-[#2C3E50]">Course name</span>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. AI & Automation — ESDES M2"
            maxLength={200}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-[#2C3E50]">
            Short description <span className="font-normal text-gray-400">(optional)</span>
          </span>
          <textarea
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={2000}
            placeholder="Who it's for, semester, schedule…"
          />
        </label>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" variant="primary" pending={pending} disabled={!title.trim()}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add course
        </Button>
      </form>
    </section>
  );
}
