import React, { useState, useEffect } from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

const keyframes = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse44 { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
@keyframes breathe { 0%,100%{transform:scale(1);filter:brightness(1)} 50%{transform:scale(1.15);filter:brightness(1.3)} }
@keyframes orbit { from{transform:rotate(0deg) translateX(28px)} to{transform:rotate(360deg) translateX(28px)} }
@keyframes orbit2 { from{transform:rotate(180deg) translateX(28px)} to{transform:rotate(540deg) translateX(28px)} }
@keyframes rippleOut { 0%{transform:scale(0.5);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
@keyframes bounceLoad { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
@keyframes flip3d { 0%{transform:rotateY(0)} 100%{transform:rotateY(360deg)} }
@keyframes elastic { 0%{transform:scaleX(1) scaleY(1)} 30%{transform:scaleX(1.3) scaleY(0.7)} 60%{transform:scaleX(0.8) scaleY(1.2)} 100%{transform:scaleX(1) scaleY(1)} }
@keyframes ecg { from{stroke-dashoffset:300} to{stroke-dashoffset:-300} }
@keyframes radarSweep { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes pendulum { 0%,100%{transform:rotate(-25deg)} 50%{transform:rotate(25deg)} }
@keyframes satelliteOrbit { from{transform:rotate(0deg) translateX(22px)} to{transform:rotate(360deg) translateX(22px)} }
@keyframes borderChase { 0%{box-shadow:4px 0 0 2px #6366f1,0 0 0 0 transparent} 25%{box-shadow:0 4px 0 2px #6366f1,0 0 0 0 transparent} 50%{box-shadow:-4px 0 0 2px #6366f1,0 0 0 0 transparent} 75%{box-shadow:0 -4px 0 2px #6366f1,0 0 0 0 transparent} 100%{box-shadow:4px 0 0 2px #6366f1,0 0 0 0 transparent} }
@keyframes glitchShake { 0%,100%{transform:translate(0,0)} 20%{transform:translate(-3px,2px)} 40%{transform:translate(3px,-1px)} 60%{transform:translate(-2px,3px)} 80%{transform:translate(2px,-2px)} }
@keyframes fadeScale { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.7)} }
@keyframes spinScale { 0%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(180deg) scale(1.2)} 100%{transform:rotate(360deg) scale(1)} }
@keyframes hexPulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.7)} 50%{box-shadow:0 0 0 12px rgba(99,102,241,0)} }
@keyframes dotBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes blurReveal { 0%,100%{filter:blur(0)} 50%{filter:blur(6px)} }
`;

export default function LoadingSpinners() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setProgress(p => p >= 100 ? 0 : p + 1), 40);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <style>{keyframes}</style>

      <EffectCard title="Pulse Heartbeat" desc="Rhythmic pulsing scale animation" whenToUse="Page transitions, initial app loading, critical data fetching." prompt="Create a pulsing loader with scale and opacity animation. Use CSS @keyframes with 0%,100% at scale(1) opacity(1) and 50% at scale(0.85) opacity(0.5)." code={`<div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center"\n  style={{ animation: 'pulse 1s ease-in-out infinite' }}>\n  {/* logo or content */}\n</div>\n// @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }`}>
        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-lg" style={{ animation: 'pulse44 1s ease-in-out infinite' }}>44</div>
      </EffectCard>

      <EffectCard title="Breathing Glow" desc="Soft inhale/exhale scale and brightness" whenToUse="Meditation apps, calm loading states, patient waiting." prompt="Create a breathing animation that scales up and increases brightness on inhale (scale 1.15, brightness 1.3), returns to normal on exhale. Loop every 2 seconds." code={`<div style={{ animation: 'breathe 2s ease-in-out infinite' }}>\n  {/* logo */}\n</div>\n// @keyframes breathe { 0%,100%{transform:scale(1);filter:brightness(1)} 50%{transform:scale(1.15);filter:brightness(1.3)} }`}>
        <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg" style={{ animation: 'breathe 2s ease-in-out infinite' }}>44</div>
      </EffectCard>

      <EffectCard title="Orbital Spinner" desc="Dots orbiting around a center logo" whenToUse="Data sync, cloud operations, multi-process operations." prompt="Create orbiting dots around a center element using CSS rotate + translateX. Each dot is an absolute positioned span animated with rotate(0→360deg) translateX." code={`<div className="relative w-20 h-20">\n  <div className="absolute inset-0 flex items-center justify-center z-10">logo</div>\n  {[0, 120, 240].map((deg, i) => (\n    <div key={i} className="absolute w-3 h-3 bg-blue-500 rounded-full" style={{\n      top: '50%', left: '50%', transformOrigin: '0 0',\n      animation: \`orbit \${1.5+i*0.3}s linear infinite\`,\n      animationDelay: \`\${i*0.1}s\`\n    }} />\n  ))}\n</div>`}>
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 flex items-center justify-center z-10 w-10 h-10 m-auto bg-indigo-600 rounded-full text-white font-black text-sm">44</div>
          {[0,1,2].map(i => (
            <div key={i} className="absolute w-3 h-3 bg-indigo-400 rounded-full" style={{ top: '50%', left: '50%', marginLeft: -6, marginTop: -6, transformOrigin: '6px 6px', animation: `orbit ${1.5+i*0.3}s linear infinite`, animationDelay: `${i * -0.3}s` }} />
          ))}
        </div>
      </EffectCard>

      <EffectCard title="Ripple Pulse" desc="Expanding rings emanating from center" whenToUse="Notifications, alerts, live status indicators." prompt="Create 3 expanding ripple rings using CSS scale + opacity animation with staggered delays. Each ring starts small and opaque, grows and fades out." code={`<div className="relative w-20 h-20 flex items-center justify-center">\n  {[0, 0.5, 1].map((delay, i) => (\n    <div key={i} className="absolute w-full h-full rounded-full border-2 border-blue-400"\n      style={{ animation: \`rippleOut 1.5s \${delay}s ease-out infinite\` }} />\n  ))}\n  <div className="relative z-10">logo</div>\n</div>`}>
        <div className="relative w-20 h-20 flex items-center justify-center">
          {[0, 0.5, 1].map((delay, i) => <div key={i} className="absolute inset-0 rounded-full border-2 border-indigo-400" style={{ animation: `rippleOut 1.5s ${delay}s ease-out infinite` }} />)}
          <div className="relative z-10 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-sm">44</div>
        </div>
      </EffectCard>

      <EffectCard title="Bounce Loader" desc="Logo bounces up and down" whenToUse="Playful apps, games, fun loading states." prompt="Create a bouncing animation where the element translates up -18px at 50% then returns. Add a squish shadow at the bottom." code={`<div style={{ animation: 'bounce 0.8s ease-in-out infinite' }}>\n  logo\n</div>\n// @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }`}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg" style={{ animation: 'bounceLoad 0.8s ease-in-out infinite' }}>44</div>
          <div className="w-10 h-1.5 bg-black/10 rounded-full" style={{ animation: 'bounceLoad 0.8s ease-in-out infinite', animationName: 'pulse44' }} />
        </div>
      </EffectCard>

      <EffectCard title="Rotate Flip" desc="3D rotation flip animation" whenToUse="Coin flips, card reveals, content refresh." prompt="Create a 3D flip animation using CSS rotateY(0 → 360deg) continuously." code={`<div style={{ animation: 'flip 1.5s ease-in-out infinite', perspective: '200px' }}>\n  logo\n</div>\n// @keyframes flip { 0%{transform:rotateY(0)} 100%{transform:rotateY(360deg)} }`}>
        <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ animation: 'flip3d 1.5s ease-in-out infinite' }}>44</div>
      </EffectCard>

      <EffectCard title="Progress Ring" desc="Circular SVG progress indicator" whenToUse="Uploads, downloads, operations with trackable progress." prompt="Create a circular progress indicator using SVG circle with stroke-dasharray and stroke-dashoffset to animate the progress." code={`function ProgressRing({ pct }) {\n  const r = 28, c = 2 * Math.PI * r;\n  return (\n    <svg width="72" height="72">\n      <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />\n      <circle cx="36" cy="36" r={r} fill="none" stroke="#6366f1" strokeWidth="4"\n        strokeDasharray={c} strokeDashoffset={c * (1 - pct/100)}\n        transform="rotate(-90 36 36)" strokeLinecap="round" />\n    </svg>\n  );\n}`}>
        <div className="relative w-18 h-18 flex items-center justify-center">
          <svg width="72" height="72">
            <circle cx="36" cy="36" r="28" fill="none" stroke="#e5e7eb" strokeWidth="4" />
            <circle cx="36" cy="36" r="28" fill="none" stroke="#6366f1" strokeWidth="4"
              strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - progress / 100)}
              transform="rotate(-90 36 36)" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
          </svg>
          <div className="absolute text-xs font-black text-indigo-600">{progress}%</div>
        </div>
      </EffectCard>

      <EffectCard title="Typing Dots" desc="Three pulsing dots chat indicator" whenToUse="Chat apps, AI responses, real-time content generation." prompt="Create 3 dots that pulse with staggered animation delays (0s, 0.2s, 0.4s) using scale and opacity keyframes." code={`<div className="flex items-center gap-1.5">\n  {[0, 0.2, 0.4].map((delay, i) => (\n    <div key={i} className="w-3 h-3 bg-blue-600 rounded-full"\n      style={{ animation: \`pulse 1s \${delay}s ease-in-out infinite\` }} />\n  ))}\n</div>`}>
        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3">
          {[0, 0.2, 0.4].map((d, i) => <div key={i} className="w-2.5 h-2.5 bg-indigo-500 rounded-full" style={{ animation: `pulse44 1s ${d}s ease-in-out infinite` }} />)}
        </div>
      </EffectCard>

      <EffectCard title="Glitch Loader" desc="Cyberpunk glitch with RGB split" whenToUse="Tech themes, error recovery, reconnecting states." prompt="Create a glitch effect using duplicate positioned elements offset by a few pixels with different color filters (red, blue). Add shake animation." code={`<div className="relative">\n  <div className="text-2xl font-black">LOADING</div>\n  <div className="absolute inset-0 text-2xl font-black text-red-500 opacity-70" style={{ transform: 'translate(3px, 0)' }}>LOADING</div>\n  <div className="absolute inset-0 text-2xl font-black text-blue-500 opacity-70" style={{ transform: 'translate(-3px, 0)' }}>LOADING</div>\n</div>`}>
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 w-14 h-14 m-auto bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black" style={{ animation: 'glitchShake 0.3s ease-in-out infinite' }}>44</div>
          <div className="absolute inset-0 w-14 h-14 m-auto bg-red-500 rounded-xl flex items-center justify-center text-white font-black opacity-60" style={{ transform: 'translate(4px, 0)', animation: 'glitchShake 0.3s ease-in-out infinite', animationDelay: '0.05s' }}>44</div>
          <div className="absolute inset-0 w-14 h-14 m-auto bg-cyan-500 rounded-xl flex items-center justify-center text-white font-black opacity-60" style={{ transform: 'translate(-4px, 0)', animation: 'glitchShake 0.3s ease-in-out infinite', animationDelay: '0.1s' }}>44</div>
        </div>
      </EffectCard>

      <EffectCard title="Double Orbit" desc="Two rings orbiting in opposite directions" whenToUse="Complex data processing, multi-step operations." prompt="Create two rings orbiting in opposite directions around a center. Use border-t to create a partial arc effect on each ring." code={`<div className="relative w-16 h-16 flex items-center justify-center">\n  <div className="absolute w-full h-full rounded-full border-2 border-transparent border-t-blue-500" style={{ animation: 'spin 1s linear infinite' }} />\n  <div className="absolute w-12 h-12 rounded-full border-2 border-transparent border-t-purple-500" style={{ animation: 'spin 1.5s linear infinite reverse' }} />\n  <div>logo</div>\n</div>`}>
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-indigo-300" style={{ animation: 'spin 1s linear infinite' }} />
          <div className="absolute w-10 h-10 rounded-full border-2 border-transparent border-t-purple-500 border-r-purple-300" style={{ animation: 'spin 1.5s linear infinite reverse' }} />
          <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-[10px]">44</div>
        </div>
      </EffectCard>

      <EffectCard title="Elastic Bounce" desc="Stretchy squish animation" whenToUse="Playful interfaces, games, fun personality." prompt="Create an elastic bounce animation that squishes horizontally on impact using scaleX/scaleY keyframes: 30%{scaleX(1.3) scaleY(0.7)}, 60%{scaleX(0.8) scaleY(1.2)}." code={`<div style={{ animation: 'elastic 1s ease-in-out infinite' }}>\n  logo\n</div>\n// @keyframes elastic { 0%{transform:scaleX(1) scaleY(1)} 30%{transform:scaleX(1.3) scaleY(0.7)} 60%{transform:scaleX(0.8) scaleY(1.2)} 100%{transform:scaleX(1) scaleY(1)} }`}>
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg" style={{ animation: 'elastic 1s ease-in-out infinite' }}>44</div>
      </EffectCard>

      <EffectCard title="Radar Scan" desc="Sweeping radar line animation" whenToUse="Search operations, scanning, location features." prompt="Create a radar scan using a conic-gradient that rotates. Use a green-to-transparent gradient as the sweep." code={`<div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-green-500">\n  <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 0deg, rgba(34,197,94,0.5), transparent)', animation: 'spin 2s linear infinite' }} />\n  <div className="absolute inset-1/4 bg-gray-900 rounded-full" />\n</div>`}>
        <div className="relative w-16 h-16 bg-gray-900 rounded-full overflow-hidden border-2 border-green-500 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 0deg, rgba(34,197,94,0.6), transparent 60%)', animation: 'spin 2s linear infinite' }} />
          <div className="relative z-10 text-green-500 font-black text-xs">SCAN</div>
        </div>
      </EffectCard>

      <EffectCard title="Hexagon Pulse" desc="Hexagonal border pulsing animation" whenToUse="Sci-fi interfaces, tech themes." prompt="Create a hexagonal pulsing border using box-shadow with rgba color that alternates between visible and transparent." code={`<div style={{ animation: 'hexPulse 1.5s ease-in-out infinite' }}\n  className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">\n  logo\n</div>\n// @keyframes hexPulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.7)} 50%{box-shadow:0 0 0 12px rgba(99,102,241,0)} }`}>
        <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ animation: 'hexPulse 1.5s ease-in-out infinite' }}>44</div>
      </EffectCard>

      <EffectCard title="Bouncing Dots" desc="Three dots bouncing under the logo" whenToUse="Playful wait times, content loading." prompt="Create 3 small dots below a logo that bounce up with staggered animation delays." code={`<div className="flex flex-col items-center gap-3">\n  <div>logo</div>\n  <div className="flex gap-1.5">\n    {[0, 0.15, 0.3].map((d, i) => (\n      <div key={i} className="w-2 h-2 bg-blue-500 rounded-full"\n        style={{ animation: \`dotBounce 0.6s \${d}s ease-in-out infinite\` }} />\n    ))}\n  </div>\n</div>`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">44</div>
          <div className="flex gap-1.5">
            {[0, 0.15, 0.3].map((d, i) => <div key={i} className="w-2.5 h-2.5 bg-indigo-400 rounded-full" style={{ animation: `dotBounce 0.6s ${d}s ease-in-out infinite` }} />)}
          </div>
        </div>
      </EffectCard>

      <EffectCard title="Heartbeat Monitor" desc="ECG-style animated line" whenToUse="Health apps, live status, active connection." prompt="Create an ECG heartbeat using SVG polyline with stroke-dasharray animation. The line draws itself left to right continuously." code={`<svg viewBox="0 0 200 60" className="w-48">\n  <polyline points="0,30 30,30 45,10 55,50 65,20 75,40 90,30 200,30"\n    fill="none" stroke="#22c55e" strokeWidth="2"\n    style={{ strokeDasharray: 300, animation: 'ecg 1.5s linear infinite' }} />\n</svg>\n// @keyframes ecg { from{stroke-dashoffset:300} to{stroke-dashoffset:-300} }`}>
        <svg viewBox="0 0 200 60" className="w-44 h-12">
          <polyline points="0,30 30,30 45,10 55,50 65,20 75,40 90,30 200,30" fill="none" stroke="#22c55e" strokeWidth="2" style={{ strokeDasharray: 300, animation: 'ecg 1.5s linear infinite' }} />
        </svg>
      </EffectCard>

      <EffectCard title="Pendulum" desc="Swinging pendulum motion" whenToUse="Waiting for server response, time-related loading." prompt="Create a pendulum animation using rotate transform with easing. The element swings between -25deg and 25deg with transform-origin at top center." code={`<div style={{ transformOrigin: 'top center', animation: 'pendulum 1s ease-in-out infinite' }}>\n  logo\n</div>\n// @keyframes pendulum { 0%,100%{transform:rotate(-25deg)} 50%{transform:rotate(25deg)} }`}>
        <div className="flex flex-col items-center" style={{ paddingTop: 8 }}>
          <div className="w-px h-8 bg-gray-400" />
          <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black" style={{ animation: 'pendulum 1.2s ease-in-out infinite', transformOrigin: 'center -32px' }}>44</div>
        </div>
      </EffectCard>

      <EffectCard title="Fade Scale" desc="Simple fade and scale in/out" whenToUse="Minimalist loading, subtle background operations." prompt="Create a fade + scale animation alternating between full opacity/scale and reduced opacity/scale. Simple and elegant." code={`<div style={{ animation: 'fadeScale 1.5s ease-in-out infinite' }}>\n  logo\n</div>\n// @keyframes fadeScale { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.7)} }`}>
        <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ animation: 'fadeScale 1.5s ease-in-out infinite' }}>44</div>
      </EffectCard>

      <EffectCard title="Spin & Scale" desc="Spinning while pulsating" whenToUse="Energetic loading states, dynamic operations." prompt="Create a combined spin + scale animation so the element rotates while also pulsing in size." code={`<div style={{ animation: 'spinScale 2s ease-in-out infinite' }}>\n  logo\n</div>\n// @keyframes spinScale { 0%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(180deg) scale(1.2)} 100%{transform:rotate(360deg) scale(1)} }`}>
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg" style={{ animation: 'spinScale 2s ease-in-out infinite' }}>44</div>
      </EffectCard>

      <EffectCard title="Border Chase" desc="Border lines chase around the element" whenToUse="Container loading, form processing." prompt="Create a border chase effect using box-shadow animation that moves around the four sides of an element." code={`<div style={{ animation: 'borderChase 1s linear infinite' }}\n  className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">\n  logo\n</div>`}>
        <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-indigo-600 font-black text-lg" style={{ animation: 'borderChase 1s linear infinite' }}>44</div>
      </EffectCard>

      <EffectCard title="Satellite Orbit" desc="Single dot orbiting closely" whenToUse="Small component loading, inline spinners." prompt="Create a small satellite dot that orbits tightly around a center logo using rotate + translateX CSS animation." code={`<div className="relative w-16 h-16 flex items-center justify-center">\n  <div>logo</div>\n  <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full" style={{\n    top: '50%', left: '50%', marginLeft: -5, marginTop: -5, transformOrigin: '5px 5px',\n    animation: 'satelliteOrbit 0.8s linear infinite'\n  }} />\n</div>`}>
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-sm">44</div>
          <div className="absolute w-3 h-3 bg-indigo-300 rounded-full" style={{ top: '50%', left: '50%', marginLeft: -6, marginTop: -6, transformOrigin: '6px 6px', animation: 'satelliteOrbit 0.8s linear infinite' }} />
        </div>
      </EffectCard>

      <EffectCard title="Classic Spinner" desc="Simple border-based CSS spinner" whenToUse="General loading states, inline button loaders." prompt="Create a spinning circle loader using border-4, border-gray-200, and border-t-blue-600 with CSS rotate animation." code={`<div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-blue-600"\n  style={{ animation: 'spin 0.8s linear infinite' }} />`}>
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-indigo-600" style={{ animation: 'spin 0.8s linear infinite' }} />
      </EffectCard>
    </div>
  );
}