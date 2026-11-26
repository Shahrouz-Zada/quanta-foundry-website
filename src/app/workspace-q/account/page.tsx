import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Download } from 'lucide-react';
import { auth } from '@/auth';
import { privacyDb } from '@/lib/privacy-server';
import { isPlatformAdmin } from '@/lib/courses';
import { retentionStatus } from '@/lib/privacy';
import DeleteAccount from '@/components/workspace/privacy/DeleteAccount';

export const metadata: Metadata = {
  title: 'My data · Workspace Q',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const day = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });

/** "My data": download your work per class, see when each class's data is deleted, delete your account. */
export default async function MyDataPage() {
  const session = await auth();
  if (!session?.user?.id) redirect(`/workspace-q/signin?callbackUrl=${encodeURIComponent('/workspace-q/account')}`);
  const user = await privacyDb.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      globalRole: true,
      deletedAt: true,
      enrollments: {
        orderBy: { createdAt: 'desc' },
        select: { role: true, createdAt: true, offering: { select: { id: true, name: true, dataDeleteAfter: true, dataDeletedAt: true } } },
      },
    },
  });
  if (!user || user.deletedAt) redirect(`/workspace-q/signin?callbackUrl=${encodeURIComponent('/workspace-q/account')}`);
  const staff = isPlatformAdmin(user) || user.enrollments.some((e) => e.role === 'INSTRUCTOR');

  return (
    <div className="flex min-h-screen justify-center bg-slate-950 px-4 py-24 text-slate-50">
      <div className="w-full max-w-2xl space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">My data</h1>
          <p className="text-sm text-slate-400">
            Signed in as <strong className="text-slate-200">{user.name ?? 'Unnamed'}</strong> ({user.email}).{' '}
            <Link href="/workspace-q/privacy" className="underline hover:text-slate-200">
              How your data is handled
            </Link>
          </p>
        </header>

        <section aria-labelledby="classes-heading" className="space-y-3">
          <h2 id="classes-heading" className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Your classes
          </h2>
          {user.enrollments.length === 0 ? (
            <p className="rounded-lg border border-slate-800 p-4 text-sm text-slate-400">You are not in any class.</p>
          ) : (
            <ul className="space-y-2">
              {user.enrollments.map((e) => {
                const status = retentionStatus(e.offering.dataDeleteAfter, e.offering.dataDeletedAt);
                return (
                  <li key={e.offering.id} data-testid="my-class" className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <Link href={`/workspace-q/${e.offering.id}`} className="font-semibold text-slate-100 hover:underline">
                        {e.offering.name}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {e.role === 'INSTRUCTOR' ? 'Instructor' : e.role === 'OBSERVER' ? 'Observer' : 'Student'} · joined {day(e.createdAt)}
                        {' · '}
                        {status.state === 'unset'
                          ? 'deletion date not set yet'
                          : status.state === 'deleted'
                            ? `student data was deleted on ${day(status.on)}`
                            : `student data will be deleted on ${day(status.on)}`}
                      </p>
                    </div>
                    {e.role !== 'INSTRUCTOR' && !staff && (
                      <a
                        href={`/api/workspace-q/classes/${e.offering.id}/my-data`}
                        className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Download my work
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {!staff && user.enrollments.length > 0 && (
            <p className="text-xs text-slate-500">
              A ZIP with your files (and their earlier versions), your team’s files, your answers and the messages you wrote.
            </p>
          )}
        </section>

        <section aria-labelledby="delete-heading" className="space-y-3">
          <h2 id="delete-heading" className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Delete my account
          </h2>
          {staff ? (
            <p className="rounded-lg border border-slate-800 p-4 text-sm text-slate-400">
              Instructor and administrator accounts can’t be deleted here, because classes depend on them. To delete a class’s student
              data, use its Class settings.
            </p>
          ) : (
            <DeleteAccount />
          )}
        </section>
      </div>
    </div>
  );
}
