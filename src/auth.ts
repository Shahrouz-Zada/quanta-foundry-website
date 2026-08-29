import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import Nodemailer from 'next-auth/providers/nodemailer';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Cast prisma to any to bypass the missing session model type error,
  // since we omitted the NextAuth Session model in favor of the JWT strategy.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma as any),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
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
