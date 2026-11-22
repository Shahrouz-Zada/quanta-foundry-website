import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import FilesWorkspace from '@/components/workspace/files/FilesWorkspace';
import { filesDb, getClassViewer, getVisibleFiles, storageUsedBytes, studentFilesToken } from '@/lib/workspace-files-server';
import { storageQuotaBytes } from '@/lib/workspace-files';

export const metadata: Metadata = {
  title: 'Files · Workspace Q',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function FilesPage({
  params,
  searchParams,
}: {
  params: Promise<{ offeringId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { offeringId } = await params;
  const { tab } = await searchParams;
  const check = await getClassViewer(offeringId);

  if (check.status === 'signed-out') {
    redirect(`/workspace-q/signin?callbackUrl=${encodeURIComponent(`/workspace-q/${offeringId}/files`)}`);
  }
  if (check.status === 'not-found') notFound();
  if (check.status === 'not-enrolled') {
    return (
      <div className="flex flex-1 items-center justify-center bg-[var(--wq-canvas)] px-4 py-16">
        <div className="max-w-md rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-8 text-center">
          <h1 className="mb-2 text-lg font-semibold text-[var(--wq-text)]">This class isn&apos;t yours</h1>
          <p className="text-sm text-[var(--wq-text-muted)]">
            You&apos;re signed in as <strong>{check.email ?? 'an unknown account'}</strong>, which isn&apos;t enrolled in this
            class. If that&apos;s the wrong account, sign out and sign in again with the right one.
          </p>
        </div>
      </div>
    );
  }

  const { viewer, offering, user } = check;
  const isStaff = viewer.role === 'staff';

  const [files, teams, roster, personalUsed, teamUsed] = await Promise.all([
    getVisibleFiles(offeringId, viewer),
    filesDb.team.findMany({
      where: isStaff ? { offeringId } : { offeringId, id: viewer.teamId ?? '__none__' },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        members: { select: { user: { select: { id: true, name: true } } } },
      },
    }),
    isStaff
      ? filesDb.enrollment.findMany({
          where: { offeringId, role: 'LEARNER' },
          select: { user: { select: { id: true, name: true, email: true, teamMemberships: { where: { offeringId }, select: { teamId: true } } } } },
        })
      : Promise.resolve([]),
    viewer.role === 'learner' ? storageUsedBytes(offeringId, { kind: 'personal', userId: viewer.userId }) : Promise.resolve(0),
    viewer.role === 'learner' && viewer.teamId ? storageUsedBytes(offeringId, { kind: 'team', teamId: viewer.teamId }) : Promise.resolve(0),
  ]);

  // Staff see emails in the roster; classmates only ever see names.
  const nameOf = (u: { name: string | null; email: string }) => u.name?.trim() || u.email.split('@')[0];
  const publicName = (u: { name: string | null }) => u.name?.trim() || null;

  return (
    <FilesWorkspace
      offering={offering}
      viewer={{ ...viewer, name: nameOf(user) }}
      files={files}
      teams={teams.map((t) => ({
        id: t.id,
        name: t.name,
        members: t.members.map((m) => ({ id: m.user.id, name: publicName(m.user) })),
      }))}
      roster={roster
        .map((e) => ({
          userId: e.user.id,
          name: nameOf(e.user),
          email: e.user.email,
          teamId: e.user.teamMemberships[0]?.teamId ?? null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))}
      storage={{ personalUsed, teamUsed, quota: storageQuotaBytes() }}
      storageConnected={Boolean(studentFilesToken())}
      initialTab={tab === 'teams' ? 'teams' : undefined}
    />
  );
}
