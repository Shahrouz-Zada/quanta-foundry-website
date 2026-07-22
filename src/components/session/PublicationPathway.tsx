// =============================================================================
// PublicationPathway — Learning Sessions Prototype
// Light paper surface with navy/gold/emerald accent system
// WCAG: #18242B on white ≈ 15:1 ✓ | #5F6B70 on white ≈ 4.9:1 ✓
// =============================================================================

import { Lock, UserCheck, PenLine, CheckCircle2, Globe } from 'lucide-react';

interface PathwayStep {
  icon: React.ReactNode;
  label: string;
  description: string;
  isGate?: boolean;
  isFinal?: boolean;
}

const STEPS: PathwayStep[] = [
  {
    icon: <Lock size={16} />,
    label: 'Private Workspace',
    description: 'Your work lives only in your personal session space.',
  },
  {
    icon: <UserCheck size={16} />,
    label: 'Review',
    description: 'A Quanta Foundry team member reviews the output for quality and coherence.',
    isGate: true,
  },
  {
    icon: <PenLine size={16} />,
    label: 'Revision',
    description: 'You revise the work together, lifting it to publication standard.',
  },
  {
    icon: <CheckCircle2 size={16} />,
    label: 'Consent & Attribution',
    description: 'You confirm publication consent and choose how you are attributed.',
    isGate: true,
  },
  {
    icon: <Globe size={16} />,
    label: 'Projects & Notes',
    description: 'The output is published as a Quanta Foundry project note.',
    isFinal: true,
  },
];

function stepClasses(step: PathwayStep, index: number) {
  if (step.isGate)  return { icon: 'bg-[#D4AF37]/15 text-[#7A6120]  border border-[#D4AF37]/30', card: 'border-[#D4AF37]/25 bg-[#FAF3DC]' };
  if (step.isFinal) return { icon: 'bg-[#2F8174]/12 text-[#1A6655]  border border-[#2F8174]/25', card: 'border-[#2F8174]/20 bg-[#F0F8F6]' };
  if (index === 0)  return { icon: 'bg-[#18242B]/8  text-[#5F6B70]  border border-[#18242B]/12', card: 'border-[#18242B]/10 bg-white' };
  return              { icon: 'bg-[#08212C]/8  text-[#08212C]/60 border border-[#08212C]/12', card: 'border-[#18242B]/10 bg-white' };
}

export default function PublicationPathway() {
  return (
    <div className="rounded-xl border border-[#18242B]/12 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#18242B]/8 bg-[#FAF8F2]">
        <p className="text-sm font-semibold text-[#18242B] mb-1">Optional Publication Pathway</p>
        <p className="text-xs text-[#5F6B70] leading-relaxed">
          Nothing is automatically published. Strong session outputs may be revised into a Quanta
          Foundry Projects &amp; Notes entry after review, consent, and attribution confirmation.
        </p>
      </div>

      {/* Pathway steps */}
      <div className="p-6 bg-[#FAF8F2]">
        {/* Desktop: horizontal pipeline */}
        <div className="hidden md:flex items-stretch gap-0">
          {STEPS.map((step, index) => {
            const cls = stepClasses(step, index);
            return (
              <div key={step.label} className="flex items-center flex-1 min-w-0">
                <div className={`flex-1 rounded-xl border p-4 flex flex-col gap-2 ${cls.card}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cls.icon}`}>
                    {step.icon}
                  </div>
                  <p className="text-xs font-semibold text-[#18242B] leading-tight">{step.label}</p>
                  <p className="text-[11px] text-[#5F6B70] leading-relaxed">{step.description}</p>
                  {step.isGate && (
                    <span className="self-start text-[10px] font-semibold text-[#7A6120] bg-[#D4AF37]/12 border border-[#D4AF37]/25 px-2 py-0.5 rounded-full">
                      Review gate
                    </span>
                  )}
                  {step.isFinal && (
                    <span className="self-start text-[10px] font-semibold text-[#1A6655] bg-[#2F8174]/10 border border-[#2F8174]/20 px-2 py-0.5 rounded-full">
                      Publication
                    </span>
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <span aria-hidden="true" className="text-[#18242B]/25 text-sm px-2 shrink-0">
                    →
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: vertical list */}
        <div className="flex md:hidden flex-col gap-3">
          {STEPS.map((step, index) => {
            const cls = stepClasses(step, index);
            return (
              <div key={step.label} className="flex items-start gap-3">
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${cls.icon}`}>
                  {step.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#18242B]">{step.label}</p>
                  <p className="text-[11px] text-[#5F6B70] leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer note */}
      <div className="px-6 pb-5 bg-[#FAF8F2] border-t border-[#18242B]/8">
        <p className="text-xs text-[#5F6B70] leading-relaxed pt-4">
          Publication is always optional and selective. Most session outputs will remain private.
          Review gates exist to ensure any public output reflects Quanta Foundry quality standards.
        </p>
      </div>
    </div>
  );
}
