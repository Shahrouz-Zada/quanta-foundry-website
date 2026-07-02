import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.quantafoundry.com' },
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
