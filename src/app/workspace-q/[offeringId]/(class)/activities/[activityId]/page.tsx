import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import ActivityStaff from '@/components/workspace/activities/ActivityStaff';
import ActivityStudent from '@/components/workspace/activities/ActivityStudent';
import { getClassViewer, offeringIdForSlug } from '@/lib/workspace-files-server';
import {
  activitiesDb,
  attachableFiles,
  loadActivity,
  loadReview,
  loadSubmissionView,
  toActivityInfo,
  viewerOwnerKey,
} from '@/lib/workspace-activities-server';

export const metadata: Metadata = {
  title: 'Activity · Workspace Q',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function ActivityPage({ params }: { params: Promise<{ offeringId: string; activityId: string }> }) {
  const { offeringId, activityId } = await params;
  const check = await getClassViewer(offeringId);
  if (check.status === 'signed-out') {
    redirect(`/workspace-q/signin?callbackUrl=${encodeURIComponent(`/workspace-q/${offeringId}/activities/${activityId}`)}`);
  }
  if (check.status === 'not-found') {
    const id = await offeringIdForSlug(offeringId);
    if (id) redirect(`/workspace-q/${id}/activities/${activityId}`);
  }
  if (check.status !== 'ok') notFound();

  const activity = await loadActivity(activityId);
  // Unknown, another class's, or a draft (for students): simply "not found".
  if (!activity || activity.offeringId !== offeringId) notFound();
  const staff = check.viewer.role === 'staff';
  if (!staff && !activity.visible) notFound();
  const info = toActivityInfo(activity, staff);

  if (staff) {
    const [rows, sessions] = await Promise.all([
      loadReview(activity),
      activitiesDb.classSession.findMany({ where: { offeringId }, orderBy: [{ number: 'asc' }, { createdAt: 'asc' }] }),
    ]);
    return (
      <ActivityStaff
        activity={info}
        rows={rows}
        sessionOptions={sessions.map((s) => ({ id: s.id, label: `Session ${s.number} · ${s.titleEn}` }))}
      />
    );
  }

  // Observers read the instructions only.
  const ownerKey = check.viewer.role === 'learner' ? viewerOwnerKey(activity, check.viewer) : null;
  const [submission, attachable, team] = await Promise.all([
    ownerKey ? loadSubmissionView(activity, ownerKey) : Promise.resolve({ id: null, answers: { values: {} }, status: 'not-started' as const, submittedAt: null, lastSavedAt: null, lastSavedBy: null, versions: [] }),
    activity.kind === 'FILE' ? attachableFiles(offeringId, check.viewer, activity.submitter) : Promise.resolve([]),
    check.viewer.teamId ? activitiesDb.team.findUnique({ where: { id: check.viewer.teamId }, select: { name: true } }) : Promise.resolve(null),
  ]);
  return (
    <ActivityStudent
      activity={check.viewer.role === 'learner' ? info : { ...info, window: 'closed' }}
      initial={submission}
      teamName={team?.name ?? null}
      noTeam={check.viewer.role === 'learner' && ownerKey === null}
      attachable={attachable}
    />
  );
}
