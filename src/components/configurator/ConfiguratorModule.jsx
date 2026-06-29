/**
 * components/configurator/ConfiguratorModule.jsx
 *
 * Generic, fully data-driven configurator module.
 * Powers Navigator Serial, Navigator Linear Mini, Navigator Discrete — and any future family.
 *
 * Three sections:
 *   1. SKU Selector  — options that filter base SKU variants
 *   2. Technical Options — capabilities, do NOT filter SKU
 *   3. Accessories & Add-ons — required deps + optional items
 *
 * Dead-end prevention:
 *   After every selection, each remaining option is tested against the
 *   current filter set. If selecting it would produce 0 matching variants,
 *   it is disabled before the customer can click it.
 *
 * Quote Payload:
 *   Emits a complete quote object when exactly one SKU resolves.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useVehicle } from '@/context/VehicleContext';
import { CheckCircle, XCircle, AlertTriangle, ChevronRight, Package, FlaskConical, RotateCcw, ClipboardList } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

// ─── SKU Filtering Engine (pure, inline) ──────────────────────────────────

function filterSkus(skuOptions, currentSelections, steps) {
  return skuOptions.filter(skuOpt => {
    for (const step of steps) {
      if (!step.skuSegmentKey) continue;
      const val = currentSelections[step.id];
      if (!val) continue;
      const opt = step.options.find(o => o.id === val);
      if (!opt) continue;
      const attrKey = step.skuSegmentKey;
      const attrVal = opt.skuSegment;

      if (!(attrKey in skuOpt.attributes)) continue; // SKU doesn't constrain this attr

      if (step._verification === 'confirmed') {
        if (skuOpt.attributes[attrKey] !== attrVal) return false;
      } else {
        // Soft filter: only apply if the value exists on at least one SKU
        const anyMatch = skuOptions.some(s => s.attributes[attrKey] === attrVal);
        if (anyMatch && skuOpt.attributes[attrKey] !== attrVal) return false;
      }
    }
    return true;
  });
}

// Would selecting this option produce ≥1 remaining SKUs?
function wouldHaveMatches(skuOptions, currentSelections, steps, stepId, optionId) {
  const step = steps.find(s => s.id === stepId);
  if (!step) return true;
  const hypothetical = { ...currentSelections, [stepId]: optionId };
  return filterSkus(skuOptions, hypothetical, steps).length > 0;
}

// ─── Section Header ────────────────────────────────────────────────────────

function SectionHeader({ number, label, description }) {
  return (
    <div style={{ borderBottom: '2px solid #1a2744', paddingBottom: 8, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: '#fff', background: '#c8102e',
          padding: '2px 8px', letterSpacing: '0.06em'
        }}>
          {number}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a2744' }}>
          {label}
        </span>
      </div>
      {description && (
        <p style={{ fontSize: 11, color: '#888', margin: '6px 0 0' }}>{description}</p>
      )}
    </div>
  );
}

// ─── SKU Selector Section ──────────────────────────────────────────────────

function SkuSelectorSection({ section, skuOptions, selections, onSelect, recommendedLengths }) {
  const steps = section.steps ?? [];
  const remaining = filterSkus(skuOptions, selections, steps);

  return (
    <div style={{ marginBottom: 32 }}>
      <SectionHeader number="01" label={section.label} description={section.description} />

      {/* Remaining count badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', marginBottom: 16,
        background: remaining.length === 1 ? '#f0fdf4' : remaining.length === 0 ? '#fef2f2' : '#eff6ff',
        border: `1px solid ${remaining.length === 1 ? '#bbf7d0' : remaining.length === 0 ? '#fecaca' : '#bfdbfe'}`,
      }}>
        {remaining.length === 1
          ? <CheckCircle size={12} style={{ color: '#16a34a' }} />
          : remaining.length === 0
            ? <XCircle size={12} style={{ color: '#dc2626' }} />
            : <ChevronRight size={12} style={{ color: '#1d4ed8' }} />
        }
        <span style={{ fontSize: 11, fontWeight: 700, color: remaining.length === 1 ? '#15803d' : remaining.length === 0 ? '#991b1b' : '#1e40af' }}>
          {remaining.length === 1
            ? `1 variant matched — SKU resolved`
            : remaining.length === 0
              ? 'No matching variants'
              : `${remaining.length} variant${remaining.length === 1 ? '' : 's'} remaining`}
        </span>
      </div>

      {steps.map(step => (
        <SkuStep
          key={step.id}
          step={step}
          skuOptions={skuOptions}
          selections={selections}
          steps={steps}
          onSelect={onSelect}
          recommendedLengths={recommendedLengths}
        />
      ))}
    </div>
  );
}

function SkuStep({ step, skuOptions, selections, steps, onSelect, recommendedLengths }) {
  const currentVal = selections[step.id];

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#1a2744', marginBottom: 8,
        display: 'flex', alignItems: 'center', gap: 6
      }}>
        {step.label}
        {step.required && <span style={{ color: '#c8102e' }}>*</span>}
        {step._verification === 'needs_verification' && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
            padding: '1px 5px', background: '#f0f9ff', color: '#0369a1',
            border: '1px solid #bae6fd'
          }}>UNVERIFIED</span>
        )}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {step.options.map(opt => {
          const isSelected = currentVal === opt.id;
          const isRecommended = step.id === 'length' && recommendedLengths.includes(opt.skuSegment);
          // Test dead-end: would selecting this produce 0 remaining variants?
          const selectionsWithoutThis = { ...selections };
          delete selectionsWithoutThis[step.id];
          const wouldMatch = wouldHaveMatches(skuOptions, selectionsWithoutThis, steps, step.id, opt.id);
          const isDisabled = !isSelected && !wouldMatch;

          return (
            <div key={opt.id} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <button
                disabled={isDisabled}
                onClick={() => !isDisabled && onSelect(step.id, opt.id)}
                title={isDisabled ? 'No matching variants for this combination' : opt.description || undefined}
                style={{
                  ...FS,
                  fontSize: 12, padding: '6px 14px', cursor: isDisabled ? 'not-allowed' : 'pointer',
                  border: `2px solid ${isSelected ? '#c8102e' : isDisabled ? '#e5e5e5' : isRecommended ? '#16a34a' : '#d0d0d0'}`,
                  background: isSelected ? '#c8102e' : isDisabled ? '#f5f5f5' : isRecommended ? '#f0fdf4' : '#fff',
                  color: isSelected ? '#fff' : isDisabled ? '#bbb' : '#333',
                  fontWeight: isSelected ? 700 : 400,
                  opacity: isDisabled ? 0.55 : 1,
                  transition: 'all 0.12s',
                }}
              >
                {opt.label}
              </button>
              {isDisabled && (
                <span style={{ fontSize: 9, color: '#dc2626', fontWeight: 700, letterSpacing: '0.04em' }}>
                  INVALID PATH
                </span>
              )}
              {isRecommended && !isSelected && !isDisabled && (
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

// ─── Technical Options Section ─────────────────────────────────────────────

function TechnicalOptionsSection({ section, selections, onSelect }) {
  const steps = section.steps ?? [];
  return (
    <div style={{ marginBottom: 32 }}>
      <SectionHeader number="02" label={section.label} description={section.description} />
      <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e5e7eb', marginBottom: 14 }}>
        <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>
          ℹ These selections describe your product requirements and do not affect SKU resolution.
        </p>
      </div>
      {steps.map(step => (
        <div key={step.id} style={{ marginBottom: 16 }}>
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
                    ...FS,
                    fontSize: 12, padding: '5px 12px', cursor: 'pointer',
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

function AccessoriesSection({ section, selectedAccessories, onToggleAccessory }) {
  const items = section.items ?? [];
  const required = items.filter(i => i.type === 'required');
  const optional = items.filter(i => i.type !== 'required');

  return (
    <div style={{ marginBottom: 32 }}>
      <SectionHeader number="03" label={section.label} description={section.description} />
      {required.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#991b1b', marginBottom: 6 }}>
            Required Dependencies
          </p>
          {required.map(item => (
            <AccessoryRow key={item.id} item={item} isSelected={selectedAccessories.includes(item.id)} onToggle={onToggleAccessory} forceChecked />
          ))}
        </div>
      )}
      {optional.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#374151', marginBottom: 6 }}>
            {required.length > 0 ? 'Optional Accessories' : 'Available Accessories'}
          </p>
          {optional.map(item => (
            <AccessoryRow key={item.id} item={item} isSelected={selectedAccessories.includes(item.id)} onToggle={onToggleAccessory} />
          ))}
        </div>
      )}
    </div>
  );
}

function AccessoryRow({ item, isSelected, onToggle, forceChecked }) {
  const checked = forceChecked || isSelected;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px', marginBottom: 4,
      background: checked ? '#f0fdf4' : '#fafafa',
      border: `1px solid ${checked ? '#bbf7d0' : '#e5e7eb'}`,
      cursor: forceChecked ? 'default' : 'pointer',
    }}
      onClick={() => !forceChecked && onToggle(item.id)}
    >
      <input
        type="checkbox"
        checked={checked}
        readOnly={forceChecked}
        onChange={() => !forceChecked && onToggle(item.id)}
        style={{ cursor: forceChecked ? 'default' : 'pointer', accentColor: '#16a34a' }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{item.label}</span>
        {item.sku && (
          <span style={{ marginLeft: 8, fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{item.sku}</span>
        )}
        {item._note && (
          <span style={{ marginLeft: 6, fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>⚠ {item._note}</span>
        )}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', flexShrink: 0 }}>
        {item.price != null ? `$${item.price.toLocaleString()}` : 'Price TBD'}
      </span>
    </div>
  );
}

// ─── Resolution Panel ──────────────────────────────────────────────────────

function ResolutionPanel({ resolvedSku, matchCount, quotePayload, configuratorData }) {
  const [showPayload, setShowPayload] = useState(false);

  if (matchCount === 0) {
    return (
      <div style={{ padding: '14px 16px', background: '#fef2f2', border: '1px solid #fecaca', marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <XCircle size={15} style={{ color: '#dc2626' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#991b1b' }}>No matching variants</span>
        </div>
        <p style={{ fontSize: 12, color: '#991b1b', margin: '6px 0 0' }}>
          The current combination has no matching SKUs. This state should not be reachable from the UI — please report if you see it.
        </p>
      </div>
    );
  }

  if (!resolvedSku) {
    return (
      <div style={{ padding: '12px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <ChevronRight size={13} style={{ color: '#1d4ed8' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1e40af' }}>
            {matchCount} variant{matchCount !== 1 ? 's' : ''} remaining — complete required selections above
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '14px 16px', background: '#f0fdf4', border: '2px solid #16a34a', marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <CheckCircle size={16} style={{ color: '#16a34a' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>SKU Resolved</span>
      </div>
      <p style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#1a2744', margin: '0 0 6px' }}>
        {resolvedSku.sku}
      </p>
      <p style={{ fontSize: 12, color: '#374151', margin: '0 0 10px' }}>
        MSRP: {resolvedSku.price != null ? `$${resolvedSku.price.toLocaleString()}` : 'Contact for pricing'}
      </p>
      <button
        onClick={() => setShowPayload(p => !p)}
        style={{
          ...FS, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 12px', background: '#1a2744', color: '#fff', border: 'none', cursor: 'pointer'
        }}
      >
        <ClipboardList size={12} /> {showPayload ? 'Hide' : 'View'} Quote Payload
      </button>
      {showPayload && (
        <pre style={{
          marginTop: 10, padding: '10px 12px', background: '#1a2744', color: '#7dd3fc',
          fontSize: 11, fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.6,
          borderRadius: 2,
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
  const [skuSelections, setSkuSelections]   = useState({});
  const [techSelections, setTechSelections] = useState({});
  const [accessories, setAccessories]       = useState([]);

  const { sections, skuOptions = [], vehicleRules = [], productFamily, id: configuratorId } = configuratorData;
  const skuSteps = sections?.skuSelector?.steps ?? [];

  // Recommend lengths based on selected vehicle
  const recommendedLengths = useMemo(() => {
    if (!selectedVehicle) return [];
    const match = vehicleRules.find(r =>
      r.vehicleId?.toLowerCase() === (selectedVehicle.model?.toLowerCase().replace(/\s+/g, '_') || '')
      || r.displayName?.toLowerCase().includes(selectedVehicle.model?.toLowerCase())
    );
    return match ? [match.recommendedLength] : [];
  }, [selectedVehicle, vehicleRules]);

  const remainingSkus = useMemo(
    () => filterSkus(skuOptions, skuSelections, skuSteps),
    [skuOptions, skuSelections, skuSteps]
  );

  const resolvedSku = remainingSkus.length === 1 ? remainingSkus[0] : null;

  const handleSkuSelect = useCallback((stepId, optionId) => {
    setSkuSelections(prev => {
      // Toggle off if same value
      if (prev[stepId] === optionId) {
        const next = { ...prev };
        delete next[stepId];
        return next;
      }
      return { ...prev, [stepId]: optionId };
    });
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
    setSkuSelections({});
    setTechSelections({});
    setAccessories([]);
  }, []);

  // Build quote payload
  const quotePayload = useMemo(() => {
    if (!resolvedSku) return null;
    const accItems = (sections?.accessories?.items ?? []).filter(i => accessories.includes(i.id) || i.type === 'required');
    return {
      verticalId,
      categoryId,
      productFamily,
      configuratorId,
      vehicle: selectedVehicle
        ? { year: selectedVehicle.year, make: selectedVehicle.make, model: selectedVehicle.model }
        : null,
      selectedOptions: Object.entries(skuSelections).map(([stepId, optId]) => {
        const step = skuSteps.find(s => s.id === stepId);
        const opt  = step?.options.find(o => o.id === optId);
        return { stepId, stepLabel: step?.label, optionId: optId, optionLabel: opt?.label };
      }),
      resolvedBaseSku: resolvedSku.sku,
      basePrice: resolvedSku.price,
      dependencySkus: accItems.filter(i => i.type === 'required').map(i => i.sku),
      optionalUpsells: accItems.filter(i => i.type !== 'required').map(i => i.sku),
      reviewFlags: [
        ...skuSteps.filter(s => s._verification === 'needs_verification' && skuSelections[s.id])
          .map(s => `Unverified attribute: ${s.label}`),
        ...(sections?.accessories?.items ?? []).filter(i => i._note).map(i => `Data gap: ${i.label} — ${i._note}`),
      ],
    };
  }, [resolvedSku, skuSelections, skuSteps, accessories, sections, verticalId, categoryId, productFamily, configuratorId, selectedVehicle]);

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
        {/* SECTION 1 — SKU Selector */}
        {sections?.skuSelector && (
          <SkuSelectorSection
            section={sections.skuSelector}
            skuOptions={skuOptions}
            selections={skuSelections}
            onSelect={handleSkuSelect}
            recommendedLengths={recommendedLengths}
          />
        )}

        {/* SECTION 2 — Technical Options */}
        {sections?.technicalOptions && (
          <TechnicalOptionsSection
            section={sections.technicalOptions}
            selections={techSelections}
            onSelect={handleTechSelect}
          />
        )}

        {/* SECTION 3 — Accessories */}
        {sections?.accessories && (
          <AccessoriesSection
            section={sections.accessories}
            selectedAccessories={accessories}
            onToggleAccessory={handleToggleAccessory}
          />
        )}

        {/* Resolution panel */}
        <ResolutionPanel
          resolvedSku={resolvedSku}
          matchCount={remainingSkus.length}
          quotePayload={quotePayload}
          configuratorData={configuratorData}
        />
      </div>

      {/* Prototype watermark */}
      <div style={{ borderTop: '1px solid #f0f0f0', padding: '8px 20px', background: '#fafafa' }}>
        <p style={{ margin: 0, fontSize: 10, color: '#bbb', letterSpacing: '0.04em' }}>
          ⚠ PROTOTYPE — Data sourced from TFRSupply Configurator Master v5. No Shopify connection.
        </p>
      </div>
    </div>
  );
}