import { useState } from 'react';
import { BookOpen, Copy, Check, ExternalLink, Sliders, Globe, Code } from 'lucide-react';
import { AccentTheme } from '../types';

interface DeployGuideProps {
  theme: AccentTheme;
  onClose: () => void;
}

export default function DeployGuide({ theme, onClose }: DeployGuideProps) {
  const [activeTab, setActiveTab] = useState<'html' | 'dns' | 'gsap'>('html');
  const [copied, setCopied] = useState(false);

  const getAccentColor = () => {
    switch (theme) {
      case 'indigo': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      case 'emerald': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'crimson': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'amber': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'cyan': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    }
  };

  const getButtonBg = () => {
    switch (theme) {
      case 'indigo': return 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20';
      case 'crimson': return 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20';
      case 'amber': return 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20';
      case 'cyan': return 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20';
    }
  };

  const getTabBorder = (tab: typeof activeTab) => {
    if (activeTab === tab) {
      switch (theme) {
        case 'indigo': return 'border-indigo-500 text-indigo-400';
        case 'emerald': return 'border-emerald-500 text-emerald-400';
        case 'crimson': return 'border-rose-500 text-rose-400';
        case 'amber': return 'border-amber-500 text-amber-400';
        case 'cyan': return 'border-cyan-500 text-cyan-400';
      }
    }
    return 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-800';
  };

  // Standalone Single-file complete layout representing the same GSAP visuals in 1-file!
  const placeholderHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Elijah Hawk | coming soon</title>
    <!-- Premium Fonts linking -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-dark: #07070e;
            --accent-hex: ${
              theme === 'indigo' ? '#6366f1' :
              theme === 'emerald' ? '#10b981' :
              theme === 'crimson' ? '#f43f5e' :
              theme === 'amber' ? '#f59e0b' : '#06b6d4'
            };
            --accent-alpha: rgba(99, 102, 241, 0.15);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background-color: var(--bg-dark);
            color: #f4f4f7;
            font-family: 'Inter', sans-serif;
            height: 100vh;
            width: 100vw;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            position: relative;
        }

        /* Seamless Interactive Cursor Glow */
        #cursor-glow {
            position: fixed;
            top: 0;
            left: 0;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, var(--accent-hex) 0%, rgba(7, 7, 14, 0) 70%);
            opacity: 0.16;
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%);
            z-index: 1;
            mix-blend-mode: screen;
        }

        /* Premium Constellation Canvas */
        #particles-canvas {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: auto;
        }

        /* Ambient subtle light layers */
        .ambient-glow {
            position: absolute;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: var(--accent-hex);
            filter: blur(140px);
            opacity: 0.08;
            pointer-events: none;
        }
        .glow-top-right { top: 10%; right: 15%; }
        .glow-bottom-left { bottom: 10%; left: 15%; }

        /* Elegant Material Card Container */
        .container {
            position: relative;
            z-index: 2;
            width: 90%;
            max-width: 580px;
            padding: 3.5rem 2.5rem;
            background: rgba(10, 10, 18, 0.65);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            box-shadow: 
                0 4px 30px rgba(0, 0, 0, 0.4),
                inset 0 1px 1px rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            text-align: center;
        }

        /* Micro Tech-Badge formatting */
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 14px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.05);
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            color: #a1a1aa;
            margin-bottom: 2rem;
            opacity: 0;
        }

        .pulse-indicator {
            width: 6px;
            height: 6px;
            background-color: var(--accent-hex);
            border-radius: 50%;
            box-shadow: 0 0 8px var(--accent-hex);
            animation: softPulse 2s infinite;
        }

        @keyframes softPulse {
            0% { transform: scale(0.9); opacity: 0.6; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.6; }
        }

        /* Main typography */
        h1 {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            font-size: clamp(2.4rem, 6vw, 4rem);
            line-height: 1.05;
            letter-spacing: -0.04em;
            color: #fafafa;
            margin-bottom: 0.75rem;
            opacity: 0;
        }

        /* Accented text reveal styles */
        .gradient-text {
            background: linear-gradient(135deg, #ffffff 40%, var(--accent-hex) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        p {
            font-size: 1.05rem;
            font-weight: 300;
            color: #a1a1aa;
            line-height: 1.6;
            margin-bottom: 2.2rem;
            opacity: 0;
        }

        /* Interactive list buttons */
        .social-links {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 12px;
            opacity: 0;
        }

        .social-links a {
            color: #e4e4e7;
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 500;
            padding: 10px 20px;
            border: 1px solid rgba(255, 255, 255, 0.03);
            background: rgba(255, 255, 255, 0.01);
            border-radius: 14px;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .social-links a:hover {
            color: #ffffff;
            border-color: var(--accent-hex);
            background: rgba(255, 255, 255, 0.02);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 480px) {
            .container {
                padding: 2.5rem 1.5rem;
            }
            .social-links {
                flex-direction: column;
                width: 100%;
            }
            .social-links a {
                width: 100%;
                text-align: center;
            }
        }
    </style>
</head>
<body>

    <!-- Ambient colored bubbles -->
    <div class="ambient-glow glow-top-right"></div>
    <div class="ambient-glow glow-bottom-left"></div>

    <!-- Mouse Spotlight Overlay -->
    <div id="cursor-glow"></div>

    <!-- Background Constellation Net -->
    <canvas id="particles-canvas"></canvas>

    <div class="container">
        <!-- Status Indicator -->
        <div class="status-badge" id="badge">
            <span class="pulse-indicator"></span>
            <span>ELIJAHHAWK.IO</span>
        </div>

        <!-- Typography Heading -->
        <h1 id="brand-title"><span class="gradient-text">Elijah Hawk</span></h1>
        
        <!-- Tagline description -->
        <p id="pitch">Developer & interaction builder. Currently forging a new digital sanctuary for ideas, designs, and source laboratories.</p>
        
        <!-- Social Outlets -->
        <div class="social-links" id="links-block">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer">X / Twitter</a>
            <a href="mailto:elijah@elijahhawk.io">E-mail</a>
        </div>
    </div>

    <!-- GreenSock GSAP Animation SDK -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    
    <script>
        // Use window onload to query everything cleanly
        window.addEventListener('DOMContentLoaded', () => {
            
            // 1. Entrance Staggers using GSAP Timelines
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.to("#badge", {
                opacity: 1,
                y: -10,
                duration: 1.2
            })
            .to("#brand-title", {
                opacity: 1,
                y: -15,
                duration: 1.4
            }, "-=0.9")
            .to("#pitch", {
                opacity: 1,
                y: -10,
                duration: 1.2
            }, "-=1.1")
            .to("#links-block", {
                opacity: 1,
                y: -5,
                duration: 1.1
            }, "-=1.0");

            // 2. Optimized Mouse Spotlight with quickSetter
            const glow = document.getElementById('cursor-glow');
            if (glow) {
                const setX = gsap.quickSetter(glow, "xPercent", "%");
                const setY = gsap.quickSetter(glow, "yPercent", "%");

                // Centering correction factor
                window.addEventListener('mousemove', (e) => {
                    const xPercent = (e.clientX / window.innerWidth) * 100 - 50;
                    const yPercent = (e.clientY / window.innerHeight) * 100 - 50;
                    
                    gsap.to(glow, {
                        x: e.clientX,
                        y: e.clientY,
                        duration: 0.8,
                        ease: "power2.out"
                    });
                });
            }

            // 3. Interactive Floating Particles Engine on Canvas
            const canvas = document.getElementById('particles-canvas');
            const ctx = canvas.getContext('2d');
            let particles = [];
            let mouse = { x: -1000, y: -1000, active: false };

            const resize = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                init();
            };

            const init = () => {
                particles = [];
                const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 15000));
                for(let i = 0; i < count; i++) {
                    const alpha = Math.random() * 0.4 + 0.15;
                    particles.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        vx: (Math.random() - 0.5) * 0.4,
                        vy: (Math.random() - 0.5) * 0.4,
                        radius: Math.random() * 2 + 0.8,
                        alpha: alpha,
                        originalAlpha: alpha
                    });
                }
            };

            window.addEventListener('resize', resize);
            resize();

            // Track mouse details on canvas
            window.addEventListener('mousemove', (e) => {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
                mouse.active = true;
            });

            window.addEventListener('mouseleave', () => {
                mouse.active = false;
            });

            // Interactive Click Spawn
            window.addEventListener('click', (e) => {
                for(let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 * i) / 8;
                    const spd = Math.random() * 1.5 + 0.5;
                    particles.push({
                        x: e.clientX,
                        y: e.clientY,
                        vx: Math.cos(angle) * spd,
                        vy: Math.sin(angle) * spd,
                        radius: Math.random() * 1.5 + 1,
                        alpha: 0.9,
                        originalAlpha: 0.02
                    });
                }
                if(particles.length > 150) particles.splice(0, particles.length - 150);
            });

            // Ticker loop utilizing GSAP's optimized ticker
            const tick = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const w = canvas.width;
                const h = canvas.height;

                for(let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.x += p.vx;
                    p.y += p.vy;

                    if (p.x < 0 || p.x > w) p.vx *= -1;
                    if (p.y < 0 || p.y > h) p.vy *= -1;

                    // Mouse magnetic repulsion dynamics
                    if(mouse.active) {
                        const dx = p.x - mouse.x;
                        const dy = p.y - mouse.y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist < 150) {
                            const force = (150 - dist) / 150;
                            p.x += (dx / dist) * force * 1.5;
                            p.y += (dy / dist) * force * 1.5;
                            p.alpha = Math.min(p.originalAlpha + force * 0.5, 0.8);
                        } else {
                            p.alpha = Math.max(p.alpha - 0.02, p.originalAlpha);
                        }
                    } else {
                        p.alpha = Math.max(p.alpha - 0.02, p.originalAlpha);
                    }

                    // Click particle fadeout controls
                    if (p.originalAlpha === 0.02) {
                        p.alpha -= 0.01;
                    }

                    if(p.alpha <= 0) {
                        particles.splice(i, 1);
                        i--;
                        continue;
                    }

                    // Render node
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = \`rgba(\${
                        ${theme === 'indigo' ? '99, 102, 241' :
                          theme === 'emerald' ? '16, 185, 129' :
                          theme === 'crimson' ? '244, 63, 94' :
                          theme === 'amber' ? '245, 158, 11' : '6, 182, 212'}
                    }, \${p.alpha})\`;
                    ctx.fill();

                    // Render lines connecting nodes
                    for(let j = i + 1; j < particles.length; j++) {
                        const p2 = particles[j];
                        const dx = p.x - p2.x;
                        const dy = p.y - p2.y;
                        const dst = Math.sqrt(dx*dx + dy*dy);

                        if(dst < 100) {
                            const lineAlpha = (1 - dst/100) * 0.12 * Math.min(p.alpha, p2.alpha);
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.strokeStyle = \`rgba(\${
                                ${theme === 'indigo' ? '99, 102, 241' :
                                  theme === 'emerald' ? '16, 185, 129' :
                                  theme === 'crimson' ? '244, 63, 94' :
                                  theme === 'amber' ? '245, 158, 11' : '6, 182, 212'}
                            }, \${lineAlpha})\`;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }
                }
            };

            gsap.ticker.add(tick);
        });
    </script>
</body>
</html>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(placeholderHtml);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 min-h-screen w-full z-50 flex flex-col md:flex-row bg-[#04040a]/95 backdrop-blur-xl animate-fade-in p-4 md:p-8 overflow-y-auto">
      
      {/* Container header and guide notes */}
      <div className="w-full md:w-2/5 pr-0 md:pr-8 mb-6 md:mb-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 text-xs border rounded-full font-mono font-medium ${getAccentColor()}`}>
              DEPLOY COMPANION
            </span>
          </div>
          
          <h2 className="text-3xl font-display font-semibold text-white tracking-tight leading-tight mb-2">
            Taking <span className="text-indigo-400 font-medium">elijahhawk.io</span> Live
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Elijah, here is your fully interactive, high-performance static placeholder. All the GSAP visual logic (the staggers, the stellar particle network, and the responsive lighting) have been bundled into a single file so it starts instantly without any build pipeline config.
          </p>

          <nav className="flex space-x-1 border-b border-zinc-800/80 mb-6">
            <button
              id="guide-tab-html"
              onClick={() => setActiveTab('html')}
              className={`pb-3 text-xs font-medium border-b-2 transition-all cursor-pointer ${getTabBorder('html')}`}
            >
              <span className="flex items-center gap-1.5"><Code size={13} /> The Code</span>
            </button>
            <button
              id="guide-tab-dns"
              onClick={() => setActiveTab('dns')}
              className={`pb-3 text-xs font-medium border-b-2 transition-all cursor-pointer ${getTabBorder('dns')}`}
            >
              <span className="flex items-center gap-1.5"><Globe size={13} /> Custom Domain DNS</span>
            </button>
            <button
              id="guide-tab-gsap"
              onClick={() => setActiveTab('gsap')}
              className={`pb-3 text-xs font-medium border-b-2 transition-all cursor-pointer ${getTabBorder('gsap')}`}
            >
              <span className="flex items-center gap-1.5"><Sliders size={13} /> GSAP Techniques</span>
            </button>
          </nav>

          {/* Tab 1: Code info */}
          {activeTab === 'html' && (
            <div className="space-y-4 text-sm text-zinc-300">
              <div className="p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-xl space-y-2">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                  Why single-file HTML/CSS/JS?
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Single-file structures are perfectly optimized for web servers (like GitHub Pages or Netlify). It achieves near-instant load times (100 Lighthouse performance scores) and doesn't require complex bundlers.
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-medium text-white text-xs tracking-wider uppercase">Easy Hosting Methods</h4>
                <ul className="space-y-2 text-xs text-zinc-400 ml-4 list-disc leading-relaxed">
                  <li>
                    <strong className="text-zinc-200">Netlify (10 Seconds):</strong> Click "Netlify Drop", drag and drop a folder containing this file named <code className="text-indigo-300 font-mono bg-indigo-950/40 px-1 py-0.5 rounded">index.html</code>. Done!
                  </li>
                  <li>
                    <strong className="text-zinc-200">GitHub Pages (Free):</strong> Drop it in a public repo named <code className="text-indigo-300 font-mono bg-indigo-950/40 px-1 py-0.5 rounded">elijahhawk.github.io</code> and enable Pages in Settings.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Vercel:</strong> Install the Vercel CLI and type <code className="text-indigo-300 font-mono bg-indigo-950/40 px-1 py-0.5 rounded">vercel</code> in the folder.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: DNS settings */}
          {activeTab === 'dns' && (
            <div className="space-y-4 text-sm text-zinc-300">
              <p className="text-xs text-zinc-400 leading-relaxed mb-1">
                Once the placeholder is hosted on GitHub Pages or Netlify, link your personal domain <span className="text-white font-mono">elijahhawk.io</span> through your registrar (Namecheap, Porkbun, Cloudflare, etc.) using these record rules:
              </p>

              <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl font-mono text-xs space-y-3">
                <div className="border-b border-zinc-9fc0/20 pb-2">
                  <div className="text-indigo-400 mb-0.5 font-sans font-semibold">1. Root Apex Mapping (A Record)</div>
                  <div className="flex justify-between text-zinc-400">
                     <span>Type: <strong className="text-zinc-200">A</strong></span>
                     <span>Host: <strong className="text-zinc-200">@</strong></span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">Value: Netlify server IP (e.g., 75.2.60.5) or GitHub Pages servers.</div>
                </div>

                <div>
                  <div className="text-indigo-400 mb-0.5 font-sans font-semibold">2 Subdomain Redirect (CNAME)</div>
                  <div className="flex justify-between text-zinc-400">
                     <span>Type: <strong className="text-zinc-200">CNAME</strong></span>
                     <span>Host: <strong className="text-zinc-200">www</strong></span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">Value: Point to your subdomain tracker (e.g. hawk-soon.netlify.app).</div>
                </div>
              </div>

              <div className="p-3.5 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-xs text-zinc-400 leading-relaxed">
                <strong className="text-yellow-400 block mb-1">💡 DNS Propagation Notice</strong>
                Domain Records adjustments can take anywhere from 10 minutes to 24 hours to take effect worldwide.
              </div>
            </div>
          )}

          {/* Tab 3: GSAP explain */}
          {activeTab === 'gsap' && (
            <div className="space-y-3 text-sm text-zinc-300">
              <p className="text-xs text-zinc-400 leading-relaxed">
                This template showcases three critical components of the high-performance GSAP framework:
              </p>

              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 hide-scrollbar">
                <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                  <h5 className="font-mono text-xs text-indigo-300 font-semibold mb-1">gsap.quickSetter()</h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Rather than writing <code className="text-zinc-300">gsap.to()</code> on every single fast mouse movement, we initialize quick setters. It directly updates CSS transform parameters, keeping rendering under 2ms.
                  </p>
                </div>

                <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                  <h5 className="font-mono text-xs text-indigo-300 font-semibold mb-1">gsap.timeline() Sequencing</h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    By chaining animations with delay parameters like <code className="text-zinc-300">"-=0.9"</code>, we forge complex choreographies that overlap beautifully rather than firing in isolating silos.
                  </p>
                </div>

                <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                  <h5 className="font-mono text-xs text-indigo-300 font-semibold mb-1">gsap.ticker Animation Loop</h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    We hook the HTML5 canvas update routine to the central GSAP ticker. It synchronizes automatically with the browser's refresh rate (including 120Hz/144Hz monitors), and auto-throttles when the tab loses active focus to save device battery.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          id="btn-close-guide"
          onClick={onClose}
          className={`w-full mt-6 py-2.5 rounded-xl font-medium text-xs transition-all duration-300 cursor-pointer ${getButtonBg()}`}
        >
          Return to Preview Screen
        </button>
      </div>

      {/* Code window */}
      <div className="w-full md:w-3/5 flex flex-col bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden mt-6 md:mt-0 flex-grow">
        <div className="px-4 py-3 bg-zinc-905 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30"></span>
            <span className="text-xs font-mono text-zinc-400 ml-2">index.html (GSAP Standalone)</span>
          </div>
          
          <button
            id="btn-copy-code"
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={13} className="text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 font-mono text-[11px] leading-relaxed text-zinc-400 overflow-auto flex-grow h-[400px] md:h-auto select-all selection:bg-zinc-800">
          <pre>{placeholderHtml}</pre>
        </div>
      </div>
    </div>
  );
}
