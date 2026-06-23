import React from 'react';
import { ArrowRight, Shield, Package, Zap, Star } from 'lucide-react';
import ShowcaseTile from './ShowcaseTile';

export default function ShowcaseCardLayouts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

      <ShowcaseTile title="Bordered Info Card" desc="Clean border card with icon, heading, body, link. Use for feature callouts." prompt="B2B info card, white bg, border border-gray-200 rounded-xl, icon top-left in blue circle, bold title, gray body text, blue arrow link">
        <div className="bg-white rounded-xl border border-gray-200 p-5 w-full max-w-xs">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <Shield size={16} className="text-[#003580]" />
          </div>
          <div className="font-bold text-gray-900 text-sm mb-1">Fit-Verified Parts</div>
          <p className="text-gray-500 text-xs leading-relaxed mb-3">Every product is cross-referenced to your exact vehicle platform.</p>
          <button className="flex items-center gap-1 text-[#003580] text-xs font-bold hover:gap-2 transition-all">Learn more <ArrowRight size={11} /></button>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Dark Stat Card" desc="Dark background for stats/metrics — admin and dashboard use." prompt="Dark stat card, bg-[#080F18] border border-white/10 rounded-xl, large number in white font-black, label text-gray-500, small trend badge">
        <div className="bg-[#080F18] border border-white/10 rounded-xl p-5 w-full max-w-xs">
          <div className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-1">Active SKUs</div>
          <div className="text-3xl font-black text-white mb-1">7,412</div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] bg-emerald-600/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">+142 this week</span>
          </div>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Horizontal Media Card" desc="Image left, text right — for feature rows and blog-style entries." prompt="Horizontal card, image left 1/3 rounded-l-xl, text right 2/3 with title, body, CTA — B2B white bg border border-gray-200">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex w-full max-w-sm">
          <div className="w-20 shrink-0 bg-gray-100">
            <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&q=80" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="p-4 flex-1">
            <div className="font-bold text-gray-900 text-xs mb-1">Navigator Series</div>
            <p className="text-gray-500 text-[11px] leading-relaxed mb-2">Configurable console for PIU & Tahoe.</p>
            <button className="text-[#003580] text-[11px] font-bold">Configure →</button>
          </div>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Accent Left-Border Card" desc="Left border accent for alerts, callouts, highlights." prompt="Card with left border-l-4 border-[#003580], white bg, rounded-r-xl, icon + title + body. Use for tips, callouts, warnings">
        <div className="border-l-4 border-[#003580] bg-blue-50 rounded-r-xl p-5 w-full max-w-xs">
          <div className="flex items-start gap-3">
            <Package size={16} className="text-[#003580] mt-0.5 shrink-0" />
            <div>
              <div className="font-bold text-gray-900 text-sm mb-1">Vehicle Selected</div>
              <p className="text-gray-600 text-xs leading-relaxed">Results below are filtered for your 2024 Ford Explorer PIU.</p>
            </div>
          </div>
        </div>
      </ShowcaseTile>

    </div>
  );
}