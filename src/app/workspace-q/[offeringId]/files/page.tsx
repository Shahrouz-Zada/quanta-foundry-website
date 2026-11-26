import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import FilesWorkspace from '@/components/workspace/files/FilesWorkspace';
import { filesDb, getClassViewer, getVisibleFiles, storageUsedBytes, studentFilesToken, offeringIdForSlug } from '@/lib/workspace-files-server';
import { storageQuotaBytes } from '@/lib/workspace-files';
import { threadStats } from '@/lib/discussions-server';
import { fileThreadKey } from '@/lib/discussions';
import type { Tab } from '@/components/workspace/files/FilesWorkspace';

const TABS: Tab[] = ['mine', 'team', 'class', 'audit', 'all', 'teams'];

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
  searchParams: Promise<{ tab?: string; comments?: string }>;
}) {
  const { offeringId } = await params;
  const { tab, comments: openComments } = await searchParams;
  const check = await getClassViewer(offeringId);

  if (check.status === 'signed-out') {
    redirect(`/workspace-q/signin?callbackUrl=${encodeURIComponent(`/workspace-q/${offeringId}/files`)}`);
  }
  if (check.status === 'not-found') {
    const id = await offeringIdForSlug(offeringId);
    if (id) redirect(`/workspace-q/${id}/files${tab ? `?tab=${encodeURIComponent(tab)}` : ''}`);
    notFound();
  }
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

  const [files, teams, roster, personalUsed, teamUsed, pairings] = await Promise.all([
    getVisibleFiles(offeringId, viewer),
    filesDb.team.findMany({
      // Students: their own team, plus the teams their team audits.
      where: isStaff ? { offeringId } : { offeringId, id: { in: [viewer.teamId ?? '__none__', ...(viewer.auditTeamIds ?? [])] } },
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
    // Staff: every pairing. Students: only the pairings that open their own team's files, so they know who can see them.
    isStaff
      ? filesDb.teamAudit.findMany({ where: { offeringId }, select: { id: true, auditorTeamId: true, auditedTeamId: true, auditor: { select: { name: true } } } })
      : viewer.role === 'learner' && viewer.teamId
        ? filesDb.teamAudit.findMany({ where: { auditedTeamId: viewer.teamId }, select: { id: true, auditorTeamId: true, auditedTeamId: true, auditor: { select: { name: true } } } })
        : Promise.resolve([]),
  ]);

  // Staff see emails in the roster; classmates only ever see names.
  const nameOf = (u: { name: string | null; email: string }) => u.name?.trim() || u.email.split('@')[0];
  const publicName = (u: { name: string | null }) => u.name?.trim() || null;

  // Comment counts for the files whose conversation this person can join.
  const stats = await threadStats(user.id, files.filter((f) => f.canDiscuss).map((f) => fileThreadKey(f.id)));
  for (const f of files) {
    const s = stats.get(fileThreadKey(f.id));
    if (s) f.comments = s;
  }

  const teamInfos = teams.map((t) => ({
    id: t.id,
    name: t.name,
    members: t.members.map((m) => ({ id: m.user.id, name: publicName(m.user) })),
  }));

  return (
    <FilesWorkspace
      offering={offering}
      viewer={{ ...viewer, name: nameOf(user) }}
      files={files}
      teams={teamInfos.filter((t) => isStaff || t.id === viewer.teamId)}
      audits={isStaff ? pairings.map(({ id, auditorTeamId, auditedTeamId }) => ({ id, auditorTeamId, auditedTeamId })) : []}
      auditedTeams={isStaff ? [] : teamInfos.filter((t) => t.id !== viewer.teamId && (viewer.auditTeamIds ?? []).includes(t.id))}
      auditedBy={isStaff ? [] : pairings.map((p) => p.auditor.name).sort((a, b) => a.localeCompare(b))}
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
      initialTab={TABS.includes(tab as Tab) ? (tab as Tab) : undefined}
      openCommentsFor={openComments ?? null}
    />
  );
}
