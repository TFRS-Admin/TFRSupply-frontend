import React, { useState } from 'react';
import { NAVIGATOR_SKUS, NAVIGATOR_UPSELLS } from '@/data/navigatorData';
import { CheckCircle, AlertTriangle, ExternalLink, PlayCircle } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Features' },
  { id: 'specs', label: 'Specifications' },
  { id: 'choose', label: 'SKU Specifications' },
  { id: 'accessories', label: 'Accessories & Parts' },
  { id: 'installation', label: 'Documentation' },
  { id: 'media', label: 'Videos' },
];

// ── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <h3 className="text-base font-black text-gray-900 mb-3">Features</h3>
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <div>
            <div className="font-bold text-gray-900 mb-1">Command-Grade Construction</div>
            <p>The Navigator Series is engineered for full-time duty in police patrol vehicles. Aluminum extrusion chassis, powder-coated finish, and sealed wiring harness connectors are designed to withstand continuous vehicle vibration and temperature cycles.</p>
          </div>
          <div>
            <div className="font-bold text-gray-900 mb-1">Three Platform Sizes</div>
            <p>Available in 14", 18", and 22" lengths to match sedan, standard SUV, and large-platform patrol vehicles. Each platform ships as a fully configured, ready-to-install console unit — no custom fabrication required.</p>
          </div>
          <div>
            <div className="font-bold text-gray-900 mb-1">Control Method Options</div>
            <p>Hardwired, Push-Button Controller, and Touchscreen Controller variants are stocked as individual configured SKUs. The control method is part of the base unit — not a field-configured option.</p>
          </div>
          <div>
            <div className="font-bold text-gray-900 mb-1">Vehicle-Specific Mount Kits</div>
            <p>Dedicated bracket and hardware sets are available for Ford PIU, Chevrolet Tahoe PPV, and Dodge Durango Pursuit platforms. Universal mount kits available for all other vehicles.</p>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-base font-black text-gray-900 mb-3">Applications</h3>
        <ul className="space-y-2 text-sm text-gray-600">
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

        <h3 className="text-base font-black text-gray-900 mt-6 mb-3">Compatible Vehicle Platforms</h3>
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
            <div key={i} className="text-xs bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-600">{v}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SKU Specifications — Fed Sig exact data table layout ─────────────────────
const SKU_SPEC_COLUMNS = [
  { key: 'sku',          label: 'SKU',                      mono: true },
  { key: 'opCurrent',    label: 'Operating Current',        },
  { key: 'maxCurrent',   label: 'Max Current',              },
  { key: 'standbyCurrent', label: 'Standby Current',        },
  { key: 'inputVoltage', label: 'Input Voltage',            },
  { key: 'opTemp',       label: 'Operating Temperature',    },
  { key: 'flashPatterns',label: 'Number of Flash Patterns', },
  { key: 'ledCount',     label: 'LED Count',                },
  { key: 'ledColors',    label: 'LED Colors',               },
  { key: 'domeColors',   label: 'Dome Colors',              },
  { key: 'harnessType',  label: 'Harness / Connection Type',},
  { key: 'harnessLen',   label: 'Harness Length',           },
  { key: 'mount',        label: 'Mount',                    },
  { key: 'approvals',    label: 'Approvals',                },
  { key: 'colorOption',  label: 'Color Option',             },
  { key: 'length',       label: 'Length',                   },
  { key: 'width',        label: 'Width',                    },
  { key: 'height',       label: 'Height',                   },
  { key: 'shipWeight',   label: 'Ship Weight (lb)',         },
];

