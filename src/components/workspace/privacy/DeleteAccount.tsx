'use client';

import { useState, useTransition } from 'react';
import { signOut } from 'next-auth/react';
import { Loader2, Trash2 } from 'lucide-react';
import { deleteMyAccount } from '@/app/workspace-q/classes/privacy-actions';

/** Delete my account: says what happens, asks to type DELETE, then signs out. */
export default function DeleteAccount() {
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-3 rounded-lg border border-red-900/60 bg-red-950/20 p-4 text-sm">
      <p className="text-slate-300">This can’t be undone. Download your work first if you want to keep it.</p>
      <ul className="list-disc space-y-1 pl-5 text-slate-300">
        <li>Your name, email and Google sign-in are erased, and you leave all your classes.</li>
        <li>Your own files, your individual answers and the text of your messages are deleted.</li>
        <li>
          What you made with your team (team files, team answers) stays with your team, shown as by “Unnamed”, so your teammates don’t
          lose their work.
        </li>
      </ul>
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          start(async () => {
            const result = await deleteMyAccount({ confirm });
            if (!result.ok) return setError(result.error);
            await signOut({ callbackUrl: '/workspace-q/signin?deleted=1' });
          });
        }}
      >
        <label htmlFor="confirm-delete" className="text-slate-300">
          Type <strong className="font-mono text-slate-100">DELETE</strong> to confirm:
        </label>
        <input
          id="confirm-delete"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="off"
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-slate-50 focus:border-red-500 focus:outline-none sm:w-36"
        />
        <button
          type="submit"
          disabled={pending || confirm.trim().toUpperCase() !== 'DELETE'}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-red-600 px-3 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-40"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
          Delete my account
        </button>
      </form>
      {error && (
        <p role="alert" className="text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
