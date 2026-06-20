'use client';

import { useEffect, useRef } from 'react';

interface InteractiveBackgroundProps {
  type?: 'particles' | 'gaussian-process';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface DataPoint {
  x: number;
  y: number;
  baseY: number;
  phase: number;
  speed: number;
  amp: number;
  isMouse?: boolean;
}

export default function InteractiveBackground({ type = 'gaussian-process' }: InteractiveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // -------------------------------------------------------------
    // SETUP FOR PARTICLES VARIANT
    // -------------------------------------------------------------
    let particles: Particle[] = [];

    const initParticles = () => {
      const count = Math.floor((canvas.width * canvas.height) / 15000);
      particles = Array.from({ length: Math.min(count, 80) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
      }));
    };

    // -------------------------------------------------------------
    // SETUP FOR GAUSSIAN PROCESS VARIANT
    // -------------------------------------------------------------
    let gpPoints: DataPoint[] = [];

    const initGpPoints = () => {
      const count = 4;
      const step = canvas.width / (count + 1);
      gpPoints = Array.from({ length: count }, (_, i) => {
        const x = step * (i + 1);
        const baseY = canvas.height / 2;
        return {
          x,
          y: baseY,
          baseY,
          phase: Math.random() * Math.PI * 2,
          speed: 0.008 + Math.random() * 0.006, // speed of oscillation
          amp: canvas.height * 0.12 + Math.random() * canvas.height * 0.06, // amplitude
        };
      });
    };

    // RBF Interpolation math representing Gaussian Process prediction
    const computeGP = (x: number, points: DataPoint[], height: number, lengthscale: number) => {
      let numerator = 0;
      let denominator = 0;
      let maxKernelVal = 0;

      const priorMean = height / 2;
      const priorWeight = 0.05; // strength of reversion back to H/2 in sparse areas

      points.forEach((p) => {
        // RBF Kernel: exp(-(x-x')^2 / (2 * lengthscale^2))
        const distSq = (x - p.x) * (x - p.x);
        const kernelVal = Math.exp(-distSq / (2 * lengthscale * lengthscale));
        
        numerator += kernelVal * p.y;
        denominator += kernelVal;
        
        if (kernelVal > maxKernelVal) {
          maxKernelVal = kernelVal;
        }
      });

      // Mean prediction (combines interpolation weights + prior reversion weight)
      const mean = (numerator + priorWeight * priorMean) / (denominator + priorWeight);
      
      // Standard deviation representing uncertainty (low near observations, high in sparse spots)
      const maxStd = height * 0.16; // maximum uncertainty width
      const std = maxStd * Math.sqrt(Math.max(0, 1 - maxKernelVal));

      return { mean, std };
    };

    // -------------------------------------------------------------
    // CORE CANVAS ENGINE
    // -------------------------------------------------------------
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      if (type === 'particles') {
        initParticles();
      } else {
        initGpPoints();
      }
    };

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (type === 'particles') {
        // --- DRAW PARTICLES ---
        // Draw connections
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(74, 144, 226, ${0.15 * (1 - dist / 150)})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }

        // Draw and update particles
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(74, 144, 226, 0.6)';
          ctx.fill();

          if (!prefersReducedMotion) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
          }
        });
      } else {
        // --- DRAW GAUSSIAN PROCESS WAVE ---
        const lengthscale = w * 0.15; // smooth envelope lengthscale (15% of width)

        // 1. Update background data points coordinates
        if (!prefersReducedMotion) {
          gpPoints.forEach((p) => {
            p.phase += p.speed;
            p.y = p.baseY + Math.sin(p.phase) * p.amp;
          });
        }

        // 2. Build list of observed points (including mouse coordinates if active)
        const activePoints = [...gpPoints];
        if (mouseRef.current.active) {
          activePoints.push({
            x: mouseRef.current.x,
            y: mouseRef.current.y,
            baseY: h / 2,
            phase: 0,
            speed: 0,
            amp: 0,
            isMouse: true,
          });
        }

        // 3. Draw math coordinate grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.lineWidth = 0.8;
        const gridSpacing = 80;
        for (let x = 0; x < w; x += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // 4. Draw uncertainty confidence interval ribbon (fill polygons)
        ctx.beginPath();
        const step = 8;
        // Trace top limit: Mean - 1.96 * Std
        for (let x = 0; x <= w; x += step) {
          const { mean, std } = computeGP(x, activePoints, h, lengthscale);
          ctx.lineTo(x, mean - 1.96 * std);
        }
        // Trace bottom limit back to left: Mean + 1.96 * Std
        for (let x = w; x >= 0; x -= step) {
          const { mean, std } = computeGP(x, activePoints, h, lengthscale);
          ctx.lineTo(x, mean + 1.96 * std);
        }
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, 'rgba(74, 144, 226, 0.02)');
        grad.addColorStop(0.4, 'rgba(74, 144, 226, 0.08)');
        grad.addColorStop(0.7, 'rgba(212, 175, 55, 0.04)');
        grad.addColorStop(1, 'rgba(74, 144, 226, 0.01)');
        ctx.fillStyle = grad;
        ctx.fill();

        // 5. Draw GP prediction mean curve line
        ctx.beginPath();
        for (let x = 0; x <= w; x += step) {
          const { mean } = computeGP(x, activePoints, h, lengthscale);
          if (x === 0) ctx.moveTo(x, mean);
          else ctx.lineTo(x, mean);
        }
        ctx.strokeStyle = 'rgba(74, 144, 226, 0.45)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 6. Draw glowing observation points
        activePoints.forEach((p) => {
          const isMouse = p.isMouse;
          ctx.beginPath();
          ctx.arc(p.x, p.y, isMouse ? 5 : 4, 0, Math.PI * 2);
          ctx.fillStyle = isMouse ? '#D4AF37' : '#4A90E2';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, isMouse ? 12 : 9, 0, Math.PI * 2);
          ctx.strokeStyle = isMouse ? 'rgba(212, 175, 55, 0.3)' : 'rgba(74, 144, 226, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }

      if (!prefersReducedMotion) {
        animationId = requestAnimationFrame(draw);
      }
    };

    // -------------------------------------------------------------
    // EVENT LISTENERS
    // -------------------------------------------------------------
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseRef.current.active = true;
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.active = false;
    };

    resize();
    if (!prefersReducedMotion) {
      draw();
    } else {
      // Draw static frame for reduced motion
      draw();
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block w-full h-full bg-[#0A1929]"
      aria-hidden="true"
    />
  );
}
