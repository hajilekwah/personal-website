import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import WebGLFluidSubstrate from './components/WebGLFluidSubstrate';

export default function App() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const infoCardRef = useRef<HTMLDivElement | null>(null);

  // WebGL Controls State
  const [damping, setDamping] = useState(0.96);
  const [force, setForce] = useState(250);
  const [dripIntensity, setDripIntensity] = useState(0.8);

  // Set real-time tracking for UTC clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // GSAP Entrance Choreography
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    
    tl.fromTo("#header-row",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1.2 }
    )
    .fromTo("#main-brand-card", 
      { opacity: 0, scale: 0.95, y: 40 },
      { opacity: 1, scale: 1, y: 0, duration: 1.5 },
      "-=0.9"
    )
    .fromTo("#title-elijah",
      { opacity: 0, x: -30, filter: 'blur(10px)' },
      { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1.2 },
      "-=1.2"
    )
    // The swoop of the wrapper
    .fromTo("#hawk-wrapper",
      { x: 300, y: -200, rotation: 45, scale: 2 },
      { x: 0, y: 0, rotation: 0, scale: 1, duration: 1.4, ease: "power3.out" },
      "-=1.1"
    )
    // Draw the wireframe while swooping
    .fromTo(".hawk-line",
      { strokeDashoffset: 200, strokeDasharray: 200 },
      { strokeDashoffset: 0, duration: 1.0, ease: "power2.inOut" },
      "<0.2"
    )
    // Transform Hawk SVG to text
    .to("#hawk-svg",
      { scale: 1.5, opacity: 0, rotation: -15, duration: 0.4, ease: "power2.in" },
      ">"
    )
    .fromTo("#title-hawk",
      { opacity: 0, scale: 0.5, filter: 'blur(10px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: "back.out(2.5)" },
      "<0.1"
    )
    .fromTo("#tagline-text",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 1.2 },
      "-=1.1"
    )
    .fromTo(".bento-item",
      { opacity: 0, y: 20, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 1.0, stagger: 0.15 },
      "-=0.9"
    )
    .fromTo("#social-badges span, #social-badges a",
      { opacity: 0, scale: 0.9, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.08 },
      "-=0.7"
    )
    .fromTo("#controls-panel",
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 1.0 },
      "-=0.5"
    )
    .fromTo("#footer-row",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.0 },
      "-=0.8"
    );

    // Smooth ambient orbit animations for gooey blobs
    const blobs = document.querySelectorAll('.gooey-blob');
    if (blobs.length > 0) {
      gsap.to(blobs[0], {
        x: 'random(-100, 100)',
        y: 'random(-100, 100)',
        rotation: 'random(-45, 45)',
        scale: 'random(0.8, 1.2)',
        duration: 'random(4, 8)',
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
      gsap.to(blobs[1], {
        x: 'random(-150, 150)',
        y: 'random(-150, 150)',
        rotation: 'random(-90, 90)',
        scale: 'random(0.9, 1.3)',
        duration: 'random(5, 9)',
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
      gsap.to(blobs[2], {
        x: 'random(-120, 120)',
        y: 'random(-120, 120)',
        rotation: 'random(-30, 30)',
        scale: 'random(0.7, 1.4)',
        duration: 'random(6, 10)',
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
      gsap.to(blobs[3], {
        x: 'random(-200, 200)',
        y: 'random(-50, 50)',
        rotation: 'random(-180, 180)',
        scale: 'random(0.8, 1.5)',
        duration: 'random(7, 11)',
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
    }
  }, []);

  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between items-center text-zinc-100 font-sans p-4 md:p-8 overflow-y-auto select-none bg-[#050505]">
      
      {/* WebGL Fluid Physics Canvas Background layer */}
      <WebGLFluidSubstrate damping={damping} forceMultiplier={force} dripIntensity={dripIntensity} />

      {/* Control Panel */}
      <div id="controls-panel" className="fixed top-4 right-4 z-50 bg-[#050505]/60 p-4 border border-white/10 rounded-xl backdrop-blur-md flex flex-col gap-4 font-mono text-xs w-64 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
        <h3 className="text-[#39ff14] font-bold tracking-widest uppercase mb-1">Canvas Parameters</h3>
        <div className="flex flex-col gap-2">
          <label className="flex justify-between text-zinc-400">
            <span>Viscosity</span>
            <span>{damping.toFixed(2)}</span>
          </label>
          <input type="range" min="0.80" max="0.99" step="0.01" value={damping} onChange={(e) => setDamping(parseFloat(e.target.value))} className="w-full accent-[#39ff14] h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex justify-between text-zinc-400">
            <span>Displacement Force</span>
            <span>{force}</span>
          </label>
          <input type="range" min="50" max="1000" step="10" value={force} onChange={(e) => setForce(parseFloat(e.target.value))} className="w-full accent-[#39ff14] h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex justify-between text-zinc-400">
            <span>Drip Saturation</span>
            <span>{dripIntensity.toFixed(2)}</span>
          </label>
          <input type="range" min="0.0" max="1.0" step="0.05" value={dripIntensity} onChange={(e) => setDripIntensity(parseFloat(e.target.value))} className="w-full accent-[#39ff14] h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" />
        </div>
      </div>

      {/* SVG Gooey Matrix Filter Definition */}
      <svg className="pointer-events-none absolute h-0 w-0" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Liquid Mercury UI Blobs Container (Gooey Filter Active) */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-30 mix-blend-screen" 
        style={{ filter: "url(#goo)" }}
      >
        <div className="gooey-blob absolute w-64 h-64 bg-[#10d43a] rounded-full" />
        <div className="gooey-blob absolute w-48 h-48 bg-emerald-500 rounded-full" />
        <div className="gooey-blob absolute w-56 h-56 bg-[#39ff14]/80 rounded-full" />
        <div className="gooey-blob absolute w-72 h-32 bg-[#22c55e] rounded-full" />
      </div>

      {/* Elegant, high-contrast structural overlay */}
      <div className="absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-green-500/5 to-transparent blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[10%] w-[250px] h-[250px] rounded-full bg-emerald-500/3 blur-[120px] pointer-events-none z-0" />

      {/* Header element */}
      <header id="header-row" className="w-full max-w-6xl mx-auto flex flex-col items-start z-10 py-4 border-b border-white/[0.04] pb-5">
        <div className="flex flex-col gap-0.5 select-none">
          <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-mono font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse inline-block shadow-[0_0_8px_#39ff14]" />
            SYSTEM ONLINE
          </span>
          <span className="text-sm font-medium tracking-tight text-white font-mono font-semibold uppercase">
            ELIJAH HAWK © 2026
          </span>
        </div>
      </header>

      {/* Main Container Card */}
      <section className="w-full max-w-4xl mx-auto my-auto py-8 z-10 flex flex-col items-center justify-center">
        
        <div 
          id="main-brand-card"
          ref={infoCardRef}
          className="w-full bg-[#050505]/75 border border-white/[0.06] hover:border-[#39ff14]/30 rounded-3xl p-6 md:p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col transition-all duration-500"
        >
          {/* Top aesthetic ambient highlight line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#39ff14]/25 to-transparent" />
          
          {/* Majestic Typography Title */}
          <div id="main-title-text" className="flex flex-col mb-5 mt-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-emerald-400 font-bold mb-1">INFOSEC AND DESIGN ENGINEER</span>
            <h1 className="text-5xl sm:text-8xl font-black leading-[0.9] uppercase m-0 text-white font-display select-none flex flex-wrap items-center gap-x-2 gap-y-0 sm:gap-4 w-full">
              <span id="title-elijah" className="inline-block tracking-tight">Elijah</span> 
              
              <div id="hawk-wrapper" className="relative inline-block z-10 w-auto h-auto">
                <svg id="hawk-svg" viewBox="0 0 100 100" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] stroke-[#39ff14] fill-transparent z-20 pointer-events-none origin-center" style={{ strokeWidth: "2px", filter: "drop-shadow(0 0 8px rgba(57,255,20,0.6))" }}>
                   <path className="hawk-line" d="M50 85 L20 40 L0 15 L35 30 L50 0 L65 30 L100 15 L80 40 Z" strokeLinejoin="round" />
                   <line className="hawk-line" x1="50" y1="85" x2="50" y2="20" />
                   <line className="hawk-line" x1="20" y1="40" x2="80" y2="40" />
                   <line className="hawk-line" x1="35" y1="30" x2="65" y2="30" />
                </svg>
                <span id="title-hawk" className="inline-block text-transparent font-black italic tracking-tighter opacity-0" style={{ WebkitTextStroke: '1.5px rgba(57,255,20,0.85)', filter: 'drop-shadow(0 0 10px rgba(57,255,20,0.2))', textShadow: '4px 4px 0 rgba(57,255,20,0.1)' }}>HAWK</span>
              </div>
            </h1>
          </div>

          {/* Concise Creative Statement */}
          <p 
            id="tagline-text"
            className="text-zinc-300 text-sm md:text-base leading-relaxed md:leading-relaxed font-light mb-8 max-w-2xl select-text"
          >
            CISSP and OSCP certified advanced information security practitioner. Specializing in Microsoft enterprise systems, PowerShell automation, governance, and compliance. Driven by a passion for building secure, high-performance architectures and robust defense mechanisms.
          </p>

          {/* Bento Grid Highlights of In-Development Modules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-9">
            
            <div className="bento-item group p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-emerald-500/20 hover:bg-black/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Activity size={12} className="text-emerald-400" />
                  <span className="text-[9px] font-mono tracking-widest text-[#39ff14] font-bold">01 // SECURITY</span>
                </div>
                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-mono px-1.5 py-0.5 rounded">ACTIVE</span>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-1.5">Enterprise Defense</h3>
              <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                Advanced Microsoft systems hardening, PowerShell automation, and proactive security operations.
              </p>
            </div>

            <div className="bento-item group p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-emerald-500/20 hover:bg-black/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Layers size={11} className="text-[#39ff14]" />
                  <span className="text-[9px] font-mono tracking-widest text-[#39ff14] font-bold">02 // COMPLIANCE</span>
                </div>
                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-mono px-1.5 py-0.5 rounded">ACTIVE</span>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-1.5">Governance Lab</h3>
              <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                Aligning technical controls with overarching security policies and regulatory frameworks.
              </p>
            </div>

            <div className="bento-item group p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-emerald-500/20 hover:bg-black/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={11} className="text-emerald-400" />
                  <span className="text-[9px] font-mono tracking-widest text-[#39ff14] font-bold">03 // ARCHIVE</span>
                </div>
                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-mono px-1.5 py-0.5 rounded">WRITING</span>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-1.5">Essays & Logbook</h3>
              <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                Reflections of deep technical work, vulnerability research, and practical security guidelines.
              </p>
            </div>

          </div>

          {/* Social Row / Contact action */}
          <div id="social-badges" className="flex flex-wrap items-center gap-2.5 pt-6 border-t border-white/[0.04] mt-auto">
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-zinc-500 font-semibold mr-1.5">
              CONNECT:
            </span>
            <a 
              href="https://github.com/hajilekwah" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 border border-white/5 hover:border-[#39ff14]/30 bg-white/[0.01] hover:bg-[#39ff14]/5 rounded-full text-[10px] uppercase font-mono tracking-widest text-zinc-300 hover:text-[#39ff14] transition-all flex items-center gap-1.5"
            >
              <Github size={11} />
              <span>Github</span>
            </a>
            <a 
              href="https://linkedin.com/in/elijahhawk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 border border-white/5 hover:border-[#39ff14]/30 bg-white/[0.01] hover:bg-[#39ff14]/5 rounded-full text-[10px] uppercase font-mono tracking-widest text-zinc-300 hover:text-[#39ff14] transition-all flex items-center gap-1.5"
            >
              <Linkedin size={11} />
              <span>LinkedIn</span>
            </a>
            <a 
              href="https://x.com/kn6mrq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 border border-white/5 hover:border-[#39ff14]/30 bg-white/[0.01] hover:bg-[#39ff14]/5 rounded-full text-[10px] uppercase font-mono tracking-widest text-zinc-300 hover:text-[#39ff14] transition-all flex items-center gap-1.5"
            >
              <Twitter size={11} />
              <span>Twitter</span>
            </a>
            <a 
              href="mailto:elijah@elijahhawk.io"
              className="px-3.5 py-1.5 border border-white/5 hover:border-[#39ff14]/30 bg-[#39ff14]/10 hover:bg-[#39ff14]/20 rounded-full text-[10px] uppercase font-mono tracking-widest text-[#39ff14] hover:text-[#39ff14] transition-all flex items-center gap-1.5 font-bold shadow-[0_0_8px_rgba(57,255,20,0.1)] hover:shadow-[0_0_12px_rgba(57,255,20,0.2)]"
            >
              <Mail size={11} />
              <span>E-Mail</span>
            </a>

            <div className="ml-auto hidden md:flex items-center gap-1 font-mono text-[9px] text-zinc-600 tracking-[0.2em] uppercase">
              <span>COORDS // 34.0522° N, 118.2437° W</span>
            </div>
          </div>

        </div>

      </section>

      {/* Footer layout */}
      <footer id="footer-row" className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between z-10 py-4 border-t border-white/[0.04] text-[9px] text-zinc-600 mt-8 gap-2 font-mono tracking-widest uppercase">
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4 font-bold">
          <span>© 2026 ELIJAH HAWK. ALL TRADEMARKS SECURED.</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span>{currentTime || 'SYNCHRONIZING_UTIME...'}</span>
        </div>
      </footer>

    </main>
  );
}
