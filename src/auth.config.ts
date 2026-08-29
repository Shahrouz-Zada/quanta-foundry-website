import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    // A real sign-in page that reads `callbackUrl` and forwards it into
    // signIn('google', { callbackUrl }) — see src/app/workspace-q/signin/page.tsx.
    // This used to point at '/workspace-q' (the plain dashboard), which has
    // no sign-in UI and doesn't read callbackUrl, so the deep-linked
    // destination was silently dropped on every login.
    signIn: '/workspace-q/signin',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isTeachRoute = nextUrl.pathname.startsWith('/workspace-q/teach');
      
      // Basic route protection for instructor routes
      if (isTeachRoute) {
        // We handle specific role checks in the DAL, but we can block unauthenticated users here
        if (!isLoggedIn) return false;
      }
      return true;
    },
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: { strategy: 'jwt' },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
