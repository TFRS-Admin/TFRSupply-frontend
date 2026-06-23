import React, { useState } from 'react';
import { ArrowRight, Star, ShoppingCart, Check, Package } from 'lucide-react';
import ShowcaseTile from './ShowcaseTile';

function MiniProductCard({ label, sku, price, badge, img }) {
  const [added, setAdded] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-40 shrink-0">
      <div className="relative h-24 bg-gray-100">
        <img src={img} alt={label} className="w-full h-full object-cover opacity-80" />
        {badge && <span className="absolute top-2 left-2 text-[9px] font-bold bg-[#003580] text-white px-1.5 py-0.5 rounded-full">{badge}</span>}
      </div>
      <div className="p-3">
        <div className="font-bold text-gray-900 text-[11px] leading-snug mb-0.5">{label}</div>
        <div className="text-[10px] font-mono text-gray-400 mb-2">{sku}</div>
        <div className="flex items-center justify-between">
          <span className="font-black text-[#003580] text-sm">{price}</span>
          <button
            onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 1500); }}
            className={`w-6 h-6 rounded flex items-center justify-center transition-all ${added ? 'bg-emerald-500' : 'bg-[#003580]'}`}
          >
            {added ? <Check size={10} className="text-white" /> : <ShoppingCart size={10} className="text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShowcaseProductCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

      <ShowcaseTile title="E-commerce Thumbnail" desc="Grid card with image, SKU, price, add-to-cart — standard catalog tile." prompt="Product thumbnail card, white bg rounded-xl border border-gray-200, top image h-24 bg-gray-100, badge top-left, title bold text-[11px], mono SKU, price text-[#003580] font-black, add cart icon button">
        <div className="flex gap-3">
          <MiniProductCard label="Navigator® Serial" sku="NAV-48-KP" price="$2,299" badge="Popular" img="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&q=80" />
          <MiniProductCard label="Pathfinder™ 56in" sku="PF-56-BW" price="$1,899" img="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=200&q=80" />
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Product List Row" desc="Horizontal list row — good for search results and cart." prompt="Product list row, flex items-center gap-4, image 48px square rounded, title + SKU stacked, price right-aligned, Add button border border-[#003580] text-[#003580] hover:bg-[#003580] hover:text-white">
        <div className="bg-white rounded-xl border border-gray-200 p-4 w-full max-w-sm divide-y divide-gray-100">
          {[
            { label: 'Navigator® 48" KP', sku: 'NAV-48-KP', price: '$2,299', img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=80&q=80' },
            { label: 'SignalMaster® 3-Hd', sku: 'SM3-12V', price: '$349', img: 'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?w=80&q=80' },
          ].map(item => (
            <div key={item.sku} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <img src={item.img} alt="" className="w-10 h-10 object-cover rounded-lg bg-gray-100" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-xs">{item.label}</div>
                <div className="font-mono text-[10px] text-gray-400">{item.sku}</div>
              </div>
              <span className="font-black text-[#003580] text-sm">{item.price}</span>
            </div>
          ))}
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Featured / Hero Product" desc="Large hero card for promoted/featured products." prompt="Featured product card, dark bg-[#003580] rounded-2xl, image right half transparent, left side badge + title font-black text-white + features list + white CTA button">
        <div className="relative bg-[#003580] rounded-2xl overflow-hidden w-full max-w-sm h-36">
          <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80" alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-30" />
          <div className="relative p-5">
            <span className="text-[9px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">Featured</span>
            <div className="font-black text-white text-sm mt-2 mb-1">Navigator® Series</div>
            <p className="text-blue-200 text-[11px] mb-3">Configurable console for PIU & Tahoe.</p>
            <button className="bg-white text-[#003580] font-bold text-[11px] px-4 py-1.5 rounded">Configure →</button>
          </div>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Compare / Spec Card" desc="Side-by-side spec comparison — good for product families." prompt="Product compare card, white bg border border-gray-200 rounded-xl, header with product name + price, then spec rows: label left, value right, alternating bg-gray-50, bottom CTA border-t">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full max-w-xs text-xs">
          <div className="bg-[#003580] px-4 py-3 text-white">
            <div className="font-black">Navigator® 48" KP</div>
            <div className="text-blue-200 font-mono">NAV-48-KP — $2,299</div>
          </div>
          {[['Length', '48"'], ['Heads', '6'], ['Pattern', 'TIR6'], ['Fitment', 'PIU / Tahoe']].map(([k, v]) => (
            <div key={k} className="flex px-4 py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-500 flex-1">{k}</span>
              <span className="font-semibold text-gray-900">{v}</span>
            </div>
          ))}
        </div>
      </ShowcaseTile>

    </div>
  );
}