'use client';

import { motion } from 'framer-motion';

export default function AnimatedNeuralNet({ className = '' }: { className?: string }) {
  const paths = [
    "M 15 30 L 45 20", "M 15 30 L 45 50", "M 15 30 L 45 80",
    "M 15 70 L 45 20", "M 15 70 L 45 50", "M 15 70 L 45 80",
    "M 55 20 L 85 35", "M 55 20 L 85 65",
    "M 55 50 L 85 35", "M 55 50 L 85 65",
    "M 55 80 L 85 35", "M 55 80 L 85 65"
  ];

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Static connection lines (Deep Blue) */}
        {paths.map((d, i) => (
          <path key={`static-${i}`} d={d} stroke="#0077FF" strokeWidth="1" strokeOpacity="0.3" fill="none" />
        ))}
        
        {/* Animated pulses along the lines (Electric Cyan) */}
        {paths.map((d, i) => (
          <motion.path
            key={`anim-${i}`}
            d={d}
            stroke="#00E5FF"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{
              duration: 1.5 + (i % 3) * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.1,
            }}
          />
        ))}

        {/* Input Nodes (Electric Cyan) */}
        <circle cx="15" cy="30" r="3" fill="#00E5FF" />
        <circle cx="15" cy="70" r="3" fill="#00E5FF" />
        
        {/* Hidden Layer Nodes */}
        <circle cx="50" cy="20" r="4" fill="#0077FF" />
        <motion.circle cx="50" cy="50" r="5" fill="#00E5FF" animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }} />
        <circle cx="50" cy="80" r="4" fill="#0077FF" />
        
        {/* Output Nodes */}
        <circle cx="85" cy="35" r="3" fill="#00E5FF" />
        <circle cx="85" cy="65" r="3" fill="#00E5FF" />
      </svg>
    </div>
  );
}
