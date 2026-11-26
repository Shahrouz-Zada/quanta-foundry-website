// =============================================================================
// Workspace Q · team discussion threads — pure rules shared by the server and
// the page. No server-only imports.
//
// Three kinds of thread, one per thing:
//   team:<teamId>                         the team's board
//   file:<fileId>                         comments on a student file
//   activity:<activityId>:<ownerKey>      comments on one team's (or student's)
//                                         answer to an activity
// Only the people the thing belongs to and the class staff may read or write.
// =============================================================================

export type ThreadTarget =
  | { kind: 'TEAM'; teamId: string }
  | { kind: 'FILE'; fileId: string }
  | { kind: 'ACTIVITY'; activityId: string; ownerKey: string; ownerTeamId: string | null; ownerUserId: string | null };

const ID = '[A-Za-z0-9_-]{1,64}';
const TEAM_KEY = new RegExp(`^team:(${ID})$`);
const FILE_KEY = new RegExp(`^file:(${ID})$`);
const ACTIVITY_KEY = new RegExp(`^activity:(${ID}):(team|user):(${ID})$`);

export function parseThreadKey(key: unknown): ThreadTarget | null {
  if (typeof key !== 'string' || key.length > 220) return null;
  let m = TEAM_KEY.exec(key);
  if (m) return { kind: 'TEAM', teamId: m[1] };
  m = FILE_KEY.exec(key);
  if (m) return { kind: 'FILE', fileId: m[1] };
  m = ACTIVITY_KEY.exec(key);
  if (m) {
    return {
      kind: 'ACTIVITY',
      activityId: m[1],
      ownerKey: `${m[2]}:${m[3]}`,
      ownerTeamId: m[2] === 'team' ? m[3] : null,
      ownerUserId: m[2] === 'user' ? m[3] : null,
    };
  }
  return null;
}

export const teamThreadKey = (teamId: string) => `team:${teamId}`;
export const fileThreadKey = (fileId: string) => `file:${fileId}`;
export const activityThreadKey = (activityId: string, ownerKey: string) => `activity:${activityId}:${ownerKey}`;

// -----------------------------------------------------------------------------
// Messages
// -----------------------------------------------------------------------------

export const MAX_MESSAGE_CHARS = 4000;
/** Most messages one person may post in RATE_WINDOW_MS (stops accidental floods and spam). */
export const RATE_LIMIT = 20;
export const RATE_WINDOW_MS = 60_000;
/** How many of the latest messages a thread shows when it opens. */
export const INITIAL_MESSAGES = 200;

// Control characters other than tab and line break (the ESC etc. can't appear in a regex literal).
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** The text that is stored, or null when nothing is left to post. */
export function cleanMessage(text: unknown): string | null {
  if (typeof text !== 'string') return null;
  const cleaned = text
    .replace(/\r\n?/g, '\n')
    .replace(CONTROL, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
  return cleaned.length > 0 ? cleaned : null;
}

export type TextPiece = { text: string } | { url: string; text: string };

const URL_RE = /\bhttps?:\/\/[^\s<>"']+/gi;

/**
 * Cuts a message into plain text and web addresses, so the page can make the
 * addresses clickable without ever inserting HTML. Trailing punctuation is not
 * part of the address ("see https://x.org." → the dot stays text).
 */
export function linkify(text: string): TextPiece[] {
  const out: TextPiece[] = [];
  let last = 0;
  for (const m of text.matchAll(URL_RE)) {
    let url = m[0];
    // Drop punctuation that ends the sentence, and closing brackets that have no opening one in the address.
    for (;;) {
      const last = url[url.length - 1];
      if (/[.,;:!?]/.test(last)) url = url.slice(0, -1);
      else if (last === ')' && (url.match(/\)/g) ?? []).length > (url.match(/\(/g) ?? []).length) url = url.slice(0, -1);
      else if (last === ']' && (url.match(/\]/g) ?? []).length > (url.match(/\[/g) ?? []).length) url = url.slice(0, -1);
      else break;
    }
    const start = m.index ?? 0;
    if (start > last) out.push({ text: text.slice(last, start) });
    out.push({ url, text: url });
    last = start + url.length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

// -----------------------------------------------------------------------------
// How often an open thread asks for new messages
// -----------------------------------------------------------------------------

/** While people are writing (a message in the last two minutes, or you typing). */
export const POLL_ACTIVE_MS = 3_000;
/** When the conversation is quiet. */
export const POLL_QUIET_MS = 10_000;
export const QUIET_AFTER_MS = 120_000;
/**
 * Each check asks for everything changed since a little before the previous
 * one, so a message saved at the same moment, or a small difference between
 * clocks, is never missed. The page merges by message id.
 */
export const POLL_OVERLAP_MS = 15_000;

/** Milliseconds until the next check, or null to pause (tab hidden). */
export function nextPollDelay(lastActivityMs: number, nowMs: number, visible: boolean): number | null {
  if (!visible) return null;
  return nowMs - lastActivityMs < QUIET_AFTER_MS ? POLL_ACTIVE_MS : POLL_QUIET_MS;
}

/** What the page shows for one message. Never contains an email address. */
export interface MessageView {
  id: string;
  authorId: string;
  authorName: string | null;
  /** The author is staff of this class (shown as "Instructor"). */
  authorIsStaff: boolean;
  /** Empty once deleted. */
  body: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Adds or replaces messages by id and keeps them in time order. */
export function mergeMessages(current: MessageView[], incoming: MessageView[]): MessageView[] {
  if (incoming.length === 0) return current;
  const byId = new Map(current.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}
