/**
 * components/fleetBuilds/FleetBuildCard.jsx
 * One fleet build's editable summary: name, vehicle, quantity, build style,
 * completion indicator, missing upfit categories, and the products already
 * selected per upfit category. All mutation callbacks are provided by
 * FleetBuildsPanel, which wires them to useFleetBuilds(); this component
 * holds no persistence logic of its own.
 */
import React, { useState } from 'react';
import { Copy, Save, Star, Trash2, X } from 'lucide-react';
import { BUILD_STYLES, calculateFleetBuildCompletion, getUpfitCategoryLabel } from '@/domain/fleetBuilds';
import { listVehicleYears, listVehicleMakes, listVehicleModels, findVehicleMasterEntry } from '@/data/vehicles/vehicleMaster';
import FleetBuildCompletionBadge from './FleetBuildCompletionBadge';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };
const years = listVehicleYears();

const fieldLabelStyle = {
  display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#999', marginBottom: 4,
};

const compactSelectStyle = {
  ...FS, width: '100%', padding: '7px 8px', fontSize: 12.5,
  border: '1.5px solid #d0d0d0', borderRadius: 2, background: '#fff', color: '#1a1a1a',
  outline: 'none', cursor: 'pointer',
};

const sectionLabelStyle = {
  fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', marginBottom: 6,
};

