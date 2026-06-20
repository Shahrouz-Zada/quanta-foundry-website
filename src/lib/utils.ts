// =============================================================================
// Quanta Foundry — Utility Functions
// =============================================================================

import { clsx, type ClassValue } from 'clsx';

/** Merge Tailwind class names with clsx */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format a date string to a readable format */
export function formatDate(dateString: string): string {
  if (!dateString || dateString === 'Coming Soon') return 'Coming Soon';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Truncate text to a given length with ellipsis */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

/** Generate a URL-friendly slug from a string */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
