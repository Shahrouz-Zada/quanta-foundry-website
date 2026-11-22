// =============================================================================
// Workspace Q · student files (spec F10) — pure helpers and permission rules.
//
// No server-only imports: the same rules are used by the server (which
// enforces them on every request) and by the page (which only uses them to
// decide which buttons to show).
// =============================================================================

import { fileExtension, safeBlobFileName } from '@/lib/course-files';

export const MAX_STUDENT_FILE_BYTES = 20 * 1024 * 1024; // spec: 20 MB for students
export const STUDENT_FILE_PREFIX = 'workspace';

/** Storage quota per student (personal files) and per team (team files). */
export function storageQuotaBytes(): number {
  const mb = Number(process.env.WORKSPACE_FILE_QUOTA_MB);
  return (Number.isFinite(mb) && mb > 0 ? mb : 200) * 1024 * 1024;
}

export type ShareLevel = 'STAFF' | 'TEAM' | 'CLASS';
export const SHARE_LEVELS: readonly ShareLevel[] = ['STAFF', 'TEAM', 'CLASS'];

/** Who is looking, in this class. */
export interface FileViewer {
  userId: string;
  /** staff = INSTRUCTOR enrolment or platform ADMIN; observer = OBSERVER enrolment. */
  role: 'staff' | 'learner' | 'observer';
  /** The viewer's team in this class, if any. */
  teamId: string | null;
}

/** What the rules need to know about a file. */
export interface FileAccessFacts {
  ownerId: string;
  /** Set for a team file. */
  teamId: string | null;
  shareLevel: ShareLevel;
  /** The owner's current team in this class (matters for a personal file shared with "my team"). */
  ownerTeamId: string | null;
}

export function canViewFile(viewer: FileViewer, file: FileAccessFacts): boolean {
  if (viewer.role === 'staff') return true;
  if (file.shareLevel === 'CLASS') return true; // anyone enrolled in this class
  if (viewer.role !== 'learner') return false;
  if (file.teamId) return viewer.teamId === file.teamId;
  if (file.ownerId === viewer.userId) return true;
  return file.shareLevel === 'TEAM' && viewer.teamId !== null && viewer.teamId === file.ownerTeamId;
}

/** Rename, change the sharing level, upload a new version. Staff don't edit students' work. */
export function canEditFile(viewer: FileViewer, file: FileAccessFacts): boolean {
  if (viewer.role !== 'learner') return false;
  if (file.teamId) return viewer.teamId === file.teamId;
  return file.ownerId === viewer.userId;
}

/** Staff can delete any file (F10.6); a student only the files they created. */
export function canDeleteFile(viewer: FileViewer, file: FileAccessFacts): boolean {
  if (viewer.role === 'staff') return true;
  if (viewer.role !== 'learner') return false;
  if (file.ownerId !== viewer.userId) return false;
  // A team file stays the team's: its creator can delete it only while still in that team.
  return file.teamId ? viewer.teamId === file.teamId : true;
}

/** Older versions are visible to the people who can edit the file, and to staff. */
export function canSeeVersions(viewer: FileViewer, file: FileAccessFacts): boolean {
  return viewer.role === 'staff' || canEditFile(viewer, file);
}

/** Most uploads a student may have started but not saved within an hour. */
export const MAX_PENDING_UPLOADS = 20;
/** Unsaved uploads older than this are swept and their stored file deleted. */
export const PENDING_UPLOAD_TTL_MS = 60 * 60 * 1000;

/** Sharing levels that make sense for a file. A team file is always visible to its team. */
export function allowedShareLevels(isTeamFile: boolean): ShareLevel[] {
  return isTeamFile ? ['TEAM', 'CLASS'] : ['STAFF', 'TEAM', 'CLASS'];
}

// -----------------------------------------------------------------------------
// Storage paths: workspace/<offeringId>/<uuid>/<file name>
// -----------------------------------------------------------------------------

export function buildStudentBlobPathname(offeringId: string, uuid: string, fileName: string): string {
  return `${STUDENT_FILE_PREFIX}/${offeringId}/${uuid}/${safeBlobFileName(fileName)}`;
}

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'; // crypto.randomUUID() is lowercase

export function isValidStudentBlobPathname(pathname: string, offeringId: string): boolean {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(offeringId)) return false;
  const match = new RegExp(`^${STUDENT_FILE_PREFIX}/${offeringId}/${UUID}/([A-Za-z0-9._-]{1,200})$`).exec(pathname);
  // The file name is a single path segment; "." and ".." are not file names.
  return match !== null && match[1] !== '.' && match[1] !== '..';
}

// -----------------------------------------------------------------------------
// Serving files safely
// -----------------------------------------------------------------------------

const INLINE_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  txt: 'text/plain; charset=utf-8',
  csv: 'text/plain; charset=utf-8',
  md: 'text/plain; charset=utf-8',
  html: 'text/html; charset=utf-8',
  htm: 'text/html; charset=utf-8',
};

/**
 * How a file may be opened in the browser. The type comes from the file
 * extension, never from what the uploader's browser claimed. Anything not
 * listed (including SVG, which can carry scripts) is only ever downloaded.
 */
export function inlineContentType(fileName: string): string | null {
  return INLINE_TYPES[fileExtension(fileName)] ?? null;
}

export function isHtmlFile(fileName: string): boolean {
  const ext = fileExtension(fileName);
  return ext === 'html' || ext === 'htm';
}

/** RFC 6266 Content-Disposition with a plain-ASCII fallback name. */
export function contentDisposition(kind: 'inline' | 'attachment', fileName: string): string {
  const ascii = fileName.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
  return `${kind}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
