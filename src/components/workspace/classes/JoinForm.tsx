'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { joinClass, switchAccountTo } from '@/app/workspace-q/classes/actions';

/** Student step 2: full name + pass code (step 1 is signing in with Google). */
export default function JoinForm({
  initialName,
  initialCode,
  email,
  returnTo,
}: {
  initialName: string;
  initialCode: string;
  email: string;
  returnTo: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const input =
    'w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-50 placeholder:text-slate-500 ' +
    'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40';

  return (
    <form
      className="space-y-4 text-left"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const result = await joinClass({ fullName: name, code });
          if (result.ok && result.offeringId) router.push(`/workspace-q/${result.offeringId}/files`);
          else if (!result.ok) setError(result.error);
        });
      }}
    >
      <div>
        <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-200">
          Your full name
        </label>
        <input
          id="fullName"
          className={input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          maxLength={80}
          placeholder="First and last name"
          required
        />
        <p className="mt-1 text-xs text-slate-400">Your instructor and your classmates will see this name.</p>
      </div>
      <div>
        <label htmlFor="code" className="mb-1 block text-sm font-medium text-slate-200">
          Class pass code
        </label>
        <input
          id="code"
          className={`${input} font-mono text-lg uppercase tracking-[0.2em]`}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={16}
          placeholder="ABCD-EFGH"
          required
        />
      </div>
      {error && (
        <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || !name.trim() || !code.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Join class
      </button>
      <p className="text-center text-xs text-slate-400">
        Signed in as <strong className="text-slate-200">{email}</strong>.{' '}
        <button
          type="button"
          className="underline hover:text-slate-200"
          onClick={() => start(async () => { await switchAccountTo(returnTo); })}
        >
          Use a different Google account
        </button>
      </p>
    </form>
  );
}
