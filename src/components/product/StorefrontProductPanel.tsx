import React from 'react';
import { useShopifyStorefrontProductPreview } from '@/hooks/shopifyStorefrontProduct';
import { useShopifyStorefrontConfig } from '@/hooks/shopifyStorefrontConfig';
import StorefrontConfigReadinessRow from '@/components/shopify/StorefrontConfigReadinessRow';
import type { Product, ShopifyStorefrontProductAdapterMode } from '@/types';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const ADAPTER_MODE_LABEL: Record<ShopifyStorefrontProductAdapterMode, string> = {
  mock: 'Mock',
  unavailable: 'Not Connected',
  live: 'Live (Stub)',
};

interface StorefrontProductPanelProps {
  product: Product | null | undefined;
}

/**
 * Read-only Storefront Product panel for Product Detail. Renders whatever
 * ShopifyStorefrontProductResult the Shopify Storefront Product Sync
 * foundation reports and never performs a live Shopify API call itself —
 * with the default unavailable adapter this always shows "Not Ready" and
 * "Not Connected".
 *
 * Also renders the Shopify Storefront Live Configuration Readiness summary
 * (env config status, required env var presence, redacted store domain) via
 * useShopifyStorefrontConfig() — display-only, never reads or shows a
 * Storefront access token, and never calls Shopify.
 */
export default function StorefrontProductPanel({ product }: StorefrontProductPanelProps) {
  const { result, loading } = useShopifyStorefrontProductPreview(product?.id);
  const { validation } = useShopifyStorefrontConfig();

  if (!product) return null;

  const mapping = result?.mapping ?? null;
  const adapterMode = (result?.metadata?.attributes?.adapterMode as ShopifyStorefrontProductAdapterMode | undefined) ?? null;
  const ready = result?.status === 'dry-run' && Boolean(mapping?.mapped);

  if (!result && !loading) return null;

  return (
    <div style={{ ...FS, border: '1px solid #e5e7eb', background: '#fafafa', padding: '16px 18px', marginBottom: '1.25rem' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 10 }}>
        Storefront Product
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: ready ? '#16a34a' : '#c8a400' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
          {loading ? 'Checking storefront readiness…' : ready ? 'Storefront Ready' : 'Storefront Not Ready'}
        </span>
      </div>
      <div className="storefront-status-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 12, columnGap: 16 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>Mapping Status</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginTop: 2 }}>{mapping ? (mapping.mapped ? 'Mapped' : 'Unmapped') : '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>Handle</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginTop: 2 }}>{mapping?.handle ?? '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>Variant Count</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginTop: 2 }}>{mapping?.variantCount ?? '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>Media Count</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginTop: 2 }}>{mapping?.mediaCount ?? '—'}</div>
        </div>
      </div>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
        <span style={{ fontSize: 12, color: '#555' }}>
          Adapter mode: {adapterMode ? (ADAPTER_MODE_LABEL[adapterMode] ?? adapterMode) : '—'}
        </span>
      </div>
      <StorefrontConfigReadinessRow validation={validation} />
    </div>
  );
}
