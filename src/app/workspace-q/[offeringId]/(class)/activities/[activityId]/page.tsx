import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import ActivityStaff from '@/components/workspace/activities/ActivityStaff';
import ActivityStudent from '@/components/workspace/activities/ActivityStudent';
import { getClassViewer, offeringIdForSlug } from '@/lib/workspace-files-server';
import { inlineContentType } from '@/lib/workspace-files';
import {
  activitiesDb,
  attachableFiles,
  loadActivity,
  loadReview,
  loadSubmissionView,
  toActivityInfo,
  viewerOwnerKey,
  type SubmissionView,
} from '@/lib/workspace-activities-server';
import { loadMaterial } from '@/lib/workspace-materials-server';
import { canSeeMaterial, isReleased, effectiveReleaseAt } from '@/lib/workspace-materials';
import { threadStats } from '@/lib/discussions-server';
import { activityThreadKey } from '@/lib/discussions';

export const metadata: Metadata = {
  title: 'Activity · Workspace Q',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const EMPTY: SubmissionView = { id: null, answers: { values: {} }, status: 'not-started', submittedAt: null, lastSavedAt: null, lastSavedBy: null, versions: [] };

export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ offeringId: string; activityId: string }>;
  searchParams: Promise<{ review?: string }>;
}) {
  const { offeringId, activityId } = await params;
  const { review } = await searchParams;
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

  if (staff) {
    const [rows, sessions, materials] = await Promise.all([
      loadReview(activity),
      activitiesDb.classSession.findMany({ where: { offeringId }, orderBy: [{ number: 'asc' }, { createdAt: 'asc' }] }),
      activitiesDb.classMaterial.findMany({
        where: { offeringId, kind: { not: 'LINK' } },
        orderBy: [{ sessionId: 'asc' }, { order: 'asc' }],
        include: { session: { select: { number: true, materialsReleaseAt: true } } },
      }),
    ]);
    const now = new Date();
    const comments = await threadStats(check.user.id, rows.map((r) => activityThreadKey(activity.id, r.ownerKey)));
    for (const r of rows) {
      const s = comments.get(activityThreadKey(activity.id, r.ownerKey));
      if (s) r.comments = s;
    }
    return (
      <ActivityStaff
        activity={toActivityInfo(activity, true, now)}
        rows={rows}
        openReview={review ?? null}
        sessionOptions={sessions.map((s) => ({ id: s.id, label: `Session ${s.number} · ${s.titleEn}` }))}
        materials={materials.map((m) => {
          const release = effectiveReleaseAt(m, m.session);
          return {
            id: m.id,
            label: `${m.session ? `S${m.session.number} · ` : ''}${m.titleEn}`,
            studentsSee: m.audience === 'STUDENTS' && isReleased(release, now),
            releaseAt: m.audience === 'STUDENTS' && release && !isReleased(release, now) ? release.toISOString() : null,
          };
        })}
      />
    );
  }

  // Observers read the instructions only.
  const learner = check.viewer.role === 'learner';
  const ownerKey = learner ? viewerOwnerKey(activity, check.viewer) : null;
  const [submission, attachable, team, modelMaterial] = await Promise.all([
    ownerKey ? loadSubmissionView(activity, ownerKey) : Promise.resolve(EMPTY),
    activity.kind === 'FILE' ? attachableFiles(offeringId, check.viewer, activity.submitter) : Promise.resolve([]),
    check.viewer.teamId ? activitiesDb.team.findUnique({ where: { id: check.viewer.teamId }, select: { name: true } }) : Promise.resolve(null),
    activity.modelMaterialId ? loadMaterial(activity.modelMaterialId) : Promise.resolve(null),
  ]);
  // The answer key reaches this page only once this student's (or team's) results are shown.
  const info = toActivityInfo(activity, false, new Date(), submission.submittedAt ? new Date(submission.submittedAt) : null);
  const discussionKey = ownerKey ? activityThreadKey(activity.id, ownerKey) : null;
  const discussionStats = discussionKey ? (await threadStats(check.user.id, [discussionKey])).get(discussionKey) : undefined;
  const modelVisible = modelMaterial && modelMaterial.versions.length > 0 && canSeeMaterial(check.viewer.role, modelMaterial, modelMaterial.session);
  return (
    <ActivityStudent
      activity={learner ? info : { ...info, window: 'closed' }}
      initial={submission}
      teamName={team?.name ?? null}
      noTeam={learner && ownerKey === null}
      attachable={attachable}
      discussion={discussionKey ? { key: discussionKey, total: discussionStats?.total ?? 0, unread: discussionStats?.unread ?? 0 } : null}
      model={
        modelVisible
          ? { id: modelMaterial.id, title: modelMaterial.titleEn, canOpen: inlineContentType(modelMaterial.versions[0].fileName) !== null }
          : null
      }
    />
  );
}
