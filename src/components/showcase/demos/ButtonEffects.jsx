import React, { useState, useRef } from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

function RippleBtn() {
  const [ripples, setRipples] = useState([]);
  const ref = useRef();
  const add = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 600);
  };
  return (
    <button ref={ref} onClick={add} className="relative overflow-hidden bg-blue-600 text-white font-bold px-8 py-3 rounded-lg select-none">
      Click Me
      {ripples.map(r => <span key={r.id} className="absolute rounded-full bg-white/40 w-16 h-16 -translate-x-1/2 -translate-y-1/2 animate-ping pointer-events-none" style={{ left: r.x, top: r.y, animationDuration: '0.6s' }} />)}
    </button>
  );
}

function FillBtn() {
  const [dir, setDir] = useState('left');
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative overflow-hidden border-2 border-blue-600 text-blue-600 font-bold px-8 py-3 rounded-lg cursor-pointer group">
        <span className={`absolute inset-0 bg-blue-600 transition-transform duration-300 ${dir === 'left' ? '-translate-x-full group-hover:translate-x-0' : dir === 'right' ? 'translate-x-full group-hover:translate-x-0' : '-translate-y-full group-hover:translate-y-0'}`} />
        <span className="relative group-hover:text-white transition-colors duration-300">Hover Me</span>
      </div>
      <div className="flex gap-1">
        {['left','right','center'].map(d => <button key={d} onClick={() => setDir(d)} className={`text-[10px] font-bold px-2 py-0.5 rounded ${dir===d?'bg-blue-600 text-white':'bg-gray-100 text-gray-600'}`}>{d}</button>)}
      </div>
    </div>
  );
}

function PressBtn() {
  const [pressed, setPressed] = useState(false);
  return (
    <button onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)}
      className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg select-none transition-all"
      style={{ transform: pressed ? 'translateY(4px)' : 'translateY(0)', boxShadow: pressed ? '0 1px 0 #312e81' : '0 6px 0 #312e81' }}>
      Press Me
    </button>
  );
}

function ShakeBtn() {
  const [shaking, setShaking] = useState(false);
  const [val, setVal] = useState('');
  const submit = () => { if (!val) { setShaking(true); setTimeout(() => setShaking(false), 500); } };
  return (
    <div className="flex gap-2">
      <input value={val} onChange={e => setVal(e.target.value)} placeholder="Email" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 w-28" />
      <button onClick={submit} className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg text-sm" style={{ animation: shaking ? 'shake 0.4s ease-in-out' : '' }}>
        Submit
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
      </button>
    </div>
  );
}

function LoadingBtn() {
  const [state, setState] = useState('idle');
  const click = () => { setState('loading'); setTimeout(() => setState('success'), 1800); setTimeout(() => setState('idle'), 3200); };
  return (
    <button onClick={click} disabled={state === 'loading'} className={`px-8 py-3 rounded-lg font-bold text-white transition-all ${state === 'success' ? 'bg-green-500' : 'bg-blue-600 disabled:bg-blue-400'}`}>
      {state === 'idle' && 'Submit'}
      {state === 'loading' && <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="31.4" strokeDashoffset="10" /></svg>Loading...</span>}
      {state === 'success' && '✓ Done!'}
    </button>
  );
}

function LikeBtn() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(42);
  return (
    <button onClick={() => { setLiked(l => !l); setCount(c => liked ? c - 1 : c + 1); }} className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-red-200 hover:bg-red-50 transition-all">
      <span className={`text-xl transition-transform ${liked ? 'scale-125' : ''}`}>{liked ? '❤️' : '🤍'}</span>
      <span className="font-bold text-gray-700">{count}</span>
    </button>
  );
}

