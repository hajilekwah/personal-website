import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { AccentTheme } from '../types';

interface ParticleCanvasProps {
  theme: AccentTheme;
  speed: number;
  particleCount: number;
  interactiveGlow: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  originalAlpha: number;
}

export default function ParticleCanvas({
  theme,
  speed,
  particleCount,
  interactiveGlow,
}: ParticleCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const particlesRef = useRef<Particle[]>([]);

  // Web Theme Accents (tailwind palette hex mappings)
  const themeColors: Record<AccentTheme, { primary: string; secondary: string }> = {
    indigo: { primary: '#6366f1', secondary: '#4f46e5' },
    emerald: { primary: '#10b981', secondary: '#059669' },
    crimson: { primary: '#f43f5e', secondary: '#e11d48' },
    amber: { primary: '#f59e0b', secondary: '#d97706' },
    cyan: { primary: '#06b6d4', secondary: '#0891b2' },
  };

  const activeColor = themeColors[theme];

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sizing handling with ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      canvas.width = width;
      canvas.height = height;
      initParticles(width, height);
    });

    resizeObserver.observe(container);

    // Initializer
    const initParticles = (w: number, h: number) => {
      const particles: Particle[] = [];
      const count = Math.min(particleCount, Math.floor((w * h) / 12000));
      
      for (let i = 0; i < count; i++) {
        const alpha = Math.random() * 0.4 + 0.1;
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.6 * speed,
          vy: (Math.random() - 0.5) * 0.6 * speed,
          radius: Math.random() * 2 + 1,
          alpha,
          originalAlpha: alpha,
        });
      }
      particlesRef.current = particles;
    };

    // Tracking mouse movements
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    // Click trigger: dynamic star burst at click location
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Spawn extra interactive particles
      const burstCount = 12;
      for (let i = 0; i < burstCount; i++) {
        const angle = (Math.PI * 2 * i) / burstCount + Math.random() * 0.2;
        const force = Math.random() * 2 + 1;
        particlesRef.current.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * force,
          vy: Math.sin(angle) * force,
          radius: Math.random() * 1.5 + 1.2,
          alpha: 1,
          originalAlpha: 0.1, // fade out completely
        });
      }

      // Limit max particles array size to prevent performance issues
      if (particlesRef.current.length > 250) {
        particlesRef.current.splice(0, particlesRef.current.length - 250);
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('click', handleCanvasClick);

    // Frame loops using GSAP Ticker for buttery 60fps
    const tick = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Draw subtle layout glow under current mouse coordination
      if (interactiveGlow && mouse.active) {
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          Math.min(w, h) * 0.35
        );
        gradient.addColorStop(0, `${activeColor.primary}22`);
        gradient.addColorStop(0.5, `${activeColor.primary}05`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, Math.min(w, h) * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      // Animation updating & rendering
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Normal drift speed
        p.x += p.vx * speed;
        p.y += p.vy * speed;

        // Wall boundary checks
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Hover repulsion / attraction
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const limit = 160;

          if (dist < limit) {
            const force = (limit - dist) / limit;
            
            // Repulsion drift
            p.x += (dx / dist) * force * 2;
            p.y += (dy / dist) * force * 2;

            // Highlight alpha when close
            p.alpha = Math.min(p.originalAlpha + force * 0.5, 0.85);
          } else {
            p.alpha = Math.max(p.alpha - 0.02, p.originalAlpha);
          }
        } else {
          p.alpha = Math.max(p.alpha - 0.02, p.originalAlpha);
        }

        // Fade out extra particles created by click bursts
        if (p.originalAlpha === 0.1) {
          p.alpha -= 0.015;
        }

        // Drop particles that completely faded
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          i--;
          continue;
        }

        // Draw node dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${activeColor.primary}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();

        // Constellation lines rendering
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 110;

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.14 * Math.min(p.alpha, p2.alpha);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${activeColor.primary}${Math.floor(lineAlpha * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    };

    // Bind event loop to GSAP’s central synchronized tick mechanics
    gsap.ticker.add(tick);

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('click', handleCanvasClick);
      gsap.ticker.remove(tick);
    };
  }, [theme, speed, particleCount, interactiveGlow, activeColor]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair z-0 overflow-hidden"
    >
      <canvas ref={canvasRef} className="block w-full h-full" id="particles-stage" />
    </div>
  );
}
