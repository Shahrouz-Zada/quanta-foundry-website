// =============================================================================
// Quanta Foundry — Team / Founder Data
// Future CMS collection: 'team'
// =============================================================================

import { TeamMember } from '@/types';

export const teamMembers: TeamMember[] = [
  {
    id: 'founder',
    name: 'Shahrouz ZADA',
    role: 'Founder & Director',
    bio: 'Shahrouz is a researcher, educator, and quantitative finance practitioner working at the intersection of applied mathematics, artificial intelligence, and financial modeling. He holds advanced degrees in mathematics and a Doctorate in Business Administration focused on quantitative finance, with research interests including market antifragility, regime detection, machine learning, and applied risk modeling.

Before founding Quanta Foundry, he gained experience across higher education, financial markets, and applied technology projects, including roles involving quantitative analysis, financial operations, Python-based analytics, and teaching in business and engineering education. His teaching work covers Python, data analysis, machine learning, financial modeling, and quantitative methods.

Quanta Foundry was created from the conviction that motivated students, researchers, and technical professionals need a complementary space where rigorous reading, applied experimentation, and project-based collaboration can connect advanced ideas to practical technical work.'
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
