'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';

export default function AnimatedNeuralNet({ className = '' }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: '0px 0px -50px 0px' });
  
  const shouldAnimate = !prefersReducedMotion && isInView;

  // Paths for data ingestion
  const dataPath1 = "M 5 30 Q 15 30 25 50";
  const dataPath2 = "M 5 50 L 25 50";
  const dataPath3 = "M 5 70 Q 15 70 25 50";

  // Neural connections
  const netPaths = [
    "M 35 50 L 50 35", "M 35 50 L 50 50", "M 35 50 L 50 65",
    "M 50 35 L 65 50", "M 50 50 L 65 50", "M 50 65 L 65 50"
  ];

  return (
    <div ref={ref} className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Background Grid */}
        <path d="M 0 50 L 100 50 M 50 0 L 50 100" stroke="#0077FF" strokeOpacity="0.05" strokeWidth="1" />

        {/* Data Ingestion Lines */}
        <path d={dataPath1} stroke="#0077FF" strokeWidth="1" strokeOpacity="0.3" fill="none" strokeDasharray="2 2" />
        <path d={dataPath2} stroke="#0077FF" strokeWidth="1" strokeOpacity="0.3" fill="none" strokeDasharray="2 2" />
        <path d={dataPath3} stroke="#0077FF" strokeWidth="1" strokeOpacity="0.3" fill="none" strokeDasharray="2 2" />

        {/* Flowing Data Particles */}
        <motion.circle r="1.5" fill="#00E5FF" 
          animate={shouldAnimate ? { cx: [5, 15, 25], cy: [30, 30, 50], opacity: [0, 1, 0] } : { cx: 25, cy: 50, opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle r="1.5" fill="#00E5FF" 
          animate={shouldAnimate ? { cx: [5, 15, 25], cy: [70, 70, 50], opacity: [0, 1, 0] } : { cx: 25, cy: 50, opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
        />

        {/* Processing Block */}
        <rect x="25" y="25" width="10" height="50" rx="2" fill="#0077FF" fillOpacity="0.1" stroke="#0077FF" strokeWidth="0.5" />
        <circle cx="35" cy="50" r="3" fill="#0077FF" />

        {/* Neural Network Static Lines */}
        {netPaths.map((d, i) => (
          <path key={`net-${i}`} d={d} stroke="#0077FF" strokeWidth="1" strokeOpacity="0.2" fill="none" />
        ))}

        {/* Animated Activations */}
        {netPaths.map((d, i) => (
          <motion.path
            key={`anim-${i}`}
            d={d}
            stroke="#00E5FF"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 0.5 }}
            animate={shouldAnimate ? { pathLength: 1, opacity: [0, 1, 0] } : { pathLength: 1, opacity: 0.5 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2 + 0.5,
            }}
          />
        ))}

        {/* Nodes */}
        <circle cx="50" cy="35" r="2.5" fill="#0077FF" />
        <motion.circle cx="50" cy="50" r="3.5" fill="#00E5FF" 
          animate={shouldAnimate ? { scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] } : { scale: 1, opacity: 1 }} 
          transition={{ duration: 2, repeat: Infinity }} 
        />
        <circle cx="50" cy="65" r="2.5" fill="#0077FF" />
        <circle cx="65" cy="50" r="3" fill="#0077FF" />

        {/* Output Prediction Boundary */}
        <path d="M 65 50 Q 80 50 90 30" stroke="#0077FF" strokeWidth="1" strokeOpacity="0.3" fill="none" strokeDasharray="2 2" />
        <path d="M 65 50 Q 80 50 90 70" stroke="#0077FF" strokeWidth="1" strokeOpacity="0.3" fill="none" strokeDasharray="2 2" />
        
        <motion.path 
          d="M 65 50 C 75 50, 85 30, 95 30" 
          stroke="#00E5FF" 
          strokeWidth="2" 
          fill="none" 
          strokeLinecap="round"
          initial={shouldAnimate ? { pathLength: 0 } : { pathLength: 1 }}
          animate={shouldAnimate ? { pathLength: [0, 1, 1] } : { pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
        />

        {/* Probability Distribution curve on right axis */}
        <path d="M 95 20 Q 90 30 95 40 Q 100 30 95 20" fill="#00E5FF" fillOpacity="0.2" />
      </svg>
    </div>
  );
}
