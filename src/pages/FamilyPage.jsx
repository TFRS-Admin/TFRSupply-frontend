import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Layers, Shield, Cpu, Wrench } from 'lucide-react';
import { FAMILIES } from '@/data/sampleData';
import { useConfigurator } from '@/context/ConfiguratorContext';
import PrototypeBanner from '@/components/PrototypeBanner';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';
import PrototypeFooter from '@/components/PrototypeFooter';

const typeIcons = { bracket: Wrench, harness: Cpu, controller: Cpu, shroud: Layers, mount_kit: Shield };

const stepLabels = {
  navigator: ['Vehicle Selection', 'Console Style', 'Options & Accessories', 'Dependencies', 'Review'],
  pathfinder: ['Vehicle Selection', 'Platform Size', 'Options & Accessories', 'Dependencies', 'Review'],
  pathway: ['Vehicle Selection', 'Profile Style', 'Options & Accessories', 'Dependencies', 'Review'],
  duraforce: ['Vehicle Selection', 'Configuration', 'Options & Accessories', 'Dependencies', 'Review'],
};

export default function FamilyPage() {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useConfigurator();
  const family = FAMILIES[familyId];

  if (!family) return <div className="min-h-screen bg-[#0D1B2A] text-white flex items-center justify-center">Family not found</div>;

  const steps = stepLabels[familyId] || [];

  const handleStart = () => {
    dispatch({ type: 'SELECT_FAMILY', payload: familyId });
    dispatch({ type: 'SET_STEP', payload: 0 });
    navigate(`/configure/${familyId}/step/0`);
  };

  const badgeColors = {
    blue: 'bg-blue-600',
    green: 'bg-emerald-600',
    gray: 'bg-gray-600',
    red: 'bg-red-700',
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <PrototypeBanner />

      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/vertical/police')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} /> Police
        </button>
        <span className="text-gray-700">/</span>
        <span className="text-gray-300 text-sm">{family.name}</span>
      </nav>

      {/* Hero */}
      <div className="relative">
        <div className="h-72 overflow-hidden">
          <img src={family.image} alt={family.name} className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] via-[#0D1B2A]/60 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-10 max-w-5xl mx-auto">
          <span className={`inline-block text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full text-white mb-3 ${badgeColors[family.badgeColor]}`}>
            {family.badge}
          </span>
          <h1 className="text-5xl font-extrabold mb-2">{family.name}</h1>
          <p className="text-blue-200 text-lg">{family.tagline}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-3">About the {family.name} Series</h2>
            <p className="text-gray-400 leading-relaxed">{family.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Key Features</h2>
            <div className="grid grid-cols-2 gap-3">
              {family.features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.04] rounded-xl px-4 py-3 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-sm text-gray-300">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Configuration Steps</h2>
            <div className="space-y-2">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/[0.03] rounded-xl px-4 py-3 border border-white/10">
                  <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm text-gray-300">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right col — CTA card */}
        <div className="space-y-5">
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sticky top-6">
            <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Configure Your Build</div>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 rounded-full bg-blue-600/40 border border-blue-500/50 text-blue-400 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
                Select your vehicle year, make, and model
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 rounded-full bg-blue-600/40 border border-blue-500/50 text-blue-400 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
                Choose your core product configuration
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 rounded-full bg-blue-600/40 border border-blue-500/50 text-blue-400 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</div>
                Dependencies auto-resolved — review and confirm
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 rounded-full bg-blue-600/40 border border-blue-500/50 text-blue-400 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">4</div>
                Request a quote or add to cart
              </div>
            </div>
            <button
              onClick={handleStart}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              Configure Now
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <p className="text-[10px] text-gray-600 text-center mt-3">SKU prefix: {family.baseSkuPrefix}-*</p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-2">
              <Shield size={12} /> Dependencies Auto-Resolved
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Mount kits, brackets, harnesses, and vehicle-specific hardware are automatically resolved based on your vehicle selection. Items needing verification are flagged.
            </p>
          </div>
        </div>
      </div>

      <PrototypeFooter />
      <DebugToggle />
      <DebugPanel />
    </div>
  );
}