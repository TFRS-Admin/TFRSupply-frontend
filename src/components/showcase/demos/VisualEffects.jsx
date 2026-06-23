import React, { useState, useEffect, useRef } from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

function GlitchEffect() {
  const [glitching, setGlitching] = useState(false);
  return (
    <div className="text-center flex flex-col items-center gap-3">
      <div className="relative text-3xl font-black" style={glitching ? { textShadow: '3px 0 red, -3px 0 blue', transform: 'skewX(-2deg)' } : {}}>
        <span className={glitching ? 'text-green-400' : 'text-gray-900'}>GLITCH</span>
        {glitching && <>
          <span className="absolute inset-0 text-red-500 opacity-70" style={{ transform: 'translate(3px,0)' }}>GLITCH</span>
          <span className="absolute inset-0 text-blue-500 opacity-70" style={{ transform: 'translate(-3px,0)' }}>GLITCH</span>
        </>}
      </div>
      <button onClick={() => { setGlitching(true); setTimeout(() => setGlitching(false), 700); }} className="bg-gray-900 text-white text-xs font-bold px-4 py-1.5 rounded">Trigger Glitch</button>
    </div>
  );
}

function MarqueeEffect() {
  const items = ['🚀 New Features','⭐ Special Offer','🔥 Hot Deal','💎 Premium','🎉 Celebrate'];
  const [speed, setSpeed] = useState(20);
  return (
    <div className="w-full max-w-xs">
      <div className="overflow-hidden border border-gray-200 rounded-lg py-2 mb-2">
        <div className="flex gap-8 whitespace-nowrap" style={{ animation: `marquee ${speed}s linear infinite` }}>
          {[...items, ...items].map((item, i) => <span key={i} className="text-xs font-bold text-gray-700">{item}</span>)}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500">Speed: {speed}s</span>
        <input type="range" min="5" max="40" value={speed} onChange={e => setSpeed(+e.target.value)} className="flex-1" />
      </div>
      <style>{`@keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
    </div>
  );
}

function ScreenShake() {
  const [shaking, setShaking] = useState(false);
  return (
    <div className="text-center flex flex-col items-center gap-3">
      <div className="text-4xl" style={shaking ? { animation: 'screenShake 0.5s ease-in-out' } : {}}>💥</div>
      <button onClick={() => { setShaking(true); setTimeout(() => setShaking(false), 600); }} className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg">💣 Trigger Shake</button>
      <style>{`@keyframes screenShake{0%,100%{transform:translate(0,0)}20%{transform:translate(-8px,5px)}40%{transform:translate(8px,-5px)}60%{transform:translate(-5px,8px)}80%{transform:translate(5px,-8px)}}`}</style>
    </div>
  );
}

function VHSEffect() {
  const [scanlines, setScanlines] = useState(true);
  const [noise, setNoise] = useState(true);
  const [intensity, setIntensity] = useState(50);
  return (
    <div className="w-full max-w-xs">
      <div className="relative rounded-lg overflow-hidden h-28">
        <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop" alt="Retro" className="w-full h-full object-cover" />
        {scanlines && <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15) 1px,transparent 1px,transparent 3px)', opacity: intensity / 100 }} />}
        {noise && <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, opacity: intensity / 200 }} />}
      </div>
      <div className="flex gap-3 mt-2 text-[10px] font-bold">
        <button onClick={() => setScanlines(s => !s)} className={`px-2 py-1 rounded border ${scanlines ? 'bg-green-100 border-green-300 text-green-700' : 'border-gray-200 text-gray-500'}`}>Scanlines</button>
        <button onClick={() => setNoise(n => !n)} className={`px-2 py-1 rounded border ${noise ? 'bg-green-100 border-green-300 text-green-700' : 'border-gray-200 text-gray-500'}`}>Static Noise</button>
      </div>
    </div>
  );
}

function DuotoneFilter() {
  const [mode, setMode] = useState('purple-cyan');
  const modes = { 'purple-cyan': 'hue-rotate(270deg) saturate(2)', 'pink-orange': 'hue-rotate(320deg) saturate(2)', 'green-blue': 'hue-rotate(180deg) saturate(2)' };
  return (
    <div className="w-full max-w-xs">
      <div className="relative rounded-lg overflow-hidden h-28 mb-2">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=300&fit=crop" alt="Portrait" className="w-full h-full object-cover" style={{ filter: modes[mode] }} />
      </div>
      <div className="flex gap-1">
        {Object.keys(modes).map(m => <button key={m} onClick={() => setMode(m)} className={`flex-1 text-[9px] font-bold px-1 py-1 rounded border ${mode===m?'bg-blue-600 text-white border-blue-600':'border-gray-200 text-gray-600'}`}>{m}</button>)}
      </div>
    </div>
  );
}

function BlurReveal() {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="relative rounded-xl overflow-hidden w-full max-w-xs h-28 cursor-pointer" onClick={() => setRevealed(r => !r)}>
      <img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=200&fit=crop" alt="Nature" className="w-full h-full object-cover transition-all duration-500" style={{ filter: revealed ? 'blur(0)' : 'blur(12px)', transform: revealed ? 'scale(1)' : 'scale(1.05)' }} />
      {!revealed && <div className="absolute inset-0 flex items-center justify-center"><button className="bg-white/90 text-gray-900 font-black text-xs px-4 py-2 rounded-full">Reveal Content</button></div>}
    </div>
  );
}

function MatrixRain() {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cols = Math.floor(canvas.width / 14);
    const drops = Array(cols).fill(1);
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789';
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#22c55e';
      ctx.font = '12px monospace';
      drops.forEach((y, i) => {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, y * 14);
        if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const t = setInterval(draw, 50);
    return () => clearInterval(t);
  }, []);
  return <canvas ref={canvasRef} width={160} height={100} className="rounded-lg bg-black" />;
}

function FrostedGlass() {
  return (
    <div className="relative h-28 w-full max-w-xs rounded-xl overflow-hidden">
      <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop" alt="Mountain" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-4 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}>
        <div className="font-black text-white text-sm">Frosted Glass Card</div>
        <div className="text-white/70 text-xs">Uses backdrop-filter blur</div>
      </div>
    </div>
  );
}

function ParticleSystem() {
  const [type, setType] = useState('snow');
  const particles = Array.from({ length: 20 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 3, dur: 2 + Math.random() * 2 }));
  return (
    <div className="w-full max-w-xs">
      <div className="relative w-full h-24 overflow-hidden bg-gray-900 rounded-xl mb-2">
        {particles.map(p => (
          <div key={p.id} className="absolute text-sm" style={{ left: `${p.x}%`, top: 0, animation: `fall ${p.dur}s ${p.delay}s linear infinite` }}>{type === 'snow' ? '❄️' : '✨'}</div>
        ))}
      </div>
      <div className="flex gap-2">
        {['snow','fireflies'].map(t => <button key={t} onClick={() => setType(t)} className={`flex-1 text-xs font-bold py-1 rounded-lg border ${type===t?'bg-gray-900 text-white border-gray-900':'border-gray-200 text-gray-600'}`}>{t === 'snow' ? '❄️ Snow' : '✨ Fireflies'}</button>)}
      </div>
      <style>{`@keyframes fall { from{transform:translateY(-10px)} to{transform:translateY(110px)} }`}</style>
    </div>
  );
}

function NeonGlow() {
  const [color, setColor] = useState('cyan');
  const colors = { cyan: { text: 'text-cyan-400', shadow: '0 0 10px cyan, 0 0 30px cyan, 0 0 60px cyan' }, pink: { text: 'text-pink-400', shadow: '0 0 10px #f472b6, 0 0 30px #f472b6, 0 0 60px #f472b6' }, green: { text: 'text-green-400', shadow: '0 0 10px #4ade80, 0 0 30px #4ade80, 0 0 60px #4ade80' } };
  return (
    <div className="bg-gray-950 rounded-xl p-5 text-center w-full max-w-xs flex flex-col items-center gap-3">
      <div className={`text-3xl font-black ${colors[color].text}`} style={{ textShadow: colors[color].shadow }}>NEON</div>
      <div className="flex gap-2">
        {Object.keys(colors).map(c => <button key={c} onClick={() => setColor(c)} className={`text-[10px] font-bold px-2.5 py-1 rounded border ${color===c?'bg-white text-black':'border-gray-600 text-gray-400'}`}>{c}</button>)}
      </div>
    </div>
  );
}

function GradientBorderCard() {
  const [animating, setAnimating] = useState(false);
  return (
    <div className="w-full max-w-xs">
      <div className="p-0.5 rounded-xl" style={{ background: animating ? undefined : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', backgroundSize: animating ? '200% 200%' : undefined, animation: animating ? 'gradShift 2s ease infinite' : undefined, backgroundImage: animating ? 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)' : undefined }}>
        <div className="bg-white rounded-[10px] p-4 text-center">
          <div className="font-black text-gray-900">Gradient Border Card</div>
          <div className="text-gray-500 text-xs mt-1">With animated background</div>
        </div>
      </div>
      <button onClick={() => setAnimating(a => !a)} className="mt-2 w-full text-xs font-bold border border-gray-200 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50">{animating ? 'Stop' : 'Animate'}</button>
      <style>{`@keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }`}</style>
    </div>
  );
}

function SpotlightEffect() {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const ref = useRef();
  const move = (e) => {
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };
  return (
    <div ref={ref} onMouseMove={move} className="relative w-full max-w-xs h-28 rounded-xl overflow-hidden cursor-crosshair">
      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop" alt="Portrait" className="w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle 60px at ${pos.x}% ${pos.y}%, transparent 0%, rgba(0,0,0,0.8) 100%)` }} />
      <div className="absolute bottom-2 right-2 text-white/50 text-[10px]">Move cursor</div>
    </div>
  );
}

