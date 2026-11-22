import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { BookOpen, FolderOpen } from 'lucide-react';
import JoinCodeCard from '@/components/workspace/classes/JoinCodeCard';
import TeamsPanel from '@/components/workspace/files/TeamsPanel';
import { filesDb, getClassViewer, offeringIdForSlug } from '@/lib/workspace-files-server';
import { joinCodeStatus } from '@/lib/workspace-classes';

export const metadata: Metadata = {
  title: 'Class settings · Workspace Q',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function ManageClassPage({ params }: { params: Promise<{ offeringId: string }> }) {
  const { offeringId } = await params;
  const check = await getClassViewer(offeringId);

  if (check.status === 'signed-out') {
    redirect(`/workspace-q/signin?callbackUrl=${encodeURIComponent(`/workspace-q/${offeringId}/manage`)}`);
  }
  if (check.status === 'not-found') {
    const id = await offeringIdForSlug(offeringId);
    if (id) redirect(`/workspace-q/${id}/manage`);
    notFound();
  }
  if (check.status === 'not-enrolled' || check.viewer.role !== 'staff') {
    return (
      <div className="flex flex-1 items-center justify-center bg-[var(--wq-canvas)] px-4 py-16">
        <div className="max-w-md rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-8 text-center">
          <h1 className="mb-2 text-lg font-semibold text-[var(--wq-text)]">Instructors only</h1>
          <p className="text-sm text-[var(--wq-text-muted)]">
            This page is for the instructor of this class. If you are the instructor, sign out and sign in with the account that
            runs this class.
          </p>
        </div>
      </div>
    );
  }

  const [offering, teams, enrolments] = await Promise.all([
    filesDb.offering.findUniqueOrThrow({
      where: { id: offeringId },
      select: { id: true, name: true, joinCode: true, joinCodeExpiresAt: true },
    }),
    filesDb.team.findMany({
      where: { offeringId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, name: true, members: { select: { user: { select: { id: true, name: true } } } } },
    }),
    filesDb.enrollment.findMany({
      where: { offeringId, role: 'LEARNER' },
      select: {
        createdAt: true,
        user: { select: { id: true, name: true, email: true, teamMemberships: { where: { offeringId }, select: { teamId: true } } } },
      },
    }),
  ]);

  const nameOf = (u: { name: string | null; email: string }) => u.name?.trim() || u.email.split('@')[0];
  const status = joinCodeStatus(offering.joinCode, offering.joinCodeExpiresAt);

  return (
    <div className="flex-1 bg-[var(--wq-canvas)] pb-20">
      <div className="mx-auto max-w-5xl space-y-8 px-4 pt-8 sm:px-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--wq-accent)]">Class settings</p>
            <h1 className="mt-1 text-2xl font-bold text-[var(--wq-text)] sm:text-3xl">{offering.name}</h1>
            <p className="mt-1 text-sm text-[var(--wq-text-muted)]">
              {enrolments.length === 1 ? '1 student' : `${enrolments.length} students`} · give students the pass code, then put them
              in teams.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <Link
            href={`/workspace-q/${offeringId}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--wq-border)] px-3 py-1.5 text-sm font-medium text-[var(--wq-text)] hover:border-[var(--wq-border-hover)]"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Class page
          </Link>
          <Link
            href={`/workspace-q/${offeringId}/files`}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-[var(--wq-border)] px-3 py-1.5 text-sm font-medium text-[var(--wq-text)] hover:border-[var(--wq-border-hover)] sm:self-auto"
          >
            <FolderOpen className="h-4 w-4" aria-hidden="true" />
            Class files
          </Link>
          </div>
        </header>

        <JoinCodeCard
          offeringId={offeringId}
          code={offering.joinCode}
          status={status}
          expiresOn={offering.joinCodeExpiresAt ? offering.joinCodeExpiresAt.toISOString().slice(0, 10) : null}
        />

        <TeamsPanel
          offeringId={offeringId}
          canRemove
          teams={teams.map((t) => ({
            id: t.id,
            name: t.name,
            members: t.members.map((m) => ({ id: m.user.id, name: m.user.name?.trim() || null })),
          }))}
          roster={enrolments
            .map((e) => ({
              userId: e.user.id,
              name: nameOf(e.user),
              email: e.user.email,
              teamId: e.user.teamMemberships[0]?.teamId ?? null,
              joinedAt: e.createdAt.toISOString(),
            }))
            .sort((a, b) => a.name.localeCompare(b.name))}
        />
      </div>
    </div>
  );
}
