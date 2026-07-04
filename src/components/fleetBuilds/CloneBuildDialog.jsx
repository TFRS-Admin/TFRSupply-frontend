/**
 * components/fleetBuilds/CloneBuildDialog.jsx
 * Shared "Clone Build" dialog used to clone an existing fleet build or a
 * saved template into a brand-new fleet build with its own destination
 * vehicle, name, and quantity — reused by FleetBuildCard ("Clone Build"),
 * FinishYourUpfitPanel ("Clone Current Build"), and FleetTemplatesSection
 * ("Clone" on a saved template) so the destination form only exists once.
 * Selected products, category selections, and build style are copied from
 * the source by the caller's cloneBuild()/applyTemplate() context call;
 * vehicle compatibility re-evaluation and flagging happen there
 * (src/domain/fleetBuilds/cloneRules.ts) — this dialog only collects the
 * destination fields.
 */
import React, { useState } from 'react';
import { X, Copy } from 'lucide-react';
import { listVehicleYears, listVehicleMakes, listVehicleModels, findVehicleMasterEntry } from '@/data/vehicles/vehicleMaster';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };
const years = listVehicleYears();

const fieldLabelStyle = {
  display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#999', marginBottom: 4,
};

const inputStyle = {
  ...FS, width: '100%', padding: '9px 10px', fontSize: 13,
  border: '1.5px solid #d0d0d0', borderRadius: 2, background: '#fff', color: '#1a1a1a', outline: 'none',
};

/**
 * Summarizes a FleetBuildCloneResult (shared by cloneBuild() and
 * applyTemplate()) into a toast-ready title/description, exported so the
 * summary text is unit-testable without rendering a toast — mirrors
 * summarizeAddToAllResult in AddToAllCompatibleBuildsButton.jsx.
 */
export function summarizeCompatibilityResult(result, successTitle) {
  if (!result) {
    return { title: 'Could not complete this action', description: 'Please try again.' };
  }

  const flaggedCount = result.flaggedIncompatible.length;
  if (flaggedCount === 0) {
    return { title: successTitle, description: 'Every product is compatible with the destination vehicle.' };
  }

  const names = result.flaggedIncompatible.slice(0, 3).map((flag) => flag.label).join(', ');
  return {
    title: successTitle,
    description: `${flaggedCount} product${flaggedCount === 1 ? '' : 's'} flagged incompatible with the destination vehicle (kept, not removed): ${names}${flaggedCount > 3 ? '…' : ''}`,
  };
}

export default function CloneBuildDialog({ sourceLabel = 'Build', sourceName, sourceVehicle, sourceQuantity, onClose, onClone }) {
  const [name, setName] = useState(sourceName ? `${sourceName} (Clone)` : 'Cloned Fleet Build');
  const [year, setYear] = useState(sourceVehicle?.year || '');
  const [make, setMake] = useState(sourceVehicle?.make || '');
  const [model, setModel] = useState(sourceVehicle?.model || '');
  const [quantity, setQuantity] = useState(String(sourceQuantity || 1));

  const makes = listVehicleMakes(year || null);
  const models = listVehicleModels(year || null, make || null);

  function handleSubmit(e) {
    e.preventDefault();
    const entry = findVehicleMasterEntry(year, make, model);
    const vehicle = (year && make && model) ? { vehicleId: entry?.vehicleId, year, make, model, vertical: entry?.vertical ?? null } : null;
    const parsedQuantity = parseInt(quantity, 10);
    onClone({
      name: name.trim() || 'Cloned Fleet Build',
      vehicle,
      quantity: Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1,
    });
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1099 }} />
      <div
        data-testid="clone-build-dialog"
        role="dialog"
        aria-label={`Clone ${sourceLabel}`}
        style={{
          ...FS, position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 1100, background: '#fff', width: 'calc(100% - 32px)', maxWidth: 420,
          maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', borderRadius: 3,
        }}
      >
        <div style={{ background: '#1a2744', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Copy size={14} color="#fff" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Clone {sourceLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '18px 20px' }}>
          <div style={{ marginBottom: 14 }}>
            <label style={fieldLabelStyle}>Destination Build Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              aria-label="Destination build name"
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={fieldLabelStyle}>Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={inputStyle}
              aria-label="Destination quantity"
            />
          </div>

          <p style={{ ...fieldLabelStyle, marginBottom: 8 }}>Destination Vehicle</p>
          <div className="clone-build-vehicle-grid grid grid-cols-1 sm:grid-cols-3 gap-2" style={{ marginBottom: 18 }}>
            <div>
              <label style={fieldLabelStyle}>Year</label>
              <select
                style={inputStyle}
                value={year}
                onChange={(e) => { setYear(e.target.value); setMake(''); setModel(''); }}
                aria-label="Destination vehicle year"
              >
                <option value="">Year</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={fieldLabelStyle}>Make</label>
              <select
                style={inputStyle}
                value={make}
                disabled={!year}
                onChange={(e) => { setMake(e.target.value); setModel(''); }}
                aria-label="Destination vehicle make"
              >
                <option value="">Make</option>
                {makes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={fieldLabelStyle}>Model</label>
              <select
                style={inputStyle}
                value={model}
                disabled={!year || !make}
                onChange={(e) => setModel(e.target.value)}
                aria-label="Destination vehicle model"
              >
                <option value="">Model</option>
                {models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#1a2744', background: 'none', border: '2px solid #1a2744', padding: '10px 16px', minHeight: 44, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#fff', background: '#c8102e', border: 'none', padding: '10px 16px', minHeight: 44, cursor: 'pointer' }}
            >
              Clone Build
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
