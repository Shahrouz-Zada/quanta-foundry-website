import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import ClassHome from '@/components/workspace/class/ClassHome';
import { getClassViewer, studentFilesToken, offeringIdForSlug } from '@/lib/workspace-files-server';
import { loadClassHome } from '@/lib/workspace-materials-server';
import NotInClass from './NotInClass';

export const metadata: Metadata = {
  title: 'Class · Workspace Q',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/** A session counts as "next" from 3 hours before it starts until it ends (about 3 hours after). */
const SESSION_LENGTH_MS = 3 * 60 * 60 * 1000;

export default async function ClassHomePage({ params }: { params: Promise<{ offeringId: string }> }) {
  const { offeringId } = await params;
  const check = await getClassViewer(offeringId);
  if (check.status === 'signed-out') {
    redirect(`/workspace-q/signin?callbackUrl=${encodeURIComponent(`/workspace-q/${offeringId}`)}`);
  }
  if (check.status === 'not-found') {
    const id = await offeringIdForSlug(offeringId);
    if (id) redirect(`/workspace-q/${id}`);
    notFound();
  }
  if (check.status === 'not-enrolled') return <NotInClass email={check.email} />;

  const now = new Date();
  const data = await loadClassHome(offeringId, check.viewer.role, now);
  const next = data.sessions.find((s) => s.startsAt && new Date(s.startsAt).getTime() + SESSION_LENGTH_MS > now.getTime());

  return (
    <ClassHome
      offering={check.offering}
      staff={check.viewer.role === 'staff'}
      data={data}
      nextSessionId={next?.id ?? null}
      storageConnected={Boolean(studentFilesToken())}
    />
  );
}
