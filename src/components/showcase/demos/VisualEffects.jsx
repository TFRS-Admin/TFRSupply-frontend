import React, { useState, useEffect, useRef } from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

function GlitchEffect() {
  const [glitching, setGlitching] = useState(false);
  return (
    <div className="text-center">
      <div className={`text-3xl font-black mb-3 transition-all ${glitching ? 'text-red-500' : 'text-gray-900'}`}
        style={glitching ? { textShadow: '2px 0 red, -2px 0 blue', transform: 'skewX(-2deg)' } : {}}>
        GLITCH
      </div>
      <button onClick={() => { setGlitching(true); setTimeout(() => setGlitching(false), 600); }}
        className="bg-gray-900 text-white text-xs font-bold px-4 py-1.5 rounded">
        Trigger Glitch
      </button>
    </div>
  );
}

function MarqueeEffect() {
  const items = ['🚀 New Features', '⭐ Special Offer', '🔥 Hot Deal', '💎 Premium', '🎉 Celebrate'];
  return (
    <div className="overflow-hidden w-full max-w-xs border border-gray-200 rounded-lg py-2">
      <div className="flex gap-8 animate-marquee whitespace-nowrap" style={{ animation: 'marquee 8s linear infinite' }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-xs font-bold text-gray-700">{item}</span>
        ))}
      </div>
      <style>{`@keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
    </div>
  );
}

function NeonGlow() {
  const [pulsing, setPulsing] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-3xl font-black text-cyan-400" style={{ textShadow: pulsing ? '0 0 20px cyan, 0 0 40px cyan' : '0 0 10px rgba(34,211,238,0.5)' }}>
        NEON
      </div>
      <button onClick={() => { setPulsing(true); setTimeout(() => setPulsing(false), 1000); }}
        className="text-xs font-bold border border-cyan-400 text-cyan-400 px-4 py-1.5 rounded bg-black">
        Pulse
      </button>
    </div>
  );
}

function FrostedGlass() {
  return (
    <div className="relative h-24 w-56 rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
      <div className="absolute inset-3 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}>
        <div className="font-black text-white text-sm">Frosted Glass Card</div>
        <div className="text-white/70 text-xs">Uses backdrop-filter blur</div>
      </div>
    </div>
  );
}

function ParticleSystem() {
  const [type, setType] = useState('snow');
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i, x: Math.random() * 100, delay: Math.random() * 3, dur: 2 + Math.random() * 2
    })));
  }, [type]);
  return (
    <div className="relative w-48 h-24 overflow-hidden bg-gray-900 rounded-xl">
      {particles.map(p => (
        <div key={p.id} className="absolute text-sm" style={{
          left: `${p.x}%`, top: 0,
          animation: `fall ${p.dur}s ${p.delay}s linear infinite`
        }}>{type === 'snow' ? '❄️' : '✨'}</div>
      ))}
      <div className="absolute bottom-2 left-2 flex gap-1">
        {['snow','fireflies'].map(t => (
          <button key={t} onClick={() => setType(t)} className={`text-[9px] font-bold px-2 py-0.5 rounded ${type===t ? 'bg-white text-black' : 'bg-white/20 text-white'}`}>{t}</button>
        ))}
      </div>
      <style>{`@keyframes fall { from{transform:translateY(-10px)} to{transform:translateY(100px)} }`}</style>
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
    <div onClick={addRipple} className="relative w-48 h-24 bg-blue-900 rounded-xl overflow-hidden cursor-pointer flex items-center justify-center">
      <span className="text-blue-300 text-xs font-semibold select-none">Click anywhere</span>
      {ripples.map(r => (
        <div key={r.id} className="absolute rounded-full border-2 border-blue-300/60 pointer-events-none"
          style={{ left: r.x, top: r.y, width: 10, height: 10, transform: 'translate(-50%,-50%)', animation: 'ripple 1.2s ease-out forwards' }} />
      ))}
      <style>{`@keyframes ripple { to { width:120px; height:120px; opacity:0; } }`}</style>
    </div>
  );
}

function GradientBorder() {
  return (
    <div className="p-0.5 rounded-xl" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}>
      <div className="bg-white rounded-xl p-5 text-center">
        <div className="font-black text-gray-900 text-sm">Gradient Border Card</div>
        <div className="text-gray-500 text-xs">With animated background</div>
      </div>
    </div>
  );
}

function ParallaxTilt() {
  const [transform, setTransform] = useState('');
  const handle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width/2) / 10;
    const y = (e.clientY - rect.top - rect.height/2) / 10;
    setTransform(`perspective(400px) rotateY(${x}deg) rotateX(${-y}deg)`);
  };
  return (
    <div onMouseMove={handle} onMouseLeave={() => setTransform('')}
      className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 cursor-pointer text-white font-black text-center transition-transform"
      style={{ transform }}>
      Hover Me
    </div>
  );
}

export default function VisualEffects() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <EffectCard title="Glitch Effect" desc="Digital distortion with text shadow" whenToUse="Cyberpunk themes, error states, or edgy brand aesthetics." prompt="Create a glitch effect on text using CSS textShadow with red and blue offsets plus a skewX transform. Trigger on button click with a 600ms timeout." code={`function GlitchText() {\n  const [glitching, setGlitching] = useState(false);\n  return (\n    <div style={glitching ? { textShadow: '2px 0 red, -2px 0 blue', transform: 'skewX(-2deg)' } : {}}\n      className="text-3xl font-black">\n      GLITCH\n    </div>\n  );\n}`}><GlitchEffect /></EffectCard>

      <EffectCard title="Marquee" desc="Scrolling text using CSS animation" whenToUse="Feature lists, announcements, partners." prompt="Create a marquee scrolling effect using CSS @keyframes animation that translates X from 0 to -50% on a doubled list of items." code={`// CSS: @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }\n<div className="overflow-hidden">\n  <div style={{ animation: 'marquee 8s linear infinite' }} className="flex gap-8 whitespace-nowrap">\n    {[...items, ...items].map((item, i) => (\n      <span key={i} className="text-sm font-bold">{item}</span>\n    ))}\n  </div>\n</div>`}><MarqueeEffect /></EffectCard>

      <EffectCard title="Neon Glow" desc="Glowing text with pulsing effect" whenToUse="Gaming, nightlife, or futuristic themes." prompt="Create neon glow text using CSS textShadow with multiple cyan glow layers. Add a Pulse button that intensifies the glow on click." code={`<div className="text-3xl font-black text-cyan-400"\n  style={{ textShadow: '0 0 10px cyan, 0 0 20px cyan, 0 0 40px cyan' }}>\n  NEON\n</div>`}><NeonGlow /></EffectCard>

      <EffectCard title="Frosted Glass" desc="Glassmorphism with backdrop-blur" whenToUse="Modern cards, overlays, or Apple-style interfaces." prompt="Create a frosted glass card using backdrop-filter blur(12px), semi-transparent white background rgba(255,255,255,0.15), and a light white border, placed over a gradient background." code={`<div className="relative h-24 rounded-xl overflow-hidden">\n  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />\n  <div className="absolute inset-3 rounded-lg p-3"\n    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}>\n    <div className="font-black text-white">Frosted Glass Card</div>\n  </div>\n</div>`}><FrostedGlass /></EffectCard>

      <EffectCard title="Particle System" desc="Snow or fireflies particle animation" whenToUse="Seasonal themes, celebrations, or ambient backgrounds." prompt="Create a particle system with 20 particles that fall from top using CSS animation with random x positions and different durations. Toggle between snow and firefly emojis." code={`function Particles({ type }) {\n  const particles = Array.from({ length: 20 }, (_, i) => ({\n    id: i, x: Math.random() * 100,\n    delay: Math.random() * 3, dur: 2 + Math.random() * 2\n  }));\n  return (\n    <div className="relative overflow-hidden bg-gray-900">\n      {particles.map(p => (\n        <div key={p.id} style={{ left: \`\${p.x}%\`, animation: \`fall \${p.dur}s \${p.delay}s linear infinite\` }}>\n          {type === 'snow' ? '❄️' : '✨'}\n        </div>\n      ))}\n    </div>\n  );\n}`}><ParticleSystem /></EffectCard>

      <EffectCard title="Water Ripple" desc="Click to create expanding ripples" whenToUse="Interactive backgrounds, click feedback." prompt="Create a water ripple effect that spawns expanding circular ripples from the click position using CSS @keyframes to grow and fade out." code={`function WaterRipple() {\n  const [ripples, setRipples] = useState([]);\n  const add = (e) => {\n    const id = Date.now();\n    setRipples(r => [...r, { id, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }]);\n    setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 1200);\n  };\n  // CSS: @keyframes ripple { to { width:120px; height:120px; opacity:0; } }\n  return (\n    <div onClick={add} className="relative overflow-hidden">\n      {ripples.map(r => (\n        <div key={r.id} className="absolute rounded-full border-2 border-blue-300/60"\n          style={{ left:r.x, top:r.y, animation:'ripple 1.2s ease-out forwards' }} />\n      ))}\n    </div>\n  );\n}`}><WaterRipple /></EffectCard>

      <EffectCard title="Gradient Border" desc="CSS gradient border using a wrapper div" whenToUse="Premium features, highlights, special cards." prompt="Create a gradient border by wrapping a white card in a div with background: linear-gradient(135deg, ...) and padding: 2px, with the inner card having a white background." code={`<div className="p-0.5 rounded-xl"\n  style={{ background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)' }}>\n  <div className="bg-white rounded-xl p-5">\n    Card content here\n  </div>\n</div>`}><GradientBorder /></EffectCard>

      <EffectCard title="Parallax Tilt" desc="3D card tilt following the cursor" whenToUse="Product cards, portfolios, interactive galleries." prompt="Create a 3D tilt card that follows the cursor using onMouseMove, calculating rotateX and rotateY from the cursor position relative to the card center using perspective(400px) CSS transform." code={`function TiltCard() {\n  const [transform, setTransform] = useState('');\n  const handle = (e) => {\n    const rect = e.currentTarget.getBoundingClientRect();\n    const x = (e.clientX - rect.left - rect.width/2) / 10;\n    const y = (e.clientY - rect.top - rect.height/2) / 10;\n    setTransform(\`perspective(400px) rotateY(\${x}deg) rotateX(\${-y}deg)\`);\n  };\n  return (\n    <div onMouseMove={handle} onMouseLeave={() => setTransform('')}\n      style={{ transform }} className="transition-transform">\n      Card Content\n    </div>\n  );\n}`}><ParallaxTilt /></EffectCard>
    </div>
  );
}