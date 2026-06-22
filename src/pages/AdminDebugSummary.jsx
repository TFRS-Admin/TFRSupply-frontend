import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, AlertTriangle, CheckCircle, XCircle, ChevronRight, Map, GitBranch, Database, Bug } from 'lucide-react';
import { FAMILIES, VEHICLES, CORE_OPTIONS, DEPENDENCIES, RULES_DEBUG, DATA_GAPS } from '@/data/sampleData';
import PrototypeBanner from '@/components/PrototypeBanner';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';

const FAMILY_IDS = ['navigator', 'pathfinder', 'pathway', 'duraforce'];

const severityConfig = {
  critical: { color: 'bg-red-900/50 text-red-300 border-red-700/50', dot: 'bg-red-400' },
  high: { color: 'bg-orange-900/50 text-orange-300 border-orange-700/50', dot: 'bg-orange-400' },
  medium: { color: 'bg-amber-900/50 text-amber-300 border-amber-700/50', dot: 'bg-amber-400' },
  low: { color: 'bg-gray-800 text-gray-400 border-gray-700', dot: 'bg-gray-500' },
};

export default function AdminDebugSummary() {
  const navigate = useNavigate();
  const [activeFamily, setActiveFamily] = useState('navigator');
  const [activeTab, setActiveTab] = useState('routing');

  const tabs = [
    { id: 'routing', label: 'Family Routing', icon: Map },
    { id: 'steps', label: 'Rendered Steps', icon: GitBranch },
    { id: 'deps', label: 'Dependency Examples', icon: Database },
    { id: 'gaps', label: 'Data Gaps & Rules', icon: AlertTriangle },
  ];

  const family = FAMILIES[activeFamily];
  const rules = RULES_DEBUG[activeFamily] || [];
  const deps = DEPENDENCIES[activeFamily] || {};
  const vehicles = VEHICLES[activeFamily] || [];
  const options = CORE_OPTIONS[activeFamily] || {};

  const allDeps = [
    ...(deps.always || []),
    ...Object.values(deps.byVehicle || {}).flat(),
  ];
  const confirmedCount = allDeps.filter(d => d.status === 'confirmed').length;
  const verifyCount = allDeps.filter(d => d.status === 'needs_verification').length;

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <PrototypeBanner />

      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> Home
          </button>
          <span className="text-gray-700">/</span>
          <span className="flex items-center gap-2 text-gray-300 text-sm">
            <Bug size={14} className="text-green-400" /> Admin / Debug Summary
          </span>
        </div>
        <div className="text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-full">PROTOTYPE INTERNAL</div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2">Prototype Admin & Debug Summary</h1>
          <p className="text-gray-500 text-sm max-w-2xl">
            This screen is visible to internal TFR Supply and developer users. It shows family routing, rendered configurator steps, dependency logic, and all data gaps that require Manus or developer resolution before production.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {FAMILY_IDS.map(id => {
            const f = FAMILIES[id];
            const fDeps = DEPENDENCIES[id] || {};
            const fAll = [...(fDeps.always || []), ...Object.values(fDeps.byVehicle || {}).flat()];
            const fVerify = fAll.filter(d => d.status === 'needs_verification').length;
            return (
              <div
                key={id}
                onClick={() => setActiveFamily(id)}
                className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${
                  activeFamily === id ? 'border-blue-500 bg-blue-600/10' : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                }`}
              >
                <div className="font-bold text-white mb-1">{f.name}</div>
                <div className="text-xs text-gray-500 mb-3">{f.baseSkuPrefix}-*</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{VEHICLES[id].length} vehicles</span>
                  {fVerify > 0 && (
                    <span className="flex items-center gap-1 text-amber-400"><AlertTriangle size={10} /> {fVerify}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-8 gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'routing' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Family Routing Map — {family.name}</h2>
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 flex-wrap text-sm">
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl px-4 py-2 font-bold">Police Landing <span className="text-gray-500 font-normal text-xs ml-1">/</span></div>
                <ChevronRight size={16} className="text-gray-600" />
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl px-4 py-2 font-bold">{family.name} Family Page <span className="text-gray-500 font-normal text-xs ml-1">/family/{activeFamily}</span></div>
                <ChevronRight size={16} className="text-gray-600" />
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl px-4 py-2 font-bold">Configurator <span className="text-gray-500 font-normal text-xs ml-1">/configure/{activeFamily}/step/0</span></div>
                <ChevronRight size={16} className="text-gray-600" />
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl px-4 py-2 font-bold">Build Review <span className="text-gray-500 font-normal text-xs ml-1">/configure/{activeFamily}/review</span></div>
                <ChevronRight size={16} className="text-gray-600" />
                <div className="bg-emerald-600/20 border border-emerald-500/30 rounded-xl px-4 py-2 font-bold">Quote / Cart <span className="text-gray-500 font-normal text-xs ml-1">/configure/{activeFamily}/checkout</span></div>
              </div>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-black/20 rounded-xl p-3">
                  <div className="text-gray-500 mb-1">Vehicles mapped</div>
                  <div className="text-white font-bold text-lg">{VEHICLES[activeFamily].length}</div>
                </div>
                <div className="bg-black/20 rounded-xl p-3">
                  <div className="text-gray-500 mb-1">Core options</div>
                  <div className="text-white font-bold text-lg">{options.options?.length || 0}</div>
                </div>
                <div className="bg-black/20 rounded-xl p-3">
                  <div className="text-gray-500 mb-1">Dep rules</div>
                  <div className="text-white font-bold text-lg">{rules.length}</div>
                </div>
                <div className="bg-black/20 rounded-xl p-3">
                  <div className="text-gray-500 mb-1">Confirmed deps</div>
                  <div className="text-green-400 font-bold text-lg">{confirmedCount}</div>
                </div>
                <div className="bg-black/20 rounded-xl p-3">
                  <div className="text-gray-500 mb-1">Needs verification</div>
                  <div className="text-amber-400 font-bold text-lg">{verifyCount}</div>
                </div>
                <div className="bg-black/20 rounded-xl p-3">
                  <div className="text-gray-500 mb-1">SKU prefix</div>
                  <div className="text-white font-bold font-mono text-lg">{family.baseSkuPrefix}-*</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'steps' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Rendered Steps — {family.name}</h2>
            <div className="space-y-4">
              {['Vehicle Selection', 'Core Options', 'Accessories', 'Dependencies', 'Review & Checkout'].map((step, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-400 text-xs font-bold flex items-center justify-center">{i + 1}</div>
                    <span className="font-bold">{step}</span>
                  </div>
                  {i === 0 && (
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Fields: Year (dropdown) → Make (dropdown) → Model (dropdown) → Trim (dropdown)</div>
                      <div>Vehicles in sample data: {vehicles.map(v => `${v.year} ${v.make} ${v.model}`).join(', ')}</div>
                      <div className="text-blue-400">On selection: resolves vehicle-specific dependency tree</div>
                    </div>
                  )}
                  {i === 1 && (
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Label: {options.label}</div>
                      <div>Options: {options.options?.map(o => `${o.label} (${o.sku})`).join(', ')}</div>
                      <div className="text-blue-400">Selection state: border highlight, checkmark, price display</div>
                    </div>
                  )}
                  {i === 2 && (
                    <div className="text-xs text-gray-500">
                      Auto-added items are pre-checked and cannot be unchecked. Verification-flagged items show amber badge and reason text.
                    </div>
                  )}
                  {i === 3 && (
                    <div className="text-xs text-gray-500">
                      Confirmed items: green check panel. Needs-Verification items: amber panel with pulsing badge and reason text. Both groups show SKU + price.
                    </div>
                  )}
                  {i === 4 && (
                    <div className="text-xs text-gray-500">
                      Full build summary with SKU outcome string, total price, verification callout. Two CTAs: Request Quote (form) and Add to Cart (mock Shopify UI).
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'deps' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Dependency Behavior Examples — {family.name}</h2>
            <div className="space-y-3">
              {rules.map((r, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 font-mono text-xs">
                  <div className="text-green-300 mb-2">{r.rule}</div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold ${r.confidence === 'high' ? 'text-green-400' : r.confidence === 'medium' ? 'text-amber-400' : 'text-red-400'}`}>
                      confidence: {r.confidence}
                    </span>
                    <span className="text-gray-600">source: {r.source}</span>
                    {r.verificationNeeded && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <AlertTriangle size={10} /> NEEDS VERIFICATION
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-bold mb-3 text-gray-300">All Resolved Dependencies</h3>
              <div className="space-y-2">
                {[...(deps.always || []), ...Object.values(deps.byVehicle || {}).flat()].map((d, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs bg-white/[0.02] rounded-xl px-4 py-2.5">
                    {d.status === 'confirmed'
                      ? <CheckCircle size={12} className="text-green-400 shrink-0" />
                      : <AlertTriangle size={12} className="text-amber-400 shrink-0" />}
                    <span className="font-mono text-gray-400">{d.sku}</span>
                    <span className="text-white">{d.label}</span>
                    <span className={`ml-auto font-bold ${d.status === 'confirmed' ? 'text-green-400' : 'text-amber-400'}`}>{d.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gaps' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Data Gaps & Rules Requiring Manus / Developer Implementation</h2>
            <p className="text-sm text-gray-500">
              The following items cannot be auto-resolved in the prototype. Each requires action from Manus or a developer before production deployment.
            </p>
            <div className="space-y-3">
              {DATA_GAPS.map((g, i) => {
                const sc = severityConfig[g.severity];
                return (
                  <div key={i} className={`border rounded-2xl p-5 ${sc.color}`}>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />
                        <span className="font-bold text-sm">{g.field}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{g.family}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${sc.color}`}>{g.severity}</span>
                      </div>
                    </div>
                    <p className="text-xs opacity-80 leading-relaxed">{g.note}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <DebugToggle />
      <DebugPanel />
    </div>
  );
}