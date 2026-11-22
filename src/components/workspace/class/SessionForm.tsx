'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveSession } from '@/app/workspace-q/classes/materials-actions';
import { cn } from '@/lib/utils';
import { Button, ErrorText, fieldClass, useAction } from '@/components/workspace/files/ui';

export interface SessionFormValues {
  sessionId?: string;
  number: number;
  titleEn: string;
  titleFr: string;
  startsAt: string;
  room: string;
  releaseAt: string;
  offeringSessionId: string;
}

/** Staff: add or edit a session (F1.3). Dates are typed in Paris time. */
export default function SessionForm({
  offeringId,
  initial,
  interactiveOptions,
  onDone,
}: {
  offeringId: string;
  initial: SessionFormValues;
  interactiveOptions: { id: string; label: string }[];
  onDone: () => void;
}) {
  const router = useRouter();
  const action = useAction();
  const [form, setForm] = useState(initial);
  const set = <K extends keyof SessionFormValues>(key: K, value: SessionFormValues[K]) => setForm((f) => ({ ...f, [key]: value }));
  const label = 'block text-xs font-medium text-[var(--wq-text-muted)]';

  return (
    <form
      className="grid gap-3 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-4 sm:grid-cols-6"
      onSubmit={(e) => {
        e.preventDefault();
        action.run(
          () =>
            saveSession({
              offeringId,
              sessionId: form.sessionId,
              number: form.number,
              titleEn: form.titleEn,
              titleFr: form.titleFr,
              startsAt: form.startsAt || null,
              room: form.room,
              releaseAt: form.releaseAt || null,
              offeringSessionId: form.offeringSessionId || null,
            }),
          () => {
            onDone();
            router.refresh();
          },
        );
      }}
    >
      <label className={label}>
        Number
        <input type="number" min={0} max={999} className={cn(fieldClass, 'mt-1 w-full')} value={form.number} onChange={(e) => set('number', Number(e.target.value))} />
      </label>
      <label className={cn(label, 'sm:col-span-5')}>
        Title (English)
        <input className={cn(fieldClass, 'mt-1 w-full')} value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} maxLength={200} placeholder="e.g. Framing a prediction problem" />
      </label>
      <label className={cn(label, 'sm:col-span-6')}>
        Title (French, optional)
        <input className={cn(fieldClass, 'mt-1 w-full')} value={form.titleFr} onChange={(e) => set('titleFr', e.target.value)} maxLength={200} />
      </label>
      <label className={cn(label, 'sm:col-span-2')}>
        Date and time (Paris)
        <input type="datetime-local" className={cn(fieldClass, 'mt-1 w-full')} value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} />
      </label>
      <label className={cn(label, 'sm:col-span-2')}>
        Room
        <input className={cn(fieldClass, 'mt-1 w-full')} value={form.room} onChange={(e) => set('room', e.target.value)} maxLength={80} />
      </label>
      <label className={cn(label, 'sm:col-span-2')}>
        Materials released at (Paris)
        <input type="datetime-local" className={cn(fieldClass, 'mt-1 w-full')} value={form.releaseAt} onChange={(e) => set('releaseAt', e.target.value)} />
      </label>
      <p className="text-xs text-[var(--wq-text-muted)] sm:col-span-6">
        Students see this session&apos;s materials from the release time. Leave it empty to show them as soon as they are uploaded.
      </p>
      {interactiveOptions.length > 0 && (
        <label className={cn(label, 'sm:col-span-6')}>
          Interactive session (optional)
          <select className={cn(fieldClass, 'mt-1 w-full')} value={form.offeringSessionId} onChange={(e) => set('offeringSessionId', e.target.value)}>
            <option value="">None</option>
            {interactiveOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="flex gap-2 sm:col-span-6">
        <Button type="submit" variant="primary" pending={action.pending} disabled={!form.titleEn.trim()}>
          {form.sessionId ? 'Save session' : 'Add session'}
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
      <div className="sm:col-span-6">
        <ErrorText>{action.error}</ErrorText>
      </div>
    </form>
  );
}
