import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import {
  filesDb,
  getClassViewer,
  loadFile,
  accessFacts,
  storageUsedBytes,
  studentFilesToken,
  sweepAbandonedUploads,
} from '@/lib/workspace-files-server';
import {
  MAX_PENDING_UPLOADS,
  MAX_STUDENT_FILE_BYTES,
  PENDING_UPLOAD_TTL_MS,
  canEditFile,
  isValidStudentBlobPathname,
  storageQuotaBytes,
} from '@/lib/workspace-files';

// Students upload straight from the browser to the PRIVATE Blob store, so
// files never pass through our functions. Before each upload the browser
// asks this route for a short-lived token; this is where we check the
// student is in the class (and in the team, for a team file), that the path
// belongs to this class, and that the space still has room.
//
// Each token is recorded as a PendingUpload. Saving the file afterwards (the
// registerUpload server action) requires that record and checks everything
// again with the real size read from storage. Uploads never saved are
// deleted after an hour by sweepAbandonedUploads().

interface UploadPayload {
  offeringId?: unknown;
  space?: unknown; // 'personal' | 'team'
  fileId?: unknown; // set when uploading a new version of an existing file
}

/** A refusal whose message is safe to show the student. */
class UploadRefused extends Error {}

export async function POST(request: Request) {
  const token = studentFilesToken();
  if (!token) {
    return NextResponse.json({ error: 'File storage is not connected yet.' }, { status: 503 });
  }

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
        const space = payload.space === 'team' ? 'team' : 'personal';
        const fileId = payload.fileId ? String(payload.fileId) : null;

        const check = await getClassViewer(offeringId);
        if (check.status !== 'ok' || check.viewer.role !== 'learner') {
          throw new UploadRefused('Only students in this class can upload files here.');
        }
        const { viewer } = check;
        if (!isValidStudentBlobPathname(pathname, offeringId)) {
          throw new UploadRefused('Invalid file location.');
        }

        // Clean up abandoned uploads (anyone's) before counting this student's.
        await sweepAbandonedUploads((paths) => del(paths, { token }));
        const recent = await filesDb.pendingUpload.count({
          where: { userId: viewer.userId, createdAt: { gte: new Date(Date.now() - PENDING_UPLOAD_TTL_MS) } },
        });
        if (recent >= MAX_PENDING_UPLOADS) {
          throw new UploadRefused('Too many uploads at once. Wait a few minutes and try again.');
        }

        let teamId: string | null = null;
        if (fileId) {
          const file = await loadFile(fileId);
          if (!file || file.offeringId !== offeringId || !canEditFile(viewer, accessFacts(file))) {
            throw new UploadRefused('You can’t upload a new version of this file.');
          }
          teamId = file.teamId;
        } else if (space === 'team') {
          if (!viewer.teamId) throw new UploadRefused('You are not in a team yet.');
          teamId = viewer.teamId;
        }

        const used = await storageUsedBytes(
          offeringId,
          teamId ? { kind: 'team', teamId } : { kind: 'personal', userId: viewer.userId },
        );
        const remaining = storageQuotaBytes() - used;
        if (remaining <= 0) throw new UploadRefused('This space is full. Delete some files first.');

        // The path must be new: never overwrite or claim someone's file.
        const taken = await filesDb.studentFileVersion.findUnique({
          where: { blobPathname: pathname },
          select: { id: true },
        });
        if (taken) throw new UploadRefused('Invalid file location.');
        try {
          await filesDb.pendingUpload.create({ data: { offeringId, userId: viewer.userId, blobPathname: pathname } });
        } catch {
          throw new UploadRefused('Invalid file location.');
        }

        return {
          maximumSizeInBytes: Math.min(MAX_STUDENT_FILE_BYTES, remaining),
          addRandomSuffix: false,
          allowOverwrite: false,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UploadRefused) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Upload token request failed:', error);
    return NextResponse.json({ error: 'The upload could not start. Please try again.' }, { status: 400 });
  }
}
