'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';

export default function AnimatedStochasticCurve({ className = '' }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: '0px 0px -50px 0px' });
  
  const shouldAnimate = !prefersReducedMotion && isInView;

  // Predefined deterministic path showing regime shift (low vol -> high vol)
  const timeSeriesPath = "M 5 60 L 15 58 L 25 62 L 35 55 L 45 65 L 50 60 L 55 35 L 60 70 L 65 40 L 70 80 L 75 45 L 80 65 L 85 50";
  
  // Confidence band / risk interval that expands during high volatility
  const confidenceBand = "M 5 55 L 35 50 L 50 55 L 60 25 L 75 35 L 85 45 L 85 65 L 75 75 L 60 85 L 50 65 L 35 65 L 5 65 Z";

  return (
    <div ref={ref} className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Subtle Background Grid */}
        <path d="M 0 50 L 85 50" stroke="#00FF87" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M 45 0 L 45 100" stroke="#00FF87" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Main axes */}
        <path d="M 5 90 L 85 90" stroke="#00FF87" strokeOpacity="0.3" strokeWidth="1" />
        <path d="M 85 90 L 85 10" stroke="#00FF87" strokeOpacity="0.3" strokeWidth="1" />

        {/* Confidence Band (Regime Shift bounds) */}
        <motion.path 
          d={confidenceBand} 
          fill="#00FF87" 
          fillOpacity="0.05"
          animate={shouldAnimate ? { opacity: [0.05, 0.15, 0.05] } : { opacity: 0.1 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Time Series Curve */}
        <motion.path
          d={timeSeriesPath}
          stroke="#00FF87"
          strokeWidth="1.5"
          fill="none"
          strokeLinejoin="round"
          initial={shouldAnimate ? { pathLength: 0 } : { pathLength: 1 }}
          animate={shouldAnimate ? { pathLength: [0, 1, 1] } : { pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Pulsing Dot at current time step */}
        {shouldAnimate && (
          <motion.circle
            r="2"
            fill="#FFFFFF"
            initial={{ cx: 5, cy: 60, opacity: 0 }}
            animate={{ 
              cx: [5, 15, 25, 35, 45, 50, 55, 60, 65, 70, 75, 80, 85, 85],
              cy: [60, 58, 62, 55, 65, 60, 35, 70, 40, 80, 45, 65, 50, 50],
              opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        )}
        {/* Static dot for reduced motion */}
        {!shouldAnimate && <circle cx="85" cy="50" r="2" fill="#FFFFFF" />}

        {/* Risk Distribution (Normal Curve on the Right Axis) */}
        <path d="M 85 25 Q 95 25 98 50 Q 95 75 85 75" fill="#00FF87" fillOpacity="0.15" />
        <path d="M 85 25 Q 95 25 98 50 Q 95 75 85 75" stroke="#00FF87" strokeOpacity="0.5" strokeWidth="1" fill="none" />
        
        {/* Mean line in distribution */}
        <line x1="85" y1="50" x2="98" y2="50" stroke="#00FF87" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="1 1" />
      </svg>
    </div>
  );
}
