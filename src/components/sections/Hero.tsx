'use client';

import Button from '@/components/ui/Button';
import { ChevronDown } from 'lucide-react';
import InteractiveBackground from '@/components/effects/InteractiveBackground';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A1929] pt-32 pb-16"
    >
      {/* 
        Interactive background effect. 
        Set type="gaussian-process" for the new probabilistic wave animation.
        Set type="particles" to switch back to the original connected dot particle network.
      */}
      <InteractiveBackground type="gaussian-process" />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A1929]/40 via-transparent to-[#0A1929]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A1929]/60 via-transparent to-[#0A1929]/60 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <div className="animate-fade-in-up">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37] mb-6">
            APPLIED AI · QUANT FINANCE · RESEARCH COMMUNITY
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
            Where Applied Research Meets{' '}
            <span className="bg-gradient-to-r from-[#4A90E2] via-[#6BA4E8] to-[#D4AF37] bg-clip-text text-transparent">
              Project-Based Learning
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Quanta Foundry is an independent applied research and learning community exploring AI, quantitative finance, market systems, neuroscience, and emerging deep-tech methods through reading groups, Workspace Q, and selected project collaborations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href="/focus-areas" size="lg" id="hero-cta-programs">
              Explore Focus Areas
            </Button>
            <Button href="/community" variant="secondary" size="lg" id="hero-cta-partners">
              Join the Reading Club
            </Button>
          </div>
          <p className="mt-8 text-sm text-gray-500">
            <a href="/companies" className="hover:text-gray-300 transition-colors">For companies and institutions: propose a use case</a>
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none">
        <ChevronDown className="text-gray-500" size={28} />
      </div>
    </section>
  );
}
