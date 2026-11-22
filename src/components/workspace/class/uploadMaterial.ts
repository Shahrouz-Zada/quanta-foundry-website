'use client';

import { upload } from '@vercel/blob/client';
import { registerMaterialUpload } from '@/app/workspace-q/classes/materials-actions';
import { MAX_MATERIAL_BYTES, buildMaterialPathname } from '@/lib/workspace-materials';

/** Sends one material file to storage, then saves it. Returns an error message, or null on success. */
export async function uploadMaterial(
  file: File,
  opts: {
    offeringId: string;
    sessionId?: string | null;
    audience?: 'STUDENTS' | 'STAFF';
    materialId?: string;
    onProgress?: (percentage: number) => void;
    onSaving?: () => void;
  },
): Promise<string | null> {
  if (file.size > MAX_MATERIAL_BYTES) return 'Materials can be up to 100 MB.';
  try {
    const pathname = buildMaterialPathname(opts.offeringId, crypto.randomUUID(), file.name);
    await upload(pathname, file, {
      access: 'private',
      handleUploadUrl: '/api/workspace-q/materials/upload',
      clientPayload: JSON.stringify({ offeringId: opts.offeringId, materialId: opts.materialId }),
      onUploadProgress: ({ percentage }) => opts.onProgress?.(Math.round(percentage)),
    });
    opts.onSaving?.();
    const result = await registerMaterialUpload({
      offeringId: opts.offeringId,
      pathname,
      fileName: file.name,
      sessionId: opts.sessionId ?? null,
      audience: opts.audience,
      materialId: opts.materialId,
    });
    return result.ok ? null : result.error;
  } catch (error) {
    return error instanceof Error ? error.message : 'Upload failed';
  }
}
