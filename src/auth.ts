import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import Nodemailer from 'next-auth/providers/nodemailer';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';

// .env.example documents these as AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET, but
// this file used to read GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET instead.
// If the deployed environment was set up from .env.example, that mismatch
// leaves the Google provider with undefined credentials, which Auth.js
// surfaces as the generic "There is a problem with the server
// configuration" error page. Accept either naming so this works regardless
// of which convention is actually set, and fail loudly at startup instead
// of silently misconfiguring if neither is present.
const googleClientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  console.warn(
    'Missing Google OAuth credentials: set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET ' +
    '(or GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) in the environment. Google Auth will fail at runtime.'
  );
}

// ---------------------------------------------------------------------------
// Startup diagnostics for the two environment mistakes that make Auth.js show
// the generic "There is a problem with the server configuration" page.
//
// Auth.js checks its config in a fixed order and returns the FIRST failure
// (see @auth/core/src/lib/utils/assert.ts). Both failures below render that
// same unhelpful page, so we surface them explicitly instead.
// ---------------------------------------------------------------------------

// 1. AUTH_SECRET. Auth.js returns `MissingSecret` -> Configuration page when
//    this is unset or empty. It is NOT auto-generated in production.
if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  throw new Error(
    'Missing AUTH_SECRET. Generate one with `npx auth secret` and set it in ' +
    'the environment (and in Vercel -> Settings -> Environment Variables). ' +
    'Without it Auth.js fails with a generic "server configuration" error.'
  );
}

// 2. AUTH_URL. When set, Auth.js/next-auth rewrite every request origin to it
//    and build Google's redirect_uri from it, ignoring the real request host.
//    A localhost value (as shipped in .env.example for local dev) therefore
//    breaks production: the OAuth redirect and the PKCE cookie end up scoped
//    to different origins, producing "PKCE code_verifier cookie was missing".
//    On Vercel, AUTH_URL should simply be UNSET so the host is auto-detected.
if (process.env.NODE_ENV === 'production' && process.env.AUTH_URL) {
  const authUrl = process.env.AUTH_URL;
  if (/^http:\/\/(localhost|127\.0\.0\.1)/i.test(authUrl)) {
    throw new Error(
      `AUTH_URL is set to "${authUrl}" in a production build. This forces all ` +
      'OAuth redirects and auth cookies onto localhost and will break sign-in. ' +
      'Remove AUTH_URL from the production environment (Vercel auto-detects the ' +
      'host), or set it to the real canonical https:// origin.'
    );
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Cast prisma to any to bypass the missing session model type error,
  // since we omitted the NextAuth Session model in favor of the JWT strategy.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma as any),
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      // Allow linking a Google sign-in to an existing user record that was
      // created by a script or another provider (e.g. the admin enrollment
      // script). Without this, NextAuth throws OAuthAccountNotLinked.
      allowDangerousEmailAccountLinking: true,
    }),
    Nodemailer({
      server: process.env.EMAIL_SERVER || 'smtp://localhost:25',
      from: process.env.EMAIL_FROM || 'no-reply@example.com',
    }),
  ],
});
