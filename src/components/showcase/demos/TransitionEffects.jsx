import React, { useState, useEffect } from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

function FadeIn() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <button onClick={() => setVisible(v => !v)} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg">Toggle</button>
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-3 text-sm font-semibold text-blue-700 transition-all duration-500"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-10px)' }}>
        Content appeared!
      </div>
    </div>
  );
}

function StaggerList() {
  const [show, setShow] = useState(false);
  const items = ['Item One', 'Item Two', 'Item Three', 'Item Four'];
  return (
    <div className="flex flex-col items-start gap-3 w-48">
      <button onClick={() => setShow(s => !s)} className="bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-lg self-center">
        {show ? 'Hide' : 'Show'} List
      </button>
      <div className="space-y-1.5 w-full">
        {items.map((item, i) => (
          <div key={item} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-300"
            style={{ opacity: show ? 1 : 0, transform: show ? 'translateX(0)' : 'translateX(-20px)', transitionDelay: `${i * 80}ms` }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function CountUp() {
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const target = 10000;
  useEffect(() => {
    if (!running) return;
    const step = target / 60;
    let current = 0;
    const t = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); setRunning(false); clearInterval(t); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(t);
  }, [running]);
  return (
    <div className="text-center">
      <div className="text-4xl font-black text-blue-600 mb-2">{count.toLocaleString()}</div>
      <div className="text-xs text-gray-500 mb-3">Happy Customers</div>
      <button onClick={() => { setCount(0); setRunning(true); }} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg">
        Animate
      </button>
    </div>
  );
}

function FlipCard() {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="cursor-pointer" onClick={() => setFlipped(f => !f)} style={{ perspective: '600px', width: 120, height: 80 }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.5s' }}>
        <div className="absolute inset-0 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-sm" style={{ backfaceVisibility: 'hidden' }}>Front</div>
        <div className="absolute inset-0 bg-purple-600 text-white rounded-xl flex items-center justify-center font-black text-sm" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>Back!</div>
      </div>
    </div>
  );
}

function SlideReveal() {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-48">
      <button onClick={() => setOpen(o => !o)} className="w-full bg-gray-900 text-white text-xs font-bold py-2 rounded-lg mb-2">
        {open ? '▲ Close' : '▼ Show More'}
      </button>
      <div className="overflow-hidden transition-all duration-400" style={{ maxHeight: open ? '200px' : '0px' }}>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1.5">
          {['Extra feature 1','Extra feature 2','Extra feature 3'].map(f => (
            <div key={f} className="text-xs text-gray-700">✓ {f}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TransitionEffects() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <EffectCard title="Fade + Slide In" desc="Content fades and slides in on toggle" whenToUse="Dropdowns, notifications, modal reveals." prompt="Create a fade + slide-up transition using CSS transition with opacity and translateY. Toggle with a button. Use duration-500 and include an initial hidden state." code={`<div\n  className="transition-all duration-500"\n  style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-10px)' }}>\n  Content appeared!\n</div>`}><FadeIn /></EffectCard>

      <EffectCard title="Staggered List" desc="Items appear one by one with delay" whenToUse="Feature lists, menus, search results." prompt="Create a staggered list reveal where each item fades in with a translateX animation and a staggered delay using transitionDelay: i * 80ms." code={`{items.map((item, i) => (\n  <div className="transition-all duration-300"\n    style={{ opacity: show ? 1 : 0, transform: show ? 'translateX(0)' : 'translateX(-20px)', transitionDelay: \`\${i * 80}ms\` }}>\n    {item}\n  </div>\n))}`}><StaggerList /></EffectCard>

      <EffectCard title="Count Up Animation" desc="Number animates from 0 to target" whenToUse="Stats sections, milestones, dashboards." prompt="Create a count-up animation that animates a number from 0 to 10,000 over ~1 second using setInterval with 16ms steps. Add a button to restart the animation." code={`function CountUp() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    const step = 10000 / 60;\n    let current = 0;\n    const t = setInterval(() => {\n      current += step;\n      if (current >= 10000) { setCount(10000); clearInterval(t); }\n      else setCount(Math.floor(current));\n    }, 16);\n    return () => clearInterval(t);\n  }, []);\n  return <div className="text-4xl font-black text-blue-600">{count.toLocaleString()}</div>;\n}`}><CountUp /></EffectCard>

      <EffectCard title="3D Flip Card" desc="Card flips 180° on click" whenToUse="Reveal interactions, before/after, card selection." prompt="Create a 3D flip card using CSS perspective, transformStyle: preserve-3d, and rotateY(180deg) on click. Both front and back have backfaceVisibility: hidden." code={`<div style={{ perspective: '600px', width: 120, height: 80 }} onClick={() => setFlipped(f => !f)}>\n  <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.5s' }}>\n    <div style={{ backfaceVisibility: 'hidden' }} className="absolute inset-0 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">Front</div>\n    <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className="absolute inset-0 bg-purple-600 rounded-xl flex items-center justify-center text-white font-black">Back!</div>\n  </div>\n</div>`}><FlipCard /></EffectCard>

      <EffectCard title="Slide Reveal / Accordion" desc="Content expands/collapses smoothly" whenToUse="FAQs, show-more sections, accordions." prompt="Create a slide reveal using maxHeight transition. Set max-h-0 overflow-hidden when closed, then animate to max-h-200px when open using a CSS transition on max-height." code={`<div className="overflow-hidden transition-all duration-400"\n  style={{ maxHeight: open ? '200px' : '0px' }}>\n  {/* content */}\n</div>`}><SlideReveal /></EffectCard>
    </div>
  );
}