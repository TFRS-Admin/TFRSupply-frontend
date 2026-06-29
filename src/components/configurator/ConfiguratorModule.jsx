/**
 * components/configurator/ConfiguratorModule.jsx
 *
 * Generic, fully data-driven configurator module.
 * Vehicle comes from VehicleContext only — no vehicle selector inside this module.
 *
 * Architecture:
 *   - Vehicle Banner  — reads VehicleContext, opens existing modal
 *   - SKU Filters     — button selectors that narrow the SKU table
 *   - Available SKUs  — live table; narrows on every filter; customer selects a row
 *   - Technical Details — informational only, shown after SKU row selected
 *   - Accessories     — required deps + optional items
 *   - Quote Payload   — emitted when a SKU row is selected
 *
 * Dead-end prevention:
 *   Each filter option is tested before render. If selecting it would produce
 *   0 remaining SKUs, it is disabled before the customer can click it.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useVehicle } from '@/context/VehicleContext';
import VehicleSelectorModal from '@/components/navigator/VehicleSelectorModal';
import {
  CheckCircle, ChevronRight, RotateCcw, ClipboardList,
  Truck, AlertTriangle, Package
} from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

// ─── SKU Filtering Engine ──────────────────────────────────────────────────

function filterSkus(skuOptions, selections, steps) {
  return skuOptions.filter(skuOpt => {
    for (const step of steps) {
      if (!step.skuSegmentKey) continue;
      const val = selections[step.id];
      if (!val) continue;
      const opt = step.options.find(o => o.id === val);
      if (!opt) continue;
      const attrKey = step.skuSegmentKey;
      const attrVal = opt.skuSegment;
      if (!(attrKey in skuOpt.attributes)) continue;
      if (step._verification === 'confirmed') {
        if (skuOpt.attributes[attrKey] !== attrVal) return false;
      } else {
        const anyMatch = skuOptions.some(s => s.attributes[attrKey] === attrVal);
        if (anyMatch && skuOpt.attributes[attrKey] !== attrVal) return false;
      }
    }
    return true;
  });
}

function wouldHaveMatches(skuOptions, selections, steps, stepId, optionId) {
  const hypothetical = { ...selections, [stepId]: optionId };
  return filterSkus(skuOptions, hypothetical, steps).length > 0;
}

// ─── Section Header ────────────────────────────────────────────────────────

function SectionHeader({ number, label, description }) {
  return (
    <div style={{ borderBottom: '2px solid #1a2744', paddingBottom: 8, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#c8102e', padding: '2px 8px', letterSpacing: '0.06em' }}>
          {number}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a2744' }}>
          {label}
        </span>
      </div>
      {description && <p style={{ fontSize: 11, color: '#888', margin: '6px 0 0' }}>{description}</p>}
    </div>
  );
}

// ─── Vehicle Banner ────────────────────────────────────────────────────────

function VehicleBanner({ selectedVehicle, onOpen }) {
  if (!selectedVehicle) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', background: '#fff8e1', border: '1px solid #ffe082', marginBottom: 20
      }}>
        <Truck size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: '#78350f', flex: 1 }}>
          Select your vehicle to see fitment recommendations.
        </span>
        <button
          onClick={onOpen}
          style={{
            ...FS, fontSize: 11, fontWeight: 700, color: '#fff', background: '#c8102e',
            border: 'none', padding: '5px 12px', cursor: 'pointer', letterSpacing: '0.04em', flexShrink: 0
          }}
        >
          Select Vehicle
        </button>
      </div>
    );
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', background: '#f0f4ff', border: '1px solid #c7d7f9', marginBottom: 20
    }}>
      <Truck size={15} style={{ color: '#1a2744', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Configuring For</span>
        <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: '#1a2744' }}>
          {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
        </p>
      </div>
      <button
        onClick={onOpen}
        style={{
          ...FS, fontSize: 11, fontWeight: 700, color: '#c8102e',
          background: 'none', border: '1px solid #c8102e', padding: '4px 10px', cursor: 'pointer', flexShrink: 0
        }}
      >
        Change Vehicle
      </button>
    </div>
  );
}

// ─── SKU Filters ───────────────────────────────────────────────────────────

function SkuFilters({ section, skuOptions, selections, onSelect, recommendedSegments }) {
  const steps = section.steps ?? [];

  return (
    <div style={{ marginBottom: 28 }}>
      <SectionHeader number="01" label={section.label} description={section.description} />
      {steps.map(step => (
        <FilterStep
          key={step.id}
          step={step}
          skuOptions={skuOptions}
          selections={selections}
          steps={steps}
          onSelect={onSelect}
          recommendedSegments={recommendedSegments}
        />
      ))}
    </div>
  );
}

function FilterStep({ step, skuOptions, selections, steps, onSelect, recommendedSegments }) {
  const currentVal = selections[step.id];

  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{
        fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: '#1a2744', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6
      }}>
        {step.label}
        {step.required && <span style={{ color: '#c8102e' }}>*</span>}
        {step._verification === 'needs_verification' && (
          <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
            UNVERIFIED
          </span>
        )}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {step.options.map(opt => {
          const isSelected = currentVal === opt.id;
          const isRecommended = recommendedSegments.includes(opt.skuSegment);
          // Dead-end check: remove this step's selection, test if selecting opt would match anything
          const withoutCurrent = { ...selections };
          delete withoutCurrent[step.id];
          const disabled = !isSelected && !wouldHaveMatches(skuOptions, withoutCurrent, steps, step.id, opt.id);

          return (
            <div key={opt.id} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <button
                disabled={disabled}
                onClick={() => !disabled && onSelect(step.id, opt.id)}
                title={disabled ? 'No matching SKUs for this combination' : opt.description || undefined}
                style={{
                  ...FS, fontSize: 12, padding: '6px 14px',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  border: `2px solid ${isSelected ? '#c8102e' : disabled ? '#e5e5e5' : isRecommended ? '#16a34a' : '#d0d0d0'}`,
                  background: isSelected ? '#c8102e' : disabled ? '#f5f5f5' : isRecommended ? '#f0fdf4' : '#fff',
                  color: isSelected ? '#fff' : disabled ? '#bbb' : '#333',
                  fontWeight: isSelected ? 700 : 400,
                  opacity: disabled ? 0.55 : 1,
                  transition: 'all 0.12s',
                }}
              >
                {opt.label}
              </button>
              {disabled && !isSelected && (
                <span style={{ fontSize: 9, color: '#dc2626', fontWeight: 700 }}>NO MATCH</span>
              )}
              {isRecommended && !isSelected && !disabled && (
                <span style={{ fontSize: 9, color: '#15803d', fontWeight: 700, background: '#dcfce7', padding: '1px 5px', border: '1px solid #bbf7d0' }}>
                  ✓ FITS
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Available SKU Table ───────────────────────────────────────────────────

function SkuTable({ skuOptions, remainingSkus, selectedSkuId, onSelectSku }) {
  const count = remainingSkus.length;
  const total = skuOptions.length;

  return (
    <div style={{ marginBottom: 28 }}>
      <SectionHeader number="02" label="Available SKUs" description="Filters narrow this list. Select a row to configure quote." />

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', marginBottom: 12,
        background: count === 1 ? '#f0fdf4' : count === 0 ? '#fef2f2' : '#eff6ff',
        border: `1px solid ${count === 1 ? '#bbf7d0' : count === 0 ? '#fecaca' : '#bfdbfe'}`,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: count === 1 ? '#15803d' : count === 0 ? '#991b1b' : '#1e40af' }}>
          {count === total
            ? `${count} SKUs — apply filters to narrow`
            : count === 0
              ? 'No matching SKUs'
              : count === 1
                ? '1 SKU matched — select row to proceed'
                : `${count} of ${total} SKUs remaining`}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', ...FS }}>
          <thead>
            <tr style={{ background: '#1a2744', color: '#fff' }}>
              <th style={TH}>Select</th>
              <th style={TH}>SKU</th>
              <th style={TH}>Length</th>
              <th style={TH}>Color</th>
              <th style={TH}>Spec</th>
              <th style={TH}>MSRP</th>
            </tr>
          </thead>
          <tbody>
            {remainingSkus.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '14px 12px', textAlign: 'center', color: '#991b1b', fontStyle: 'italic' }}>
                  No SKUs match current filters.
                </td>
              </tr>
            ) : remainingSkus.map((sku, i) => {
              const isSelected = selectedSkuId === sku.sku;
              const isOnly = count === 1;
              return (
                <tr
                  key={sku.sku}
                  onClick={() => onSelectSku(sku.sku)}
                  style={{
                    background: isSelected ? '#e8f5e9' : isOnly && !isSelected ? '#f0fdf4' : i % 2 === 0 ? '#f7f8fa' : '#fff',
                    cursor: 'pointer',
                    outline: isSelected ? '2px solid #16a34a' : 'none',
                  }}
                >
                  <td style={{ ...TD, textAlign: 'center' }}>
                    <input
                      type="radio"
                      readOnly
                      checked={isSelected}
                      style={{ accentColor: '#16a34a', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ ...TD, fontFamily: 'monospace', fontWeight: 700, color: '#1a2744' }}>
                    {sku.sku}
                    {isOnly && !isSelected && (
                      <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '1px 4px', border: '1px solid #bbf7d0' }}>
                        SELECT
                      </span>
                    )}
                  </td>
                  <td style={TD}>{sku.attributes?.length ? `${sku.attributes.length}"` : '—'}</td>
                  <td style={TD}>{sku.attributes?.color ?? '—'}</td>
                  <td style={TD}>{sku.attributes?.spec ?? '—'}</td>
                  <td style={{ ...TD, fontWeight: 600 }}>
                    {sku.price != null ? `$${sku.price.toLocaleString()}` : 'Contact'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TH = { padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' };
const TD = { padding: '8px 12px', color: '#333', verticalAlign: 'middle' };

// ─── Technical Details ─────────────────────────────────────────────────────

function TechnicalDetails({ section, selections, onSelect }) {
  const steps = section.steps ?? [];
  return (
    <div style={{ marginBottom: 28 }}>
      <SectionHeader number="03" label={section.label} description={section.description} />
      <div style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #e5e7eb', marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>
          ℹ Informational only — these do not change the selected base SKU.
        </p>
      </div>
      {steps.map(step => (
        <div key={step.id} style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#374151', marginBottom: 6 }}>
            {step.label}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {step.options.map(opt => {
              const isSelected = selections[step.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onSelect(step.id, opt.id)}
                  title={opt.description || undefined}
                  style={{
                    ...FS, fontSize: 12, padding: '5px 12px', cursor: 'pointer',
                    border: `2px solid ${isSelected ? '#1a2744' : '#d0d0d0'}`,
                    background: isSelected ? '#1a2744' : '#fff',
                    color: isSelected ? '#fff' : '#555',
                    fontWeight: isSelected ? 700 : 400,
                    transition: 'all 0.1s',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Accessories Section ───────────────────────────────────────────────────

function AccessoriesSection({ section, selectedAccessories, onToggle }) {
  const items = section.items ?? [];
  const required = items.filter(i => i.type === 'required');
  const optional = items.filter(i => i.type !== 'required');

  return (
    <div style={{ marginBottom: 28 }}>
      <SectionHeader number="04" label={section.label} description={section.description} />
      {required.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#991b1b', marginBottom: 6 }}>
            Required Dependencies
          </p>
          {required.map(item => <AccessoryRow key={item.id} item={item} checked forceChecked />)}
        </div>
      )}
      {optional.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#374151', marginBottom: 6 }}>
            Optional Accessories
          </p>
          {optional.map(item => (
            <AccessoryRow
              key={item.id}
              item={item}
              checked={selectedAccessories.includes(item.id)}
              onToggle={() => onToggle(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AccessoryRow({ item, checked, onToggle, forceChecked }) {
  return (
    <div
      onClick={() => !forceChecked && onToggle?.()}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', marginBottom: 4,
        background: checked ? '#f0fdf4' : '#fafafa',
        border: `1px solid ${checked ? '#bbf7d0' : '#e5e7eb'}`,
        cursor: forceChecked ? 'default' : 'pointer',
      }}
    >
      <input
        type="checkbox" checked={checked} readOnly={forceChecked}
        onChange={() => !forceChecked && onToggle?.()}
        style={{ cursor: forceChecked ? 'default' : 'pointer', accentColor: '#16a34a' }}
      />
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{item.label}</span>
        {item.sku && <span style={{ marginLeft: 8, fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{item.sku}</span>}
        {item._note && <span style={{ marginLeft: 6, fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>⚠ {item._note}</span>}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', flexShrink: 0 }}>
        {item.price != null ? `$${item.price.toLocaleString()}` : 'Price TBD'}
      </span>
    </div>
  );
}

// ─── Quote Panel ───────────────────────────────────────────────────────────

function QuotePanel({ quotePayload }) {
  const [show, setShow] = useState(false);

  if (!quotePayload) {
    return (
      <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e5e7eb', marginTop: 8 }}>
        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
          Select a SKU row above to generate the quote payload.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '14px 16px', background: '#f0fdf4', border: '2px solid #16a34a', marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={15} style={{ color: '#16a34a' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>
            SKU Selected — {quotePayload.selectedBaseSku}
          </span>
        </div>
        <button
          onClick={() => setShow(p => !p)}
          style={{
            ...FS, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', background: '#1a2744', color: '#fff', border: 'none', cursor: 'pointer'
          }}
        >
          <ClipboardList size={11} /> {show ? 'Hide' : 'View'} Quote Payload
        </button>
      </div>
      <p style={{ fontSize: 12, color: '#374151', margin: '0 0 4px' }}>
        MSRP: {quotePayload.basePrice != null ? `$${quotePayload.basePrice.toLocaleString()}` : 'Contact for pricing'}
      </p>
      {quotePayload.reviewFlags?.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {quotePayload.reviewFlags.map((flag, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: 11, color: '#92400e', marginBottom: 3 }}>
              <AlertTriangle size={11} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
              {flag}
            </div>
          ))}
        </div>
      )}
      {show && (
        <pre style={{
          marginTop: 10, padding: '10px 12px', background: '#1a2744', color: '#7dd3fc',
          fontSize: 11, fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.6,
        }}>
          {JSON.stringify(quotePayload, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ─── Main Module ───────────────────────────────────────────────────────────

export default function ConfiguratorModule({ configuratorData, verticalId, categoryId }) {
  const { selectedVehicle } = useVehicle();
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [filterSelections, setFilterSelections] = useState({});
  const [techSelections, setTechSelections]     = useState({});
  const [accessories, setAccessories]           = useState([]);
  const [selectedSkuId, setSelectedSkuId]       = useState(null);

  const {
    sections, skuOptions = [], vehicleRules = [],
    productFamily, id: configuratorId
  } = configuratorData;

  const skuSteps = sections?.skuSelector?.steps ?? [];

  // Recommended length/mount segments from vehicle rules
  const recommendedSegments = useMemo(() => {
    if (!selectedVehicle) return [];
    const match = vehicleRules.find(r =>
      r.displayName?.toLowerCase().includes(selectedVehicle.model?.toLowerCase())
      || r.vehicleId?.toLowerCase().includes(selectedVehicle.model?.toLowerCase().replace(/[\s/]/g, '_'))
    );
    return match ? [match.recommendedLength] : [];
  }, [selectedVehicle, vehicleRules]);

  // Filter SKUs based on current selections
  const remainingSkus = useMemo(
    () => filterSkus(skuOptions, filterSelections, skuSteps),
    [skuOptions, filterSelections, skuSteps]
  );

  // Keep selectedSkuId valid — clear if it's no longer in remaining set
  const resolvedSkuObj = useMemo(
    () => remainingSkus.find(s => s.sku === selectedSkuId) ?? null,
    [remainingSkus, selectedSkuId]
  );

  const handleFilterSelect = useCallback((stepId, optionId) => {
    setFilterSelections(prev => {
      const next = prev[stepId] === optionId
        ? (() => { const n = { ...prev }; delete n[stepId]; return n; })()
        : { ...prev, [stepId]: optionId };
      return next;
    });
    setSelectedSkuId(null); // clear row selection when filters change
  }, []);

  const handleTechSelect = useCallback((stepId, optionId) => {
    setTechSelections(prev =>
      prev[stepId] === optionId ? { ...prev, [stepId]: null } : { ...prev, [stepId]: optionId }
    );
  }, []);

  const handleToggleAccessory = useCallback((itemId) => {
    setAccessories(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const handleReset = useCallback(() => {
    setFilterSelections({});
    setTechSelections({});
    setAccessories([]);
    setSelectedSkuId(null);
  }, []);

  // Build quote payload when a SKU row is selected
  const quotePayload = useMemo(() => {
    if (!resolvedSkuObj) return null;
    const accItems = sections?.accessories?.items ?? [];
    const selectedAcc = accItems.filter(i => accessories.includes(i.id) || i.type === 'required');
    const reviewFlags = [
      ...(selectedVehicle ? [] : ['No vehicle selected — vehicle-specific fitment not confirmed']),
      ...skuSteps
        .filter(s => s._verification === 'needs_verification' && filterSelections[s.id])
        .map(s => `Unverified attribute: ${s.label}`),
      ...accItems.filter(i => i._note).map(i => `Required hardware needs review: ${i.label}`),
    ];
    return {
      verticalId,
      categoryId,
      productFamily,
      configuratorId,
      selectedVehicle: selectedVehicle
        ? { year: selectedVehicle.year, make: selectedVehicle.make, model: selectedVehicle.model }
        : null,
      selectedFilters: Object.entries(filterSelections).map(([stepId, optId]) => {
        const step = skuSteps.find(s => s.id === stepId);
        const opt  = step?.options.find(o => o.id === optId);
        return { stepId, stepLabel: step?.label, optionId: optId, optionLabel: opt?.label };
      }),
      selectedBaseSku: resolvedSkuObj.sku,
      basePrice: resolvedSkuObj.price,
      dependencySkus: selectedAcc.filter(i => i.type === 'required').map(i => i.sku),
      accessorySkus:  selectedAcc.filter(i => i.type !== 'required').map(i => i.sku),
      reviewFlags,
    };
  }, [resolvedSkuObj, filterSelections, skuSteps, accessories, sections, verticalId, categoryId, productFamily, configuratorId, selectedVehicle]);

  const showTechAndAcc = !!resolvedSkuObj;

  return (
    <div style={{ ...FS, border: '1px solid #e8e8e8', background: '#fff' }}>
      {/* Header */}
      <div style={{
        background: '#1a2744', color: '#fff', padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Product Configurator
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{productFamily}</p>
        </div>
        <button
          onClick={handleReset}
          style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.25)',
            color: '#94a3b8', cursor: 'pointer', padding: '5px 10px',
            fontSize: 11, display: 'flex', alignItems: 'center', gap: 5
          }}
        >
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      <div style={{ padding: '24px 20px' }}>
        {/* Vehicle Banner — reads VehicleContext, opens existing modal */}
        <VehicleBanner selectedVehicle={selectedVehicle} onOpen={() => setVehicleModalOpen(true)} />

        {/* Section 1 — SKU Filters */}
        {sections?.skuSelector && (
          <SkuFilters
            section={sections.skuSelector}
            skuOptions={skuOptions}
            selections={filterSelections}
            onSelect={handleFilterSelect}
            recommendedSegments={recommendedSegments}
          />
        )}

        {/* Section 2 — Available SKU Table */}
        <SkuTable
          skuOptions={skuOptions}
          remainingSkus={remainingSkus}
          selectedSkuId={selectedSkuId}
          onSelectSku={setSelectedSkuId}
        />

        {/* Section 3 — Technical Details (shown after SKU selected) */}
        {showTechAndAcc && sections?.technicalOptions && (
          <TechnicalDetails
            section={sections.technicalOptions}
            selections={techSelections}
            onSelect={handleTechSelect}
          />
        )}

        {/* Section 4 — Accessories (shown after SKU selected) */}
        {showTechAndAcc && sections?.accessories && (
          <AccessoriesSection
            section={sections.accessories}
            selectedAccessories={accessories}
            onToggle={handleToggleAccessory}
          />
        )}

        {/* Quote Payload */}
        <QuotePanel quotePayload={quotePayload} />
      </div>

      {/* Prototype watermark */}
      <div style={{ borderTop: '1px solid #f0f0f0', padding: '8px 20px', background: '#fafafa' }}>
        <p style={{ margin: 0, fontSize: 10, color: '#bbb', letterSpacing: '0.04em' }}>
          ⚠ PROTOTYPE — No Shopify connection. Data sourced from TFRSupply Configurator Master v5.
        </p>
      </div>

      {/* Vehicle selector modal — same existing component */}
      {vehicleModalOpen && <VehicleSelectorModal onClose={() => setVehicleModalOpen(false)} />}
    </div>
  );
}