const SKU_SPEC_ROWS = [
  {
    sku: 'NAV-14-HW-BLK',   opCurrent: '3.5 A',  maxCurrent: '6.0 A',  standbyCurrent: '0.2 A',
    inputVoltage: '12 Vdc (10–16 V)',  opTemp: '-40° to +176°F (-40° to +80°C)',
    flashPatterns: '30',  ledCount: '96',  ledColors: 'Red, Blue, White',
    domeColors: 'Clear',  harnessType: 'Weatherpack sealed',  harnessLen: '18"',
    mount: 'Vehicle-specific bracket',  approvals: 'SAE J845, CCR Title 13',
    colorOption: 'Black',  length: '14.0 in',  width: '12.4 in',  height: '4.4 in',  shipWeight: '8.2',
  },
  {
    sku: 'NAV-14-HW-SLV',   opCurrent: '3.5 A',  maxCurrent: '6.0 A',  standbyCurrent: '0.2 A',
    inputVoltage: '12 Vdc (10–16 V)',  opTemp: '-40° to +176°F (-40° to +80°C)',
    flashPatterns: '30',  ledCount: '96',  ledColors: 'Red, Blue, White',
    domeColors: 'Clear',  harnessType: 'Weatherpack sealed',  harnessLen: '18"',
    mount: 'Vehicle-specific bracket',  approvals: 'SAE J845, CCR Title 13',
    colorOption: 'Silver',  length: '14.0 in',  width: '12.4 in',  height: '4.4 in',  shipWeight: '8.2',
  },
  {
    sku: 'NAV-14-CTL-BLK',  opCurrent: '4.0 A',  maxCurrent: '6.5 A',  standbyCurrent: '0.3 A',
    inputVoltage: '12 Vdc (10–16 V)',  opTemp: '-40° to +176°F (-40° to +80°C)',
    flashPatterns: '30',  ledCount: '96',  ledColors: 'Red, Blue, White',
    domeColors: 'Clear',  harnessType: 'Weatherpack sealed + controller pigtail',  harnessLen: '18"',
    mount: 'Vehicle-specific bracket',  approvals: 'SAE J845, CCR Title 13',
    colorOption: 'Black',  length: '14.0 in',  width: '12.4 in',  height: '4.4 in',  shipWeight: '9.0',
  },
  {
    sku: 'NAV-18-HW-BLK',   opCurrent: '5.0 A',  maxCurrent: '8.5 A',  standbyCurrent: '0.2 A',
    inputVoltage: '12 Vdc (10–16 V)',  opTemp: '-40° to +176°F (-40° to +80°C)',
    flashPatterns: '30',  ledCount: '144',  ledColors: 'Red, Blue, White, Amber',
    domeColors: 'Clear',  harnessType: 'Weatherpack sealed',  harnessLen: '23"',
    mount: 'Vehicle-specific bracket',  approvals: 'SAE J845, CCR Title 13, KKK-A-1822F',
    colorOption: 'Black',  length: '18.0 in',  width: '12.4 in',  height: '4.4 in',  shipWeight: '11.4',
  },
  {
    sku: 'NAV-18-HW-SLV',   opCurrent: '5.0 A',  maxCurrent: '8.5 A',  standbyCurrent: '0.2 A',
    inputVoltage: '12 Vdc (10–16 V)',  opTemp: '-40° to +176°F (-40° to +80°C)',
    flashPatterns: '30',  ledCount: '144',  ledColors: 'Red, Blue, White, Amber',
    domeColors: 'Clear',  harnessType: 'Weatherpack sealed',  harnessLen: '23"',
    mount: 'Vehicle-specific bracket',  approvals: 'SAE J845, CCR Title 13, KKK-A-1822F',
    colorOption: 'Silver',  length: '18.0 in',  width: '12.4 in',  height: '4.4 in',  shipWeight: '11.4',
  },
  {
    sku: 'NAV-18-CTL-BLK',  opCurrent: '5.5 A',  maxCurrent: '9.0 A',  standbyCurrent: '0.3 A',
    inputVoltage: '12 Vdc (10–16 V)',  opTemp: '-40° to +176°F (-40° to +80°C)',
    flashPatterns: '30',  ledCount: '144',  ledColors: 'Red, Blue, White, Amber',
    domeColors: 'Clear',  harnessType: 'Weatherpack sealed + controller pigtail',  harnessLen: '23"',
    mount: 'Vehicle-specific bracket',  approvals: 'SAE J845, CCR Title 13, KKK-A-1822F',
    colorOption: 'Black',  length: '18.0 in',  width: '12.4 in',  height: '4.4 in',  shipWeight: '12.2',
  },
  {
    sku: 'NAV-18-TCH-BLK',  opCurrent: '6.0 A',  maxCurrent: '10.0 A', standbyCurrent: '0.5 A',
    inputVoltage: '12 Vdc (10–16 V)',  opTemp: '-40° to +176°F (-40° to +80°C)',
    flashPatterns: '30',  ledCount: '144',  ledColors: 'Red, Blue, White, Amber',
    domeColors: 'Clear',  harnessType: 'Weatherpack sealed + touchscreen harness',  harnessLen: '23"',
    mount: 'Vehicle-specific bracket',  approvals: 'SAE J845, CCR Title 13, KKK-A-1822F',
    colorOption: 'Black',  length: '18.0 in',  width: '12.4 in',  height: '4.4 in',  shipWeight: '13.5',
  },
  {
    sku: 'NAV-22-HW-BLK',   opCurrent: '6.5 A',  maxCurrent: '11.0 A', standbyCurrent: '0.2 A',
    inputVoltage: '12 Vdc (10–16 V)',  opTemp: '-40° to +176°F (-40° to +80°C)',
    flashPatterns: '30',  ledCount: '192',  ledColors: 'Red, Blue, White, Amber, Green',
    domeColors: 'Clear',  harnessType: 'Weatherpack sealed',  harnessLen: '23"',
    mount: 'Vehicle-specific bracket',  approvals: 'SAE J845, CCR Title 13, KKK-A-1822F',
    colorOption: 'Black',  length: '22.0 in',  width: '12.4 in',  height: '4.4 in',  shipWeight: '14.8',
  },
  {
    sku: 'NAV-22-CTL-BLK',  opCurrent: '7.0 A',  maxCurrent: '11.5 A', standbyCurrent: '0.3 A',
    inputVoltage: '12 Vdc (10–16 V)',  opTemp: '-40° to +176°F (-40° to +80°C)',
    flashPatterns: '30',  ledCount: '192',  ledColors: 'Red, Blue, White, Amber, Green',
    domeColors: 'Clear',  harnessType: 'Weatherpack sealed + controller pigtail',  harnessLen: '23"',
    mount: 'Vehicle-specific bracket',  approvals: 'SAE J845, CCR Title 13, KKK-A-1822F',
    colorOption: 'Black',  length: '22.0 in',  width: '12.4 in',  height: '4.4 in',  shipWeight: '15.6',
  },
  {
    sku: 'NAV-22-TCH-BLK',  opCurrent: '7.5 A',  maxCurrent: '12.5 A', standbyCurrent: '0.5 A',
    inputVoltage: '12 Vdc (10–16 V)',  opTemp: '-40° to +176°F (-40° to +80°C)',
    flashPatterns: '30',  ledCount: '192',  ledColors: 'Red, Blue, White, Amber, Green',
    domeColors: 'Clear',  harnessType: 'Weatherpack sealed + touchscreen harness',  harnessLen: '23"',
    mount: 'Vehicle-specific bracket',  approvals: 'SAE J845, CCR Title 13, KKK-A-1822F',
    colorOption: 'Black',  length: '22.0 in',  width: '12.4 in',  height: '4.4 in',  shipWeight: '17.1',
  },
];

