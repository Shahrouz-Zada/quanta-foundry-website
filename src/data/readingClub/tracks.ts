// =============================================================================
// Quanta Foundry — Reading Club Tracks
// Future CMS collection: 'reading_club_tracks'
// =============================================================================
// To add a new track: copy one of the objects below, paste it at the end of
// the array, and update all fields. Set status to 'coming-soon' until launch.
// =============================================================================

export interface ReadingTrack {
  id: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  status: 'active' | 'coming-soon';
  description: string;
  longDescription: string;
  accent: string;
  icon: string; // Lucide icon name
  prerequisites: string[];
  format: {
    cadence: string;
    duration: string;
    location: string;
    cohortSize: string;
  };
  sessionCount?: number; // total planned sessions for the season
  order: number;
}

export const readingTracks: ReadingTrack[] = [
  {
    id: 'quant-finance',
    title: 'Market Regimes, Risk & Applied ML in Finance',
    shortTitle: 'Quant Finance',
    subtitle: 'Season 1 — Upcoming',
    status: 'active',
    description:
      'A biweekly technical reading group exploring how financial markets shift across regimes, how risk behaves under stress, and how machine learning can support quantitative research.',
    longDescription:
      'This track takes you from the statistical foundations of financial time series all the way to applied machine learning for regime detection, stress testing, and backtesting. Each session pairs one accessible reading with one serious paper, a reproducible Python notebook, and structured discussion. By the end of Season 1, participants will have built a working knowledge of quantitative risk modeling and regime-aware finance — grounded in real code and real papers.',
    accent: '#D4AF37',
    icon: 'TrendingUp',
    prerequisites: [
      'Basic Python proficiency (numpy, pandas)',
      'Curiosity about financial markets (no finance degree required)',
      'Willingness to read one paper and engage with one notebook every two weeks',
    ],
    format: {
      cadence: 'Biweekly (every two weeks)',
      duration: '90 minutes per session',
      location: 'Online (Zoom)',
      cohortSize: '25–30 participants',
    },
    sessionCount: 12,
    order: 1,
  },
  {
    id: 'applied-ai',
    title: 'Applied AI & Machine Learning',
    shortTitle: 'Applied AI',
    subtitle: 'Season 2 — Coming Soon',
    status: 'coming-soon',
    description:
      'A reading track covering the foundations and frontiers of applied AI — from transformers and scaling laws to deployment, safety, and real-world ML systems.',
    longDescription:
      'This track will explore landmark AI papers alongside practical applications, covering language models, computer vision, reinforcement learning, and AI safety. Coming in Season 2.',
    accent: '#4A90E2',
    icon: 'Brain',
    prerequisites: [
      'Python proficiency',
      'Familiarity with linear algebra and probability',
    ],
    format: {
      cadence: 'Biweekly',
      duration: '90 minutes per session',
      location: 'Online (Zoom)',
      cohortSize: 'TBA',
    },
    order: 2,
  },
  {
    id: 'neuroscience-markets',
    title: 'Neuroscience, Decision-Making & Markets',
    shortTitle: 'Neuroscience & Markets',
    subtitle: 'Coming Soon',
    status: 'coming-soon',
    description:
      'Exploring how cognitive science, behavioral economics, and neuroscience can illuminate financial decision-making, market dynamics, and investor behavior.',
    longDescription:
      'This track will sit at the intersection of neuroscience, behavioral economics, and financial markets — examining how human decision-making shapes price dynamics and how research from cognitive science can improve our models.',
    accent: '#7C3AED',
    icon: 'Activity',
    prerequisites: [
      'Open to all backgrounds',
      'Curiosity about human behavior and markets',
    ],
    format: {
      cadence: 'Biweekly',
      duration: '90 minutes per session',
      location: 'Online (Zoom)',
      cohortSize: 'TBA',
    },
    order: 3,
  },
  {
    id: 'quantum-software',
    title: 'Quantum Software & Hybrid Algorithms',
    shortTitle: 'Quantum Software',
    subtitle: 'Coming Soon',
    status: 'coming-soon',
    description:
      'Reading the frontier of quantum computing — from variational algorithms and quantum error correction to near-term applications in optimization and simulation.',
    longDescription:
      'A future track for participants interested in quantum computing — covering the theoretical foundations and near-term practical applications of quantum algorithms.',
    accent: '#10B981',
    icon: 'Cpu',
    prerequisites: [
      'Linear algebra',
      'Some programming background',
      'Curiosity about quantum mechanics',
    ],
    format: {
      cadence: 'Biweekly',
      duration: '90 minutes per session',
      location: 'Online (Zoom)',
      cohortSize: 'TBA',
    },
    order: 4,
  },
];

export const activeTracks = readingTracks.filter((t) => t.status === 'active');
export const featuredTrack = readingTracks.find((t) => t.status === 'active') ?? readingTracks[0];