function CartBtn() {
  const [state, setState] = useState('idle');
  return (
    <button onClick={() => { setState('added'); setTimeout(() => setState('idle'), 2000); }} className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${state === 'added' ? 'bg-green-500' : 'bg-gray-900'}`}>
      {state === 'idle' ? '🛒 Add to Cart' : '✓ Added!'}
    </button>
  );
}

function DownloadBtn() {
  const [pct, setPct] = useState(0);
  const [running, setRunning] = useState(false);
  const start = () => {
    if (running) return;
    setRunning(true); setPct(0);
    let p = 0;
    const t = setInterval(() => { p += 2; setPct(p); if (p >= 100) { clearInterval(t); setTimeout(() => { setRunning(false); setPct(0); }, 800); } }, 40);
  };
  return (
    <button onClick={start} className="relative overflow-hidden px-8 py-3 rounded-lg font-bold text-white bg-gray-900 min-w-[140px]">
      <div className="absolute inset-0 bg-blue-600 transition-all duration-75" style={{ width: `${pct}%` }} />
      <span className="relative">{running ? `${pct}%` : '⬇ Download'}</span>
    </button>
  );
}

function MagneticBtn() {
  const ref = useRef();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const move = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    setPos({ x, y });
  };
  return (
    <button ref={ref} onMouseMove={move} onMouseLeave={() => setPos({ x: 0, y: 0 })}
      className="bg-purple-600 text-white font-bold px-8 py-3 rounded-full transition-transform duration-150"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
      Hover Around
    </button>
  );
}

function BorderAnimBtn() {
  return (
    <button className="relative px-8 py-3 text-blue-600 font-bold rounded-lg overflow-hidden border border-blue-200 hover:border-transparent group">
      <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899,#3b82f6)', backgroundSize: '200%', animation: 'borderMove 1.5s linear infinite' }} />
      <span className="absolute inset-[2px] bg-white rounded-md" />
      <span className="relative">Hover Me</span>
      <style>{`@keyframes borderMove{from{background-position:0%}to{background-position:200%}}`}</style>
    </button>
  );
}

function GlowBtn() {
  return (
    <button className="px-8 py-3 rounded-lg font-bold text-white bg-purple-600 transition-all duration-300 hover:shadow-[0_0_25px_rgba(139,92,246,0.8)] hover:bg-purple-500">
      Glow Hover
    </button>
  );
}

function ToggleBtn() {
  const [on, setOn] = useState(false);
  return (
    <button onClick={() => setOn(o => !o)} className={`w-14 h-7 rounded-full transition-colors duration-300 relative ${on ? 'bg-blue-600' : 'bg-gray-300'}`}>
      <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${on ? 'translate-x-7' : 'translate-x-0'}`} />
      <span className="sr-only">{on ? 'ON' : 'OFF'}</span>
    </button>
  );
}

function PulseBtn() {
  return (
    <div className="relative inline-flex">
      <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-40" />
      <button className="relative bg-orange-500 text-white font-bold px-7 py-3 rounded-full">Subscribe</button>
    </div>
  );
}

function NeonBtn() {
  return (
    <button className="px-8 py-3 rounded-lg font-bold text-cyan-300 border-2 border-cyan-400 bg-black transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.8)] hover:text-white">
      Neon
    </button>
  );
}

function ConfettiBtn() {
  const [bursting, setBursting] = useState(false);
  const burst = () => { setBursting(true); setTimeout(() => setBursting(false), 800); };
  const dots = Array.from({ length: 12 }, (_, i) => ({ id: i, angle: (i * 30) * Math.PI / 180, color: ['red-500','blue-500','green-500','yellow-400','purple-500','pink-500'][i % 6] }));
  return (
    <div className="relative">
      <button onClick={burst} className="bg-pink-500 text-white font-bold px-7 py-3 rounded-full">🎉 Celebrate!</button>
      {dots.map(d => (
        <span key={d.id} className={`absolute w-2 h-2 rounded-full pointer-events-none bg-${d.color}`}
          style={{ left: '50%', top: '50%', transform: bursting ? `translate(${Math.cos(d.angle) * 45}px,${Math.sin(d.angle) * 45}px)` : 'translate(0,0)', opacity: bursting ? 0 : 1, transition: 'all 0.7s ease-out' }} />
      ))}
    </div>
  );
}

