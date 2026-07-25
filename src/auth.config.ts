import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/workspace-q', // Redirect back to workspace dashboard for login
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
