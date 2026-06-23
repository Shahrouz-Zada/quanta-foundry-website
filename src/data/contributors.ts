/**
 * contributors.ts
 *
 * Static contributor data for Phase 1.
 *
 * PRIVACY RULES:
 * - All contributors use placeholder aliases, never real names.
 * - isPublic: false by default — no name is rendered anywhere.
 * - profileVisibility: 'private' by default.
 * - publicConsentAt is only set when a contributor has explicitly given consent.
 * - internalPoints is tracked internally but NEVER shown publicly.
 * - Email addresses are NEVER stored in this file — admin-only, handled separately.
 *
 * CMS migration note: Each object maps directly to a 'contributors' CMS collection document.
 */

import { Contributor } from '@/types';

export const contributors: Contributor[] = [
  {
    id: 'contrib-001',
    displayName: 'QF Contributor 01',
    isPublic: false,
    profileVisibility: 'private',
    tier: 'founding-contributor',
    contributorRole: 'Applied AI',
    badges: ['first-submission', 'peer-reviewer', 'milestone-reached'],
    joinedDate: '2024-09-01',
    internalPoints: 320, // INTERNAL ONLY
    createdAt: '2024-09-01',
    updatedAt: '2025-03-15',
  },
  {
    id: 'contrib-002',
    displayName: 'Quant Contributor',
    isPublic: false,
    profileVisibility: 'private',
    tier: 'core-contributor',
    contributorRole: 'Quantitative Finance',
    badges: ['first-submission', 'peer-reviewer'],
    joinedDate: '2024-10-15',
    internalPoints: 185, // INTERNAL ONLY
    createdAt: '2024-10-15',
    updatedAt: '2025-02-20',
  },
  {
    id: 'contrib-003',
    displayName: 'AI Contributor',
    isPublic: false,
    profileVisibility: 'private',
    tier: 'contributor',
    contributorRole: 'Applied AI',
    badges: ['first-submission'],
    joinedDate: '2025-01-10',
    internalPoints: 90, // INTERNAL ONLY
    createdAt: '2025-01-10',
    updatedAt: '2025-04-05',
  },
  {
    id: 'contrib-004',
    displayName: 'Research Contributor',
    isPublic: false,
    profileVisibility: 'private',
    tier: 'contributor',
    contributorRole: 'Complex Systems',
    badges: ['first-submission'],
    joinedDate: '2025-02-01',
    internalPoints: 70, // INTERNAL ONLY
    createdAt: '2025-02-01',
    updatedAt: '2025-05-10',
  },
  {
    id: 'contrib-005',
    displayName: 'Contributor A',
    isPublic: false,
    profileVisibility: 'private',
    tier: 'observer',
    badges: [],
    joinedDate: '2025-04-20',
    internalPoints: 15, // INTERNAL ONLY
    createdAt: '2025-04-20',
    updatedAt: '2025-04-20',
  },
];

// Convenience: count contributors per tier (for community stats display)
export function getTierCounts(contribs: Contributor[]): Record<Contributor['tier'], number> {
  return contribs.reduce(
    (acc, c) => {
      acc[c.tier] = (acc[c.tier] ?? 0) + 1;
      return acc;
    },
    {} as Record<Contributor['tier'], number>
  );
}
