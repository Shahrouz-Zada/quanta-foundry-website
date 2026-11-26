'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { deleteClassDataNow, setClassDeleteDate } from '@/app/workspace-q/classes/privacy-actions';
import { retentionStatus } from '@/lib/privacy';
import { cn } from '@/lib/utils';
import { fieldClass } from '@/components/workspace/files/ui';

const day = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });

/** Class settings: when this class's student data is deleted, and deleting it now. Staff only. */
export default function RetentionCard({
  offeringId,
  className,
  deleteAfter,
  deletedAt,
  students,
}: {
  offeringId: string;
  className: string;
  /** ISO date-time, or null */
  deleteAfter: string | null;
  deletedAt: string | null;
  students: number;
}) {
  const router = useRouter();
  const status = retentionStatus(deleteAfter ? new Date(deleteAfter) : null, deletedAt ? new Date(deletedAt) : null);
  const [date, setDate] = useState(deleteAfter ? new Date(deleteAfter).toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' }) : '');
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const save = (value: string | null) =>
    start(async () => {
      setError(null);
      const r = await setClassDeleteDate({ offeringId, date: value });
      if (!r.ok) setError(r.error);
      else router.refresh();
    });

  return (
    <section data-testid="retention-card" className="space-y-4 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-5">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--wq-accent)]" aria-hidden="true" />
        <div>
          <h2 className="font-semibold text-[var(--wq-text)]">Student data</h2>
          <p className="text-sm text-[var(--wq-text-muted)]">
            On the date you choose, everything students added to this class is deleted: their enrolments, teams, files, answers and
            discussions, and the class activity log. Your sessions, materials and activities stay, so you can teach the class again.
            Students see this date and can download their work before it.
          </p>
        </div>
      </div>

      {status.state === 'deleted' ? (
        <p className="rounded-lg bg-[var(--wq-canvas-alt)] px-3 py-2 text-sm text-[var(--wq-text)]">
          Student data was deleted on {day(status.on.toISOString())}. Joining is closed; set a new pass code to start a new group.
        </p>
      ) : (
        <>
          <p className={cn('text-sm', status.state === 'unset' ? 'font-medium text-amber-800' : 'text-[var(--wq-text)]')} data-testid="retention-status">
            {status.state === 'unset' && 'No deletion date yet. Please set one: students are told their data is kept until this date.'}
            {(status.state === 'scheduled' || status.state === 'soon') && `Student data will be deleted on ${day(status.on.toISOString())} (in ${status.daysLeft} days).`}
            {status.state === 'due' && 'The deletion date has passed; the data is deleted at the next nightly run.'}
          </p>
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (date) save(date);
            }}
          >
            <label htmlFor="delete-date" className="flex items-center gap-1.5 text-sm text-[var(--wq-text)]">
              <CalendarClock className="h-4 w-4" aria-hidden="true" /> Delete student data on
            </label>
            <input id="delete-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={cn(fieldClass, 'py-1.5')} />
            <button
              type="submit"
              disabled={pending || !date}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--wq-accent)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--wq-accent-hover)] disabled:opacity-50"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Save date
            </button>
            {deleteAfter && (
              <button type="button" disabled={pending} onClick={() => { setDate(''); save(null); }} className="text-sm text-[var(--wq-text-muted)] hover:underline">
                Clear
              </button>
            )}
          </form>

          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:underline"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete student data now…
            </button>
          ) : (
            <form
              className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900"
              onSubmit={(e) => {
                e.preventDefault();
                start(async () => {
                  setError(null);
                  const r = await deleteClassDataNow({ offeringId, confirmName: typed });
                  if (!r.ok) return setError(r.error);
                  const n = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
                  const x = r.result;
                  setDone(
                    `Deleted: ${n(x.students, 'student', 'students')}, ${n(x.files, 'file', 'files')}, ${n(x.answers, 'answer', 'answers')}, ` +
                      `${n(x.threads, 'conversation', 'conversations')}, ${n(x.teams, 'team', 'teams')}.`,
                  );
                  setConfirming(false);
                  router.refresh();
                });
              }}
            >
              <p>
                This deletes the data of {students} {students === 1 ? 'student' : 'students'} now and can’t be undone. Type the class name to
                confirm: <strong>{className}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <input value={typed} onChange={(e) => setTyped(e.target.value)} aria-label="Class name" className={cn(fieldClass, 'min-w-0 flex-1 py-1.5')} />
                <button type="submit" disabled={pending || !typed.trim()} className="rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700 disabled:opacity-50">
                  Delete now
                </button>
                <button type="button" onClick={() => { setConfirming(false); setTyped(''); }} className="text-[var(--wq-text-muted)] hover:underline">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </>
      )}
      {done && <p role="status" className="text-sm text-emerald-800">{done}</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
