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
      {/* Main image — no border, white bg */}
      <div className="relative bg-white overflow-hidden flex items-center justify-center" style={{ minHeight: 400 }}>
        <img
          src={GALLERY_IMAGES[active].src}
          alt={GALLERY_IMAGES[active].alt}
          className="max-w-full max-h-[420px] object-contain"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'; }}
        />
        {GALLERY_IMAGES.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-all">
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-all">
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails — no border, opacity-based active state */}
      <div className="flex gap-2">
        {GALLERY_IMAGES.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-20 h-16 overflow-hidden bg-white flex items-center justify-center transition-all ${
              i === active ? 'opacity-100 outline outline-2 outline-[#c8102e]' : 'opacity-50 hover:opacity-80'
            }`}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="max-w-full max-h-full object-contain"
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

      {/* ── Hero: strict 2-col — 60% image / 40% info ───────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-10">

        {/* Product title — full width above columns */}
        <h1 style={{ fontFamily: "'Roboto','Inter',sans-serif", fontSize: '2rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2, marginBottom: '1.5rem' }}>
          Navigator® Serial Light Bar
        </h1>

        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>

          {/* Left — Image Gallery 60% */}
          <div style={{ flex: '0 0 60%', maxWidth: '60%' }}>
            <ImageGallery />
          </div>

          {/* Right — Info 40% */}
          <div style={{ flex: '0 0 40%', maxWidth: '40%' }}>

            {/* Feature bullets */}
            <ul style={{ fontFamily: "'Roboto','Inter',sans-serif", listStyle: 'disc', paddingLeft: '1.2rem', marginBottom: '1.5rem' }}>
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

            {/* Primary text-link CTAs — Fed Sig style: underlined red links */}
            <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <a
                href="https://www.fedsig.com/where-to-buy?category=175"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: "'Roboto','Inter',sans-serif", fontWeight: 700, fontSize: '14px', color: '#c8102e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                <MapPin size={14} /> Where to Buy
              </a>
              <a
                href="#"
                style={{ fontFamily: "'Roboto','Inter',sans-serif", fontWeight: 700, fontSize: '14px', color: '#c8102e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                <MessageSquare size={14} /> Request Information
              </a>
            </div>

            {/* Icon-above-label secondary links */}
            <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e5e5', marginBottom: '1.5rem' }}>
              <a
                href="https://config.fedsig.com/lightbar/navigator-serial/web/"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center' }}
              >
                <div className="w-14 h-14 flex items-center justify-center bg-gray-100 group-hover:bg-gray-200 transition-colors">
                  <Settings size={26} className="text-gray-600 group-hover:text-[#c8102e] transition-colors" />
                </div>
                <span style={{ fontFamily: "'Roboto','Inter',sans-serif", fontSize: '11px', fontWeight: 700, color: '#3d3d3d', lineHeight: 1.3 }}>Configure<br/>Lightbar</span>
              </a>
              <a
                href="#"
                className="group"
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center' }}
              >
                <div className="w-14 h-14 flex items-center justify-center bg-gray-100 group-hover:bg-gray-200 transition-colors">
                  <BookOpen size={26} className="text-gray-600 group-hover:text-[#c8102e] transition-colors" />
                </div>
                <span style={{ fontFamily: "'Roboto','Inter',sans-serif", fontSize: '11px', fontWeight: 700, color: '#3d3d3d' }}>Manual</span>
              </a>
            </div>

            {/* Quick-jump anchor nav */}
            <div style={{ display: 'flex', gap: '0', borderTop: '1px solid #e5e5e5', paddingTop: '1rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Features', href: '#features-section' },
                { label: 'SKU Specifications', href: '#sku-section' },
                { label: 'Videos', href: '#video-section' },
                { label: 'Accessories', href: '#accessories-section' },
              ].map((link, i, arr) => (
                <React.Fragment key={link.href}>
                  <a
                    href={link.href}
                    style={{ fontFamily: "'Roboto','Inter',sans-serif", fontSize: '13px', color: '#c8102e', fontWeight: 600, textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {link.label}
                  </a>
                  {i < arr.length - 1 && <span style={{ color: '#ccc', margin: '0 10px' }}>|</span>}
                </React.Fragment>
              ))}
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