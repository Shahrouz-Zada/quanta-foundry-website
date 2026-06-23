/**
 * activities.ts
 *
 * Static recent activity feed for the Workspace Q Contribution Board.
 *
 * WRITING RULES — MANDATORY:
 * - All descriptions must be written in neutral, non-personal language.
 * - Never use names, initials, or any identifier that could link to a real person.
 * - Good: "A new notebook was submitted to the Applied AI track."
 * - Good: "A project note was reviewed in Quantitative Finance."
 * - Bad:  "Alice M. submitted a notebook." ← Never do this.
 * - Bad:  "Contributor 01 reviewed a project." ← Avoid person-linking.
 *
 * CMS migration note: Each object maps to an 'activities' CMS collection document.
 */

import { Activity } from '@/types';

export const recentActivities: Activity[] = [
  {
    id: 'act-001',
    type: 'submission',
    description: 'A new prototype notebook was submitted to the Applied AI track.',
    date: '2025-06-18',
    internalPoints: 30, // INTERNAL ONLY
  },
  {
    id: 'act-002',
    type: 'review',
    description: 'A project note in Quantitative Finance received a peer review.',
    date: '2025-06-15',
    internalPoints: 40, // INTERNAL ONLY
  },
  {
    id: 'act-003',
    type: 'revision',
    description: 'An applied research summary was revised and marked as Reviewed.',
    date: '2025-06-12',
    projectId: 'fractal-regime-detection',
    internalPoints: 15, // INTERNAL ONLY
  },
  {
    id: 'act-004',
    type: 'note',
    description: 'A new technical note was added to the Complex Systems area.',
    date: '2025-06-08',
    internalPoints: 20, // INTERNAL ONLY
  },
  {
    id: 'act-005',
    type: 'milestone',
    description: 'The community reached 5 curated contributions across all tracks.',
    date: '2025-06-01',
    internalPoints: 0, // Community milestone — not attributed to a single contributor
  },
];

// Returns at most `limit` activities, sorted by most recent first
export function getRecentActivities(
  activities: Activity[],
  limit: number = 5
): Activity[] {
  return [...activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
