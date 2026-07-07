import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quanta Foundry | Applied Research & Project-Based Learning',
  description:
    'Quanta Foundry is an independent applied research and project-based learning community in Paris exploring Applied AI, Quantitative Finance, Quantum Software, and Neuroscience & Markets through reading groups, Workspace Q, and project collaborations.',
  alternates: { canonical: 'https://www.quantafoundry.com' },
  openGraph: {
    type: 'website',
    url: 'https://www.quantafoundry.com',
    siteName: 'Quanta Foundry',
    title: 'Quanta Foundry | Applied Research & Project-Based Learning',
    description:
      'An independent applied research and project-based learning community in Paris exploring Applied AI, Quantitative Finance, Quantum Software, and Neuroscience & Markets.',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Quanta Foundry — Applied Research & Project-Based Learning',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quanta Foundry | Applied Research & Project-Based Learning',
    description:
      'An independent applied research and project-based learning community exploring Applied AI, Quantitative Finance, and Quantum Software.',
    images: ['/og-image.png'],
  },
};
import Hero from '@/components/sections/Hero';
import ProblemSection from '@/components/sections/ProblemSection';
import ModelSection from '@/components/sections/ModelSection';
import FocusAreasPreview from '@/components/sections/FocusAreasPreview';
import CompaniesPreview from '@/components/sections/CompaniesPreview';
import InsightsPreview from '@/components/sections/InsightsPreview';
import FounderSection from '@/components/sections/FounderSection';
import CTASection from '@/components/sections/CTASection';

export default function Home() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <ModelSection />
      <FocusAreasPreview />
      <CompaniesPreview />
      <InsightsPreview />
      <FounderSection />
      <CTASection />
    </>
  );
}
