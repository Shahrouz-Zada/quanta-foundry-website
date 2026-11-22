// =============================================================================
// Workspace Q · sessions, materials library and tools (spec F1.3, F4, F5)
// Pure rules, no I/O: shared by the server, the pages and the tests.
// =============================================================================

import { fileExtension, safeBlobFileName, titleFromFileName } from '@/lib/course-files';

export type MaterialKind = 'DECK' | 'PREREAD' | 'NOTEBOOK' | 'DATASET' | 'DOCUMENT' | 'LINK';
export type MaterialLanguage = 'EN' | 'FR' | 'BOTH';
export type MaterialAudience = 'STUDENTS' | 'STAFF';
export type ClassRole = 'staff' | 'learner' | 'observer';

export const MATERIAL_KINDS: readonly MaterialKind[] = ['DECK', 'PREREAD', 'NOTEBOOK', 'DATASET', 'DOCUMENT', 'LINK'];
export const FILE_KINDS: readonly MaterialKind[] = ['DECK', 'PREREAD', 'NOTEBOOK', 'DATASET', 'DOCUMENT'];

/** Materials are uploaded by staff; datasets and decks can be large. */
export const MAX_MATERIAL_BYTES = 100 * 1024 * 1024;

/** The course runs in France: dates are entered and shown in Paris time. */
export const CLASS_TIME_ZONE = 'Europe/Paris';

// -----------------------------------------------------------------------------
// Guessing type, title and audience from a file name
// -----------------------------------------------------------------------------

export function guessMaterialKind(fileName: string): MaterialKind {
  const ext = fileExtension(fileName);
  const name = fileName.toLowerCase();
  if (ext === 'ipynb') return 'NOTEBOOK';
  if (['csv', 'xlsx', 'xls', 'parquet', 'json', 'tsv'].includes(ext)) return 'DATASET';
  if (ext === 'html' || ext === 'htm') {
    return /pre[-_ ]?read|reading|lecture|article/.test(name) ? 'PREREAD' : 'DECK';
  }
  if (ext === 'pdf' && /pre[-_ ]?read|reading|lecture|article/.test(name)) return 'PREREAD';
  return 'DOCUMENT';
}

/** Names that suggest a file is for the instructor only (solutions, guides…). Upload defaults to staff-only for these. */
export function looksStaffOnly(fileName: string): boolean {
  return /solution|answer|corrig|instructor|enseignant|run[-_ ]?of[-_ ]?show|facilitator|teacher|key[-_ ]?(?:answers?|sheet)|answer[-_ ]?key|staff/i.test(
    fileName,
  );
}

export function materialTitleFromFileName(fileName: string): string {
  return titleFromFileName(fileName).replace(/-/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200) || 'Untitled';
}

// -----------------------------------------------------------------------------
// Who sees what, and when (F4.2, F4.6)
// -----------------------------------------------------------------------------

/** A material's own release time wins; otherwise its session's; none means visible at once. */
export function effectiveReleaseAt(material: { releaseAt: Date | null }, session: { materialsReleaseAt: Date | null } | null): Date | null {
  return material.releaseAt ?? session?.materialsReleaseAt ?? null;
}

export function isReleased(releaseAt: Date | null, now = new Date()): boolean {
  return releaseAt === null || releaseAt.getTime() <= now.getTime();
}

/** Staff see everything. Students and observers see only student materials that are released. */
export function canSeeMaterial(
  role: ClassRole,
  material: { audience: MaterialAudience; releaseAt: Date | null },
  session: { materialsReleaseAt: Date | null } | null,
  now = new Date(),
): boolean {
  if (role === 'staff') return true;
  return material.audience === 'STUDENTS' && isReleased(effectiveReleaseAt(material, session), now);
}

/** Download as a file. Staff always may; students only when the instructor allowed it. */
export function canDownloadMaterial(role: ClassRole, material: { downloadable: boolean }): boolean {
  return role === 'staff' || material.downloadable;
}

// -----------------------------------------------------------------------------
// Storage paths: materials/<offeringId>/<uuid>/<file name>
// (student files use workspace/…; the two never mix)
// -----------------------------------------------------------------------------

export const MATERIAL_PREFIX = 'materials';
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

