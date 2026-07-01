// =============================================================================
// Quanta Foundry — Reading Club Tracks
// Future CMS collection: 'reading_club_tracks'
// =============================================================================
// HOW TO ADD A NEW TRACK:
//   1. Copy one of the objects below, paste at the end of the array.
//   2. Set readingTrackStatus to 'coming-soon' until launch.
//   3. Fill in plannedThemes for the coming-soon panel.
//   4. Once active, add modules and set readingTrackStatus to 'active'.
//   5. Commit and push — Vercel auto-deploys in ~60 seconds.
// =============================================================================

// ============================================================
// Interfaces
// ============================================================

/** One module grouping within a track's season roadmap. */
export interface TrackModule {
  id: string;
  title: string;
  description?: string;
  /** Ordered list of session IDs belonging to this module. */
  sessionIds: string[];
}

/** A single Reading Track (one season of biweekly sessions). */
export interface ReadingTrack {
  id: string;
  title: string;
  shortTitle: string;
  /** Displayed below the title in the track overview, e.g. "Season 1 — Upcoming" */
  subtitle: string;

  // ── Status ──────────────────────────────────────────────────
  /** Whether this track is currently active in the reading program. */
  readingTrackStatus: 'active' | 'coming-soon';
  /** Whether this domain is an active Quanta Foundry focus area. */
  focusAreaStatus: 'active' | 'coming-soon';
  /** Short badge label shown on the tab card. */
  badge: string;

  // ── CTA ─────────────────────────────────────────────────────
  /** Label for the primary call-to-action button. */
  ctaLabel: string;
  /** Action type — determines which registration form / anchor is used. */
  ctaType: 'register-updates' | 'register-interest';

  // ── Content ──────────────────────────────────────────────────
  description: string;
  longDescription: string;
  /** Hex accent color used throughout this track's UI elements. */
  accent: string;
  /** Lucide icon component name. Must be registered in TRACK_ICON_MAP. */
  icon: string;
  prerequisites: string[];
  format: {
    cadence: string;
    duration: string;
    location: string;
    cohortSize: string;
  };

  // ── Roadmap ──────────────────────────────────────────────────
  /** Module groupings for active tracks. Empty array if roadmap not yet published. */
  modules: TrackModule[];
  /** Bullet-point themes shown for coming-soon tracks or active tracks without a published roadmap. */
  plannedThemes?: string[];
  /** Total planned sessions for the season. */
  sessionCount?: number;

  order: number;
}

// ============================================================
// Track Data
// ============================================================

