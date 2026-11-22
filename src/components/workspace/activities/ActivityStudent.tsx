'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Paperclip, Upload, X } from 'lucide-react';
import { attachFile, detachFile, getMySubmission, saveAnswers, submitActivity, type AnswerResult } from '@/app/workspace-q/classes/activity-actions';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { canWork, type Answers, type SubmitProblem } from '@/lib/workspace-activities';
import type { ActivityInfo, AttachableFile, SubmissionView } from '@/lib/workspace-activities-server';
import { formatClassDate } from '@/lib/workspace-materials';
import { Button, fieldClass } from '@/components/workspace/files/ui';
import { uploadOne } from '@/components/workspace/files/FileUploader';
import AnswerFields from './AnswerFields';
import { ActivityHeader, StatusPill } from './ActivityHeader';

const SAVE_DELAY_MS = 800;
const POLL_MS = 15_000;

/**
 * A student's view of an activity: their own or their team's answer, saved
 * as they type (only the changed fields are sent, so teammates working on
 * other fields don't overwrite each other), then submitted.
 */
export default function ActivityStudent({
  activity,
  initial,
  teamName,
  noTeam,
  attachable,
}: {
  activity: ActivityInfo;
  initial: SubmissionView;
  teamName: string | null;
  noTeam: boolean;
  attachable: AttachableFile[];
}) {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const editable = canWork(activity.window) && !noTeam;
  const [answers, setAnswers] = useState<Answers>(initial.answers);
  const [meta, setMeta] = useState(initial);
  const [saving, setSaving] = useState<'idle' | 'saving' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [problems, setProblems] = useState<SubmitProblem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [upload, setUpload] = useState<string | null>(null);
  const [pick, setPick] = useState('');
  const dirty = useRef(new Map<string, string>()); // field → value not yet confirmed by the server
  const focused = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef<Promise<void> | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const errorText = (r: Extract<AnswerResult, { ok: false }>) => (r.errorKey ? t(r.errorKey as 'activity.err.failed') : r.error);

  /** Take the server's answers, but keep what the student is typing right now. */
  const absorb = useCallback((view: SubmissionView) => {
    setMeta(view);
    setAnswers((current) => {
      const values = { ...view.answers.values };
      for (const [k, v] of dirty.current) values[k] = v;
      if (focused.current && focused.current !== '__url' && current.values[focused.current] !== undefined) {
        values[focused.current] = current.values[focused.current];
      }
      const keepUrl = dirty.current.has('__url') || focused.current === '__url';
      return { ...view.answers, values, url: keepUrl ? current.url : view.answers.url };
    });
  }, []);

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (inFlight.current) await inFlight.current;
    if (dirty.current.size === 0) return;
    const sent = new Map(dirty.current);
    const values: Record<string, string> = {};
    let url: string | undefined;
    for (const [k, v] of sent) {
      if (k === '__url') url = v;
      else values[k] = v;
    }
    setSaving('saving');
    const run = (async () => {
      const result = await saveAnswers({ activityId: activity.id, changes: { values, ...(url !== undefined ? { url } : {}) } });
      if (result.ok) {
        // Only clear what hasn't changed again while we were saving.
        for (const [k, v] of sent) if (dirty.current.get(k) === v) dirty.current.delete(k);
        absorb(result.submission);
        setSaving('idle');
        setError(null);
      } else {
        setSaving('error');
        setError(errorText(result));
        if (result.errorKey === 'activity.err.closed' || result.errorKey === 'activity.err.notAllowed') dirty.current.clear();
        else timer.current = setTimeout(() => void flush(), 5000);
      }
    })();
    inFlight.current = run;
    await run;
    inFlight.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity.id, absorb]);

  function onChange(id: string, value: string) {
    dirty.current.set(id, value);
    setProblems((p) => p.filter((x) => x.id !== id && !(id === '__url' && x.message === 'url')));
    setAnswers((a) => (id === '__url' ? { ...a, url: value } : { ...a, values: { ...a.values, [id]: value } }));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), SAVE_DELAY_MS);
  }

  // Pick up teammates' changes; save before leaving the page.
  useEffect(() => {
    if (!editable) return;
    const poll = setInterval(async () => {
      if (document.hidden || dirty.current.size > 0 || inFlight.current) return;
      const result = await getMySubmission({ activityId: activity.id });
      if (result.ok) absorb(result.submission);
    }, POLL_MS);
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty.current.size > 0) {
        void flush();
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      clearInterval(poll);
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [editable, activity.id, absorb, flush]);

  async function onSubmit() {
    setSubmitting(true);
    await flush();
    const result = await submitActivity({ activityId: activity.id });
    setSubmitting(false);
    if (result.ok) {
      absorb(result.submission);
      setProblems([]);
      setError(null);
      router.refresh();
    } else {
      setProblems(result.problems ?? []);
      setError(errorText(result));
    }
  }

  async function onAttach(fileId: string) {
    if (!fileId) return;
    setError(null);
    const result = await attachFile({ activityId: activity.id, fileId });
    if (result.ok) {
      absorb(result.submission);
      setProblems([]);
    } else setError(errorText(result));
    setPick('');
  }

  async function onUpload(list: FileList | null) {
    const file = list?.[0];
    if (!file) return;
    setError(null);
    setUpload('0%');
    let savedId: string | null = null;
    const problem = await uploadOne(file, {
      offeringId: activity.offeringId,
      space: activity.submitter === 'TEAM' ? 'team' : 'personal',
      onProgress: (p) => setUpload(`${p}%`),
      onSaving: () => setUpload(t('activity.uploading')),
      onSaved: (id) => (savedId = id),
    });
    if (fileInput.current) fileInput.current.value = '';
    setUpload(null);
    if (problem) {
      setError(problem === 'tooBig' ? t('files.tooBig') : problem);
      return;
    }
    if (savedId) await onAttach(savedId);
    router.refresh(); // the new file now also appears in the attach list
  }

  async function onDetach(versionId: string) {
    const result = await detachFile({ activityId: activity.id, versionId });
    if (result.ok) absorb(result.submission);
    else setError(errorText(result));
  }

  const attachedIds = new Set((answers.files ?? []).map((f) => f.fileId));
  const files = answers.files ?? [];

  return (
    <div className="flex-1 bg-[var(--wq-canvas)] pb-24">
      <div className="mx-auto max-w-3xl space-y-6 px-4 pt-8 sm:px-6">
        <ActivityHeader activity={activity}>
          <p className="text-sm text-[var(--wq-text-muted)]">
            {activity.submitter === 'TEAM' ? (teamName ? t('activity.team', { team: teamName }) : t('activity.noTeam')) : t('activity.individual')}
          </p>
        </ActivityHeader>

        {noTeam ? (
          <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">{t('activity.noTeam')}</p>
        ) : (
          <section className="space-y-5 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-5">
            <AnswerFields
              kind={activity.kind}
              config={activity.config}
              answers={answers}
              editable={editable}
              problems={problems}
              onChange={onChange}
              onFocusField={(id) => (focused.current = id)}
            />

            {activity.kind === 'FILE' && (
              <div className="space-y-3">
                <ul className="space-y-1.5">
                  {files.length === 0 && <li className="text-sm text-[var(--wq-text-muted)]">{t('activity.noFiles')}</li>}
                  {files.map((f) => (
                    <li key={f.versionId} className="flex items-center justify-between gap-2 rounded-lg bg-[var(--wq-canvas-alt)] px-3 py-2 text-sm">
                      <a href={`/api/workspace-q/files/${f.fileId}/download?version=${f.versionId}`} className="flex min-w-0 items-center gap-2 font-medium text-[var(--wq-accent)] hover:underline">
                        <Paperclip className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{f.fileName}</span>
                      </a>
                      {editable && (
                        <button type="button" onClick={() => onDetach(f.versionId)} aria-label={`${t('activity.remove')}: ${f.fileName}`} className="rounded p-1 text-[var(--wq-text-subtle)] hover:text-red-600">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                {problems.some((p) => p.message === 'file') && <p role="alert" className="text-xs text-red-600">{t('activity.problem.file')}</p>}
                {editable && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                      className={cn(fieldClass, 'sm:flex-1')}
                      value={pick}
                      onChange={(e) => {
                        setPick(e.target.value);
                        void onAttach(e.target.value);
                      }}
                      aria-label={activity.submitter === 'TEAM' ? t('activity.attachTeam') : t('activity.attach')}
                    >
                      <option value="">{activity.submitter === 'TEAM' ? t('activity.attachTeam') : t('activity.attach')}</option>
                      {attachable.length === 0 && <option disabled>{t('activity.noAttachable')}</option>}
                      {attachable.map((f) => (
                        <option key={f.fileId} value={f.fileId} disabled={attachedIds.has(f.fileId) && files.some((x) => x.versionId === f.versionId)}>
                          {f.title} ({f.fileName})
                        </option>
                      ))}
                    </select>
                    <Button onClick={() => fileInput.current?.click()} pending={upload !== null}>
                      {upload === null && <Upload className="h-4 w-4" aria-hidden="true" />}
                      {upload ?? t('activity.upload')}
                    </Button>
                    <input ref={fileInput} type="file" className="sr-only" tabIndex={-1} aria-label={t('activity.upload')} onChange={(e) => onUpload(e.target.files)} />
                  </div>
                )}
                {editable && (
                  <p className="text-xs text-[var(--wq-text-muted)]">{activity.submitter === 'TEAM' ? t('activity.uploadNoteTeam') : t('activity.uploadNote')}</p>
                )}
              </div>
            )}
          </section>
        )}

        {!noTeam && (
          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <StatusPill status={meta.status} />
                <span aria-live="polite" className="text-xs text-[var(--wq-text-muted)]">
                  {saving === 'saving' ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> {t('activity.saving')}
                    </span>
                  ) : saving === 'error' ? (
                    <span className="text-red-600">{t('activity.saveFailed')}</span>
                  ) : meta.lastSavedAt ? (
                    t('activity.saved', {
                      time: new Date(meta.lastSavedAt).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }),
                      name: meta.lastSavedBy ?? '—',
                    })
                  ) : null}
                </span>
              </div>
              {meta.submittedAt && (
                <p className="text-xs text-[var(--wq-text-muted)]">
                  <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  {t('activity.submittedAt', { date: formatClassDate(meta.submittedAt, lang) })}
                  {editable && ` · ${t('activity.editable')}`}
                </p>
              )}
              {!editable && <p className="text-xs text-[var(--wq-text-muted)]">{t('activity.readOnly')}</p>}
            </div>
            {editable && (
              <Button variant="primary" onClick={onSubmit} pending={submitting} className="sm:min-w-32">
                {meta.submittedAt ? t('activity.resubmit') : t('activity.submit')}
              </Button>
            )}
          </div>
        )}
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
