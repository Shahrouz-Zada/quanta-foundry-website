'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';

export default function AnimatedBlochSphere({ className = '' }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: '0px 0px -50px 0px' });
  
  const shouldAnimate = !prefersReducedMotion && isInView;

  return (
    <div ref={ref} className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* ======================= */}
        {/* LEFT: Bloch Sphere Motif */}
        {/* ======================= */}
        <g transform="translate(25, 50)">
          {/* Sphere Outline */}
          <circle cx="0" cy="0" r="20" stroke="#8A2BE2" strokeOpacity="0.3" strokeWidth="1" fill="none" />
          
          {/* Z-Axis */}
          <line x1="0" y1="-25" x2="0" y2="25" stroke="#8A2BE2" strokeOpacity="0.5" strokeWidth="0.5" strokeDasharray="1 1" />
          {/* Equator */}
          <ellipse cx="0" cy="0" rx="20" ry="6" stroke="#8A2BE2" strokeOpacity="0.4" strokeWidth="0.5" fill="none" />

          {/* State Vector */}
          <motion.g
            animate={shouldAnimate ? { rotate: [0, 180, 360] } : { rotate: 45 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            <line x1="0" y1="0" x2="12" y2="-12" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="-12" r="2" fill="#D4AF37" />
            <motion.circle 
              cx="12" cy="-12" r="3" fill="#D4AF37" fillOpacity="0.3"
              animate={shouldAnimate ? { scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] } : { scale: 1, opacity: 0.3 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.g>
          
          <circle cx="0" cy="0" r="1.5" fill="#8A2BE2" />
        </g>

        {/* ======================= */}
        {/* RIGHT: Quantum Circuit   */}
        {/* ======================= */}
        <g transform="translate(55, 35)">
          {/* Qubit wires */}
          <line x1="0" y1="0" x2="40" y2="0" stroke="#4B0082" strokeWidth="1" strokeOpacity="0.5" />
          <line x1="0" y1="30" x2="40" y2="30" stroke="#4B0082" strokeWidth="1" strokeOpacity="0.5" />

          {/* Hadamard Gate on q0 */}
          <rect x="5" y="-7" width="14" height="14" rx="1" fill="#8A2BE2" fillOpacity="0.1" stroke="#8A2BE2" strokeWidth="1" />
          <text x="12" y="3" fontSize="8" fill="#8A2BE2" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">H</text>

          {/* CNOT Gate connecting q0 (control) to q1 (target) */}
          <circle cx="30" cy="0" r="2" fill="#D4AF37" />
          <line x1="30" y1="0" x2="30" y2="30" stroke="#D4AF37" strokeWidth="1" />
          <circle cx="30" cy="30" r="4" fill="none" stroke="#D4AF37" strokeWidth="1" />
          <line x1="30" y1="26" x2="30" y2="34" stroke="#D4AF37" strokeWidth="1" />
          <line x1="26" y1="30" x2="34" y2="30" stroke="#D4AF37" strokeWidth="1" />

          {/* Measurement pulses traveling down the wire */}
          {shouldAnimate && (
            <motion.circle
              r="1.5"
              fill="#D4AF37"
              initial={{ cx: 0, cy: 0, opacity: 0 }}
              animate={{ cx: [0, 40], opacity: [0, 1, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
            />
          )}
        </g>
      </svg>
    </div>
  );
}
