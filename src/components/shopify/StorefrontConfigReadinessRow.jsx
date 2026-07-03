import React from 'react';

const STATUS_LABEL = {
  configured: 'Configured',
  'partially-configured': 'Partially Configured',
  'not-configured': 'Not Configured',
  disabled: 'Disabled',
};

const STATUS_COLOR = {
  configured: '#16a34a',
  'partially-configured': '#c8a400',
  'not-configured': '#9ca3af',
  disabled: '#9ca3af',
};

/**
 * Shared read-only row summarizing Shopify Storefront Live Configuration
 * Readiness (Vite env config validation only — see
 * shopifyStorefrontConfigService). Renders the config status, whether the
 * Storefront API is enabled, required env var presence, and the redacted
 * store domain. Never renders a Storefront access token and never triggers
 * a Shopify API call.
 */
export default function StorefrontConfigReadinessRow({ validation }) {
  if (!validation) return null;

  const color = STATUS_COLOR[validation.status] ?? '#9ca3af';
  const label = STATUS_LABEL[validation.status] ?? validation.status;

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>
        Storefront Configuration
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: color }} />
        <span style={{ fontSize: 12, color: '#555' }}>
          Config: {label} · Storefront API {validation.storefrontEnabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>
      <div style={{ fontSize: 11, color: '#888' }}>
        Store domain: {validation.redactedStoreDomain ?? 'Not set'} · API version: {validation.apiVersion ?? 'Not set'}
      </div>
      {validation.missingEnvVars.length > 0 && (
        <div style={{ fontSize: 11, color: '#b91c1c', marginTop: 4 }}>
          Missing: {validation.missingEnvVars.join(', ')}
        </div>
      )}
    </div>
  );
}
