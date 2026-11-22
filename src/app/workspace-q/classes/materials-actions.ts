'use server';

// =============================================================================
// Workspace Q · sessions, materials and tools (spec F1.3, F4, F5): server
// actions. All of them are for the class's staff (its instructor or a platform
// administrator); each one checks that again, whatever the page showed.
// =============================================================================

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { del, head } from '@vercel/blob';
import { z } from 'zod';
import { audit, getClassViewer, studentFilesToken } from '@/lib/workspace-files-server';
import { loadMaterial, materialsDb as db } from '@/lib/workspace-materials-server';
import {
  FILE_KINDS,
  MATERIAL_KINDS,
  MAX_MATERIAL_BYTES,
  cleanHttpUrl,
  colabUrlFromGithub,
  guessMaterialKind,
  isValidMaterialPathname,
  looksStaffOnly,
  makePublicToken,
  materialTitleFromFileName,
  zonedLocalToUtc,
} from '@/lib/workspace-materials';

export type MaterialActionResult = { ok: true } | { ok: false; error: string };

class UserError extends Error {}

function fail(error: unknown): { ok: false; error: string } {
  if (error instanceof UserError) return { ok: false, error: error.message };
  if (error instanceof z.ZodError) return { ok: false, error: error.issues[0]?.message ?? 'Invalid input.' };
  console.error('Workspace materials action failed:', error);
  const code = (error as { code?: unknown } | null)?.code;
  if (code === 'P2025') return { ok: false, error: 'This item no longer exists. Refresh the page.' };
  if (code === 'P2003') return { ok: false, error: 'That session no longer exists. Refresh the page.' };
  return { ok: false, error: 'Something went wrong. Please try again.' };
}

const id = z.string().min(1).max(64);
const optionalText = (max: number) =>
  z
    .string()
    .max(max, 'That text is too long.')
    .transform((v) => v.trim() || null)
    .nullish();

async function requireStaff(offeringId: string) {
  const check = await getClassViewer(offeringId);
  if (check.status !== 'ok' || check.viewer.role !== 'staff') {
    throw new UserError('You don’t have permission to do this.');
  }
  return check;
}

function refresh(offeringId: string) {
  revalidatePath(`/workspace-q/${offeringId}`);
}

/** "" → null; a Paris date-time → the instant; anything else is refused. */
function parseLocal(value: string | null | undefined, label: string): Date | null {
  if (!value) return null;
  const date = zonedLocalToUtc(value);
  if (!date) throw new UserError(`Please enter a valid ${label}.`);
  return date;
}

async function deleteBlobs(pathnames: string[]) {
  const token = studentFilesToken();
  if (pathnames.length === 0 || !token) return;
  try {
    await del(pathnames, { token });
  } catch (error) {
    console.error('Could not delete material files from storage:', pathnames, error);
  }
}

/** The session must belong to this class (or be null for general materials). */
async function checkSession(offeringId: string, sessionId: string | null | undefined) {
  if (!sessionId) return null;
  const session = await db.classSession.findUnique({ where: { id: sessionId }, select: { offeringId: true } });
  if (!session || session.offeringId !== offeringId) throw new UserError('That session no longer exists. Refresh the page.');
  return sessionId;
}

async function staffForMaterial(materialId: string) {
  const material = await loadMaterial(materialId);
  if (!material) throw new UserError('This material no longer exists. Refresh the page.');
  const check = await requireStaff(material.offeringId);
  return { material, user: check.user };
}

// -----------------------------------------------------------------------------
// Sessions (F1.3)
// -----------------------------------------------------------------------------

const sessionSchema = z.object({
  offeringId: id,
  sessionId: id.nullish(),
  number: z.coerce.number().int('Session number must be a whole number.').min(0).max(999),
  titleEn: z.string().trim().min(1, 'Please enter a title.').max(200, 'That title is too long.'),
  titleFr: optionalText(200),
  startsAt: z.string().max(40).nullish(),
  room: optionalText(80),
  releaseAt: z.string().max(40).nullish(),
  offeringSessionId: id.nullish(),
});