export const readingTracks: ReadingTrack[] = [
  // ----------------------------------------------------------
  // 1. Quant Finance
  // ----------------------------------------------------------
  {
    id: 'quant-finance',
    title: 'Market Regimes, Risk & Applied ML in Finance',
    shortTitle: 'Quant Finance',
    subtitle: 'Season 1 — Upcoming',
    readingTrackStatus: 'active',
    focusAreaStatus: 'active',
    badge: 'Active — Season 1',
    ctaLabel: 'Register for Updates',
    ctaType: 'register-updates',
    description:
      'A biweekly technical reading group exploring how financial markets shift across regimes, how risk behaves under stress, and how machine learning can support quantitative research.',
    longDescription:
      'This track takes you from the statistical foundations of financial time series all the way to applied machine learning for regime detection, stress testing, and backtesting. Each session pairs one accessible reading with one serious paper, a reproducible Python notebook, and structured discussion. By the end of Season 1, participants will have built a working knowledge of quantitative risk modeling and regime-aware finance — grounded in real code and real papers.',
    accent: '#D4AF37',
    icon: 'TrendingUp',
    prerequisites: [
      'Basic Python proficiency (numpy, pandas)',
      'Curiosity about financial markets — no finance degree required',
      'Willingness to read one paper and engage with one notebook every two weeks',
    ],
    format: {
      cadence: 'Biweekly',
      duration: '90 min / session',
      location: 'Online (Zoom)',
      cohortSize: '25–30 participants',
    },
    modules: [
      {
        id: 'qf-m1',
        title: 'Module 1 — Foundations',
        description: 'Statistical properties of financial returns and volatility dynamics.',
        sessionIds: ['qf-s1', 'qf-s2'],
      },
      {
        id: 'qf-m2',
        title: 'Module 2 — Market Regimes',
        description: 'Detecting and modeling structural states in financial markets.',
        sessionIds: ['qf-s3', 'qf-s4', 'qf-s5'],
      },
      {
        id: 'qf-m3',
        title: 'Module 3 — Risk, Stress & Antifragility',
        description: 'Tail risk measurement, stress testing, and crisis-aware system design.',
        sessionIds: ['qf-s6', 'qf-s7', 'qf-s8'],
      },
      {
        id: 'qf-m4',
        title: 'Module 4 — Machine Learning for Finance',
        description: 'Applied ML for financial time series, backtesting, and the capstone project.',
        sessionIds: ['qf-s9', 'qf-s10', 'qf-s11', 'qf-s12'],
      },
    ],
    sessionCount: 12,
    order: 1,
  },

  // ----------------------------------------------------------
  // 2. Applied AI
  // ----------------------------------------------------------
  {
    id: 'applied-ai',
    title: 'Applied AI & Machine Learning',
    shortTitle: 'Applied AI',
    subtitle: 'Active',
    readingTrackStatus: 'active',
    focusAreaStatus: 'active',
    badge: 'Active',
    ctaLabel: 'Register for Updates',
    ctaType: 'register-updates',
    description:
      'A reading track covering the foundations and frontiers of applied AI — from transformers and scaling laws to deployment, safety, and real-world ML systems.',
    longDescription:
      'This track explores landmark AI papers alongside practical applications, covering language models, computer vision, reinforcement learning, and AI safety. Sessions pair foundational theory with applied code walkthroughs, building a rigorous but practical understanding of modern AI systems.',
    accent: '#4A90E2',
    icon: 'Brain',
    prerequisites: [
      'Python proficiency',
      'Familiarity with linear algebra and probability',
      'Interest in how modern AI systems actually work',
    ],
    format: {
      cadence: 'Biweekly',
      duration: '90 min / session',
      location: 'Online (Zoom)',
      cohortSize: 'TBA',
    },
    // Session archive and full roadmap will be added once content is provided.
    modules: [],
    plannedThemes: [
      'Transformer architecture and the attention mechanism (foundations)',
      'Scaling laws and emergent capabilities in large language models',
      'Reinforcement learning from human feedback (RLHF)',
      'AI safety, alignment, and red-teaming methods',
      'Multimodal models: vision-language and beyond',
      'Deployment, inference optimization, and production ML systems',
      'Agents, tool use, and the frontier of reasoning models',
    ],
    order: 2,
  },

  // ----------------------------------------------------------
  // 3. Neuroscience & Markets
  // ----------------------------------------------------------
  {
    id: 'neuroscience-markets',
    title: 'Neuroscience, Decision-Making & Markets',
    shortTitle: 'Neuroscience & Markets',
    subtitle: 'Coming Soon',
    readingTrackStatus: 'coming-soon',
    focusAreaStatus: 'coming-soon',
    badge: 'Coming Soon',
    ctaLabel: 'Register Interest',
    ctaType: 'register-interest',
    description:
      'Exploring how cognitive science, behavioral economics, and neuroscience can illuminate financial decision-making, market dynamics, and investor behavior.',
    longDescription:
      'This track will sit at the intersection of neuroscience, behavioral economics, and financial markets — examining how human decision-making shapes price dynamics and how research from cognitive science can improve our models of markets and risk.',
    accent: '#7C3AED',
    icon: 'Activity',
    prerequisites: [
      'Open to all backgrounds',
      'Curiosity about human behavior and financial markets',
      'No neuroscience or finance degree required',
    ],
    format: {
      cadence: 'Biweekly',
      duration: '90 min / session',
      location: 'Online (Zoom)',
      cohortSize: 'TBA',
    },
    modules: [],
    plannedThemes: [
      'Prospect theory, loss aversion, and why humans are not rational agents',
      'Attention, cognitive load, and how markets process information',
      'Emotional contagion and social dynamics in market crashes',
      'Neuroeconomics: what brain imaging tells us about financial decisions',
      'Behavioral biases in portfolio construction and trading',
      'Animal spirits: Keynes, Shiller, and the role of narrative in markets',
      'Decision-making under uncertainty: Kahneman, Tversky, and beyond',
    ],
    order: 3,
  },

  // ----------------------------------------------------------
  // 4. Quantum Software
  // ----------------------------------------------------------
  {
    id: 'quantum-software',
    title: 'Quantum Software & Hybrid Algorithms',
    shortTitle: 'Quantum Software',
    subtitle: 'Coming Soon',
    readingTrackStatus: 'coming-soon',
    focusAreaStatus: 'coming-soon',
    badge: 'Coming Soon',
    ctaLabel: 'Register Interest',
    ctaType: 'register-interest',
    description:
      'Reading the frontier of quantum computing — from variational algorithms and quantum error correction to near-term applications in optimization and simulation.',
    longDescription:
      'A future track for participants interested in quantum computing — covering the theoretical foundations and near-term practical applications of quantum algorithms, with a focus on hybrid classical-quantum methods relevant to optimization, simulation, and finance.',
    accent: '#10B981',
    icon: 'Cpu',
    prerequisites: [
      'Linear algebra (comfortable with matrices and eigenvalues)',
      'Some programming background (Python preferred)',
      'Curiosity about quantum mechanics and computation',
    ],
    format: {
      cadence: 'Biweekly',
      duration: '90 min / session',
      location: 'Online (Zoom)',
      cohortSize: 'TBA',
    },
    modules: [],
    plannedThemes: [
      'Qubits, superposition, and the basics of quantum circuits',
      'Quantum algorithms: Grover, Shor, and their real-world feasibility',
      'Variational quantum eigensolver (VQE) and near-term applications',
      'Quantum error correction: the path to fault-tolerant computing',
      'Quantum optimization: QAOA and portfolio optimization',
      'Quantum simulation for materials science and drug discovery',
      'The quantum advantage debate: where are we actually headed?',
    ],
    order: 4,
  },
];

// ============================================================
// Derived Exports
// ============================================================

export const activeTracks = readingTracks.filter((t) => t.readingTrackStatus === 'active');
export const featuredTrack =
  readingTracks.find((t) => t.readingTrackStatus === 'active') ?? readingTracks[0];
