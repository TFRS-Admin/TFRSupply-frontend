/**
 * components/fleetBuilds/ShopByVehiclePanel.jsx
 * "Shop by Vehicle" tab — the pre-existing single-vehicle selector behavior,
 * extracted from VehicleSelectorModal so it can sit alongside the new
 * "Fleet Builds" tab. Year/Make/Model selection, vehicle-aware filtering
 * (via the unchanged global VehicleContext), and the Confirm/Clear actions
 * are byte-for-byte the same behavior as before — only the surrounding modal
 * chrome (backdrop, header, tabs) moved to VehicleSelectorModal.jsx.
 */
import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import { useVehicle } from '@/context/VehicleContext';
import { listVehicleYears, listVehicleMakes, listVehicleModels } from '@/data/vehicles/vehicleMaster';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const years = listVehicleYears();

const selectStyle = {
  ...FS,
  width: '100%',
  padding: '9px 12px',
  fontSize: 13,
  border: '1.5px solid #d0d0d0',
  borderRadius: 2,
  background: '#fff',
  color: '#1a1a1a',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#888',
  marginBottom: 5,
};

export default function ShopByVehiclePanel({ onClose }) {
  const { selectedVehicle, setSelectedVehicle } = useVehicle();

  const [year, setYear] = useState(selectedVehicle?.year || '');
  const [make, setMake] = useState(selectedVehicle?.make || '');
  const [model, setModel] = useState(selectedVehicle?.model || '');

  const makes = listVehicleMakes(year || null);
  const models = listVehicleModels(year || null, make || null);

  const canSave = year && make && model;

  const handleSave = () => {
    setSelectedVehicle({ year, make, model });
    onClose();
  };

  const handleClear = () => {
    setSelectedVehicle(null);
    setYear(''); setMake(''); setModel('');
    onClose();
  };

  return (
    <div>
      {selectedVehicle && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18,
          padding: '10px 12px', background: '#f0f4ff', border: '1px solid #dbe4ff',
        }}>
          <Truck size={14} style={{ color: '#1a2744', flexShrink: 0 }} />
          <p style={{ ...FS, fontSize: 12, color: '#1a2744', margin: 0 }}>
            Currently shopping for <strong>{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}{selectedVehicle.trim ? ` ${selectedVehicle.trim}` : ''}</strong>
          </p>
        </div>
      )}

      {/* Year */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Year</label>
        <div style={{ position: 'relative' }}>
          <select
            style={selectStyle}
            value={year}
            onChange={e => { setYear(e.target.value); setMake(''); setModel(''); }}
          >
            <option value="">Select Year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#888' }}>▾</div>
        </div>
      </div>

      {/* Make */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ ...labelStyle, color: !year ? '#bbb' : '#888' }}>Make</label>
        <div style={{ position: 'relative' }}>
          <select
            style={{ ...selectStyle, opacity: !year ? 0.5 : 1, cursor: !year ? 'not-allowed' : 'pointer' }}
            value={make}
            disabled={!year}
            onChange={e => { setMake(e.target.value); setModel(''); }}
          >
            <option value="">Select Make</option>
            {makes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#888' }}>▾</div>
        </div>
      </div>

      {/* Model */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ ...labelStyle, color: (!year || !make) ? '#bbb' : '#888' }}>Model</label>
        <div style={{ position: 'relative' }}>
          <select
            style={{ ...selectStyle, opacity: (!year || !make) ? 0.5 : 1, cursor: (!year || !make) ? 'not-allowed' : 'pointer' }}
            value={model}
            disabled={!year || !make}
            onChange={e => setModel(e.target.value)}
          >
            <option value="">Select Model</option>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#888' }}>▾</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            flex: 1,
            background: canSave ? '#c8102e' : '#e5e5e5',
            color: canSave ? '#fff' : '#aaa',
            border: 'none',
            borderRadius: 2,
            padding: '11px 20px',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.04em',
            cursor: canSave ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase',
            ...FS,
          }}
          onMouseEnter={e => { if (canSave) e.currentTarget.style.background = '#a50d25'; }}
          onMouseLeave={e => { if (canSave) e.currentTarget.style.background = '#c8102e'; }}
        >
          Confirm Vehicle
        </button>
        {selectedVehicle && (
          <button
            onClick={handleClear}
            style={{
              background: 'none',
              border: '1.5px solid #d0d0d0',
              borderRadius: 2,
              padding: '11px 16px',
              fontSize: 12,
              color: '#666',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              ...FS,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8102e'; e.currentTarget.style.color = '#c8102e'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#d0d0d0'; e.currentTarget.style.color = '#666'; }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
