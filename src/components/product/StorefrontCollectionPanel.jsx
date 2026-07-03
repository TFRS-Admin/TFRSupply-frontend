import React from 'react';
import { useShopifyStorefrontCollectionPreview } from '@/hooks/shopifyStorefrontCollection';
import { useShopifyStorefrontConfig } from '@/hooks/shopifyStorefrontConfig';
import StorefrontConfigReadinessRow from '@/components/shopify/StorefrontConfigReadinessRow';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const ADAPTER_MODE_LABEL = {
  mock: 'Mock',
  unavailable: 'Not Connected',
  live: 'Live (Stub)',
};

/**
 * Read-only Storefront Collection panel for the customer-facing Category
 * page. Renders whatever ShopifyStorefrontCollectionResult the Shopify
 * Storefront Collection Sync foundation reports and never performs a live
 * Shopify API call itself — with the default unavailable adapter this
 * always shows "Not Ready" and "Not Connected".
 *
 * Also renders the Shopify Storefront Live Configuration Readiness summary
 * via useShopifyStorefrontConfig() — display-only, never reads or shows a
 * Storefront access token, and never calls Shopify.
 */
export default function StorefrontCollectionPanel({ categoryId }) {
  const { result, loading } = useShopifyStorefrontCollectionPreview(categoryId);
  const { validation } = useShopifyStorefrontConfig();

  if (!categoryId) return null;

  const mapping = result?.mapping ?? null;
  const adapterMode = result?.metadata?.attributes?.adapterMode ?? null;
  const ready = result?.status === 'dry-run' && Boolean(mapping?.mapped);

  if (!result && !loading) return null;

  return (
    <div style={{ ...FS, border: '1px solid #e5e7eb', background: '#fafafa', padding: '14px 16px', marginBottom: '1.5rem' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>
        Storefront Collection
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: ready ? '#16a34a' : '#c8a400' }} />
        <span style={{ fontSize: 12, color: '#555' }}>
          {loading ? 'Checking collection readiness…' : ready ? 'Collection Ready' : 'Collection Not Ready'}
        </span>
      </div>
      <div className="storefront-status-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 8, columnGap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>Mapping Status</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{mapping ? (mapping.mapped ? 'Mapped' : 'Unmapped') : '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>Collection Handle</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{mapping?.handle ?? '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>Product Count</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{mapping?.productCount ?? '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>Adapter Mode</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{adapterMode ? (ADAPTER_MODE_LABEL[adapterMode] ?? adapterMode) : '—'}</div>
        </div>
      </div>
      <StorefrontConfigReadinessRow validation={validation} />
    </div>
  );
}
