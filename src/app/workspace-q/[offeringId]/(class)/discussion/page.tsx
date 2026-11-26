import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import DiscussionBoard from '@/components/workspace/discussion/DiscussionBoard';
import { discussionsDb, recentThreads, threadStats } from '@/lib/discussions-server';
import { getClassViewer, offeringIdForSlug } from '@/lib/workspace-files-server';
import { teamThreadKey } from '@/lib/discussions';
import NotInClass from '../NotInClass';

export const metadata: Metadata = {
  title: 'Discussion · Workspace Q',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function DiscussionPage({
  params,
  searchParams,
}: {
  params: Promise<{ offeringId: string }>;
  searchParams: Promise<{ team?: string }>;
}) {
  const { offeringId } = await params;
  const { team: teamParam } = await searchParams;
  const check = await getClassViewer(offeringId);
  if (check.status === 'signed-out') {
    redirect(`/workspace-q/signin?callbackUrl=${encodeURIComponent(`/workspace-q/${offeringId}/discussion`)}`);
  }
  if (check.status === 'not-found') {
    const id = await offeringIdForSlug(offeringId);
    if (id) redirect(`/workspace-q/${id}/discussion`);
    notFound();
  }
  if (check.status === 'not-enrolled') return <NotInClass email={check.email} />;

  const { viewer, offering } = check;
  const staff = viewer.role === 'staff';
  const teams = await discussionsDb.team.findMany({
    where: staff ? { offeringId } : { offeringId, id: viewer.teamId ?? '__none__' },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, name: true, members: { select: { user: { select: { name: true } } } } },
  });
  const [stats, recent] = await Promise.all([
    threadStats(viewer.userId, teams.map((t) => teamThreadKey(t.id))),
    recentThreads(offeringId, viewer),
  ]);
  const selected = staff ? (teams.find((t) => t.id === teamParam) ?? teams[0] ?? null) : (teams[0] ?? null);

  return (
    <DiscussionBoard
      offering={offering}
      role={viewer.role}
      teams={teams.map((t) => ({
        id: t.id,
        name: t.name,
        // Names only, never emails.
        members: t.members.map((m) => m.user.name?.trim() || null),
        total: stats.get(teamThreadKey(t.id))?.total ?? 0,
        unread: stats.get(teamThreadKey(t.id))?.unread ?? 0,
      }))}
      selectedTeamId={selected?.id ?? null}
      recent={recent}
    />
  );
}
