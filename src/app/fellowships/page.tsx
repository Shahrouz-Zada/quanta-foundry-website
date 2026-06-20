import StudentApplicationForm from '@/components/forms/StudentApplicationForm';
import SectionHeading from '@/components/ui/SectionHeading';

export const metadata = {
  title: 'Quanta Fellowships | Quanta Foundry',
  description: 'Apply for the highly selective Quanta Fellowship program.',
};

export default function FellowshipsPage() {
  return (
    <main className="min-h-screen pt-24 pb-24 bg-[#F5F7FA]">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading
          title="Quanta Fellowships"
          subtitle="Our highly selective talent pipeline designed to bridge the gap between academic theory and industrial R&D."
        />
        
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 md:p-12 mb-12">
          <div className="prose prose-lg text-[#2C3E50] max-w-none mb-10">
            <h3 className="text-xl font-bold text-[#0A1929] mb-4">Elite Training for the Next Generation of Quants and Engineers</h3>
            <p className="mb-4">
              The Quanta Fellowship is an intensive, part-time training pipeline for top-tier talent. 
              We don&apos;t teach introductory syntax—we immerse you in real-world, highly complex problems 
              in Applied AI, Quantitative Finance, and Quantum Software. 
            </p>
            <p>
              Fellows collaborate with our core R&D teams, master proprietary workflows, and build systems 
              that meet enterprise-grade constraints. Top performers are frequently integrated into our 
              specialized engineering squads for active industrial deployments.
            </p>
          </div>

          <div className="border-t border-gray-100 pt-10 mt-10">
            <h3 className="text-2xl font-bold text-[#0A1929] mb-6 text-center">Apply to the Fellowship</h3>
            <StudentApplicationForm />
          </div>
        </div>
      </div>
    </main>
  );
}
