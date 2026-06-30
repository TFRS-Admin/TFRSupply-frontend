import React, { useState } from 'react';
import { useConfigurator } from '@/context/ConfiguratorContext';
import { RULES_DEBUG, DATA_GAPS } from '@/data/sampleData';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Database } from 'lucide-react';

export default function DebugPanel() {
  const { debugMode, state } = useConfigurator();
  const [activeTab, setActiveTab] = useState('rules');
  const [open, setOpen] = useState(true);

  if (!debugMode) return null;

  const family = state.selectedFamily;
  const rules = family ? RULES_DEBUG[family] : null;
  const gaps = family
    ? DATA_GAPS.filter(g => g.family === family.charAt(0).toUpperCase() + family.slice(1) || g.family === 'All')
    : DATA_GAPS;

  const confidenceColor = (c) =>
    c === 'high' ? 'text-green-400' : c === 'medium' ? 'text-amber-400' : 'text-red-400';

  const severityColor = (s) =>
    s === 'critical' ? 'bg-red-900 text-red-300' :
    s === 'high' ? 'bg-orange-900 text-orange-300' :
    s === 'medium' ? 'bg-amber-900 text-amber-300' :
    'bg-gray-700 text-gray-300';

  return (
    <div className="fixed bottom-20 right-6 z-40 w-[420px] bg-gray-950 border border-green-400/30 rounded-xl shadow-2xl font-mono text-xs">
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-green-400/20 cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2 text-green-400">
          <Database size={14} />
          <span className="font-bold tracking-wider">DEBUG PANEL</span>
          {family && <span className="text-gray-500">— {family.toUpperCase()}</span>}
        </div>
        {open ? <ChevronDown size={14} className="text-green-400" /> : <ChevronUp size={14} className="text-green-400" />}
      </div>

      {open && (
        <>
          {/* State snapshot */}
          <div className="px-4 py-3 border-b border-green-400/10 bg-gray-900/50">
            <div className="text-gray-500 mb-1">CURRENT STATE</div>
            <div className="text-green-300 text-[10px] leading-relaxed">
              <div>family: <span className="text-white">{state.selectedFamily || 'none'}</span></div>
              <div>step: <span className="text-white">{state.currentStep}</span></div>
              <div>vehicle: <span className="text-white">{state.vehicle.year} {state.vehicle.make} {state.vehicle.model} {state.vehicle.trim}</span></div>
              <div>coreOption: <span className="text-white">{state.coreOption?.sku || 'none'}</span></div>
              <div>accessories: <span className="text-white">{state.accessories.map(a => a.sku).join(', ') || 'none'}</span></div>
              <div>dependencies: <span className="text-white">{state.resolvedDependencies.length} resolved</span></div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-green-400/20">
            {['rules', 'gaps', 'deps'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${
                  activeTab === tab ? 'text-green-400 bg-green-400/10' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab === 'rules' ? 'Rules' : tab === 'gaps' ? 'Data Gaps' : 'Resolved Deps'}
              </button>
            ))}
          </div>

          <div className="max-h-64 overflow-y-auto p-3 space-y-2">
            {activeTab === 'rules' && rules && rules.map((r, i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-2.5">
                <div className="text-gray-300 leading-relaxed mb-1">{r.rule}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`${confidenceColor(r.confidence)} font-bold`}>confidence: {r.confidence}</span>
                  <span className="text-gray-600">src: {r.source}</span>
                  {r.verificationNeeded && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <AlertTriangle size={10} /> needs verification
                    </span>
                  )}
                </div>
              </div>
            ))}
            {activeTab === 'rules' && !rules && (
              <div className="text-gray-500 text-center py-4">Select a product family to see rules</div>
            )}

            {activeTab === 'gaps' && gaps.map((g, i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${severityColor(g.severity)}`}>{g.severity}</span>
                  <span className="text-amber-300 font-bold">{g.family}</span>
                </div>
                <div className="text-gray-400 font-bold mb-0.5">{g.field}</div>
                <div className="text-gray-500 leading-relaxed">{g.note}</div>
              </div>
            ))}

            {activeTab === 'deps' && state.resolvedDependencies.length === 0 && (
              <div className="text-gray-500 text-center py-4">No dependencies resolved yet — complete vehicle selection</div>
            )}
            {activeTab === 'deps' && state.resolvedDependencies.map((d, i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  {d.status === 'confirmed'
                    ? <CheckCircle size={12} className="text-green-400" />
                    : <AlertTriangle size={12} className="text-amber-400" />}
                  <span className="text-white font-bold">{d.sku}</span>
                </div>
                <div className="text-gray-400">{d.label}</div>
                <div className="text-gray-600 mt-0.5">{d.reason}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}