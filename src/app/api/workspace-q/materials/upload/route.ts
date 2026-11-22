import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { filesDb, getClassViewer, studentFilesToken, sweepAbandonedUploads } from '@/lib/workspace-files-server';
import { MAX_PENDING_UPLOADS, PENDING_UPLOAD_TTL_MS } from '@/lib/workspace-files';
import { MAX_MATERIAL_BYTES, isValidMaterialPathname } from '@/lib/workspace-materials';

// Class materials (spec F4) are uploaded by staff straight from the browser to
// the PRIVATE Blob store (the same store as student files, under materials/).
// This route hands out the short-lived upload token after checking the caller
// is staff of the class and the path belongs to it. Saving the material
// afterwards (registerMaterialUpload) needs the PendingUpload recorded here.

interface UploadPayload {
  offeringId?: unknown;
  materialId?: unknown; // set when uploading a new version
}

class UploadRefused extends Error {}

export async function POST(request: Request) {
  const token = studentFilesToken();
  if (!token) return NextResponse.json({ error: 'File storage is not connected yet.' }, { status: 503 });

  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      token,
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let payload: UploadPayload;
        try {
          payload = JSON.parse(clientPayload ?? '{}') as UploadPayload;
        } catch {
          throw new UploadRefused('Invalid upload request.');
        }
        const offeringId = String(payload.offeringId ?? '');
        const materialId = payload.materialId ? String(payload.materialId) : null;

        const check = await getClassViewer(offeringId);
        if (check.status !== 'ok' || check.viewer.role !== 'staff') {
          throw new UploadRefused('Only the instructor of this class can upload materials.');
        }
        if (!isValidMaterialPathname(pathname, offeringId)) throw new UploadRefused('Invalid file location.');

        if (materialId) {
          const material = await filesDb.classMaterial.findUnique({ where: { id: materialId }, select: { offeringId: true, kind: true } });
          if (!material || material.offeringId !== offeringId || material.kind === 'LINK') {
            throw new UploadRefused('You can’t upload a new version of this material.');
          }
        }

        await sweepAbandonedUploads((paths) => del(paths, { token }));
        const recent = await filesDb.pendingUpload.count({
          where: { userId: check.user.id, createdAt: { gte: new Date(Date.now() - PENDING_UPLOAD_TTL_MS) } },
        });
        if (recent >= MAX_PENDING_UPLOADS) throw new UploadRefused('Too many uploads at once. Wait a few minutes and try again.');

        const taken = await filesDb.classMaterialVersion.findUnique({ where: { blobPathname: pathname }, select: { id: true } });
        if (taken) throw new UploadRefused('Invalid file location.');
        try {
          await filesDb.pendingUpload.create({ data: { offeringId, userId: check.user.id, blobPathname: pathname } });
        } catch {
          throw new UploadRefused('Invalid file location.');
        }
        return { maximumSizeInBytes: MAX_MATERIAL_BYTES, addRandomSuffix: false, allowOverwrite: false };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UploadRefused) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('Material upload token request failed:', error);
    return NextResponse.json({ error: 'The upload could not start. Please try again.' }, { status: 400 });
  }
}
