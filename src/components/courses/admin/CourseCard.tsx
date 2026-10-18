'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Eye, EyeOff, Link2, Save, Trash2 } from 'lucide-react';
import type { AdminCourse, MaterialStats } from '@/lib/courses';
import { deleteCourse, moveCourse, updateCourse } from '@/app/courses/admin/actions';
import MaterialRow from './MaterialRow';
import MaterialUploader from './MaterialUploader';
import { Button, ConfirmDelete, ErrorText, IconButton, inputClass, useAction } from './ui';

interface Props {
  course: AdminCourse;
  stats: Record<string, MaterialStats>;
  isFirst: boolean;
  isLast: boolean;
  storageConnected: boolean;
}

export default function CourseCard({ course, stats, isFirst, isLast, storageConnected }: Props) {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description ?? '');
  const [copied, setCopied] = useState(false);
  const { pending, error, run } = useAction();

  const dirty = title.trim() !== course.title || description.trim() !== (course.description ?? '');
  const totals = course.materials.reduce(
    (acc, m) => ({
      views: acc.views + (stats[m.id]?.views ?? 0),
      downloads: acc.downloads + (stats[m.id]?.downloads ?? 0),
    }),
    { views: 0, downloads: 0 },
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/courses#course-${course.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: nothing useful to do.
    }
  }

  return (
    <section
      aria-label={course.title}
      className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ${course.isPublished ? 'ring-gray-100' : 'ring-amber-200'}`}
    >
      {/* Course header: name, description, visibility, order, delete */}
      <div className="space-y-4 border-b border-gray-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              course.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
            }`}
          >
            {course.isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {course.isPublished ? 'Visible to students' : 'Hidden from students'}
          </span>
          <div className="flex items-center gap-1">
            <span className="mr-2 text-xs text-[#2C3E50]/60">
              {totals.views} opens · {totals.downloads} downloads
            </span>
            <IconButton label="Move course up" disabled={isFirst || pending} onClick={() => run(() => moveCourse({ id: course.id, direction: 'up' }))}>
              <ChevronUp className="h-4 w-4" />
            </IconButton>
            <IconButton label="Move course down" disabled={isLast || pending} onClick={() => run(() => moveCourse({ id: course.id, direction: 'down' }))}>
              <ChevronDown className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#2C3E50]/70">Course name</span>
            <input className={`${inputClass} text-base font-semibold`} value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#2C3E50]/70">Description</span>
            <textarea className={inputClass} value={description} rows={1} maxLength={2000} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
          </label>
        </div>

        <ErrorText>{error}</ErrorText>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            pending={pending && dirty}
            disabled={!dirty || !title.trim()}
            onClick={() => run(() => updateCourse({ id: course.id, title, description }))}
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Save name
          </Button>
          {dirty && (
            <Button variant="ghost" onClick={() => { setTitle(course.title); setDescription(course.description ?? ''); }}>
              Undo changes
            </Button>
          )}
          <Button
            disabled={pending}
            onClick={() => run(() => updateCourse({ id: course.id, isPublished: !course.isPublished }))}
          >
            {course.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {course.isPublished ? 'Hide from students' : 'Show to students'}
          </Button>
          <Button variant="ghost" onClick={copyLink}>
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}
            {copied ? 'Link copied' : 'Copy link'}
          </Button>
          <span className="ml-auto">
            <ConfirmDelete
              label={<><Trash2 className="h-4 w-4" aria-hidden="true" />Delete course</>}
              confirmText={`Delete "${course.title}" and all ${course.materials.length} file(s)?`}
              pending={pending}
              onConfirm={() => run(() => deleteCourse({ id: course.id }))}
            />
          </span>
        </div>
      </div>

      {/* Materials */}
      <div className="bg-[#FAFBFD] p-6">
        <h3 className="mb-3 text-sm font-semibold text-[#0A1929]">
          Materials <span className="font-normal text-[#2C3E50]/60">({course.materials.length})</span>
        </h3>
        {course.materials.length === 0 ? (
          <p className="mb-4 text-sm text-[#2C3E50]/60">No files yet. Upload the first one below.</p>
        ) : (
          <ul className="mb-5 space-y-3">
            {course.materials.map((material, index) => (
              <MaterialRow
                key={`${material.id}-${new Date(material.updatedAt).getTime()}`}
                material={material}
                stats={stats[material.id]}
                isFirst={index === 0}
                isLast={index === course.materials.length - 1}
              />
            ))}
          </ul>
        )}
        <MaterialUploader courseId={course.id} disabled={!storageConnected} />
      </div>
    </section>
  );
}
