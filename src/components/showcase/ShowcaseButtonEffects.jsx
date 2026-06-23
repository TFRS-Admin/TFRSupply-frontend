import React, { useState } from 'react';
import { ArrowRight, Check, Loader2, Download, ShoppingCart, Zap } from 'lucide-react';
import ShowcaseTile from './ShowcaseTile';

export default function ShowcaseButtonEffects() {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1800);
  };

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

      <ShowcaseTile title="Primary CTA" desc="Solid fill with arrow — main conversion action." prompt="B2B primary button, #003580 fill, white text, bold font, ArrowRight icon, hover darken + gap-expand">
        <button className="flex items-center gap-2 bg-[#003580] hover:bg-[#002a6a] text-white font-bold px-6 py-2.5 rounded text-sm transition-all group">
          Configure Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </ShowcaseTile>

      <ShowcaseTile title="Ghost / Outline" desc="Border only, fills on hover — secondary actions." prompt="Ghost button, border border-[#003580] text-[#003580], hover:bg-[#003580] hover:text-white, rounded, B2B">
        <button className="flex items-center gap-2 border-2 border-[#003580] text-[#003580] hover:bg-[#003580] hover:text-white font-bold px-6 py-2.5 rounded text-sm transition-all">
          Request Quote
        </button>
      </ShowcaseTile>

      <ShowcaseTile title="Loading State" desc="Spinner replaces text — prevent double-submit." prompt="Loading button with Loader2 spinner, disabled while loading, gray background, white text">
        <button
          onClick={handleLoad}
          disabled={loading}
          className="flex items-center gap-2 bg-[#003580] disabled:bg-gray-600 text-white font-bold px-6 py-2.5 rounded text-sm transition-all min-w-[140px] justify-center"
        >
          {loading ? <><Loader2 size={14} className="animate-spin" /> Processing…</> : 'Submit Order'}
        </button>
      </ShowcaseTile>

      <ShowcaseTile title="Add to Cart Confirm" desc="Check icon confirms action — reassures buyer." prompt="Add to cart button, on click switches to Check icon + 'Added!' in green, reverts after 2s">
        <button
          onClick={handleAdd}
          className={`flex items-center gap-2 font-bold px-6 py-2.5 rounded text-sm transition-all min-w-[140px] justify-center ${
            added ? 'bg-emerald-600 text-white' : 'bg-[#003580] hover:bg-[#002a6a] text-white'
          }`}
        >
          {added ? <><Check size={14} /> Added!</> : <><ShoppingCart size={14} /> Add to Cart</>}
        </button>
      </ShowcaseTile>

      <ShowcaseTile title="Icon + Download" desc="Left icon for file/download actions." prompt="Download button with Download icon left, border-gray-300 text-gray-700 hover:border-blue-500, clean B2B">
        <button className="flex items-center gap-2 border border-gray-300 hover:border-[#003580] text-gray-700 hover:text-[#003580] font-semibold px-5 py-2.5 rounded text-sm transition-all bg-white">
          <Download size={14} /> Spec Sheet (PDF)
        </button>
      </ShowcaseTile>

      <ShowcaseTile title="Danger / Alert" desc="Red destructive action — used for removes/resets." prompt="Destructive button, red-600 fill, white text, hover red-700, bold, B2B admin">
        <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded text-sm transition-all">
          <Zap size={14} /> Clear Build
        </button>
      </ShowcaseTile>

    </div>
  );
}