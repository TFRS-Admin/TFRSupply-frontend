import React, { useState, useEffect } from 'react';
import { Car, ChevronDown } from 'lucide-react';
import { VEHICLES, DEPENDENCIES } from '@/data/sampleData';
import { useConfigurator } from '@/context/ConfiguratorContext';

export default function StepVehicle({ familyId, onNext }) {
  const { state, dispatch } = useConfigurator();
  const [localVehicle, setLocalVehicle] = useState(state.vehicle);
  const vehicles = VEHICLES[familyId] || [];

  const years = [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a);
  const makes = [...new Set(vehicles.filter(v => !localVehicle.year || v.year === localVehicle.year).map(v => v.make))];
  const models = [...new Set(vehicles.filter(v =>
    (!localVehicle.year || v.year === localVehicle.year) &&
    (!localVehicle.make || v.make === localVehicle.make)
  ).map(v => v.model))];
  const trims = vehicles.filter(v =>
    v.year === localVehicle.year && v.make === localVehicle.make && v.model === localVehicle.model
  ).map(v => v.trim);

  const isComplete = localVehicle.year && localVehicle.make && localVehicle.model && localVehicle.trim;

  const handleChange = (field, value) => {
    const updated = { ...localVehicle, [field]: value };
    if (field === 'year') { updated.make = ''; updated.model = ''; updated.trim = ''; }
    if (field === 'make') { updated.model = ''; updated.trim = ''; }
    if (field === 'model') { updated.trim = ''; }
    setLocalVehicle(updated);
  };

  const handleNext = () => {
    dispatch({ type: 'SET_VEHICLE', payload: localVehicle });

    // Resolve dependencies
    const deps = DEPENDENCIES[familyId];
    if (deps) {
      const resolved = [...(deps.always || [])];
      const vehicleKey = Object.keys(deps.byVehicle || {}).find(k =>
        localVehicle.model.includes(k) || k.includes(localVehicle.model)
      );
      if (vehicleKey) resolved.push(...deps.byVehicle[vehicleKey]);
      dispatch({ type: 'SET_DEPENDENCIES', payload: resolved });
    }
    onNext();
  };

  const SelectField = ({ label, value, options, onChange, disabled }) => (
    <div className="flex-1">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled || options.length === 0}
          className="w-full appearance-none bg-white/[0.04] border border-white/10 text-white rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none focus:border-blue-500/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <option value="">Select {label}</option>
          {options.map(opt => <option key={opt} value={opt} className="bg-gray-900">{opt}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <Car size={16} className="text-blue-400" />
          </div>
          <h2 className="text-xl font-bold">Select Your Vehicle</h2>
        </div>
        <p className="text-gray-500 text-sm">Choose your exact vehicle so we can resolve the right fitment hardware.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Year" value={localVehicle.year} options={years} onChange={v => handleChange('year', v)} />
        <SelectField label="Make" value={localVehicle.make} options={makes} onChange={v => handleChange('make', v)} disabled={!localVehicle.year} />
        <SelectField label="Model" value={localVehicle.model} options={models} onChange={v => handleChange('model', v)} disabled={!localVehicle.make} />
        <SelectField label="Trim" value={localVehicle.trim} options={trims} onChange={v => handleChange('trim', v)} disabled={!localVehicle.model} />
      </div>

      {isComplete && (
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl px-5 py-4 flex items-center gap-3">
          <Car size={16} className="text-blue-400 shrink-0" />
          <div>
            <div className="text-sm font-bold text-white">{localVehicle.year} {localVehicle.make} {localVehicle.model}</div>
            <div className="text-xs text-gray-500">Trim: {localVehicle.trim}</div>
          </div>
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={!isComplete}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-all"
      >
        Continue to Options →
      </button>
    </div>
  );
}