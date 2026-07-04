import React from 'react';
import { useCommerceProduct } from '@/hooks/commerce';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const COMMERCE_STATUS_LABEL = {
  ready: 'Storefront Connected',
  pending: 'Commerce Sync Pending',
  'not-found': 'Not on Storefront',
  unmapped: 'Storefront Mapping Pending',
  unavailable: 'Storefront Unavailable',
};

function lowestSkuPrice(skuTable = []) {
  const prices = skuTable
    .map((row) => row?._price)
    .filter((value) => typeof value === 'number' && Number.isFinite(value));
  if (!prices.length) return null;
  return Math.min(...prices);
}

function formatUsd(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function humanize(value) {
  return value ? value.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : value;
}

/**
 * Product Hero Enhancements — availability, identifiers, and commerce status
 * composed alongside the existing ProductHero using catalog + commerce data.
 */
export default function ProductCommerceSummary({ product }) {
  const commerce = product?.commerce ?? {};
  const { result: commerceResult, data: shopifyProduct, loading } = useCommerceProduct(product?.id);

  if (!product) return null;

  const startingPrice = lowestSkuPrice(commerce.sku_table);
  const commerceStatus = commerceResult?.status ?? (loading ? 'pending' : null);

  const rows = [
    { label: 'SKU', value: product.sku ?? commerce.sku_root },
    { label: 'Brand', value: product.vendor },
    { label: 'Category', value: humanize(product.category) },
    { label: 'Availability', value: commerce.availability },
    { label: 'MSRP', value: commerce.msrp_display },
    { label: 'Starting Price', value: startingPrice != null ? `From ${formatUsd(startingPrice)}` : null },
  ].filter((row) => row.value);

  if (!rows.length && !commerceStatus) return null;

  return (
    <div style={{ ...FS, border: '1px solid #e5e7eb', background: '#fafafa', padding: '16px 18px', marginBottom: '1.25rem' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 10 }}>
        Product Overview
      </div>
      <div className="storefront-status-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 12, columnGap: 16 }}>
        {rows.map((row) => (
          <div key={row.label}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>{row.label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginTop: 2 }}>{row.value}</div>
          </div>
        ))}
      </div>
      {commerceStatus && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: commerceStatus === 'ready' && shopifyProduct?.storefrontAvailable ? '#16a34a' : '#c8a400',
            }}
          />
          <span style={{ fontSize: 12, color: '#555' }}>
            Commerce status: {COMMERCE_STATUS_LABEL[commerceStatus] ?? 'Unknown'}
          </span>
        </div>
      )}
    </div>
  );
}