function ParallaxTilt() {
  const [transform, setTransform] = useState('');
  const handle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 10;
    const y = (e.clientY - rect.top - rect.height / 2) / 10;
    setTransform(`perspective(400px) rotateY(${x}deg) rotateX(${-y}deg)`);
  };
  return (
    <div onMouseMove={handle} onMouseLeave={() => setTransform('')}
      className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 cursor-pointer text-white font-black text-center transition-transform w-36 h-24 flex items-center justify-center"
      style={{ transform }}>
      Hover Me
    </div>
  );
}

function WaterRipple() {
  const [ripples, setRipples] = useState([]);
  const addRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 1200);
  };
  return (
    <div onClick={addRipple} className="relative w-full max-w-xs h-24 bg-blue-900 rounded-xl overflow-hidden cursor-pointer flex items-center justify-center">
      <span className="text-blue-300 text-xs font-semibold select-none">Click anywhere</span>
      {ripples.map(r => (
        <div key={r.id} className="absolute rounded-full border-2 border-blue-300/60 pointer-events-none"
          style={{ left: r.x, top: r.y, width: 10, height: 10, transform: 'translate(-50%,-50%)', animation: 'ripple 1.2s ease-out forwards' }} />
      ))}
      <style>{`@keyframes ripple { to { width:120px; height:120px; opacity:0; } }`}</style>
    </div>
  );
}

