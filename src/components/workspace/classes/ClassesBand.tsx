import Link from 'next/link';
import { FolderOpen, KeyRound, Settings } from 'lucide-react';
import type { MyClasses } from '@/lib/workspace-classes-server';
import CreateClassForm from './CreateClassForm';

/**
 * The "Your classes" block on the Workspace Q landing page.
 * Signed out: how to join. Signed in: your classes, and a button to join
 * another. Administrators also see every class and the Create a class button.
 */
export default function ClassesBand({ signedIn, admin, classes }: MyClasses) {
  const pill =
    'inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-sm font-medium text-gray-100 transition hover:border-white/40 hover:bg-white/5';

  return (
    <section aria-labelledby="classes-title" className="mx-auto mb-12 max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="classes-title" className="text-lg font-bold text-white">
          Your classes
        </h2>
        <Link
          href="/workspace-q/join"
          className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#0A1929] transition hover:bg-[#e2bf4a]"
        >
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Join a class
        </Link>
      </div>

      {!signedIn && (
        <p className="mt-3 text-sm text-gray-400">
          Have a pass code from your instructor? Choose <strong className="text-gray-200">Join a class</strong>, sign in with Google and
          enter your full name and the code.
        </p>
      )}

      {signedIn && classes.length === 0 && (
        <p className="mt-3 text-sm text-gray-400">You haven&apos;t joined a class yet. Use the pass code from your instructor.</p>
      )}

      {classes.length > 0 && (
        <ul className="mt-4 divide-y divide-white/10">
          {classes.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-semibold text-white">{c.name}</p>
                <p className="text-xs text-gray-400">{c.roleLabel}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/workspace-q/${c.id}/files`} className={pill}>
                  <FolderOpen className="h-4 w-4" aria-hidden="true" />
                  Files
                </Link>
                {c.staff && (
                  <Link href={`/workspace-q/${c.id}/manage`} className={pill}>
                    <Settings className="h-4 w-4" aria-hidden="true" />
                    Pass code &amp; students
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {admin && (
        <div className="mt-5 border-t border-white/10 pt-5">
          <CreateClassForm copyOptions={classes.map((c) => ({ id: c.id, name: c.name }))} />
        </div>
      )}
    </section>
  );
}
