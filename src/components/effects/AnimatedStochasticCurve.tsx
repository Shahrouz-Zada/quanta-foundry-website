'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';

export default function AnimatedStochasticCurve({ className = '' }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: '0px 0px -50px 0px' });
  
  const shouldAnimate = !prefersReducedMotion && isInView;

  // Predefined deterministic path showing regime shift (low vol -> high vol)
  // Low Volatility (X: 5 to 50): tight variance around Y=50
  // High Volatility (X: 50 to 85): high variance spikes
  const timeSeriesPath = "M 5 50 L 15 48 L 25 52 L 35 49 L 45 51 L 50 50 L 55 30 L 60 70 L 65 35 L 70 80 L 75 25 L 80 65 L 85 50";
  
  const cxPoints = [5, 15, 25, 35, 45, 50, 55, 60, 65, 70, 75, 80, 85, 85];
  const cyPoints = [50, 48, 52, 49, 51, 50, 30, 70, 35, 80, 25, 65, 50, 50];
  const opacityPoints = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0];

  // Confidence band / risk interval that expands significantly during high volatility
  const confidenceBand = "M 5 45 L 45 45 L 55 15 L 85 15 L 85 85 L 55 85 L 45 55 L 5 55 Z";

  return (
    <div ref={ref} className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Subtle Background Grid */}
        <path d="M 0 50 L 85 50" stroke="#00FF87" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M 50 0 L 50 100" stroke="#00FF87" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Main axes */}
        <path d="M 5 90 L 85 90" stroke="#00FF87" strokeOpacity="0.3" strokeWidth="1" />
        <path d="M 85 90 L 85 10" stroke="#00FF87" strokeOpacity="0.3" strokeWidth="1" />

        {/* Value at Risk (VaR) / Risk Threshold Line */}
        <line x1="5" y1="75" x2="85" y2="75" stroke="#FF4D4D" strokeWidth="0.5" strokeOpacity="0.5" strokeDasharray="2 2" />

        {/* Confidence Band (Regime Shift bounds) */}
        <motion.path 
          d={confidenceBand} 
          fill="#00FF87" 
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
            initial={{ cx: 5, cy: 50, opacity: 0 }}
            animate={{ cx: cxPoints, cy: cyPoints, opacity: opacityPoints }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        )}
        {/* Static dot for reduced motion */}
        {!shouldAnimate && <circle cx="85" cy="50" r="2" fill="#FFFFFF" />}

        {/* Risk Distribution (Normal Curve on the Right Axis) */}
        {/* Main Bell Curve Silhouette */}
        <path d="M 85 15 C 90 15, 98 40, 98 50 C 98 60, 90 85, 85 85" fill="#00FF87" fillOpacity="0.05" />
        <path d="M 85 15 C 90 15, 98 40, 98 50 C 98 60, 90 85, 85 85" stroke="#00FF87" strokeOpacity="0.6" strokeWidth="1" fill="none" />
        
        {/* Subtle Histogram Bars inside the curve */}
        <g fill="#00FF87" fillOpacity="0.15">
          <rect x="85" y="30" width="6" height="4" />
          <rect x="85" y="36" width="10" height="4" />
          <rect x="85" y="42" width="12" height="4" />
          <rect x="85" y="48" width="13" height="4" />
          <rect x="85" y="54" width="11" height="4" />
          <rect x="85" y="60" width="8" height="4" />
          <rect x="85" y="66" width="4" height="4" />
        </g>

        {/* Highlighted Risk Tail (VaR Region) below Y=75 */}
        <path d="M 85 75 C 88 75, 90 80, 85 85 Z" fill="#FF4D4D" fillOpacity="0.3" />
        <path d="M 85 75 C 88 75, 90 80, 85 85" stroke="#FF4D4D" strokeWidth="1" strokeOpacity="0.6" fill="none" />

        {/* Mean line in distribution */}
        <line x1="85" y1="50" x2="98" y2="50" stroke="#00FF87" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="1 1" />
      </svg>
    </div>
  );
}
