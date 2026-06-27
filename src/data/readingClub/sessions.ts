// =============================================================================
// Quanta Foundry — Reading Club Sessions
// Future CMS collection: 'reading_club_sessions'
// =============================================================================
//
// HOW TO ADD A NEW SESSION:
// 1. Copy the template at the bottom of this file
// 2. Paste it into the sessions array
// 3. Fill in all required fields
// 4. Set status to 'upcoming' when announcing, 'past' after the session
// 5. Commit and push — Vercel will auto-deploy in ~60 seconds
//
// HOW TO UPDATE A DATE:
// Find the session by its id and change the `date` field.
// Use 'TBA' if the date is not yet confirmed.
//
// HOW TO LINK A NOTEBOOK:
// Find the session and paste the full GitHub URL into the `notebookUrl` field.
//
// HOW TO LINK A TECHNICAL NOTE:
// Find the session and paste the article slug into the `noteSlug` field.
// The article detail page will be at /insights/[noteSlug]
//
// HOW TO MARK A SESSION AS PAST:
// Change `status: 'upcoming'` to `status: 'past'`
// =============================================================================

export interface SessionReading {
  title: string;
  url?: string; // Leave empty if URL is not available yet
  authors?: string;
}

export interface ReadingClubSession {
  id: string;
  trackId: string;
  number: number; // Session number within the track (1, 2, 3...)
  title: string;
  theme: string; // One-sentence description of the session theme
  status: 'upcoming' | 'past' | 'planned'; // 'upcoming' = announced, 'planned' = not yet announced
  date: string; // ISO date string 'YYYY-MM-DD' or 'TBA'
  time?: string; // e.g. '18:00 CET'
  accessibleReading?: SessionReading; // The easier, introductory reading
  corePaper?: SessionReading; // The main technical paper
  notebookUrl?: string; // GitHub link to the session notebook
  noteSlug?: string; // slug of the published technical note in insights.ts
  discussionQuestions?: string[];
  miniProject?: string;
  isPublic: boolean; // true = show on public page, false = internal only
}

