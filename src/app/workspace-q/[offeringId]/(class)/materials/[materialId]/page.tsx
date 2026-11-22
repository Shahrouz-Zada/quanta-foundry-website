import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import MaterialViewer from '@/components/workspace/class/MaterialViewer';
import { getClassViewer, offeringIdForSlug } from '@/lib/workspace-files-server';
import { inlineContentType, isHtmlFile } from '@/lib/workspace-files';
import { loadMaterial } from '@/lib/workspace-materials-server';
import { canDownloadMaterial, canSeeMaterial } from '@/lib/workspace-materials';

export const metadata: Metadata = {
  title: 'Material · Workspace Q',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/** Full-screen view of one material (F4.3): HTML decks in a sandbox, PDFs, images. */
export default async function MaterialPage({ params }: { params: Promise<{ offeringId: string; materialId: string }> }) {
  const { offeringId, materialId } = await params;
  const check = await getClassViewer(offeringId);
  if (check.status === 'signed-out') {
    redirect(`/workspace-q/signin?callbackUrl=${encodeURIComponent(`/workspace-q/${offeringId}/materials/${materialId}`)}`);
  }
  if (check.status === 'not-found') {
    const id = await offeringIdForSlug(offeringId);
    if (id) redirect(`/workspace-q/${id}/materials/${materialId}`);
  }
  if (check.status !== 'ok') notFound();

  const material = await loadMaterial(materialId);
  // Unknown, other class, staff-only or not yet released: all simply "not found".
  if (!material || material.offeringId !== offeringId || material.kind === 'LINK') notFound();
  if (!canSeeMaterial(check.viewer.role, material, material.session)) notFound();
  const current = material.versions[0];
  if (!current) notFound();
  const type = inlineContentType(current.fileName);
  if (!type) notFound();

  return (
    <MaterialViewer
      offeringId={offeringId}
      materialId={material.id}
      titleEn={material.titleEn}
      titleFr={material.titleFr}
      mode={isHtmlFile(current.fileName) ? 'html' : type === 'application/pdf' ? 'pdf' : type.startsWith('image/') ? 'image' : 'text'}
      canDownload={canDownloadMaterial(check.viewer.role, material)}
    />
  );
}
