import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Flame, Truck, Radio, Zap, Search, Phone, Mail, ArrowRight } from 'lucide-react';
import PrototypeBanner from '@/components/PrototypeBanner';
import PrototypeFooter from '@/components/PrototypeFooter';

const VERTICALS = [
  {
    id: 'police',
    label: 'Police',
    icon: Shield,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-600/20 border-blue-500/30',
    img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80',
    description: "Leading the way in emergency lighting, lights and communications for cutting push cameras, and the reliable interior disc. A driving force in officer safety and security.",
    active: true,
    route: '/police',
  },
  {
    id: 'fire',
    label: 'Fire/EMS',
    icon: Flame,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-600/20 border-red-500/30',
    img: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=600&q=80',
    description: "Built for first responders. We carry the most reliable warning devices to protect firefighters and provide more transparency to keep your community safe.",
    active: true,
    route: '/fire',
  },
  {
    id: 'work-truck',
    label: 'Work Truck',
    icon: Truck,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-600/20 border-amber-500/30',
    img: 'https://images.unsplash.com/photo-1609752716955-b2b3fea4cac8?w=600&q=80',
    description: "Built for the road ahead. Providing safety and the best in class DOT compliant amber warning light systems and directional control for highway operations.",
    active: true,
    route: '/work-truck',
  },
  {
    id: 'mass-notification',
    label: 'Mass Notification',
    icon: Radio,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-600/20 border-purple-500/30',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    description: "From community alerting systems to large-scale mass notification, we help agencies communicate effectively when it matters most.",
    active: false,
  },
  {
    id: 'signaling',
    label: 'Signaling Device',
    icon: Zap,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-600/20 border-green-500/30',
    img: 'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?w=600&q=80',
    description: "From informative to dramatic signaling, Federal Signal can provide a broad selection of warning and signaling products for industrial use.",
    active: false,
  },
];

export default function StoreLanding() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PrototypeBanner />

      {/* Top utility bar */}
      <div className="bg-[#003580] text-white text-xs px-6 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span>For Upfitters &amp; Resellers</span>
          <span>For Government &amp; Fleets</span>
          <span>TradeBridge Login</span>
        </div>
        <div className="flex items-center gap-4 text-blue-200">
          <span>Find a Dealer</span>
          <span>800-621-9959</span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-[#003580] rounded flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <div className="font-black text-base tracking-tight leading-none text-[#003580]">TFR SUPPLY</div>
              <div className="text-[9px] text-gray-400 tracking-widest uppercase leading-none mt-0.5">Pro Shop</div>
            </div>
          </div>

          {/* Vertical nav tabs */}
          <div className="hidden md:flex items-center gap-1 text-sm font-semibold">
            {[
              { label: 'Police',            route: '/police' },
              { label: 'Fire/EMS',          route: '/fire' },
              { label: 'Work Truck',        route: '/work-truck' },
              { label: 'Emergency Beacon',  route: null },
              { label: 'Mass Notification', route: null },
            ].map(({ label, route }) => (
              <button
                key={label}
                onClick={route ? () => navigate(route) : undefined}
                className={`px-4 py-2 rounded transition-colors ${
                  route
                    ? 'bg-[#003580] text-white hover:bg-[#002a6a]'
                    : 'text-gray-500 opacity-50 cursor-not-allowed'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs hidden md:block">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-gray-50 border border-gray-200 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <button
            onClick={() => navigate('/police')}
            className="shrink-0 flex items-center gap-2 bg-[#003580] hover:bg-[#002a6a] text-white text-sm font-bold px-4 py-2 rounded transition-all"
          >
            Where to Buy →
          </button>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="relative bg-[#003580] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1600&q=80"
            alt="Fleet vehicles"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#003580]/90 to-[#003580]/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left: image collage */}
          <div className="grid grid-cols-2 gap-2">
            <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80" alt="Police vehicle" className="rounded-lg object-cover h-36 w-full opacity-90" />
            <img src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80" alt="Emergency lights" className="rounded-lg object-cover h-36 w-full opacity-90" />
            <img src="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=400&q=80" alt="Fire truck" className="rounded-lg object-cover h-36 w-full opacity-90" />
            <img src="https://images.unsplash.com/photo-1609752716955-b2b3fea4cac8?w=400&q=80" alt="Work truck" className="rounded-lg object-cover h-36 w-full opacity-90" />
          </div>
          {/* Right: copy */}
          <div>
            <div className="text-blue-300 text-xs font-bold tracking-widest uppercase mb-3">TFR Supply — Pro Shop</div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Going Beyond Innovative Products and Communication Systems
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              By providing the customer support and expertise to help you, those keeping your officers, first responders, and community safe.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => navigate('/police')}
                className="flex items-center gap-2 bg-white text-[#003580] font-bold px-6 py-2.5 rounded text-sm hover:bg-blue-50 transition-all"
              >
                Shop Products <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate('/family/navigator')}
                className="flex items-center gap-2 border border-white/40 text-white font-bold px-6 py-2.5 rounded text-sm hover:bg-white/10 transition-all"
              >
                Vehicle Configurator
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Capabilities Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900 mb-2">Comprehensive Capabilities Across Markets</h2>
          <p className="text-gray-500 text-sm">The best in lighting, sirens and emergency communications for the vehicles that serve you...</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {VERTICALS.map((v) => {
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                onClick={v.active ? () => navigate(v.route || `/${v.id}`) : undefined}
                className={`group text-left rounded-xl overflow-hidden border transition-all duration-200 ${
                  v.active
                    ? 'border-gray-200 hover:border-[#003580] hover:shadow-lg cursor-pointer'
                    : 'border-gray-100 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="relative h-36 overflow-hidden bg-gray-100">
                  <img
                    src={v.img}
                    alt={v.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {!v.active && (
                    <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded">Coming Soon</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center border ${v.iconBg}`}>
                      <Icon size={12} className={v.iconColor} />
                    </div>
                    <span className="font-black text-sm text-gray-900">{v.label}</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-3">{v.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA band */}
      <div className="bg-[#003580] py-14">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-blue-300 text-xs font-bold tracking-widest uppercase mb-3">NEED ASSISTANCE?</div>
          <h2 className="text-3xl font-black text-white mb-3">Get The Answers You Need</h2>
          <p className="text-blue-100 text-sm mb-2">When you need them.</p>
          <p className="text-blue-200 text-sm mb-8 max-w-xl">
            If you have a question—call this number to connect to one of our team members with support, replacement parts, and more.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="tel:800-621-9959"
              className="flex items-center gap-2 bg-white text-[#003580] font-bold px-6 py-2.5 rounded text-sm hover:bg-blue-50 transition-all"
            >
              <Phone size={14} /> Call 800-621-9959
            </a>
            <button className="flex items-center gap-2 border border-white/40 text-white font-bold px-6 py-2.5 rounded text-sm hover:bg-white/10 transition-all">
              <Mail size={14} /> Message Us
            </button>
          </div>
        </div>
      </div>

      <PrototypeFooter />
    </div>
  );
}