export function buildMaterialPathname(offeringId: string, uuid: string, fileName: string): string {
  return `${MATERIAL_PREFIX}/${offeringId}/${uuid}/${safeBlobFileName(fileName)}`;
}

export function isValidMaterialPathname(pathname: string, offeringId: string): boolean {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(offeringId)) return false;
  const match = new RegExp(`^${MATERIAL_PREFIX}/${offeringId}/${UUID}/([A-Za-z0-9._-]{1,200})$`).exec(pathname);
  return match !== null && match[1] !== '.' && match[1] !== '..';
}

// -----------------------------------------------------------------------------
// Links: external materials, tools, Colab (F5)
// -----------------------------------------------------------------------------

/** Only plain https (or http) addresses; never javascript:, data: and the like. */
export function cleanHttpUrl(input: string): string | null {
  const value = input.trim();
  if (value.length === 0 || value.length > 2000) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (!url.hostname || url.username || url.password) return null;
  return url.toString();
}

/**
 * Open in Colab from a notebook on public GitHub (F5.1).
 * https://github.com/<owner>/<repo>/blob/<branch>/<path>.ipynb
 *   → https://colab.research.google.com/github/<owner>/<repo>/blob/<branch>/<path>.ipynb
 * Anything else gives null (the page then offers Download with instructions).
 */
export function colabUrlFromGithub(githubUrl: string | null | undefined): string | null {
  if (!githubUrl) return null;
  const clean = cleanHttpUrl(githubUrl);
  if (!clean) return null;
  const url = new URL(clean);
  if (url.protocol !== 'https:' || url.hostname !== 'github.com') return null;
  const m = /^\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/blob\/(.+\.ipynb)$/.exec(url.pathname);
  if (!m) return null;
  return `https://colab.research.google.com/github/${m[1]}/${m[2]}/blob/${m[3]}`;
}

/** A 32-character random token for a dataset link (F5.2), from a source of random bytes. */
export function makePublicToken(randomBytes: (n: number) => Uint8Array): string {
  const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';
  return Array.from(randomBytes(32), (b) => alphabet[b % 32]).join('');
}

export function isPlausiblePublicToken(token: string): boolean {
  return /^[a-km-np-z2-9]{32}$/.test(token);
}

// -----------------------------------------------------------------------------
// Paris time <-> UTC (dates are typed and shown as Paris local time)
// -----------------------------------------------------------------------------

function zoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { y: get('year'), mo: get('month'), d: get('day'), h: get('hour'), mi: get('minute'), s: get('second') };
}

/** 2027-01-12T09:30 typed as Paris time → the UTC instant. null for anything that isn't such a value. */
export function zonedLocalToUtc(local: string, timeZone = CLASS_TIME_ZONE): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local.trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59) return null;
  const wanted = Date.UTC(y, mo - 1, d, h, mi);
  // Start from the wall time read as UTC, then correct by the zone offset (twice, for DST edges).
  let guess = wanted;
  for (let i = 0; i < 3; i++) {
    const p = zoneParts(new Date(guess), timeZone);
    const shown = Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi);
    const diff = wanted - shown;
    if (diff === 0) break;
    guess += diff;
  }
  const check = zoneParts(new Date(guess), timeZone);
  if (check.y !== y || check.mo !== mo || check.d !== d) return null; // e.g. 31 February
  return new Date(guess);
}

/** UTC instant → "2027-01-12T09:30" in Paris time (for date inputs). */
export function utcToZonedLocal(date: Date | null, timeZone = CLASS_TIME_ZONE): string {
  if (!date) return '';
  const p = zoneParts(date, timeZone);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${p.y}-${pad(p.mo)}-${pad(p.d)}T${pad(p.h)}:${pad(p.mi)}`;
}

/** "Tue 12 Jan 2027, 09:30" in Paris time, in English or French. Same text on server and browser. */
export function formatClassDate(iso: string | Date | null, lang: 'en' | 'fr' = 'en', withTime = true): string {
  if (!iso) return '';
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    timeZone: CLASS_TIME_ZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' as const } : {}),
  }).format(date);
}

/** Title in the reader's language, falling back to English. */
export function pickTitle(item: { titleEn: string; titleFr: string | null }, lang: 'en' | 'fr'): string {
  return (lang === 'fr' && item.titleFr?.trim()) || item.titleEn;
}
