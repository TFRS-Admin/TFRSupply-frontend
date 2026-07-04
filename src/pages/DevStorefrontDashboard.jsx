/**
 * pages/DevStorefrontDashboard.jsx
 * Issue 073 — Shopify Storefront Live Mode Readiness.
 *
 * Read-only developer dashboard for the Storefront Runtime Configuration
 * module (useShopifyStorefrontRuntimeStatus / shopifyStorefrontRuntimeService).
 * Every value rendered here is read from the existing Storefront foundations'
 * getCapabilities() calls and frontend-safe env config — this page performs
 * no Shopify request, no mutation, and never renders a Storefront access
 * token or full store domain.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle2, Info, RefreshCw, XCircle } from 'lucide-react';
import { useShopifyStorefrontRuntimeStatus } from '@/hooks/shopifyStorefrontRuntime';

const DOC_LINKS = [
  { label: 'Shopify Storefront API Foundation', path: 'docs/architecture/SHOPIFY_STOREFRONT_API_FOUNDATION.md' },
  { label: 'Storefront Cart Adapter', path: 'docs/architecture/SHOPIFY_STOREFRONT_CART_ADAPTER.md' },
  { label: 'Storefront Product Sync', path: 'docs/architecture/SHOPIFY_STOREFRONT_PRODUCT_SYNC.md' },
  { label: 'Storefront Collection Sync', path: 'docs/architecture/SHOPIFY_STOREFRONT_COLLECTION_SYNC.md' },
  { label: 'Shopify Checkout URL Preview', path: 'docs/architecture/SHOPIFY_CHECKOUT_URL_PREVIEW.md' },
  { label: 'Storefront Live Configuration Readiness', path: 'docs/architecture/SHOPIFY_STOREFRONT_LIVE_CONFIG_READINESS.md' },
  { label: 'Storefront Runtime Readiness (this page)', path: 'docs/architecture/SHOPIFY_STOREFRONT_RUNTIME_READINESS.md' },
  { label: 'Commerce Platform Foundation', path: 'docs/architecture/COMMERCE_FOUNDATION.md' },
];

const RUNTIME_MODE_COLOR = { mock: '#c8a400', unavailable: '#9ca3af', live: '#16a34a', mixed: '#2563eb' };
const CONFIG_STATUS_COLOR = { configured: '#16a34a', 'partially-configured': '#c8a400', 'not-configured': '#9ca3af', disabled: '#9ca3af' };
const DIAGNOSTIC_ICON = { info: Info, warning: AlertTriangle, error: XCircle };
const DIAGNOSTIC_COLOR = { info: '#2563eb', warning: '#c8a400', error: '#b91c1c' };

function Section({ title, description, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#1a2744', marginBottom: description ? 2 : 10 }}>{title}</p>
      {description && <p style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>{description}</p>}
      {children}
    </div>
  );
}

function KeyValueGrid({ rows }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 2 }}>
      {rows.map(([label, value], i) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 14px', borderBottom: i === rows.length - 1 ? 'none' : '1px solid #f0f0f0', fontSize: 12 }}>
          <span style={{ color: '#888' }}>{label}</span>
          <span style={{ color: '#1a1a1a', fontWeight: 600, textAlign: 'right' }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function Dot({ color }) {
  return <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: color, display: 'inline-block' }} />;
}

function CapabilityMatrixTable({ rows }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {['Foundation', 'Adapter Mode', 'Dry Run Only', 'Live Calls Enabled', 'Notes'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 14px', color: '#888', fontWeight: 700, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.foundation} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '8px 14px', fontWeight: 600, color: '#1a1a1a' }}>{row.foundation}</td>
              <td style={{ padding: '8px 14px', color: '#1a1a1a' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Dot color={RUNTIME_MODE_COLOR[row.adapterMode] ?? '#9ca3af'} />
                  {row.adapterMode}
                </span>
              </td>
              <td style={{ padding: '8px 14px', color: '#1a1a1a' }}>{String(row.dryRunOnly)}</td>
              <td style={{ padding: '8px 14px', color: '#1a1a1a' }}>{String(row.liveCallsEnabled)}</td>
              <td style={{ padding: '8px 14px', color: '#888' }}>{row.notes ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeatureFlagList({ flags }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 2 }}>
      {flags.map((flag, i) => (
        <div key={flag.key} style={{ padding: '10px 14px', borderBottom: i === flags.length - 1 ? 'none' : '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            {flag.enabled ? <CheckCircle2 size={13} color="#16a34a" /> : <XCircle size={13} color="#9ca3af" />}
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{flag.label}</span>
            <span style={{ fontSize: 11, color: flag.enabled ? '#16a34a' : '#9ca3af', fontWeight: 700, marginLeft: 'auto' }}>{flag.enabled ? 'ON' : 'OFF'}</span>
          </div>
          <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{flag.description}</p>
        </div>
      ))}
    </div>
  );
}

function DiagnosticsList({ diagnostics }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 2 }}>
      {diagnostics.map((diag, i) => {
        const Icon = DIAGNOSTIC_ICON[diag.level] ?? Info;
        const color = DIAGNOSTIC_COLOR[diag.level] ?? '#888';
        return (
          <div key={`${diag.code}-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', borderBottom: i === diagnostics.length - 1 ? 'none' : '1px solid #f0f0f0', fontSize: 12 }}>
            <Icon size={13} color={color} style={{ marginTop: 1, flexShrink: 0 }} />
            <span style={{ color: '#1a1a1a' }}>{diag.message}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DevStorefrontDashboard() {
  const { status, loading, error, refresh } = useShopifyStorefrontRuntimeStatus();

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', fontFamily: "'Roboto','Inter',sans-serif" }}>
      <nav style={{ borderBottom: '1px solid #e5e7eb', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontSize: 13, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Home
          </Link>
          <span style={{ color: '#ccc' }}>/</span>
          <span style={{ fontSize: 13, color: '#555' }}>Developer / Storefront Runtime</span>
        </div>
        <button
          type="button"
          onClick={() => refresh()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#1a2744', background: '#f0f2f5', border: '1px solid #e5e7eb', borderRadius: 2, padding: '6px 12px', cursor: 'pointer' }}
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2744', margin: '0 0 6px' }}>Storefront Runtime Configuration</h1>
          <p style={{ fontSize: 13, color: '#888', maxWidth: 640, margin: 0 }}>
            Developer-only, read-only snapshot of Shopify Storefront readiness: runtime mode, configuration validation,
            capability matrix, feature flags, and diagnostics. No Shopify request is made from this page and no secret
            or access token is ever displayed.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 2, padding: 14, fontSize: 12, marginBottom: 24 }}>
            Failed to compute Storefront runtime status.
          </div>
        )}

        {loading && !status && (
          <div style={{ fontSize: 12, color: '#888' }}>Loading Storefront runtime status…</div>
        )}

        {status && (
          <>
            <Section title="Runtime Mode">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 2, padding: '10px 14px', marginBottom: 10 }}>
                <Dot color={RUNTIME_MODE_COLOR[status.runtimeMode] ?? '#9ca3af'} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', textTransform: 'capitalize' }}>{status.runtimeMode}</span>
                <span style={{ fontSize: 11, color: '#888', marginLeft: 'auto' }}>Checked at {status.checkedAt}</span>
              </div>
              <p style={{ fontSize: 12, color: '#555', margin: 0 }}>{status.readinessSummary}</p>
            </Section>

            <Section title="Configuration Status" description="Read from frontend-safe Vite env variables only. No Storefront access token field exists in this config, and none is ever read or displayed.">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Dot color={CONFIG_STATUS_COLOR[status.capabilitySummary.configValidation.status] ?? '#9ca3af'} />
                <span style={{ fontSize: 12, color: '#555' }}>{status.capabilitySummary.configValidation.status}</span>
              </div>
              <KeyValueGrid
                rows={[
                  ['Storefront API enabled', String(status.capabilitySummary.storefrontApiEnabled)],
                  ['Store domain (redacted)', status.capabilitySummary.configValidation.redactedStoreDomain ?? 'Not set'],
                  ['API version', status.capabilitySummary.configValidation.apiVersion ?? 'Not set'],
                  ['Missing env vars', status.capabilitySummary.configValidation.missingEnvVars.join(', ') || 'None'],
                  ['Live adapter ready', String(status.capabilitySummary.liveAdapterReady)],
                ]}
              />
            </Section>

            <Section title="Capability Matrix" description="One row per existing Storefront foundation, read directly from that foundation's own getCapabilities() call.">
              <CapabilityMatrixTable rows={status.capabilityMatrix} />
            </Section>

            <Section title="Feature Flags" description="Aggregated, display-only flags summarizing what this codebase's Storefront foundations currently support.">
              <FeatureFlagList flags={status.featureFlags} />
            </Section>

            <Section title="Environment Diagnostics">
              <DiagnosticsList diagnostics={status.diagnostics} />
            </Section>

            <Section title="Related Architecture Docs" description="Reference-only file paths in this repository. No network request is made to resolve them.">
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 2 }}>
                {DOC_LINKS.map((doc, i) => (
                  <div key={doc.path} style={{ padding: '10px 14px', borderBottom: i === DOC_LINKS.length - 1 ? 'none' : '1px solid #f0f0f0', fontSize: 12 }}>
                    <div style={{ fontWeight: 700, color: '#1a1a1a' }}>{doc.label}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#888' }}>{doc.path}</div>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
