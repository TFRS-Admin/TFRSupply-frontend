/**
 * components/navigator/VehicleSelectorModal.jsx
 * Fed Sig / TFR-styled vehicle selector modal.
 * Opens from the SiteHeader vehicle button.
 */
import React, { useState, useEffect } from 'react';
import { X, Truck } from 'lucide-react';
import { useVehicle } from '@/context/VehicleContext';

// Vehicle Master — expanded per Vehicle_Master_Additions workbook (2026-06-29)
// Format: { vehicleId, year, make, model, vertical }
// vehicleId used for fitment/dependency lookups in configurator JSON vehicleRules
const VEHICLE_MASTER = [
  // Ford — Police
  { vehicleId: 'FORD_PIU',            year: '2026', make: 'Ford', model: 'Explorer PIU',        vertical: 'Police' },
  { vehicleId: 'FORD_PIU',            year: '2025', make: 'Ford', model: 'Explorer PIU',        vertical: 'Police' },
  { vehicleId: 'FORD_PIU',            year: '2024', make: 'Ford', model: 'Explorer PIU',        vertical: 'Police' },
  { vehicleId: 'FORD_PIU',            year: '2023', make: 'Ford', model: 'Explorer PIU',        vertical: 'Police' },
  { vehicleId: 'FORD_PIU',            year: '2022', make: 'Ford', model: 'Explorer PIU',        vertical: 'Police' },
  { vehicleId: 'FORD_PIU',            year: '2021', make: 'Ford', model: 'Explorer PIU',        vertical: 'Police' },
  { vehicleId: 'FORD_PIU',            year: '2020', make: 'Ford', model: 'Explorer PIU',        vertical: 'Police' },
  { vehicleId: 'FORD_EXPEDITION_SSV', year: '2026', make: 'Ford', model: 'Expedition SSV',      vertical: 'Police' },
  { vehicleId: 'FORD_EXPEDITION_SSV', year: '2025', make: 'Ford', model: 'Expedition SSV',      vertical: 'Police' },
  { vehicleId: 'FORD_EXPEDITION_SSV', year: '2024', make: 'Ford', model: 'Expedition SSV',      vertical: 'Police' },
  { vehicleId: 'FORD_EXPEDITION_SSV', year: '2023', make: 'Ford', model: 'Expedition SSV',      vertical: 'Police' },
  { vehicleId: 'FORD_EXPEDITION_SSV', year: '2022', make: 'Ford', model: 'Expedition SSV',      vertical: 'Police' },
  { vehicleId: 'FORD_EXPEDITION_SSV', year: '2021', make: 'Ford', model: 'Expedition SSV',      vertical: 'Police' },
  { vehicleId: 'FORD_EXPEDITION_SSV', year: '2018', make: 'Ford', model: 'Expedition SSV',      vertical: 'Police' },
  { vehicleId: 'FORD_F150_RESPONDER', year: '2026', make: 'Ford', model: 'F-150 Responder',     vertical: 'Police' },
  { vehicleId: 'FORD_F150_RESPONDER', year: '2025', make: 'Ford', model: 'F-150 Responder',     vertical: 'Police' },
  { vehicleId: 'FORD_F150_RESPONDER', year: '2024', make: 'Ford', model: 'F-150 Responder',     vertical: 'Police' },
  { vehicleId: 'FORD_F150_RESPONDER', year: '2023', make: 'Ford', model: 'F-150 Responder',     vertical: 'Police' },
  { vehicleId: 'FORD_F150_RESPONDER', year: '2022', make: 'Ford', model: 'F-150 Responder',     vertical: 'Police' },
  { vehicleId: 'FORD_F150_RESPONDER', year: '2021', make: 'Ford', model: 'F-150 Responder',     vertical: 'Police' },
  // Ford — Work Truck
  { vehicleId: 'FORD_SUPERDUTY',      year: '2026', make: 'Ford', model: 'SuperDuty F-250/350', vertical: 'Work Truck' },
  { vehicleId: 'FORD_SUPERDUTY',      year: '2025', make: 'Ford', model: 'SuperDuty F-250/350', vertical: 'Work Truck' },
  { vehicleId: 'FORD_SUPERDUTY',      year: '2024', make: 'Ford', model: 'SuperDuty F-250/350', vertical: 'Work Truck' },
  { vehicleId: 'FORD_SUPERDUTY',      year: '2023', make: 'Ford', model: 'SuperDuty F-250/350', vertical: 'Work Truck' },
  { vehicleId: 'FORD_SUPERDUTY',      year: '2022', make: 'Ford', model: 'SuperDuty F-250/350', vertical: 'Work Truck' },
  { vehicleId: 'FORD_SUPERDUTY',      year: '2021', make: 'Ford', model: 'SuperDuty F-250/350', vertical: 'Work Truck' },
  // Chevrolet — Police
  { vehicleId: 'CHEVY_TAHOE_PPV',     year: '2026', make: 'Chevrolet', model: 'Tahoe PPV / SSV',       vertical: 'Police' },
  { vehicleId: 'CHEVY_TAHOE_PPV',     year: '2025', make: 'Chevrolet', model: 'Tahoe PPV / SSV',       vertical: 'Police' },
  { vehicleId: 'CHEVY_TAHOE_PPV',     year: '2024', make: 'Chevrolet', model: 'Tahoe PPV / SSV',       vertical: 'Police' },
  { vehicleId: 'CHEVY_TAHOE_PPV',     year: '2023', make: 'Chevrolet', model: 'Tahoe PPV / SSV',       vertical: 'Police' },
  { vehicleId: 'CHEVY_TAHOE_PPV',     year: '2022', make: 'Chevrolet', model: 'Tahoe PPV / SSV',       vertical: 'Police' },
  { vehicleId: 'CHEVY_TAHOE_PPV',     year: '2021', make: 'Chevrolet', model: 'Tahoe PPV / SSV',       vertical: 'Police' },
  { vehicleId: 'CHEVY_SILVERADO_PPV', year: '2026', make: 'Chevrolet', model: 'Silverado PPV / SSV',   vertical: 'Police' },
  { vehicleId: 'CHEVY_SILVERADO_PPV', year: '2025', make: 'Chevrolet', model: 'Silverado PPV / SSV',   vertical: 'Police' },
  { vehicleId: 'CHEVY_SILVERADO_PPV', year: '2024', make: 'Chevrolet', model: 'Silverado PPV / SSV',   vertical: 'Police' },
  { vehicleId: 'CHEVY_BLAZER_EV_PPV', year: '2026', make: 'Chevrolet', model: 'Blazer EV PPV',         vertical: 'Police' },
  { vehicleId: 'CHEVY_BLAZER_EV_PPV', year: '2025', make: 'Chevrolet', model: 'Blazer EV PPV',         vertical: 'Police' },
  // Chevrolet — Work Truck
  { vehicleId: 'CHEVY_SILVERADO_HD',  year: '2026', make: 'Chevrolet', model: 'Silverado HD 2500/3500',vertical: 'Work Truck' },
  { vehicleId: 'CHEVY_SILVERADO_HD',  year: '2025', make: 'Chevrolet', model: 'Silverado HD 2500/3500',vertical: 'Work Truck' },
  { vehicleId: 'CHEVY_SILVERADO_HD',  year: '2024', make: 'Chevrolet', model: 'Silverado HD 2500/3500',vertical: 'Work Truck' },
  { vehicleId: 'CHEVY_SILVERADO_HD',  year: '2023', make: 'Chevrolet', model: 'Silverado HD 2500/3500',vertical: 'Work Truck' },
  // Dodge — Police
  { vehicleId: 'DODGE_CHARGER',       year: '2023', make: 'Dodge', model: 'Charger Pursuit',    vertical: 'Police' },
  { vehicleId: 'DODGE_CHARGER',       year: '2022', make: 'Dodge', model: 'Charger Pursuit',    vertical: 'Police' },
  { vehicleId: 'DODGE_CHARGER',       year: '2021', make: 'Dodge', model: 'Charger Pursuit',    vertical: 'Police' },
  { vehicleId: 'DODGE_CHARGER',       year: '2020', make: 'Dodge', model: 'Charger Pursuit',    vertical: 'Police' },
  { vehicleId: 'DODGE_DURANGO',       year: '2026', make: 'Dodge', model: 'Durango Pursuit',    vertical: 'Police' },
  { vehicleId: 'DODGE_DURANGO',       year: '2025', make: 'Dodge', model: 'Durango Pursuit',    vertical: 'Police' },
  { vehicleId: 'DODGE_DURANGO',       year: '2024', make: 'Dodge', model: 'Durango Pursuit',    vertical: 'Police' },
  { vehicleId: 'DODGE_DURANGO',       year: '2023', make: 'Dodge', model: 'Durango Pursuit',    vertical: 'Police' },
  // Ram — Police / Work Truck
  { vehicleId: 'RAM_1500_SSV',        year: '2026', make: 'Ram', model: '1500 SSV',             vertical: 'Police' },
  { vehicleId: 'RAM_1500_SSV',        year: '2025', make: 'Ram', model: '1500 SSV',             vertical: 'Police' },
  { vehicleId: 'RAM_1500_SSV',        year: '2024', make: 'Ram', model: '1500 SSV',             vertical: 'Police' },
  { vehicleId: 'RAM_2500',            year: '2026', make: 'Ram', model: '2500',                 vertical: 'Work Truck' },
  { vehicleId: 'RAM_2500',            year: '2025', make: 'Ram', model: '2500',                 vertical: 'Work Truck' },
  { vehicleId: 'RAM_2500',            year: '2024', make: 'Ram', model: '2500',                 vertical: 'Work Truck' },
  { vehicleId: 'RAM_2500',            year: '2023', make: 'Ram', model: '2500',                 vertical: 'Work Truck' },
  { vehicleId: 'RAM_3500',            year: '2026', make: 'Ram', model: '3500',                 vertical: 'Work Truck' },
  { vehicleId: 'RAM_3500',            year: '2025', make: 'Ram', model: '3500',                 vertical: 'Work Truck' },
  { vehicleId: 'RAM_3500',            year: '2024', make: 'Ram', model: '3500',                 vertical: 'Work Truck' },
  { vehicleId: 'RAM_3500',            year: '2023', make: 'Ram', model: '3500',                 vertical: 'Work Truck' },
];

