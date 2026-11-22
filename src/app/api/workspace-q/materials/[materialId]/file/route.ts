import { NextResponse, type NextRequest } from 'next/server';
import { get } from '@vercel/blob';
import { auth } from '@/auth';
import { getClassViewer, studentFilesToken } from '@/lib/workspace-files-server';
import { contentDisposition, inlineContentType, isHtmlFile } from '@/lib/workspace-files';
import { loadMaterial } from '@/lib/workspace-materials-server';
import { canDownloadMaterial, canSeeMaterial } from '@/lib/workspace-materials';

// The only way to read a class material (spec F4.3, F4.6). Materials sit in the
// private store with no public URL; this route checks the viewer is in the
// class and may see the material now (staff-only and unreleased materials are
// "not found" for students, even with the exact address), then streams it.
// Default: open in the browser when that is safe (HTML decks in a sandbox,
// PDF, images, text). `?download=1` saves it, if downloads are allowed.
// `?version=<id>` (staff) fetches an older version.

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const NOT_FOUND = () => new NextResponse('Not found', { status: 404 });

export async function GET(request: NextRequest, { params }: { params: Promise<{ materialId: string }> }) {
  const { materialId } = await params;
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Sign in to open this material.', { status: 401 });

  const material = await loadMaterial(materialId);
  if (!material || material.kind === 'LINK') return NOT_FOUND();
  const check = await getClassViewer(material.offeringId);
  if (check.status === 'signed-out') return new NextResponse('Sign in to open this material.', { status: 401 });
  if (check.status !== 'ok') return NOT_FOUND();
  const role = check.viewer.role;
  if (!canSeeMaterial(role, material, material.session)) return NOT_FOUND();

  const versionId = request.nextUrl.searchParams.get('version');
  const version = versionId ? material.versions.find((v) => v.id === versionId) : material.versions[0];
  if (!version) return NOT_FOUND();
  if (version.id !== material.versions[0]?.id && role !== 'staff') return NOT_FOUND();

  const wantsDownload = request.nextUrl.searchParams.get('download') === '1';
  const inlineType = wantsDownload ? null : inlineContentType(version.fileName);
  if (!inlineType && !canDownloadMaterial(role, material)) {
    return new NextResponse('This material can only be viewed in the workspace.', { status: 403 });
  }

  const token = studentFilesToken();
  if (!token) return new NextResponse('File storage is not connected.', { status: 503 });
  let stored: Awaited<ReturnType<typeof get>>;
  try {
    stored = await get(version.blobPathname, { access: 'private', token, useCache: false });
  } catch (error) {
    console.error('Could not read material from storage:', error);
    return new NextResponse('This file could not be loaded. Please try again.', { status: 502 });
  }
  if (!stored || stored.statusCode !== 200) return new NextResponse('This file is no longer available.', { status: 404 });

  // No Content-Length: storage may send text files compressed, and then the size it
  // reports is not the size of what we stream (it was 0 for HTML decks on Vercel,
  // which showed an empty page). Streaming without a length is always correct.
  const headers = new Headers({
    'Content-Type': inlineType ?? 'application/octet-stream',
    'Content-Disposition': contentDisposition(inlineType ? 'inline' : 'attachment', version.fileName),
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  if (inlineType && isHtmlFile(version.fileName)) {
    // Decks run their own scripts (navigation, EN/FR switch) in an isolated
    // origin: no access to this site's cookies or the signed-in account.
    // Only this site may frame them.
    headers.set('Content-Security-Policy', "sandbox allow-scripts allow-popups allow-modals allow-downloads; frame-ancestors 'self'");
  } else if (inlineType === 'application/pdf') {
    // The browser's PDF viewer does not work inside a sandbox.
    headers.set('Content-Security-Policy', "frame-ancestors 'self'");
  } else {
    headers.set('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox; frame-ancestors 'self'");
  }
  return new NextResponse(stored.stream, { status: 200, headers });
}