export const readingClubSessions: ReadingClubSession[] = [
  // ============================================================
  // QUANT FINANCE TRACK — Season 1
  // First 4 sessions are public. Sessions 5–12 are internal.
  // ============================================================
  {
    id: 'qf-s1',
    trackId: 'quant-finance',
    number: 1,
    title: 'What Makes Financial Markets Different from Ordinary Time Series?',
    theme: 'Returns, log-returns, non-normality, heavy tails, volatility clustering, and leverage effects.',
    status: 'upcoming',
    date: 'TBA',
    time: '18:00 CET',
    accessibleReading: {
      title: 'Statistics and Data Analysis for Financial Engineering — Chapter 1',
      authors: 'Ruppert & Matteson',
      url: '',
    },
    corePaper: {
      title: 'Empirical Properties of Asset Returns: Stylized Facts and Statistical Issues',
      authors: 'Rama Cont (2001)',
      url: 'https://rama.cont.perso.math.cnrs.fr/pdf/clustering.pdf',
    },
    notebookUrl: '',
    noteSlug: '',
    discussionQuestions: [
      'Why are financial returns difficult to model with standard statistical tools?',
      'Why does the normality assumption fail — and why do practitioners still use it?',
      'Which stylized facts matter most for risk management vs. alpha generation?',
    ],
    miniProject:
      'Repeat the stylized facts analysis on a different asset class (crypto, commodities, or FX) and compare. Do the same stylized facts hold?',
    isPublic: true,
  },
  {
    id: 'qf-s2',
    trackId: 'quant-finance',
    number: 2,
    title: 'Volatility Clustering & GARCH Intuition',
    theme: 'Volatility is not constant. Calm and turbulent periods cluster in time.',
    status: 'upcoming',
    date: 'TBA',
    time: '18:00 CET',
    accessibleReading: {
      title: 'GARCH Overview — Investopedia',
      url: 'https://www.investopedia.com/terms/g/generalalizedautogregressiveconditionalheteroskedasticity.asp',
    },
    corePaper: {
      title: 'Autoregressive Conditional Heteroscedasticity with Estimates of the Variance of United Kingdom Inflation',
      authors: 'Engle, R.F. (1982)',
      url: '',
    },
    notebookUrl: '',
    noteSlug: '',
    discussionQuestions: [
      'What does "volatility clustering" mean visually? How would you explain it to a non-quant executive?',
      'Is volatility easier to predict than returns? Why?',
      'Why do risk models care more about volatility than price direction?',
    ],
    miniProject:
      'Fit GARCH(1,1) to crypto (BTC/ETH) returns. Is volatility clustering stronger or weaker than in equities? What does this imply for crypto risk management?',
    isPublic: true,
  },
  {
    id: 'qf-s3',
    trackId: 'quant-finance',
    number: 3,
    title: 'Market Regimes: From Bull/Bear Labels to Latent States',
    theme: 'Bull, bear, crisis, recovery — are these real market states or post-hoc narratives?',
    status: 'upcoming',
    date: 'TBA',
    time: '18:00 CET',
    accessibleReading: {
      title: 'A visual overview of historical market regime periods',
      url: '',
    },
    corePaper: {
      title: 'Regime Changes and Financial Markets',
      authors: 'Ang & Timmermann (2012), Annual Review of Financial Economics',
      url: '',
    },
    notebookUrl: '',
    noteSlug: '',
    discussionQuestions: [
      'Are regimes real structural states, or just stories we impose after the fact?',
      'Can we detect a regime before it is obvious? How early is "early enough"?',
      'What variables should define a regime: returns, volatility, drawdowns, volume, macro data, or all of the above?',
    ],
    miniProject:
      'Define your own 3-regime labeling scheme for a non-US market (DAX, Nikkei, BOVESPA). Compare your regime labels with official recession dates.',
    isPublic: true,
  },
  {
    id: 'qf-s4',
    trackId: 'quant-finance',
    number: 4,
    title: 'Hidden Markov Models for Regime Detection',
    theme: 'Latent states, transition probabilities, and state-dependent return distributions.',
    status: 'upcoming',
    date: 'TBA',
    time: '18:00 CET',
    accessibleReading: {
      title: 'A visual tutorial on Hidden Markov Models',
      url: '',
    },
    corePaper: {
      title: 'Detecting Bearish and Bullish Markets in Financial Time Series Using Hierarchical Hidden Markov Models',
      authors: 'Nystrup et al. (2020)',
      url: 'https://arxiv.org/abs/2007.14874',
    },
    notebookUrl: '',
    noteSlug: '',
    discussionQuestions: [
      'What does the "hidden state" actually represent? Is it a real market condition or a mathematical artifact?',
      'How do we evaluate whether HMM regimes are meaningful — economically, not just statistically?',
      'Are HMM regimes useful for trading, risk management, or only for interpretation?',
    ],
    miniProject:
      'Apply HMMs to two correlated markets (e.g., S&P 500 and DAX). Do they enter and exit regimes at the same time? What are the implications for globally diversified portfolios?',
    isPublic: true,
  },
  // Sessions 5–12 below are internal (isPublic: false)
  // They will be announced publicly after Session 4 feedback is collected.
  {
    id: 'qf-s5',
    trackId: 'quant-finance',
    number: 5,
    title: 'Change-Point Detection and Crisis Transitions',
    theme: 'Sudden structural breaks, regime shifts, and real-time crisis detection.',
    status: 'planned',
    date: 'TBA',
    isPublic: false,
  },
  {
    id: 'qf-s6',
    trackId: 'quant-finance',
    number: 6,
    title: 'Downside Risk: VaR, Expected Shortfall & Regulatory Context',
    theme: 'Tail risk measurement, Basel III/IV requirements, and why standard deviation is not enough.',
    status: 'planned',
    date: 'TBA',
    isPublic: false,
  },
  {
    id: 'qf-s7',
    trackId: 'quant-finance',
    number: 7,
    title: 'Stress Testing and Scenario Analysis',
    theme: 'What happens under extreme but plausible market conditions? Historical vs. hypothetical scenarios.',
    status: 'planned',
    date: 'TBA',
    isPublic: false,
  },
  {
    id: 'qf-s8',
    trackId: 'quant-finance',
    number: 8,
    title: 'Antifragility, Convexity & Crisis-Aware Systems',
    theme: 'Fragility vs. robustness vs. antifragility. Nonlinear payoff behavior. Convexity as a design principle.',
    status: 'planned',
    date: 'TBA',
    isPublic: false,
  },
  {
    id: 'qf-s9',
    trackId: 'quant-finance',
    number: 9,
    title: 'Why Machine Learning in Finance Is Difficult',
    theme: 'Low signal-to-noise, non-stationarity, overfitting, data leakage, survivorship bias.',
    status: 'planned',
    date: 'TBA',
    isPublic: false,
  },
  {
    id: 'qf-s10',
    trackId: 'quant-finance',
    number: 10,
    title: 'Backtesting, Overfitting & the Deflated Sharpe Ratio',
    theme: 'Backtest design, multiple testing correction, strategy selection bias, and false discovery.',
    status: 'planned',
    date: 'TBA',
    isPublic: false,
  },
  {
    id: 'qf-s11',
    trackId: 'quant-finance',
    number: 11,
    title: 'Where Does Quant Research Go? Career Paths & Applied Directions',
    theme: 'How the skills built across Sessions 1–10 connect to real career paths and applied projects.',
    status: 'planned',
    date: 'TBA',
    isPublic: false,
  },
  {
    id: 'qf-s12',
    trackId: 'quant-finance',
    number: 12,
    title: 'Capstone Pitch Day: Research Proposals & Business Concepts',
    theme: 'Participants present research proposals, applied projects, or paper replications.',
    status: 'planned',
    date: 'TBA',
    isPublic: false,
  },
];

// Public-facing sessions only (for the community page)
export const publicSessions = readingClubSessions.filter((s) => s.isPublic);

// Sessions by track
export function getSessionsByTrack(trackId: string): ReadingClubSession[] {
  return readingClubSessions.filter((s) => s.trackId === trackId);
}

// Public sessions by track
export function getPublicSessionsByTrack(trackId: string): ReadingClubSession[] {
  return readingClubSessions.filter((s) => s.trackId === trackId && s.isPublic);
}
