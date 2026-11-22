import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { studentFilesToken } from '@/lib/workspace-files-server';
import { contentDisposition } from '@/lib/workspace-files';
import { materialsDb } from '@/lib/workspace-materials-server';
import { canSeeMaterial, isPlausiblePublicToken } from '@/lib/workspace-materials';

// Read-only dataset link for notebooks (spec F5.2): pd.read_csv(url) cannot
// sign in, so this address needs no account. It is a long random token the
// instructor switches on per dataset. It answers only while the dataset is a
// student material and released; switching the link off, making the dataset
// staff-only, or deleting it stops it at once.

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TYPES: Record<string, string> = {
  csv: 'text/csv; charset=utf-8',
  tsv: 'text/tab-separated-values; charset=utf-8',
  json: 'application/json',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  parquet: 'application/octet-stream',
};

export async function GET(_request: Request, { params }: { params: Promise<{ token: string; fileName: string }> }) {
  const { token } = await params;
  const notFound = new NextResponse('Not found', { status: 404 });
  if (!isPlausiblePublicToken(token)) return notFound;

  const material = await materialsDb.classMaterial.findUnique({
    where: { publicToken: token },
    include: { session: { select: { materialsReleaseAt: true } }, versions: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });
  // Treated exactly like a student looking at it.
  if (!material || material.kind !== 'DATASET' || !canSeeMaterial('learner', material, material.session)) return notFound;
  const version = material.versions[0];
  if (!version) return notFound;

  const storeToken = studentFilesToken();
  if (!storeToken) return new NextResponse('File storage is not connected.', { status: 503 });
  let stored: Awaited<ReturnType<typeof get>>;
  try {
    stored = await get(version.blobPathname, { access: 'private', token: storeToken, useCache: false });
  } catch (error) {
    console.error('Could not read dataset from storage:', error);
    return new NextResponse('This file could not be loaded. Please try again.', { status: 502 });
  }
  if (!stored || stored.statusCode !== 200) return notFound;

  const ext = version.fileName.split('.').pop()?.toLowerCase() ?? '';
  return new NextResponse(stored.stream, {
    status: 200,
    headers: {
      'Content-Type': TYPES[ext] ?? 'application/octet-stream',
      'Content-Disposition': contentDisposition('attachment', version.fileName),
      'Content-Length': String(stored.blob.size),
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}
