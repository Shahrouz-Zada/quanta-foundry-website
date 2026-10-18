'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Download, ExternalLink, Save, Trash2 } from 'lucide-react';
import type { AdminCourse, MaterialStats } from '@/lib/courses';
import { deleteMaterial, moveMaterial, updateMaterial } from '@/app/courses/admin/actions';
import { fileTypeLabel, formatBytes, inlineViewKind } from '@/lib/course-files';
import { Button, ConfirmDelete, ErrorText, IconButton, inputClass, useAction } from './ui';

interface Props {
  material: AdminCourse['materials'][number];
  stats?: MaterialStats;
  isFirst: boolean;
  isLast: boolean;
}

export default function MaterialRow({ material, stats, isFirst, isLast }: Props) {
  const [title, setTitle] = useState(material.title);
  const [sessionLabel, setSessionLabel] = useState(material.sessionLabel ?? '');
  const { pending, error, run } = useAction();

  const dirty = title.trim() !== material.title || sessionLabel.trim() !== (material.sessionLabel ?? '');
  const viewable = inlineViewKind(material.fileName, material.contentType) !== null;
  const uploaded = new Date(material.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <li className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg bg-[#4A90E2]/10 text-[11px] font-bold text-[#3A7BD0]" aria-hidden="true">
          {fileTypeLabel(material.fileName)}
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="grid gap-2 sm:grid-cols-[2fr_1fr]">
            <label className="block">
              <span className="sr-only">Title</span>
              <input className={inputClass} value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} placeholder="Title shown to students" />
            </label>
            <label className="block">
              <span className="sr-only">Session label</span>
              <input className={inputClass} value={sessionLabel} maxLength={100} onChange={(e) => setSessionLabel(e.target.value)} placeholder="Session (e.g. Session 1)" />
            </label>
          </div>
          <p className="truncate text-xs text-[#2C3E50]/60">
            {material.fileName} · {formatBytes(material.sizeBytes)} · uploaded {uploaded}
          </p>
          <p className="text-xs text-[#2C3E50]/80">
            <strong className="tabular-nums">{stats?.views ?? 0}</strong> opens
            <span className="text-[#2C3E50]/50"> ({stats?.views7d ?? 0} this week)</span>
            {' · '}
            <strong className="tabular-nums">{stats?.downloads ?? 0}</strong> downloads
            <span className="text-[#2C3E50]/50"> ({stats?.downloads7d ?? 0} this week)</span>
          </p>
          <ErrorText>{error}</ErrorText>
          {dirty && (
            <div className="flex gap-2">
              <Button variant="primary" className="px-2.5 py-1.5 text-xs" pending={pending} disabled={!title.trim()} onClick={() => run(() => updateMaterial({ id: material.id, title, sessionLabel }))}>
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                Save
              </Button>
              <Button variant="ghost" className="px-2.5 py-1.5 text-xs" onClick={() => { setTitle(material.title); setSessionLabel(material.sessionLabel ?? ''); }}>
                Undo
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1 lg:justify-end">
          {viewable && (
            <a
              href={`/api/courses/materials/${material.id}/view?preview=1`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open (not counted)"
              title="Open (not counted in stats)"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#2C3E50] hover:bg-gray-100"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <a
            href={`/api/courses/materials/${material.id}/download?preview=1`}
            aria-label="Download (not counted)"
            title="Download (not counted in stats)"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#2C3E50] hover:bg-gray-100"
          >
            <Download className="h-4 w-4" />
          </a>
          <IconButton label="Move up" disabled={isFirst || pending} onClick={() => run(() => moveMaterial({ id: material.id, direction: 'up' }))}>
            <ChevronUp className="h-4 w-4" />
          </IconButton>
          <IconButton label="Move down" disabled={isLast || pending} onClick={() => run(() => moveMaterial({ id: material.id, direction: 'down' }))}>
            <ChevronDown className="h-4 w-4" />
          </IconButton>
          <ConfirmDelete
            label={<Trash2 className="h-4 w-4" aria-label="Delete file" />}
            confirmText="Delete this file?"
            pending={pending}
            onConfirm={() => run(() => deleteMaterial({ id: material.id }))}
          />
        </div>
      </div>
    </li>
  );
}
