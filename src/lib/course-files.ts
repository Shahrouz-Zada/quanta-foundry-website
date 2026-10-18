// =============================================================================
// Course materials: small pure helpers shared by the public page, the admin
// page and the API routes. No server-only imports here, so the client
// components can use them too.
// =============================================================================

/** Largest file the admin page accepts (200 MB). */
export const MAX_COURSE_FILE_BYTES = 200 * 1024 * 1024;

/**
 * Files above this size are not streamed through our own server for
 * "Open in browser": they're sent straight to download instead.
 */
export const MAX_INLINE_VIEW_BYTES = 25 * 1024 * 1024;

/** Pathname prefix for every course file stored in Vercel Blob. */
export const COURSE_BLOB_PREFIX = 'courses';

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 || value >= 10 ? 0 : 1;
  return `${value.toFixed(digits)} ${units[unit]}`;
}

export function fileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  if (dot <= 0 || dot === fileName.length - 1) return '';
  return fileName.slice(dot + 1).toLowerCase();
}

/** Short label shown on the file badge, e.g. "HTML", "PDF". */
export function fileTypeLabel(fileName: string): string {
  const ext = fileExtension(fileName);
  return ext ? ext.toUpperCase().slice(0, 5) : 'FILE';
}

/**
 * Whether a file can be opened in the browser through our view route, and
 * how. Only HTML decks and PDFs: everything else is download-only.
 */
export function inlineViewKind(fileName: string, contentType?: string | null): 'html' | 'pdf' | null {
  const ext = fileExtension(fileName);
  const type = (contentType ?? '').toLowerCase();
  if (ext === 'html' || ext === 'htm' || type.startsWith('text/html')) return 'html';
  if (ext === 'pdf' || type === 'application/pdf') return 'pdf';
  return null;
}

/** "Session_1 deck.html" -> "Session 1 deck" — default title for an upload. */
export function titleFromFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, '');
  const spaced = base.replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
  return spaced || fileName;
}

/**
 * Makes a file name safe to use as the last segment of a blob pathname,
 * while keeping it readable (it becomes the downloaded file's name).
 */
export function safeBlobFileName(fileName: string): string {
  const cleaned = fileName
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9._ -]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+/, '')
    .slice(-120);
  return cleaned || 'file';
}

/**
 * Pathname layout: courses/<courseId>/<random uuid>/<file name>.
 * The random folder makes the public URL unguessable and lets the file keep
 * its original name when downloaded.
 */
export function buildCourseBlobPathname(courseId: string, uuid: string, fileName: string): string {
  return `${COURSE_BLOB_PREFIX}/${courseId}/${uuid}/${safeBlobFileName(fileName)}`;
}

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

/** Checks a pathname has exactly the layout above, for the given course. */
export function isValidCourseBlobPathname(pathname: string, courseId: string): boolean {
  if (!/^[A-Za-z0-9_-]+$/.test(courseId)) return false;
  const re = new RegExp(`^${COURSE_BLOB_PREFIX}/${courseId}/${UUID}/[A-Za-z0-9._ -]+$`);
  return re.test(pathname);
}

/** Only accept URLs that point at a public Vercel Blob store. */
export function isVercelBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

/** Vercel Blob serves a file as an attachment when ?download=1 is added. */
export function blobDownloadUrl(blobUrl: string): string {
  const url = new URL(blobUrl);
  url.searchParams.set('download', '1');
  return url.toString();
}

/**
 * Returns a new array with `movingId` moved one step up or down, or the
 * same array (identical reference) if it can't move.
 */
export function moveInList(list: string[], movingId: string, dir: 'up' | 'down'): string[] {
  const index = list.indexOf(movingId);
  const target = dir === 'up' ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

// Link-preview fetchers, crawlers and scripts shouldn't inflate the stats.
const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|slack|skype|linkedin|curl|wget|python|java\/|go-http|httpclient|axios|node-fetch|headless|lighthouse|pingdom|uptime|monitor/i;

export function isLikelyBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  return BOT_PATTERN.test(userAgent);
}
