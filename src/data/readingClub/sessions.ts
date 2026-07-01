// =============================================================================
// Quanta Foundry — Reading Club Sessions
// Future CMS collection: 'reading_club_sessions'
// =============================================================================
//
// HOW TO ADD A NEW SESSION:
//   1. Copy the template at the bottom and paste into the sessions array.
//   2. Set the moduleId to match the module defined in tracks.ts.
//   3. Set status to 'upcoming' when announcing, 'past' after the session.
//   4. Add outputBadges once readings/notebooks are confirmed.
//   5. Commit and push — Vercel auto-deploys in ~60 seconds.
//
// HOW TO UPDATE A DATE:
//   Find the session by its id and change the `date` field.
//   Use 'TBA' if the date is not yet confirmed.
//
// HOW TO MAKE SESSIONS 5–12 PUBLIC:
//   Change isPublic: false → true for each session.
// =============================================================================

// ============================================================
// Interfaces
// ============================================================

export interface SessionReading {
  title: string;
  url?: string;
  authors?: string;
}

export interface ReadingClubSession {
  id: string;
  trackId: string;
  /** Module ID from the track's modules array (e.g. 'qf-m1'). */
  moduleId?: string;
  number: number;
  title: string;
  theme: string;
  status: 'upcoming' | 'past' | 'planned';
  date: string;
  time?: string;
  accessibleReading?: SessionReading;
  corePaper?: SessionReading;
  notebookUrl?: string;
  noteSlug?: string;
  discussionQuestions?: string[];
  miniProject?: string;
  /** Output types produced by this session. */
  outputBadges?: Array<'Note' | 'Notebook' | 'Project'>;
  /** true = show in the public roadmap and community page. */
  isPublic: boolean;
}

// ============================================================
// Sessions
// ============================================================

export const readingClubSessions: ReadingClubSession[] = [
  // ──────────────────────────────────────────────────────────
  // QUANT FINANCE — Season 1
  // Module 1: Foundations (Sessions 1–2)
  // ──────────────────────────────────────────────────────────
  {
    id: 'qf-s1',
    trackId: 'quant-finance',
    moduleId: 'qf-m1',
    number: 1,
    title: 'What Makes Financial Markets Different from Ordinary Time Series?',
    theme:
      'Returns, log-returns, non-normality, heavy tails, volatility clustering, and leverage effects.',
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
    outputBadges: ['Note', 'Notebook'],
    isPublic: true,
  },
  {
    id: 'qf-s2',
    trackId: 'quant-finance',
    moduleId: 'qf-m1',
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
      title:
        'Autoregressive Conditional Heteroscedasticity with Estimates of the Variance of United Kingdom Inflation',
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
    outputBadges: ['Note', 'Notebook'],
    isPublic: true,
  },

  // ──────────────────────────────────────────────────────────
  // Module 2: Market Regimes (Sessions 3–5)
  // ──────────────────────────────────────────────────────────
  {
    id: 'qf-s3',
    trackId: 'quant-finance',
    moduleId: 'qf-m2',
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
    outputBadges: ['Note', 'Notebook'],
    isPublic: true,
  },
  {
    id: 'qf-s4',
    trackId: 'quant-finance',
    moduleId: 'qf-m2',
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
      title:
        'Detecting Bearish and Bullish Markets in Financial Time Series Using Hierarchical Hidden Markov Models',
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
    outputBadges: ['Note', 'Notebook'],
    isPublic: true,
  },
  {
    id: 'qf-s5',
    trackId: 'quant-finance',
    moduleId: 'qf-m2',
    number: 5,
    title: 'Change-Point Detection and Crisis Transitions',
    theme: 'Sudden structural breaks, regime shifts, and real-time crisis detection.',
    status: 'planned',
    date: 'TBA',
    isPublic: false,
  },

  // ──────────────────────────────────────────────────────────
  // Module 3: Risk, Stress & Antifragility (Sessions 6–8)
  // ──────────────────────────────────────────────────────────
  {
    id: 'qf-s6',
    trackId: 'quant-finance',
    moduleId: 'qf-m3',
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
    moduleId: 'qf-m3',
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
    moduleId: 'qf-m3',
    number: 8,
    title: 'Antifragility, Convexity & Crisis-Aware Systems',
    theme: 'Fragility vs. robustness vs. antifragility. Nonlinear payoff behavior. Convexity as a design principle.',
    status: 'planned',
    date: 'TBA',
    isPublic: false,
  },

  // ──────────────────────────────────────────────────────────
  // Module 4: Machine Learning for Finance (Sessions 9–12)
  // ──────────────────────────────────────────────────────────
  {
    id: 'qf-s9',
    trackId: 'quant-finance',
    moduleId: 'qf-m4',
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
    moduleId: 'qf-m4',
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
    moduleId: 'qf-m4',
    number: 11,
    title: 'Feature Engineering for Financial Time Series',
    theme: 'Constructing meaningful features from OHLCV data, order book signals, and macro variables for ML models.',
    status: 'planned',
    date: 'TBA',
    isPublic: false,
  },
  {
    id: 'qf-s12',
    trackId: 'quant-finance',
    moduleId: 'qf-m4',
    number: 12,
    title: 'Final Project — Regime-Aware Risk Dashboard',
    theme: 'Participants present their regime-detection or risk-modeling project. Open peer review and discussion.',
    status: 'planned',
    date: 'TBA',
    outputBadges: ['Project'],
    isPublic: false,
  },
];

// ============================================================
// Helper Functions
// ============================================================

/** All sessions visible on the public community page. */
export const publicSessions = readingClubSessions.filter((s) => s.isPublic);

/** All sessions for a given track (including internal planned ones — used by ReadingTracksPanel). */
export function getSessionsByTrack(trackId: string): ReadingClubSession[] {
  return readingClubSessions.filter((s) => s.trackId === trackId);
}

/** Public sessions only for a given track (used by simple session lists). */
export function getPublicSessionsByTrack(trackId: string): ReadingClubSession[] {
  return readingClubSessions.filter((s) => s.trackId === trackId && s.isPublic);
}
