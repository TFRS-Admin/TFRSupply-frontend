/**
 * components/navigator/ShopifyReadinessPanel.jsx
 * Sprint 9 — Read-only dev/prototype panel showing Shopify mapping status.
 * No Shopify API calls. No secrets. Inspects local JSON only.
 */

import React, { useState } from 'react';
import { getShopifyReadiness } from '@/services/shopifyMappingService';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function CheckRow({ check }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0', borderBottom: '1px solid #f0f0f0' }}>
      {check.pass
        ? <CheckCircle size={13} style={{ color: '#16a34a', flexShrink: 0, marginTop: 2 }} />
        : <XCircle size={13} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
      }
      <div>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{check.label}</span>
        <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>{check.note}</span>
      </div>
    </div>
  );
}

export default function ShopifyReadinessPanel({ productData, configuratorData }) {
  const [open, setOpen] = useState(false);

  if (!productData) return null;

  const { overallReady, product, configurator } = getShopifyReadiness(productData, configuratorData);

  const sectionStyle = { marginBottom: 16 };
  const labelStyle = {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#1a2744', marginBottom: 6, display: 'block',
  };

  return (
    <div style={{ ...FS, border: '1.5px dashed #d1d5db', background: '#f9fafb', marginTop: 32 }}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShoppingCart size={14} style={{ color: '#6b7280' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', letterSpacing: '0.04em' }}>
            Shopify Readiness
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '1px 7px', borderRadius: 2,
            background: overallReady ? '#dcfce7' : '#fef3c7',
            color: overallReady ? '#15803d' : '#92400e',
            border: `1px solid ${overallReady ? '#86efac' : '#fde68a'}`,
          }}>
            {overallReady ? 'Ready' : 'Not Ready'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>
            Dev/Prototype — No Shopify calls made
          </span>
          {open ? <ChevronUp size={14} style={{ color: '#9ca3af' }} /> : <ChevronDown size={14} style={{ color: '#9ca3af' }} />}
        </div>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px' }}>

          {/* Disclaimer */}
          <div style={{ padding: '8px 12px', background: '#fffbeb', border: '1px solid #fde68a', marginBottom: 16, fontSize: 11, color: '#78350f' }}>
            ⚠ <strong>Prototype only.</strong> This panel inspects local JSON files. No Shopify Storefront API calls are made. No secrets are loaded. Cart integration is not active.
          </div>

          {/* Product mapping */}
          <div style={sectionStyle}>
            <span style={labelStyle}>Product Mapping ({product.missing.length === 0 ? '✓ Complete' : `${product.missing.length} missing`})</span>
            {product.checks.map(c => <CheckRow key={c.key} check={c} />)}
          </div>

          {/* Configurator mapping */}
          {configuratorData && (
            <div style={sectionStyle}>
              <span style={labelStyle}>Configurator Mapping ({configurator.missing.length === 0 ? '✓ Complete' : `${configurator.missing.length} missing`})</span>
              {configurator.checks.map(c => <CheckRow key={c.key} check={c} />)}
            </div>
          )}

          {/* Missing fields summary */}
          {(product.missing.length > 0 || configurator.missing.length > 0) && (
            <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', fontSize: 11, color: '#991b1b' }}>
              <strong>Required before Shopify cart can be wired:</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 16 }}>
                {[...product.missing, ...(configuratorData ? configurator.missing : [])].map(m => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}