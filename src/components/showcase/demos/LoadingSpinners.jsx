import React, { useState, useEffect } from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

const LOGO = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d0e11f7107236669e8813/774e948d3_Team44-Purple-png.png';

function LogoLoader({ style, children, label, whenToUse }) {
  return (
    <EffectCard title={label} desc="" whenToUse={whenToUse}
      prompt={`Create a ${label} loading animation on an img element using CSS @keyframes`}
      code={`<img src={logoUrl} style={{ animation: '${label.toLowerCase().replace(/ /g,'')} 1.5s ease-in-out infinite' }} />`}>
      <div className="flex flex-col items-center gap-3">
        {children || <img src={LOGO} alt="Logo" className="w-14 h-14 object-contain" style={style} />}
      </div>
    </EffectCard>
  );
}

export default function LoadingSpinners() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setProgress(p => p >= 100 ? 0 : p + 1), 60);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes pulseHeart { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
        @keyframes breatheGlow { 0%,100%{opacity:0.4;transform:scale(0.9)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes orbit { from{transform:rotate(0deg) translateX(28px) rotate(0deg)} to{transform:rotate(360deg) translateX(28px) rotate(-360deg)} }
        @keyframes bounceLogo { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes rotatFlip { 0%{transform:rotateY(0)} 50%{transform:rotateY(180deg)} 100%{transform:rotateY(360deg)} }
        @keyframes elasticB { 0%,100%{transform:scale(1)} 30%{transform:scaleX(1.3) scaleY(0.7)} 60%{transform:scaleX(0.75) scaleY(1.25)} }
        @keyframes glitchLoad { 0%,100%{transform:translate(0)} 20%{transform:translate(-3px,0)} 40%{transform:translate(3px,0)} 60%{transform:translate(0,-3px)} }
        @keyframes spinScale { 0%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(180deg) scale(1.2)} 100%{transform:rotate(360deg) scale(1)} }
        @keyframes pendulum { 0%,100%{transform:rotate(-25deg)} 50%{transform:rotate(25deg)} }
        @keyframes colorShift { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
        @keyframes jiggle { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-5deg)} 75%{transform:rotate(5deg)} }
        @keyframes fadeScale { 0%,100%{opacity:0.2;transform:scale(0.7)} 50%{opacity:1;transform:scale(1)} }
        @keyframes snakeAnim { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes satellite { from{transform:rotate(0deg) translateX(22px)} to{transform:rotate(360deg) translateX(22px)} }
        @keyframes blurRevealL { 0%,100%{filter:blur(8px);opacity:0.3} 50%{filter:blur(0);opacity:1} }
        @keyframes neonFlick { 0%,100%{opacity:1} 90%{opacity:0.2} 93%{opacity:1} 96%{opacity:0.3} }
      `}</style>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <LogoLoader label="Pulse Heartbeat" whenToUse="Perfect for page transitions, initial app loading, or when fetching critical data."
          style={{ animation: 'pulseHeart 1s ease-in-out infinite', width: 56, height: 56, objectFit: 'contain' }} />

        <LogoLoader label="Breathing Glow" whenToUse="Ideal for meditation apps, calm loading states, or when you want users to wait patiently."
          style={{ animation: 'breatheGlow 2s ease-in-out infinite', width: 56, height: 56, objectFit: 'contain' }} />

        <EffectCard title="Orbital Spinner" desc="Dots orbiting around the logo" whenToUse="Great for data synchronization, cloud operations, or when multiple processes are running."
          prompt="Create orbiting dots around a center logo using CSS rotate+translateX keyframes"
          code={`// position:relative container\n// .dot { animation: orbit 1.5s linear infinite; }\n// @keyframes orbit { from{transform:rotate(0deg) translateX(28px)} to{transform:rotate(360deg) translateX(28px)} }`}>
          <div className="relative flex items-center justify-center w-20 h-20">
            <img src={LOGO} alt="Logo" className="w-10 h-10 object-contain" />
            {[0,120,240].map(deg => (
              <div key={deg} className="absolute w-3 h-3 rounded-full bg-purple-500" style={{ animation: `orbit 1.5s linear infinite`, animationDelay: `${deg/360*-1.5}s`, transformOrigin: '0 0', left: '50%', top: '50%' }} />
            ))}
          </div>
        </EffectCard>

        <EffectCard title="Ripple Pulse" desc="Expanding rings from center" whenToUse="Perfect for notifications, alerts, or drawing attention to something being processed."
          prompt="Create expanding ripple rings behind a logo using CSS scale+opacity keyframes on pseudo-elements"
          code={`// Three div rings, each scaled from 0.5→2 with opacity 0.7→0\n// Stagger delays: 0s, 0.5s, 1s`}>
          <div className="relative flex items-center justify-center w-24 h-24">
            {[0, 0.5, 1].map(d => (
              <div key={d} className="absolute rounded-full border-2 border-purple-400"
                style={{ width: 64, height: 64, animation: `ripplePulse 2s ease-out ${d}s infinite`, opacity: 0 }} />
            ))}
            <img src={LOGO} alt="Logo" className="w-12 h-12 object-contain relative z-10" />
          </div>
          <style>{`@keyframes ripplePulse { 0%{transform:scale(0.5);opacity:0.7} 100%{transform:scale(2);opacity:0} }`}</style>
        </EffectCard>

        <LogoLoader label="Bounce Loader" whenToUse="Best for playful apps, games, or when you want to add personality to loading states."
          style={{ animation: 'bounceLogo 0.8s ease-in-out infinite', width: 56, height: 56, objectFit: 'contain' }} />

        <LogoLoader label="Rotate Flip" whenToUse="Great for coin flips, decision-making moments, or when content is being refreshed."
          style={{ animation: 'rotatFlip 1.2s ease-in-out infinite', width: 56, height: 56, objectFit: 'contain' }} />

        <EffectCard title="Progress Ring" desc="Circular progress indicator" whenToUse="Best for uploads, downloads, or any operation where you can show actual progress percentage."
          prompt="Create a circular SVG progress ring around a logo. Animate stroke-dashoffset based on a progress value."
          code={`const r = 30; const circ = 2 * Math.PI * r;\n<svg viewBox="0 0 80 80">\n  <circle cx="40" cy="40" r={r} stroke="#e5e7eb" strokeWidth="4" fill="none" />\n  <circle cx="40" cy="40" r={r} stroke="#8b5cf6" strokeWidth="4" fill="none"\n    strokeDasharray={circ}\n    strokeDashoffset={circ - (circ * progress / 100)}\n    transform="rotate(-90 40 40)" />\n</svg>`}>
          <div className="relative flex items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="30" stroke="#e5e7eb" strokeWidth="5" fill="none" />
              <circle cx="40" cy="40" r="30" stroke="#8b5cf6" strokeWidth="5" fill="none"
                strokeDasharray={2 * Math.PI * 30}
                strokeDashoffset={2 * Math.PI * 30 - (2 * Math.PI * 30 * progress / 100)}
                transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
            </svg>
            <img src={LOGO} alt="Logo" className="absolute w-10 h-10 object-contain" />
          </div>
        </EffectCard>

        <EffectCard title="Typing Dots" desc="Chat-style loading indicator" whenToUse="Perfect for chat applications, AI responses, or when content is being generated in real-time."
          prompt="Create three bouncing dots below a logo with staggered animation delays"
          code={`// Three dots with bounceDot animation, delays 0s, 0.15s, 0.3s\n// @keyframes bounceDot { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }`}>
          <div className="flex flex-col items-center gap-3">
            <img src={LOGO} alt="Logo" className="w-12 h-12 object-contain" />
            <div className="flex gap-1.5">
              {[0, 0.15, 0.3].map(d => (
                <div key={d} className="w-2.5 h-2.5 bg-purple-500 rounded-full" style={{ animation: `bounceDot 1s ${d}s ease-in-out infinite` }} />
              ))}
            </div>
          </div>
          <style>{`@keyframes bounceDot { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }`}</style>
        </EffectCard>

        <EffectCard title="Glitch Loader" desc="Cyberpunk glitch effect" whenToUse="Great for tech/hacker themes, error recovery, or when reconnecting to services."
          prompt="Create a glitch loader with 3 overlapping logo images offset in red, green, blue channels using mix-blend-mode"
          code={`<div className="relative">\n  <img style={{ animation: 'glitchLoad 0.5s infinite' }} />\n  <img style={{ position:'absolute', mixBlendMode:'multiply', filter:'hue-rotate(90deg)', animation: 'glitchLoad 0.5s 0.1s infinite' }} />\n</div>`}>
          <div className="relative w-14 h-14">
            <img src={LOGO} alt="Logo" className="w-14 h-14 object-contain" style={{ animation: 'glitchLoad 0.5s ease-in-out infinite' }} />
            <img src={LOGO} alt="" className="absolute inset-0 w-14 h-14 object-contain opacity-50" style={{ filter: 'hue-rotate(90deg)', animation: 'glitchLoad 0.5s 0.1s ease-in-out infinite' }} />
          </div>
        </EffectCard>

        <LogoLoader label="Elastic Bounce" whenToUse="Perfect for playful interfaces, games, or when you want to add fun personality."
          style={{ animation: 'elasticB 0.9s ease-in-out infinite', width: 56, height: 56, objectFit: 'contain' }} />

        <EffectCard title="Double Orbit" desc="Two orbiting rings in opposite directions" whenToUse="Complex data processing or multi-step operations."
          prompt="Create two SVG circles rotating in opposite directions around a center logo"
          code={`<svg viewBox="0 0 80 80">\n  <circle ... style={{ animation: 'spin 1.5s linear infinite' }} />\n  <circle ... style={{ animation: 'spin 2s linear infinite reverse' }} />\n</svg>`}>
          <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" stroke="#8b5cf6" strokeWidth="2" fill="none" strokeDasharray="10 6" style={{ animation: 'snakeAnim 2s linear infinite' }} transformOrigin="center" />
              <circle cx="40" cy="40" r="26" stroke="#a78bfa" strokeWidth="2" fill="none" strokeDasharray="6 10" style={{ animation: 'snakeAnim 1.5s linear infinite reverse' }} transformOrigin="center" />
            </svg>
            <img src={LOGO} alt="Logo" className="w-10 h-10 object-contain relative z-10" />
          </div>
        </EffectCard>

        <LogoLoader label="Spin & Scale" whenToUse="Energetic loading states."
          style={{ animation: 'spinScale 1.5s ease-in-out infinite', width: 56, height: 56, objectFit: 'contain' }} />

        <LogoLoader label="Pendulum" whenToUse="Waiting for server response."
          style={{ animation: 'pendulum 1s ease-in-out infinite', width: 56, height: 56, objectFit: 'contain', transformOrigin: 'top center' }} />

        <LogoLoader label="Color Shift" whenToUse="Artistic loading."
          style={{ animation: 'colorShift 2s linear infinite', width: 56, height: 56, objectFit: 'contain' }} />

        <LogoLoader label="Jiggle" whenToUse="User attention required."
          style={{ animation: 'jiggle 0.3s ease-in-out infinite', width: 56, height: 56, objectFit: 'contain' }} />

        <LogoLoader label="Fade Scale" whenToUse="Minimalist loading."
          style={{ animation: 'fadeScale 1.5s ease-in-out infinite', width: 56, height: 56, objectFit: 'contain' }} />

        <LogoLoader label="Blur Reveal" whenToUse="Subtle background loading."
          style={{ animation: 'blurRevealL 2s ease-in-out infinite', width: 56, height: 56, objectFit: 'contain' }} />

        <LogoLoader label="Neon Flicker" whenToUse="Cyberpunk or retro themed apps."
          style={{ animation: 'neonFlick 2s ease-in-out infinite', filter: 'drop-shadow(0 0 8px #8b5cf6)', width: 56, height: 56, objectFit: 'contain' }} />

        <EffectCard title="Satellite" desc="Single dot orbiting closely" whenToUse="Small component loading."
          prompt="Create a single orbiting dot tightly around a logo using transform rotate+translateX"
          code={`<div className="relative">\n  <img src={logo} />\n  <div style={{ position:'absolute', animation: 'satellite 1s linear infinite' }} />\n</div>`}>
          <div className="relative flex items-center justify-center w-16 h-16">
            <img src={LOGO} alt="Logo" className="w-10 h-10 object-contain" />
            <div className="absolute w-3 h-3 rounded-full bg-purple-500" style={{ animation: 'satellite 1s linear infinite', top: '50%', left: '50%', marginLeft: -6, marginTop: -6, transformOrigin: '6px 6px' }} />
          </div>
        </EffectCard>

        <EffectCard title="Bouncing Dots" desc="Dots bouncing under logo" whenToUse="Playful wait times."
          prompt="Three colored dots bounce underneath a logo with staggered delays"
          code={`{['bg-purple-500','bg-pink-500','bg-blue-500'].map((c,i) => (\n  <div key={i} className={c} style={{ animation: \`bounceDot 0.8s \${i*0.2}s infinite\` }} />\n))}`}>
          <div className="flex flex-col items-center gap-3">
            <img src={LOGO} alt="Logo" className="w-12 h-12 object-contain" />
            <div className="flex gap-2">
              {['bg-purple-500', 'bg-pink-500', 'bg-blue-500'].map((c, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${c}`} style={{ animation: `bounceDot 0.8s ${i * 0.2}s ease-in-out infinite` }} />
              ))}
            </div>
          </div>
        </EffectCard>
      </div>
    </>
  );
}