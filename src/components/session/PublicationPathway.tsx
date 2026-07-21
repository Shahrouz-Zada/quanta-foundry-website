// =============================================================================
// PublicationPathway — Learning Sessions Prototype
// Visualises the optional path from private work to public Projects & Notes
// =============================================================================

import { Lock, UserCheck, PenLine, CheckCircle2, Globe } from 'lucide-react';

interface PathwayStep {
  icon: React.ReactNode;
  label: string;
  description: string;
  isGate?: boolean;
}

const STEPS: PathwayStep[] = [
  {
    icon: <Lock size={18} />,
    label: 'Private Workspace',
    description: 'Your work lives only in your personal session space.',
  },
  {
    icon: <UserCheck size={18} />,
    label: 'Review',
    description: 'A Quanta Foundry team member reviews the output for quality and coherence.',
    isGate: true,
  },
  {
    icon: <PenLine size={18} />,
    label: 'Revision',
    description: 'You revise the work together, lifting it to publication standard.',
  },
  {
    icon: <CheckCircle2 size={18} />,
    label: 'Consent & Attribution',
    description: 'You confirm publication consent and choose how you are attributed.',
    isGate: true,
  },
  {
    icon: <Globe size={18} />,
    label: 'Projects & Notes',
    description: 'The output is published as a Quanta Foundry project note.',
  },
];

export default function PublicationPathway() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/8">
        <p className="text-sm font-semibold text-white mb-1">Optional Publication Pathway</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Nothing is automatically published. Strong session outputs may be revised into a Quanta
          Foundry Projects &amp; Notes entry after review, consent, and attribution confirmation.
        </p>
      </div>

      {/* Pathway steps */}
      <div className="p-6">
        {/* Desktop: horizontal pipeline */}
        <div className="hidden md:flex items-stretch gap-0">
          {STEPS.map((step, index) => (
            <div key={step.label} className="flex items-center flex-1 min-w-0">
              {/* Step card */}
              <div
                className={`flex-1 rounded-xl border p-4 flex flex-col gap-2 ${
                  step.isGate
                    ? 'border-[#D4AF37]/25 bg-[#D4AF37]/5'
                    : 'border-white/10 bg-white/3'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    step.isGate
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37]'
                      : index === 0
                      ? 'bg-gray-700/50 text-gray-400'
                      : index === STEPS.length - 1
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-[#4A90E2]/15 text-[#4A90E2]'
                  }`}
                >
                  {step.icon}
                </div>
                <p className="text-xs font-semibold text-white leading-tight">{step.label}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">{step.description}</p>
                {step.isGate && (
                  <span className="self-start text-[10px] font-semibold text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2 py-0.5 rounded-full">
                    Review gate
                  </span>
                )}
              </div>

              {/* Arrow between steps */}
              {index < STEPS.length - 1 && (
                <span aria-hidden="true" className="text-gray-700 text-sm px-2 shrink-0">
                  →
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical list */}
        <div className="flex md:hidden flex-col gap-3">
          {STEPS.map((step, index) => (
            <div key={step.label} className="flex items-start gap-3">
              <div
                className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  step.isGate
                    ? 'bg-[#D4AF37]/15 text-[#D4AF37]'
                    : index === 0
                    ? 'bg-gray-700/50 text-gray-400'
                    : index === STEPS.length - 1
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-[#4A90E2]/15 text-[#4A90E2]'
                }`}
              >
                {step.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{step.label}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">{step.description}</p>
              </div>
              {index < STEPS.length - 1 && (
                <div aria-hidden="true" className="w-px h-4 bg-white/10 ml-3.5 mt-8 shrink-0 absolute" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="px-6 pb-5 border-t border-white/8">
        <p className="text-xs text-gray-600 leading-relaxed pt-4">
          Publication is always optional and selective. Most session outputs will remain private.
          Review gates exist to ensure any public output reflects Quanta Foundry quality standards.
        </p>
      </div>
    </div>
  );
}
