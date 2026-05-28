import { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import Guestbook from './components/Guestbook';
import AuthBadge from './components/AuthBadge';
import gsap from 'gsap';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Activity, 
  Sparkles, 
  Settings, 
  BookOpen,
  ArrowRight,
  RefreshCw,
  Terminal,
  Clock,
  ExternalLink,
  Sliders,
  Check,
  Code
} from 'lucide-react';
import { AccentTheme } from './types';
import ParticleCanvas from './components/ParticleCanvas';
import DeployGuide from './components/DeployGuide';

export default function App() {
  const [theme, setTheme] = useState<AccentTheme>('indigo');
  const [speed, setSpeed] = useState<number>(1.2);
  const [particleCount, setParticleCount] = useState<number>(80);
  const [interactiveGlow, setInteractiveGlow] = useState<boolean>(true);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isSpawning, setIsSpawning] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const [user, setUser] = useState<User | null>(null);
  const isIncomingUpdate = useRef<boolean>(false);

  // Track auth state transitions
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
    });
    return unsubscribe;
  }, []);

  // Bidirectional Preferences Sync - FROM Firestore
  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, 'settings', user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        isIncomingUpdate.current = true;
        if (data.theme) setTheme(data.theme as AccentTheme);
        if (data.speed !== undefined) setSpeed(data.speed);
        if (data.particleCount !== undefined) setParticleCount(data.particleCount);
        if (data.interactiveGlow !== undefined) setInteractiveGlow(data.interactiveGlow);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `settings/${user.uid}`);
    });

    return unsubscribe;
  }, [user]);

  // Bidirectional Preferences Sync - TO Firestore
  useEffect(() => {
    if (!user) return;
    if (isIncomingUpdate.current) {
      isIncomingUpdate.current = false;
      return;
    }

    const saveSettings = async () => {
      const docRef = doc(db, 'settings', user.uid);
      try {
        await setDoc(docRef, {
          userId: user.uid,
          theme,
          speed,
          particleCount,
          interactiveGlow,
          updatedAt: new Date()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `settings/${user.uid}`);
      }
    };

    const delay = setTimeout(saveSettings, 1000);
    return () => clearTimeout(delay);
  }, [theme, speed, particleCount, interactiveGlow, user]);

  // Set real-time tracking for UTC display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // GSAP entrance choreographies
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    
    tl.fromTo("#main-card", 
      { opacity: 0, scale: 0.96, y: 40 },
      { opacity: 1, scale: 1, y: 0, duration: 1.6, delay: 0.1 }
    )
    .fromTo("#badge-status",
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 1.1 },
      "-=1.1"
    )
    .fromTo("#main-title",
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 1.5 },
      "-=1.3"
    )
    .fromTo("#tagline-p",
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 1.3 },
      "-=1.3"
    )
    .fromTo("#social-links-div a",
      { opacity: 0, scale: 0.85, y: 12 },
      { opacity: 1, scale: 1, y: 0, duration: 0.9, stagger: 0.12 },
      "-=1.1"
    )
    .fromTo("#hud-controls",
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 1.4 },
      "-=0.9"
    )
    .fromTo("#terminal-status-panel",
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 1.2 },
      "-=1.1"
    );
  }, []);

  const getAccentClass = () => {
    switch (theme) {
      case 'indigo': return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-400/40';
      case 'emerald': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-400/40';
      case 'crimson': return 'text-rose-400 border-rose-500/30 bg-rose-500/5 hover:border-rose-400/40';
      case 'amber': return 'text-amber-400 border-amber-500/30 bg-amber-500/5 hover:border-amber-400/40';
      case 'cyan': return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-400/40';
    }
  };

  const getThemeTextGlow = () => {
    switch (theme) {
      case 'indigo': return 'from-white via-white to-indigo-500';
      case 'emerald': return 'from-white via-white to-emerald-500';
      case 'crimson': return 'from-white via-white to-rose-500';
      case 'amber': return 'from-white via-white to-amber-500';
      case 'cyan': return 'from-white via-white to-cyan-500';
    }
  };

  const getThemeBorderActive = (current: AccentTheme) => {
    if (theme === current) {
      switch (theme) {
        case 'indigo': return 'border-indigo-500 bg-white/10 text-white';
        case 'emerald': return 'border-emerald-500 bg-white/10 text-white';
        case 'crimson': return 'border-rose-500 bg-white/10 text-white';
        case 'amber': return 'border-amber-500 bg-white/10 text-white';
        case 'cyan': return 'border-cyan-500 bg-white/10 text-white';
      }
    }
    return 'border-white/5 hover:border-white/25 bg-white/[0.01] text-zinc-400';
  };

  const getThemeBadgeBg = () => {
    switch (theme) {
      case 'indigo': return 'bg-indigo-500';
      case 'emerald': return 'bg-emerald-500';
      case 'crimson': return 'bg-rose-500';
      case 'amber': return 'bg-amber-500';
      case 'cyan': return 'bg-cyan-500';
    }
  };

  const spawnBurst = () => {
    setIsSpawning(true);
    // Grab the canvas stage element and trigger simulation mouse clicks natively
    const stage = document.getElementById('particles-stage');
    if (stage) {
      const rect = stage.getBoundingClientRect();
      const clickEvent = new MouseEvent('click', {
        clientX: rect.left + rect.width / 2 + (Math.random() - 0.5) * 120,
        clientY: rect.top + rect.height / 2 + (Math.random() - 0.5) * 120,
        bubbles: true,
        cancelable: true,
      });
      stage.dispatchEvent(clickEvent);
    }
    setTimeout(() => setIsSpawning(false), 300);
  };

  const copyDomain = () => {
    navigator.clipboard.writeText('elijahhawk.io');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <main 
      style={{ background: 'radial-gradient(circle at 70% 30%, #15151c 0%, #050505 70%)' }}
      className="relative min-h-screen w-full flex flex-col justify-between items-center text-zinc-100 font-sans p-6 md:p-12 overflow-x-hidden select-none border-4 sm:border-8 border-[#111111]"
    >
      
      {/* Dynamic Animated Constellation Matrix Background */}
      <ParticleCanvas 
        theme={theme}
        speed={speed}
        particleCount={particleCount}
        interactiveGlow={interactiveGlow}
      />

      {/* Decorative ambient blurred backing shapes */}
      <div className="absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-indigo-500/5 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[25%] left-[5%] w-[180px] h-[180px] rounded-full bg-blue-500/2 blur-[90px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[5%] w-[240px] h-[240px] rounded-full bg-emerald-500/2 blur-[120px] pointer-events-none z-0" />

      {/* Background Graphic watermark */}
      <div className="absolute bottom-1/2 right-0 translate-x-1/3 translate-y-1/2 flex flex-col pointer-events-none opacity-[0.03] select-none text-white z-0">
        <span className="text-[200px] sm:text-[320px] font-black leading-none uppercase tracking-tighter">EH</span>
      </div>

      {/* Top Header Row with status/domain */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 py-2 border-b border-white/[0.05] pb-4">
        <div 
          onClick={copyDomain}
          className="group flex flex-col gap-1 cursor-pointer select-none"
          title="Click to copy domain"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${getThemeBadgeBg()} animate-pulse inline-block`} />
            IDENTITY PLATFORM
          </span>
          <span className="text-xs font-medium font-display tracking-tight text-white group-hover:text-zinc-300 transition-colors">
            {copiedKey ? 'COPIED TO CLIPBOARD' : 'ELIJAH HAWK © 2026'}
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden md:flex gap-6 text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">
            <span>Digital Portfolio</span>
            <span>00.01 // Alpha</span>
          </div>
          <AuthBadge />
          <button
            id="btn-deploy-guide-trigger"
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-white/10 bg-white/5 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest text-[#f0f0f0] hover:bg-white hover:text-black transition-all cursor-pointer font-semibold duration-200"
          >
            <BookOpen size={11} />
            <span>Deploy Companion</span>
            <ArrowRight size={10} className="ml-0.5" />
          </button>
        </div>
      </header>

      {/* Primary Centerpiece Deck */}
      <section className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 my-10 z-10 flex-grow">
        
        {/* Main Brand Card */}
        <div 
          id="main-card"
          className="w-full max-w-2xl bg-[#050505]/60 border border-white/[0.08] rounded-3xl p-8 md:p-12 backdrop-blur-2xl shadow-3xl relative overflow-hidden flex flex-col"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-800/40 to-transparent" />
          
          {/* Micro Header / Badge */}
          <div id="badge-status" className="flex items-center justify-between mb-8 border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-widest uppercase border ${getAccentClass()}`}>
                FORGING LAUNCH
              </span>
              <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase">
                00.01 // Alpha
              </span>
            </div>
            <span className="text-xs text-white/50 font-mono flex items-center gap-1">
              <Clock size={11} className="text-white/30" /> 2026_EDITION
            </span>
          </div>

          {/* Large Typographic Header */}
          <div id="main-title" className="flex flex-col -space-y-3 sm:-space-y-4 md:-space-y-5 mb-6">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black leading-[0.85] tracking-tight uppercase m-0 text-white select-none">
              Elijah
            </h1>
            <div className="flex items-center gap-4 sm:gap-6 md:gap-8 flex-wrap">
              <h1 
                className="text-6xl sm:text-7xl md:text-8xl font-black leading-[0.85] tracking-tight uppercase m-0 text-transparent"
                style={{ WebkitTextStroke: '1px rgba(255,255,255,0.35)', backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.45))` }}
              >
                Hawk
              </h1>
              <div className={`h-3 w-16 sm:w-28 md:w-36 mt-1 sm:mt-2 shrink-0 ${
                theme === 'indigo' ? 'bg-indigo-600' :
                theme === 'emerald' ? 'bg-emerald-600' :
                theme === 'crimson' ? 'bg-rose-600' :
                theme === 'amber' ? 'bg-amber-600' : 'bg-cyan-600'
              }`} />
            </div>
          </div>

          {/* pitch / desc details */}
          <p 
            id="tagline-p"
            className="text-[#f0f0f0]/80 text-base md:text-lg leading-relaxed font-light italic mb-8 max-w-md"
          >
            Digital architect & full-stack interaction engineer. Designing a personalized home for essays, open-source layouts, interactive visual mechanics, and experiment hubs.
          </p>

          {/* Social Icons row */}
          <div id="social-links-div" className="flex flex-wrap items-center gap-3 mt-auto pt-6 border-t border-white/[0.06]">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 border border-white/10 bg-white/5 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest text-[#f0f0f0] hover:bg-white hover:text-black transition-all flex items-center gap-1.5 font-mono duration-200"
            >
              <Github size={11} />
              <span>Github</span>
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 border border-white/10 bg-white/5 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest text-indigo-400 hover:bg-white hover:text-black transition-all flex items-center gap-1.5 font-mono duration-200"
            >
              <Linkedin size={11} />
              <span>LinkedIn</span>
            </a>
            <a 
              href="https://x.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 border border-white/10 bg-white/5 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest text-[#f0f0f0] hover:bg-white hover:text-black transition-all flex items-center gap-1.5 font-mono duration-200"
            >
              <Twitter size={11} />
              <span>Twitter</span>
            </a>
            <a 
              href="mailto:elijah@elijahhawk.io"
              className="px-4 py-2 border border-white/10 bg-white/5 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest text-[#f0f0f0] hover:bg-white hover:text-black transition-all flex items-center gap-1.5 font-mono duration-200"
            >
              <Mail size={11} />
              <span>E-mail</span>
            </a>

            <div className="ml-auto flex items-center gap-2 font-mono text-[9px] text-white/30 tracking-[0.2em] uppercase">
              <span>51.5072° N, 0.1276° W</span>
            </div>
          </div>
        </div>

        {/* HUD control board & parameters */}
        <div className="w-full max-w-sm flex flex-col gap-6">
          
          {/* HUD controls container */}
          <div 
            id="hud-controls"
            className="flex flex-col bg-[#050505]/60 border border-white/[0.08] rounded-3xl p-6 backdrop-blur-2xl shadow-xl"
          >
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/[0.06]">
              <Sliders size={13} className="text-white/40" />
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60 font-mono">
                GSAP Parameter Tweakdeck
              </h3>
            </div>

            {/* Speeds control */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                <span>Constellation Speed multiplier</span>
                <span className="text-indigo-400 font-semibold">{speed.toFixed(1)}x</span>
              </div>
              <input 
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-ew-resize h-1 bg-zinc-900 rounded-lg appearance-none"
              />
            </div>

            {/* Density control */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                <span>Node Grid Cap</span>
                <span className="text-indigo-400 font-semibold">{particleCount} active</span>
              </div>
              <input 
                type="range"
                min="20"
                max="180"
                step="5"
                value={particleCount}
                onChange={(e) => setParticleCount(parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-ew-resize h-1 bg-zinc-900 rounded-lg appearance-none"
              />
            </div>

            {/* Toggle Spotlight */}
            <div className="flex items-center justify-between mb-5 py-0.5 bg-black/40 p-3 border border-white/[0.05] rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-mono font-medium text-zinc-300">Mouse Ambient Spotlight</span>
                <span className="text-[10px] text-zinc-500 font-mono">Radial gradient multiplier</span>
              </div>
              <button 
                onClick={() => setInteractiveGlow(!interactiveGlow)}
                className={`w-9 h-5 rounded-full p-1 transition-all flex items-center cursor-pointer ${interactiveGlow ? 'bg-indigo-600 justify-end' : 'bg-zinc-800 justify-start'}`}
              >
                <span className="w-3.5 h-3.5 bg-white rounded-full shadow-md" />
              </button>
            </div>

            {/* Choose interactive theme palette */}
            <div className="space-y-2.5 mb-5">
              <label className="text-[9px] font-mono text-white/40 tracking-widest uppercase block mb-1">
                Select Accent Palette
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(['indigo', 'emerald', 'crimson', 'amber', 'cyan'] as AccentTheme[]).map((col) => (
                  <button
                    key={col}
                    onClick={() => setTheme(col)}
                    className={`p-2 rounded-xl border text-xs font-mono tracking-tight transition-all flex flex-col items-center gap-1 select-none cursor-pointer ${getThemeBorderActive(col)}`}
                  >
                    <span className={`w-3 h-3 rounded-full ${
                      col === 'indigo' ? 'bg-indigo-500' :
                      col === 'emerald' ? 'bg-emerald-500' :
                      col === 'crimson' ? 'bg-rose-500' :
                      col === 'amber' ? 'bg-amber-500' : 'bg-cyan-500'
                    }`} />
                    <span className="text-[8px] text-zinc-400 capitalize">{col}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic star click burst action */}
            <button
              onClick={spawnBurst}
              disabled={isSpawning}
              className={`w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white hover:text-black text-[10px] font-mono tracking-widest font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${isSpawning ? 'scale-95' : ''}`}
            >
              <Sparkles size={12} className={isSpawning ? 'animate-spin' : ''} />
              <span>SPAWN CLICK BURST</span>
            </button>
          </div>

          {/* Active Terminal HUD console line */}
          <div 
            id="terminal-status-panel"
            className="bg-[#050505]/80 border border-white/[0.08] rounded-2xl p-5 font-mono text-xs text-zinc-400 space-y-3.5 backdrop-blur-xl relative"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] flex items-center gap-1">
                <Terminal size={12} className="text-white/30" /> System Status Inspector
              </span>
              <span className="text-[10px] text-white/20 select-none">ID: f267d6</span>
            </div>

            <div className="space-y-1.5 text-[11px] text-zinc-400">
              <div className="flex justify-between">
                <span>domain_pointer</span>
                <span className="text-[#f0f0f0] font-mono font-medium">elijahhawk.io</span>
              </div>
              <div className="flex justify-between">
                <span>animation_driver</span>
                <span className="text-[#f0f0f0]">GSAP@3.12.5 ticker</span>
              </div>
              <div className="flex justify-between">
                <span>graphics_canvas</span>
                <span className="text-white flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    theme === 'indigo' ? 'bg-indigo-500' :
                    theme === 'emerald' ? 'bg-emerald-500' :
                    theme === 'crimson' ? 'bg-rose-500' :
                    theme === 'amber' ? 'bg-amber-500' : 'bg-cyan-500'
                  } animate-pulse`} />
                  HTML5_2D_Stage
                </span>
              </div>
              <div className="flex justify-between">
                <span>environment</span>
                <span className="text-zinc-500">React_19_Vite_V4</span>
              </div>
            </div>
            
            <div className="text-[10px] text-white/30 pt-1 flex justify-between border-t border-white/[0.06]">
              <span>Timestamp</span>
              <span>{currentTime || 'Syncing...'}</span>
            </div>
          </div>

          {/* Guestbook Board */}
          <Guestbook />

        </div>
      </section>

      {/* Footer layout credits */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between z-10 py-4 border-t border-white/[0.06] text-[10px] text-white/30 mt-8 gap-2 font-mono tracking-widest uppercase">
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4">
          <span>© 2026 ELIJAH HAWK. RIGHTS RESERVED.</span>
          <span className="hidden sm:inline text-white/10">|</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            DEPLOYMENT PENDING
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>IDENTITY SUITE v0.01</span>
        </div>
      </footer>

      {/* Guide details overlay sheet */}
      {showGuide && (
        <DeployGuide theme={theme} onClose={() => setShowGuide(false)} />
      )}

    </main>
  );
}
