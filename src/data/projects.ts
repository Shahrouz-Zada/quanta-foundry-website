/**
 * projects.ts
 *
 * Static curated project and notes data for Phase 1.
 *
 * VISIBILITY RULES — use helpers from @/lib/project-utils, never inline checks:
 *   isPublicWebProject(p)         → renders on /projects
 *   isWorkspaceVisibleProject(p)  → renders inside Workspace Q
 *
 * STATUS PIPELINE:
 *   draft → internal → reviewed → public-web → (archived if needed)
 *
 * ADDING A NEW PROJECT:
 *   1. Set approvalStatus: 'draft' initially.
 *   2. Set reviewedBy only after internal review.
 *   3. Set approvalStatus: 'public-web' and publishedAt only after explicit approval.
 *   4. Never set codeVisibility: 'public' or dataSensitivity: 'high' together.
 *
 * CMS migration note: Each object maps to a 'projects_notes' CMS collection document.
 */

import { ProjectNote } from '@/types';

export const projectsAndNotes: ProjectNote[] = [
  {
    // ------------------------------------------------------------------
    // Rolling Fractal Dimension — Internal demo project
    // Status: 'internal' — visible in Workspace Q, NOT on public /projects
    // ------------------------------------------------------------------
    id: 'fractal-regime-detection',
    slug: 'rolling-fractal-dimension-market-regime',
    title: 'Rolling Fractal Dimension for Market Regime Detection',
    shortDescription:
      'A prototype notebook exploring fractal indicators as early-warning signals for financial market regime shifts.',
    longDescription:
      'This project investigates whether rolling estimates of fractal dimension — ' +
      'a measure of self-similarity in time-series data — can serve as statistically ' +
      'meaningful early-warning signals for transitions between market regimes (e.g., ' +
      'trending vs. mean-reverting environments). The prototype is implemented in Python ' +
      'using standard quantitative finance libraries and tested on synthetic and historical ' +
      'equity index data.',
    domain: 'quantitative-finance',
    outputType: 'prototype-notebook',
    tags: ['fractals', 'market-regimes', 'time-series', 'python', 'regime-detection'],
    approvalStatus: 'internal',
    reviewedBy: undefined,
    publishedAt: undefined,
    contributorIds: ['contrib-001', 'contrib-002'],
    githubUrl: undefined, // Not yet public
    articleUrl: undefined,
    notebookUrl: '#',     // Placeholder — internal access only
    codeVisibility: 'internal',
    dataSensitivity: 'none',
    license: 'Internal Use Only',
    createdAt: '2025-03-01',
    updatedAt: '2025-06-12',
  },
];

// =============================================================================
// Utility: get all public-web projects (use for /projects page)
// NOTE: prefer importing isPublicWebProject from @/lib/project-utils instead
// of duplicating the logic here.
// =============================================================================
export { projectsAndNotes as default };
