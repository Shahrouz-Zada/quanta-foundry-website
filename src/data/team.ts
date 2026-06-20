// =============================================================================
// Quanta Foundry — Team / Founder Data
// Future CMS collection: 'team'
// =============================================================================

import { TeamMember } from '@/types';

export const teamMembers: TeamMember[] = [
  {
    id: 'founder',
    name: 'Dr. S. Rahman',
    role: 'Founder & Director',
    bio: 'Dr. Rahman brings over a decade of experience at the intersection of applied mathematics, machine learning, and quantitative finance. With a PhD in computational science and research positions at leading European institutions, they have published on topics ranging from stochastic optimization to deep learning architectures for financial applications. Before founding Quanta Foundry, Dr. Rahman held senior technical and teaching roles in both academia and industry — including quantitative research at a global investment firm and adjunct teaching at two Paris-based institutions. Quanta Foundry was born from a conviction that the next generation of deep-tech professionals needs training that is rigorous, applied, and directly connected to industry reality.',
    shortBio:
      'Researcher and educator bridging applied mathematics, AI, and quantitative finance, with experience across higher education, financial markets, and applied technology projects.',
    credentials: [
      'Applied Mathematics',
      'Quantitative Finance',
      'AI & Machine Learning',
      'Higher Education',
      'Project-Based Learning',
      'Founder, Quanta Foundry',
    ],
    isFounder: true,
    order: 1,
  },
];

export const founder = teamMembers.find((m) => m.isFounder)!;
