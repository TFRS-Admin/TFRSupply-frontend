/**
 * pages/AdminShopifySyncDashboard.jsx
 * Issue 045 — Admin Shopify Sync Dashboard.
 *
 * Consumes shopifySyncDashboardService, which calls the existing Shopify sync
 * orchestrator, job queue, catalog, inventory, pricing, customer, order,
 * fulfillment, webhook, and webhook HMAC verification services through their
 * existing mock adapters. No live Shopify API calls, no persistence, no auth.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useShopifySyncDashboard } from '@/hooks/shopifySyncDashboard';
import {
  Bug, CheckCircle2, Clock, ListChecks, RefreshCw, ShieldCheck, XCircle,
} from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const TABS = ['orchestrator', 'job-queue', 'catalog', 'inventory', 'pricing', 'customer', 'order', 'fulfillment', 'webhook', 'hmac-verification'];
const TAB_LABELS = {
  orchestrator: 'Sync Orchestrator',
  'job-queue': 'Job Queue',
  catalog: 'Catalog Preview',
  inventory: 'Inventory Preview',
  pricing: 'Pricing Preview',
  customer: 'Customer Preview',
  order: 'Order Preview',
  fulfillment: 'Fulfillment Preview',
  webhook: 'Webhook Routing',
  'hmac-verification': 'HMAC Verification',
};

const STATUS_TONE = {
  succeeded: { bg: '#dcfce7', text: '#15803d', border: '#86efac', Icon: CheckCircle2 },
  accepted: { bg: '#dcfce7', text: '#15803d', border: '#86efac', Icon: CheckCircle2 },
  verified: { bg: '#dcfce7', text: '#15803d', border: '#86efac', Icon: CheckCircle2 },
  routed: { bg: '#dcfce7', text: '#15803d', border: '#86efac', Icon: CheckCircle2 },
  'dry-run': { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', Icon: Clock },
  validated: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', Icon: Clock },
  mapped: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', Icon: Clock },
  planned: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', Icon: Clock },
  queued: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', Icon: Clock },
  partial: { bg: '#fef3c7', text: '#92400e', border: '#fde68a', Icon: Clock },
  'adapter-unavailable': { bg: '#fef3c7', text: '#92400e', border: '#fde68a', Icon: Clock },
  failed: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca', Icon: XCircle },
};

function StatusBadge({ status }) {
  const tone = STATUS_TONE[status] || STATUS_TONE['dry-run'];
  const Icon = tone.Icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 2,
      background: tone.bg, color: tone.text, border: `1px solid ${tone.border}`,
    }}>
      <Icon size={11} /> {String(status)}
    </span>
  );
}

function Section({ title, description, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#1a2744', marginBottom: description ? 2 : 10 }}>{title}</p>
      {description && <p style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>{description}</p>}
      {children}
    </div>
  );
}

function JsonPreview({ value }) {
  return (
    <pre style={{
      margin: 0, background: '#0f172a', color: '#e2e8f0', fontSize: 11.5, lineHeight: 1.5,
      padding: 14, borderRadius: 2, overflowX: 'auto', maxHeight: 360, overflowY: 'auto',
      fontFamily: "'SFMono-Regular', Consolas, monospace",
    }}>
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function ErrorsList({ errors, emptyLabel = 'No errors reported.' }) {
  if (!errors || errors.length === 0) {
    return <p style={{ fontSize: 12, color: '#aaa' }}>{emptyLabel}</p>;
  }
  return (
    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#991b1b' }}>
      {errors.map((error, i) => (
        <li key={`${error.code}-${i}`}>
          <strong>{error.code}</strong> — {error.message}
          {error.retryable ? ' (retryable)' : ''}
        </li>
      ))}
    </ul>
  );
}

function ResultCard({ title, status, errors, value }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 16, borderRadius: 2, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a2744' }}>{title}</p>
        <StatusBadge status={status} />
      </div>
      <ErrorsList errors={errors} />
      <div style={{ marginTop: 10 }}>
        <JsonPreview value={value} />
      </div>
    </div>
  );
}

// ── Panels ────────────────────────────────────────────────────────────────────

function OrchestratorPanel({ data }) {
  const { plan, result } = data.orchestrator;
  return (
    <>
      <Section title="Execution Plan" description="Deterministic dry-run plan built by shopifySyncOrchestratorService.buildExecutionPlan().">
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 16, borderRadius: 2, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#555', marginBottom: 8 }}>
            <span><strong>Plan:</strong> {plan.planId}</span>
            <span><strong>Operations:</strong> {plan.operations.length}</span>
            <span><StatusBadge status={plan.status} /></span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#1a2744', color: '#fff' }}>
                {['Sequence', 'Operation ID', 'Operation', 'Depends On'].map((h) => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plan.operations.map((op, i) => (
                <tr key={op.operationId} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 10px', color: '#1a1a1a' }}>{op.sequence}</td>
                  <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#1a1a1a' }}>{op.operationId}</td>
                  <td style={{ padding: '8px 10px', color: '#1a1a1a' }}>{op.operation}</td>
                  <td style={{ padding: '8px 10px', color: '#888' }}>{op.dependsOn.length ? op.dependsOn.join(', ') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Orchestration Result" description="Aggregated result of dispatching every operation to its existing Shopify service (dry-run only).">
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <StatusBadge status={result.status} />
          <span style={{ fontSize: 12, color: '#555' }}>{result.operationResults.length} operations · {result.errors.length} errors</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', border: '1px solid #e5e7eb' }}>
          <thead>
            <tr style={{ background: '#1a2744', color: '#fff' }}>
              {['Operation ID', 'Operation', 'Status', 'Errors'].map((h) => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.operationResults.map((op, i) => (
              <tr key={op.operationId} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#1a1a1a' }}>{op.operationId}</td>
                <td style={{ padding: '8px 10px', color: '#1a1a1a' }}>{op.operation}</td>
                <td style={{ padding: '8px 10px' }}><StatusBadge status={op.status} /></td>
                <td style={{ padding: '8px 10px', color: op.errors.length ? '#b91c1c' : '#aaa' }}>{op.errors.length || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}

function JobQueuePanel({ data }) {
  const { jobs } = data.jobQueue;
  return (
    <Section title="Dry-Run Job Queue" description="Jobs queued through shopifyJobQueueService using the in-memory mock queue adapter — no real queue, worker, or persistence layer exists.">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', border: '1px solid #e5e7eb' }}>
        <thead>
          <tr style={{ background: '#1a2744', color: '#fff' }}>
            {['Job ID', 'Job Type', 'Priority', 'Status', 'Depends On', 'Errors'].map((h) => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jobs.map((result, i) => (
            <tr key={result.jobId} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#1a1a1a' }}>{result.jobId}</td>
              <td style={{ padding: '8px 10px', color: '#1a1a1a' }}>{result.job?.jobType ?? '—'}</td>
              <td style={{ padding: '8px 10px', color: '#1a1a1a' }}>{result.job?.priority ?? '—'}</td>
              <td style={{ padding: '8px 10px' }}><StatusBadge status={result.status} /></td>
              <td style={{ padding: '8px 10px', color: '#888' }}>{result.job?.dependsOn?.length ? result.job.dependsOn.map((d) => d.dependsOnJobId).join(', ') : '—'}</td>
              <td style={{ padding: '8px 10px', color: result.errors.length ? '#b91c1c' : '#aaa' }}>{result.errors.length || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

function CatalogPanel({ data }) {
  return <ResultCard title="shopifyCatalogService.syncCatalog()" status={data.catalog.status} errors={data.catalog.errors} value={data.catalog} />;
}

function InventoryPanel({ data }) {
  return <ResultCard title="shopifyInventoryService.syncInventory()" status={data.inventory.status} errors={data.inventory.errors} value={data.inventory} />;
}

function PricingPanel({ data }) {
  return <ResultCard title="shopifyPricingService.syncPricing()" status={data.pricing.status} errors={data.pricing.errors} value={data.pricing} />;
}

function CustomerPanel({ data }) {
  return <ResultCard title="shopifyCustomerService.createCustomer()" status={data.customer.status} errors={data.customer.errors} value={data.customer} />;
}

function OrderPanel({ data }) {
  return <ResultCard title="shopifyOrderService.createOrder()" status={data.order.status} errors={data.order.errors} value={data.order} />;
}

function FulfillmentPanel({ data }) {
  return <ResultCard title="shopifyFulfillmentService.createFulfillment()" status={data.fulfillment.status} errors={data.fulfillment.errors} value={data.fulfillment} />;
}

function WebhookPanel({ data }) {
  const { received, routed } = data.webhook;
  return (
    <>
      <ResultCard title="shopifyWebhookService.receiveWebhook()" status={received.status} errors={received.errors} value={received} />
      <ResultCard title="shopifyWebhookService.routeWebhookEvent()" status={routed.status} errors={routed.errors} value={routed} />
    </>
  );
}

function HmacVerificationPanel({ data }) {
  const result = data.webhookVerification;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 16, borderRadius: 2 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a2744' }}>shopifyWebhookVerificationService.verifyWebhookSignature()</p>
        <StatusBadge status={result.status} />
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, fontSize: 12 }}>
        <ShieldCheck size={14} color={result.verified ? '#15803d' : '#b91c1c'} />
        <span style={{ fontWeight: 700, color: result.verified ? '#15803d' : '#b91c1c' }}>{result.verified ? 'HMAC signature verified' : 'HMAC signature not verified'}</span>
      </div>
      <ErrorsList errors={result.failures} emptyLabel="No verification failures." />
      <div style={{ marginTop: 10 }}>
        <JsonPreview value={result} />
      </div>
    </div>
  );
}

const PANELS = {
  orchestrator: OrchestratorPanel,
  'job-queue': JobQueuePanel,
  catalog: CatalogPanel,
  inventory: InventoryPanel,
  pricing: PricingPanel,
  customer: CustomerPanel,
  order: OrderPanel,
  fulfillment: FulfillmentPanel,
  webhook: WebhookPanel,
  'hmac-verification': HmacVerificationPanel,
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminShopifySyncDashboard() {
  const [activeTab, setActiveTab] = useState('orchestrator');
  const { data, loading, error, loadDashboard } = useShopifySyncDashboard();

  useEffect(() => {
    loadDashboard().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Panel = PANELS[activeTab];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', ...FS }}>
      <div style={{ background: '#1a2744', color: '#fff', padding: '0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 18, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              TFR Supply — Admin
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em' }}>
              SHOPIFY SYNC DASHBOARD
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={() => loadDashboard().catch(() => {})}
              disabled={loading}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '7px 14px', fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 2 }}
            >
              <RefreshCw size={13} /> {loading ? 'Loading…' : 'Refresh'}
            </button>
            <Link to="/admin/debug" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
              <Bug size={13} /> Debug
            </Link>
            <Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Store</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#eef2ff', border: '1px solid #c7d2fe', color: '#3730a3', fontSize: 12, padding: '10px 14px', borderRadius: 2, marginBottom: 20 }}>
          <ListChecks size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Demo data only — every result on this dashboard is produced by <code>shopifySyncDashboardService</code>, which
            calls the existing Shopify sync orchestrator, job queue, catalog, inventory, pricing, customer, order, fulfillment,
            webhook, and HMAC verification services through their existing mock adapters. No live Shopify API calls are made,
            no data is persisted, and no authentication gate is applied to this route.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '7px 16px', fontSize: 12, fontWeight: isActive ? 700 : 400,
                  cursor: 'pointer', border: '1.5px solid',
                  borderColor: isActive ? '#1a2744' : '#d1d5db',
                  background: isActive ? '#1a2744' : '#fff',
                  color: isActive ? '#fff' : '#555',
                  borderRadius: 2,
                }}
              >
                {TAB_LABELS[tab]}
              </button>
            );
          })}
        </div>

        {loading && !data && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#888', fontSize: 14 }}>Loading Shopify sync dashboard…</div>
        )}
        {error && (
          <div style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13, marginBottom: 20 }}>
            Failed to load Shopify sync dashboard: {error instanceof Error ? error.message : String(error)}
          </div>
        )}
        {data && <Panel data={data} />}
      </div>
    </div>
  );
}
