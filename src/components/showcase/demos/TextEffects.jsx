import React, { useState, useEffect } from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

function TypewriterEffect() {
  const words = ['Magic', 'Powerful', 'Beautiful', 'Simple'];
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wordIdx];
    const t = setTimeout(() => {
      if (!deleting && charIdx < word.length) setCharIdx(c => c + 1);
      else if (!deleting && charIdx === word.length) { setTimeout(() => setDeleting(true), 1200); }
      else if (deleting && charIdx > 0) setCharIdx(c => c - 1);
      else { setDeleting(false); setWordIdx(i => (i + 1) % words.length); }
    }, deleting ? 60 : 100);
    return () => clearTimeout(t);
  }, [charIdx, deleting, wordIdx, words]);
  return (
    <div className="text-2xl font-black text-gray-900">
      {words[wordIdx].slice(0, charIdx)}<span className="animate-pulse text-blue-500">|</span>
    </div>
  );
}

function GradientText() {
  return (
    <div className="text-3xl font-black" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 200%', animation: 'gradShift 3s ease infinite' }}>
      GRADIENT
      <style>{`@keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }`}</style>
    </div>
  );
}

function TextReveal() {
  const [revealed, setRevealed] = useState(false);
  return (
    <div onClick={() => setRevealed(r => !r)} className="cursor-pointer select-none">
      <div className="text-2xl font-black text-gray-900 overflow-hidden relative h-10">
        <div className="transition-all duration-500" style={{ transform: revealed ? 'translateY(0)' : 'translateY(100%)', opacity: revealed ? 1 : 0 }}>REVEAL</div>
      </div>
      <div className="text-xs text-gray-400 mt-1">click to {revealed ? 'hide' : 'reveal'}</div>
    </div>
  );
}

function ScrambleText() {
  const original = 'DECODE';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
  const [text, setText] = useState(original);
  const scramble = () => {
    let iter = 0;
    const t = setInterval(() => {
      setText(prev => prev.split('').map((c, i) => {
        if (i < iter) return original[i];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(''));
      if (iter >= original.length) clearInterval(t);
      iter += 0.3;
    }, 40);
  };
  return (
    <button onClick={scramble} className="font-black text-xl font-mono text-green-500 hover:text-green-400 transition-colors">{text}</button>
  );
}

function NeonText() {
  const [bright, setBright] = useState(false);
  return (
    <div className="text-center flex flex-col items-center gap-3 bg-gray-950 rounded-xl px-6 py-5 w-48">
      <div className="text-3xl font-black text-pink-400" style={{ textShadow: bright ? '0 0 10px #f472b6, 0 0 30px #f472b6, 0 0 60px #f472b6' : '0 0 5px rgba(244,114,182,0.5)' }}>
        NEON
      </div>
      <button onClick={() => { setBright(true); setTimeout(() => setBright(false), 1500); }}
        className="text-[10px] font-bold border border-pink-400/40 text-pink-400 px-3 py-1 rounded bg-transparent">Flicker</button>
    </div>
  );
}

export default function TextEffects() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <EffectCard title="Typewriter Effect" desc="Text types character by character" whenToUse="Hero taglines, feature highlights, dynamic headings." prompt="Create a typewriter effect that cycles through an array of words, typing character by character then deleting. Use useState for charIdx and wordIdx, and useEffect with setTimeout." code={`function Typewriter() {\n  const words = ['Magic', 'Powerful', 'Beautiful'];\n  const [wordIdx, setWordIdx] = useState(0);\n  const [charIdx, setCharIdx] = useState(0);\n  const [deleting, setDeleting] = useState(false);\n  useEffect(() => {\n    const t = setTimeout(() => {\n      // increment charIdx, then delete, then switch word\n    }, deleting ? 60 : 100);\n    return () => clearTimeout(t);\n  }, [charIdx, deleting, wordIdx]);\n  return <div>{words[wordIdx].slice(0, charIdx)}<span>|</span></div>;\n}`}><TypewriterEffect /></EffectCard>

      <EffectCard title="Animated Gradient Text" desc="Moving color gradient through text" whenToUse="Hero sections, highlights, brand names." prompt="Create animated gradient text using CSS background-clip: text and WebkitTextFillColor: transparent with a background-size: 200% and keyframe animation that shifts the gradient position." code={`<div style={{\n  background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',\n  WebkitBackgroundClip: 'text',\n  WebkitTextFillColor: 'transparent',\n  backgroundSize: '200% 200%',\n  animation: 'gradShift 3s ease infinite'\n}} className="text-3xl font-black">\n  GRADIENT\n</div>\n// @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }`}><GradientText /></EffectCard>

      <EffectCard title="Text Reveal on Click" desc="Text slides up from hidden" whenToUse="Hero headlines, interactive reveals." prompt="Create a text reveal that slides up from below using translateY transition. Hidden state is translateY(100%) opacity-0, visible is translateY(0) opacity-1." code={`<div className="overflow-hidden relative h-10">\n  <div className="transition-all duration-500"\n    style={{ transform: revealed ? 'translateY(0)' : 'translateY(100%)', opacity: revealed ? 1 : 0 }}>\n    REVEAL\n  </div>\n</div>`}><TextReveal /></EffectCard>

      <EffectCard title="Matrix Scramble Text" desc="Text scrambles then decodes to original" whenToUse="Tech themes, password features, mystery." prompt="Create a text scramble effect that randomizes characters and then progressively reveals the original text from left to right using setInterval and random characters from a charset." code={`function Scramble() {\n  const original = 'DECODE';\n  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';\n  const [text, setText] = useState(original);\n  const scramble = () => {\n    let iter = 0;\n    const t = setInterval(() => {\n      setText(prev => prev.split('').map((c, i) => {\n        if (i < iter) return original[i];\n        return chars[Math.floor(Math.random() * chars.length)];\n      }).join(''));\n      if (iter >= original.length) clearInterval(t);\n      iter += 0.3;\n    }, 40);\n  };\n  return <button onClick={scramble}>{text}</button>;\n}`}><ScrambleText /></EffectCard>

      <EffectCard title="Neon Glow Text" desc="Glowing neon sign with flicker" whenToUse="Gaming, nightlife, retro aesthetics." prompt="Create neon glow text using CSS textShadow with multiple layers at increasing spread (0 0 10px, 0 0 30px, 0 0 60px) in pink. Add a flicker button that briefly intensifies the glow." code={`<div className="text-3xl font-black text-pink-400" style={{\n  textShadow: '0 0 10px #f472b6, 0 0 30px #f472b6, 0 0 60px #f472b6'\n}}>\n  NEON\n</div>`}><NeonText /></EffectCard>
    </div>
  );
}