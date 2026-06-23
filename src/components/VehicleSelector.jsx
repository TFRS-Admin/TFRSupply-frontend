import React, { useState } from 'react';
import { Car, X, ChevronDown } from 'lucide-react';
import { useConfigurator } from '@/context/ConfiguratorContext';

// Simple flat vehicle list for persistent selector
const SELECTOR_VEHICLES = [
  { year: '2024', make: 'Ford', model: 'Police Interceptor Utility' },
  { year: '2023', make: 'Ford', model: 'Police Interceptor Utility' },
  { year: '2022', make: 'Ford', model: 'Police Interceptor Utility' },
  { year: '2024', make: 'Chevrolet', model: 'Tahoe PPV' },
  { year: '2023', make: 'Chevrolet', model: 'Tahoe PPV' },
  { year: '2024', make: 'Dodge', model: 'Durango Pursuit' },
  { year: '2023', make: 'Dodge', model: 'Charger' },
  { year: '2024', make: 'Ford', model: 'Expedition SSV' },
  { year: '2024', make: 'Chevrolet', model: 'Suburban PPV' },
  { year: '2024', make: 'Ford', model: 'F-150 Police Responder' },
  { year: '2024', make: 'Ram', model: '1500 Special Service' },
  { year: '2024', make: 'Toyota', model: 'Camry' },
  { year: '2024', make: 'Dodge', model: 'Charger' },
];

const years = [...new Set(SELECTOR_VEHICLES.map(v => v.year))].sort((a, b) => b - a);

export default function VehicleSelector({ compact = false }) {
  const { persistentVehicle, setPersistentVehicle } = useConfigurator();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');

  const makes = year
    ? [...new Set(SELECTOR_VEHICLES.filter(v => v.year === year).map(v => v.make))]
    : [...new Set(SELECTOR_VEHICLES.map(v => v.make))];

  const models = year && make
    ? [...new Set(SELECTOR_VEHICLES.filter(v => v.year === year && v.make === make).map(v => v.model))]
    : [];

  const canSave = year && make && model;

  const handleSave = () => {
    setPersistentVehicle({ year, make, model });
    setOpen(false);
  };

  const handleClear = () => {
    setPersistentVehicle(null);
    setYear('');
    setMake('');
    setModel('');
  };

  if (persistentVehicle && !open) {
    return (
      <div className={`flex items-center gap-3 ${compact ? 'justify-center' : ''}`}>
        <div className="flex items-center gap-3 bg-blue-600/10 border border-blue-500/30 rounded-xl px-4 py-2.5">
          <Car size={14} className="text-blue-400 shrink-0" />
          <span className="text-sm text-white font-semibold">
            {persistentVehicle.year} {persistentVehicle.make} {persistentVehicle.model}
          </span>
          <span className="text-[10px] text-blue-400 bg-blue-600/20 px-2 py-0.5 rounded-full font-bold">Active</span>
          <button onClick={() => setOpen(true)} className="text-xs text-gray-500 hover:text-white transition-colors ml-1">
            Change
          </button>
          <button onClick={handleClear} className="text-gray-600 hover:text-red-400 transition-colors">
            <X size={13} />
          </button>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <div className={`flex items-center gap-3 ${compact ? 'justify-center' : ''}`}>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-white border border-white/10 hover:border-white/20 rounded-xl px-4 py-2.5 transition-all"
        >
          <Car size={14} />
          {compact ? 'Pre-select your vehicle (optional)' : 'Select your vehicle'}
          <ChevronDown size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0D1B2A] border border-blue-500/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Car size={12} className="text-blue-400" /> Select Vehicle
        </div>
        <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-white transition-colors">
          <X size={13} />
        </button>
      </div>

      <div className={`grid gap-2 mb-3 ${compact ? 'grid-cols-1' : 'grid-cols-3'}`}>
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Year</label>
          <select
            value={year}
            onChange={e => { setYear(e.target.value); setMake(''); setModel(''); }}
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="">Year</option>
            {years.map(y => <option key={y} value={y} className="bg-[#0D1B2A]">{y}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Make</label>
          <select
            value={make}
            onChange={e => { setMake(e.target.value); setModel(''); }}
            disabled={!year}
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 disabled:opacity-40"
          >
            <option value="">Make</option>
            {makes.map(m => <option key={m} value={m} className="bg-[#0D1B2A]">{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Model</label>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            disabled={!make || models.length === 0}
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 disabled:opacity-40"
          >
            <option value="">Model</option>
            {models.map(m => <option key={m} value={m} className="bg-[#0D1B2A]">{m}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg text-xs transition-all"
        >
          Save Vehicle
        </button>
        <button
          onClick={() => { setPersistentVehicle({ year: '', make: '', model: '', unspecified: true }); setOpen(false); }}
          className="text-xs text-gray-500 hover:text-white px-3 py-2 border border-white/10 rounded-lg transition-all"
        >
          Skip
        </button>
      </div>
    </div>
  );
}