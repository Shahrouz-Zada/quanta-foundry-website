// =============================================================================
// Quanta Foundry — Navigation Data
// =============================================================================

import { NavItem, FooterSection } from '@/types';

export const mainNavItems: NavItem[] = [
  { label: 'Focus Areas', href: '/focus-areas' },
  { label: 'Reading Club', href: '/community' },
  { label: 'Insights', href: '/insights' },
  { label: 'For Partners', href: '/companies' },
  { label: 'About', href: '/about' },
];

export const footerSections: FooterSection[] = [
  {
    title: 'Focus Areas',
    links: [
      { label: 'Applied AI & ML', href: '/focus-areas#applied-ai-ml' },
      { label: 'Quantitative Finance', href: '/focus-areas#quantitative-finance' },
      { label: 'Quantum Software', href: '/focus-areas#quantum-software' },
      { label: 'All Domains', href: '/focus-areas' },
    ],
  },
  {
    title: 'Organization',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'For Partners', href: '/companies' },
      { label: 'Workspace Q', href: '/workspace-q' },
      { label: 'Contact', href: '/workspace-q' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Insights & Research', href: '/insights' },
      { label: 'Reading Club', href: '/community' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
];
