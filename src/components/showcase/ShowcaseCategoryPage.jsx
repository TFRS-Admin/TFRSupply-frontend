import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, ALL_TAGS } from './showcaseData';
import { Copy, Check, Code } from 'lucide-react';

// Per-category demo components
import ButtonEffects from './demos/ButtonEffects';
import AdminLayouts from './demos/AdminLayouts';
import MarketingEffects from './demos/MarketingEffects';
import VisualEffects from './demos/VisualEffects';
import NavigationEffects from './demos/NavigationEffects';
import LoadingSpinners from './demos/LoadingSpinners';
import ChatEffects from './demos/ChatEffects';
import EcommerceEffects from './demos/EcommerceEffects';
import TransitionEffects from './demos/TransitionEffects';
import TextEffects from './demos/TextEffects';
import GenericPlaceholder from './demos/GenericPlaceholder';

const DEMO_MAP = {
  buttoneffects: ButtonEffects,
  adminlayouts: AdminLayouts,
  marketingeffects: MarketingEffects,
  visualeffects: VisualEffects,
  navigationeffects: NavigationEffects,
  loadingspinners: LoadingSpinners,
  chateffects: ChatEffects,
  ecommerceeffects: EcommerceEffects,
  transitions: TransitionEffects,
  texteffects: TextEffects,
};

export function EffectCard({ title, desc, whenToUse, code, prompt, children }) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const copy = (text, setter) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
      {/* Live demo */}
      <div className="bg-gray-50 border-b border-gray-100 px-6 py-8 flex items-center justify-center min-h-[140px]">
        {children}
      </div>
      {/* Meta */}
      <div className="p-4">
        <div className="font-bold text-gray-900 text-sm mb-0.5">{title}</div>
        <p className="text-gray-500 text-xs mb-2">{desc}</p>
        {whenToUse && (
          <div className="text-xs text-gray-400 italic mb-3 leading-relaxed">
            <span className="font-semibold not-italic text-gray-500">When to use: </span>{whenToUse}
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => copy(code || `// ${title} component code`, setCodeCopied)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded border transition-all ${
              codeCopied ? 'bg-green-50 border-green-300 text-green-600' : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {codeCopied ? <Check size={11} /> : <Copy size={11} />} Copy Code
          </button>
          <button
            onClick={() => copy(prompt || `Create a ${title} component`, setPromptCopied)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded border transition-all ${
              promptCopied ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {promptCopied ? <Check size={11} /> : <Copy size={11} />} Copy Prompt
          </button>
          <button
            onClick={() => setShowCode(s => !s)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:border-gray-400 transition-all"
          >
            <Code size={11} /> {showCode ? 'Hide' : 'View'} Code
          </button>
        </div>
        {showCode && (
          <pre className="mt-3 bg-gray-900 text-green-400 text-[10px] rounded-lg p-3 overflow-x-auto max-h-48 font-mono leading-relaxed">
            {code || `// ${title}\n// Prompt: ${prompt || `Create a ${title} component`}`}
          </pre>
        )}
      </div>
    </div>
  );
}

export default function ShowcaseCategoryPage({ categoryId }) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  const DemoComponent = DEMO_MAP[categoryId] || GenericPlaceholder;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top banner */}
      <div className="bg-black text-white text-center text-xs py-2 font-bold tracking-wide">
        ⚡ 850+ Effects • Copy & Paste Ready Prompts! ⚡{' '}
        <a href="https://base44.com" className="underline opacity-70 hover:opacity-100">Team44 apps on Base44 👀</a>
      </div>

      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <Link to="/showcase" className="text-xs text-orange-500 font-bold hover:underline">← All Categories</Link>
          <h1 className="text-3xl font-black mt-2 mb-0.5">{cat?.label || categoryId}</h1>
          <p className="text-gray-500 text-sm">{cat?.desc}</p>
        </div>
      </header>

      {/* Tag filter bar */}
      <div className="border-b border-gray-100 overflow-x-auto">
        <div className="flex gap-0 px-4 min-w-max max-w-5xl mx-auto">
          {ALL_TAGS.map(tag => (
            <Link
              key={tag}
              to={tag === 'All' ? '/showcase' : '#'}
              className="px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 border-transparent text-gray-500 hover:text-gray-800 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Effects grid */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <DemoComponent categoryId={categoryId} />
      </main>

      <div className="text-center py-8 border-t border-gray-100">
        <Link to="/showcase" className="text-xs text-gray-400 hover:text-gray-600">← Back to All Categories</Link>
        <span className="mx-3 text-gray-200">|</span>
        <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">← TFR Supply Store</Link>
      </div>
    </div>
  );
}