export default function FleetBuildCard({
  build,
  isActive,
  onSetActive,
  onRemove,
  onRename,
  onUpdateVehicle,
  onUpdateQuantity,
  onUpdateStyle,
  onRemoveProduct,
  onSaveAsTemplate,
  onCloneBuild,
}) {
  const [name, setName] = useState(build.name);
  const [year, setYear] = useState(build.vehicle?.year || '');
  const [make, setMake] = useState(build.vehicle?.make || '');
  const [model, setModel] = useState(build.vehicle?.model || '');
  const [quantityDraft, setQuantityDraft] = useState(String(build.quantity));

  const makes = listVehicleMakes(year || null);
  const models = listVehicleModels(year || null, make || null);
  const completion = calculateFleetBuildCompletion(build);

  function commitName() {
    const trimmed = name.trim();
    if (trimmed && trimmed !== build.name) onRename(trimmed);
    else setName(build.name);
  }

  function handleModelChange(nextModel) {
    setModel(nextModel);
    if (year && make && nextModel) {
      const entry = findVehicleMasterEntry(year, make, nextModel);
      onUpdateVehicle({ vehicleId: entry?.vehicleId, year, make, model: nextModel, vertical: entry?.vertical ?? null });
    }
  }

  function handleQuantityChange(e) {
    const raw = e.target.value;
    setQuantityDraft(raw);
    const parsed = parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed > 0) onUpdateQuantity(parsed);
  }

  return (
    <div
      data-testid="fleet-build-card"
      data-build-id={build.id}
      style={{
        border: isActive ? '2px solid #c8102e' : '1px solid #e5e7eb',
        borderRadius: 4, padding: '14px 16px', marginBottom: 14,
        background: isActive ? '#fff8f8' : '#fff',
      }}
    >
      {/* Header: name + active state + remove */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          aria-label="Fleet build name"
          style={{
            ...FS, flex: '1 1 160px', minWidth: 120, fontSize: 14, fontWeight: 700, color: '#1a1a1a',
            border: 'none', borderBottom: '1.5px solid #eee', padding: '2px 0', outline: 'none', background: 'transparent',
          }}
        />
        {isActive ? (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: '#c8102e', padding: '3px 8px', borderRadius: 2, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
            ACTIVE
          </span>
        ) : (
          <button
            type="button"
            onClick={onSetActive}
            style={{ ...FS, fontSize: 11, fontWeight: 700, color: '#1a2744', background: 'none', border: '1.5px solid #1a2744', borderRadius: 2, padding: '4px 9px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
          >
            <Star size={11} /> Set Active
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${build.name}`}
          title="Remove build"
          style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 4, display: 'flex' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#c8102e'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#999'; }}
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <FleetBuildCompletionBadge completion={completion} />
      </div>

      {/* Fleet Templates & Vehicle Cloning */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <button
          type="button"
          onClick={onSaveAsTemplate}
          style={{ ...FS, fontSize: 11, fontWeight: 700, color: '#1a2744', background: 'none', border: '1.5px solid #1a2744', borderRadius: 2, padding: '5px 9px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <Save size={12} /> Save as Template
        </button>
        <button
          type="button"
          onClick={onCloneBuild}
          style={{ ...FS, fontSize: 11, fontWeight: 700, color: '#1a2744', background: 'none', border: '1.5px solid #1a2744', borderRadius: 2, padding: '5px 9px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <Copy size={12} /> Clone Build
        </button>
      </div>

      {build.vehicle && (
        <p style={{ ...FS, fontSize: 12, color: '#444', margin: '0 0 8px' }}>
          Vehicle: <strong>{build.vehicle.year} {build.vehicle.make} {build.vehicle.model}</strong>
        </p>
      )}

      {/* Vehicle picker */}
      <div className="fleet-build-vehicle-grid grid grid-cols-1 sm:grid-cols-3 gap-2" style={{ marginBottom: 10 }}>
        <div>
          <label style={fieldLabelStyle}>Year</label>
          <select style={compactSelectStyle} value={year} onChange={(e) => { setYear(e.target.value); setMake(''); setModel(''); }}>
            <option value="">Year</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label style={{ ...fieldLabelStyle, color: !year ? '#ccc' : '#999' }}>Make</label>
          <select style={{ ...compactSelectStyle, opacity: !year ? 0.5 : 1 }} value={make} disabled={!year} onChange={(e) => { setMake(e.target.value); setModel(''); }}>
            <option value="">Make</option>
            {makes.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label style={{ ...fieldLabelStyle, color: (!year || !make) ? '#ccc' : '#999' }}>Model</label>
          <select style={{ ...compactSelectStyle, opacity: (!year || !make) ? 0.5 : 1 }} value={model} disabled={!year || !make} onChange={(e) => handleModelChange(e.target.value)}>
            <option value="">Model</option>
            {models.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Quantity + Build Style */}
      <div className="fleet-build-meta-grid grid grid-cols-2 gap-2" style={{ marginBottom: 14 }}>
        <div>
          <label style={fieldLabelStyle}>Quantity</label>
          <input
            type="number"
            min="1"
            value={quantityDraft}
            onChange={handleQuantityChange}
            onBlur={() => setQuantityDraft(String(build.quantity))}
            aria-label="Vehicle quantity"
            style={compactSelectStyle}
          />
        </div>
        <div>
          <label style={fieldLabelStyle}>Build Style</label>
          <select
            style={compactSelectStyle}
            value={build.buildStyle ?? ''}
            aria-label="Build style"
            onChange={(e) => onUpdateStyle(e.target.value || null)}
          >
            <option value="">No Style Selected</option>
            {BUILD_STYLES.map((style) => <option key={style.id} value={style.id}>{style.label}</option>)}
          </select>
        </div>
      </div>

      {/* Missing upfit categories */}
      {completion.missingCategories.length > 0 && (
        <div style={{ marginBottom: completion.selectedCategories.length > 0 ? 12 : 0 }}>
          <p style={sectionLabelStyle}>Missing Upfit Categories</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {completion.missingCategories.map((categoryId) => (
              <span key={categoryId} style={{ fontSize: 11, color: '#b91c1c', background: '#fee2e2', padding: '3px 8px', borderRadius: 999 }}>
                {getUpfitCategoryLabel(categoryId)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Selected upfit categories / products */}
      {completion.selectedCategories.length > 0 && (
        <div>
          <p style={sectionLabelStyle}>Selected Upfit Categories</p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {completion.selectedCategories.map((categoryId) => (
              <li key={categoryId} style={{ marginBottom: 6 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', margin: '0 0 3px' }}>{getUpfitCategoryLabel(categoryId)}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(build.selections[categoryId] ?? []).map((item) => (
                    <span
                      key={item.productId}
                      title={item.incompatible ? 'Incompatible with selected vehicle.' : undefined}
                      style={{
                        fontSize: 11,
                        color: item.incompatible ? '#b91c1c' : '#1a2744',
                        background: item.incompatible ? '#fee2e2' : '#f0f4ff',
                        border: item.incompatible ? '1px solid #fca5a5' : 'none',
                        padding: '3px 6px', borderRadius: 2, display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      {item.label}
                      {item.incompatible && <span style={{ fontWeight: 700 }}>· Incompatible with selected vehicle.</span>}
                      <button
                        type="button"
                        onClick={() => onRemoveProduct(categoryId, item.productId)}
                        aria-label={`Remove ${item.label} from ${getUpfitCategoryLabel(categoryId)}`}
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
