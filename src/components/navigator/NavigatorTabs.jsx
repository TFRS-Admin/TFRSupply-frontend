import React, { useState } from 'react';
import { NAVIGATOR_SKUS, NAVIGATOR_UPSELLS } from '@/data/navigatorData';
import { CheckCircle, AlertTriangle, ExternalLink, PlayCircle } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'choose', label: 'Choose Model' },
  { id: 'specs', label: 'SKU Specifications' },
  { id: 'accessories', label: 'Compatible Accessories' },
  { id: 'installation', label: 'Installation & Fitment' },
  { id: 'media', label: 'Videos & Documents' },
];

// ── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <h3 className="text-base font-black text-white mb-3">Features</h3>
        <div className="space-y-4 text-sm text-gray-400 leading-relaxed">
          <div>
            <div className="font-bold text-white mb-1">Command-Grade Construction</div>
            <p>The Navigator Series is engineered for full-time duty in police patrol vehicles. Aluminum extrusion chassis, powder-coated finish, and sealed wiring harness connectors are designed to withstand continuous vehicle vibration and temperature cycles.</p>
          </div>
          <div>
            <div className="font-bold text-white mb-1">Three Platform Sizes</div>
            <p>Available in 14", 18", and 22" lengths to match sedan, standard SUV, and large-platform patrol vehicles. Each platform ships as a fully configured, ready-to-install console unit — no custom fabrication required.</p>
          </div>
          <div>
            <div className="font-bold text-white mb-1">Control Method Options</div>
            <p>Hardwired, Push-Button Controller, and Touchscreen Controller variants are stocked as individual configured SKUs. The control method is part of the base unit — not a field-configured option.</p>
          </div>
          <div>
            <div className="font-bold text-white mb-1">Vehicle-Specific Mount Kits</div>
            <p>Dedicated bracket and hardware sets are available for Ford PIU, Chevrolet Tahoe PPV, and Dodge Durango Pursuit platforms. Universal mount kits available for all other vehicles.</p>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-base font-black text-white mb-3">Applications</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          {[
            'Municipal police patrol — sedan and SUV platforms',
            'Sheriff patrol — large-platform SUV and Tahoe PPV',
            'State highway patrol — full-size SUV',
            'Campus and transit police — mid-size platforms',
            'Corrections fleet — specialized interceptor builds',
          ].map((a, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle size={13} className="text-blue-500 shrink-0 mt-0.5" />
              <span>{a}</span>
            </li>
          ))}
        </ul>

        <h3 className="text-base font-black text-white mt-6 mb-3">Compatible Vehicle Platforms</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            'Ford Police Interceptor Utility',
            'Chevrolet Tahoe PPV',
            'Dodge Durango Pursuit',
            'Chevrolet Suburban PPV',
            'Ford Expedition SSV',
            'Dodge Charger',
            'Ford Police Interceptor Sedan',
            'Toyota Camry Patrol',
          ].map((v, i) => (
            <div key={i} className="text-xs bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-gray-400">{v}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Choose Model (simplified reference table) ─────────────────────────────────
function ChooseModelTab() {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-5">All Navigator models are existing configured units. Use the selector panel on this page to choose your model and complete your build.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-500 font-bold uppercase tracking-widest py-2 pr-4">SKU</th>
              <th className="text-left text-gray-500 font-bold uppercase tracking-widest py-2 pr-4">Length</th>
              <th className="text-left text-gray-500 font-bold uppercase tracking-widest py-2 pr-4">Control</th>
              <th className="text-left text-gray-500 font-bold uppercase tracking-widest py-2 pr-4">Price</th>
              <th className="text-left text-gray-500 font-bold uppercase tracking-widest py-2">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {NAVIGATOR_SKUS.map(s => (
              <tr key={s.id} className="hover:bg-white/[0.02]">
                <td className="py-2.5 pr-4 font-mono text-blue-400">{s.sku}</td>
                <td className="py-2.5 pr-4 text-white">{s.length.replace('in', '"')}</td>
                <td className="py-2.5 pr-4 text-gray-300 capitalize">{s.control}</td>
                <td className="py-2.5 pr-4 text-white font-semibold">${s.price.toLocaleString()}</td>
                <td className="py-2.5 text-gray-500">{s.popular ? '⭐ Most Popular' : ''}{s.fits.length > 0 ? ` Fits: ${s.fits.slice(0, 2).join(', ')}${s.fits.length > 2 ? '...' : ''}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── SKU Specifications ────────────────────────────────────────────────────────
function SkuSpecsTab() {
  const specs = [
    { label: 'Chassis', value: 'Extruded aluminum, powder-coated' },
    { label: 'Finish Options', value: 'Black, Silver (14"/18" only)' },
    { label: 'Operating Voltage', value: '12V DC (10.5V – 16V)' },
    { label: 'Wiring Connector', value: 'Weatherpack sealed multi-pin' },
    { label: 'Mounting Pattern', value: 'Vehicle-specific brackets required (see mount kits)' },
    { label: 'Controller Interface', value: 'Integrated (controller SKUs), or hardwired (no controller)' },
    { label: 'Touchscreen', value: '7" capacitive (touchscreen SKUs only)' },
    { label: 'Warranty', value: '2-year limited' },
    { label: 'Country of Origin', value: 'USA' },
  ];
  return (
    <div>
      <p className="text-sm text-gray-500 mb-5">Specifications apply to all Navigator Series configured models unless noted.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {specs.map((s, i) => (
          <div key={i} className="flex gap-4 bg-white/[0.02] border border-white/[0.05] rounded-lg px-4 py-3">
            <span className="text-gray-600 text-xs font-bold w-40 shrink-0">{s.label}</span>
            <span className="text-white text-xs">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Compatible Accessories ────────────────────────────────────────────────────
function AccessoriesTab() {
  const cats = Object.values(NAVIGATOR_UPSELLS);
  return (
    <div className="space-y-6">
      {cats.map((cat, ci) => (
        <div key={ci}>
          <h3 className="text-sm font-black text-white mb-3">{cat.category}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-500 font-bold uppercase tracking-widest py-2 pr-4">SKU</th>
                  <th className="text-left text-gray-500 font-bold uppercase tracking-widest py-2 pr-4">Description</th>
                  <th className="text-left text-gray-500 font-bold uppercase tracking-widest py-2">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {cat.items.map(item => (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-4 font-mono text-blue-400">{item.sku}</td>
                    <td className="py-2.5 pr-4 text-gray-300">{item.description}</td>
                    <td className="py-2.5 text-white font-semibold">${item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Installation & Fitment ────────────────────────────────────────────────────
function InstallationTab() {
  const notes = [
    { vehicle: 'Ford Police Interceptor Utility (2019–2024)', kit: 'MNT-FORD-PIU', status: 'confirmed', notes: 'Direct-fit bracket set. No drilling required. 45-60 min installation.' },
    { vehicle: 'Chevrolet Tahoe PPV (2021–2024)', kit: 'MNT-CHEV-TAH', status: 'confirmed', notes: 'Console floor mount. Requires seat track spacers (included).' },
    { vehicle: 'Dodge Durango Pursuit (2020–2023)', kit: 'MNT-DODGE-DUR', status: 'verify', notes: 'Fitment confirmed for 2020–2022. Verify 2023 model year before ordering.' },
    { vehicle: 'Chevrolet Suburban PPV', kit: 'MNT-UNIV-STD', status: 'universal', notes: 'Use universal mount kit. Custom bracket fabrication may be needed.' },
    { vehicle: 'Ford Expedition SSV', kit: 'MNT-UNIV-STD', status: 'universal', notes: 'Use universal mount kit. Confirm floor console clearance.' },
    { vehicle: 'Dodge Charger (2015–2023)', kit: 'MNT-UNIV-STD', status: 'universal', notes: 'Use universal mount kit. 14" length recommended for sedan platforms.' },
  ];
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Fitment data is verified for listed model years. Contact TFR Supply for unlisted vehicles or years.</p>
      {notes.map((n, i) => (
        <div key={i} className="flex items-start gap-4 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
          <div className="shrink-0 mt-0.5">
            {n.status === 'confirmed'
              ? <CheckCircle size={14} className="text-green-400" />
              : n.status === 'verify'
                ? <AlertTriangle size={14} className="text-amber-400" />
                : <div className="w-3.5 h-3.5 rounded-full bg-gray-700" />}
          </div>
          <div>
            <div className="font-bold text-sm text-white mb-0.5">{n.vehicle}</div>
            <div className="text-[10px] font-mono text-gray-600 mb-1">Mount Kit: {n.kit}</div>
            <p className="text-xs text-gray-500">{n.notes}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Videos & Documents ────────────────────────────────────────────────────────
function MediaTab() {
  const docs = [
    { label: 'Navigator Series Product Sheet', type: 'PDF', size: '1.2 MB' },
    { label: 'Installation Guide — Navigator 18"', type: 'PDF', size: '3.8 MB' },
    { label: 'Wiring Diagram — Hardwired Models', type: 'PDF', size: '890 KB' },
    { label: 'Mount Kit Instructions — Ford PIU', type: 'PDF', size: '1.1 MB' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-sm font-black text-white mb-4">Videos</h3>
        <div className="space-y-3">
          {[
            { title: 'Navigator 18" Installation Walkthrough', thumb: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=60' },
            { title: 'Navigator vs. Pathfinder — Choosing the Right Console', thumb: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=60' },
          ].map((v, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 cursor-pointer hover:bg-white/[0.04] transition-all">
              <div className="relative shrink-0 w-20 h-12 rounded-lg overflow-hidden">
                <img src={v.thumb} alt={v.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <PlayCircle size={18} className="text-white" />
                </div>
              </div>
              <span className="text-xs text-white font-semibold leading-tight">{v.title}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-black text-white mb-4">Documents</h3>
        <div className="space-y-2">
          {docs.map((d, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 cursor-pointer hover:bg-white/[0.04] transition-all">
              <div className="w-8 h-8 bg-red-600/20 border border-red-600/30 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-[9px] font-black text-red-400">{d.type}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white font-semibold truncate">{d.label}</div>
                <div className="text-[10px] text-gray-600">{d.size}</div>
              </div>
              <ExternalLink size={13} className="text-gray-600 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Tabs Component ───────────────────────────────────────────────────────
export default function NavigatorTabs({ defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'choose': return <ChooseModelTab />;
      case 'specs': return <SkuSpecsTab />;
      case 'accessories': return <AccessoriesTab />;
      case 'installation': return <InstallationTab />;
      case 'media': return <MediaTab />;
      default: return null;
    }
  };

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-white/10 overflow-x-auto">
        <div className="flex min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3.5 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-600 hover:text-gray-400 hover:border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        {renderContent()}
      </div>
    </div>
  );
}