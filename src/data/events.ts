// =============================================================================
// Quanta Foundry — Events Data
// Future CMS collection: 'events'
// =============================================================================

import { Event } from '@/types';

export const events: Event[] = [
  {
    id: 'rc-june-2026',
    title: 'Scaling Laws and Emergent Abilities in Large Language Models',
    description:
      'We examine the empirical scaling laws governing LLM performance and discuss the debate around emergent abilities. Key papers: Kaplan et al. (2020), Wei et al. (2022), Schaeffer et al. (2023). Join us for a structured discussion on what scaling laws tell us — and what they don\'t — about the future of foundation models.',
    date: 'TBA',
    time: '18:00 CET',
    type: 'reading-club',
    topic: 'AI & Machine Learning',
    speaker: 'Dr. S. Rahman',
    location: 'Online (Zoom)',
    status: 'planned',
    maxAttendees: 30,
  },
  {
    id: 'rc-july-2026',
    title: 'Reinforcement Learning in Quantitative Trading: From Theory to Practice',
    description:
      'This session explores the application of reinforcement learning to trading strategy optimization. We\'ll cover policy gradient methods, reward shaping for financial objectives, and the practical challenges of deploying RL agents in live markets. Recommended reading will be shared one week before the session.',
    date: 'TBA',
    time: '18:00 CET',
    type: 'reading-club',
    topic: 'Quantitative Finance',
    location: 'Online (Zoom)',
    status: 'planned',
    maxAttendees: 30,
  },
  {
    id: 'rc-may-2026',
    title: '"Attention Is All You Need" — A Retrospective Analysis',
    description:
      'Seven years after the transformer architecture reshaped AI, we revisited the original paper through the lens of everything that followed — GPT, BERT, Vision Transformers, and beyond. A rich discussion on what the authors got right, what they couldn\'t have predicted, and what comes next.',
    date: '2026-05-17',
    time: '18:00 CET',
    type: 'reading-club',
    topic: 'AI & Machine Learning',
    speaker: 'Dr. S. Rahman',
    location: 'Online (Zoom)',
    status: 'past',
  },
  {
    id: 'rc-april-2026',
    title: 'The Black-Litterman Model: Bridging Intuition and Optimization',
    description:
      'We explored the Black-Litterman framework for portfolio construction, examining how it addresses the shortcomings of classical mean-variance optimization by incorporating investor views. The session included a Python implementation walkthrough and comparison with modern Bayesian approaches.',
    date: '2026-04-12',
    time: '18:00 CET',
    type: 'reading-club',
    topic: 'Quantitative Finance',
    location: 'Online (Zoom)',
    status: 'past',
  },
];

export const upcomingEvents = events.filter((e) => e.status === 'upcoming' || e.status === 'planned');
export const pastEvents = events.filter((e) => e.status === 'past');
