'use client';
// =============================================================================
// RouteAwareShell — route-conditional public chrome
// Suppresses Navbar, Footer, and ChatAssistant on Workspace Q app routes.
// Uses usePathname() — works during SSR so initial HTML is also correct.
// Keyboard-safe: suppressed elements are not in the DOM at all.
// =============================================================================

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

// Routes on which the full public website chrome is suppressed
const SUPPRESS_CHROME_PREFIXES = ['/workspace-q/learning-sessions'];
// Dynamic offering routes: /workspace-q/<offeringId>/session/<sessionSlug> and /workspace-q/<offeringId>/files and /manage
const SUPPRESS_CHROME_PATTERN = /^\/workspace-q\/[^/]+\/(session\/|files(\/|$)|manage(\/|$)|materials\/|activities\/|discussion(\/|$))/;
// The class home page /workspace-q/<offeringId> (but not the fixed pages next to it)
const CLASS_HOME_PATTERN = /^\/workspace-q\/(?!join$|signin$|classes$|learning-sessions$|teach$)[^/]+\/?$/;

interface Props {
  navbar:    ReactNode;
  footer:    ReactNode;
  chat:      ReactNode;
  children:  ReactNode;
}

export default function RouteAwareShell({ navbar, footer, chat, children }: Props) {
  const pathname = usePathname();
  const suppress =
    SUPPRESS_CHROME_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    SUPPRESS_CHROME_PATTERN.test(pathname) ||
    CLASS_HOME_PATTERN.test(pathname);

  return (
    <>
      {!suppress && navbar}
      {/*
        The root layout wraps children in <main>. When suppress is true
        the WQ nested layout provides its own structure inside this slot.
      */}
      <main>{children}</main>
      {!suppress && footer}
      {!suppress && chat}
    </>
  );
}
