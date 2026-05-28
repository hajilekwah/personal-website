import { useEffect, useRef } from 'react';

interface SlimeParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  life: number; // 0 to 1
  decay: number;
  type: 'trail' | 'drip' | 'splash' | 'lava-up' | 'lava-down';
  gravity: number;
}

interface CeilingSlime {
  x: number;
  y: number;
  targetY: number;
  currentY: number;
  radius: number;
  speed: number;
  lastDripTime: number;
}

interface FloorSlime {
  x: number;
  y: number;
  targetY: number; // hangs upward (e.g. height - offset)
  currentY: number;
  radius: number;
  speed: number;
  lastRiseTime: number;
}

export default function SlimeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<SlimeParticle[]>([]);
  const ceilingSlimesRef = useRef<CeilingSlime[]>([]);
  const floorSlimesRef = useRef<FloorSlime[]>([]);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  const nextId = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initialize fixed dripping hanging nodes at the top ceiling
    const initCeilingNodes = (w: number) => {
      const numCeilingNodes = Math.max(6, Math.floor(w / 140));
      const ceilingNodes: CeilingSlime[] = [];
      for (let i = 0; i < numCeilingNodes; i++) {
        const spacing = w / numCeilingNodes;
        const x = spacing * i + spacing / 2 + (Math.random() - 0.5) * 30;
        ceilingNodes.push({
          x,
          y: 0,
          currentY: 0,
          targetY: 20 + Math.random() * 25,
          radius: 30 + Math.random() * 25, // thick gooey bulbs
          speed: 0.02 + Math.random() * 0.03,
          lastDripTime: Date.now() + Math.random() * 3000,
        });
      }
      return ceilingNodes;
    };

    // Initialize boiling rising nodes at the bottom floor
    const initFloorNodes = (w: number, h: number) => {
      const numFloorNodes = Math.max(6, Math.floor(w / 140));
      const floorNodes: FloorSlime[] = [];
      for (let i = 0; i < numFloorNodes; i++) {
        const spacing = w / numFloorNodes;
        const x = spacing * i + spacing / 2 + (Math.random() - 0.5) * 30;
        floorNodes.push({
          x,
          y: h,
          currentY: h,
          targetY: h - (20 + Math.random() * 25),
          radius: 30 + Math.random() * 25,
          speed: 0.02 + Math.random() * 0.03,
          lastRiseTime: Date.now() + Math.random() * 3000,
        });
      }
      return floorNodes;
    };

    ceilingSlimesRef.current = initCeilingNodes(width);
    floorSlimesRef.current = initFloorNodes(width, height);

    // Handle Resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: entryWidth, height: entryHeight } = entry.contentRect;
        width = canvas.width = entryWidth;
        height = canvas.height = entryHeight;

        // Re-adjust nodes on screen resize
        ceilingSlimesRef.current = initCeilingNodes(width);
        floorSlimesRef.current = initFloorNodes(width, height);
      }
    });

    resizeObserver.observe(canvas.parentElement || document.body);

    // Spawn splashes when drops impact floor/ceiling pools
    const createSlimeSplash = (x: number, y: number, radius: number, upwards = true) => {
      const count = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        // Spray angle depending on direction of collision
        const baseAngle = upwards ? -Math.PI / 2 : Math.PI / 2;
        const angle = baseAngle + (Math.random() - 0.5) * 1.6;
        const speedMultiplier = 1.5 + Math.random() * 3;
        particlesRef.current.push({
          id: nextId.current++,
          x,
          y: upwards ? y - 8 : y + 8,
          vx: Math.cos(angle) * speedMultiplier,
          vy: Math.sin(angle) * speedMultiplier,
          radius: radius * 0.25 + Math.random() * (radius * 0.15),
          baseRadius: radius * 0.25,
          life: 1.0,
          decay: 0.025 + Math.random() * 0.025,
          type: 'splash',
          gravity: upwards ? 0.12 : -0.12, // match spray direction
        });
      }
    };

    // Main Simulation Loop
    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const ceilingNodes = ceilingSlimesRef.current;
      const floorNodes = floorSlimesRef.current;
      const now = Date.now();

      // Ensure black canvas backer for contrast metaball filter to merge nodes
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      // --- 1. RENDER & UPDATE CEILING HANGING RESERVOIRS ---
      ceilingNodes.forEach((node) => {
        // Slowly move towards current design targets
        node.currentY += (node.targetY - node.currentY) * node.speed;
        
        // Lava release: detachment sequence
        const timeDiff = now - node.lastDripTime;
        // Lava lamp interval: release sinking globs periodically
        if (timeDiff > 2500 + Math.random() * 4000) {
          // Heat/weight swell effect
          node.targetY = 60 + Math.random() * 40;
          node.radius += 6;
          
          // Spawn large lava-down sinking globule!
          particles.push({
            id: nextId.current++,
            x: node.x + (Math.random() - 0.5) * 10,
            y: node.currentY + 15,
            vx: (Math.random() - 0.5) * 0.4,
            vy: 0.3 + Math.random() * 0.5, // slow gooey descend
            radius: 16 + Math.random() * 18,
            baseRadius: 18,
            life: 1.0,
            decay: 0.0001, // persists until merge
            type: 'lava-down',
            gravity: 0.015, // extremely low gravity so it acts as suspended fluid
          });

          node.lastDripTime = now;
          node.targetY = 20 + Math.random() * 20; // pull back
          node.radius = Math.max(25, node.radius - 10);
        }

        // Draw ceiling gooey element
        const grad = ctx.createRadialGradient(
          node.x,
          node.currentY - 15,
          1,
          node.x,
          node.currentY,
          node.radius * 1.6
        );
        grad.addColorStop(0, '#39ff14');
        grad.addColorStop(0.35, '#22c55e');
        grad.addColorStop(0.7, 'rgba(16, 185, 129, 0.4)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(node.x, node.currentY, node.radius * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Screen rim connection
        ctx.beginPath();
        ctx.moveTo(node.x - node.radius * 1.4, 0);
        ctx.quadraticCurveTo(node.x, node.currentY, node.x + node.radius * 1.4, 0);
        ctx.closePath();
        ctx.fill();
      });

      // --- 2. RENDER & UPDATE FLOOR BOILING RESERVOIRS ---
      floorNodes.forEach((node) => {
        // Slide up/down
        node.currentY += (node.targetY - node.currentY) * node.speed;

        // Lava release: float upward sequence
        const timeDiff = now - node.lastRiseTime;
        if (timeDiff > 2500 + Math.random() * 4000) {
          // Swell upward
          node.targetY = height - (60 + Math.random() * 40);
          node.radius += 6;

          // Spawn heavy lava-up rising globule!
          particles.push({
            id: nextId.current++,
            x: node.x + (Math.random() - 0.5) * 10,
            y: node.currentY - 15,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -(0.3 + Math.random() * 0.5), // slow vertical ascending buoyancy
            radius: 16 + Math.random() * 18,
            baseRadius: 18,
            life: 1.0,
            decay: 0.0001,
            type: 'lava-up',
            gravity: -0.015, // float factor pulling upwards
          });

          node.lastRiseTime = now;
          node.targetY = height - (20 + Math.random() * 20); // pull back to floor
          node.radius = Math.max(25, node.radius - 10);
        }

        // Draw floor pool glow
        const grad = ctx.createRadialGradient(
          node.x,
          node.currentY + 15,
          1,
          node.x,
          node.currentY,
          node.radius * 1.6
        );
        grad.addColorStop(0, '#39ff14');
        grad.addColorStop(0.35, '#22c55e');
        grad.addColorStop(0.7, 'rgba(16, 185, 129, 0.4)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(node.x, node.currentY, node.radius * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Screen bottom rim connection
        ctx.beginPath();
        ctx.moveTo(node.x - node.radius * 1.4, height);
        ctx.quadraticCurveTo(node.x, node.currentY, node.x + node.radius * 1.4, height);
        ctx.closePath();
        ctx.fill();
      });

      // --- 3. PROCESS ACTIVE BODIES ---
      const activeParticles: SlimeParticle[] = [];

      particles.forEach((p) => {
        // Wobble physics and buoyancy flow
        p.vy += p.gravity;

        // Lava lamp natural horizontal drifting wobble
        if (p.type === 'lava-up' || p.type === 'lava-down') {
          // Slow organic waving movement
          p.vx += Math.sin(p.y * 0.006 + p.id) * 0.04;
          p.vx *= 0.96; // keep drag tight
          
          // Bubble pulsation effect (slow swelling/shrinking)
          p.radius = p.baseRadius + Math.sin(now * 0.0012 + p.id) * 3;

          // Tactile Cursor feedback: push bubbles gently on mouse approach
          if (lastMousePos.current) {
            const mx = lastMousePos.current.x;
            const my = lastMousePos.current.y;
            const dx = p.x - mx;
            const dy = p.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140) {
              const force = (140 - dist) * 0.05;
              // Add responsive sideward drift away from cursor
              p.vx += (dx / (dist || 1)) * force * 0.15;
              p.vy += (dy / (dist || 1)) * force * 0.08;
            }
          }
        } else if (p.type === 'drip') {
          p.vx += Math.sin(p.y * 0.05 + p.id) * 0.05;
          p.vx *= 0.98;
          p.radius -= 0.0035;
        } else if (p.type === 'trail') {
          p.vx *= 0.94;
          p.vy *= 0.94;
        }

        // Apply velocities
        p.x += p.vx;
        p.y += p.vy;

        // Apply decay
        p.life -= p.decay;

        // Lifecycle and impact bounds
        let isMerged = false;

        // Absorption tests when floating lava blocks reach the poles
        if (p.type === 'lava-up' && p.y <= 60) {
          // Merge with closest ceiling node to feed it
          let closestNode = ceilingNodes[0];
          let minDist = width;
          ceilingNodes.forEach((node) => {
            const dist = Math.abs(node.x - p.x);
            if (dist < minDist) {
              minDist = dist;
              closestNode = node;
            }
          });
          if (closestNode) {
            closestNode.radius = Math.min(85, closestNode.radius + 4);
            closestNode.targetY = Math.min(75, closestNode.targetY + 5);
            createSlimeSplash(p.x, closestNode.currentY, p.radius, false);
            isMerged = true;
          }
        }

        if (p.type === 'lava-down' && p.y >= height - 60) {
          // Merge with closest floor node
          let closestNode = floorNodes[0];
          let minDist = width;
          floorNodes.forEach((node) => {
            const dist = Math.abs(node.x - p.x);
            if (dist < minDist) {
              minDist = dist;
              closestNode = node;
            }
          });
          if (closestNode) {
            closestNode.radius = Math.min(85, closestNode.radius + 4);
            closestNode.targetY = Math.max(height - 75, closestNode.targetY - 5);
            createSlimeSplash(p.x, closestNode.currentY, p.radius, true);
            isMerged = true;
          }
        }

        const isOutOfBounds = p.y > height + 40 || p.y < -40 || p.x < -40 || p.x > width + 40;
        const isExtinguished = p.life <= 0 || p.radius <= 1.5;

        if (!isMerged && !isOutOfBounds && !isExtinguished) {
          activeParticles.push(p);

          // Render physical drop sizing
          const drawRadius = p.radius * (p.type === 'trail' ? p.life : 1);
          
          if (drawRadius > 0.5) {
            const grad = ctx.createRadialGradient(
              p.x,
              p.y,
              0,
              p.x,
              p.y,
              drawRadius * 2.3
            );
            
            grad.addColorStop(0, '#58ff44'); // core neon green highlight
            grad.addColorStop(0.3, '#39ff14'); // slime body
            grad.addColorStop(0.65, 'rgba(16, 185, 129, 0.35)'); // molten envelope
            grad.addColorStop(1, 'rgba(16, 185, 129, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, drawRadius * 2.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      particlesRef.current = activeParticles;
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    // Mouse interactive trail generator
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const lastPos = lastMousePos.current;

      if (lastPos) {
        const dx = mouseX - lastPos.x;
        const dy = mouseY - lastPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Continuous interpolation of trace
        const step = 6;
        const steps = Math.max(1, Math.floor(dist / step));
        
        for (let i = 0; i < steps; i++) {
          const ratio = i / steps;
          const px = lastPos.x + dx * ratio;
          const py = lastPos.y + dy * ratio;

          particlesRef.current.push({
            id: nextId.current++,
            x: px,
            y: py,
            vx: (Math.random() - 0.5) * 0.3,
            vy: 0.1 + Math.random() * 0.15,
            radius: 18 + Math.random() * 20,
            baseRadius: 28,
            life: 1.0,
            decay: 0.009, // quick fuse decay to ensure stability
            type: 'trail',
            gravity: 0.015,
          });
        }

        // Pull ceiling bulbs on approaches
        ceilingSlimesRef.current.forEach((node) => {
          const subX = mouseX - node.x;
          const subY = mouseY - node.currentY;
          const distNode = Math.sqrt(subX * subX + subY * subY);
          if (distNode < 150) {
            node.targetY = 25 + (150 - distNode) * 0.5 + Math.random() * 15;
            node.radius = Math.min(80, node.radius + 0.5);
          }
        });

        // Pull floor bulbs on approaches
        floorSlimesRef.current.forEach((node) => {
          const subX = mouseX - node.x;
          const subY = height - node.currentY; // target distance
          const distNode = Math.sqrt(subX * subX + subY * subY);
          if (distNode < 150) {
            node.targetY = height - (25 + (150 - distNode) * 0.5 + Math.random() * 15);
            node.radius = Math.min(80, node.radius + 0.5);
          }
        });

        // Interactive blobs spawning
        if (dist > 35 && Math.random() < 0.32) {
          particlesRef.current.push({
            id: nextId.current++,
            x: mouseX,
            y: mouseY,
            vx: -dx * 0.07 + (Math.random() - 0.5) * 1.0,
            vy: -dy * 0.07 + (Math.random() - 0.5) * 1.0,
            radius: 8 + Math.random() * 8,
            baseRadius: 10,
            life: 1.0,
            decay: 0.0004,
            type: 'lava-down', // turns into a slow descending blob
            gravity: 0.012,
          });
        }
      }

      lastMousePos.current = { x: mouseX, y: mouseY };
    };

    const handleMouseLeave = () => {
      lastMousePos.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div 
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#050505',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          // High blur and contrast metaballs to merge floating lava bubbles
          filter: 'blur(20px) contrast(30) contrast(1.15)',
          backgroundColor: '#050505',
          opacity: 0.98,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
          }}
        />
      </div>
      
      {/* Decorative neon green grid for spatial feel */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(57, 255, 20, 0.02) 0%, transparent 80%)',
          backgroundImage: 'linear-gradient(rgba(57, 255, 20, 0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 255, 20, 0.012) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
