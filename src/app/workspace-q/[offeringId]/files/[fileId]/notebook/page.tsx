import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import NotebookViewer from '@/components/workspace/notebook/NotebookViewer';
import { accessFacts, getClassViewer, loadFile, offeringIdForSlug } from '@/lib/workspace-files-server';
import { canSeeVersions, canViewFile } from '@/lib/workspace-files';
import { isNotebookFile } from '@/lib/notebook';
import { NotebookBackLabel, NotebookEarlierTag, NotebookDownloadLabel, NotebookReadOnlyNote } from '@/components/workspace/notebook/NotebookLabels';

// A read-only look at a student's Jupyter notebook. This page only decides
// whether the viewer may see the file (the same rule as the download route);
// the notebook itself is fetched and drawn in the browser by NotebookViewer.

export const metadata: Metadata = {
  title: 'Notebook · Workspace Q',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function NotebookPage({
  params,
  searchParams,
}: {
  params: Promise<{ offeringId: string; fileId: string }>;
  searchParams: Promise<{ version?: string }>;
}) {
  const { offeringId, fileId } = await params;
  const { version: versionParam } = await searchParams;
  const here = `/workspace-q/${offeringId}/files/${fileId}/notebook${versionParam ? `?version=${encodeURIComponent(versionParam)}` : ''}`;

  const check = await getClassViewer(offeringId);
  if (check.status === 'signed-out') redirect(`/workspace-q/signin?callbackUrl=${encodeURIComponent(here)}`);
  if (check.status === 'not-found') {
    const id = await offeringIdForSlug(offeringId);
    if (id) redirect(`/workspace-q/${id}/files/${fileId}/notebook${versionParam ? `?version=${encodeURIComponent(versionParam)}` : ''}`);
    notFound();
  }
  // Same answer for "no such file", "not your class" and "not yours to see".
  if (check.status !== 'ok') notFound();

  const file = await loadFile(fileId);
  if (!file || file.offeringId !== offeringId) notFound();
  const facts = accessFacts(file);
  if (!canViewFile(check.viewer, facts)) notFound();

  const current = file.versions[0];
  const version = versionParam ? file.versions.find((v) => v.id === versionParam) : current;
  if (!version || !current) notFound();
  if (version.id !== current.id && !canSeeVersions(check.viewer, facts)) notFound();
  if (!isNotebookFile(version.fileName)) redirect(`/workspace-q/${offeringId}/files`);

  const downloadHref = `/api/workspace-q/files/${file.id}/download?version=${encodeURIComponent(version.id)}`;
  const uploader = version.uploadedBy.name?.trim() || null;
  const owner = file.team?.name ?? file.owner.name?.trim() ?? null;

  return (
    <div className="flex-1 bg-[var(--wq-canvas)] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/workspace-q/${offeringId}/files`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--wq-text-muted)] hover:text-[var(--wq-text)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <NotebookBackLabel />
        </Link>

        <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="break-words text-xl font-bold text-[var(--wq-text)]">{file.title}</h1>
            <p className="mt-1 break-all text-xs text-[var(--wq-text-muted)]">
              {version.fileName}
              {owner && ` · ${owner}`}
              {uploader && ` · ${uploader}`}
              {' · '}
              {version.createdAt.toISOString().slice(0, 10)}
              {version.id !== current.id && <NotebookEarlierTag />}
            </p>
          </div>
          <a
            href={downloadHref}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-[var(--wq-accent)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--wq-accent-hover)]"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <NotebookDownloadLabel />
          </a>
        </header>

        <NotebookReadOnlyNote />
        <NotebookViewer src={downloadHref} />
      </div>
    </div>
  );
}
