'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, Maximize2, RefreshCw, X } from 'lucide-react';
import { regenerateJoinCode, setJoinCodeExpiry, turnOffJoining } from '@/app/workspace-q/classes/actions';
import { formatJoinCode, type JoinCodeStatus } from '@/lib/workspace-classes';
import { cn } from '@/lib/utils';
import { Button, ErrorText, fieldClass, useAction } from '@/components/workspace/files/ui';

/** The class pass code: show it, project it, set the last day, make a new one, or switch joining off. */
export default function JoinCodeCard({
  offeringId,
  code,
  status,
  expiresOn,
}: {
  offeringId: string;
  code: string | null;
  status: JoinCodeStatus;
  /** yyyy-mm-dd, or null for no expiry */
  expiresOn: string | null;
}) {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [date, setDate] = useState(expiresOn ?? '');
  const [confirmNew, setConfirmNew] = useState(false);
  const regen = useAction();
  const expiry = useAction();
  const off = useAction();

  useEffect(() => setOrigin(window.location.origin), []);
  useEffect(() => setDate(expiresOn ?? ''), [expiresOn]);
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFullscreen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  const link = code ? `${origin}/workspace-q/join?code=${code}` : '';
  const copy = async (what: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(what === 'code' ? code ?? '' : link);
      setCopied(what);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard blocked: the text is on screen to copy by hand */
    }
  };

  return (
    <section aria-labelledby="code-title" className="rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="code-title" className="text-sm font-semibold uppercase tracking-wide text-[var(--wq-text-muted)]">
          Pass code
        </h2>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-semibold',
            status === 'active' && 'bg-emerald-100 text-emerald-800',
            status === 'expired' && 'bg-amber-100 text-amber-900',
            status === 'off' && 'bg-[var(--wq-canvas-alt)] text-[var(--wq-text-muted)]',
          )}
        >
          {status === 'active' ? 'Students can join' : status === 'expired' ? 'Expired' : 'Joining is off'}
        </span>
      </div>

      {code ? (
        <>
          <p
            data-testid="join-code"
            className="mt-3 select-all font-mono text-3xl font-bold tracking-[0.2em] text-[var(--wq-text)] sm:text-4xl"
          >
            {formatJoinCode(code)}
          </p>
          <p className="mt-2 text-sm text-[var(--wq-text-muted)]">
            Students open <strong>quantafoundry.com/workspace-q</strong>, choose <em>Join a class</em>, sign in with Google and enter
            their full name and this code.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => copy('code')}>
              {copied === 'code' ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
              {copied === 'code' ? 'Copied' : 'Copy code'}
            </Button>
            <Button size="sm" onClick={() => copy('link')} disabled={!origin}>
              {copied === 'link' ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
              {copied === 'link' ? 'Copied' : 'Copy join link'}
            </Button>
            <Button size="sm" onClick={() => setFullscreen(true)}>
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              Show full screen
            </Button>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-[var(--wq-text-muted)]">
          This class has no pass code, so nobody can join with one. Make a code to let students join.
        </p>
      )}

      <div className="mt-5 grid gap-4 border-t border-[var(--wq-border)] pt-4 sm:grid-cols-2">
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            expiry.run(() => setJoinCodeExpiry({ offeringId, date: date || null }), () => router.refresh());
          }}
        >
          <label htmlFor="expiry" className="block text-sm font-medium text-[var(--wq-text)]">
            Last day the code works
          </label>
          <div className="flex gap-2">
            <input
              id="expiry"
              type="date"
              className={cn(fieldClass, 'min-w-0 flex-1')}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Button type="submit" variant="primary" pending={expiry.pending}>
              Save
            </Button>
          </div>
          <p className="text-xs text-[var(--wq-text-muted)]">Leave empty for no expiry. The code stops working at the end of that day (UTC).</p>
          <ErrorText>{expiry.error}</ErrorText>
        </form>

        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--wq-text)]">New code</p>
          {!confirmNew ? (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => (code ? setConfirmNew(true) : regen.run(() => regenerateJoinCode({ offeringId }), () => router.refresh()))} pending={regen.pending}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                {code ? 'Make a new code' : 'Make a code'}
              </Button>
              {code && (
                <Button
                  variant="ghost"
                  pending={off.pending}
                  onClick={() => off.run(() => turnOffJoining({ offeringId }), () => router.refresh())}
                >
                  Turn joining off
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              <p>The current code stops working immediately. Students already in the class stay in.</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  pending={regen.pending}
                  onClick={() =>
                    regen.run(() => regenerateJoinCode({ offeringId }), () => {
                      setConfirmNew(false);
                      router.refresh();
                    })
                  }
                >
                  Make a new code
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmNew(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          <ErrorText>{regen.error || off.error}</ErrorText>
        </div>
      </div>

      {fullscreen && code && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pass code"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-[var(--wq-canvas)] px-6 text-center"
        >
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-lg p-2 text-[var(--wq-text-muted)] hover:bg-[var(--wq-canvas-alt)]"
          >
            <X className="h-6 w-6" />
          </button>
          <p className="text-lg text-[var(--wq-text-muted)]">Join at quantafoundry.com/workspace-q → Join a class</p>
          <p className="font-mono text-6xl font-bold tracking-[0.2em] text-[var(--wq-text)] sm:text-8xl">{formatJoinCode(code)}</p>
        </div>
      )}
    </section>
  );
}
