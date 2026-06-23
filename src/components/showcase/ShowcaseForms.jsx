import React, { useState } from 'react';
import { Search, ChevronDown, CheckCircle2 } from 'lucide-react';
import ShowcaseTile from './ShowcaseTile';

export default function ShowcaseForms() {
  const [val, setVal] = useState('');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

      <ShowcaseTile title="Light Form (B2B)" desc="White background form — quote request, contact, RFQ." prompt="Light form, white bg border border-gray-200 rounded-xl p-5, label text-xs font-bold text-gray-700 mb-1, input border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#003580], submit bg-[#003580] text-white font-bold w-full py-2.5 rounded-lg">
        <div className="bg-white border border-gray-200 rounded-xl p-5 w-full max-w-xs space-y-3">
          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">Agency / Company</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#003580]" placeholder="City Police Dept." />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">Email</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#003580]" placeholder="fleet@agency.gov" />
          </div>
          <button className="w-full bg-[#003580] text-white font-bold py-2.5 rounded-lg text-xs">Submit RFQ</button>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Dark Form (Configurator)" desc="Dark form for configurator step inputs." prompt="Dark form, bg-[#0D1B2A] border border-white/10 rounded-xl p-5, label text-[10px] font-bold text-gray-500 uppercase tracking-widest, select bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50, button bg-blue-600 hover:bg-blue-500 text-white font-bold w-full py-2.5 rounded-xl">
        <div className="bg-[#0D1B2A] border border-white/10 rounded-xl p-5 w-full max-w-xs space-y-3">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Year</label>
            <select className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
              <option>2024</option><option>2023</option><option>2022</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Platform</label>
            <select className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
              <option>Ford Explorer PIU</option><option>Chevy Tahoe PPV</option>
            </select>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs">Save Vehicle</button>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Search Input with Filter" desc="Search bar with filter pill tags below." prompt="Search input with left Search icon, border rounded-full px-9 py-2 bg-gray-50, below: flex gap-2 flex-wrap, filter pills bg-[#003580] text-white text-xs px-3 py-1 rounded-full font-semibold, others bg-gray-100 text-gray-600 hover:bg-gray-200">
        <div className="w-full max-w-xs space-y-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full bg-gray-50 border border-gray-200 rounded-full pl-8 pr-4 py-2 text-xs focus:outline-none focus:border-[#003580]" placeholder="Search products…" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['All','Light Bars','Sirens','Consoles','Accessories'].map((t, i) => (
              <button key={t} className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-colors ${i === 0 ? 'bg-[#003580] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
            ))}
          </div>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Step Progress Indicator" desc="Numbered steps with connector line — configurator flow." prompt="Step progress, flex items-center gap-0, step circle w-7 h-7 rounded-full text-xs font-bold, completed bg-[#003580] text-white, active ring-2 ring-[#003580] bg-white text-[#003580], future bg-gray-100 text-gray-400, connector line flex-1 h-0.5 bg-gray-200, completed connector bg-[#003580]">
        <div className="flex items-center w-full max-w-xs">
          {['Vehicle','Options','Add-ons','Review'].map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                  i < 2 ? 'bg-[#003580] text-white' : i === 2 ? 'ring-2 ring-[#003580] bg-white text-[#003580]' : 'bg-gray-100 text-gray-400'
                }`}>{i + 1}</div>
                <div className="text-[9px] text-gray-500 whitespace-nowrap">{label}</div>
              </div>
              {i < 3 && <div className={`flex-1 h-0.5 mb-4 ${i < 2 ? 'bg-[#003580]' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      </ShowcaseTile>

    </div>
  );
}