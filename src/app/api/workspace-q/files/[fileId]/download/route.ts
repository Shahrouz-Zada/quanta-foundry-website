import { NextResponse, type NextRequest } from 'next/server';
import { get } from '@vercel/blob';
import { auth } from '@/auth';
import {
  accessFacts,
  getClassViewer,
  loadFile,
  studentFilesToken,
} from '@/lib/workspace-files-server';
import {
  canSeeVersions,
  canViewFile,
  contentDisposition,
  inlineContentType,
  isHtmlFile,
} from '@/lib/workspace-files';

// The only way to read a student file. Files live in a private Blob store and
// have no public URL: this route checks the viewer may see the file, then
// streams it from storage. `?inline=1` opens it in the browser when that is
// safe (PDF, images, plain text, sandboxed HTML); everything else downloads.
// `?version=<id>` fetches an older version (people who can edit, and staff).

export const dynamic = 'force-dynamic';
// Room to stream a 20 MB file to a slow connection.
export const maxDuration = 60;

const NOT_FOUND = () => new NextResponse('Not found', { status: 404 });

export async function GET(request: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  // Signed-out callers get the same answer whether or not the file exists.
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Sign in to open this file.', { status: 401 });
  const file = await loadFile(fileId);
  // Same answer whether the file doesn't exist or you may not see it.
  if (!file) return NOT_FOUND();

  const check = await getClassViewer(file.offeringId);
  if (check.status === 'signed-out') return new NextResponse('Sign in to open this file.', { status: 401 });
  if (check.status !== 'ok') return NOT_FOUND();
  const facts = accessFacts(file);
  if (!canViewFile(check.viewer, facts)) return NOT_FOUND();

  const versionId = request.nextUrl.searchParams.get('version');
  const version = versionId ? file.versions.find((v) => v.id === versionId) : file.versions[0];
  if (!version) return NOT_FOUND();
  if (version.id !== file.versions[0]?.id && !canSeeVersions(check.viewer, facts)) return NOT_FOUND();

  const token = studentFilesToken();
  if (!token) return new NextResponse('File storage is not connected.', { status: 503 });

  let stored: Awaited<ReturnType<typeof get>>;
  try {
    stored = await get(version.blobPathname, { access: 'private', token, useCache: false });
  } catch (error) {
    console.error('Could not read student file from storage:', error);
    return new NextResponse('This file could not be loaded. Please try again.', { status: 502 });
  }
  if (!stored || stored.statusCode !== 200) {
    return new NextResponse('This file is no longer available.', { status: 404 });
  }

  const wantsInline = request.nextUrl.searchParams.get('inline') === '1';
  const inlineType = wantsInline ? inlineContentType(version.fileName) : null;

  const headers = new Headers({
    'Content-Type': inlineType ?? 'application/octet-stream',
    'Content-Disposition': contentDisposition(inlineType ? 'inline' : 'attachment', version.fileName),
    'Content-Length': String(stored.blob.size),
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  if (inlineType && isHtmlFile(version.fileName)) {
    // Same rule as course decks: scripts run, but in an isolated origin with
    // no access to this site's cookies or the signed-in account.
    headers.set(
      'Content-Security-Policy',
      // No allow-forms: a shared page can't pose as a sign-in form on our domain.
      'sandbox allow-scripts allow-popups allow-modals allow-downloads',
    );
  } else {
    headers.set('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox");
  }
  // PDFs need the browser's own viewer, which a sandbox blocks.
  if (inlineType === 'application/pdf') headers.delete('Content-Security-Policy');

  return new NextResponse(stored.stream, { status: 200, headers });
}