function ScrambleBtn() {
  const original = 'DECODE';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
  const [text, setText] = useState(original);
  const scramble = () => {
    let iter = 0;
    const t = setInterval(() => {
      setText(original.split('').map((c, i) => i < iter ? original[i] : chars[Math.floor(Math.random() * chars.length)]).join(''));
      if (iter >= original.length) clearInterval(t);
      iter += 0.3;
    }, 40);
  };
  return <button onClick={scramble} className="font-mono font-black text-xl text-green-500 hover:text-green-400 bg-black px-6 py-3 rounded-lg">{text}</button>;
}

function FlipCardBtn() {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="cursor-pointer" onClick={() => setFlipped(f => !f)} style={{ perspective: '600px', width: 120, height: 60 }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)', transition: 'transform 0.5s' }}>
        <div className="absolute inset-0 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black" style={{ backfaceVisibility: 'hidden' }}>Front</div>
        <div className="absolute inset-0 bg-purple-600 text-white rounded-xl flex items-center justify-center font-black" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>Back!</div>
      </div>
    </div>
  );
}

function HoldBtn() {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const interval = useRef(null);
  const start = () => {
    interval.current = setInterval(() => {
      setPct(p => { if (p >= 100) { clearInterval(interval.current); setDone(true); return 100; } return p + 5; });
    }, 50);
  };
  const stop = () => { clearInterval(interval.current); if (pct < 100) { setPct(0); setDone(false); } };
  return (
    <button onMouseDown={start} onMouseUp={stop} onMouseLeave={stop}
      className={`relative overflow-hidden px-8 py-3 rounded-full font-bold text-white select-none min-w-[140px] ${done ? 'bg-green-500' : 'bg-gray-900'}`}>
      <div className="absolute inset-0 bg-orange-500 transition-none" style={{ width: `${pct}%` }} />
      <span className="relative">{done ? '✓ Activated!' : 'Hold Me'}</span>
    </button>
  );
}

function SwipeBtn() {
  const [x, setX] = useState(0);
  const [done, setDone] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const start = (e) => { dragging.current = true; startX.current = e.clientX || e.touches?.[0]?.clientX; };
  const move = (e) => {
    if (!dragging.current) return;
    const dx = Math.max(0, Math.min(160, (e.clientX || e.touches?.[0]?.clientX) - startX.current));
    setX(dx);
    if (dx >= 160) { setDone(true); dragging.current = false; }
  };
  const end = () => { dragging.current = false; if (!done) setX(0); };
  return (
    <div onMouseMove={move} onMouseUp={end} onMouseLeave={end} className="relative bg-gray-100 rounded-full h-12 w-56 flex items-center overflow-hidden select-none">
      <div className="absolute inset-0 bg-green-100 transition-all" style={{ width: done ? '100%' : `${(x / 160) * 100}%` }} />
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-500">{done ? '✓ Confirmed!' : 'Swipe to confirm →'}</span>
      <div className="absolute left-1 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-black text-lg cursor-grab transition-transform"
        style={{ transform: `translateX(${x}px)` }}
        onMouseDown={start}>→</div>
    </div>
  );
}

function GradientBorderBtn() {
  return (
    <div className="p-0.5 rounded-xl" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}>
      <button className="bg-white text-gray-900 font-black px-8 py-3 rounded-[10px] hover:bg-gray-50 transition-colors">Premium</button>
    </div>
  );
}

function SlideTextBtn() {
  return (
    <button className="relative overflow-hidden bg-gray-900 text-white font-bold px-8 py-3 rounded-lg group">
      <span className="absolute inset-0 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-yellow-400">Let's Go!</span>
      <span className="group-hover:-translate-y-full transition-transform duration-300 inline-block">Click Me</span>
    </button>
  );
}

function NeumorphicBtn() {
  const [pressed, setPressed] = useState(false);
  return (
    <button onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)}
      className="px-8 py-4 rounded-2xl font-bold text-gray-600 select-none transition-all duration-100"
      style={{ background: '#e0e5ec', boxShadow: pressed ? 'inset 4px 4px 8px #b8bec7, inset -4px -4px 8px #ffffff' : '6px 6px 12px #b8bec7, -6px -6px 12px #ffffff' }}>
      Neumorphic
    </button>
  );
}

