import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, ArrowLeft } from 'lucide-react';
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

      {/* Sticky header with vehicle selector */}
      <div className="sticky top-0 z-30 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
              <ArrowLeft size={15} /> All Verticals
            </button>
            <span className="text-gray-700">/</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                <Shield size={12} />
              </div>
              <span className="text-white font-semibold text-sm">Police</span>
            </div>
          </div>
          <VehicleSelector />
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-[#0D1B2A] to-[#0D1B2A]" />
        <div className="relative px-6 py-16 max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-3">Police & Law Enforcement</h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Select a product family below to find your exact SKU and complete your build.
          </p>
        </div>
      </div>

      {/* Family Grid */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-6">Product Families</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {families.map((family) => (
            <button
              key={family.id}
              onClick={() => handleSelectFamily(family.id)}
              className="group text-left bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-blue-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/30"
            >
              <div className="relative h-40 overflow-hidden">
                <img src={family.image} alt={family.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] via-[#0D1B2A]/30 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${badgeStyles[family.badgeColor]}`}>{family.badge}</span>
                </div>
                {family.id === 'navigator' && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-emerald-600 text-white">New Flow</span>
                  </div>
                )}
                <div className="absolute bottom-3 left-4">
                  <h2 className="text-xl font-extrabold">{family.name}</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-400 text-sm leading-relaxed mb-3">{family.tagline}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{family.baseSkuPrefix}-*</span>
                  <span className="flex items-center gap-1 text-blue-400 text-sm font-semibold group-hover:gap-2 transition-all">
                    {family.id === 'navigator' ? 'Find SKU' : 'Configure'} <ChevronRight size={16} />
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