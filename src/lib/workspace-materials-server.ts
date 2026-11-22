import 'server-only';

// =============================================================================
// Workspace Q · class home: sessions, materials, tools (spec F1.3, F4, F5).
// Server side: loads what one person may see in one class. Students never
// receive staff-only or unreleased materials, not even their titles.
// =============================================================================

import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { inlineContentType } from '@/lib/workspace-files';
import {
  canDownloadMaterial,
  canSeeMaterial,
  colabUrlFromGithub,
  effectiveReleaseAt,
  isReleased,
  utcToZonedLocal,
  type ClassRole,
  type MaterialAudience,
  type MaterialKind,
  type MaterialLanguage,
} from '@/lib/workspace-materials';

export const materialsDb = prisma as PrismaClient;

const materialInclude = {
  session: { select: { id: true, materialsReleaseAt: true } },
  versions: {
    orderBy: { createdAt: 'desc' },
    include: { uploadedBy: { select: { name: true } } },
  },
} satisfies Prisma.ClassMaterialInclude;

export type LoadedMaterial = Prisma.ClassMaterialGetPayload<{ include: typeof materialInclude }>;

export async function loadMaterial(materialId: string): Promise<LoadedMaterial | null> {
  return materialsDb.classMaterial.findUnique({ where: { id: materialId }, include: materialInclude });
}

export interface MaterialVersionView {
  id: string;
  fileName: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string | null;
}

export interface MaterialView {
  id: string;
  sessionId: string | null;
  kind: MaterialKind;
  titleEn: string;
  titleFr: string | null;
  language: MaterialLanguage;
  audience: MaterialAudience;
  /** When students get it (own time, else the session's); null = already */
  releaseAt: string | null;
  released: boolean;
  downloadable: boolean;
  canDownload: boolean;
  /** Opens in the browser (HTML deck or reading, PDF, image, text) */
  canOpen: boolean;
  externalUrl: string | null;
  colabUrl: string | null;
  /** Relative path of the read-only dataset link, when switched on */
  dataPath: string | null;
  current: MaterialVersionView | null;
  /** Set when the file was replaced after it was first published */
  updatedAt: string | null;
  // Staff only (empty / null for students)
  older: MaterialVersionView[];
  ownReleaseLocal: string;
  githubUrl: string | null;
  order: number;
}

function toVersionView(v: LoadedMaterial['versions'][number]): MaterialVersionView {
  return {
    id: v.id,
    fileName: v.fileName,
    sizeBytes: v.sizeBytes,
    uploadedAt: v.createdAt.toISOString(),
    uploadedBy: v.uploadedBy.name?.trim() || null,
  };
}

export function dataPathFor(material: { publicToken: string | null; versions: { fileName: string }[] }): string | null {
  if (!material.publicToken || material.versions.length === 0) return null;
  return `/api/workspace-q/data/${material.publicToken}/${encodeURIComponent(material.versions[0].fileName)}`;
}

export function toMaterialView(role: ClassRole, m: LoadedMaterial, now = new Date()): MaterialView | null {
  if (!canSeeMaterial(role, m, m.session, now)) return null;
  const staff = role === 'staff';
  const [current, ...older] = m.versions;
  const release = effectiveReleaseAt(m, m.session);
  const isLink = m.kind === 'LINK';
  if (!isLink && !current) return null; // a file material whose upload never finished
  return {
    id: m.id,
    sessionId: m.sessionId,
    kind: m.kind,
    titleEn: m.titleEn,
    titleFr: m.titleFr,
    language: m.language,
    audience: m.audience,
    releaseAt: release?.toISOString() ?? null,
    released: isReleased(release, now),
    downloadable: m.downloadable,
    canDownload: !isLink && canDownloadMaterial(role, m),
    canOpen: !isLink && current !== undefined && inlineContentType(current.fileName) !== null,
    externalUrl: isLink ? m.externalUrl : null,
    colabUrl: m.kind === 'NOTEBOOK' ? colabUrlFromGithub(m.githubUrl) : null,
    dataPath: m.kind === 'DATASET' && (staff || m.audience === 'STUDENTS') ? dataPathFor(m) : null,
    current: current ? toVersionView(current) : null,
    updatedAt: older.length > 0 && current ? current.createdAt.toISOString() : null,
    older: staff ? older.map(toVersionView) : [],
    ownReleaseLocal: staff ? utcToZonedLocal(m.releaseAt) : '',
    githubUrl: m.kind === 'NOTEBOOK' ? m.githubUrl : null,
    order: m.order,
  };
}

