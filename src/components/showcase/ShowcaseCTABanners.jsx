import React from 'react';
import { ArrowRight, Phone, Mail, Shield, Zap } from 'lucide-react';
import ShowcaseTile from './ShowcaseTile';

export default function ShowcaseCTABanners() {
  return (
    <div className="grid grid-cols-1 gap-5">

      <ShowcaseTile title="Blue Full-Width CTA" desc="Solid brand-blue banner — main conversion section." prompt="Full-width CTA, bg-[#003580], eyebrow text-blue-300 text-xs font-bold tracking-widest uppercase mb-3, h2 text-3xl font-black text-white mb-3, body text-blue-100 text-sm mb-8 max-w-xl, flex gap-4: primary bg-white text-[#003580] font-bold px-6 py-2.5 rounded, secondary border border-white/40 text-white font-bold px-6 py-2.5 rounded hover:bg-white/10">
        <div className="bg-[#003580] rounded-2xl px-8 py-7 w-full">
          <div className="text-blue-300 text-[10px] font-bold tracking-widest uppercase mb-2">NEED ASSISTANCE?</div>
          <div className="text-2xl font-black text-white mb-2">Get The Answers You Need</div>
          <p className="text-blue-100 text-xs mb-4 max-w-xs">Connect to our team for support, replacement parts, and custom quotes.</p>
          <div className="flex gap-3 flex-wrap">
            <button className="flex items-center gap-2 bg-white text-[#003580] font-bold px-5 py-2 rounded text-xs"><Phone size={12} /> Call Us</button>
            <button className="flex items-center gap-2 border border-white/40 text-white font-bold px-5 py-2 rounded text-xs hover:bg-white/10"><Mail size={12} /> Message</button>
          </div>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Dark Overlay CTA (Hero)" desc="Background image with dark overlay — section closer." prompt="CTA with background image, relative overflow-hidden rounded-2xl, absolute inset-0 bg-cover bg-center, overlay bg-[#003580]/80, relative content: h2 text-white font-black text-3xl, body text-blue-100, CTA button bg-white text-[#003580]">
        <div className="relative rounded-2xl overflow-hidden w-full h-32" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-[#003580]/75" />
          <div className="relative p-6 text-center">
            <div className="text-xl font-black text-white mb-1.5">Stay Safe and Secure</div>
            <p className="text-blue-100 text-xs mb-3">With a partner you can trust.</p>
            <button className="bg-white text-[#003580] font-bold px-5 py-1.5 rounded text-xs">Connect With Us →</button>
          </div>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Dark Inline Banner" desc="Dark background inline strip — between page sections." prompt="Inline dark CTA, bg-[#080F18] border border-white/10 rounded-2xl, flex items-center justify-between px-6 py-5, left: icon in blue circle + text div, right: button bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl">
        <div className="bg-[#080F18] border border-white/10 rounded-2xl flex items-center justify-between px-5 py-4 w-full gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center shrink-0">
              <Zap size={15} className="text-blue-400" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Start Your Build</div>
              <div className="text-gray-500 text-xs">Guided SKU finder in under 2 minutes.</div>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs shrink-0">
            Configure <ArrowRight size={12} />
          </button>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Dealer / Agency Tier Cards" desc="Two-column audience cards — for upfitters vs. government." prompt="Two col audience cards, each: bg-[#0D1B2A]/80 border-l-4 border-blue-500/border-gray-600 rounded-2xl p-6, icon in colored box, title font-bold text-white, body text-gray-400 text-sm, bottom link text-blue-400 flex items-center gap-1">
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {[
            { border: 'border-blue-500', ibg: 'bg-blue-600/20 border-blue-500/30', ic: 'text-blue-400', title: 'For Upfitters', body: 'Wholesale & white-label quotes.' },
            { border: 'border-gray-600', ibg: 'bg-gray-600/20 border-gray-600/30', ic: 'text-gray-400', title: 'For Government', body: 'Net-30, fleet terms, RFQs.' },
          ].map(({ border, ibg, ic, title, body }) => (
            <div key={title} className={`border-l-4 ${border} bg-[#0D1B2A] rounded-r-xl p-4`}>
              <div className={`w-8 h-8 border rounded-lg flex items-center justify-center mb-3 ${ibg}`}>
                <Shield size={14} className={ic} />
              </div>
              <div className="font-bold text-white text-xs mb-1">{title}</div>
              <p className="text-gray-500 text-[10px]">{body}</p>
            </div>
          ))}
        </div>
      </ShowcaseTile>

    </div>
  );
}