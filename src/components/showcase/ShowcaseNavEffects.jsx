import React, { useState } from 'react';
import { Shield, Search, Menu, X, ChevronRight, ChevronDown } from 'lucide-react';
import ShowcaseTile from './ShowcaseTile';

export default function ShowcaseNavEffects() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-5">

      <ShowcaseTile title="Sticky Top Nav (Light)" desc="White nav bar with logo, tabs, search — matches Federal Signal reference." prompt="Sticky nav bar, bg-white border-b border-gray-200 shadow-sm, logo left flex items-center gap-3, tab nav hidden md:flex gap-1, active tab bg-[#003580] text-white rounded px-4 py-2, search input right, Where to Buy button">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden w-full max-w-xl">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#003580] rounded flex items-center justify-center shrink-0">
              <Shield size={14} className="text-white" />
            </div>
            <div className="flex-1 flex items-center gap-1 text-xs font-semibold">
              {['Police', 'Fire/EMS', 'Work Truck'].map((t, i) => (
                <button key={t} className={`px-3 py-1.5 rounded transition-colors ${i === 0 ? 'bg-[#003580] text-white' : 'text-gray-500'}`}>{t}</button>
              ))}
            </div>
            <button className="bg-[#003580] text-white text-xs font-bold px-3 py-1.5 rounded">Where to Buy</button>
          </div>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Dark Sticky Nav" desc="Dark nav for product family pages — transparent to solid on scroll." prompt="Dark nav bg-[#0D1B2A]/95 backdrop-blur border-b border-white/10 sticky top-0 z-40, logo + breadcrumb left, nav links center text-gray-400 hover:text-white, VehicleSelector right">
        <div className="bg-[#0D1B2A] border border-white/10 rounded-xl overflow-hidden w-full max-w-xl">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center"><Shield size={13} /></div>
              <span className="font-black text-xs text-white">TFR SUPPLY</span>
            </div>
            <span className="text-gray-700 text-xs">/</span>
            <span className="text-white text-xs font-semibold">Navigator Series</span>
            <div className="flex-1 flex justify-end gap-4 text-xs text-gray-400">
              <span className="hover:text-white cursor-pointer">Overview</span>
              <span className="hover:text-white cursor-pointer">Specs</span>
              <span className="hover:text-white cursor-pointer">Fitment</span>
            </div>
          </div>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Sub-Nav Category Tabs" desc="Horizontal sub-nav under main nav — product category tabs." prompt="Sub-nav tabs border-t border-gray-100 bg-gray-50, horizontal scroll, each tab text-xs font-semibold px-4 py-3, active tab border-b-2 border-[#003580] text-[#003580], others text-gray-500 border-transparent">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden w-full max-w-xl">
          <div className="flex overflow-x-auto border-t border-gray-100 bg-gray-50">
            {['Light Bars', 'Sirens', 'Perimeter Lights', 'Controllers', 'Accessories'].map((tab, i) => (
              <button
                key={tab}
                className={`text-xs font-semibold px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
                  i === 0 ? 'border-[#003580] text-[#003580]' : 'border-transparent text-gray-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </ShowcaseTile>

    </div>
  );
}