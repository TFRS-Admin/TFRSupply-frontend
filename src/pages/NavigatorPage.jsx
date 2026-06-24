import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, ChevronRight as BreadChev,
  MapPin, MessageSquare, Settings, BookOpen
} from 'lucide-react';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import PrototypeFooter from '@/components/PrototypeFooter';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';
import NavigatorTabs from '@/components/navigator/NavigatorTabs';

// ── Gallery images ─────────────────────────────────────────────────────────────
const GALLERY_IMAGES = [
  {
    src: 'https://worktruck.fedsig.com/ccstore/v1/images/?source=/file/v2623704715160741037/products/navigator_discrete_light_bar.navigator_discrete_light_bar.eComm.jpg&height=475&width=475',
    alt: 'Navigator® Light Bar — Front view',
    type: 'image',
  },
  {
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    alt: 'Navigator installed on patrol vehicle',
    type: 'image',
  },
  {
    src: 'https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&q=80',
    alt: 'Navigator light bar detail',
    type: 'image',
  },
];



// ── Image Gallery ──────────────────────────────────────────────────────────────
function ImageGallery() {
  const [active, setActive] = useState(0);
  const prev = () => setActive(i => (i - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  const next = () => setActive(i => (i + 1) % GALLERY_IMAGES.length);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image — white/light background like Fed Sig */}
      <div className="relative bg-white rounded border border-gray-200 overflow-hidden flex items-center justify-center" style={{ minHeight: 380 }}>
        <img
          src={GALLERY_IMAGES[active].src}
          alt={GALLERY_IMAGES[active].alt}
          className="max-w-full max-h-96 object-contain p-6"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'; }}
        />
        {GALLERY_IMAGES.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-300 hover:bg-gray-50 rounded-full flex items-center justify-center shadow-sm transition-all"
            >
              <ChevronLeft size={14} className="text-gray-600" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-300 hover:bg-gray-50 rounded-full flex items-center justify-center shadow-sm transition-all"
            >
              <ChevronRight size={14} className="text-gray-600" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2">
        {GALLERY_IMAGES.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-20 h-16 rounded border-2 overflow-hidden bg-white flex items-center justify-center transition-all ${
              i === active
                ? 'border-[#003DA5]'
                : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
            }`}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="max-w-full max-h-full object-contain p-1"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=60'; }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function NavigatorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PrototypeBanner />
      <SiteHeader activeVertical="police" activeCategory="Light Bars" />

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-1.5 text-xs text-gray-500">
          <Link to="/" className="hover:text-[#CC0000] transition-colors">Home</Link>
          <BreadChev size={10} className="text-gray-300" />
          <button onClick={() => navigate('/vertical/police')} className="hover:text-[#CC0000] transition-colors">Police</button>
          <BreadChev size={10} className="text-gray-300" />
          <span className="text-gray-400">Light Bars</span>
          <BreadChev size={10} className="text-gray-300" />
          <span className="text-gray-700 font-medium">Navigator® Light Bar</span>
        </div>
      </div>

      {/* ── Product Title — Fed Sig exact: left-aligned on desktop, ~36px Roboto Bold ── */}
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-2">
        <h1 style={{ fontFamily: "'Roboto', 'Inter', sans-serif", fontSize: '2.1rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
          Navigator® Light Bar
        </h1>
      </div>

      {/* ── Main product content: Image left, Advisor right ───────────────── */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left — Image Gallery ~58% */}
          <div className="lg:col-span-7">
            <ImageGallery />
          </div>

          {/* Right — Product info + CTAs ~42% */}
          <div className="lg:col-span-5">

            {/* Feature bullets — Fed Sig exact: plain bullet list, 15px Roboto, #3d3d3d */}
            <ul className="mb-6" style={{ fontFamily: "'Roboto','Inter',sans-serif", listStyle: 'disc', paddingLeft: '1.25rem' }}>
              {[
                'High-profile, linear light bar',
                'Available in 45", 53", and 60" lengths',
                'Amber, Blue, Green, Red, and White',
                'Single- and dual-color capability',
                'SignalMaster™ directional warning available',
                'Front flood, takedowns, alley lights, work lights, and S/T/T are available',
                'Low-power mode',
                '(30) flash patterns',
                '12 Vdc',
                'LED Traffic Clearing Light (TCL) available',
                'Black or Clear bulkheads available',
                'Five-year warranty',
              ].map((b, i) => (
                <li key={i} style={{ fontSize: '15px', color: '#3d3d3d', lineHeight: 1.7 }}>{b}</li>
              ))}
            </ul>

            {/* Primary CTAs — Fed Sig: two solid/ghost red buttons in a row */}
            <div className="flex gap-3 mb-6">
              <a
                href="https://www.fedsig.com/where-to-buy?category=175"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white transition-all"
                style={{ background: '#c8102e', borderRadius: '4px', fontFamily: "'Roboto','Inter',sans-serif", fontWeight: 700, fontSize: '14px', padding: '12px 20px', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#a50d25'}
                onMouseLeave={e => e.currentTarget.style.background = '#c8102e'}
              >
                <MapPin size={14} /> Where to Buy
              </a>
              <a
                href="#"
                className="flex items-center gap-2 transition-all"
                style={{ background: 'transparent', border: '2px solid #c8102e', color: '#c8102e', borderRadius: '4px', fontFamily: "'Roboto','Inter',sans-serif", fontWeight: 700, fontSize: '14px', padding: '10px 20px', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#c8102e'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c8102e'; }}
              >
                <MessageSquare size={14} /> Request Information
              </a>
            </div>

            {/* Secondary icon-link CTAs — Fed Sig: icon-above-label block links */}
            <div className="flex gap-6 pt-2 border-t border-gray-200">
              <a
                href="https://config.fedsig.com/lightbar/navigator-serial/web/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 text-center group"
                style={{ textDecoration: 'none' }}
              >
                <div className="w-14 h-14 rounded border border-gray-200 flex items-center justify-center bg-gray-50 group-hover:border-[#c8102e] transition-colors">
                  <Settings size={24} className="text-gray-500 group-hover:text-[#c8102e] transition-colors" />
                </div>
                <span style={{ fontFamily: "'Roboto','Inter',sans-serif", fontSize: '12px', fontWeight: 700, color: '#3d3d3d' }}>Configure Lightbar</span>
              </a>
              <a
                href="#"
                className="flex flex-col items-center gap-2 text-center group"
                style={{ textDecoration: 'none' }}
              >
                <div className="w-14 h-14 rounded border border-gray-200 flex items-center justify-center bg-gray-50 group-hover:border-[#c8102e] transition-colors">
                  <BookOpen size={24} className="text-gray-500 group-hover:text-[#c8102e] transition-colors" />
                </div>
                <span style={{ fontFamily: "'Roboto','Inter',sans-serif", fontSize: '12px', fontWeight: 700, color: '#3d3d3d' }}>Manual</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs Section — full width, Fed Sig style ─────────────────────── */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <NavigatorTabs />
        </div>
      </div>

      <PrototypeFooter />
      <DebugToggle />
      <DebugPanel />
    </div>
  );
}