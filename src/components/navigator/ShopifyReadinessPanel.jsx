/**
 * components/navigator/ShopifyReadinessPanel.jsx
 * Sprint 9 — Read-only dev/prototype panel showing Shopify mapping status.
 * No Shopify API calls. No secrets. Inspects local JSON only.
 */

import React, { useState } from 'react';
import { getShopifyReadiness } from '@/services/shopifyMappingService';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, ShoppingCart, ClipboardList, Copy } from 'lucide-react';

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

// ── Mapping Worksheet ────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      style={{
        background: 'none', border: '1px solid #d1d5db', cursor: 'pointer',
        padding: '2px 7px', fontSize: 10, color: copied ? '#16a34a' : '#6b7280',
        display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 2,
      }}
    >
      <Copy size={10} />
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function WorksheetRow({ label, value, missing }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '180px 1fr auto',
      alignItems: 'center', gap: 8,
      padding: '5px 0', borderBottom: '1px solid #f0f0f0', fontSize: 11,
    }}>
      <span style={{ color: '#4b5563', fontWeight: 600 }}>{label}</span>
      <span style={{
        fontFamily: missing ? 'inherit' : 'monospace',
        color: missing ? '#dc2626' : '#1a2744',
        fontStyle: missing ? 'italic' : 'normal',
      }}>
        {missing ? '❌ not set' : value}
      </span>
      {!missing && value && <CopyButton text={String(value)} />}
    </div>
  );
}

