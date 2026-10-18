import { NextResponse, type NextRequest } from 'next/server';
import { getDeliverableMaterial, recordCourseEvent } from '@/lib/courses';
import { blobDownloadUrl, isLikelyBot } from '@/lib/course-files';

// GET /api/courses/materials/<id>/download
// Counts the download, then sends the browser to the file in Vercel Blob
// with ?download=1, which makes Blob serve it as an attachment under its
// original file name. Add ?preview=1 to skip counting (used by the admin page).
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const material = await getDeliverableMaterial(id);
  if (!material) {
    return new NextResponse('This file is no longer available.', { status: 404 });
  }

  const isPreview = request.nextUrl.searchParams.get('preview') === '1';
  if (!isPreview && !isLikelyBot(request.headers.get('user-agent'))) {
    await recordCourseEvent('MATERIAL_DOWNLOAD', { courseId: material.courseId, materialId: material.id });
  }

  const response = NextResponse.redirect(blobDownloadUrl(material.blobUrl), 302);
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
