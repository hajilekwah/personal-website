import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Activity,
  Layers,
  Sparkles,
  Settings2,
  X
} from 'lucide-react';
import WebGLFluidSubstrate from './components/WebGLFluidSubstrate';

export default function App() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const infoCardRef = useRef<HTMLDivElement | null>(null);

  // WebGL Controls State
  const [damping, setDamping] = useState(0.83);
  const [force, setForce] = useState(240);
  const [dripIntensity, setDripIntensity] = useState(0.15);
  const [themeColorHex, setThemeColorHex] = useState('#9C81C8');
  const [luminosity, setLuminosity] = useState(0.3);
  const [dripScale, setDripScale] = useState(1.0);
  const [dripTailLength, setDripTailLength] = useState(1.0);
  const [showControls, setShowControls] = useState(false);

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
    gsap.set("#hawk-wrapper", { perspective: 1000 });
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
    // The carpenter's unfolding of the wrapper
    .fromTo("#hawk-wrapper",
      { rotationX: 90, rotationY: -30, z: -200, opacity: 0, transformOrigin: "left center" },
      { rotationX: 0, rotationY: 0, z: 0, opacity: 1, duration: 1.2, ease: "power2.out" },
      "-=0.9"
    )
    // Draw the wireframe like a blueprint being measured
    .fromTo(".hawk-line",
      { strokeDashoffset: 250, strokeDasharray: 250 },
      { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" },
      "<0.2"
    )
    // Fold the SVG away
    .to("#hawk-svg",
      { rotationX: -90, opacity: 0, duration: 0.4, ease: "power2.in", transformOrigin: "top center" },
      ">"
    )
    // Unfold the text like a cardboard flap
    .fromTo("#title-hawk",
      { opacity: 0, rotationX: 90, transformOrigin: "bottom center" },
      { opacity: 1, rotationX: 0, duration: 0.8, ease: "bounce.out" },
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
    .fromTo("#controls-wrapper",
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 1.0 },
      "-=0.5"
    )
    .fromTo("#footer-row",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.0 },
      "-=0.8"
    );
  }, []);

  return (
    <main 
      className="relative min-h-[100dvh] w-full flex flex-col justify-between items-center text-zinc-100 font-sans p-4 md:p-8 overflow-y-auto select-none bg-[#050505]"
      style={{
        '--theme-color': themeColorHex,
        // Calculate RGB array for color-mix compatibility where needed
      } as React.CSSProperties}
    >
      <style>{`
        .text-theme { color: var(--theme-color); }
        .bg-theme { background-color: var(--theme-color); }
        .border-theme { border-color: var(--theme-color); }
        .border-theme-alpha { border-color: color-mix(in srgb, var(--theme-color) 30%, transparent); }
        .hover-border-theme:hover { border-color: color-mix(in srgb, var(--theme-color) 30%, transparent); }
        .bg-theme-alpha-10 { background-color: color-mix(in srgb, var(--theme-color) 10%, transparent); }
        .bg-theme-alpha-5 { background-color: color-mix(in srgb, var(--theme-color) 5%, transparent); }
        .bg-theme-alpha-3 { background-color: color-mix(in srgb, var(--theme-color) 3%, transparent); }
        .hover-bg-theme-alpha:hover { background-color: color-mix(in srgb, var(--theme-color) 5%, transparent); }
        .hover-bg-theme-alpha-20:hover { background-color: color-mix(in srgb, var(--theme-color) 20%, transparent); }
        .hover-text-theme:hover { color: var(--theme-color); }
        .shadow-theme { box-shadow: 0 0 8px var(--theme-color); }
        .shadow-theme-alpha-10 { box-shadow: 0 0 8px color-mix(in srgb, var(--theme-color) 10%, transparent); }
        .hover-shadow-theme-alpha-20:hover { box-shadow: 0 0 12px color-mix(in srgb, var(--theme-color) 20%, transparent); }
        .stroke-theme { stroke: var(--theme-color); }
        .accent-theme { accent-color: var(--theme-color); }
        .drop-shadow-theme { filter: drop-shadow(0 0 8px color-mix(in srgb, var(--theme-color) 60%, transparent)); }
        .text-stroke-theme { 
          -webkit-text-stroke: 1.5px var(--theme-color); 
          filter: drop-shadow(0 0 10px color-mix(in srgb, var(--theme-color) 40%, transparent));
          text-shadow: 4px 4px 0 color-mix(in srgb, var(--theme-color) 20%, transparent);
        }
        
        .blob-1 { background-color: color-mix(in srgb, var(--theme-color) 80%, white); }
        .blob-2 { background-color: color-mix(in srgb, var(--theme-color) 90%, black); }
      `}</style>

      {/* WebGL Fluid Physics Canvas Background layer */}
      <WebGLFluidSubstrate 
        damping={damping} 
        forceMultiplier={force} 
        dripIntensity={dripIntensity} 
        themeColorHex={themeColorHex} 
        luminosity={luminosity} 
        dripScale={dripScale}
        dripTailLength={dripTailLength}
      />

      {/* Control Panel */}
      <div id="controls-wrapper" className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center sm:block sm:inset-auto sm:top-4 sm:right-4">
        <motion.div 
          id="controls-panel" 
          drag
          dragMomentum={false}
          className={`pointer-events-auto bg-[#050505]/80 p-4 border border-white/10 rounded-xl backdrop-blur-md flex flex-col gap-4 font-mono text-[10px] w-[90vw] max-w-[280px] sm:max-w-none sm:w-64 shadow-[0_0_20px_rgba(0,0,0,0.8)] cursor-grab active:cursor-grabbing transition-opacity duration-300 relative ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <div className="absolute inset-x-0 top-0 h-4 rounded-t-xl cursor-grab active:cursor-grabbing flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity">
            <div className="w-8 h-1 bg-white/50 rounded-full mt-2" />
          </div>
          <button 
            onClick={() => setShowControls(false)}
            className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/10 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X size={14} />
          </button>
          <h3 className="text-theme font-bold tracking-widest uppercase mb-1 mt-2 pointer-events-none">Canvas Parameters</h3>
          
          <div className="flex flex-col gap-2 relative">
            <label className="flex justify-between text-zinc-400">
              <span>Primary Chroma</span>
              <span className="uppercase">{themeColorHex}</span>
            </label>
            <div className="flex items-center gap-2">
              <input type="color" value={themeColorHex} onChange={(e) => setThemeColorHex(e.target.value)} className="w-full h-6 border-0 p-0 bg-transparent cursor-pointer rounded overflow-hidden" />
            </div>
          </div>

          <div className="h-px bg-white/10 my-1"/>

          <div className="flex flex-col gap-2">
            <label className="flex justify-between text-zinc-400">
              <span>Viscosity</span>
              <span>{damping.toFixed(2)}</span>
            </label>
            <input type="range" min="0.80" max="0.99" step="0.01" value={damping} onChange={(e) => setDamping(parseFloat(e.target.value))} className="w-full accent-theme h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex justify-between text-zinc-400">
              <span>Displacement Force</span>
              <span>{force}</span>
            </label>
            <input type="range" min="50" max="1000" step="10" value={force} onChange={(e) => setForce(parseFloat(e.target.value))} className="w-full accent-theme h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex justify-between text-zinc-400">
              <span>Drip Saturation</span>
              <span>{dripIntensity.toFixed(2)}</span>
            </label>
            <input type="range" min="0.0" max="1.0" step="0.05" value={dripIntensity} onChange={(e) => setDripIntensity(parseFloat(e.target.value))} className="w-full accent-theme h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex justify-between text-zinc-400">
              <span>Luminosity</span>
              <span>{(luminosity * 100).toFixed(0)}%</span>
            </label>
            <input type="range" min="0.1" max="2.0" step="0.1" value={luminosity} onChange={(e) => setLuminosity(parseFloat(e.target.value))} className="w-full accent-theme h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex justify-between text-zinc-400">
              <span>Drop Scale</span>
              <span>{dripScale.toFixed(1)}x</span>
            </label>
            <input type="range" min="0.1" max="5.0" step="0.1" value={dripScale} onChange={(e) => setDripScale(parseFloat(e.target.value))} className="w-full accent-theme h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex justify-between text-zinc-400">
              <span>Tail Length</span>
              <span>{dripTailLength.toFixed(1)}x</span>
            </label>
            <input type="range" min="0.1" max="5.0" step="0.1" value={dripTailLength} onChange={(e) => setDripTailLength(parseFloat(e.target.value))} className="w-full accent-theme h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" />
          </div>
        </motion.div>
      </div>

      {/* Elegant, high-contrast structural overlay */}
      <div className="absolute inset-x-0 top-0 h-[300px] bg-theme-alpha-5 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[10%] w-[250px] h-[250px] rounded-full bg-theme-alpha-3 blur-[120px] pointer-events-none z-0" />

      {/* Header element */}
      <header id="header-row" className="w-full max-w-6xl mx-auto flex flex-col items-start z-10 py-4 border-b border-white/[0.04] pb-5">
        <div className="flex flex-col gap-0.5 select-none">
          <span className="text-[10px] uppercase tracking-[0.3em] text-theme font-mono font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-theme glow-pulse inline-block shadow-theme" />
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
          className="w-full bg-[#050505]/75 border border-white/[0.06] hover-border-theme-30 rounded-3xl p-6 md:p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col transition-all duration-500"
        >
          <button 
            onClick={() => setShowControls(!showControls)}
            className="absolute top-6 right-6 p-2 rounded-full border border-white/5 hover:bg-white/5 transition-colors z-30 group"
          >
            <Settings2 size={16} className="text-zinc-500 group-hover:text-theme transition-colors" />
          </button>
          
          {/* Top aesthetic ambient highlight line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-transparent to-transparent flex"><div className="w-full h-full bg-theme-alpha-20" /></div>
          
          {/* Majestic Typography Title */}
          <div id="main-title-text" className="flex flex-col mb-5 mt-4 pr-10 sm:pr-0">
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-theme font-bold mb-1">INFOSEC AND DESIGN ENGINEER</span>
            <h1 className="text-5xl sm:text-8xl font-black leading-[0.9] uppercase m-0 text-white font-display select-none flex flex-wrap items-center gap-x-2 gap-y-0 sm:gap-4 w-full">
              <span id="title-elijah" className="inline-block tracking-tight">Elijah</span> 
              
              <div id="hawk-wrapper" className="relative inline-block z-10 w-auto h-auto">
                <svg id="hawk-svg" viewBox="0 0 100 100" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] stroke-theme fill-transparent z-20 pointer-events-none origin-center drop-shadow-theme" style={{ strokeWidth: "2px" }}>
                   <path className="hawk-line" d="M50 85 L20 40 L0 15 L35 30 L50 0 L65 30 L100 15 L80 40 Z" strokeLinejoin="round" />
                   <line className="hawk-line" x1="50" y1="85" x2="50" y2="20" />
                   <line className="hawk-line" x1="20" y1="40" x2="80" y2="40" />
                   <line className="hawk-line" x1="35" y1="30" x2="65" y2="30" />
                </svg>
                <span id="title-hawk" className="inline-block text-transparent font-black italic tracking-tighter opacity-0 text-stroke-theme">HAWK</span>
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
            
            <div className="bento-item group p-5 rounded-2xl bg-black/40 border border-white/5 hover-border-theme-20 hover:bg-black/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Activity size={12} className="text-theme" />
                  <span className="text-[9px] font-mono tracking-widest text-theme font-bold">01 // SECURITY</span>
                </div>
                <span className="text-[8px] bg-theme-alpha-10 text-theme font-mono px-1.5 py-0.5 rounded">ACTIVE</span>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-1.5">Enterprise Defense</h3>
              <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                Advanced Microsoft systems hardening, PowerShell automation, and proactive security operations.
              </p>
            </div>

            <div className="bento-item group p-5 rounded-2xl bg-black/40 border border-white/5 hover-border-theme-20 hover:bg-black/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Layers size={11} className="text-theme" />
                  <span className="text-[9px] font-mono tracking-widest text-theme font-bold">02 // COMPLIANCE</span>
                </div>
                <span className="text-[8px] bg-theme-alpha-10 text-theme font-mono px-1.5 py-0.5 rounded">ACTIVE</span>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-1.5">Governance Lab</h3>
              <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                Aligning technical controls with overarching security policies and regulatory frameworks.
              </p>
            </div>

            <div className="bento-item group p-5 rounded-2xl bg-black/40 border border-white/5 hover-border-theme-20 hover:bg-black/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={11} className="text-theme" />
                  <span className="text-[9px] font-mono tracking-widest text-theme font-bold">03 // ARCHIVE</span>
                </div>
                <span className="text-[8px] bg-theme-alpha-10 text-theme font-mono px-1.5 py-0.5 rounded">WRITING</span>
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
              className="px-3.5 py-1.5 border border-white/5 hover-border-theme-30 bg-white/[0.01] hover-bg-theme-alpha-5 rounded-full text-[10px] uppercase font-mono tracking-widest text-zinc-300 hover-text-theme transition-all flex items-center gap-1.5"
            >
              <Github size={11} />
              <span>Github</span>
            </a>
            <a 
              href="https://linkedin.com/in/elijahhawk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 border border-white/5 hover-border-theme-30 bg-white/[0.01] hover-bg-theme-alpha-5 rounded-full text-[10px] uppercase font-mono tracking-widest text-zinc-300 hover-text-theme transition-all flex items-center gap-1.5"
            >
              <Linkedin size={11} />
              <span>LinkedIn</span>
            </a>
            <a 
              href="https://x.com/kn6mrq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 border border-white/5 hover-border-theme-30 bg-white/[0.01] hover-bg-theme-alpha-5 rounded-full text-[10px] uppercase font-mono tracking-widest text-zinc-300 hover-text-theme transition-all flex items-center gap-1.5"
            >
              <Twitter size={11} />
              <span>Twitter</span>
            </a>
            <a 
              href="mailto:elijah@elijahhawk.io"
              className="px-3.5 py-1.5 border border-white/5 hover-border-theme-30 bg-theme-alpha-10 hover-bg-theme-alpha-20 rounded-full text-[10px] uppercase font-mono tracking-widest text-theme hover-text-theme transition-all flex items-center gap-1.5 font-bold shadow-theme-alpha-10 hover-shadow-theme-alpha-20"
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
