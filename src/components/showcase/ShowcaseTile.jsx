import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function ShowcaseTile({ title, desc, prompt, children }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0D1B2A] border border-white/[0.08] rounded-xl overflow-hidden hover:border-white/20 transition-all">
      {/* Live preview */}
      <div className="bg-[#080F18] border-b border-white/[0.06] px-6 py-8 flex items-center justify-center min-h-[110px]">
        {children}
      </div>

      {/* Meta */}
      <div className="p-4">
        <div className="font-bold text-white text-sm mb-1">{title}</div>
        <p className="text-gray-500 text-xs leading-relaxed mb-3">{desc}</p>

        <button
          onClick={handleCopy}
          className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2 rounded transition-all ${
            copied
              ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400'
              : 'bg-[#003580]/20 border border-[#003580]/40 text-blue-400 hover:bg-[#003580]/30'
          }`}
        >
          {copied ? <><Check size={12} /> Prompt Copied!</> : <><Copy size={12} /> Use This Style</>}
        </button>
      </div>
    </div>
  );
}