function MappingWorksheet({ productData }) {
  const [wsOpen, setWsOpen] = useState(false);
  const shopify = productData?.shopify ?? {};
  const accessories = productData?.commerce?.accessories ?? [];
  const skuTable = productData?.commerce?.sku_table ?? [];

  const allMissing = [];
  if (!shopify.product_id) allMissing.push('shopify.product_id — Shopify Admin → Products → URL numeric ID');
  if (!shopify.cart_eligible) allMissing.push('shopify.cart_eligible — set true after all GIDs collected');
  if (!shopify.storefront_available) allMissing.push('shopify.storefront_available — set true after Storefront API confirmed');
  if (!shopify.variant_mappings?.length) allMissing.push(`shopify.variant_mappings — ${skuTable.length} variant GIDs needed`);
  const unmappedAccessories = accessories.filter(a => !a.shopify_variant_id);
  if (unmappedAccessories.length > 0) allMissing.push(`Accessory variant IDs — ${unmappedAccessories.length} of ${accessories.length} unmapped`);
  allMissing.push('SHOPIFY_STOREFRONT_ACCESS_TOKEN — Base44 backend secret (never in source)');
  allMissing.push('SHOPIFY_STORE_DOMAIN — Base44 backend secret (never in source)');

  const checklistText = [
    `Shopify Mapping Checklist — ${productData?.title ?? 'Product'}`,
    `Generated: ${new Date().toLocaleDateString()}`,
    '',
    'PRODUCT-LEVEL FIELDS',
    `  product_id:           ${shopify.product_id ?? '[ collect from Shopify Admin ]'}`,
    `  handle:               ${shopify.handle ?? '[ collect from Shopify Admin ]'}`,
    `  cart_eligible:        ${shopify.cart_eligible}`,
    `  storefront_available: ${shopify.storefront_available}`,
    '',
    'VARIANT MAPPINGS (one per configurator SKU)',
    ...skuTable.map(row => {
      const mapped = shopify.variant_mappings?.find(m => m.sku === row.sku);
      return `  ${row.sku.padEnd(18)} → ${mapped?.shopify_variant_id ?? '[ collect variant GID ]'}`;
    }),
    '',
    'ACCESSORY MAPPINGS',
    ...accessories.map(a =>
      `  ${a.sku.padEnd(18)} ${a.label.padEnd(38)} → ${a.shopify_variant_id ?? '[ collect variant GID ]'}`
    ),
    '',
    'BACKEND SECRETS (set in Base44 dashboard, never in source)',
    '  SHOPIFY_STOREFRONT_ACCESS_TOKEN = [ set in Base44 Secrets ]',
    '  SHOPIFY_STORE_DOMAIN            = [ set in Base44 Secrets ]',
    '',
    'Reference: docs/shopify-data-collection-checklist.md',
    'Mapping file: data/shopify-mapping/example-navigator-mapping.json',
  ].join('\n');

  return (
    <div style={{ marginTop: 16, border: '1px solid #e5e7eb', background: '#fff' }}>
      <button
        onClick={() => setWsOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', background: '#f8fafc', border: 'none', cursor: 'pointer',
          borderBottom: wsOpen ? '1px solid #e5e7eb' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <ClipboardList size={13} style={{ color: '#6b7280' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#374151' }}>
            Mapping Worksheet
          </span>
          {allMissing.length > 0 && (
            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: 2 }}>
              {allMissing.length} fields needed
            </span>
          )}
        </div>
        {wsOpen ? <ChevronUp size={13} style={{ color: '#9ca3af' }} /> : <ChevronDown size={13} style={{ color: '#9ca3af' }} />}
      </button>

      {wsOpen && (
        <div style={{ padding: '14px 14px', ...FS }}>

          {/* Product fields */}
          <span style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a2744', marginBottom: 6 }}>
            Product Fields
          </span>
          <WorksheetRow label="product_id" value={shopify.product_id} missing={!shopify.product_id} />
          <WorksheetRow label="handle" value={shopify.handle} missing={!shopify.handle} />
          <WorksheetRow label="cart_eligible" value={String(shopify.cart_eligible)} missing={!shopify.cart_eligible} />
          <WorksheetRow label="storefront_available" value={String(shopify.storefront_available)} missing={!shopify.storefront_available} />

          {/* Variant mappings */}
          <span style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a2744', margin: '14px 0 6px' }}>
            Variant Mappings ({shopify.variant_mappings?.length ?? 0} of {skuTable.length} filled)
          </span>
          {skuTable.map(row => {
            const mapped = shopify.variant_mappings?.find(m => m.sku === row.sku);
            return (
              <WorksheetRow
                key={row.sku}
                label={row.sku}
                value={mapped?.shopify_variant_id}
                missing={!mapped?.shopify_variant_id}
              />
            );
          })}

          {/* Accessory mappings */}
          {accessories.length > 0 && (
            <>
              <span style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a2744', margin: '14px 0 6px' }}>
                Accessory Mappings ({accessories.filter(a => a.shopify_variant_id).length} of {accessories.length} filled)
              </span>
              {accessories.map(a => (
                <WorksheetRow
                  key={a.sku}
                  label={a.sku}
                  value={a.shopify_variant_id}
                  missing={!a.shopify_variant_id}
                />
              ))}
            </>
          )}

          {/* Backend secrets reminder */}
          <span style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a2744', margin: '14px 0 6px' }}>
            Backend Secrets (never in source)
          </span>
          <div style={{ padding: '8px 10px', background: '#fef9c3', border: '1px solid #fde047', fontSize: 11, color: '#713f12' }}>
            Set in Base44 dashboard → Settings → Secrets:<br />
            <code style={{ fontFamily: 'monospace' }}>SHOPIFY_STOREFRONT_ACCESS_TOKEN</code> &nbsp;|&nbsp;
            <code style={{ fontFamily: 'monospace' }}>SHOPIFY_STORE_DOMAIN</code>
          </div>

          {/* Copy checklist */}
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#9ca3af' }}>
              See <code style={{ fontFamily: 'monospace' }}>docs/shopify-data-collection-checklist.md</code>
            </span>
            <CopyButton text={checklistText} />
          </div>
        </div>
      )}
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

          {/* ── Mapping Worksheet ──────────────────────────────────────────── */}
          <MappingWorksheet productData={productData} />
        </div>
      )}
    </div>
  );
}