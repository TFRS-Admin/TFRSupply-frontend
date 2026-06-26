/**
 * components/configurator/AddToCartPanel.jsx
 * Sprint 10 — Shopify Cart UI stub.
 *
 * Shown alongside QuoteRequestPanel when configuration is complete.
 * Imports ONLY from shopifyCartService — never the adapter directly.
 *
 * States:
 *  - incomplete config  → hidden (same gate as QuoteRequestPanel)
 *  - mapping not ready  → disabled panel with reason list
 *  - mapping ready      → simulated "payload ready" state (no API call)
 */

import React, { useState } from 'react';
import { useConfiguration } from '@/context/ConfigurationContext';
import { getCartReadiness, prepareCartPayload } from '@/services/shopifyCartService';
import { ShoppingCart, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function AddToCartPanel({ productMeta, shopifyMap }) {
  const { session, summary } = useConfiguration();
  const [payloadOpen, setPayloadOpen] = useState(false);

  if (!session || !summary || !summary.isComplete) return null;

  const { ready, reasons } = getCartReadiness(summary, shopifyMap);

  // Build payload for simulation display (no API call ever made here)
  const selectedOptions = (summary.selectedSummary ?? []).map(s => ({
    stepId: s.stepId,
    stepLabel: s.label,
    optionId: s.optionId,
    optionLabel: s.optionLabel,
    skuSegment: s.skuSegment,
  }));

  const accessories = (summary.accessories ?? []).map(a => ({
    id: a.id,
    label: a.label,
    sku: a.sku,
    quantity: 1,
  }));

  const cartPayload = ready
    ? prepareCartPayload({
        productId: productMeta?.productId ?? '',
        configuratorId: productMeta?.configuratorId ?? '',
        skuPreview: summary.skuPreview ?? '',
        selectedOptions,
        accessories,
        quantity: 1,
        shopifyMap: shopifyMap ?? {},
      })
    : null;

  // ── Not ready state ──────────────────────────────────────────────────────────
  if (!ready) {
    return (
      <div style={{ ...FS, border: '1px solid #e5e7eb', background: '#f9fafb', padding: '20px', marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ShoppingCart size={16} style={{ color: '#9ca3af' }} />
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af' }}>
            Add to Cart
          </p>
        </div>
        <button
          disabled
          style={{
            ...FS,
            width: '100%',
            background: '#e5e7eb',
            color: '#9ca3af',
            border: 'none',
            padding: '11px 20px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <ShoppingCart size={15} />
          Add to Cart
        </button>
        <div style={{ marginTop: 10, display: 'flex', gap: 8, padding: '10px 12px', background: '#fef9c3', border: '1px solid #fde047' }}>
          <AlertTriangle size={13} style={{ color: '#ca8a04', flexShrink: 0, marginTop: 1 }} />
          <div>
            {reasons.map((r, i) => (
              <p key={i} style={{ margin: i === 0 ? 0 : '4px 0 0', fontSize: 11, color: '#713f12' }}>{r}</p>
            ))}
          </div>
        </div>
        <p style={{ marginTop: 8, fontSize: 10, color: '#9ca3af', textAlign: 'center', fontStyle: 'italic' }}>
          Sprint 10 stub — Shopify mapping required before cart is enabled.
        </p>
      </div>
    );
  }

  // ── Ready state (simulated — no API call) ────────────────────────────────────
  return (
    <div style={{ ...FS, border: '1px solid #bbf7d0', background: '#f0fdf4', padding: '20px', marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <CheckCircle size={15} style={{ color: '#16a34a' }} />
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#15803d' }}>
          Add to Cart
        </p>
      </div>
      <p style={{ fontSize: 11, color: '#166534', marginBottom: 12 }}>
        Cart payload ready — SKU: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{summary.skuPreview}</span>
      </p>

      <button
        disabled
        title="Shopify checkout handoff will be wired in Sprint 11"
        style={{
          ...FS,
          width: '100%',
          background: '#15803d',
          color: '#fff',
          border: 'none',
          padding: '11px 20px',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'not-allowed',
          opacity: 0.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <ShoppingCart size={15} />
        Add to Cart (Sprint 11)
      </button>

      {/* Collapsible payload inspector */}
      <button
        onClick={() => setPayloadOpen(o => !o)}
        style={{ ...FS, display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#15803d', fontWeight: 600, padding: 0 }}
      >
        {payloadOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {payloadOpen ? 'Hide' : 'Inspect'} Cart Payload
      </button>

      {payloadOpen && cartPayload && (
        <pre style={{
          marginTop: 8,
          padding: 12,
          background: '#1a1a1a',
          color: '#86efac',
          fontSize: 10,
          fontFamily: 'monospace',
          overflowX: 'auto',
          maxHeight: 260,
          border: '1px solid #166534',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}>
          {JSON.stringify(cartPayload, null, 2)}
        </pre>
      )}

      <p style={{ marginTop: 10, fontSize: 10, color: '#4ade80', textAlign: 'center', fontStyle: 'italic' }}>
        Sprint 10 — simulation only. No Shopify API call is made.
      </p>
    </div>
  );
}