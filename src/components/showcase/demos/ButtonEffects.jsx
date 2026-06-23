import React, { useState, useRef, useEffect } from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

// Ripple
function RippleBtn() {
  const [ripples, setRipples] = useState([]);
  const ref = useRef();
  const addRipple = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(r => [...r, { x, y, id }]);
    setTimeout(() => setRipples(r => r.filter(rr => rr.id !== id)), 600);
  };
  return (
    <button ref={ref} onClick={addRipple} className="relative overflow-hidden bg-blue-600 text-white font-bold px-8 py-3 rounded-lg">
      Click Me
      {ripples.map(r => (
        <span key={r.id} className="absolute rounded-full bg-white/40 animate-ping w-16 h-16 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: r.x, top: r.y, animationDuration: '0.6s' }} />
      ))}
    </button>
  );
}

// Loading state
function LoadingBtn() {
  const [state, setState] = useState('idle');
  const click = () => {
    setState('loading');
    setTimeout(() => setState('success'), 1800);
    setTimeout(() => setState('idle'), 3000);
  };
  return (
    <button onClick={click} disabled={state === 'loading'} className={`px-8 py-3 rounded-lg font-bold text-white transition-all ${state === 'success' ? 'bg-green-500' : 'bg-blue-600 disabled:bg-blue-400'}`}>
      {state === 'idle' && 'Submit'}
      {state === 'loading' && <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="31.4" strokeDashoffset="10"/></svg>Loading...</span>}
      {state === 'success' && '✓ Done!'}
    </button>
  );
}

// Like button
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

