import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, ALL_TAGS } from './showcaseData';

export default function ShowcaseHome() {
  const [activeTag, setActiveTag] = useState('All');

  const filtered = activeTag === 'All'
    ? CATEGORIES
    : CATEGORIES.filter(c => c.tags.includes(activeTag));

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top banner */}
      <div className="bg-black text-white text-center text-xs py-2 font-bold tracking-wide">
        ⚡ 850+ Effects • Copy & Paste Ready Prompts! ⚡{' '}
        <a href="https://base44.com" className="underline opacity-70 hover:opacity-100">Team44 apps on Base44 👀</a>
      </div>

      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-5 text-center">
        <h1 className="text-4xl font-black mb-1">Welcome to Team44</h1>
        <p className="text-gray-500 text-sm font-medium mb-1">OBSESS | LEARN | BUILD | CREATE</p>
        <p className="text-gray-600 text-sm max-w-lg mx-auto mb-4">
          Copy & Paste 850+ Prompts or Code for Effects + (Create Apps, Sites, Tools...)
        </p>
        <Link
          to="/showcase/buttoneffects"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-3 rounded-full text-sm transition-colors"
        >
          Explore Effects
        </Link>
      </header>

      {/* Tag filter bar */}
      <div className="border-b border-gray-100 overflow-x-auto">
        <div className="flex gap-0 px-4 min-w-max">
          {ALL_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTag === tag
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Category grid */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center mb-6 text-xs font-bold tracking-widest text-gray-400 uppercase">GIVE'R A GANDER — TEAM44</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(cat => (
            <Link
              key={cat.id}
              to={`/showcase/${cat.id}`}
              className="border border-gray-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-md transition-all group block"
            >
              <div className="text-xs font-bold text-orange-500 mb-1">{cat.count} effects</div>
              <div className="font-black text-gray-900 text-sm mb-1 group-hover:text-orange-600 transition-colors">{cat.label}</div>
              <p className="text-gray-500 text-xs leading-relaxed mb-3">{cat.desc}</p>
              <span className="text-xs font-bold text-orange-500 group-hover:underline">Explore →</span>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <div className="text-center py-8 border-t border-gray-100">
        <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">← Back to TFR Supply Store</Link>
      </div>
    </div>
  );
}