/**
 * components/configurator/VehicleConfigurationSummary.jsx
 *
 * Vehicle Selection panel for the Configurator Experience. Reads the
 * existing VehicleContext (the same context ConfiguratorModule's inline
 * banner and SiteHeader already use) and presents a Year/Make/Model/Trim
 * breakdown plus a plain-language summary sentence. Opens the existing
 * VehicleSelectorModal to change the vehicle — no new vehicle data source.
 */

import React, { useState } from 'react';
import { Truck, Pencil } from 'lucide-react';
import { useVehicle } from '@/context/VehicleContext';
import VehicleSelectorModal from '@/components/navigator/VehicleSelectorModal';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * Pure summary-sentence builder, extracted so it can be unit tested without
 * needing to fake VehicleContext / localStorage in a server-rendered test.
 */
export function buildVehicleSummary(selectedVehicle) {
  if (!selectedVehicle) {
    return 'No vehicle selected — fitment recommendations and compatibility checks are unavailable until a vehicle is chosen.';
  }
  return `Configuring products for a ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}${selectedVehicle.trim ? ` ${selectedVehicle.trim}` : ''}.`;
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: value ? '#1a1a1a' : '#bbb' }}>{value ?? 'Not specified'}</div>
    </div>
  );
}

export default function VehicleConfigurationSummary() {
  const { selectedVehicle } = useVehicle();
  const [modalOpen, setModalOpen] = useState(false);

  const summary = buildVehicleSummary(selectedVehicle);

  return (
    <div style={{ ...FS, border: '1px solid #e8e8e8', background: '#fff', marginBottom: 16 }} data-testid="vehicle-configuration-summary">
      <div style={{ background: '#1a2744', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Truck size={14} style={{ color: '#fff' }} />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff' }}>Vehicle Selection</span>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            ...FS, fontSize: 11, fontWeight: 700, color: '#fff', background: 'none',
            border: '1px solid rgba(255,255,255,0.35)', padding: '4px 10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          <Pencil size={11} /> {selectedVehicle ? 'Change Vehicle' : 'Select Vehicle'}
        </button>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
          <Field label="Year" value={selectedVehicle?.year} />
          <Field label="Make" value={selectedVehicle?.make} />
          <Field label="Model" value={selectedVehicle?.model} />
          <Field label="Trim" value={selectedVehicle?.trim} />
        </div>
        <p style={{ fontSize: 12, color: '#555', margin: 0, lineHeight: 1.6 }} data-testid="vehicle-summary-sentence">
          {summary}
        </p>
      </div>

      {modalOpen && <VehicleSelectorModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
