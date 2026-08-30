import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  // Vercel serves this app on more than one host (the stable custom domain,
  // e.g. www.quantafoundry.com, and the auto-generated *.vercel.app
  // deployment URL). Without trustHost, Auth.js builds the Google
  // redirect_uri and the callback URL from a single fixed AUTH_URL, which
  // can end up pointing at a different host than whichever one the user
  // actually started the sign-in flow on. The PKCE cookie set during
  // /api/auth/signin is scoped to that first host, so when Google's
  // redirect lands on a different host, the cookie never arrives —
  // exactly the "PKCE code_verifier cookie was missing" (InvalidCheck)
  // error seen in production. trustHost tells Auth.js to build both the
  // cookie and the redirect_uri from whatever host the request actually
  // came in on, so they always match. Safe here since Vercel's own
  // platform is the one setting the forwarded host header.
  trustHost: true,
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