export async function saveSession(input: z.input<typeof sessionSchema>): Promise<MaterialActionResult> {
  try {
    const data = sessionSchema.parse(input);
    const { user } = await requireStaff(data.offeringId);
    const values = {
      number: data.number,
      titleEn: data.titleEn,
      titleFr: data.titleFr ?? null,
      startsAt: parseLocal(data.startsAt, 'date and time'),
      room: data.room ?? null,
      materialsReleaseAt: parseLocal(data.releaseAt, 'release time'),
      offeringSessionId: data.offeringSessionId || null,
    };
    if (values.offeringSessionId) {
      const linked = await db.offeringSession.findUnique({ where: { id: values.offeringSessionId }, select: { offeringId: true } });
      if (!linked || linked.offeringId !== data.offeringId) throw new UserError('That interactive session is not part of this class.');
    }
    if (data.sessionId) {
      const existing = await db.classSession.findUnique({ where: { id: data.sessionId }, select: { offeringId: true } });
      if (!existing || existing.offeringId !== data.offeringId) throw new UserError('That session no longer exists. Refresh the page.');
      await db.classSession.update({ where: { id: data.sessionId }, data: values });
      await audit(db, { offeringId: data.offeringId, actorId: user.id, action: 'session.update', entity: 'ClassSession', entityId: data.sessionId });
    } else {
      const created = await db.classSession.create({ data: { ...values, offeringId: data.offeringId } });
      await audit(db, { offeringId: data.offeringId, actorId: user.id, action: 'session.create', entity: 'ClassSession', entityId: created.id });
    }
    refresh(data.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteSession(input: { sessionId: string }): Promise<MaterialActionResult> {
  try {
    const data = z.object({ sessionId: id }).parse(input);
    const session = await db.classSession.findUnique({
      where: { id: data.sessionId },
      select: { offeringId: true, _count: { select: { materials: true } } },
    });
    if (!session) throw new UserError('That session no longer exists. Refresh the page.');
    const { user } = await requireStaff(session.offeringId);
    if (session._count.materials > 0) {
      throw new UserError('This session still has materials. Delete them or move them to another session first.');
    }
    await db.classSession.delete({ where: { id: data.sessionId } });
    await audit(db, { offeringId: session.offeringId, actorId: user.id, action: 'session.delete', entity: 'ClassSession', entityId: data.sessionId });
    refresh(session.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

// -----------------------------------------------------------------------------
// Materials (F4)
// -----------------------------------------------------------------------------

const registerSchema = z.object({
  offeringId: id,
  pathname: z.string().min(1).max(400),
  fileName: z.string().trim().min(1).max(255),
  sessionId: id.nullish(),
  audience: z.enum(['STUDENTS', 'STAFF']).optional(),
  materialId: id.optional(), // new version of an existing material
});

/**
 * Called right after a file reached storage. Needs the pending upload this
 * person started (so nobody can claim someone else's upload), reads the real
 * size from storage, and saves a new material or a new version of one.
 */
export async function registerMaterialUpload(input: z.input<typeof registerSchema>): Promise<MaterialActionResult> {
  let cleanupPathname = '';
  try {
    const data = registerSchema.parse(input);
    const { user } = await requireStaff(data.offeringId);
    if (!isValidMaterialPathname(data.pathname, data.offeringId)) throw new UserError('Invalid file location.');
    const token = studentFilesToken();
    if (!token) throw new UserError('File storage is not connected yet.');

    const pending = await db.pendingUpload.findUnique({ where: { blobPathname: data.pathname } });
    if (!pending || pending.userId !== user.id || pending.offeringId !== data.offeringId) {
      throw new UserError('This upload has expired. Please upload the file again.');
    }
    cleanupPathname = data.pathname;

    const existing = data.materialId ? await loadMaterial(data.materialId) : null;
    if (data.materialId && (!existing || existing.offeringId !== data.offeringId || existing.kind === 'LINK')) {
      throw new UserError('You can’t upload a new version of this material.');
    }
    const sessionId = existing ? existing.sessionId : await checkSession(data.offeringId, data.sessionId);

    const blob = await head(data.pathname, { token }).catch(() => null);
    if (!blob) throw new UserError('The upload didn’t finish. Please try again.');
    if (blob.size > MAX_MATERIAL_BYTES) throw new UserError('Materials can be up to 100 MB.');

    const version = {
      blobPathname: data.pathname,
      fileName: data.fileName,
      contentType: blob.contentType || null,
      sizeBytes: blob.size,
      uploadedById: user.id,
    };

    await db.$transaction(async (tx) => {
      // Consuming the pending record also stops a second save of the same upload.
      const consumed = await tx.pendingUpload.deleteMany({ where: { id: pending.id } });
      if (consumed.count !== 1) throw new UserError('That upload was already saved.');
      if (existing) {
        await tx.classMaterialVersion.create({ data: { ...version, materialId: existing.id } });
        await tx.classMaterial.update({ where: { id: existing.id }, data: { updatedAt: new Date() } });
        await audit(tx, {
          offeringId: data.offeringId, actorId: user.id, action: 'material.version', entity: 'ClassMaterial',
          entityId: existing.id, details: { fileName: data.fileName, sizeBytes: blob.size },
        });
        return;
      }
      const last = await tx.classMaterial.aggregate({ where: { offeringId: data.offeringId, sessionId }, _max: { order: true } });
      const material = await tx.classMaterial.create({
        data: {
          offeringId: data.offeringId,
          sessionId,
          kind: guessMaterialKind(data.fileName),
          titleEn: materialTitleFromFileName(data.fileName),
          // A name like "solutions" or "run of show" is kept for staff even if the uploader forgot.
          audience: looksStaffOnly(data.fileName) ? 'STAFF' : (data.audience ?? 'STUDENTS'),
          order: (last._max.order ?? 0) + 1,
          versions: { create: version },
        },
      });
      await audit(tx, {
        offeringId: data.offeringId, actorId: user.id, action: 'material.upload', entity: 'ClassMaterial',
        entityId: material.id, details: { fileName: data.fileName, sizeBytes: blob.size, sessionId },
      });
    });
    refresh(data.offeringId);
    return { ok: true };
  } catch (error) {
    if (cleanupPathname) await discardUnsavedUpload(cleanupPathname);
    return fail(error);
  }
}

async function discardUnsavedUpload(pathname: string) {
  try {
    const saved = await db.classMaterialVersion.findUnique({ where: { blobPathname: pathname }, select: { id: true } });
    if (saved) return;
    await deleteBlobs([pathname]);
    await db.pendingUpload.deleteMany({ where: { blobPathname: pathname } });
  } catch (error) {
    console.error('Could not discard an unsaved material upload:', pathname, error);
  }
}

export async function addLinkMaterial(input: {
  offeringId: string;
  sessionId: string | null;
  titleEn: string;
  url: string;
}): Promise<MaterialActionResult> {
  try {
    const data = z
      .object({
        offeringId: id,
        sessionId: id.nullish(),
        titleEn: z.string().trim().min(1, 'Please enter a title.').max(200, 'That title is too long.'),
        url: z.string().max(2000),
      })
      .parse(input);
    const { user } = await requireStaff(data.offeringId);
    const url = cleanHttpUrl(data.url);
    if (!url) throw new UserError('Please enter a web address starting with https://');
    const sessionId = await checkSession(data.offeringId, data.sessionId);
    const last = await db.classMaterial.aggregate({ where: { offeringId: data.offeringId, sessionId }, _max: { order: true } });
    const material = await db.classMaterial.create({
      data: {
        offeringId: data.offeringId, sessionId, kind: 'LINK', titleEn: data.titleEn, externalUrl: url,
        order: (last._max.order ?? 0) + 1,
      },
    });
    await audit(db, { offeringId: data.offeringId, actorId: user.id, action: 'material.link', entity: 'ClassMaterial', entityId: material.id });
    refresh(data.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

const updateSchema = z.object({
  materialId: id,
  titleEn: z.string().trim().min(1, 'Please enter a title.').max(200, 'That title is too long.'),
  titleFr: optionalText(200),
  kind: z.enum(MATERIAL_KINDS as [string, ...string[]]),
  language: z.enum(['EN', 'FR', 'BOTH']),
  audience: z.enum(['STUDENTS', 'STAFF']),
  releaseAt: z.string().max(40).nullish(),
  downloadable: z.boolean(),
  sessionId: id.nullish(),
  githubUrl: z.string().max(2000).nullish(),
  externalUrl: z.string().max(2000).nullish(),
  datasetLink: z.boolean().optional(),
});

/** Every setting of a material in one save (F4.2): titles, type, language, who sees it, when, download, session, links. */
export async function updateMaterial(input: z.input<typeof updateSchema>): Promise<MaterialActionResult> {
  try {
    const data = updateSchema.parse(input);
    const { material, user } = await staffForMaterial(data.materialId);
    const kind = data.kind as (typeof MATERIAL_KINDS)[number];
    const isLink = material.kind === 'LINK';
    if (isLink !== (kind === 'LINK')) throw new UserError('A link stays a link, and a file stays a file.');
    if (!isLink && !FILE_KINDS.includes(kind)) throw new UserError('Unknown type.');

    let externalUrl = material.externalUrl;
    if (isLink) {
      externalUrl = cleanHttpUrl(data.externalUrl ?? '');
      if (!externalUrl) throw new UserError('Please enter a web address starting with https://');
    }
    let githubUrl: string | null = null;
    if (kind === 'NOTEBOOK' && data.githubUrl?.trim()) {
      if (!colabUrlFromGithub(data.githubUrl)) {
        throw new UserError('Paste the notebook’s address on GitHub, like https://github.com/owner/repo/blob/main/notebook.ipynb');
      }
      githubUrl = cleanHttpUrl(data.githubUrl);
    }
    // Dataset link (F5.2): keep the token while it stays on, so notebooks keep working.
    let publicToken: string | null = null;
    if (kind === 'DATASET' && data.datasetLink) publicToken = material.publicToken ?? makePublicToken((n) => randomBytes(n));

    const sessionId = await checkSession(material.offeringId, data.sessionId);
    const moved = sessionId !== material.sessionId;
    let order = material.order;
    if (moved) {
      const last = await db.classMaterial.aggregate({ where: { offeringId: material.offeringId, sessionId }, _max: { order: true } });
      order = (last._max.order ?? 0) + 1;
    }

    await db.classMaterial.update({
      where: { id: material.id },
      data: {
        titleEn: data.titleEn,
        titleFr: data.titleFr ?? null,
        kind,
        language: data.language,
        audience: data.audience,
        releaseAt: parseLocal(data.releaseAt, 'release time'),
        downloadable: data.downloadable,
        sessionId,
        order,
        externalUrl,
        githubUrl,
        publicToken,
      },
    });
    await audit(db, {
      offeringId: material.offeringId, actorId: user.id, action: 'material.update', entity: 'ClassMaterial', entityId: material.id,
      details: { audience: data.audience, releaseAt: data.releaseAt ?? null, sessionId, datasetLink: Boolean(publicToken) },
    });
    refresh(material.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteMaterial(input: { materialId: string }): Promise<MaterialActionResult> {
  try {
    const data = z.object({ materialId: id }).parse(input);
    const { material, user } = await staffForMaterial(data.materialId);
    await db.classMaterial.delete({ where: { id: material.id } });
    await audit(db, {
      offeringId: material.offeringId, actorId: user.id, action: 'material.delete', entity: 'ClassMaterial', entityId: material.id,
      details: { title: material.titleEn },
    });
    await deleteBlobs(material.versions.map((v) => v.blobPathname));
    refresh(material.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/** Swap with the neighbour above or below, in the same session. */
export async function moveMaterial(input: { materialId: string; direction: 'up' | 'down' }): Promise<MaterialActionResult> {
  try {
    const data = z.object({ materialId: id, direction: z.enum(['up', 'down']) }).parse(input);
    const { material } = await staffForMaterial(data.materialId);
    const siblings = await db.classMaterial.findMany({
      where: { offeringId: material.offeringId, sessionId: material.sessionId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: { id: true },
    });
    const index = siblings.findIndex((s) => s.id === material.id);
    const target = data.direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= siblings.length) return { ok: true };
    [siblings[index], siblings[target]] = [siblings[target], siblings[index]];
    await db.$transaction(siblings.map((s, i) => db.classMaterial.update({ where: { id: s.id }, data: { order: i + 1 } })));
    refresh(material.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

// -----------------------------------------------------------------------------
// Tools panel (F5.3)
// -----------------------------------------------------------------------------

export async function addTool(input: { offeringId: string; label: string; url: string }): Promise<MaterialActionResult> {
  try {
    const data = z
      .object({ offeringId: id, label: z.string().trim().min(1, 'Please enter a name.').max(80, 'That name is too long.'), url: z.string().max(2000) })
      .parse(input);
    const { user } = await requireStaff(data.offeringId);
    const url = cleanHttpUrl(data.url);
    if (!url) throw new UserError('Please enter a web address starting with https://');
    const count = await db.classTool.count({ where: { offeringId: data.offeringId } });
    if (count >= 30) throw new UserError('A class can list up to 30 tools.');
    const tool = await db.classTool.create({ data: { offeringId: data.offeringId, label: data.label, url, order: count + 1 } });
    await audit(db, { offeringId: data.offeringId, actorId: user.id, action: 'tool.add', entity: 'ClassTool', entityId: tool.id });
    refresh(data.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteTool(input: { toolId: string }): Promise<MaterialActionResult> {
  try {
    const data = z.object({ toolId: id }).parse(input);
    const tool = await db.classTool.findUnique({ where: { id: data.toolId } });
    if (!tool) throw new UserError('This tool no longer exists. Refresh the page.');
    const { user } = await requireStaff(tool.offeringId);
    await db.classTool.delete({ where: { id: tool.id } });
    await audit(db, { offeringId: tool.offeringId, actorId: user.id, action: 'tool.delete', entity: 'ClassTool', entityId: tool.id });
    refresh(tool.offeringId);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
