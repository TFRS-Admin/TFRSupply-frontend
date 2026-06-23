import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronLeft, ChevronRight, Star, Truck, Phone } from 'lucide-react';
import PrototypeBanner from '@/components/PrototypeBanner';
import PrototypeFooter from '@/components/PrototypeFooter';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';
import NavigatorOptionsModule from '@/components/navigator/NavigatorOptionsModule';
import NavigatorTabs from '@/components/navigator/NavigatorTabs';

const GALLERY_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    alt: 'Navigator 18" — Front view',
  },
  {
    src: 'https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&q=80',
    alt: 'Navigator console detail',
  },
  {
    src: 'https://images.unsplash.com/photo-1597007030739-6d2b14a3a1a8?w=800&q=80',
    alt: 'Navigator installed in patrol vehicle',
  },
  {
    src: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
    alt: 'Navigator 22" — Extended platform',
  },
];

const VERTICALS = [
  { id: 'police', label: 'Police', path: '/vertical/police' },
  { id: 'fire', label: 'Fire / EMS', path: '/vertical/fire' },
  { id: 'commercial', label: 'Commercial', path: '/vertical/commercial' },
  { id: 'tow', label: 'Tow & Recovery', path: '/vertical/tow' },
];

function ImageGallery() {
  const [active, setActive] = useState(0);

  const prev = () => setActive(i => (i - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  const next = () => setActive(i => (i + 1) % GALLERY_IMAGES.length);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden aspect-[4/3]">
        <img
          src={GALLERY_IMAGES[active].src}
          alt={GALLERY_IMAGES[active].alt}
          className="w-full h-full object-cover"
        />
        <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all">
          <ChevronLeft size={14} className="text-white" />
        </button>
        <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all">
          <ChevronRight size={14} className="text-white" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2">
        {GALLERY_IMAGES.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex-1 aspect-square rounded-lg overflow-hidden border-2 transition-all ${
              i === active ? 'border-blue-500' : 'border-white/[0.08] hover:border-white/25 opacity-60 hover:opacity-100'
            }`}
          >
            <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function NavigatorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <PrototypeBanner />

      {/* ── Top Nav ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-[#0D1B2A]/98 backdrop-blur border-b border-white/10">
        {/* Vertical nav bar */}
        <div className="border-b border-white/[0.05] bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-1">
            {VERTICALS.map(v => (
              <button
                key={v.id}
                onClick={() => navigate(v.path)}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                  v.id === 'police'
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-gray-600 hover:text-gray-400'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main nav row */}
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <Shield size={16} />
              </div>
              <div className="hidden sm:block">
                <div className="font-black text-sm tracking-tight leading-none">TFR SUPPLY</div>
                <div className="text-[9px] text-gray-600 tracking-widest uppercase leading-none mt-0.5">Pro Shop</div>
              </div>
            </button>
            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-600">
              <span>/</span>
              <button onClick={() => navigate('/vertical/police')} className="hover:text-gray-400 transition-colors">Police</button>
              <span>/</span>
              <button onClick={() => navigate('/vertical/police')} className="hover:text-gray-400 transition-colors">Consoles &amp; Organizers</button>
              <span>/</span>
              <span className="text-gray-400">Navigator Series</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="hidden md:flex items-center gap-1.5">
              <Truck size={12} className="text-green-500" />
              <span className="text-green-500 font-semibold">In Stock — Ships within 3 business days</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5">
              <Phone size={12} />
              <span>Questions? Call us</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Product Hero (Federal Signal layout) ─────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* Left: Image Gallery — 5 cols */}
          <div className="lg:col-span-5">
            <ImageGallery />
          </div>

          {/* Middle: Product info — 4 cols */}
          <div className="lg:col-span-4 space-y-5">
            {/* Title + rating */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-bold tracking-widest uppercase bg-blue-600 text-white px-2.5 py-1 rounded-full">Police</span>
                <span className="text-[9px] font-bold tracking-widest uppercase bg-white/[0.06] text-gray-400 px-2.5 py-1 rounded-full">Console</span>
              </div>
              <h1 className="text-2xl font-black leading-tight mb-2">Navigator Series<br/>Console / Organizer</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className={i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-700 fill-gray-700'} />
                  ))}
                </div>
                <span className="text-xs text-gray-500">4.3 / 5 · 47 reviews</span>
              </div>
            </div>

            {/* Short bullet summary */}
            <div className="space-y-2 text-sm text-gray-400 border-t border-white/[0.06] pt-5">
              {[
                'Command-grade aluminum console for police patrol vehicles',
                'Available in 14", 18", and 22" platform lengths',
                'Hardwired, push-button, and touchscreen controller variants',
                'Vehicle-specific mount kits for Ford PIU, Tahoe PPV, Durango',
                'All models are existing configured SKUs — not custom-built',
                '2-year limited warranty · USA assembled',
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500 shrink-0 mt-2" />
                  <span className="leading-relaxed">{b}</span>
                </div>
              ))}
            </div>

            {/* Fits note */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-xs text-gray-500 leading-relaxed">
              <span className="font-bold text-gray-400">Compatible platforms: </span>
              Ford PIU, Chevrolet Tahoe PPV, Dodge Durango Pursuit, Chevrolet Suburban PPV, Ford Expedition SSV, Dodge Charger + more.
              Select your vehicle above to narrow options.
            </div>
          </div>

          {/* Right: TFR Options Module — 3 cols */}
          <div className="lg:col-span-3">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
              <div className="text-[9px] font-black tracking-widest uppercase text-blue-400 mb-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                TFR Supply — Select &amp; Order
              </div>
              <NavigatorOptionsModule />
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs Section (Federal Signal style) ─────────────────────────── */}
      <div className="border-t border-white/[0.06] mt-4">
        <div className="max-w-7xl mx-auto px-6">
          <NavigatorTabs />
        </div>
      </div>

      <PrototypeFooter />
      <DebugToggle />
      <DebugPanel />
    </div>
  );
}