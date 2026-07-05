/**
 * components/configurator/ConfiguratorModule.tsx
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
 * UI state vs. variant resolution:
 *   filterSelections/accessories/selectedSkuId (below) are pure UI selection
 *   state — they only decide which SKU row is the candidate. Once filtering
 *   narrows to exactly one SKU, `useShopifyVariantResolver` (a separate
 *   module — see src/services/shopifyVariantResolver) resolves that SKU to
 *   a Shopify variant: variant ID, live price, availability, and whether
 *   Add to Cart is enabled. This module never computes that resolution
 *   itself, so the two concerns can change independently.
 *
 * Dead-end prevention:
 *   Each filter option is tested before render. If selecting it would produce
 *   0 remaining SKUs, it is disabled before the customer can click it.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { useVehicle } from '@/context/VehicleContext';
import { lookupSkus } from '@/services/commerceLookupService';
import type { CommerceLookupEntry } from '@/services/commerceLookupService';
import { useShopifyVariantResolver } from '@/hooks/shopifyVariantResolver';
import VehicleSelectorModal from '@/components/navigator/VehicleSelectorModal';
import {
  CheckCircle, RotateCcw, ClipboardList,
  Truck, AlertTriangle, ShoppingCart, Send
} from 'lucide-react';
import type {
  Configurator,
  ConfiguratorAccessoryItem,
  ConfiguratorCommerceLine,
  ConfiguratorQuotePayload,
  ConfiguratorSection,
  ConfiguratorSkuOption,
  ConfiguratorStep,
  ConfiguratorVehicleSelection,
  ShopifyVariantAvailability,
} from '@/types';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

type FilterSelections = Record<string, string>;

// ─── SKU Filtering Engine ──────────────────────────────────────────────────

function filterSkus(skuOptions: ConfiguratorSkuOption[], selections: FilterSelections, steps: ConfiguratorStep[]): ConfiguratorSkuOption[] {
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

function wouldHaveMatches(skuOptions: ConfiguratorSkuOption[], selections: FilterSelections, steps: ConfiguratorStep[], stepId: string, optionId: string): boolean {
  const hypothetical = { ...selections, [stepId]: optionId };
  return filterSkus(skuOptions, hypothetical, steps).length > 0;
}

// ─── Section Header ────────────────────────────────────────────────────────

interface SectionHeaderProps {
  number: string;
  label: string;
  description?: string;
}

function SectionHeader({ number, label, description }: SectionHeaderProps) {
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

interface VehicleBannerProps {
  selectedVehicle: ConfiguratorVehicleSelection | null;
  onOpen: () => void;
}

function VehicleBanner({ selectedVehicle, onOpen }: VehicleBannerProps) {
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

interface SkuFiltersProps {
  section: ConfiguratorSection;
  skuOptions: ConfiguratorSkuOption[];
  selections: FilterSelections;
  onSelect: (stepId: string, optionId: string) => void;
  recommendedSegments: string[];
}

function SkuFilters({ section, skuOptions, selections, onSelect, recommendedSegments }: SkuFiltersProps) {
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

interface FilterStepProps {
  step: ConfiguratorStep;
  skuOptions: ConfiguratorSkuOption[];
  selections: FilterSelections;
  steps: ConfiguratorStep[];
  onSelect: (stepId: string, optionId: string) => void;
  recommendedSegments: string[];
}

function FilterStep({ step, skuOptions, selections, steps, onSelect, recommendedSegments }: FilterStepProps) {
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

interface AttrColumn {
  key: string;
  label: string;
}

// Derive attribute columns dynamically from whatever keys exist in skuOptions attributes
function getAttrColumns(skuOptions: ConfiguratorSkuOption[]): AttrColumn[] {
  const keys = new Set<string>();
  skuOptions.forEach(s => Object.keys(s.attributes ?? {}).forEach(k => keys.add(k)));
  const LABELS: Record<string, string> = { length: 'Length', color: 'Warning Color', mount: 'Mount', spec: 'Spec', wiring: 'Wiring' };
  return [...keys].map(k => ({ key: k, label: LABELS[k] ?? k }));
}

interface SkuTableProps {
  skuOptions: ConfiguratorSkuOption[];
  remainingSkus: ConfiguratorSkuOption[];
  selectedSkuId: string | null;
  onSelectSku: (sku: string) => void;
  commerceData: Record<string, CommerceLookupEntry>;
}

function SkuTable({ skuOptions, remainingSkus, selectedSkuId, onSelectSku, commerceData }: SkuTableProps) {
  const count = remainingSkus.length;
  const total = skuOptions.length;
  const attrCols = useMemo(() => getAttrColumns(skuOptions), [skuOptions]);

  return (
    <div style={{ marginBottom: 28 }}>
      <SectionHeader number="02" label="Available SKUs" description="Filters narrow this list in real time. Select a row to set your base SKU." />

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', marginBottom: 12,
        background: count === 1 ? '#f0fdf4' : count === 0 ? '#fef2f2' : '#eff6ff',
        border: `1px solid ${count === 1 ? '#bbf7d0' : count === 0 ? '#fecaca' : '#bfdbfe'}`,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: count === 1 ? '#15803d' : count === 0 ? '#991b1b' : '#1e40af' }}>
          {count === total
            ? `${count} SKUs — apply filters above to narrow`
            : count === 0
              ? 'No matching SKUs'
              : count === 1
                ? '1 SKU matched — select the row to proceed'
                : `${count} of ${total} SKUs remaining`}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', ...FS }}>
          <thead>
            <tr style={{ background: '#1a2744', color: '#fff' }}>
              <th style={TH}>Select</th>
              <th style={TH}>SKU</th>
              {attrCols.map(c => <th key={c.key} style={TH}>{c.label}</th>)}
              <th style={TH}>MSRP</th>
              <th style={TH}>Status</th>
            </tr>
          </thead>
          <tbody>
            {remainingSkus.length === 0 ? (
              <tr>
                <td colSpan={4 + attrCols.length} style={{ padding: '14px 12px', textAlign: 'center', color: '#991b1b', fontStyle: 'italic' }}>
                  No SKUs match current filters.
                </td>
              </tr>
            ) : remainingSkus.map((sku, i) => {
              const isSelected = selectedSkuId === sku.sku;
              const isOnly = count === 1;
              const needsReview = sku.price == null;
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
                    <input type="radio" readOnly checked={isSelected} style={{ accentColor: '#16a34a', cursor: 'pointer' }} />
                  </td>
                  <td style={{ ...TD, fontFamily: 'monospace', fontWeight: 700, color: '#1a2744' }}>
                    {sku.sku}
                    {isOnly && !isSelected && (
                      <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '1px 4px', border: '1px solid #bbf7d0' }}>
                        SELECT
                      </span>
                    )}
                  </td>
                  {attrCols.map(c => (
                    <td key={c.key} style={TD}>
                      {c.key === 'length' && sku.attributes?.length ? `${sku.attributes.length}"` : (sku.attributes?.[c.key] ?? '—')}
                    </td>
                  ))}
                  <td style={{ ...TD, fontWeight: 600 }}>
                    {(() => {
                      const cd = commerceData?.[sku.sku];
                      if (!cd || cd.status === 'unmatched') return <span style={{ color: '#6b7280' }}>Contact</span>;
                      if (cd.price != null) return `$${cd.price.toLocaleString()}`;
                      return <span style={{ fontSize: 10, fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '2px 5px', border: '1px solid #fde68a' }}>NEEDS REVIEW</span>;
                    })()}
                  </td>
                  <td style={TD}>
                    {isSelected
                      ? <span style={{ fontSize: 10, fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '2px 6px', border: '1px solid #bbf7d0' }}>SELECTED</span>
                      : commerceData?.[sku.sku]?.status === 'unmatched'
                        ? <span style={{ fontSize: 10, fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '2px 6px', border: '1px solid #fde68a' }}>NEEDS REVIEW</span>
                        : <span style={{ fontSize: 10, color: '#6b7280' }}>Available</span>
                    }
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

const TH: CSSProperties = { padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' };
const TD: CSSProperties = { padding: '8px 12px', color: '#333', verticalAlign: 'middle' };

// Technical Details section removed from configurator — belongs in product page tabs only.

// ─── Build Your Package (Section 3) ───────────────────────────────────────

interface AccessoriesSectionProps {
  section: ConfiguratorSection;
  selectedAccessories: string[];
  onToggle: (itemId: string) => void;
}

function AccessoriesSection({ section, selectedAccessories, onToggle }: AccessoriesSectionProps) {
  const items = section.items ?? [];
  const required = items.filter(i => i.type === 'required');
  const optional = items.filter(i => i.type !== 'required');

  return (
    <div style={{ marginBottom: 28 }}>
      <SectionHeader number="03" label="Build Your Package" description="Add required installation components and optional upgrades. Every item below is an existing Federal Signal SKU." />
      {required.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#991b1b', marginBottom: 6 }}>
            Required Components
          </p>
          {required.map(item => <AccessoryRow key={item.id} item={item} checked forceChecked />)}
        </div>
      )}
      {optional.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#374151', marginBottom: 6 }}>
            Optional Upgrades
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

interface AccessoryRowProps {
  item: ConfiguratorAccessoryItem;
  checked: boolean;
  onToggle?: () => void;
  forceChecked?: boolean;
}

function AccessoryRow({ item, checked, onToggle, forceChecked }: AccessoryRowProps) {
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

const AVAILABILITY_COPY: Record<ShopifyVariantAvailability, string> = { available: 'In Stock', unavailable: 'Out of Stock', unknown: 'Availability Pending' };
const AVAILABILITY_COLOR: Record<ShopifyVariantAvailability, string> = { available: '#15803d', unavailable: '#991b1b', unknown: '#6b7280' };
const AVAILABILITY_BG: Record<ShopifyVariantAvailability, string> = { available: '#dcfce7', unavailable: '#fef2f2', unknown: '#f3f4f6' };

function AvailabilityBadge({ state }: { state: ShopifyVariantAvailability }) {
  const color = AVAILABILITY_COLOR[state] ?? AVAILABILITY_COLOR.unknown;
  return (
    <span style={{
      marginLeft: 8, fontSize: 9, fontWeight: 700, color,
      background: AVAILABILITY_BG[state] ?? AVAILABILITY_BG.unknown,
      padding: '1px 5px', border: `1px solid ${color}`,
    }}>
      {AVAILABILITY_COPY[state] ?? AVAILABILITY_COPY.unknown}
    </span>
  );
}

interface QuoteLineProps {
  label?: string;
  sku?: string;
  price?: number | null;
  flagged?: boolean;
  availability?: ShopifyVariantAvailability;
}

function QuoteLine({ label, sku, price, flagged, availability }: QuoteLineProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '6px 10px', borderBottom: '1px solid #e5e7eb'
    }}>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 12, color: '#1a1a1a' }}>{label}</span>
        {sku && <span style={{ marginLeft: 8, fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{sku}</span>}
        {availability && <AvailabilityBadge state={availability} />}
      </div>
      {flagged
        ? <span style={{ fontSize: 10, fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '2px 6px', border: '1px solid #fde68a', whiteSpace: 'nowrap' }}>NEEDS REVIEW</span>
        : <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
            {price != null ? `$${price.toLocaleString()}` : 'Contact'}
          </span>
      }
    </div>
  );
}

interface QuotePanelProps {
  quotePayload: ConfiguratorQuotePayload | null;
  accSection?: ConfiguratorSection;
}

function QuotePanel({ quotePayload, accSection }: QuotePanelProps) {
  if (!quotePayload) {
    return (
      <div style={{ padding: '14px 16px', background: '#f8fafc', border: '1px solid #e5e7eb', marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClipboardList size={14} style={{ color: '#9ca3af' }} />
          <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
            Select a SKU row in the table above to build your package quote.
          </p>
        </div>
      </div>
    );
  }

  const items = accSection?.items ?? [];
  const requiredItems = items.filter(i => i.type === 'required');
  const selectedOptionalItems = items.filter(i => i.type !== 'required' && quotePayload.accessorySkus?.includes(i.sku));

  const knownTotal = [
    quotePayload.basePrice,
    ...selectedOptionalItems.map(i => i.price),
  ].reduce((sum, p) => (p != null && sum != null ? sum + p : null), 0);

  return (
    <div style={{ border: '2px solid #1a2744', marginTop: 8, background: '#fff' }}>
      {/* Header */}
      <div style={{ background: '#1a2744', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <ClipboardList size={14} style={{ color: '#fff' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>Package Quote</span>
        {quotePayload.reviewFlags?.length > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,0.15)', padding: '2px 7px', border: '1px solid rgba(251,191,36,0.4)' }}>
            {quotePayload.reviewFlags.length} FLAG{quotePayload.reviewFlags.length > 1 ? 'S' : ''} — NEEDS REVIEW
          </span>
        )}
      </div>

      {/* Vehicle line */}
      {quotePayload.selectedVehicle && (
        <div style={{ padding: '6px 10px', background: '#f0f4ff', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: 11, color: '#1a2744', fontWeight: 600 }}>
            Vehicle: {quotePayload.selectedVehicle.year} {quotePayload.selectedVehicle.make} {quotePayload.selectedVehicle.model}
          </span>
        </div>
      )}

      {/* Base Product */}
      <div style={{ padding: '6px 10px', background: '#f7f8fa', borderBottom: '1px solid #d0d0d0' }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#888' }}>Base Product</span>
      </div>
      <QuoteLine
        label={quotePayload.productFamily}
        sku={quotePayload.selectedBaseSku}
        price={quotePayload.basePrice}
        availability={quotePayload.availability}
      />

      {/* Required Components */}
      {requiredItems.length > 0 && (
        <>
          <div style={{ padding: '6px 10px', background: '#fef2f2', borderBottom: '1px solid #d0d0d0', borderTop: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#991b1b' }}>Required Components</span>
          </div>
          {requiredItems.map(item => (
            <QuoteLine key={item.id} label={item.label} sku={item.sku ?? undefined} price={item.price} flagged={!item.sku} />
          ))}
        </>
      )}

      {/* Optional Upgrades selected */}
      {selectedOptionalItems.length > 0 && (
        <>
          <div style={{ padding: '6px 10px', background: '#f0fdf4', borderBottom: '1px solid #d0d0d0', borderTop: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#15803d' }}>Optional Upgrades</span>
          </div>
          {selectedOptionalItems.map(item => (
            <QuoteLine key={item.id} label={item.label} sku={item.sku ?? undefined} price={item.price} />
          ))}
        </>
      )}

      {/* Total */}
      <div style={{ padding: '10px 16px', background: '#1a2744', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Package Total</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
          {knownTotal != null ? `$${knownTotal.toLocaleString()}` : 'Contact for pricing'}
        </span>
      </div>

      {/* Action Buttons */}
      <div style={{ padding: '12px 16px', display: 'flex', gap: 10, borderTop: '1px solid #e5e7eb' }}>
        {/* Add to Quote — always enabled when a SKU is selected */}
        <button
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '10px 16px', background: '#1a2744', color: '#fff',
            border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
            letterSpacing: '0.04em', cursor: 'pointer',
          }}
          onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#243560'}
          onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#1a2744'}
          onClick={() => {/* quote submission handled by parent QuoteRequestPanel */}}
          title="Add this configuration to your quote request"
        >
          <Send size={13} /> Add to Quote
        </button>

        {/* Add to Cart — enabled once the Shopify Variant Resolver reports a
            cart-eligible variant (a resolved shopifyVariantId + price) for
            the selected SKU. Cart mutation itself lives in
            ConfiguratorCommerceActions (Cart Workspace Foundation); this
            button only reflects resolver state within the Package Quote. */}
        <button
          disabled={!quotePayload.checkoutReady}
          title={quotePayload.checkoutReady ? 'This configuration is ready to add to your cart.' : 'Shopify variant ID pending — checkout disabled until GIDs are collected from Shopify Admin'}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '10px 16px',
            background: quotePayload.checkoutReady ? '#1a2744' : '#e5e7eb',
            color: quotePayload.checkoutReady ? '#fff' : '#9ca3af',
            border: quotePayload.checkoutReady ? 'none' : '1px solid #d1d5db',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
            letterSpacing: '0.04em', cursor: quotePayload.checkoutReady ? 'pointer' : 'not-allowed',
          }}
        >
          <ShoppingCart size={13} /> Add to Cart
        </button>
      </div>

      {/* Checkout disabled notice for price_only SKUs */}
      {!quotePayload.checkoutReady && (
        <div style={{ padding: '6px 16px 10px', background: '#f8fafc', borderTop: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: 10, color: '#6b7280' }}>
            🔒 Checkout disabled — Shopify variant GIDs not yet collected. Use <strong>Add to Quote</strong> to request pricing.
          </span>
        </div>
      )}

      {/* Review Flags */}
      {quotePayload.reviewFlags?.length > 0 && (
        <div style={{ padding: '10px 14px', background: '#fffbeb', borderTop: '1px solid #fde68a' }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#92400e', marginBottom: 4 }}>Review Required</p>
          {quotePayload.reviewFlags.map((flag, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: 11, color: '#92400e', marginBottom: 2 }}>
              <AlertTriangle size={11} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
              {flag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Module ───────────────────────────────────────────────────────────

export interface ConfiguratorModuleProps {
  configuratorData: Configurator;
  verticalId?: string;
  categoryId?: string;
  onConfigurationChange?: (payload: ConfiguratorQuotePayload | null) => void;
}

export default function ConfiguratorModule({ configuratorData, verticalId, categoryId, onConfigurationChange }: ConfiguratorModuleProps) {
  const { selectedVehicle } = useVehicle() as { selectedVehicle: ConfiguratorVehicleSelection | null };
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [filterSelections, setFilterSelections] = useState<FilterSelections>({});
  const [accessories, setAccessories]           = useState<string[]>([]);
  const [selectedSkuId, setSelectedSkuId]       = useState<string | null>(null);

  const {
    sectionMap, skuOptions = [], vehicleRules = [],
    productFamily, id: configuratorId
  } = configuratorData;
  const sections = (sectionMap ?? configuratorData.sections ?? {}) as Record<string, ConfiguratorSection>;

  // Commerce lookup — runs once per configurator load, keyed by SKU
  const commerceData = useMemo(
    () => lookupSkus(skuOptions.map(s => s.sku)),
    [skuOptions]
  );

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

  // Shopify Variant Resolver — separate from the UI selection state above.
  // Once filtering narrows to exactly one SKU, this resolves that SKU to a
  // Shopify variant (variant ID, live price, availability, cart-eligibility).
  const { resolution: resolvedVariant } = useShopifyVariantResolver(resolvedSkuObj?.sku ?? null);

  const handleFilterSelect = useCallback((stepId: string, optionId: string) => {
    setFilterSelections(prev => {
      const next = prev[stepId] === optionId
        ? (() => { const n = { ...prev }; delete n[stepId]; return n; })()
        : { ...prev, [stepId]: optionId };
      return next;
    });
    setSelectedSkuId(null); // clear row selection when filters change
  }, []);

  const handleToggleAccessory = useCallback((itemId: string) => {
    setAccessories(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const handleReset = useCallback(() => {
    setFilterSelections({});
    setAccessories([]);
    setSelectedSkuId(null);
  }, []);

  // Build quote payload when a SKU row is selected
  const quotePayload = useMemo<ConfiguratorQuotePayload | null>(() => {
    if (!resolvedSkuObj) return null;
    const accItems = sections?.accessories?.items ?? [];
    const selectedOptAccs = accItems.filter(i => i.type !== 'required' && accessories.includes(i.id));
    const reviewFlags = [
      ...(selectedVehicle ? [] : ['No vehicle selected — vehicle-specific fitment not confirmed']),
      ...skuSteps
        .filter(s => s._verification === 'needs_verification' && filterSelections[s.id])
        .map(s => `Unverified attribute: ${s.label}`),
      ...accItems.filter(i => i.type === 'required' && !i.sku).map(i => `Required component SKU unknown — needs review: ${i.label}`),
    ];
    // Propagate the resolver's review flag (e.g. "Shopify variant ID pending — quote only, checkout disabled")
    if (resolvedVariant?.reviewFlag) reviewFlags.push(resolvedVariant.reviewFlag);
    const commerceLines: ConfiguratorCommerceLine[] = [
      {
        sku: resolvedSkuObj.sku,
        shopifyVariantId: resolvedVariant?.shopifyVariantId ?? null,
        shopifyProductId: resolvedVariant?.shopifyProductId ?? null,
        price: resolvedVariant?.price ?? null,
        status: resolvedVariant?.status ?? 'unmatched',
      },
      ...selectedOptAccs.filter(i => i.sku).map((i): ConfiguratorCommerceLine => ({
        sku: i.sku as string,
        shopifyVariantId: null,
        shopifyProductId: null,
        price: i.price ?? null,
        status: 'unmatched',
      })),
    ];
    return {
      verticalId,
      categoryId,
      productFamily,
      configuratorId,
      selectedVehicle: selectedVehicle
        ? { year: selectedVehicle.year, make: selectedVehicle.make, model: selectedVehicle.model }
        : null,
      selectedBaseSku: resolvedSkuObj.sku,
      selectedFilters: filterSelections,
      shopifyVariantId: resolvedVariant?.shopifyVariantId ?? null,
      availability: resolvedVariant?.availability ?? 'unknown',
      basePrice: resolvedVariant?.price ?? null,
      accessorySkus: selectedOptAccs.map(i => i.sku).filter(Boolean),
      commerceLines,
      reviewFlags,
      checkoutReady: resolvedVariant?.canAddToCart ?? false,
    };
  }, [resolvedSkuObj, resolvedVariant, filterSelections, skuSteps, accessories, sections, verticalId, categoryId, productFamily, configuratorId, selectedVehicle]);

  // Surface the existing quote payload to composing parents (Configurator Experience)
  // without changing any configurator behavior — additive and optional.
  useEffect(() => {
    onConfigurationChange?.(quotePayload);
  }, [quotePayload, onConfigurationChange]);

  const showPackage = !!resolvedSkuObj;

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
          commerceData={commerceData}
        />

        {/* Section 3 — Build Your Package (shown after SKU selected) */}
        {showPackage && sections?.accessories && (
          <AccessoriesSection
            section={sections.accessories}
            selectedAccessories={accessories}
            onToggle={handleToggleAccessory}
          />
        )}

        {/* Quote */}
        <QuotePanel quotePayload={quotePayload} accSection={sections?.accessories} />
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
