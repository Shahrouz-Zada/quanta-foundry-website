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
  throw new Error(
    'Missing Google OAuth credentials: set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET ' +
    '(or GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) in the environment.'
  );
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