// Add to cart
function CartBtn() {
  const [state, setState] = useState('idle');
  const click = () => {
    setState('added');
    setTimeout(() => setState('idle'), 2000);
  };
  return (
    <button onClick={click} className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${state === 'added' ? 'bg-green-500' : 'bg-gray-900'}`}>
      {state === 'idle' ? '🛒 Add to Cart' : '✓ Added!'}
    </button>
  );
}

// 3D Press
function PressBtn() {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg select-none transition-all"
      style={{ transform: pressed ? 'translateY(4px)' : 'translateY(0)', boxShadow: pressed ? '0 1px 0 #312e81' : '0 6px 0 #312e81' }}
    >
      Press Me
    </button>
  );
}

// Shake on error
function ShakeBtn() {
  const [shaking, setShaking] = useState(false);
  const [val, setVal] = useState('');
  const submit = () => {
    if (!val) { setShaking(true); setTimeout(() => setShaking(false), 500); }
  };
  return (
    <div className="flex gap-2">
      <input value={val} onChange={e => setVal(e.target.value)} placeholder="Email" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
      <button
        onClick={submit}
        className="bg-red-500 text-white font-bold px-5 py-2 rounded-lg"
        style={{ animation: shaking ? 'shake 0.4s ease-in-out' : '' }}
      >
        Submit
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
      </button>
    </div>
  );
}

// Pulse ring
function PulseBtn() {
  return (
    <div className="relative inline-flex">
      <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-40" />
      <button className="relative bg-orange-500 text-white font-bold px-7 py-3 rounded-full">Subscribe</button>
    </div>
  );
}

// Neon glow
function NeonBtn() {
  return (
    <button className="px-8 py-3 rounded-lg font-bold text-cyan-300 border-2 border-cyan-400 bg-black transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.8)] hover:text-white">
      Neon
    </button>
  );
}

// Confetti burst
function ConfettiBtn() {
  const [bursting, setBursting] = useState(false);
  const [dots, setDots] = useState([]);
  const burst = () => {
    const newDots = Array.from({ length: 12 }, (_, i) => ({ id: i, angle: (i * 30) * Math.PI / 180, color: ['red','blue','green','yellow','purple','orange'][i % 6] }));
    setDots(newDots);
    setBursting(true);
    setTimeout(() => { setBursting(false); setDots([]); }, 800);
  };
  return (
    <div className="relative">
      <button onClick={burst} className="bg-pink-500 text-white font-bold px-7 py-3 rounded-full">🎉 Celebrate!</button>
      {dots.map(d => (
        <span key={d.id} className={`absolute w-2 h-2 rounded-full bg-${d.color}-500 pointer-events-none transition-all`}
          style={{ left: '50%', top: '50%', transform: bursting ? `translate(${Math.cos(d.angle)*40}px,${Math.sin(d.angle)*40}px)` : 'translate(0,0)', opacity: bursting ? 0 : 1, transition: 'all 0.7s ease-out' }} />
      ))}
    </div>
  );
}

export default function ButtonEffects() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <EffectCard title="Ripple Effect" desc="Material Design click ripple" whenToUse="Essential for touch feedback on mobile apps and Material Design interfaces." prompt="Create a button with a ripple effect on click using React state and CSS animation. The ripple should emanate from the click position." code={`function RippleButton({ children }) {\n  const [ripples, setRipples] = useState([]);\n  const ref = useRef();\n  const addRipple = (e) => {\n    const rect = ref.current.getBoundingClientRect();\n    const x = e.clientX - rect.left;\n    const y = e.clientY - rect.top;\n    const id = Date.now();\n    setRipples(r => [...r, { x, y, id }]);\n    setTimeout(() => setRipples(r => r.filter(rr => rr.id !== id)), 600);\n  };\n  return (\n    <button ref={ref} onClick={addRipple}\n      className="relative overflow-hidden bg-blue-600 text-white font-bold px-8 py-3 rounded-lg">\n      {children}\n      {ripples.map(r => (\n        <span key={r.id} style={{ left: r.x, top: r.y }}\n          className="absolute rounded-full bg-white/40 w-16 h-16 -translate-x-1/2 -translate-y-1/2 animate-ping pointer-events-none" />\n      ))}\n    </button>\n  );\n}`}><RippleBtn /></EffectCard>

      <EffectCard title="3D Press" desc="Button depresses on click" whenToUse="Perfect for game UIs, arcade buttons, or adding tactile feel to primary actions." prompt="Create a 3D press button that pushes down on click using box-shadow and translateY in React." code={`function PressButton() {\n  const [pressed, setPressed] = useState(false);\n  return (\n    <button\n      onMouseDown={() => setPressed(true)}\n      onMouseUp={() => setPressed(false)}\n      onMouseLeave={() => setPressed(false)}\n      style={{\n        transform: pressed ? 'translateY(4px)' : 'translateY(0)',\n        boxShadow: pressed ? '0 1px 0 #312e81' : '0 6px 0 #312e81'\n      }}\n      className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg select-none"\n    >\n      Press Me\n    </button>\n  );\n}`}><PressBtn /></EffectCard>

      <EffectCard title="Loading State" desc="Button with idle → loading → success states" whenToUse="Essential for form submissions, API calls, or any async operation feedback." prompt="Create a button with three states: idle, loading (with spinner), and success (with checkmark). Auto-resets after 3 seconds." code={`function LoadingButton() {\n  const [state, setState] = useState('idle');\n  const click = () => {\n    setState('loading');\n    setTimeout(() => setState('success'), 1800);\n    setTimeout(() => setState('idle'), 3000);\n  };\n  return (\n    <button onClick={click} disabled={state === 'loading'}\n      className={\`px-8 py-3 rounded-lg font-bold text-white \${state === 'success' ? 'bg-green-500' : 'bg-blue-600'}\`}>\n      {state === 'idle' && 'Submit'}\n      {state === 'loading' && 'Loading...'}\n      {state === 'success' && '✓ Done!'}\n    </button>\n  );\n}`}><LoadingBtn /></EffectCard>

      <EffectCard title="Like Button" desc="Animated heart with counter" whenToUse="Social media apps, content platforms, or anywhere users express appreciation." prompt="Create an animated like/heart button that toggles between liked and unliked states, incrementing/decrementing a counter." code={`function LikeButton() {\n  const [liked, setLiked] = useState(false);\n  const [count, setCount] = useState(42);\n  const toggle = () => {\n    setLiked(l => !l);\n    setCount(c => liked ? c - 1 : c + 1);\n  };\n  return (\n    <button onClick={toggle}\n      className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-red-200 hover:bg-red-50">\n      <span className={\`text-xl \${liked ? 'scale-125' : ''} transition-transform\`}>\n        {liked ? '❤️' : '🤍'}\n      </span>\n      <span className="font-bold text-gray-700">{count}</span>\n    </button>\n  );\n}`}><LikeBtn /></EffectCard>

      <EffectCard title="Add to Cart" desc="Cart button with confirmation animation" whenToUse="E-commerce sites for confirming items added to shopping cart." prompt="Create an add-to-cart button that changes to 'Added!' with green color when clicked, then resets after 2 seconds." code={`function CartButton() {\n  const [added, setAdded] = useState(false);\n  const click = () => {\n    setAdded(true);\n    setTimeout(() => setAdded(false), 2000);\n  };\n  return (\n    <button onClick={click}\n      className={\`px-6 py-3 rounded-lg font-bold text-white transition-all \${added ? 'bg-green-500' : 'bg-gray-900'}\`}>\n      {added ? '✓ Added!' : '🛒 Add to Cart'}\n    </button>\n  );\n}`}><CartBtn /></EffectCard>

      <EffectCard title="Shake on Error" desc="Invalid input triggers shake animation" whenToUse="Form validation, error feedback, empty required fields." prompt="Create a submit button that shakes using CSS keyframe animation when the required input field is empty." code={`// CSS: @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}\nfunction ShakeButton() {\n  const [shaking, setShaking] = useState(false);\n  const submit = () => {\n    setShaking(true);\n    setTimeout(() => setShaking(false), 500);\n  };\n  return (\n    <button onClick={submit}\n      style={{ animation: shaking ? 'shake 0.4s ease-in-out' : '' }}\n      className="bg-red-500 text-white font-bold px-5 py-2 rounded-lg">\n      Submit\n    </button>\n  );\n}`}><ShakeBtn /></EffectCard>

      <EffectCard title="Pulse Ring" desc="Expanding pulse rings for attention" whenToUse="Call-to-action buttons that need to draw continuous attention without being annoying." prompt="Create a button with expanding pulse rings using Tailwind's animate-ping on an absolute positioned span behind the button." code={`function PulseButton() {\n  return (\n    <div className="relative inline-flex">\n      <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-40" />\n      <button className="relative bg-orange-500 text-white font-bold px-7 py-3 rounded-full">\n        Subscribe\n      </button>\n    </div>\n  );\n}`}><PulseBtn /></EffectCard>

      <EffectCard title="Neon Glow" desc="Cyberpunk neon hover effect" whenToUse="Gaming sites, nightlife apps, or futuristic/cyberpunk themed interfaces." prompt="Create a neon glow button with cyan text on black background, border border-cyan-400, that on hover adds a box-shadow glow effect using Tailwind arbitrary values." code={`<button className="px-8 py-3 rounded-lg font-bold text-cyan-300 border-2 border-cyan-400 bg-black transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.8)] hover:text-white">\n  Neon\n</button>`}><NeonBtn /></EffectCard>

      <EffectCard title="Confetti Burst" desc="Celebration particles on click" whenToUse="Success states, achievements, rewards, or any celebratory user action." prompt="Create a button that bursts colorful confetti dots outward in all directions when clicked using React state and CSS transitions." code={`function ConfettiButton() {\n  const [bursting, setBursting] = useState(false);\n  const burst = () => {\n    setBursting(true);\n    setTimeout(() => setBursting(false), 800);\n  };\n  return (\n    <div className="relative">\n      <button onClick={burst} className="bg-pink-500 text-white font-bold px-7 py-3 rounded-full">\n        🎉 Celebrate!\n      </button>\n      {/* 12 dots positioned around the button, flying outward on burst */}\n    </div>\n  );\n}`}><ConfettiBtn /></EffectCard>
    </div>
  );
}