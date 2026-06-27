// =============================================================================
// Quanta Foundry — Reading Club Reading List
// Future CMS collection: 'reading_club_reading_list'
// =============================================================================
//
// HOW TO ADD A NEW READING LIST ENTRY:
// 1. Copy the template at the bottom of this file
// 2. Paste it into the readingList array
// 3. Fill in all fields
// 4. Commit and push — Vercel auto-deploys in ~60 seconds
// =============================================================================

export interface ReadingListEntry {
  id: string;
  title: string;
  authors: string;
  year: number;
  type: 'paper' | 'book' | 'chapter' | 'article';
  url?: string; // Leave empty if no public link available
  summary: string; // One or two sentences — why this matters
  trackId: string; // Which track this belongs to
  sessionId?: string; // Optional — links to a specific session
  tags: string[];
  featured?: boolean; // Show in the featured/highlighted list
}

export const readingList: ReadingListEntry[] = [
  // ---------------------------------------------------
  // QUANT FINANCE TRACK — Session 1
  // ---------------------------------------------------
  {
    id: 'cont-2001',
    title: 'Empirical Properties of Asset Returns: Stylized Facts and Statistical Issues',
    authors: 'Rama Cont',
    year: 2001,
    type: 'paper',
    url: 'https://rama.cont.perso.math.cnrs.fr/pdf/clustering.pdf',
    summary:
      'The foundational survey of stylized facts in financial return distributions — fat tails, volatility clustering, and the leverage effect. Essential reading for anyone working with financial time series.',
    trackId: 'quant-finance',
    sessionId: 'qf-s1',
    tags: ['stylized facts', 'returns', 'fat tails', 'volatility clustering'],
    featured: true,
  },
  {
    id: 'ruppert-matteson-ch1',
    title: 'Statistics and Data Analysis for Financial Engineering — Chapter 1',
    authors: 'Ruppert & Matteson',
    year: 2015,
    type: 'chapter',
    url: '',
    summary:
      'A clear and accessible introduction to financial return distributions — log-returns, normality assumptions, and the empirical evidence against them.',
    trackId: 'quant-finance',
    sessionId: 'qf-s1',
    tags: ['log-returns', 'normality', 'textbook'],
  },
  // ---------------------------------------------------
  // QUANT FINANCE TRACK — Session 2
  // ---------------------------------------------------
  {
    id: 'engle-1982',
    title: 'Autoregressive Conditional Heteroscedasticity with Estimates of the Variance of United Kingdom Inflation',
    authors: 'Robert F. Engle',
    year: 1982,
    type: 'paper',
    url: '',
    summary:
      'The original ARCH paper that launched a family of volatility models still used in risk management and derivatives pricing today. A landmark in financial econometrics.',
    trackId: 'quant-finance',
    sessionId: 'qf-s2',
    tags: ['ARCH', 'GARCH', 'volatility', 'econometrics'],
    featured: true,
  },
  // ---------------------------------------------------
  // QUANT FINANCE TRACK — Session 3
  // ---------------------------------------------------
  {
    id: 'ang-timmermann-2012',
    title: 'Regime Changes and Financial Markets',
    authors: 'Ang & Timmermann',
    year: 2012,
    type: 'paper',
    url: '',
    summary:
      'A comprehensive survey of regime-switching models in finance — covering detection methods, economic interpretation, and applications to asset allocation and risk management.',
    trackId: 'quant-finance',
    sessionId: 'qf-s3',
    tags: ['market regimes', 'regime switching', 'asset allocation'],
    featured: true,
  },
  // ---------------------------------------------------
  // QUANT FINANCE TRACK — Session 4
  // ---------------------------------------------------
  {
    id: 'nystrup-2020',
    title: 'Detecting Bearish and Bullish Markets in Financial Time Series Using Hierarchical Hidden Markov Models',
    authors: 'Nystrup et al.',
    year: 2020,
    type: 'paper',
    url: 'https://arxiv.org/abs/2007.14874',
    summary:
      'Applies hierarchical Hidden Markov Models to detect multi-scale market regimes. An accessible and practically focused paper ideal for practitioners building regime detection pipelines.',
    trackId: 'quant-finance',
    sessionId: 'qf-s4',
    tags: ['HMM', 'hidden Markov models', 'regime detection', 'machine learning'],
    featured: true,
  },
  // ---------------------------------------------------
  // FOUNDATIONAL BOOKS (no specific session)
  // ---------------------------------------------------
  {
    id: 'lopez-de-prado-2018',
    title: 'Advances in Financial Machine Learning',
    authors: 'Marcos López de Prado',
    year: 2018,
    type: 'book',
    url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3104847',
    summary:
      'The definitive guide to applying machine learning rigorously in finance — covering feature engineering, backtesting, overfitting, and the structural differences between financial and standard ML problems.',
    trackId: 'quant-finance',
    tags: ['machine learning', 'backtesting', 'feature engineering', 'quantitative finance'],
    featured: true,
  },
  {
    id: 'taleb-antifragile',
    title: 'Antifragile: Things That Gain from Disorder',
    authors: 'Nassim Nicholas Taleb',
    year: 2012,
    type: 'book',
    url: '',
    summary:
      'Taleb\'s framework for thinking about systems that benefit from volatility and stress — directly relevant to Session 8 on antifragility and convex payoffs.',
    trackId: 'quant-finance',
    sessionId: 'qf-s8',
    tags: ['antifragility', 'convexity', 'risk', 'optionality'],
  },
];

// Get all entries for a specific track
export function getReadingListByTrack(trackId: string): ReadingListEntry[] {
  return readingList.filter((e) => e.trackId === trackId);
}

// Get featured entries across all tracks
export function getFeaturedReadingList(): ReadingListEntry[] {
  return readingList.filter((e) => e.featured);
}

// Get entries for a specific session
export function getReadingListBySession(sessionId: string): ReadingListEntry[] {
  return readingList.filter((e) => e.sessionId === sessionId);
}

// =============================================================================
// TEMPLATE — Copy and fill in to add a new entry:
// =============================================================================
// {
//   id: 'unique-id-here',
//   title: 'Full Paper or Book Title',
//   authors: 'Author Name(s)',
//   year: 2024,
//   type: 'paper', // 'paper' | 'book' | 'chapter' | 'article'
//   url: 'https://link-to-paper.com', // or '' if no public link
//   summary: 'One or two sentences explaining why this reading matters.',
//   trackId: 'quant-finance', // which track this belongs to
//   sessionId: 'qf-s5', // optional - link to a specific session
//   tags: ['tag1', 'tag2'],
//   featured: false, // set true to highlight in the reading list section
// },