function ColorCycleBtn() {
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500', 'bg-orange-500', 'bg-green-500'];
  const [idx, setIdx] = useState(0);
  return (
    <button onClick={() => setIdx(i => (i + 1) % colors.length)} className={`${colors[idx]} text-white font-bold px-8 py-3 rounded-lg transition-all duration-300`}>
      Click to Change
    </button>
  );
}

function RadarPingBtn() {
  return (
    <div className="relative inline-flex">
      <span className="absolute inset-0 rounded-full bg-red-400 animate-ping" />
      <button className="relative bg-red-500 text-white font-bold px-7 py-3 rounded-full">🔴 Live Now</button>
    </div>
  );
}

export default function ButtonEffects() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <EffectCard title="Ripple Effect" desc="Material Design click ripple" whenToUse="Essential for touch feedback on mobile apps and Material Design interfaces." prompt="Create a button with a ripple effect on click using React state and CSS animation. The ripple should emanate from the click position and fade out over 600ms." code={`function RippleButton() {\n  const [ripples, setRipples] = useState([]);\n  const ref = useRef();\n  const add = (e) => {\n    const rect = ref.current.getBoundingClientRect();\n    const id = Date.now();\n    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);\n    setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 600);\n  };\n  return (\n    <button ref={ref} onClick={add} className="relative overflow-hidden bg-blue-600 text-white font-bold px-8 py-3 rounded-lg">\n      Click Me\n      {ripples.map(r => (\n        <span key={r.id} style={{ left: r.x, top: r.y }}\n          className="absolute rounded-full bg-white/40 w-16 h-16 -translate-x-1/2 -translate-y-1/2 animate-ping pointer-events-none" />\n      ))}\n    </button>\n  );\n}`}><RippleBtn /></EffectCard>

      <EffectCard title="Fill Animation" desc="Background fills from a direction on hover" whenToUse="Navigation buttons, CTAs, or any button that needs visual state feedback." prompt="Create a button where the background color fills from left, right, or center on hover using a sliding div. Toggle direction with controls." code={`function FillButton({ dir = 'left' }) {\n  return (\n    <div className="relative overflow-hidden border-2 border-blue-600 text-blue-600 font-bold px-8 py-3 rounded-lg cursor-pointer group">\n      <span className={\`absolute inset-0 bg-blue-600 transition-transform duration-300 \${dir === 'left' ? '-translate-x-full group-hover:translate-x-0' : 'translate-x-full group-hover:translate-x-0'}\`} />\n      <span className="relative group-hover:text-white transition-colors duration-300">Hover Me</span>\n    </div>\n  );\n}`}><FillBtn /></EffectCard>

      <EffectCard title="3D Press" desc="Button depresses on click with shadow" whenToUse="Game UIs, arcade buttons, or adding tactile feel to primary actions." prompt="Create a 3D press button that pushes down using box-shadow and translateY on mouseDown. Reset on mouseUp/mouseLeave." code={`function PressButton() {\n  const [pressed, setPressed] = useState(false);\n  return (\n    <button\n      onMouseDown={() => setPressed(true)}\n      onMouseUp={() => setPressed(false)}\n      onMouseLeave={() => setPressed(false)}\n      style={{\n        transform: pressed ? 'translateY(4px)' : 'translateY(0)',\n        boxShadow: pressed ? '0 1px 0 #312e81' : '0 6px 0 #312e81'\n      }}\n      className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg">\n      Press Me\n    </button>\n  );\n}`}><PressBtn /></EffectCard>

      <EffectCard title="Shake on Error" desc="Invalid input triggers shake animation" whenToUse="Form validation, empty required fields, error states." prompt="Create a submit button that shakes using CSS @keyframes when the input is empty. Apply animation style only when shaking state is true." code={`// @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }\nfunction ShakeButton() {\n  const [shaking, setShaking] = useState(false);\n  const submit = () => { if (!input) { setShaking(true); setTimeout(() => setShaking(false), 500); } };\n  return (\n    <button style={{ animation: shaking ? 'shake 0.4s ease-in-out' : '' }}\n      className="bg-red-500 text-white font-bold px-5 py-2 rounded-lg" onClick={submit}>Submit</button>\n  );\n}`}><ShakeBtn /></EffectCard>

      <EffectCard title="Loading State" desc="Button with idle → loading → success flow" whenToUse="Form submissions, API calls, or any async operation." prompt="Create a button with 3 states: idle ('Submit'), loading (spinner + 'Loading...'), and success ('✓ Done!'). Auto-resets after 3 seconds." code={`function LoadingButton() {\n  const [state, setState] = useState('idle');\n  const click = () => {\n    setState('loading');\n    setTimeout(() => setState('success'), 1800);\n    setTimeout(() => setState('idle'), 3200);\n  };\n  return (\n    <button onClick={click} disabled={state === 'loading'}\n      className={\`px-8 py-3 rounded-lg font-bold text-white \${state === 'success' ? 'bg-green-500' : 'bg-blue-600'}\`}>\n      {state === 'idle' && 'Submit'}\n      {state === 'loading' && <span className="flex items-center gap-2"><Spinner /> Loading...</span>}\n      {state === 'success' && '✓ Done!'}\n    </button>\n  );\n}`}><LoadingBtn /></EffectCard>

      <EffectCard title="Like Button" desc="Animated heart with increment/decrement" whenToUse="Social media apps, content platforms, or anywhere users express appreciation." prompt="Create an animated like/heart toggle button that increments/decrements a counter. The heart grows on click using scale transform." code={`function LikeButton() {\n  const [liked, setLiked] = useState(false);\n  const [count, setCount] = useState(42);\n  return (\n    <button onClick={() => { setLiked(l => !l); setCount(c => liked ? c-1 : c+1); }}\n      className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-red-200 hover:bg-red-50">\n      <span className={\`text-xl \${liked ? 'scale-125' : ''} transition-transform\`}>{liked ? '❤️' : '🤍'}</span>\n      <span className="font-bold text-gray-700">{count}</span>\n    </button>\n  );\n}`}><LikeBtn /></EffectCard>

      <EffectCard title="Add to Cart" desc="Cart button confirms purchase" whenToUse="E-commerce sites for confirming items added to cart." prompt="Create an add-to-cart button that turns green with '✓ Added!' when clicked, then resets after 2 seconds." code={`function CartButton() {\n  const [added, setAdded] = useState(false);\n  return (\n    <button onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 2000); }}\n      className={\`px-6 py-3 rounded-lg font-bold text-white \${added ? 'bg-green-500' : 'bg-gray-900'}\`}>\n      {added ? '✓ Added!' : '🛒 Add to Cart'}\n    </button>\n  );\n}`}><CartBtn /></EffectCard>

      <EffectCard title="Download Progress" desc="Button with inline progress bar fill" whenToUse="File downloads, software installers, trackable progress." prompt="Create a download button with a progress bar that fills inside the button. Show percentage during download, then reset." code={`function DownloadButton() {\n  const [pct, setPct] = useState(0);\n  const start = () => {\n    let p = 0;\n    const t = setInterval(() => {\n      p += 2; setPct(p);\n      if (p >= 100) clearInterval(t);\n    }, 40);\n  };\n  return (\n    <button onClick={start} className="relative overflow-hidden px-8 py-3 rounded-lg font-bold text-white bg-gray-900">\n      <div className="absolute inset-0 bg-blue-600" style={{ width: \`\${pct}%\` }} />\n      <span className="relative">{pct > 0 ? \`\${pct}%\` : '⬇ Download'}</span>\n    </button>\n  );\n}`}><DownloadBtn /></EffectCard>

      <EffectCard title="Magnetic Button" desc="Button that follows the cursor on hover" whenToUse="Creative portfolios, landing pages, playful CTAs." prompt="Create a magnetic button that translates toward the cursor on hover. Calculate offset from center using getBoundingClientRect and multiply by 0.3 for a subtle pull effect." code={`function MagneticButton() {\n  const ref = useRef();\n  const [pos, setPos] = useState({ x: 0, y: 0 });\n  const move = (e) => {\n    const rect = ref.current.getBoundingClientRect();\n    const x = (e.clientX - rect.left - rect.width/2) * 0.3;\n    const y = (e.clientY - rect.top - rect.height/2) * 0.3;\n    setPos({ x, y });\n  };\n  return (\n    <button ref={ref} onMouseMove={move} onMouseLeave={() => setPos({x:0,y:0})}\n      style={{ transform: \`translate(\${pos.x}px, \${pos.y}px)\` }}\n      className="bg-purple-600 text-white font-bold px-8 py-3 rounded-full transition-transform duration-150">\n      Hover Around\n    </button>\n  );\n}`}><MagneticBtn /></EffectCard>

      <EffectCard title="Animated Border" desc="Gradient border strokes around button" whenToUse="Premium CTAs, highlight actions, interactive cards." prompt="Create a button with an animated gradient border that moves around the perimeter using background-position animation. Use a wrapper div trick." code={`<button className="relative px-8 py-3 text-blue-600 font-bold rounded-lg overflow-hidden border group">\n  <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"\n    style={{ background: 'linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899,#3b82f6)', backgroundSize: '200%', animation: 'borderMove 1.5s linear infinite' }} />\n  <span className="absolute inset-[2px] bg-white rounded-md" />\n  <span className="relative">Hover Me</span>\n</button>\n// @keyframes borderMove { from{background-position:0%} to{background-position:200%} }`}><BorderAnimBtn /></EffectCard>

      <EffectCard title="Glow Button" desc="Neon glow box-shadow on hover" whenToUse="Dark theme apps, gaming, premium features." prompt="Create a purple button that emits a glowing box-shadow on hover using Tailwind's arbitrary value: hover:shadow-[0_0_25px_rgba(139,92,246,0.8)]." code={`<button className="px-8 py-3 rounded-lg font-bold text-white bg-purple-600 transition-all duration-300\n  hover:shadow-[0_0_25px_rgba(139,92,246,0.8)] hover:bg-purple-500">\n  Glow Hover\n</button>`}><GlowBtn /></EffectCard>

      <EffectCard title="Toggle Switch" desc="iOS-style on/off toggle button" whenToUse="Feature flags, notifications, settings preferences." prompt="Create an iOS-style toggle switch using a rounded pill with a white circle that slides right when active. Use translate-x to animate the knob." code={`function ToggleSwitch() {\n  const [on, setOn] = useState(false);\n  return (\n    <button onClick={() => setOn(o => !o)}\n      className={\`w-14 h-7 rounded-full transition-colors \${on ? 'bg-blue-600' : 'bg-gray-300'}\`}>\n      <span className={\`w-6 h-6 bg-white rounded-full shadow transition-transform \${on ? 'translate-x-7' : 'translate-x-0'}\`} />\n    </button>\n  );\n}`}><ToggleBtn /></EffectCard>

      <EffectCard title="Pulse Ring" desc="Expanding pulse rings for attention" whenToUse="CTAs that need to draw continuous attention." prompt="Create a button with expanding pulse rings using Tailwind's animate-ping on an absolute positioned span behind the button." code={`<div className="relative inline-flex">\n  <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-40" />\n  <button className="relative bg-orange-500 text-white font-bold px-7 py-3 rounded-full">\n    Subscribe\n  </button>\n</div>`}><PulseBtn /></EffectCard>

      <EffectCard title="Neon Glow" desc="Cyberpunk neon border and text" whenToUse="Gaming sites, nightlife apps, or futuristic themes." prompt="Create a neon button with cyan text and border on black background. On hover, add a box-shadow glow using Tailwind arbitrary value." code={`<button className="px-8 py-3 rounded-lg font-bold text-cyan-300 border-2 border-cyan-400 bg-black transition-all\n  hover:shadow-[0_0_20px_rgba(34,211,238,0.8)] hover:text-white">\n  Neon\n</button>`}><NeonBtn /></EffectCard>

      <EffectCard title="Confetti Burst" desc="Particles fly outward on celebration" whenToUse="Success states, achievements, rewards." prompt="Create a button that bursts 12 colored dots outward in all directions when clicked. Use CSS translate with trigonometric angle positioning." code={`// 12 dots positioned at 30° intervals\nconst burst = () => { setBursting(true); setTimeout(() => setBursting(false), 800); };\n{dots.map(d => (\n  <span key={d.id}\n    style={{ transform: bursting ? \`translate(\${Math.cos(d.angle)*45}px,\${Math.sin(d.angle)*45}px)\` : 'translate(0,0)',\n      opacity: bursting ? 0 : 1, transition: 'all 0.7s ease-out' }}\n    className="absolute w-2 h-2 rounded-full bg-pink-500" />\n))}`}><ConfettiBtn /></EffectCard>

      <EffectCard title="Text Scramble" desc="Matrix-style character scramble effect" whenToUse="Tech themes, password/security features, mystery aesthetics." prompt="Create a text scramble effect that randomizes characters and progressively reveals the original text from left to right using setInterval." code={`function ScrambleButton() {\n  const original = 'DECODE';\n  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';\n  const [text, setText] = useState(original);\n  const scramble = () => {\n    let iter = 0;\n    const t = setInterval(() => {\n      setText(original.split('').map((c, i) =>\n        i < iter ? original[i] : chars[Math.floor(Math.random() * chars.length)]\n      ).join(''));\n      if (iter >= original.length) clearInterval(t);\n      iter += 0.3;\n    }, 40);\n  };\n  return <button onClick={scramble} className="font-mono font-black text-xl text-green-500 bg-black px-6 py-3 rounded-lg">{text}</button>;\n}`}><ScrambleBtn /></EffectCard>

      <EffectCard title="Flip Card Button" desc="3D flip reveals a back face" whenToUse="Reveal interactions, before/after states, confirmation UIs." prompt="Create a 3D flip button using CSS perspective, transformStyle: preserve-3d, and rotateY(180deg) on click. Both faces use backfaceVisibility: hidden." code={`function FlipCardButton() {\n  const [flipped, setFlipped] = useState(false);\n  return (\n    <div onClick={() => setFlipped(f => !f)} style={{ perspective: '600px', width: 120, height: 60 }}>\n      <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)', transition: 'transform 0.5s' }}>\n        <div style={{ backfaceVisibility: 'hidden' }} className="absolute inset-0 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">Front</div>\n        <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className="absolute inset-0 bg-purple-600 rounded-xl flex items-center justify-center text-white font-black">Back!</div>\n      </div>\n    </div>\n  );\n}`}><FlipCardBtn /></EffectCard>

      <EffectCard title="Hold to Activate" desc="Press and hold to confirm action" whenToUse="Emergency actions, power buttons, critical operations." prompt="Create a hold-to-activate button that fills with orange as you hold. Release before 100% resets it. On complete, shows success state." code={`function HoldButton() {\n  const [pct, setPct] = useState(0);\n  const [done, setDone] = useState(false);\n  const interval = useRef(null);\n  const start = () => {\n    interval.current = setInterval(() => {\n      setPct(p => { if (p >= 100) { setDone(true); clearInterval(interval.current); return 100; } return p+5; });\n    }, 50);\n  };\n  const stop = () => { clearInterval(interval.current); if (pct < 100) { setPct(0); setDone(false); } };\n  return (\n    <button onMouseDown={start} onMouseUp={stop} onMouseLeave={stop}\n      className="relative overflow-hidden px-8 py-3 rounded-full font-bold text-white select-none bg-gray-900">\n      <div className="absolute inset-0 bg-orange-500" style={{ width: \`\${pct}%\` }} />\n      <span className="relative">{done ? '✓ Activated!' : 'Hold Me'}</span>\n    </button>\n  );\n}`}><HoldBtn /></EffectCard>

      <EffectCard title="Swipe to Confirm" desc="Drag handle to confirm action" whenToUse="Delete confirmations, unlock actions, irreversible operations." prompt="Create a swipe-to-confirm slider where user drags a circle to the right to confirm. Constrain drag with Math.min/max and show success state at 100%." code={`function SwipeButton() {\n  const [x, setX] = useState(0);\n  const [done, setDone] = useState(false);\n  const startX = useRef(0);\n  const dragging = useRef(false);\n  // onMouseDown: set dragging, startX\n  // onMouseMove: dx = clientX - startX, clamp 0-160, setX, check if >= 160\n  // onMouseUp/Leave: if not done, reset x to 0\n  return (\n    <div className="relative bg-gray-100 rounded-full h-12 w-56 overflow-hidden select-none">\n      <div className="absolute inset-0 bg-green-100" style={{ width: done ? '100%' : \`\${(x/160)*100}%\` }} />\n      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-500">\n        {done ? '✓ Confirmed!' : 'Swipe to confirm →'}\n      </span>\n      <div className="absolute left-1 w-10 h-10 bg-green-500 rounded-full cursor-grab" style={{ transform: \`translateX(\${x}px)\` }} onMouseDown={start} />\n    </div>\n  );\n}`}><SwipeBtn /></EffectCard>

      <EffectCard title="Gradient Border" desc="Animated rainbow gradient border" whenToUse="Premium features, special offers, highlighted actions." prompt="Create a gradient border button using a wrapper div with a gradient background and 2px padding, with the inner button having a white background." code={`<div className="p-0.5 rounded-xl"\n  style={{ background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)' }}>\n  <button className="bg-white text-gray-900 font-black px-8 py-3 rounded-[10px] hover:bg-gray-50">\n    Premium\n  </button>\n</div>`}><GradientBorderBtn /></EffectCard>

      <EffectCard title="Slide Text" desc="Hidden text slides in on hover" whenToUse="Navigation buttons with secondary labels." prompt="Create a button where hovering reveals a second text by sliding. Use translate-y with group-hover and overflow-hidden." code={`<button className="relative overflow-hidden bg-gray-900 text-white font-bold px-8 py-3 rounded-lg group">\n  <span className="absolute inset-0 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-yellow-400">Let's Go!</span>\n  <span className="group-hover:-translate-y-full transition-transform duration-300 inline-block">Click Me</span>\n</button>`}><SlideTextBtn /></EffectCard>

      <EffectCard title="Neumorphic" desc="Soft UI pressed inset effect" whenToUse="Minimalist interfaces, settings panels, calculator UIs." prompt="Create a neumorphic button with a light gray background and dual box-shadows (dark bottom-right, white top-left). On press, invert shadows to create an inset effect." code={`function NeumorphicButton() {\n  const [pressed, setPressed] = useState(false);\n  return (\n    <button\n      onMouseDown={() => setPressed(true)}\n      onMouseUp={() => setPressed(false)}\n      style={{\n        background: '#e0e5ec',\n        boxShadow: pressed\n          ? 'inset 4px 4px 8px #b8bec7, inset -4px -4px 8px #ffffff'\n          : '6px 6px 12px #b8bec7, -6px -6px 12px #ffffff'\n      }}\n      className="px-8 py-4 rounded-2xl font-bold text-gray-600">\n      Neumorphic\n    </button>\n  );\n}`}><NeumorphicBtn /></EffectCard>

      <EffectCard title="Color Cycle" desc="Changes color on each click" whenToUse="Theme selection, mood indicators, repeated actions." prompt="Create a button that cycles through an array of Tailwind background color classes on each click." code={`function ColorCycleButton() {\n  const colors = ['bg-blue-500','bg-purple-500','bg-pink-500','bg-red-500','bg-orange-500','bg-green-500'];\n  const [idx, setIdx] = useState(0);\n  return (\n    <button onClick={() => setIdx(i => (i+1) % colors.length)}\n      className={\`\${colors[idx]} text-white font-bold px-8 py-3 rounded-lg transition-all duration-300\`}>\n      Click to Change\n    </button>\n  );\n}`}><ColorCycleBtn /></EffectCard>

      <EffectCard title="Radar Ping" desc="Pulsing radar for live indicators" whenToUse="Live status, broadcasting, active connection states." prompt="Create a 'Live Now' button with a red animate-ping absolute span behind it. Looks like a radar ping or notification indicator." code={`<div className="relative inline-flex">\n  <span className="absolute inset-0 rounded-full bg-red-400 animate-ping" />\n  <button className="relative bg-red-500 text-white font-bold px-7 py-3 rounded-full">\n    🔴 Live Now\n  </button>\n</div>`}><RadarPingBtn /></EffectCard>
    </div>
  );
}