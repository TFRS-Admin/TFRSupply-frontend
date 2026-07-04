import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2, RefreshCw, Server, XCircle } from 'lucide-react';
import { useCatalogAdapterStatus } from '@/hooks/catalogAdapter';
import { useShopifyStorefrontCapabilities, useShopifyStorefrontConfig } from '@/hooks/shopifyStorefrontConfig';
import StorefrontConfigReadinessRow from '@/components/shopify/StorefrontConfigReadinessRow';

const MODE_COLOR = {
  mock: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  unavailable: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  live: 'text-green-400 bg-green-400/10 border-green-400/20',
};

const FETCH_STATUS_COLOR = {
  idle: 'text-gray-500',
  success: 'text-green-400',
  failed: 'text-red-400',
  'adapter-unavailable': 'text-amber-400',
};

function StatCard({ label, value, valueClassName = 'text-white' }) {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
      <div className="text-gray-500 text-xs mb-1">{label}</div>
      <div className={`font-bold text-lg ${valueClassName}`}>{value}</div>
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

/**
 * Internal dev dashboard for the Shopify Storefront Catalog Adapter
 * Foundation. Read-only by default (mirrors catalogAdapterService.getStatus()
 * on load) with a manual, developer-supplied credential form to exercise the
 * live-capable adapter without requiring production credentials or any
 * build-time secret. Nothing entered here is persisted — it lives only in
 * this page's component state and is used solely for a direct
 * browser-to-Shopify Storefront API request.
 */
export default function DevStorefrontDashboard() {
  const navigate = useNavigate();
  const { status, loading, sync, activateLiveAdapter, resetToDefaultAdapter } = useCatalogAdapterStatus();
  const { validation } = useShopifyStorefrontConfig();
  const { summary } = useShopifyStorefrontCapabilities();

  const [storeDomain, setStoreDomain] = useState('');
  const [apiVersion, setApiVersion] = useState('2024-10');
  const [storefrontAccessToken, setStorefrontAccessToken] = useState('');

  const handleActivateLive = (event) => {
    event.preventDefault();
    activateLiveAdapter({ storeDomain: storeDomain.trim(), apiVersion: apiVersion.trim(), storefrontAccessToken: storefrontAccessToken.trim() });
  };

  const modeClass = MODE_COLOR[status.adapterMode] ?? MODE_COLOR.mock;
  const mappingValidation = status.mappingValidation;

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> Home
          </button>
          <span className="text-gray-700">/</span>
          <span className="flex items-center gap-2 text-gray-300 text-sm">
            <Server size={14} className="text-green-400" /> Dev / Storefront Catalog Adapter
          </span>
        </div>
        <div className="text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-full">DEV TOOL</div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2">Storefront Catalog Adapter Status</h1>
          <p className="text-gray-500 text-sm max-w-2xl">
            Shows which Catalog Adapter is currently active, the last product/collection sync outcome, and mapping validation
            results. The default adapter is always the existing mock/loader-backed catalog — switching adapters here never
            requires production credentials and never changes what Homepage, Search, Category, or Product Detail render unless
            a live sync actually succeeds.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Active Adapter" value={status.adapterMode} valueClassName={modeClass.split(' ')[0]} />
          <StatCard label="Product Fetch" value={status.productFetchStatus} valueClassName={FETCH_STATUS_COLOR[status.productFetchStatus]} />
          <StatCard label="Collection Fetch" value={status.collectionFetchStatus} valueClassName={FETCH_STATUS_COLOR[status.collectionFetchStatus]} />
          <StatCard label="Last Synchronized" value={status.lastSyncedAt ? new Date(status.lastSyncedAt).toLocaleString() : 'Never'} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Synced Products" value={status.productCount} />
          <StatCard label="Synced Categories" value={status.categoryCount} />
          <StatCard
            label="Serving Fallback Data"
            value={status.usedFallback ? 'Yes (mock)' : 'No'}
            valueClassName={status.usedFallback ? 'text-amber-400' : 'text-green-400'}
          />
          <StatCard label="Errors" value={status.errors.length} valueClassName={status.errors.length > 0 ? 'text-red-400' : 'text-gray-500'} />
        </div>

        {status.fallbackReason && (
          <div className="mb-8 bg-amber-900/20 border border-amber-700/40 rounded-2xl p-4 text-sm text-amber-300">
            {status.fallbackReason}
          </div>
        )}

        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={sync}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Sync Now
          </button>
          <button
            onClick={resetToDefaultAdapter}
            className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
          >
            Reset to Default Adapter
          </button>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Mapping Validation Results</h2>
          {mappingValidation ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-black/20 rounded-xl p-3">
                  <div className="text-gray-500 mb-1">Valid products</div>
                  <div className="text-green-400 font-bold text-lg">{mappingValidation.validProductCount}</div>
                </div>
                <div className="bg-black/20 rounded-xl p-3">
                  <div className="text-gray-500 mb-1">Invalid products</div>
                  <div className="text-red-400 font-bold text-lg">{mappingValidation.invalidProductCount}</div>
                </div>
                <div className="bg-black/20 rounded-xl p-3">
                  <div className="text-gray-500 mb-1">Valid categories</div>
                  <div className="text-green-400 font-bold text-lg">{mappingValidation.validCategoryCount}</div>
                </div>
                <div className="bg-black/20 rounded-xl p-3">
                  <div className="text-gray-500 mb-1">Unmatched collections</div>
                  <div className="text-amber-400 font-bold text-lg">{mappingValidation.unmatchedCollectionCount}</div>
                </div>
              </div>
              {mappingValidation.issues.length > 0 && (
                <div className="space-y-2 mt-4">
                  {mappingValidation.issues.map((issue, index) => (
                    <div key={`${issue.entityType}-${issue.identifier}-${index}`} className="flex items-start gap-2 text-xs bg-red-900/10 border border-red-700/30 rounded-xl px-3 py-2">
                      <XCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
                      <span className="text-gray-300"><span className="font-mono text-red-300">{issue.entityType}:{issue.identifier}</span> — {issue.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No sync has run yet. Click "Sync Now" to fetch and validate catalog data through the active adapter.</p>
          )}
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-2">Activate Live Adapter (optional, no production credentials required)</h2>
          <p className="text-sm text-gray-500 mb-4">
            Paste a Shopify Storefront <em>public</em> access token to exercise a real fetch against the Shopify Storefront API.
            Nothing here is persisted or sent anywhere except directly from your browser to the store domain you enter. Leaving
            this blank and clicking "Sync Now" above is the safe default path — it will report "not configured" and keep serving
            mock catalog data.
          </p>
          <form onSubmit={handleActivateLive} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="store.myshopify.com"
              value={storeDomain}
              onChange={(event) => setStoreDomain(event.target.value)}
              className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-600"
            />
            <input
              type="text"
              placeholder="API version (e.g. 2024-10)"
              value={apiVersion}
              onChange={(event) => setApiVersion(event.target.value)}
              className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-600"
            />
            <input
              type="password"
              placeholder="Storefront public access token"
              value={storefrontAccessToken}
              onChange={(event) => setStorefrontAccessToken(event.target.value)}
              className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-600"
            />
            <button
              type="submit"
              className="md:col-span-3 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
            >
              <CheckCircle size={14} /> Activate Live Adapter
            </button>
          </form>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Storefront Runtime Configuration</h2>
          <StorefrontConfigReadinessRow validation={validation} />
          {summary && (
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <div>Storefront API adapter: <span className="text-gray-300">{summary.adapterMode}</span></div>
              <div>Product sync adapter: <span className="text-gray-300">{summary.productAdapterMode}</span></div>
              <div>Collection sync adapter: <span className="text-gray-300">{summary.collectionAdapterMode}</span></div>
              <div>Cart adapter: <span className="text-gray-300">{summary.cartAdapterMode}</span></div>
            </div>
          )}
        </div>
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
