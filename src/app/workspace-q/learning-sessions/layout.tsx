// =============================================================================
// Learning Sessions Nested Layout — Prototype
// Wraps ALL /workspace-q/learning-sessions/* routes.
// Provides: I18nProvider, ThemeProvider, BreadcrumbProvider, WorkspaceQHeader.
// The global Navbar/Footer/ChatAssistant are suppressed by RouteAwareShell
// (in the root layout) for these routes — elements are absent from the DOM.
// =============================================================================

import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { I18nProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';
import { BreadcrumbProvider } from '@/lib/breadcrumb-context';
import WorkspaceQHeader from '@/components/session/WorkspaceQHeader';

export default function LearningSessionsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <I18nProvider>
      {/*
        ThemeProvider wraps the entire visible area (header + content).
        data-wq-theme is applied to an inner div so CSS variable scope
        covers every descendant without touching <html> or <body>.
        The className ensures minimum screen height for the session environment.
      */}
      <ThemeProvider className="min-h-screen flex flex-col">
        <BreadcrumbProvider>
          {/*
            WorkspaceQHeader is a client component. Suspense is required because
            it calls useSearchParams() internally.
          */}
          <Suspense fallback={
            <div
              className="fixed top-0 left-0 right-0 z-[60] h-14
                         bg-[var(--wq-shell)] border-b border-[var(--wq-shell-border)]"
              aria-hidden="true"
            />
          }>
            <WorkspaceQHeader />
          </Suspense>

          {/* Content offset for the 56 px fixed header */}
          <div className="flex-1 flex flex-col pt-[var(--wq-header-h)]">
            {children}
          </div>
        </BreadcrumbProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
