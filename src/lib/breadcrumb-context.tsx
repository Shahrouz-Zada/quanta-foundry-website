'use client';
// =============================================================================
// BreadcrumbContext — lets SessionLayout push the current breadcrumb
// upward to WorkspaceQHeader without prop-drilling through the Next.js layout.
// =============================================================================

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export interface BreadcrumbInfo {
  track:         string; // e.g. "Finance, Data & AI"
  sessionLabel:  string; // e.g. "Session 01"
  stageLabel:    string; // e.g. "Prepare" (translated)
}

interface BreadcrumbContextValue extends BreadcrumbInfo {
  setBreadcrumb: (info: BreadcrumbInfo) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  track:         '',
  sessionLabel:  '',
  stageLabel:    '',
  setBreadcrumb: () => {},
});

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<BreadcrumbInfo>({
    track:        '',
    sessionLabel: '',
    stageLabel:   '',
  });

  const setBreadcrumb = useCallback((next: BreadcrumbInfo) => {
    setInfo(next);
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ ...info, setBreadcrumb }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  return useContext(BreadcrumbContext);
}
