import { NextResponse, type NextRequest } from 'next/server';
import { getClassViewer, studentFilesToken } from '@/lib/workspace-files-server';
import { myDataEntries } from '@/lib/privacy-server';
import { zipSafeName, zipStream } from '@/lib/zip-stream';
import { contentDisposition } from '@/lib/workspace-files';

// "Download my work": a ZIP of one student's files, answers and messages in
// one class. Built and sent piece by piece, so large exports stream out.

export const dynamic = 'force-dynamic';
// A full export (up to two 200 MB spaces) on a slow connection.
export const maxDuration = 300;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ offeringId: string }> }) {
  const { offeringId } = await params;
  const check = await getClassViewer(offeringId);
  if (check.status === 'signed-out') return new NextResponse('Sign in to download your work.', { status: 401 });
  // Students and observers export their own work; staff manage the class instead.
  if (check.status !== 'ok' || check.viewer.role === 'staff') return new NextResponse('Not found', { status: 404 });
  const token = studentFilesToken();
  if (!token) return new NextResponse('File storage is not connected.', { status: 503 });

  const name = `${zipSafeName(check.offering.name, 'class')} - my work ${new Date().toISOString().slice(0, 10)}.zip`;
  return new NextResponse(zipStream(myDataEntries(check.user.id, offeringId, token)), {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': contentDisposition('attachment', name),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
