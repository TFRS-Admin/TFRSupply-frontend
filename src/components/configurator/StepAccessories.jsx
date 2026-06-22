import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, Plus, Minus, Zap } from 'lucide-react';
import { ACCESSORIES } from '@/data/sampleData';
import { useConfigurator } from '@/context/ConfiguratorContext';

export default function StepAccessories({ familyId, onNext, onBack }) {
  const { state, dispatch } = useConfigurator();
  const items = ACCESSORIES[familyId] || [];

  // Pre-check auto-added accessories
  useEffect(() => {
    const autoAdded = items.filter(a => a.autoAdded);
    const currentIds = state.accessories.map(a => a.id);
    const toAdd = autoAdded.filter(a => !currentIds.includes(a.id));
    if (toAdd.length > 0) {
      const merged = [...state.accessories, ...toAdd];
      dispatch({ type: 'SET_ACCESSORIES', payload: merged });
    }
  }, []);

  const isSelected = (id) => state.accessories.some(a => a.id === id);

  const toggle = (item) => {
    if (item.autoAdded) return; // can't uncheck auto-added
    dispatch({ type: 'TOGGLE_ACCESSORY', payload: item });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-1">Add-Ons & Accessories</h2>
        <p className="text-gray-500 text-sm">Items marked <span className="text-blue-400 font-semibold">Auto-Added</span> are required for your configuration and cannot be removed.</p>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const selected = isSelected(item.id);
          const isAuto = item.autoAdded;
          return (
            <div
              key={item.id}
              onClick={() => toggle(item)}
              className={`relative rounded-2xl border-2 p-4 transition-all duration-200 ${
                isAuto
                  ? 'border-blue-500/60 bg-blue-600/10 cursor-default'
                  : selected
                  ? 'border-blue-500 bg-blue-600/10 cursor-pointer'
                  : 'border-white/10 bg-white/[0.03] cursor-pointer hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-sm text-white">{item.label}</span>
                    {isAuto && (
                      <span className="flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase bg-blue-600/40 text-blue-300 px-2 py-0.5 rounded-full">
                        <Zap size={8} /> Auto-Added
                      </span>
                    )}
                    {item.verificationNeeded && (
                      <span className="flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full animate-pulse">
                        <AlertTriangle size={8} /> Needs Verification
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-gray-600">{item.sku}</div>
                  {item.verificationNeeded && (
                    <p className="text-xs text-amber-600/80 mt-1.5 leading-relaxed">{item.verificationReason}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-base font-bold text-white">+${item.price}</span>
                  {isAuto ? (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                      <CheckCircle size={14} className="text-white" />
                    </div>
                  ) : (
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selected ? 'bg-blue-600 border-blue-500' : 'border-gray-700 hover:border-gray-500'
                    }`}>
                      {selected ? <Minus size={12} className="text-white" /> : <Plus size={12} className="text-gray-500" />}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 font-bold py-4 rounded-xl text-sm transition-all">
          ← Back
        </button>
        <button onClick={onNext} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-all">
          Continue to Dependencies →
        </button>
      </div>
    </div>
  );
}