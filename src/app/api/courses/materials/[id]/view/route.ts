import { NextResponse, type NextRequest } from 'next/server';
import { getDeliverableMaterial, recordCourseEvent } from '@/lib/courses';
import { MAX_INLINE_VIEW_BYTES, inlineViewKind, isLikelyBot } from '@/lib/course-files';

// GET /api/courses/materials/<id>/view
// Opens an HTML deck or PDF in the browser.
//
// Why this goes through our server instead of linking to Vercel Blob
// directly: Blob serves every file with `Content-Security-Policy:
// default-src 'none'`, which blocks the inline scripts and styles an HTML
// deck needs, so the deck would show up broken. Here we stream the same
// file with our own headers.
//
// HTML is sent with a CSP `sandbox` (scripts allowed, but no
// allow-same-origin): the deck runs normally, but as an isolated origin, so
// nothing inside an uploaded file can read this site's cookies or act as the
// signed-in user. Add ?preview=1 to skip counting (used by the admin page).
const HTML_SANDBOX =
  'sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals allow-downloads';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const material = await getDeliverableMaterial(id);
  if (!material) {
    return new NextResponse('This file is no longer available.', { status: 404 });
  }

  const kind = inlineViewKind(material.fileName, material.contentType);
  if (!kind || material.sizeBytes > MAX_INLINE_VIEW_BYTES) {
    // Not something a browser can show (or too big to stream): download it.
    const target = new URL(`/api/courses/materials/${material.id}/download`, request.nextUrl.origin);
    request.nextUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value));
    return NextResponse.redirect(target, 302);
  }

  const upstream = await fetch(material.blobUrl, { cache: 'no-store' });
  if (!upstream.ok || !upstream.body) {
    return new NextResponse('Could not load this file right now. Please try the Download button.', {
      status: 502,
    });
  }

  const isPreview = request.nextUrl.searchParams.get('preview') === '1';
  if (!isPreview && !isLikelyBot(request.headers.get('user-agent'))) {
    await recordCourseEvent('MATERIAL_VIEW', { courseId: material.courseId, materialId: material.id });
  }

  const headers = new Headers({
    'Content-Type': kind === 'html' ? 'text/html; charset=utf-8' : 'application/pdf',
    'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(material.fileName)}`,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow',
    'Referrer-Policy': 'no-referrer',
  });
  if (kind === 'html') headers.set('Content-Security-Policy', HTML_SANDBOX);

  return new NextResponse(upstream.body, { status: 200, headers });
}
