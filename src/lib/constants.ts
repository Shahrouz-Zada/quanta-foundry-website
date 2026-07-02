// =============================================================================
// Quanta Foundry — Site Constants
// =============================================================================

export const SITE_NAME = 'Quanta Foundry';
export const SITE_URL = 'https://www.quantafoundry.com';
export const SITE_DESCRIPTION =
  'An independent applied research and project-based learning community bridging academia and industry through Applied AI, Quantitative Finance, and Quantum Software.';
export const SITE_TAGLINE =
  'Where Deep Tech Meets Applied Learning';

export const CONTACT_EMAIL = 'contact@quantafoundry.com';
export const CONTACT_LOCATION = 'Paris, France';

// Formspree form IDs — replace with real IDs after creating forms at formspree.io
export const FORMSPREE_IDS = {
  studentApplication: 'xpwdqkbr', // placeholder
  workspaceQ: 'xpwdqkbr',         // placeholder
  corporateInquiry: 'xpwdqkbs',   // placeholder
  newsletter: 'xpwdqkbt',         // placeholder
  readingClub: 'xpwdqkbu',        // placeholder
  generalContact: 'xpwdqkbv',     // placeholder
} as const;

// Social links — update with real URLs
export const SOCIAL_LINKS = {
  linkedIn: 'https://linkedin.com/company/quanta-foundry',
  twitter: 'https://twitter.com/quantafoundry',
  github: 'https://github.com/quanta-foundry',
} as const;

// Category display labels
export const CATEGORY_LABELS: Record<string, string> = {
  'ai-ml': 'AI & Machine Learning',
  'quantitative-finance': 'Quantitative Finance',
  'quantum-software': 'Quantum Software',
  'neuroscience-markets': 'Neuroscience & Markets',
  'complex-systems': 'Complex Systems',
  research: 'Research',
} as const;

// Collaboration types for corporate inquiry form
export const COLLABORATION_TYPES = [
  'Propose a Use Case',
  'Workspace Q Project',
  'Reading Club Contribution',
  'Technical Workshop',
  'Research or Institutional Collaboration',
  'General Inquiry',
] as const;

// Topic interests for reading club
export const TOPIC_INTERESTS = [
  'AI & Machine Learning',
  'Quantitative Finance',
  'Neuroscience & Markets',
  'Behavioral Finance',
  'Complex Systems',
  'Deep-Tech Methods',
] as const;
