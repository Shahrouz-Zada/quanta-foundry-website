'use client';

import { motion } from 'framer-motion';

export default function AnimatedStochasticCurve({ className = '' }: { className?: string }) {
  // SVG Path definitions for a smooth morphing curve
  const path1 = "M 10 70 Q 25 20 40 50 T 70 30 T 90 40";
  const path2 = "M 10 65 Q 25 30 40 40 T 70 40 T 90 30";
  const path3 = "M 10 75 Q 25 10 40 60 T 70 20 T 90 50";

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Subtle Background Grid (Teal) */}
        <path d="M 10 80 L 90 80 M 10 80 L 10 20 M 30 80 L 30 20 M 50 80 L 50 20 M 70 80 L 70 20 M 90 80 L 90 20 M 10 60 L 90 60 M 10 40 L 90 40" 
              stroke="#00A896" 
              strokeOpacity="0.15" 
              strokeWidth="1" 
              fill="none" 
        />
        
        {/* Main axes (Teal) */}
        <path d="M 10 80 L 90 80 M 10 80 L 10 20" stroke="#00A896" strokeOpacity="0.5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        
        {/* The evolving curve (Emerald Green) */}
        <motion.path
          d={path1}
          stroke="#00FF87"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          animate={{ d: [path1, path2, path3, path1] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Moving data point tracing the invisible path curve */}
        <motion.circle
          r="3"
          fill="#FFFFFF"
          stroke="#00FF87"
          strokeWidth="1"
          animate={{ 
            cx: [10, 40, 70, 90, 70, 40, 10], 
            cy: [70, 50, 30, 40, 30, 50, 70] 
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
}
