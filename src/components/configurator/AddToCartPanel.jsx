/**
 * components/configurator/AddToCartPanel.jsx
 * Sprint 11 — Cart Payload QA + Shopify Mapping Contract.
 *
 * Imports ONLY from shopifyCartService — never the adapter directly.
 * No Shopify API call is made. No credentials are used.
 *
 * States:
 *  - config incomplete  → hidden (matches QuoteRequestPanel gate)
 *  - mapping not ready  → disabled panel with specific per-category reasons
 *  - mapping ready      → simulated payload preview; cart button disabled (Sprint 12)
 */

import React, { useState, useMemo } from 'react';
import { useConfiguration } from '@/context/ConfigurationContext';
import { getCartReadiness, prepareCartPayload } from '@/services/shopifyCartService';
import { ShoppingCart, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

// Maps category keys → human-readable label + colour
const REASON_META = {
  productMappingMissing:    { label: 'Product mapping missing',   color: '#7c3aed' },
  variantMappingMissing:    { label: 'Variant mapping missing',    color: '#c2410c' },
  accessoryMappingMissing:  { label: 'Accessory mapping missing',  color: '#b45309' },
  cartEligibilityDisabled:  { label: 'Cart eligibility disabled',  color: '#1d4ed8' },
  storefrontUnavailable:    { label: 'Storefront unavailable',     color: '#0f766e' },
  configIncomplete:         { label: 'Config incomplete',          color: '#991b1b' },
  hardViolation:            { label: 'Conflict',                   color: '#991b1b' },
};

function ReasonTag({ categoryKey }) {
  const meta = REASON_META[categoryKey] ?? { label: categoryKey, color: '#555' };
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      padding: '2px 6px',
      border: `1px solid ${meta.color}`,
      color: meta.color,
      marginRight: 5,
      marginBottom: 3,
      flexShrink: 0,
    }}>
      {meta.label}
    </span>
  );
}

function PayloadSection({ title, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6ee7b7' }}>{title}</p>
      {children}
    </div>
  );
}

