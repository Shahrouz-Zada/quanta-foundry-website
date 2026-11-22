'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { deleteActivity, updateActivity } from '@/app/workspace-q/classes/activity-actions';
import { cn } from '@/lib/utils';
import { FIELD_TYPES, newItemId, type ActivityConfig, type FieldType, type FormField, type Question } from '@/lib/workspace-activities';
import type { ActivityInfo } from '@/lib/workspace-activities-server';
import { Button, ErrorText, fieldClass, useAction } from '@/components/workspace/files/ui';

const typeLabel: Record<FieldType, string> = {
  text: 'Short text',
  longtext: 'Long text',
  number: 'Number',
  euro: 'Euro amount',
  percent: 'Percentage',
  choice: 'Choice',
};

/** Staff: every setting of an activity, and its questions or fields. */
export default function ActivityEditor({
  activity,
  sessionOptions,
  hasAnswers,
}: {
  activity: ActivityInfo;
  sessionOptions: { id: string; label: string }[];
  hasAnswers: boolean;
}) {
  const router = useRouter();
  const save = useAction();
  const remove = useAction();
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    titleEn: activity.titleEn,
    titleFr: activity.titleFr ?? '',
    instructionsEn: activity.instructionsEn,
    instructionsFr: activity.instructionsFr ?? '',
    submitter: activity.submitter,
    sessionId: activity.sessionId ?? '',
    visible: activity.visible,
    opensAt: activity.opensAtLocal,
    dueAt: activity.dueAtLocal,
    allowLate: activity.allowLate,
  });
  const [config, setConfig] = useState<ActivityConfig>(activity.config);
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  };
  const label = 'block text-xs font-medium text-[var(--wq-text-muted)]';

  function move<T>(list: T[], i: number, d: -1 | 1): T[] {
    const j = i + d;
    if (j < 0 || j >= list.length) return list;
    const copy = [...list];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    return copy;
  }
  const setQuestions = (q: Question[]) => {
    setSaved(false);
    setConfig((c) => ({ ...c, questions: q }));
  };
  const setFields = (f: FormField[]) => {
    setSaved(false);
    setConfig((c) => ({ ...c, fields: f }));
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        save.run(
          () =>
            updateActivity({
              activityId: activity.id,
              ...form,
              sessionId: form.sessionId || null,
              opensAt: form.opensAt || null,
              dueAt: form.dueAt || null,
              config,
            }),
          () => {
            setSaved(true);
            router.refresh();
          },
        );
      }}
    >
      <section className="grid gap-3 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-4 sm:grid-cols-2">
        <label className={label}>
          Title (English)
          <input className={cn(fieldClass, 'mt-1 w-full')} value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} maxLength={200} />
        </label>
        <label className={label}>
          Title (French, optional)
          <input className={cn(fieldClass, 'mt-1 w-full')} value={form.titleFr} onChange={(e) => set('titleFr', e.target.value)} maxLength={200} />
        </label>
        <label className={cn(label, 'sm:col-span-2')}>
          Instructions (English)
          <textarea rows={4} className={cn(fieldClass, 'mt-1 w-full')} value={form.instructionsEn} onChange={(e) => set('instructionsEn', e.target.value)} />
        </label>
        <label className={cn(label, 'sm:col-span-2')}>
          Instructions (French, optional)
          <textarea rows={3} className={cn(fieldClass, 'mt-1 w-full')} value={form.instructionsFr} onChange={(e) => set('instructionsFr', e.target.value)} />
        </label>
        <fieldset className="text-sm text-[var(--wq-text)]">
          <legend className={label}>Who submits</legend>
          <div className="mt-1 flex gap-4">
            {(['TEAM', 'INDIVIDUAL'] as const).map((s) => (
              <label key={s} className="flex items-center gap-1.5">
                <input type="radio" name="submitter" checked={form.submitter === s} disabled={hasAnswers} onChange={() => set('submitter', s)} />
                {s === 'TEAM' ? 'One answer per team' : 'Each student'}
              </label>
            ))}
          </div>
          {hasAnswers && <p className="mt-1 text-xs text-[var(--wq-text-muted)]">Locked: students have already answered.</p>}
        </fieldset>
        <label className={label}>
          Session
          <select className={cn(fieldClass, 'mt-1 w-full')} value={form.sessionId} onChange={(e) => set('sessionId', e.target.value)}>
            <option value="">No session</option>
            {sessionOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Opens at (Paris, optional)
          <input type="datetime-local" className={cn(fieldClass, 'mt-1 w-full')} value={form.opensAt} onChange={(e) => set('opensAt', e.target.value)} />
        </label>
        <label className={label}>
          Due at (Paris, optional)
          <input type="datetime-local" className={cn(fieldClass, 'mt-1 w-full')} value={form.dueAt} onChange={(e) => set('dueAt', e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--wq-text)]">
          <input type="checkbox" checked={form.allowLate} onChange={(e) => set('allowLate', e.target.checked)} />
          Accept late answers (marked as late)
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-[var(--wq-text)]">
          <input type="checkbox" checked={form.visible} onChange={(e) => set('visible', e.target.checked)} />
          Published (students can see it)
        </label>
      </section>

      {activity.kind === 'SHORT_ANSWER' && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--wq-text-muted)]">Questions</h2>
          {config.questions.map((q, i) => (
            <div key={q.id} className="grid gap-2 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-3 sm:grid-cols-[1fr_1fr_auto]">
              <input className={fieldClass} value={q.promptEn} aria-label={`Question ${i + 1} (English)`} placeholder="Question (English)" onChange={(e) => setQuestions(config.questions.map((x) => (x.id === q.id ? { ...x, promptEn: e.target.value } : x)))} />
              <input className={fieldClass} value={q.promptFr ?? ''} aria-label={`Question ${i + 1} (French)`} placeholder="Question (French, optional)" onChange={(e) => setQuestions(config.questions.map((x) => (x.id === q.id ? { ...x, promptFr: e.target.value || undefined } : x)))} />
              <ItemTools
                onUp={() => setQuestions(move(config.questions, i, -1))}
                onDown={() => setQuestions(move(config.questions, i, 1))}
                onRemove={() => setQuestions(config.questions.filter((x) => x.id !== q.id))}
                label={`question ${i + 1}`}
              />
              <div className="flex gap-4 text-xs text-[var(--wq-text-muted)] sm:col-span-3">
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked={q.long} onChange={(e) => setQuestions(config.questions.map((x) => (x.id === q.id ? { ...x, long: e.target.checked } : x)))} />
                  Long answer
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked={q.required} onChange={(e) => setQuestions(config.questions.map((x) => (x.id === q.id ? { ...x, required: e.target.checked } : x)))} />
                  Required
                </label>
              </div>
            </div>
          ))}
          <Button size="sm" onClick={() => setQuestions([...config.questions, { id: newItemId(), promptEn: '', promptFr: undefined, long: false, required: true }])}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add question
          </Button>
        </section>
      )}

      {activity.kind === 'FORM' && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--wq-text-muted)]">Fields</h2>
          {config.fields.map((f, i) => (
            <div key={f.id} className="grid gap-2 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-3 sm:grid-cols-[1fr_1fr_auto]">
              <input className={fieldClass} value={f.labelEn} aria-label={`Field ${i + 1} (English)`} placeholder="Label (English)" onChange={(e) => setFields(config.fields.map((x) => (x.id === f.id ? { ...x, labelEn: e.target.value } : x)))} />
              <input className={fieldClass} value={f.labelFr ?? ''} aria-label={`Field ${i + 1} (French)`} placeholder="Label (French, optional)" onChange={(e) => setFields(config.fields.map((x) => (x.id === f.id ? { ...x, labelFr: e.target.value || undefined } : x)))} />
              <ItemTools
                onUp={() => setFields(move(config.fields, i, -1))}
                onDown={() => setFields(move(config.fields, i, 1))}
                onRemove={() => setFields(config.fields.filter((x) => x.id !== f.id))}
                label={`field ${i + 1}`}
              />
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--wq-text-muted)] sm:col-span-3">
                <select className={cn(fieldClass, 'py-1 text-xs')} value={f.type} aria-label={`Field ${i + 1} type`} onChange={(e) => setFields(config.fields.map((x) => (x.id === f.id ? { ...x, type: e.target.value as FieldType } : x)))}>
                  {FIELD_TYPES.map((ty) => (
                    <option key={ty} value={ty}>
                      {typeLabel[ty]}
                    </option>
                  ))}
                </select>
                {(f.type === 'number' || f.type === 'euro' || f.type === 'percent') && (
                  <>
                    <input
                      type="number"
                      className={cn(fieldClass, 'w-24 py-1 text-xs')}
                      placeholder="Min"
                      aria-label={`Field ${i + 1} minimum`}
                      value={f.min ?? ''}
                      onChange={(e) => setFields(config.fields.map((x) => (x.id === f.id ? { ...x, min: e.target.value === '' ? null : Number(e.target.value) } : x)))}
                    />
                    <input
                      type="number"
                      className={cn(fieldClass, 'w-24 py-1 text-xs')}
                      placeholder="Max"
                      aria-label={`Field ${i + 1} maximum`}
                      value={f.max ?? ''}
                      onChange={(e) => setFields(config.fields.map((x) => (x.id === f.id ? { ...x, max: e.target.value === '' ? null : Number(e.target.value) } : x)))}
                    />
                  </>
                )}
                {f.type === 'choice' && (
                  <input
                    className={cn(fieldClass, 'min-w-0 flex-1 py-1 text-xs')}
                    placeholder="Options, separated by ;"
                    aria-label={`Field ${i + 1} options`}
                    defaultValue={f.options.join('; ')}
                    onChange={(e) => setFields(config.fields.map((x) => (x.id === f.id ? { ...x, options: e.target.value.split(';').map((o) => o.trim()).filter(Boolean) } : x)))}
                  />
                )}
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked={f.required} onChange={(e) => setFields(config.fields.map((x) => (x.id === f.id ? { ...x, required: e.target.checked } : x)))} />
                  Required
                </label>
              </div>
            </div>
          ))}
          <Button
            size="sm"
            onClick={() => setFields([...config.fields, { id: newItemId(), labelEn: '', labelFr: undefined, type: 'text', options: [], min: null, max: null, required: true }])}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add field
          </Button>
        </section>
      )}

      {activity.kind === 'FILE' && (
        <section className="rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-4">
          <label className={label}>
            Maximum number of files
            <input
              type="number"
              min={1}
              max={10}
              className={cn(fieldClass, 'mt-1 w-24')}
              value={config.maxFiles}
              onChange={(e) => {
                setSaved(false);
                setConfig((c) => ({ ...c, maxFiles: Math.max(1, Math.min(10, Number(e.target.value) || 1)) }));
              }}
            />
          </label>
          <p className="mt-2 text-xs text-[var(--wq-text-muted)]">Students attach files from Files or upload new ones (up to 20 MB each).</p>
        </section>
      )}
      {activity.kind === 'LINK' && (
        <p className="rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-4 text-sm text-[var(--wq-text-muted)]">
          Students paste one web address (for example a Colab or GitHub link).
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" variant="primary" pending={save.pending}>
          Save activity
        </Button>
        {saved && !save.pending && <span className="text-sm text-emerald-700">Saved</span>}
        <span className="flex-1" />
        {!confirmDelete ? (
          <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete activity
          </Button>
        ) : (
          <span className="flex items-center gap-2 text-sm text-red-800">
            Delete it?
            <Button size="sm" variant="danger" pending={remove.pending} onClick={() => remove.run(() => deleteActivity({ activityId: activity.id }), () => router.push(`/workspace-q/${activity.offeringId}`))}>
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </span>
        )}
      </div>
      <ErrorText>{save.error || remove.error}</ErrorText>
    </form>
  );
}

function ItemTools({ onUp, onDown, onRemove, label }: { onUp: () => void; onDown: () => void; onRemove: () => void; label: string }) {
  return (
    <div className="flex gap-1">
      <Button size="sm" variant="ghost" onClick={onUp} aria-label={`Move ${label} up`}>
        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
      <Button size="sm" variant="ghost" onClick={onDown} aria-label={`Move ${label} down`}>
        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
      <Button size="sm" variant="ghost" onClick={onRemove} aria-label={`Remove ${label}`}>
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