export interface SessionView {
  id: string;
  number: number;
  titleEn: string;
  titleFr: string | null;
  startsAt: string | null;
  room: string | null;
  materialsReleaseAt: string | null;
  /** The release time is still ahead (shown to staff) */
  releasePending: boolean;
  /** Interactive learning session of this meeting, if there is one */
  interactiveHref: string | null;
  materials: MaterialView[];
  // Staff only
  startsAtLocal: string;
  releaseLocal: string;
  offeringSessionId: string | null;
}

export interface ToolView {
  id: string;
  label: string;
  url: string;
}

export interface ClassHomeData {
  sessions: SessionView[];
  general: MaterialView[];
  tools: ToolView[];
  /** Staff: interactive sessions of this class a meeting can point to */
  interactiveOptions: { id: string; label: string }[];
}

export async function loadClassHome(offeringId: string, role: ClassRole, now = new Date()): Promise<ClassHomeData> {
  const staff = role === 'staff';
  const [offering, sessions, materials, tools, offeringSessions] = await Promise.all([
    materialsDb.offering.findUniqueOrThrow({ where: { id: offeringId }, select: { slug: true } }),
    materialsDb.classSession.findMany({
      where: { offeringId },
      orderBy: [{ number: 'asc' }, { createdAt: 'asc' }],
      include: { offeringSession: { select: { sessionVersion: { select: { session: { select: { slug: true } } } } } } },
    }),
    materialsDb.classMaterial.findMany({
      where: staff ? { offeringId } : { offeringId, audience: 'STUDENTS' },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: materialInclude,
    }),
    materialsDb.classTool.findMany({ where: { offeringId }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }),
    staff
      ? materialsDb.offeringSession.findMany({
          where: { offeringId },
          orderBy: { order: 'asc' },
          select: { id: true, order: true, sessionVersion: { select: { session: { select: { title: true } } } } },
        })
      : Promise.resolve([]),
  ]);

  const views = materials.map((m) => toMaterialView(role, m, now)).filter((v): v is MaterialView => v !== null);

  return {
    sessions: sessions.map((s) => ({
      id: s.id,
      number: s.number,
      titleEn: s.titleEn,
      titleFr: s.titleFr,
      startsAt: s.startsAt?.toISOString() ?? null,
      room: s.room,
      materialsReleaseAt: s.materialsReleaseAt?.toISOString() ?? null,
      releasePending: !isReleased(s.materialsReleaseAt, now),
      interactiveHref: s.offeringSession
        ? `/workspace-q/${offering.slug}/session/${s.offeringSession.sessionVersion.session.slug}`
        : null,
      materials: views.filter((v) => v.sessionId === s.id),
      startsAtLocal: staff ? utcToZonedLocal(s.startsAt) : '',
      releaseLocal: staff ? utcToZonedLocal(s.materialsReleaseAt) : '',
      offeringSessionId: staff ? s.offeringSessionId : null,
    })),
    general: views.filter((v) => v.sessionId === null),
    tools: tools.map((t) => ({ id: t.id, label: t.label, url: t.url })),
    interactiveOptions: offeringSessions.map((o) => ({
      id: o.id,
      label: `${o.order}. ${o.sessionVersion.session.title}`,
    })),
  };
}
