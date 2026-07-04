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
      </div>
    </div>
  );
}
