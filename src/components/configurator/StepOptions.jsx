import React from 'react';
import { CheckCircle, Star } from 'lucide-react';
import { CORE_OPTIONS } from '@/data/sampleData';
import { useConfigurator } from '@/context/ConfiguratorContext';

export default function StepOptions({ familyId, onNext, onBack }) {
  const { state, dispatch } = useConfigurator();
  const optionSet = CORE_OPTIONS[familyId];

  if (!optionSet) return null;

  const handleSelect = (option) => {
    dispatch({ type: 'SET_CORE_OPTION', payload: option });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-1">Choose {optionSet.label}</h2>
        <p className="text-gray-500 text-sm">Select the core configuration for your {familyId.charAt(0).toUpperCase() + familyId.slice(1)} system.</p>
      </div>

      <div className="space-y-3">
        {optionSet.options.map((option) => {
          const isSelected = state.coreOption?.id === option.id;
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option)}
              className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-900/30'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">{option.label}</span>
                    {option.popular && (
                      <span className="flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded-full">
                        <Star size={8} /> Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{option.description}</p>
                  <div className="mt-2 text-xs text-gray-600 font-mono">SKU: {option.sku}</div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-lg font-extrabold text-white">${option.price.toLocaleString()}</div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-blue-600 border-blue-500' : 'border-gray-700'
                  }`}>
                    {isSelected && <CheckCircle size={14} className="text-white" />}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 font-bold py-4 rounded-xl text-sm transition-all">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!state.coreOption}
          className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-all"
        >
          Continue to Accessories →
        </button>
      </div>
    </div>
  );
}