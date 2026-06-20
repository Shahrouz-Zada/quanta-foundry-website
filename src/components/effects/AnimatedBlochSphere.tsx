'use client';

import { motion } from 'framer-motion';

export default function AnimatedBlochSphere({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Outer sphere boundary (Deep Indigo) */}
        <circle cx="50" cy="50" r="40" stroke="#4B0082" strokeOpacity="0.4" strokeWidth="1.5" fill="none" />
        
        {/* Z axis (Deep Indigo) */}
        <line x1="50" y1="5" x2="50" y2="95" stroke="#4B0082" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="2 2" />
        {/* X/Y plane crosshair (Deep Indigo) */}
        <line x1="10" y1="50" x2="90" y2="50" stroke="#4B0082" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="2 2" />
        
        {/* Horizontal orbital plane (Violet) */}
        <motion.ellipse 
          cx="50" cy="50" rx="40" ry="12" 
          stroke="#8A2BE2" 
          strokeOpacity="0.6" 
          strokeWidth="1.5" 
          fill="none"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '50px 50px' }}
        />
        
        {/* Vertical orbital plane (Violet) */}
        <motion.ellipse 
          cx="50" cy="50" rx="12" ry="40" 
          stroke="#8A2BE2" 
          strokeOpacity="0.6" 
          strokeWidth="1.5" 
          fill="none"
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '50px 50px' }}
        />
        
        {/* Nucleus / Center Point (Gold) */}
        <circle cx="50" cy="50" r="3" fill="#D4AF37" />
        
        {/* Orbiting State Vector / Electron */}
        <motion.g
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '50px 50px' }}
        >
          {/* A glowing dot representing the state rotating along the outer boundary (Gold) */}
          <circle cx="50" cy="10" r="4" fill="#D4AF37" />
          {/* Subtle connection line to center (Gold) */}
          <line x1="50" y1="50" x2="50" y2="10" stroke="#D4AF37" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>
      </svg>
    </div>
  );
}
