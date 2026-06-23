import React from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

const spin = `@keyframes spin { to { transform: rotate(360deg); } }`;
const pulse = `@keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.8); } }`;

export default function LoadingSpinners() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <EffectCard title="Classic Spinner" desc="Simple border-based spinner" whenToUse="General loading states, page transitions." prompt="Create a spinning circle loader using border-4, with border-gray-200 and border-t-blue-600, applied with CSS animation spin." code={`<div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />`}>
        <style>{spin}</style>
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-blue-600" style={{ animation: 'spin 0.8s linear infinite' }} />
      </EffectCard>

      <EffectCard title="Pulsing Dots" desc="Three dots pulsing in sequence" whenToUse="Chat loading, processing, waiting states." prompt="Create three dots that pulse with a staggered animation using scale and opacity. Each dot has an animation-delay of 0.15s apart." code={`<div className="flex gap-2">\n  {[0, 0.15, 0.3].map((delay, i) => (\n    <div key={i} className="w-3 h-3 bg-blue-600 rounded-full"\n      style={{ animation: \`pulse 1s \${delay}s ease-in-out infinite\` }} />\n  ))}\n</div>\n// @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }`}>
        <style>{pulse}</style>
        <div className="flex gap-2">
          {[0, 0.15, 0.3].map((delay, i) => (
            <div key={i} className="w-3 h-3 bg-blue-600 rounded-full" style={{ animation: `pulse 1s ${delay}s ease-in-out infinite` }} />
          ))}
        </div>
      </EffectCard>

      <EffectCard title="Skeleton Card" desc="Animated placeholder content" whenToUse="Loading product cards, user cards, list items." prompt="Create a skeleton loader card with an animated pulse shimmer. Use gray rounded divs for image placeholder, title line, and subtitle line." code={`<div className="bg-white border rounded-xl overflow-hidden">\n  <div className="h-24 w-full bg-gray-200 animate-pulse" />\n  <div className="p-3 space-y-2">\n    <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />\n    <div className="h-2 w-1/2 bg-gray-200 rounded animate-pulse" />\n    <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />\n  </div>\n</div>`}>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden w-36">
          <div className="h-20 w-full bg-gray-200 animate-pulse" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-2 w-1/2 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </EffectCard>

      <EffectCard title="Skeleton List" desc="Animated list row placeholders" whenToUse="Loading tables, feeds, search results." prompt="Create skeleton list rows with a small circle on the left (avatar) and two lines of different widths on the right, all using animate-pulse." code={`{[1,2,3].map(i => (\n  <div key={i} className="flex items-center gap-3 py-2">\n    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0" />\n    <div className="flex-1 space-y-1.5">\n      <div className="h-2.5 bg-gray-200 rounded animate-pulse" />\n      <div className="h-2 w-2/3 bg-gray-200 rounded animate-pulse" />\n    </div>\n  </div>\n))}`}>
        <div className="w-48 space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 bg-gray-200 rounded animate-pulse" />
                <div className="h-2 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </EffectCard>

      <EffectCard title="App Splash Loader" desc="Full-screen branded loader" whenToUse="App startup, auth redirect, initial data load." prompt="Create a full-screen dark loader with a spinning gradient border circle in the center over a dark background, used during app initialization." code={`<div className="fixed inset-0 bg-gray-950 flex items-center justify-center">\n  <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-blue-500 animate-spin" />\n</div>`}>
        <div className="w-full h-24 bg-gray-950 rounded-xl flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-gray-800 border-t-blue-500" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      </EffectCard>

      <EffectCard title="Heartbeat Monitor" desc="ECG-style pulsing line animation" whenToUse="Health apps, live status, active connection." prompt="Create a heartbeat line using SVG with a stroke-dasharray animation that draws the line from left to right continuously, creating an ECG-style effect." code={`<svg viewBox="0 0 200 60" className="w-48">\n  <polyline points="0,30 30,30 45,10 55,50 65,20 75,40 90,30 200,30"\n    fill="none" stroke="green" strokeWidth="2"\n    style={{ strokeDasharray: 300, animation: 'ecg 1.5s linear infinite' }} />\n</svg>\n// @keyframes ecg { from{strokeDashoffset:300} to{strokeDashoffset:-300} }`}>
        <svg viewBox="0 0 200 60" className="w-48">
          <polyline points="0,30 30,30 45,10 55,50 65,20 75,40 90,30 200,30" fill="none" stroke="#22c55e" strokeWidth="2"
            style={{ strokeDasharray: 300, strokeDashoffset: 0, animation: 'ecg 1.5s linear infinite' }} />
        </svg>
        <style>{`@keyframes ecg { from{stroke-dashoffset:300} to{stroke-dashoffset:-300} }`}</style>
      </EffectCard>
    </div>
  );
}