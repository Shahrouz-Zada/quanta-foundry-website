'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  History,
  Lock,
  Pencil,
  Trash2,
  Upload,
} from 'lucide-react';
import { deleteMaterial, moveMaterial, updateMaterial } from '@/app/workspace-q/classes/materials-actions';
import { fileTypeLabel, formatBytes } from '@/lib/course-files';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { FILE_KINDS, formatClassDate, pickTitle, type MaterialKind } from '@/lib/workspace-materials';
import type { MaterialView } from '@/lib/workspace-materials-server';
import { Button, ErrorText, fieldClass, useAction } from '@/components/workspace/files/ui';
import { uploadMaterial } from './uploadMaterial';

export interface SessionOption {
  id: string;
  label: string;
}

const kindLabelEn: Record<MaterialKind, string> = {
  DECK: 'Slide deck',
  PREREAD: 'Pre-read',
  NOTEBOOK: 'Notebook',
  DATASET: 'Dataset',
  DOCUMENT: 'Document',
  LINK: 'Link',
};

export default function MaterialItem({
  material,
  offeringId,
  staff,
  sessionOptions,
}: {
  material: MaterialView;
  offeringId: string;
  staff: boolean;
  sessionOptions: SessionOption[];
}) {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [versionState, setVersionState] = useState<string | null>(null);
  const versionInput = useRef<HTMLInputElement>(null);
  const action = useAction();

  const fileUrl = (extra?: string) => `/api/workspace-q/materials/${material.id}/file${extra ? `?${extra}` : ''}`;
  const title = pickTitle(material, lang);
  const isLink = material.kind === 'LINK';

  async function copyDataLink() {
    if (!material.dataPath) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${material.dataPath}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  async function onNewVersion(list: FileList | null) {
    const file = list?.[0];
    if (!file) return;
    setVersionState('0%');
    const error = await uploadMaterial(file, {
      offeringId,
      materialId: material.id,
      onProgress: (p) => setVersionState(`${p}%`),
      onSaving: () => setVersionState('Saving…'),
    });
    if (versionInput.current) versionInput.current.value = '';
    setVersionState(null);
    if (error) action.setError(error);
    else router.refresh();
  }

  const pill = 'inline-flex items-center gap-1.5 rounded-lg border border-[var(--wq-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--wq-text)] hover:border-[var(--wq-border-hover)]';

  return (
    <li className="rounded-xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-3" data-testid="material">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-9 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--wq-canvas-alt)] text-[10px] font-bold tracking-wide text-[var(--wq-text-muted)]"
          >
            {isLink ? 'LINK' : fileTypeLabel(material.current?.fileName ?? '')}
          </span>
          <div className="min-w-0">
            <p className="break-words font-semibold text-[var(--wq-text)]">{title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="rounded-full bg-[var(--wq-canvas-alt)] px-2 py-0.5 font-semibold text-[var(--wq-text-muted)]">
                {t(`class.kind.${material.kind}`)}
              </span>
              <span className="rounded-full bg-[var(--wq-canvas-alt)] px-2 py-0.5 text-[var(--wq-text-muted)]">
                {t(`class.lang.${material.language}`)}
              </span>
              {material.updatedAt && (
                <span className="rounded-full bg-[var(--wq-gold-muted)] px-2 py-0.5 font-semibold text-[#9A7B1C]">
                  {t('class.updated', { date: formatClassDate(material.updatedAt, lang, false) })}
                </span>
              )}
              {!material.canDownload && !isLink && (
                <span className="rounded-full bg-[var(--wq-canvas-alt)] px-2 py-0.5 text-[var(--wq-text-muted)]">{t('class.viewOnly')}</span>
              )}
              {staff && material.audience === 'STAFF' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 font-semibold text-red-700">
                  <Lock className="h-3 w-3" aria-hidden="true" /> Staff only
                </span>
              )}
              {staff && material.audience === 'STUDENTS' && !material.released && material.releaseAt && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">
                  Students from {formatClassDate(material.releaseAt, 'en')}
                </span>
              )}
            </div>
            {material.current && (
              <p className="mt-1 text-xs text-[var(--wq-text-muted)]">
                <span className="break-all">{material.current.fileName}</span> · {formatBytes(material.current.sizeBytes)}
              </p>
            )}
            {material.kind === 'NOTEBOOK' && !material.colabUrl && material.canDownload && (
              <p className="mt-1 text-xs text-[var(--wq-text-muted)]">{t('class.colabHelp')}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-1.5">
          {isLink && material.externalUrl && (
            <a href={material.externalUrl} target="_blank" rel="noopener noreferrer" className={pill}>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              {t('class.openLink')}
            </a>
          )}
          {material.canOpen && (
            <Link href={`/workspace-q/${offeringId}/materials/${material.id}`} className={pill}>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              {t('class.open')}
            </Link>
          )}
          {material.colabUrl && (
            <a href={material.colabUrl} target="_blank" rel="noopener noreferrer" className={pill}>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              {t('class.colab')}
            </a>
          )}
          {material.dataPath && (
            <button type="button" onClick={copyDataLink} className={pill}>
              {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
              {copied ? t('class.copied') : t('class.dataLink')}
            </button>
          )}
          {material.canDownload && (
            <a
              href={fileUrl('download=1')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--wq-accent)] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[var(--wq-accent-hover)]"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              {t('class.download')}
            </a>
          )}
          {staff && (
            <>
              {!isLink && (
                <>
                  <Button size="sm" variant="ghost" onClick={() => versionInput.current?.click()} pending={versionState !== null} aria-label="Upload a new version">
                    {versionState === null && <Upload className="h-3.5 w-3.5" aria-hidden="true" />}
                    {versionState ?? 'New version'}
                  </Button>
                  <input ref={versionInput} type="file" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => onNewVersion(e.target.files)} />
                </>
              )}
              <Button size="sm" variant="ghost" onClick={() => setEditing((v) => !v)} aria-label={`Edit ${material.titleEn}`}>
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => action.run(() => moveMaterial({ materialId: material.id, direction: 'up' }), () => router.refresh())} aria-label="Move up">
                <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => action.run(() => moveMaterial({ materialId: material.id, direction: 'down' }), () => router.refresh())} aria-label="Move down">
                <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
              {!confirmDelete && (
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)} aria-label={`Delete ${material.titleEn}`}>
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          <span>Delete this material and all its versions? Students lose access at once.</span>
          <Button size="sm" variant="danger" pending={action.pending} onClick={() => action.run(() => deleteMaterial({ materialId: material.id }), () => router.refresh())}>
            Delete
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
        </div>
      )}
      <div className="mt-1">
        <ErrorText>{action.error}</ErrorText>
      </div>

      {staff && editing && (
        <MaterialEditor material={material} sessionOptions={sessionOptions} onDone={() => setEditing(false)} />
      )}

      {staff && material.older.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowVersions((v) => !v)}
            aria-expanded={showVersions}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--wq-text-muted)] hover:text-[var(--wq-text)]"
          >
            <History className="h-3.5 w-3.5" aria-hidden="true" />
            {showVersions ? 'Hide earlier versions' : material.older.length === 1 ? '1 earlier version' : `${material.older.length} earlier versions`}
            <ChevronDown className={cn('h-3.5 w-3.5 transition', showVersions && 'rotate-180')} aria-hidden="true" />
          </button>
          {showVersions && (
            <ul className="mt-2 space-y-1 border-l-2 border-[var(--wq-border)] pl-3">
              {material.older.map((v) => (
                <li key={v.id} className="flex flex-wrap gap-x-2 text-xs text-[var(--wq-text-muted)]">
                  <a href={fileUrl(`version=${v.id}&download=1`)} className="font-medium text-[var(--wq-accent)] hover:underline">
                    {v.fileName}
                  </a>
                  <span>
                    {formatBytes(v.sizeBytes)} · {formatClassDate(v.uploadedAt, 'en')} · {v.uploadedBy ?? 'Unnamed'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

function MaterialEditor({
  material,
  sessionOptions,
  onDone,
}: {
  material: MaterialView;
  sessionOptions: SessionOption[];
  onDone: () => void;
}) {
  const router = useRouter();
  const action = useAction();
  const isLink = material.kind === 'LINK';
  const [form, setForm] = useState({
    titleEn: material.titleEn,
    titleFr: material.titleFr ?? '',
    kind: material.kind,
    language: material.language,
    audience: material.audience,
    releaseAt: material.ownReleaseLocal,
    downloadable: material.downloadable,
    sessionId: material.sessionId ?? '',
    githubUrl: material.githubUrl ?? '',
    externalUrl: material.externalUrl ?? '',
    datasetLink: material.dataPath !== null,
  });
  useEffect(() => setForm((f) => ({ ...f, datasetLink: material.dataPath !== null })), [material.dataPath]);
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));
  const label = 'block text-xs font-medium text-[var(--wq-text-muted)]';

  return (
    <form
      className="mt-3 grid gap-3 rounded-lg bg-[var(--wq-canvas-alt)] p-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        action.run(
          () =>
            updateMaterial({
              materialId: material.id,
              ...form,
              sessionId: form.sessionId || null,
              releaseAt: form.releaseAt || null,
            }),
          () => {
            onDone();
            router.refresh();
          },
        );
      }}
    >
      <label className={label}>
        Title (English)
        <input className={cn(fieldClass, 'mt-1 w-full')} value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} maxLength={200} />
      </label>
      <label className={label}>
        Title (French, optional)
        <input className={cn(fieldClass, 'mt-1 w-full')} value={form.titleFr} onChange={(e) => set('titleFr', e.target.value)} maxLength={200} />
      </label>
      <label className={label}>
        Type
        <select className={cn(fieldClass, 'mt-1 w-full')} value={form.kind} onChange={(e) => set('kind', e.target.value as MaterialKind)} disabled={isLink}>
          {(isLink ? (['LINK'] as MaterialKind[]) : FILE_KINDS).map((k) => (
            <option key={k} value={k}>
              {kindLabelEn[k]}
            </option>
          ))}
        </select>
      </label>
      <label className={label}>
        Language
        <select className={cn(fieldClass, 'mt-1 w-full')} value={form.language} onChange={(e) => set('language', e.target.value as typeof form.language)}>
          <option value="BOTH">English and French</option>
          <option value="EN">English</option>
          <option value="FR">French</option>
        </select>
      </label>
      <label className={label}>
        Who can see it
        <select className={cn(fieldClass, 'mt-1 w-full')} value={form.audience} onChange={(e) => set('audience', e.target.value as typeof form.audience)}>
          <option value="STUDENTS">Students (and staff)</option>
          <option value="STAFF">Staff only</option>
        </select>
      </label>
      <label className={label}>
        Session
        <select className={cn(fieldClass, 'mt-1 w-full')} value={form.sessionId} onChange={(e) => set('sessionId', e.target.value)}>
          <option value="">Course materials (no session)</option>
          {sessionOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className={label}>
        Students get it from (Paris time)
        <input type="datetime-local" className={cn(fieldClass, 'mt-1 w-full')} value={form.releaseAt} onChange={(e) => set('releaseAt', e.target.value)} />
        <span className="mt-1 block font-normal">Leave empty to follow the session&apos;s release time.</span>
      </label>
      {!isLink && (
        <label className="flex items-center gap-2 text-sm text-[var(--wq-text)] sm:pt-5">
          <input type="checkbox" checked={form.downloadable} onChange={(e) => set('downloadable', e.target.checked)} />
          Students can download it
        </label>
      )}
      {isLink && (
        <label className={cn(label, 'sm:col-span-2')}>
          Web address
          <input className={cn(fieldClass, 'mt-1 w-full')} value={form.externalUrl} onChange={(e) => set('externalUrl', e.target.value)} maxLength={2000} />
        </label>
      )}
      {form.kind === 'NOTEBOOK' && (
        <label className={cn(label, 'sm:col-span-2')}>
          Notebook on GitHub, for Open in Colab (optional)
          <input
            className={cn(fieldClass, 'mt-1 w-full')}
            value={form.githubUrl}
            onChange={(e) => set('githubUrl', e.target.value)}
            placeholder="https://github.com/owner/repo/blob/main/notebook.ipynb"
            maxLength={2000}
          />
        </label>
      )}
      {form.kind === 'DATASET' && (
        <label className="flex items-start gap-2 text-sm text-[var(--wq-text)] sm:col-span-2">
          <input type="checkbox" className="mt-1" checked={form.datasetLink} onChange={(e) => set('datasetLink', e.target.checked)} />
          <span>
            Link for notebooks: a long secret address that <code>pd.read_csv(url)</code> can read without signing in. Works only while the
            dataset is for students and released. Anyone with the link can download it.
          </span>
        </label>
      )}
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" variant="primary" pending={action.pending}>
          Save
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
      <div className="sm:col-span-2">
        <ErrorText>{action.error}</ErrorText>
      </div>
    </form>
  );
}
