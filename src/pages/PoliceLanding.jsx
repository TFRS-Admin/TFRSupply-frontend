import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, ArrowRight, ChevronRight } from 'lucide-react';
import { FAMILIES } from '@/data/sampleData';
import { useConfigurator } from '@/context/ConfiguratorContext';
import PrototypeBanner from '@/components/PrototypeBanner';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';
import PrototypeFooter from '@/components/PrototypeFooter';
import VehicleSelector from '@/components/VehicleSelector';

// Sub-categories mimicking the Federal Signal "Light Bars" category page
const SUBCATEGORIES = [
  {
    id: 'navigator',
    label: 'Navigator® Serial Light Bar',
    img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80',
    skuPrefix: 'NAV-',
    isNew: true,
    configured: true,
  },
  {
    id: 'pathfinder',
    label: 'Pathfinder® Full-Size Light Bar',
    img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80',
    skuPrefix: 'PF-',
    isNew: false,
    configured: false,
  },
  {
    id: 'pathway',
    label: 'Pathway® Low-Profile Bar',
    img: 'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?w=600&q=80',
    skuPrefix: 'PW-',
    isNew: false,
    configured: false,
  },
  {
    id: 'duraforce',
    label: 'DuraForce™ Mini Light Bar',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    skuPrefix: 'DF-',
    isNew: false,
    configured: false,
  },
  {
    id: 'grille-lights',
    label: 'Perimeter & Grille Lights',
    img: 'https://images.unsplash.com/photo-1609752716955-b2b3fea4cac8?w=600&q=80',
    skuPrefix: 'GL-',
    isNew: false,
    configured: false,
  },
  {
    id: 'sirens',
    label: 'Sirens & Speakers',
    img: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80',
    skuPrefix: 'SRN-',
    isNew: false,
    configured: false,
  },
  {
    id: 'controllers',
    label: 'Controllers & Interfaces',
    img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=80',
    skuPrefix: 'CTL-',
    isNew: false,
    configured: false,
  },
  {
    id: 'obd',
    label: 'OBD Cables & Adapters',
    img: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600&q=80',
    skuPrefix: 'OBD-',
    isNew: false,
    configured: false,
  },
];

const NAV_TABS = ['Light Bars', 'Sirens & Speakers', 'Perimeter Lights', 'Specifications', 'Push Bumpers', 'Whelen Strike System', 'Compartment Lighting', 'Accessories'];

export default function PoliceLanding() {
  const navigate = useNavigate();
  const { dispatch } = useConfigurator();

  const handleSelectFamily = (id) => {
    dispatch({ type: 'SELECT_FAMILY', payload: id });
    if (id === 'navigator') {
      navigate('/family/navigator');
    } else {
      navigate(`/family/${id}`);
    }
  };

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
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo + breadcrumb */}
          <button onClick={() => navigate('/')} className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-[#003580] rounded flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <div className="font-black text-base tracking-tight leading-none text-[#003580]">TFR SUPPLY</div>
              <div className="text-[9px] text-gray-400 tracking-widest uppercase leading-none mt-0.5">Pro Shop</div>
            </div>
          </button>

          {/* Vertical tabs */}
          <div className="hidden md:flex items-center gap-1 text-sm font-semibold">
            {['Police', 'Fire/EMS', 'Work Truck', 'Emergency Beacon', 'Mass Notification'].map((label, i) => (
              <button
                key={label}
                className={`px-4 py-2 rounded transition-colors ${
                  i === 0
                    ? 'bg-[#003580] text-white'
                    : 'text-gray-500 hover:text-gray-900 opacity-50 cursor-not-allowed'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Vehicle selector */}
          <VehicleSelector />
        </div>

        {/* Category sub-nav */}
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-0 overflow-x-auto">
            {NAV_TABS.map((tab, i) => (
              <button
                key={tab}
                className={`text-xs font-semibold px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
                  i === 0
                    ? 'border-[#003580] text-[#003580]'
                    : 'border-transparent text-gray-500 hover:text-gray-800 opacity-50 cursor-not-allowed'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <button onClick={() => navigate('/')} className="hover:text-[#003580] transition-colors">Home</button>
          <ChevronRight size={12} />
          <span className="text-gray-600 font-medium">Police — Law Enforcement</span>
          <ChevronRight size={12} />
          <span className="text-gray-800 font-semibold">Light Bars</span>
        </div>
      </div>

      {/* Page header */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Police Vehicle Light Bars — Full Size, Low Profile &amp; Mini
        </h1>
        <p className="text-gray-500 text-sm max-w-2xl leading-relaxed">
          Our full suite of LED light bars are our top products, our products work with vehicles to provide efficient, ultra-wide vehicle emergency lights to control signals.
        </p>
      </div>

      {/* Product thumbnail grid */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {SUBCATEGORIES.map((sub) => (
            <button
              key={sub.id}
              onClick={sub.configured ? () => handleSelectFamily(sub.id) : undefined}
              className={`group text-left rounded-xl border transition-all duration-200 overflow-hidden ${
                sub.configured
                  ? 'border-gray-200 hover:border-[#003580] hover:shadow-md cursor-pointer bg-white'
                  : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="relative bg-gray-100 h-44 overflow-hidden">
                <img
                  src={sub.img}
                  alt={sub.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                {sub.isNew && (
                  <div className="absolute top-2 right-2">
                    <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">New Flow</span>
                  </div>
                )}
                {!sub.configured && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded border">Coming Soon</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="font-bold text-sm text-gray-900 leading-snug mb-1">{sub.label}</div>
                <div className="text-[10px] font-mono text-gray-400">{sub.skuPrefix}*</div>
                {sub.configured && (
                  <div className="mt-3 flex items-center gap-1 text-[#003580] text-xs font-bold group-hover:gap-2 transition-all">
                    Configure <ArrowRight size={12} />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* "Stay Safe" CTA band */}
      <div
        className="relative py-20 text-center text-white overflow-hidden"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-[#003580]/80" />
        <div className="relative">
          <h2 className="text-3xl font-black mb-2">Stay Safe and Secure</h2>
          <p className="text-blue-100 text-sm mb-6">With a partner you can trust to deliver dependable controls, discover more with us.</p>
          <button
            onClick={() => navigate('/family/navigator')}
            className="bg-white text-[#003580] font-bold px-8 py-3 rounded text-sm hover:bg-blue-50 transition-all"
          >
            Connect With Us →
          </button>
        </div>
      </div>

      <PrototypeFooter />
      <DebugToggle />
      <DebugPanel />
    </div>
  );
}