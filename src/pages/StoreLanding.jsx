import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Flame, Truck, Package, Search, ChevronRight, Zap, Car, HardHat, ArrowRight } from 'lucide-react';
import PrototypeBanner from '@/components/PrototypeBanner';
import { useConfigurator } from '@/context/ConfiguratorContext';
import PrototypeFooter from '@/components/PrototypeFooter';

const VEHICLES = [
  { label: 'Ford Explorer PIU', sub: '2020+ Interceptor', img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80' },
  { label: 'Chevy Tahoe PPV', sub: '2021+ PPV / SSV', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { label: 'Dodge Durango', sub: '2018+ Pursuit', img: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80' },
  { label: 'Dodge Charger', sub: '2011–2024 Pursuit', img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=80' },
  { label: 'F-150 Responder', sub: '2021+ Responder', img: 'https://images.unsplash.com/photo-1609752716955-b2b3fea4cac8?w=600&q=80' },
  { label: 'Chevy Silverado', sub: '2019+ PPV / SSV', img: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600&q=80' },
];

const CATEGORIES = [
  {
    label: 'Warning & Lighting',
    sub: 'Lightbars, sirens, and controllers from the biggest names.',
    cta: 'Shop Lighting',
    img: 'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?w=800&q=80',
    icon: Zap,
  },
  {
    label: 'Interior & Consoles',
    sub: 'Vehicle-specific mounts, partitions, and organizers.',
    cta: 'Configure Interior',
    img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80',
    icon: Car,
  },
  {
    label: 'Exterior Armor',
    sub: 'Push bumpers, grille guards, and window bars.',
    cta: 'Shop Exterior',
    img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
    icon: Shield,
  },
];

const STATS = [
  { value: 'Live', label: 'Inventory Feed' },
  { value: '7000+', label: 'Products Online' },
  { value: '100+', label: 'Manufacturers' },
  { value: 'Fast', label: 'Shipping' },
];

export default function StoreLanding() {
  const navigate = useNavigate();
  const { setPersistentVehicle } = useConfigurator();
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <PrototypeBanner />

      {/* Top utility bar */}
      <div className="bg-[#080F18] border-b border-white/[0.06] px-6 py-2 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Zap size={11} className="text-blue-400" /> Live Inventory Feed</span>
          <span className="flex items-center gap-1.5"><Package size={11} className="text-blue-400" /> 7000+ Products</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">For Upfitters & Resellers</span>
          <span className="text-gray-600">For Government & Fleets</span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="sticky top-0 z-40 bg-[#0D1B2A]/98 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield size={18} />
            </div>
            <div>
              <div className="font-black text-sm tracking-tight leading-none">TFR SUPPLY</div>
              <div className="text-[9px] text-gray-500 tracking-widest uppercase leading-none mt-0.5">Pro Shop</div>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <button className="hover:text-white transition-colors">All Products</button>
            <button onClick={() => navigate('/vertical/police')} className="hover:text-white transition-colors flex items-center gap-1">
              Emergency Response <ChevronRight size={14} className="opacity-50" />
            </button>
            <button className="hover:text-white transition-colors flex items-center gap-1 opacity-40 cursor-not-allowed">
              Commercial <ChevronRight size={14} className="opacity-50" />
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm hidden md:block">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by Part #, Vehicle, or Brand..."
                className="w-full bg-white/[0.05] border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08]"
              />
            </div>
          </div>

          {/* Select vehicle CTA */}
          <button
            onClick={() => navigate('/vertical/police')}
            className="shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2.5 rounded-full transition-all"
          >
            <Car size={14} /> Select Your Vehicle
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative overflow-hidden">
        {/* Background photo */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&q=80"
            alt="Police vehicle"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A] via-[#0D1B2A]/80 to-[#0D1B2A]/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: headline + search + CTAs */}
          <div>
            <div className="text-xs font-bold tracking-widest text-blue-400 uppercase mb-4">#1 Source For Police Equipment</div>
            <h1 className="text-5xl font-black leading-tight mb-6">
              The Equipment<br />
              Store That{' '}
              <span className="text-blue-400">Powers<br />Upfitters.</span>
            </h1>
            <p className="text-gray-400 text-base mb-8 max-w-md leading-relaxed">
              Shop thousands of products from top brands. Featuring guided configuration tools for dealerships and professional upfitters.
            </p>

            {/* Search bar */}
            <div className="flex items-center gap-3 mb-6 max-w-md">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by Part #, Vehicle, or Brand..."
                  className="w-full bg-white/[0.07] border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60"
                />
              </div>
              <button className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all">
                <ArrowRight size={16} />
              </button>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => navigate('/vertical/police')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all"
              >
                Shop Products <ArrowRight size={15} />
              </button>
              <button
                onClick={() => navigate('/family/navigator')}
                className="flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all"
              >
                Vehicle Configurator
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-5 mt-7 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><Zap size={11} className="text-blue-400" /> Live Inventory Feed</span>
              <span className="flex items-center gap-1.5"><Package size={11} className="text-blue-400" /> 7000+ Products</span>
              <span className="flex items-center gap-1.5"><Shield size={11} className="text-blue-400" /> Fast Shipping</span>
            </div>
          </div>

          {/* Right: audience cards */}
          <div className="space-y-4">
            <div className="bg-[#0D1B2A]/80 border-l-4 border-blue-500 backdrop-blur rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center shrink-0">
                  <HardHat size={18} className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white mb-1">For Upfitters & Resellers</div>
                  <p className="text-sm text-gray-400 mb-3">Wholesale pricing, white-label quoting, and tax-exempt checkout.</p>
                  <button className="text-blue-400 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                    Request Dealer Account <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-[#0D1B2A]/80 border-l-4 border-gray-600 backdrop-blur rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-600/20 border border-gray-600/30 rounded-xl flex items-center justify-center shrink-0">
                  <Shield size={18} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white mb-1">For Government & Fleets</div>
                  <p className="text-sm text-gray-400 mb-3">Net-30 terms, instant quotes, and vehicle configuration tools.</p>
                  <button className="text-gray-400 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                    Agency Access <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="text-xl font-black text-white">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Shop by Vehicle */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold tracking-widest text-blue-400 uppercase mb-2">Shop By Vehicle</div>
            <h2 className="text-3xl font-black">Select Your Platform.</h2>
            <p className="text-gray-500 text-sm mt-1">Filter our catalog to see only what fits your vehicle.</p>
          </div>
          <button
            onClick={() => navigate('/vertical/police')}
            className="hidden md:flex items-center gap-1.5 text-blue-400 text-sm font-bold hover:gap-2.5 transition-all"
          >
            View All Vehicles <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {VEHICLES.map(v => (
            <button
              key={v.label}
              onClick={() => navigate('/vertical/police')}
              className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all aspect-[4/3]"
            >
              <img src={v.img} alt={v.label} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                <div className="font-bold text-white text-xs leading-tight">{v.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{v.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Ecosystem / Category tiles */}
      <div className="bg-white/[0.02] border-y border-white/[0.06] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold tracking-widest text-blue-400 uppercase mb-2">The Upfitter Ecosystem</div>
              <h2 className="text-3xl font-black">Buy Smarter. Build Faster.</h2>
              <p className="text-gray-500 text-sm mt-1 max-w-lg">Combined ecommerce catalog with professional configuration tools.</p>
            </div>
            <button
              onClick={() => navigate('/vertical/police')}
              className="hidden md:flex items-center gap-1.5 text-blue-400 text-sm font-bold hover:gap-2.5 transition-all"
            >
              Browse Full Catalog <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  onClick={() => navigate('/vertical/police')}
                  className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/40 transition-all aspect-[4/3] text-left"
                >
                  <img src={cat.img} alt={cat.label} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-45 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] via-[#0D1B2A]/50 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="w-9 h-9 bg-blue-600/30 border border-blue-500/40 rounded-xl flex items-center justify-center mb-3">
                      <Icon size={17} className="text-blue-400" />
                    </div>
                    <div className="font-black text-white text-lg leading-tight mb-1">{cat.label}</div>
                    <p className="text-gray-400 text-xs mb-3 leading-relaxed">{cat.sub}</p>
                    <span className="text-blue-400 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                      {cat.cta} <ArrowRight size={13} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Start your build CTA */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="text-xs font-bold tracking-widest text-blue-400 uppercase mb-4">Start Here</div>
        <h2 className="text-4xl font-black mb-4">Start Your Build.</h2>
        <p className="text-gray-400 text-base mb-8 max-w-lg mx-auto">
          Whether you are a fleet manager, an installer, or a dealer, we have the parts you need.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate('/vertical/police')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all"
          >
            Shop Now <ArrowRight size={15} />
          </button>
          <button
            onClick={() => navigate('/family/navigator')}
            className="flex items-center gap-2 bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all"
          >
            Vehicle Configurator
          </button>
        </div>
      </div>

      <PrototypeFooter />
    </div>
  );
}