function HolographicCard() {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const move = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };
  return (
    <div onMouseMove={move} onMouseLeave={() => setPos({ x: 50, y: 50 })}
      className="rounded-xl p-5 text-center w-36 h-24 flex items-center justify-center font-black cursor-pointer text-white"
      style={{
        background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, #f472b6, #8b5cf6, #3b82f6, #10b981)`,
        boxShadow: '0 0 20px rgba(139,92,246,0.5)'
      }}>
      HOLOGRAPHIC
    </div>
  );
}

function SkeletonLoader() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="w-full max-w-xs">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loaded ? (
          <div className="p-3">
            <div className="h-20 bg-blue-100 rounded-lg mb-3 flex items-center justify-center text-blue-600 text-2xl">🏔️</div>
            <div className="font-bold text-gray-900 text-sm">Mountain Sunrise</div>
            <div className="text-gray-500 text-xs">Beautiful morning light</div>
          </div>
        ) : (
          <div className="p-3">
            <div className="h-20 bg-gray-200 rounded-lg mb-3 animate-pulse" />
            <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-2 w-1/2 bg-gray-200 rounded animate-pulse" />
          </div>
        )}
      </div>
      <button onClick={() => setLoaded(l => !l)} className="mt-2 w-full text-xs font-bold border border-gray-200 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50">{loaded ? 'Show Skeleton' : 'Show Content'}</button>
    </div>
  );
}

