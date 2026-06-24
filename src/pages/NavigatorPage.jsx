import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, ChevronLeft, ChevronRight, ChevronRight as BreadChev,
  Phone, ShoppingCart, FileText, Search, Menu, X, Home
} from 'lucide-react';
import PrototypeBanner from '@/components/PrototypeBanner';
import PrototypeFooter from '@/components/PrototypeFooter';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';
import NavigatorOptionsModule from '@/components/navigator/NavigatorOptionsModule';
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

const VERTICALS = [
  { id: 'police', label: 'Police', path: '/vertical/police' },
  { id: 'fire', label: 'Fire / EMS', path: '/vertical/fire' },
  { id: 'worktruck', label: 'Work Truck', path: '/vertical/worktruck' },
  { id: 'tow', label: 'Tow & Recovery', path: '/vertical/tow' },
];

const PRODUCT_CATEGORIES = [
  'Light Bars', 'Sirens & Speakers', 'Perimeter Lights',
  'SignalMasters', 'Push Bumpers', 'Stinger Spike System',
  'Compartment Lighting', 'Accessories',
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeVertical] = useState('police');

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PrototypeBanner />

      {/* ── Header — Fed Sig style: white bg, full width ─────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">

        {/* Top bar: vertical tabs */}
        <div className="bg-[#1a1a2e] text-white">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="px-3 py-2.5 text-gray-400 hover:text-white transition-colors">
                <Home size={14} />
              </Link>
              {VERTICALS.map(v => (
                <button
                  key={v.id}
                  onClick={() => navigate(v.path)}
                  className={`px-4 py-2.5 text-xs font-semibold tracking-wide uppercase transition-all border-b-2 ${
                    v.id === activeVertical
                      ? 'border-[#CC0000] text-white'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-4 text-xs text-gray-400">
              <button className="hover:text-white transition-colors">Resources</button>
              <button className="hover:text-white transition-colors">Product News</button>
              <a
                href="tel:800-446-6809"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Phone size={11} /> 800-446-6809
              </a>
            </div>
          </div>
        </div>

        {/* Main header row: logo + search + cart */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-[#CC0000] rounded flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <div className="font-black text-base tracking-tight leading-none text-gray-900">TFR SUPPLY</div>
              <div className="text-[9px] text-gray-400 tracking-widest uppercase leading-none mt-0.5">Pro Shop</div>
            </div>
          </button>

          {/* Search */}
          <div className="flex-1 max-w-lg hidden md:flex items-center border border-gray-300 rounded overflow-hidden">
            <input
              type="text"
              placeholder="Search for products"
              className="flex-1 px-4 py-2 text-sm text-gray-800 outline-none bg-white placeholder-gray-400"
            />
            <button className="bg-[#CC0000] hover:bg-[#aa0000] px-4 py-2 transition-colors">
              <Search size={16} className="text-white" />
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center gap-2 border-2 border-[#CC0000] text-[#CC0000] hover:bg-[#CC0000] hover:text-white font-bold text-sm px-4 py-2 rounded transition-all">
              <ShoppingCart size={14} />
              Where to Buy
            </button>
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Product category nav — like Fed Sig's second nav row */}
        <div className="hidden md:block border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 flex items-center">
            {PRODUCT_CATEGORIES.map((cat, i) => (
              <button
                key={i}
                className={`px-4 py-3 text-xs font-semibold text-gray-600 hover:text-[#CC0000] hover:bg-gray-50 transition-all whitespace-nowrap border-b-2 ${
                  cat === 'Light Bars' ? 'border-[#CC0000] text-[#CC0000]' : 'border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

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

          {/* Right — TFR Build Advisor ~42% */}
          <div className="lg:col-span-5">

            {/* Request Quote CTA — Fed Sig btn-primary exact */}
            <button
              className="w-full mb-4 flex items-center justify-between gap-2 text-white transition-all"
              style={{ background: '#c8102e', borderRadius: '4px', fontFamily: "'Roboto','Inter',sans-serif", fontWeight: 700, fontSize: '14px', padding: '14px 24px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#a50d25'}
              onMouseLeave={e => e.currentTarget.style.background = '#c8102e'}
            >
              <div className="flex items-center gap-2">
                <FileText size={16} />
                Request a Quote
              </div>
              <ChevronRight size={16} />
            </button>

            {/* Stock status */}
            <div className="flex items-center gap-2 mb-4 font-semibold text-green-700" style={{ fontSize: '14px', fontFamily: "'Roboto','Inter',sans-serif" }}>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              In Stock
            </div>

            {/* Quick bullets — Fed Sig exact: bullet dot prefix, 15px Roboto, #3d3d3d, 8px vertical padding */}
            <div className="mb-5 border-b border-gray-200 pb-5">
              {[
                'High-profile, linear LED light bar',
                'Available in 45", 53", 60", 73", and 87" lengths',
                'Amber, Blue, Green, Red, and White',
                'Single- and dual-color capability',
                'SignalMaster™ directional warning available',
                'Five-year warranty',
              ].map((b, i) => (
                <div key={i} style={{ fontFamily: "'Roboto', 'Inter', sans-serif", fontSize: '15px', color: '#3d3d3d', lineHeight: 1.6, padding: '6px 0' }}>
                  • {b}
                </div>
              ))}
            </div>

            {/* TFR Build Advisor — Fed Sig design system: 1px #e0e0e0 border, white bg, Roboto */}
            <div style={{ border: '1px solid #d8d8d8', borderRadius: '4px', overflow: 'hidden', fontFamily: "'Roboto','Inter',sans-serif" }}>
              <div style={{ background: '#1a1a1a', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#c8102e' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ffffff' }}>TFR Build Advisor</span>
              </div>
              <div style={{ padding: '20px 16px', background: '#ffffff' }}>
                <NavigatorOptionsModule />
              </div>
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