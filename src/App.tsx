import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Clock, 
  ArrowRight,
  Terminal,
  Activity,
  Droplet,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import SlimeCanvas from './components/SlimeCanvas';

export default function App() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const infoCardRef = useRef<HTMLDivElement | null>(null);

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
    .fromTo("#badge-status",
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 1.0 },
      "-=1.1"
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
    .fromTo("#footer-row",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.0 },
      "-=0.8"
    );
  }, []);

  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between items-center text-zinc-100 font-sans p-4 md:p-8 overflow-y-auto select-none bg-[#050505]">
      
      {/* Liquid Slime Physics Canvas Background layer */}
      <SlimeCanvas />

      {/* Elegant, high-contrast structural overlay */}
      <div className="absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-green-500/5 to-transparent blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[10%] w-[250px] h-[250px] rounded-full bg-emerald-500/3 blur-[120px] pointer-events-none z-0" />

      {/* Header element */}
      <header id="header-row" className="w-full max-w-6xl mx-auto flex flex-col items-start z-10 py-4 border-b border-white/[0.04] pb-5">
        <div className="flex flex-col gap-0.5 select-none">
          <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-mono font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse inline-block shadow-[0_0_8px_#39ff14]" />
            SYS_ONLINE // LIQUID_ACTIVE
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
          
          {/* Micro status and visual indicator row */}
          <div id="badge-status" className="flex items-end justify-end mb-8 border-b border-white/[0.05] pb-4">
            <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[10px]">
              <Droplet size={11} className="text-emerald-400 animate-bounce" />
              <span className="tracking-widest text-[9px] uppercase font-bold text-zinc-400">LIQUID MATRIX OVERLAY</span>
            </div>
          </div>

          {/* Majestic Typography Title */}
          <div id="main-title-text" className="flex flex-col mb-5">
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-emerald-400 font-bold mb-1">INFOSEC AND DESIGN ENGINEER</span>
            <h1 className="text-6xl sm:text-8xl font-black leading-[0.9] uppercase m-0 text-white font-display select-none flex items-center gap-4">
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
            Digital architect & physical interaction artisan. Currently developing a new, high-performance home for creative code experiments, liquid canvas models, custom UI systems, and architectural design methodologies. Move your cursor around to play with the physical slime substrate.
          </p>

          {/* Bento Grid Highlights of In-Development Modules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-9">
            
            <div className="bento-item group p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-emerald-500/20 hover:bg-black/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Activity size={12} className="text-emerald-400" />
                  <span className="text-[9px] font-mono tracking-widest text-[#39ff14] font-bold">01 // VISUAL</span>
                </div>
                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-mono px-1.5 py-0.5 rounded">STAGING</span>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-1.5">Interaction Lab</h3>
              <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                Physics-based animations, canvas fluids, dynamic typography systems, and organic shaders.
              </p>
            </div>

            <div className="bento-item group p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-emerald-500/20 hover:bg-black/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Layers size={11} className="text-[#39ff14]" />
                  <span className="text-[9px] font-mono tracking-widest text-[#39ff14] font-bold">02 // STACK</span>
                </div>
                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-mono px-1.5 py-0.5 rounded">CODING</span>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-1.5">Systems Architecture</h3>
              <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                High-throughput Node backends, reactive browser states, and polished, responsive frameworks.
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
                Reflections of deep technical work, design philosophies, and practical development guidelines.
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
          <span className="hidden sm:inline text-zinc-800">|</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-ping" />
            <span>DRIP TRANSMISSION COUPLER ENABLED</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <span>{currentTime || 'SYNCHRONIZING_UTIME...'}</span>
        </div>
      </footer>

    </main>
  );
}
