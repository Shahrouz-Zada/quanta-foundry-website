/**
 * project-utils.ts
 *
 * Centralised visibility and display helpers for Projects & Notes and Contributors.
 *
 * Visibility semantics:
 *   draft      → project owner / admin only
 *   internal   → registered Workspace Q members only
 *   reviewed   → approved internally, NOT yet on public web
 *   public-web → visible on /projects, shareable (CV, LinkedIn)
 *   archived   → hidden from all normal display
 *
 * IMPORTANT: Always use these helpers when deciding what to render.
 * Never inline `approvalStatus` checks — future CMS migration will only
 * need to update these functions.
 */

import {
  ProjectNote,
  Contributor,
} from '@/types';

// =============================================================================
// Project Visibility Guards
// =============================================================================

/**
 * Returns true only for projects that should appear on the public /projects page
 * and individual /projects/[slug] pages.
 * Only 'public-web' status qualifies.
 */
export function isPublicWebProject(project: ProjectNote): boolean {
  return project.approvalStatus === 'public-web';
}

/**
 * Returns true for projects visible inside Workspace Q to registered members.
 * Includes: internal, reviewed, and public-web (but NOT draft or archived).
 */
export function isWorkspaceVisibleProject(project: ProjectNote): boolean {
  return (
    project.approvalStatus === 'internal' ||
    project.approvalStatus === 'reviewed' ||
    project.approvalStatus === 'public-web'
  );
}

/**
 * Returns true for projects that are draft-only (owner/admin visibility only).
 */
export function isDraftProject(project: ProjectNote): boolean {
  return project.approvalStatus === 'draft';
}

/**
 * Returns true for archived projects (hidden from all normal display).
 */
export function isArchivedProject(project: ProjectNote): boolean {
  return project.approvalStatus === 'archived';
}

// =============================================================================
// Project Output Type Labels
// =============================================================================

const OUTPUT_TYPE_LABELS: Record<ProjectNote['outputType'], string> = {
  'curated-project':           'Curated Project',
  'technical-note':            'Technical Note',
  'prototype-notebook':        'Prototype Notebook',
  'applied-research-summary':  'Applied Research Summary',
  'workspace-q-output':        'Built through Workspace Q',
};

/**
 * Returns the human-readable badge label for a project's output type.
 */
export function getOutputTypeLabel(outputType: ProjectNote['outputType']): string {
  return OUTPUT_TYPE_LABELS[outputType] ?? 'Research Output';
}

// =============================================================================
// Contributor Display Guards
// =============================================================================

/**
 * Returns the safe, consent-checked display string for a contributor.
 *
 * Visibility rules:
 *   profileVisibility: 'private'  → returns null (render nothing)
 *   profileVisibility: 'limited'  → returns tier badge label only (no name)
 *   profileVisibility: 'public'   → returns displayName (alias or consented name)
 *
 * Note: email is NEVER returned here — it is strictly admin-only.
 */
export function getContributorDisplay(
  contributor: Contributor
): { name: string | null; tier: string | null } {
  if (!contributor.isPublic || contributor.profileVisibility === 'private') {
    return { name: null, tier: null };
  }

  if (contributor.profileVisibility === 'limited') {
    return { name: null, tier: getTierLabel(contributor.tier) };
  }

  // profileVisibility === 'public'
  return {
    name: contributor.displayName,
    tier: getTierLabel(contributor.tier),
  };
}

// =============================================================================
// Tier Labels
// =============================================================================

const TIER_LABELS: Record<Contributor['tier'], string> = {
  'observer':             'Observer',
  'contributor':          'Contributor',
  'core-contributor':     'Core Contributor',
  'founding-contributor': 'Founding Contributor',
};

/**
 * Returns the human-readable tier label.
 */
export function getTierLabel(tier: Contributor['tier']): string {
  return TIER_LABELS[tier] ?? 'Member';
}

// =============================================================================
// generateStaticParams helper — ensures hidden projects cannot be accessed by URL
// =============================================================================

/**
 * Returns only the slugs of public-web projects.
 * Use this in generateStaticParams() to ensure private/internal/archived
 * projects cannot be reached even by direct URL.
 */
export function getPublicProjectSlugs(projects: ProjectNote[]): string[] {
  return projects.filter(isPublicWebProject).map((p) => p.slug);
}