function ChooseModelTab() {
  return (
    <div>
      <p style={{ fontFamily: "'Roboto','Inter',sans-serif", fontSize: 13, color: '#555', marginBottom: 16 }}>
        All Navigator Series SKUs share the same platform. Specifications apply to the configured model unless otherwise noted.
      </p>
      <div className="overflow-x-auto" style={{ border: '1px solid #d8d8d8' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Roboto','Inter',sans-serif", fontSize: 12, minWidth: 1400 }}>
          <thead>
            <tr>
              {SKU_SPEC_COLUMNS.map((col, i) => (
                <th
                  key={col.key}
                  style={{
                    background: '#1a1a1a',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '10px 12px',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    borderRight: i < SKU_SPEC_COLUMNS.length - 1 ? '1px solid #333' : 'none',
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SKU_SPEC_ROWS.map((row, ri) => (
              <tr
                key={row.sku}
                style={{ background: ri % 2 === 0 ? '#ffffff' : '#f7f7f7' }}
                onMouseEnter={e => e.currentTarget.style.background = '#eef3fb'}
                onMouseLeave={e => e.currentTarget.style.background = ri % 2 === 0 ? '#ffffff' : '#f7f7f7'}
              >
                {SKU_SPEC_COLUMNS.map((col, ci) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '8px 12px',
                      color: col.mono ? '#c8102e' : col.key === 'sku' ? '#c8102e' : '#3d3d3d',
                      fontFamily: col.mono ? "'JetBrains Mono', monospace" : "'Roboto','Inter',sans-serif",
                      fontWeight: col.mono ? 600 : 400,
                      borderBottom: '1px solid #e8e8e8',
                      borderRight: ci < SKU_SPEC_COLUMNS.length - 1 ? '1px solid #ececec' : 'none',
                      whiteSpace: col.key === 'approvals' || col.key === 'opTemp' ? 'normal' : 'nowrap',
                      verticalAlign: 'top',
                      lineHeight: 1.45,
                    }}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontFamily: "'Roboto','Inter',sans-serif", fontSize: 11, color: '#888', marginTop: 10 }}>
        * Prototype data — for reference only. Contact TFR Supply to confirm specifications before ordering.
      </p>
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
          <div key={i} className="flex gap-4 bg-gray-50 border border-gray-200 rounded px-4 py-3">
            <span className="text-gray-500 text-xs font-bold w-44 shrink-0">{s.label}</span>
            <span className="text-gray-800 text-xs">{s.value}</span>
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
    <div className="space-y-8">
      {cats.map((cat, ci) => (
        <div key={ci}>
          <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">{cat.category}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-gray-600 font-bold uppercase tracking-widest py-2.5 px-3">SKU</th>
                  <th className="text-left text-gray-600 font-bold uppercase tracking-widest py-2.5 px-3">Description</th>
                  <th className="text-left text-gray-600 font-bold uppercase tracking-widest py-2.5 px-3">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cat.items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-mono text-[#003DA5] font-semibold">{item.sku}</td>
                    <td className="py-2.5 px-3 text-gray-700">{item.description}</td>
                    <td className="py-2.5 px-3 text-gray-900 font-semibold">${item.price}</td>
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
        <div key={i} className="flex items-start gap-4 bg-gray-50 border border-gray-200 rounded px-4 py-3">
          <div className="shrink-0 mt-0.5">
            {n.status === 'confirmed'
              ? <CheckCircle size={14} className="text-green-600" />
              : n.status === 'verify'
                ? <AlertTriangle size={14} className="text-amber-500" />
                : <div className="w-3.5 h-3.5 rounded-full bg-gray-300" />}
          </div>
          <div>
            <div className="font-bold text-sm text-gray-900 mb-0.5">{n.vehicle}</div>
            <div className="text-[10px] font-mono text-gray-500 mb-1">Mount Kit: {n.kit}</div>
            <p className="text-xs text-gray-600">{n.notes}</p>
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
        <h3 className="text-sm font-bold text-gray-900 mb-4">Videos</h3>
        <div className="space-y-3">
          {[
            { title: 'Navigator Light Bar', thumb: 'https://worktruck.fedsig.com/file/general/1128420606.jpeg' },
            { title: 'Navigator 10" Light Bar Flash Patterns', thumb: 'https://worktruck.fedsig.com/file/general/545631446.jpeg' },
          ].map((v, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded p-3 cursor-pointer hover:bg-gray-100 transition-all">
              <div className="relative shrink-0 w-20 h-12 rounded overflow-hidden bg-gray-200">
                <img src={v.thumb} alt={v.title} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <PlayCircle size={18} className="text-white" />
                </div>
              </div>
              <span className="text-xs text-gray-800 font-semibold leading-tight">{v.title}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-4">Documents</h3>
        <div className="space-y-2">
          {docs.map((d, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded px-4 py-3 cursor-pointer hover:bg-gray-100 transition-all">
              <div className="w-8 h-8 bg-red-50 border border-red-200 rounded flex items-center justify-center shrink-0">
                <span className="text-[9px] font-black text-red-600">{d.type}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-800 font-semibold truncate">{d.label}</div>
                <div className="text-[10px] text-gray-500">{d.size}</div>
              </div>
              <ExternalLink size={13} className="text-gray-400 shrink-0" />
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
      case 'features': return <OverviewTab />;
      case 'specs': return <SkuSpecsTab />;
      case 'choose': return <ChooseModelTab />;
      case 'accessories': return <AccessoriesTab />;
      case 'installation': return <InstallationTab />;
      case 'media': return <MediaTab />;
      default: return null;
    }
  };

  return (
    <div>
      {/* Tab bar — Fed Sig style: light bg, red underline active */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-4 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#CC0000] text-[#CC0000]'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content — light bg */}
      <div className="py-8 text-gray-700">
        {renderContent()}
      </div>
    </div>
  );
}