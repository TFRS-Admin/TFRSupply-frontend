import React from 'react';
import { useShopifyStorefrontProductPreview } from '@/hooks/shopifyStorefrontProduct';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const ADAPTER_MODE_LABEL = {
  mock: 'Mock',
  unavailable: 'Not Connected',
  live: 'Live (Stub)',
};

/**
 * Read-only Storefront Product panel for Product Detail. Renders whatever
 * ShopifyStorefrontProductResult the Shopify Storefront Product Sync
 * foundation reports and never performs a live Shopify API call itself —
 * with the default unavailable adapter this always shows "Not Ready" and
 * "Not Connected".
 */
export default function StorefrontProductPanel({ product }) {
  const { result, loading } = useShopifyStorefrontProductPreview(product?.id);

  if (!product) return null;

  const mapping = result?.mapping ?? null;
  const adapterMode = result?.metadata?.attributes?.adapterMode ?? null;
  const ready = result?.status === 'dry-run' && Boolean(mapping?.mapped);

  if (!result && !loading) return null;

  return (
    <div style={{ ...FS, border: '1px solid #e5e7eb', background: '#fafafa', padding: '14px 16px', marginBottom: '1.25rem' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>
        Storefront Product
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: ready ? '#16a34a' : '#c8a400' }} />
        <span style={{ fontSize: 12, color: '#555' }}>
          {loading ? 'Checking storefront readiness…' : ready ? 'Storefront Ready' : 'Storefront Not Ready'}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 8, columnGap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>Mapping Status</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{mapping ? (mapping.mapped ? 'Mapped' : 'Unmapped') : '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>Handle</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{mapping?.handle ?? '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>Variant Count</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{mapping?.variantCount ?? '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>Media Count</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{mapping?.mediaCount ?? '—'}</div>
        </div>
      </div>
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #e5e7eb' }}>
        <span style={{ fontSize: 12, color: '#555' }}>
          Adapter mode: {adapterMode ? (ADAPTER_MODE_LABEL[adapterMode] ?? adapterMode) : '—'}
        </span>
      </div>
    </div>
  );
}
