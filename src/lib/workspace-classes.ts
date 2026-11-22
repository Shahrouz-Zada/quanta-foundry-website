// =============================================================================
// Workspace Q · classes and pass codes (spec F1, F2) — pure rules, no I/O.
// =============================================================================

/** 8 characters, no look-alikes: nothing that can be mistaken for O/0 or I/1. */
export const JOIN_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const JOIN_CODE_LENGTH = 8;

/** Someone with 5 wrong codes in 15 minutes has to wait. */
export const MAX_FAILED_JOINS = 5;
export const FAILED_JOIN_WINDOW_MS = 15 * 60 * 1000;

/**
 * Builds a code from a source of random integers (crypto.randomInt in
 * production, a fixed source in tests).
 */
export function generateJoinCode(randomInt: (maxExclusive: number) => number): string {
  let code = '';
  for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
    code += JOIN_CODE_ALPHABET[randomInt(JOIN_CODE_ALPHABET.length)];
  }
  return code;
}

/** What a student typed → the stored form. Ignores case, spaces and dashes ("abcd-efgh" works). */
export function normalizeJoinCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Stored form → how it is shown and projected: ABCD-EFGH. */
export function formatJoinCode(code: string): string {
  return code.length === JOIN_CODE_LENGTH ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
}

export function isPlausibleJoinCode(code: string): boolean {
  return code.length === JOIN_CODE_LENGTH && [...code].every((c) => JOIN_CODE_ALPHABET.includes(c));
}

export type JoinCodeStatus = 'off' | 'expired' | 'active';

export function joinCodeStatus(code: string | null, expiresAt: Date | null, now = new Date()): JoinCodeStatus {
  if (!code) return 'off';
  if (expiresAt && expiresAt.getTime() <= now.getTime()) return 'expired';
  return 'active';
}

/** A full name as typed: trimmed, inner spaces collapsed, 2 to 80 characters, no control characters. */
export function cleanFullName(input: string): string | null {
  const name = input.replace(/\s+/g, ' ').trim();
  if (name.length < 2 || name.length > 80) return null;
  if (/[\u0000-\u001f\u007f]/.test(name)) return null;
  return name;
}

/** "DSML · MSc 2027 · Group A" → "dsml-msc-2027-group-a". Always lowercase ASCII. */
export function slugify(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/g, '');
  return slug || 'class';
}

export function isFailedJoinLockout(recentFailures: number): boolean {
  return recentFailures >= MAX_FAILED_JOINS;
}
