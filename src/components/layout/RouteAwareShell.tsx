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

interface Props {
  navbar:    ReactNode;
  footer:    ReactNode;
  chat:      ReactNode;
  children:  ReactNode;
}

export default function RouteAwareShell({ navbar, footer, chat, children }: Props) {
  const pathname = usePathname();
  const suppress = SUPPRESS_CHROME_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

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