export default function VisualEffects() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <EffectCard title="Glitch Effect" desc="Digital distortion with RGB channel splitting" whenToUse="Cyberpunk themes, error states, edgy brand aesthetics." prompt="Create a glitch effect with duplicate text elements offset 3px left/right in red and blue, toggled on click with a 700ms timeout." code={`function GlitchText() {\n  const [glitching, setGlitching] = useState(false);\n  return (\n    <div className="relative">\n      <span className={glitching ? 'text-green-400' : 'text-gray-900'}>GLITCH</span>\n      {glitching && (\n        <>\n          <span className="absolute inset-0 text-red-500 opacity-70" style={{ transform: 'translate(3px,0)' }}>GLITCH</span>\n          <span className="absolute inset-0 text-blue-500 opacity-70" style={{ transform: 'translate(-3px,0)' }}>GLITCH</span>\n        </>\n      )}\n    </div>\n  );\n}`}><GlitchEffect /></EffectCard>

      <EffectCard title="Marquee Scroll" desc="Horizontal scrolling text/images with speed control" whenToUse="Feature lists, announcements, partner logos, running tickers." prompt="Create a marquee with CSS @keyframes translateX from 0 to -50% on a doubled list. Add a speed control slider that changes animation-duration." code={`// Double the array so the loop is seamless\n<div className="overflow-hidden">\n  <div className="flex gap-8 whitespace-nowrap" style={{ animation: \`marquee \${speed}s linear infinite\` }}>\n    {[...items, ...items].map((item, i) => <span key={i}>{item}</span>)}\n  </div>\n</div>\n// @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}><MarqueeEffect /></EffectCard>

      <EffectCard title="Screen Shake" desc="Impact shake animation for dramatic moments" whenToUse="Explosions, errors, impactful events, game feedback." prompt="Create a screen shake effect with CSS @keyframes that translates the element in random X/Y directions over 5 keyframe stops." code={`// @keyframes screenShake {\n//   0%,100%{transform:translate(0,0)}\n//   20%{transform:translate(-8px,5px)}\n//   40%{transform:translate(8px,-5px)}\n//   60%{transform:translate(-5px,8px)}\n//   80%{transform:translate(5px,-8px)}\n// }\n<div style={{ animation: shaking ? 'screenShake 0.5s ease-in-out' : '' }}>{content}</div>`}><ScreenShake /></EffectCard>

      <EffectCard title="VHS / CRT Effect" desc="Retro TV aesthetic with scanlines and static" whenToUse="Retro-themed apps, nostalgic content, vintage media players." prompt="Create a VHS effect using two overlays: one with repeating-linear-gradient for scanlines, one with SVG feTurbulence noise for static. Toggle each independently." code={`// Scanlines overlay\n<div className="absolute inset-0" style={{\n  backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15) 1px,transparent 1px,transparent 3px)'\n}} />\n// Noise overlay using SVG filter\n<div className="absolute inset-0" style={{ backgroundImage: \`url("data:image/svg+xml,...feTurbulence...")\` }} />`}><VHSEffect /></EffectCard>

      <EffectCard title="Duotone Filter" desc="Two-color CSS filter effect on images" whenToUse="Photography apps, stylized branding, artistic profiles." prompt="Create a duotone image filter using CSS hue-rotate() and saturate() filters. Provide 3 presets: purple-cyan, pink-orange, green-blue." code={`const modes = {\n  'purple-cyan': 'hue-rotate(270deg) saturate(2)',\n  'pink-orange': 'hue-rotate(320deg) saturate(2)',\n  'green-blue': 'hue-rotate(180deg) saturate(2)'\n};\n<img style={{ filter: modes[selectedMode] }} />`}><DuotoneFilter /></EffectCard>

      <EffectCard title="Blur Reveal" desc="Blurred content reveals on interaction" whenToUse="Spoilers, paywalled content, reveal mechanics." prompt="Create a blur reveal where the image starts with filter:blur(12px) scale(1.05) and transitions to blur(0) scale(1) on click." code={`<div onClick={() => setRevealed(r => !r)} className="relative overflow-hidden">\n  <img className="transition-all duration-500"\n    style={{ filter: revealed ? 'blur(0)' : 'blur(12px)', transform: revealed ? 'scale(1)' : 'scale(1.05)' }} />\n  {!revealed && <div className="absolute inset-0 flex items-center justify-center"><button>Reveal Content</button></div>}\n</div>`}><BlurReveal /></EffectCard>

      <EffectCard title="Matrix Rain" desc="Digital falling character rain on canvas" whenToUse="Hacker themes, terminal aesthetics, dramatic intros." prompt="Create Matrix digital rain on a canvas element. Use setInterval to draw random Japanese/numeric characters in green. Each column tracks its drop position. Fade with a semi-transparent fill each frame." code={`useEffect(() => {\n  const ctx = canvas.getContext('2d');\n  const drops = Array(cols).fill(1);\n  const draw = () => {\n    ctx.fillStyle = 'rgba(0,0,0,0.05)';\n    ctx.fillRect(0, 0, canvas.width, canvas.height);\n    ctx.fillStyle = '#22c55e';\n    ctx.font = '12px monospace';\n    drops.forEach((y, i) => {\n      ctx.fillText(randomChar(), i*14, y*14);\n      if (y*14 > canvas.height && Math.random() > 0.975) drops[i] = 0;\n      drops[i]++;\n    });\n  };\n  const t = setInterval(draw, 50);\n  return () => clearInterval(t);\n}, []);`}><MatrixRain /></EffectCard>

      <EffectCard title="Frosted Glass" desc="Glassmorphism card with backdrop-blur" whenToUse="Modern cards, overlays, Apple-style interfaces." prompt="Create a frosted glass card using backdrop-filter:blur(12px), background:rgba(255,255,255,0.15), and border:1px solid rgba(255,255,255,0.3), placed over a background image." code={`<div className="relative rounded-xl overflow-hidden">\n  <img className="absolute inset-0 w-full h-full object-cover" />\n  <div className="absolute inset-4 rounded-xl p-3" style={{\n    background: 'rgba(255,255,255,0.15)',\n    backdropFilter: 'blur(12px)',\n    border: '1px solid rgba(255,255,255,0.3)'\n  }}>\n    <div className="font-black text-white">Frosted Glass Card</div>\n  </div>\n</div>`}><FrostedGlass /></EffectCard>

      <EffectCard title="Particle System" desc="Snow or firefly particles with count control" whenToUse="Seasonal themes, celebrations, ambient backgrounds." prompt="Create a particle system with 20 particles that fall using CSS animation. Random x positions, delays, and durations. Toggle between snow ❄️ and firefly ✨ emojis." code={`const particles = Array.from({ length: 20 }, (_, i) => ({\n  id: i, x: Math.random() * 100,\n  delay: Math.random() * 3, dur: 2 + Math.random() * 2\n}));\n// @keyframes fall { from{transform:translateY(-10px)} to{transform:translateY(110px)} }\n{particles.map(p => (\n  <div key={p.id} style={{ left:\`\${p.x}%\`, animation:\`fall \${p.dur}s \${p.delay}s linear infinite\` }}>\n    {type === 'snow' ? '❄️' : '✨'}\n  </div>\n))}`}><ParticleSystem /></EffectCard>

      <EffectCard title="Neon Glow Text" desc="Glowing text with color options" whenToUse="Nightlife themes, gaming UIs, highlighting key content." prompt="Create neon text using CSS textShadow with 3 layers: 10px, 30px, and 60px spread in the same color. Add color presets and a dark background." code={`<div className="bg-gray-950 rounded-xl p-5 text-center">\n  <div className="text-3xl font-black text-cyan-400" style={{\n    textShadow: '0 0 10px cyan, 0 0 30px cyan, 0 0 60px cyan'\n  }}>\n    NEON\n  </div>\n</div>`}><NeonGlow /></EffectCard>

      <EffectCard title="Gradient Border" desc="Animated gradient border with wrapper trick" whenToUse="Premium cards, special offers, highlighted elements." prompt="Create a gradient border by wrapping a white card in a div with background:linear-gradient(...) and padding:2px. The inner card's background hides the gradient except at the edges." code={`<div className="p-0.5 rounded-xl"\n  style={{ background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)' }}>\n  <div className="bg-white rounded-[10px] p-4">\n    Card content\n  </div>\n</div>`}><GradientBorderCard /></EffectCard>

      <EffectCard title="Spotlight Effect" desc="Cursor-following dark overlay reveal" whenToUse="Image galleries, text reveals, interactive exploration." prompt="Create a spotlight by overlaying a radial-gradient(circle 60px at cursor%, transparent, rgba(0,0,0,0.8)) that tracks cursor position via onMouseMove." code={`const [pos, setPos] = useState({ x: 50, y: 50 });\nconst move = (e) => {\n  const rect = ref.current.getBoundingClientRect();\n  setPos({\n    x: ((e.clientX - rect.left) / rect.width) * 100,\n    y: ((e.clientY - rect.top) / rect.height) * 100\n  });\n};\n<div style={{ background: \`radial-gradient(circle 60px at \${pos.x}% \${pos.y}%, transparent, rgba(0,0,0,0.8))\` }} />`}><SpotlightEffect /></EffectCard>

      <EffectCard title="Parallax Tilt" desc="3D card tilt following cursor" whenToUse="Product cards, portfolios, interactive galleries." prompt="Create a 3D tilt card that follows cursor using onMouseMove. Calculate rotateX and rotateY from cursor position vs card center, divide by 10 for subtle effect." code={`function TiltCard() {\n  const [t, setT] = useState('');\n  const move = (e) => {\n    const rect = e.currentTarget.getBoundingClientRect();\n    const x = (e.clientX - rect.left - rect.width/2) / 10;\n    const y = (e.clientY - rect.top - rect.height/2) / 10;\n    setT(\`perspective(400px) rotateY(\${x}deg) rotateX(\${-y}deg)\`);\n  };\n  return <div onMouseMove={move} onMouseLeave={() => setT('')} style={{ transform: t }}>content</div>;\n}`}><ParallaxTilt /></EffectCard>

      <EffectCard title="Water Ripple" desc="Click to spawn expanding water ripples" whenToUse="Interactive backgrounds, satisfying click feedback." prompt="Create water ripples that spawn from click position. Each ripple grows from 10px to 120px and fades using @keyframes." code={`const [ripples, setRipples] = useState([]);\nconst add = (e) => {\n  const id = Date.now();\n  setRipples(r => [...r, { id, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }]);\n  setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 1200);\n};\n// @keyframes ripple { to { width:120px; height:120px; opacity:0; } }`}><WaterRipple /></EffectCard>

      <EffectCard title="Holographic" desc="Iridescent rainbow gradient that follows cursor" whenToUse="Premium UI, futuristic themes, eye-catching cards." prompt="Create a holographic card using radial-gradient that shifts colors based on mouse position. The gradient center moves with the cursor." code={`function HolographicCard() {\n  const [pos, setPos] = useState({ x: 50, y: 50 });\n  const move = (e) => {\n    const rect = e.currentTarget.getBoundingClientRect();\n    setPos({ x: ((e.clientX-rect.left)/rect.width)*100, y: ((e.clientY-rect.top)/rect.height)*100 });\n  };\n  return (\n    <div onMouseMove={move}\n      style={{ background: \`radial-gradient(circle at \${pos.x}% \${pos.y}%, #f472b6, #8b5cf6, #3b82f6, #10b981)\` }}>\n      HOLOGRAPHIC\n    </div>\n  );\n}`}><HolographicCard /></EffectCard>

      <EffectCard title="Skeleton Loader" desc="Animated placeholder content" whenToUse="Data fetching to improve perceived performance." prompt="Create a skeleton loader card with animated gray divs for image, title, and subtitle. Toggle between skeleton and loaded content." code={`// Skeleton state\n<div className="animate-pulse">\n  <div className="h-20 bg-gray-200 rounded-lg mb-3" />\n  <div className="h-3 w-3/4 bg-gray-200 rounded mb-2" />\n  <div className="h-2 w-1/2 bg-gray-200 rounded" />\n</div>\n// Loaded state: actual content`}><SkeletonLoader /></EffectCard>
    </div>
  );
}