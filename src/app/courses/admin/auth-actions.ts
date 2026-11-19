'use server';

import { signOut } from '@/auth';

const ADMIN_SIGNIN_URL = `/workspace-q/signin?callbackUrl=${encodeURIComponent('/courses/admin')}`;

/**
 * Signs the current user out and sends them straight back to the sign-in page,
 * so they can pick a different Google account for the courses admin page.
 * Google always shows its account chooser (see `prompt: 'select_account'` in
 * src/auth.ts), so the previous account isn't silently reused.
 */
export async function switchAccount() {
  await signOut({ redirectTo: ADMIN_SIGNIN_URL });
}

/** Signs the current user out and returns them to the public Courses page. */
export async function signOutToCourses() {
  await signOut({ redirectTo: '/courses' });
}
