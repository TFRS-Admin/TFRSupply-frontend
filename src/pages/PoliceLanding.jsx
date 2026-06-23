import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, ArrowLeft, Car, Search, Package, ArrowRight } from 'lucide-react';
import { FAMILIES } from '@/data/sampleData';
import { useConfigurator } from '@/context/ConfiguratorContext';
import PrototypeBanner from '@/components/PrototypeBanner';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';
import PrototypeFooter from '@/components/PrototypeFooter';
import VehicleSelector from '@/components/VehicleSelector';

const badgeStyles = {
  blue: 'bg-blue-600 text-white',
  green: 'bg-emerald-600 text-white',
  gray: 'bg-gray-600 text-white',
  red: 'bg-red-700 text-white',
};

export default function PoliceLanding() {
  const navigate = useNavigate();
  const { dispatch } = useConfigurator();

  const families = Object.values(FAMILIES);

  const handleSelectFamily = (familyId) => {
    dispatch({ type: 'SELECT_FAMILY', payload: familyId });
    if (familyId === 'navigator') {
      navigate('/family/navigator');
    } else {
      navigate(`/family/${familyId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <PrototypeBanner />

      {/* Sticky nav — matches homepage style */}
      <nav className="sticky top-0 z-40 bg-[#0D1B2A]/98 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          {/* Logo + breadcrumb */}
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield size={18} />
              </div>
              <div>
                <div className="font-black text-sm tracking-tight leading-none">TFR SUPPLY</div>
                <div className="text-[9px] text-gray-500 tracking-widest uppercase leading-none mt-0.5">Pro Shop</div>
              </div>
            </button>
            <span className="text-gray-700 hidden md:block">/</span>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                <Shield size={11} />
              </div>
              <span className="font-semibold text-sm text-white">Police & Law Enforcement</span>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-400">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">All Products</button>
            <button className="text-white font-semibold">Emergency Response</button>
            <button className="hover:text-white transition-colors opacity-40 cursor-not-allowed">Commercial</button>
          </div>

          {/* Vehicle selector */}
          <VehicleSelector />
        </div>
      </nav>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1600&q=80"
            alt="Police vehicles"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A] via-[#0D1B2A]/70 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-xs font-bold tracking-widest text-blue-400 uppercase mb-3">Emergency Response</div>
          <h1 className="text-5xl font-black mb-4">Police &<br />Law Enforcement</h1>
          <p className="text-gray-400 text-base max-w-lg mb-8 leading-relaxed">
            Select a product family below to find your exact SKU and complete your build. All configurations are specific to your platform.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Car size={13} className="text-blue-400" /> Select your vehicle above for fit-verified results
            </div>
          </div>
        </div>
      </div>

      {/* Product Family Grid */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Product Families</div>
            <h2 className="text-2xl font-black">Configure by Series.</h2>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={13} /> All Verticals
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {families.map((family) => (
            <button
              key={family.id}
              onClick={() => handleSelectFamily(family.id)}
              className="group text-left bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-blue-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={family.image}
                  alt={family.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-40 group-hover:opacity-55"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] via-[#0D1B2A]/30 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${badgeStyles[family.badgeColor]}`}>
                    {family.badge}
                  </span>
                </div>
                {family.id === 'navigator' && (
                  <div className="absolute top-4 right-4">
                    <span className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-emerald-600 text-white">
                      New Flow
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black text-white mb-2">{family.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{family.tagline}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-700">{family.baseSkuPrefix}-*</span>
                  <span className="flex items-center gap-1.5 text-blue-400 text-sm font-bold group-hover:gap-2.5 transition-all">
                    {family.id === 'navigator' ? 'Find Your SKU' : 'Configure'} <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <PrototypeFooter />
      <DebugToggle />
      <DebugPanel />
    </div>
  );
}