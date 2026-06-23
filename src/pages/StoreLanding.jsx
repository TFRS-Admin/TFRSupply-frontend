import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Flame, Truck, Package, ChevronRight } from 'lucide-react';
import PrototypeBanner from '@/components/PrototypeBanner';
import VehicleSelector from '@/components/VehicleSelector';

const VERTICALS = [
  {
    id: 'police',
    label: 'Police',
    subLabel: 'Law Enforcement',
    icon: Shield,
    color: 'blue',
    description: 'Patrol vehicles, marked and unmarked units, specialty tactical.',
    available: true,
  },
  {
    id: 'fire-ems',
    label: 'Fire / EMS',
    subLabel: 'Emergency Medical',
    icon: Flame,
    color: 'red',
    description: 'Apparatus, command vehicles, first responder units.',
    available: false,
  },
  {
    id: 'commercial',
    label: 'Commercial / Work Truck',
    subLabel: 'Fleet & Utility',
    icon: Truck,
    color: 'amber',
    description: 'Service fleets, utility vehicles, work truck upfitting.',
    available: false,
  },
  {
    id: 'tow',
    label: 'Tow & Recovery',
    subLabel: 'Towing',
    icon: Package,
    color: 'gray',
    description: 'Rollbacks, wreckers, flatbeds, and heavy recovery.',
    available: false,
  },
];

const colorMap = {
  blue: {
    border: 'border-blue-500/60 hover:border-blue-400',
    bg: 'bg-blue-600/10',
    icon: 'bg-blue-600/30 text-blue-400',
    badge: 'bg-blue-600 text-white',
    arrow: 'text-blue-400',
  },
  red: {
    border: 'border-white/10',
    bg: 'bg-white/[0.02]',
    icon: 'bg-red-900/30 text-red-400',
    badge: '',
    arrow: 'text-gray-600',
  },
  amber: {
    border: 'border-white/10',
    bg: 'bg-white/[0.02]',
    icon: 'bg-amber-900/30 text-amber-400',
    badge: '',
    arrow: 'text-gray-600',
  },
  gray: {
    border: 'border-white/10',
    bg: 'bg-white/[0.02]',
    icon: 'bg-gray-800 text-gray-400',
    badge: '',
    arrow: 'text-gray-600',
  },
};

export default function StoreLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <PrototypeBanner />

      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight">TFR Supply</span>
        </div>
        <span className="text-xs text-gray-500 uppercase tracking-widest font-mono">Product Configurator</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-extrabold mb-3">What are you outfitting?</h1>
        <p className="text-gray-500 text-base mb-10">Select your vehicle category to browse products built for your application.</p>

        {/* Optional persistent vehicle pre-select */}
        <div className="mb-10">
          <VehicleSelector compact />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {VERTICALS.map(v => {
            const Icon = v.icon;
            const c = colorMap[v.color];
            return (
              <button
                key={v.id}
                onClick={() => v.available && navigate(`/vertical/${v.id}`)}
                disabled={!v.available}
                className={`group relative rounded-2xl border-2 p-6 transition-all duration-200 text-left ${
                  v.available
                    ? `${c.border} ${c.bg} cursor-pointer hover:shadow-xl hover:shadow-blue-900/20`
                    : 'border-white/[0.06] bg-white/[0.01] cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
                    <Icon size={20} />
                  </div>
                  {v.available
                    ? <span className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-blue-600 text-white">Available</span>
                    : <span className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-gray-800 text-gray-600">Coming Soon</span>
                  }
                </div>
                <div className="font-extrabold text-lg mb-0.5">{v.label}</div>
                <div className="text-xs text-gray-500 mb-3 font-medium">{v.subLabel}</div>
                <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
                {v.available && (
                  <div className={`flex items-center gap-1 mt-4 text-sm font-semibold ${c.arrow} group-hover:gap-2 transition-all`}>
                    Browse products <ChevronRight size={15} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}