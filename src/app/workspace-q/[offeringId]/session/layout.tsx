// =============================================================================
// Dynamic Session Layout
// Wraps ALL /workspace-q/[offeringId]/session/* routes.
// Mirrors the learning-sessions layout: I18nProvider, ThemeProvider,
// BreadcrumbProvider, WorkspaceQHeader.
// =============================================================================

import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { I18nProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';
import { BreadcrumbProvider } from '@/lib/breadcrumb-context';
import WorkspaceQHeader from '@/components/session/WorkspaceQHeader';

export default function OfferingSessionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <I18nProvider>
      <ThemeProvider className="min-h-screen flex flex-col">
        <BreadcrumbProvider>
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