// Flatten for the cascading dropdowns (year/make/model only)
const VEHICLES = VEHICLE_MASTER.map(({ year, make, model }) => ({ year, make, model }));

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const years = [...new Set(VEHICLES.map(v => v.year))].sort((a, b) => b - a);

export default function VehicleSelectorModal({ onClose }) {
  const { selectedVehicle, setSelectedVehicle } = useVehicle();

  const [year, setYear]   = useState(selectedVehicle?.year  || '');
  const [make, setMake]   = useState(selectedVehicle?.make  || '');
  const [model, setModel] = useState(selectedVehicle?.model || '');

  const makes = year
    ? [...new Set(VEHICLES.filter(v => v.year === year).map(v => v.make))].sort()
    : [...new Set(VEHICLES.map(v => v.make))].sort();

  const models = year && make
    ? [...new Set(VEHICLES.filter(v => v.year === year && v.make === make).map(v => v.model))].sort()
    : [];

  const canSave = year && make && model;

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    setSelectedVehicle({ year, make, model });
    onClose();
  };

  const handleClear = () => {
    setSelectedVehicle(null);
    setYear(''); setMake(''); setModel('');
    onClose();
  };

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

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 999 }}
      />

      {/* Modal */}
      <div style={{
        ...FS,
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        background: '#fff',
        width: '100%',
        maxWidth: 500,
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        borderRadius: 3,
        overflow: 'hidden',
      }}>

        {/* Header bar */}
        <div style={{ background: '#1a2744', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#c8102e', borderRadius: 2, padding: '5px 7px', display: 'flex', alignItems: 'center' }}>
              <Truck size={14} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Select Your Vehicle
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                Filter products for your specific application
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 20px' }}>

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
      </div>
    </>
  );
}