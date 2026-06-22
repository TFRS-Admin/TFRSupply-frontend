import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, Star, Zap, Lock } from 'lucide-react';
import { FAMILIES } from '@/data/sampleData';
import { useConfigurator } from '@/context/ConfiguratorContext';
import PrototypeBanner from '@/components/PrototypeBanner';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';
import PrototypeFooter from '@/components/PrototypeFooter';

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
    navigate(`/family/${familyId}`);
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <PrototypeBanner />

      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight">TFR Supply</span>
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-widest">Police / Law Enforcement</div>
      </nav>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-[#0D1B2A] to-[#0D1B2A]" />
        <div className="relative px-6 py-20 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
            <Shield size={12} />
            Police &amp; Law Enforcement Division
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Purpose-Built for the Job.
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            TFR Supply engineering for Law Enforcement patrol, tactical, and fleet vehicles. Select a product family below to configure your exact fitment.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><Zap size={14} className="text-blue-400" /> Vehicle-specific fitment</span>
            <span className="flex items-center gap-1.5"><Lock size={14} className="text-blue-400" /> Auto-resolved dependencies</span>
            <span className="flex items-center gap-1.5"><Star size={14} className="text-blue-400" /> Quote or direct order</span>
          </div>
        </div>
      </div>

      {/* Family Grid */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-6">
          Select a Product Family
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {families.map((family) => (
            <button
              key={family.id}
              onClick={() => handleSelectFamily(family.id)}
              className="group text-left bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-blue-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/30"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={family.image}
                  alt={family.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] via-[#0D1B2A]/30 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${badgeStyles[family.badgeColor]}`}>
                    {family.badge}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h2 className="text-2xl font-extrabold">{family.name}</h2>
                </div>
              </div>
              <div className="p-5">
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{family.tagline}</p>
                <ul className="space-y-1.5 mb-5">
                  {family.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1 h-1 rounded-full bg-blue-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">SKU Prefix: {family.baseSkuPrefix}-*</span>
                  <span className="flex items-center gap-1 text-blue-400 text-sm font-semibold group-hover:gap-2 transition-all">
                    Configure <ChevronRight size={16} />
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