export default function AddToCartPanel({ productMeta, shopifyMap }) {
  const { session, summary } = useConfiguration();
  const [payloadOpen, setPayloadOpen] = useState(false);

  // All hooks must be called unconditionally before any early return
  const { ready, reasons, categories } = getCartReadiness(summary, shopifyMap);

  const cartPayload = useMemo(() => {
    // Guard: summary may be null before config loads
    if (!summary) return null;
    return prepareCartPayload({
      productId: productMeta?.productId ?? '',
      configuratorId: productMeta?.configuratorId ?? '',
      skuPreview: summary.skuPreview ?? '',
      summary,
      quantity: 1,
      shopifyMap: shopifyMap ?? {},
    });
  }, [summary, productMeta, shopifyMap]);

  const activeCategories = Object.keys(categories).filter(k => categories[k]);

  // Don't render at all until config is complete
  if (!session || !summary || !summary.isComplete) return null;

  // ── Disabled state: mapping not ready ─────────────────────────────────────
  if (!ready) {
    return (
      <div style={{ ...FS, border: '1px solid #e5e7eb', background: '#fafafa', padding: '20px', marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ShoppingCart size={15} style={{ color: '#9ca3af' }} />
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af' }}>
            Add to Cart
          </p>
        </div>

        <button disabled style={{
          ...FS, width: '100%', background: '#e5e7eb', color: '#9ca3af',
          border: 'none', padding: '11px 20px', fontSize: 14, fontWeight: 700,
          cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <ShoppingCart size={15} /> Add to Cart
        </button>

        <div style={{ marginTop: 12 }}>
          {/* Category tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 8 }}>
            {activeCategories.map(k => <ReasonTag key={k} categoryKey={k} />)}
          </div>
          {/* Specific reasons */}
          {reasons.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', padding: '7px 10px', background: '#fef9c3', border: '1px solid #fde047', marginBottom: 4 }}>
              <AlertTriangle size={12} style={{ color: '#ca8a04', flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: 11, color: '#713f12' }}>{r}</p>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 10, fontSize: 10, color: '#9ca3af', textAlign: 'center', fontStyle: 'italic' }}>
          Sprint 11 — Shopify mapping required before cart is enabled.
        </p>
      </div>
    );
  }

  // ── Ready state: simulated payload preview ─────────────────────────────────
  if (!cartPayload) return null;
  const { primaryLine, accessoryLines, mappingStatus } = cartPayload;
  return (
    <div style={{ ...FS, border: '1px solid #bbf7d0', background: '#f0fdf4', padding: '20px', marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <CheckCircle size={15} style={{ color: '#16a34a' }} />
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#15803d' }}>
          Add to Cart
        </p>
      </div>
      <p style={{ fontSize: 11, color: '#166534', marginBottom: 12 }}>
        Payload ready — SKU: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{summary.skuPreview}</span>
      </p>

      <button disabled title="Checkout handoff wired in Sprint 12" style={{
        ...FS, width: '100%', background: '#15803d', color: '#fff', border: 'none',
        padding: '11px 20px', fontSize: 14, fontWeight: 700, cursor: 'not-allowed',
        opacity: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <ShoppingCart size={15} /> Add to Cart (Sprint 12)
      </button>

      {/* Unresolved mapping warnings (variant + accessory IDs) */}
      {mappingStatus.unresolved?.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {mappingStatus.unresolved.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', padding: '6px 10px', background: '#fffbeb', border: '1px solid #fde68a', marginBottom: 3 }}>
              <Info size={11} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: 10, color: '#92400e' }}>{msg}</p>
            </div>
          ))}
        </div>
      )}

      {/* Collapsible payload inspector */}
      <button onClick={() => setPayloadOpen(o => !o)} style={{
        ...FS, display: 'flex', alignItems: 'center', gap: 6, marginTop: 12,
        background: 'none', border: 'none', cursor: 'pointer', fontSize: 11,
        color: '#15803d', fontWeight: 600, padding: 0,
      }}>
        {payloadOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {payloadOpen ? 'Hide' : 'Inspect'} Cart Payload
      </button>

      {payloadOpen && (
        <div style={{ marginTop: 8, background: '#1a1a1a', border: '1px solid #166534', padding: 14, overflowX: 'auto', maxHeight: 320 }}>
          {/* Primary product */}
          <PayloadSection title="Primary Line">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, fontFamily: 'monospace' }}>
              <tbody>
                <tr><td style={{ color: '#86efac', paddingRight: 12, whiteSpace: 'nowrap' }}>sku</td><td style={{ color: '#fde68a' }}>{primaryLine.sku}</td></tr>
                <tr><td style={{ color: '#86efac', paddingRight: 12, whiteSpace: 'nowrap' }}>shopify_product_id</td><td style={{ color: primaryLine.shopify_product_id ? '#fde68a' : '#f87171' }}>{primaryLine.shopify_product_id ?? '⚠ null'}</td></tr>
                <tr><td style={{ color: '#86efac', paddingRight: 12, whiteSpace: 'nowrap' }}>shopify_variant_id</td><td style={{ color: primaryLine.shopify_variant_id ? '#fde68a' : '#f87171' }}>{primaryLine.shopify_variant_id ?? '⚠ null'}</td></tr>
                <tr><td style={{ color: '#86efac', paddingRight: 12, whiteSpace: 'nowrap' }}>quantity</td><td style={{ color: '#fde68a' }}>{primaryLine.quantity}</td></tr>
              </tbody>
            </table>
          </PayloadSection>

          {/* Custom attributes (configuration selections) */}
          <PayloadSection title="Custom Attributes (configuration)">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, fontFamily: 'monospace' }}>
              <tbody>
                {primaryLine.customAttributes.map((attr, i) => (
                  <tr key={i}>
                    <td style={{ color: '#86efac', paddingRight: 12, whiteSpace: 'nowrap' }}>{attr.key}</td>
                    <td style={{ color: '#fde68a' }}>{attr.value || '(empty)'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PayloadSection>

          {/* Accessories */}
          {accessoryLines.length > 0 && (
            <PayloadSection title="Accessory Lines">
              {accessoryLines.map((acc, i) => (
                <div key={i} style={{ marginBottom: 6, paddingLeft: 8, borderLeft: '2px solid #166534' }}>
                  <span style={{ color: '#fde68a', fontFamily: 'monospace', fontSize: 10 }}>{acc.label}</span>
                  {' '}<span style={{ color: acc.shopify_variant_id ? '#86efac' : '#f87171', fontSize: 10, fontFamily: 'monospace' }}>
                    variant_id: {acc.shopify_variant_id ?? '⚠ null'}
                  </span>
                </div>
              ))}
            </PayloadSection>
          )}

          {/* Mapping status */}
          <PayloadSection title="Mapping Status">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, fontFamily: 'monospace' }}>
              <tbody>
                <tr><td style={{ color: '#86efac', paddingRight: 12 }}>variantResolved</td><td style={{ color: mappingStatus.variantResolved ? '#86efac' : '#f87171' }}>{String(mappingStatus.variantResolved)}</td></tr>
                <tr><td style={{ color: '#86efac', paddingRight: 12 }}>accessoriesResolved</td><td style={{ color: mappingStatus.accessoriesResolved ? '#86efac' : '#f87171' }}>{String(mappingStatus.accessoriesResolved)}</td></tr>
              </tbody>
            </table>
          </PayloadSection>
        </div>
      )}

      <p style={{ marginTop: 10, fontSize: 10, color: '#4ade80', textAlign: 'center', fontStyle: 'italic' }}>
        Sprint 11 — simulation only. No Shopify API call is made.
      </p>
    </div>
  );
}