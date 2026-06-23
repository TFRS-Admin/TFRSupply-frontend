import React from 'react';
import { ArrowRight, Shield, Zap, Package, CheckCircle2 } from 'lucide-react';
import ShowcaseTile from './ShowcaseTile';

export default function ShowcasePageSections() {
  return (
    <div className="grid grid-cols-1 gap-5">

      <ShowcaseTile title="Section Header + Grid" desc="Eyebrow label, bold title, subtitle, right CTA — standard section opener." prompt="Section header: eyebrow text-xs font-bold tracking-widest text-blue-400 uppercase mb-2, h2 text-3xl font-black, p text-gray-500 text-sm, flex justify-between with right 'View All' link text-blue-400 font-bold flex items-center gap-1">
        <div className="w-full max-w-sm">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-[10px] font-bold tracking-widest text-blue-400 uppercase mb-1">Product Families</div>
              <div className="text-xl font-black text-white">Configure by Series.</div>
              <div className="text-gray-500 text-xs mt-0.5">Select a product family to find your exact SKU.</div>
            </div>
            <button className="text-blue-400 text-xs font-bold flex items-center gap-1">View All <ArrowRight size={11} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['Navigator', 'Pathfinder', 'DuraForce', 'Pathway'].map(n => (
              <div key={n} className="bg-white/[0.04] border border-white/[0.08] rounded-lg p-3 text-xs font-semibold text-gray-300">{n}</div>
            ))}
          </div>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Stats / Trust Bar" desc="4-column stat strip — placed after hero or between sections." prompt="Stats bar bg-white/[0.02] border-y border-white/[0.06], grid grid-cols-4, each stat: number text-xl font-black text-white, label text-xs text-gray-500 mt-0.5, text-center py-5">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl w-full">
          <div className="grid grid-cols-4 text-center py-4">
            {[['7000+','Products'],['100+','Brands'],['Fast','Shipping'],['Live','Inventory']].map(([v,l]) => (
              <div key={l} className="border-r border-white/[0.06] last:border-0 px-2">
                <div className="text-lg font-black text-white">{v}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Two-Col Feature Row" desc="Left image, right copy — Federal Signal hero pattern." prompt="Two-col section, grid grid-cols-2 gap-10 items-center, left: 2x2 image grid gap-2 rounded-lg overflow-hidden, right: eyebrow + h2 font-black text-white + body text-gray-400 + CTA button">
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm items-center">
          <div className="grid grid-cols-2 gap-1.5">
            {['photo-1544620347','photo-1568605117036','photo-1541185933','photo-1609752716955'].map(id => (
              <img key={id} src={`https://images.unsplash.com/${id}-5fe5e7bab0b7?w=100&q=70`} alt="" className="rounded-lg w-full h-12 object-cover opacity-80" />
            ))}
          </div>
          <div>
            <div className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">TFR Supply</div>
            <div className="text-sm font-black text-white leading-tight mb-1.5">Innovative Products for First Responders</div>
            <button className="text-[10px] font-bold bg-white text-[#003580] px-3 py-1.5 rounded">Shop Now</button>
          </div>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Feature Checklist Row" desc="Icon + bullet list for product/service features." prompt="Feature list, flex flex-col gap-3, each item flex items-start gap-3, CheckCircle2 text-emerald-500 shrink-0, div with title font-semibold text-white text-sm + body text-gray-500 text-xs">
        <div className="space-y-3 w-full max-w-xs">
          {[
            ['Fit-Verified Catalog','Cross-referenced to your exact vehicle platform.'],
            ['Live Inventory Feed','Real-time stock from 100+ manufacturers.'],
            ['Guided Configuration','Step-by-step SKU finder with dependency checks.'],
          ].map(([title, body]) => (
            <div key={title} className="flex items-start gap-3">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white text-xs">{title}</div>
                <div className="text-gray-500 text-[11px]">{body}</div>
              </div>
            </div>
          ))}
        </div>
      </ShowcaseTile>

    </div>
  );
}