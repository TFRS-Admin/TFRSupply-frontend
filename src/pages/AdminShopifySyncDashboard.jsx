/**
 * pages/AdminShopifySyncDashboard.jsx
 * Issue 45 — Admin Shopify Sync Dashboard.
 *
 * Consumes shopifySyncDashboardService, which composes the existing Shopify sync
 * orchestrator, job queue, catalog, inventory, pricing, customer, order, fulfillment,
 * webhook, and webhook HMAC verification services against their existing mock adapters.
 * No live Shopify calls, file uploads, or persistence happen here — every result on this
 * page is a dry-run/preview produced by the real service layer.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useShopifySyncDashboard } from '@/hooks/shopifySyncDashboard';
import {
  Bug, CheckCircle2, ClipboardList, GitBranch, Layers, RefreshCw, ShieldCheck,
  ShoppingCart, Truck, Users, Webhook, XCircle,
} from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const TABS = ['orchestrator', 'job-queue', 'catalog', 'inventory', 'pricing', 'customer', 'order', 'fulfillment', 'webhook', 'webhook-verification'];
const TAB_LABELS = {
  orchestrator: 'Sync Orchestrator',
  'job-queue': 'Job Queue',
  catalog: 'Catalog Sync',
  inventory: 'Inventory Sync',
  pricing: 'Pricing Sync',
  customer: 'Customer Sync',
  order: 'Order Sync',
  fulfillment: 'Fulfillment Sync',
  webhook: 'Webhook Routing',
  'webhook-verification': 'HMAC Verification',
};
const TAB_ICONS = {
  orchestrator: GitBranch,
  'job-queue': ClipboardList,
  catalog: Layers,
  inventory: Layers,
  pricing: Layers,
  customer: Users,
  order: ShoppingCart,
  fulfillment: Truck,
  webhook: Webhook,
  'webhook-verification': ShieldCheck,
};

const FAILURE_STATUSES = new Set(['failed', 'blocked', 'cancelled', 'adapter-unavailable', 'partial']);

function StatusBadge({ value }) {
  const isFailure = FAILURE_STATUSES.has(value);
  const bg = isFailure ? '#fee2e2' : '#dcfce7';
  const text = isFailure ? '#b91c1c' : '#15803d';
  const border = isFailure ? '#fecaca' : '#86efac';
  const Icon = isFailure ? XCircle : CheckCircle2;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 2,
      background: bg, color: text, border: `1px solid ${border}`,
    }}>
      <Icon size={11} /> {value ?? 'unknown'}
    </span>
  );
}

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

function JsonPreview({ value }) {
  return (
    <pre style={{
      background: '#0f172a', color: '#e2e8f0', fontSize: 11.5, lineHeight: 1.6,
      padding: 16, borderRadius: 2, overflowX: 'auto', margin: 0,
    }}>{JSON.stringify(value, null, 2)}</pre>
  );
}

function money(value) {
  if (!value || typeof value.amount !== 'number') return '—';
  return `$${value.amount.toLocaleString()} ${value.currencyCode ?? ''}`.trim();
}

// ── Panels ────────────────────────────────────────────────────────────────────

function OrchestratorPanel({ data }) {
  const { executionPlan, result } = data.orchestrator;
  return (
    <>
      <Section title="Execution Plan" description="Deterministic operation sequence built by shopifySyncOrchestratorService.buildExecutionPlan(), with dependency ordering across domains.">
        <KeyValueGrid rows={[
          ['Plan ID', executionPlan.planId],
          ['Status', <StatusBadge key="s" value={executionPlan.status} />],
          ['Dry Run', String(executionPlan.dryRun)],
          ['Operations', executionPlan.operations.length],
        ]} />
      </Section>
      <Section title="Planned Operations">
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#1a2744', color: '#fff' }}>
                {['Seq', 'Operation', 'Operation ID', 'Depends On'].map((h) => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {executionPlan.operations.map((op, i) => (
                <tr key={op.operationId} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 12px' }}>{op.sequence}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1a2744' }}>{op.operation}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{op.operationId}</td>
                  <td style={{ padding: '10px 12px', color: '#888' }}>{op.dependsOn.length ? op.dependsOn.join(', ') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="Dry-Run Execution Result" description="Aggregated result of orchestrate() running every planned operation through its dry-run adapter.">
        <KeyValueGrid rows={[
          ['Overall Status', <StatusBadge key="s" value={result.status} />],
          ['Operation Results', result.operationResults.length],
          ['Errors', result.errors.length],
        ]} />
      </Section>
      <Section title="Operation Results (Raw)">
        <JsonPreview value={result.operationResults.map((r) => ({ operationId: r.operationId, operation: r.operation, status: r.status }))} />
      </Section>
    </>
  );
}

function JobQueuePanel({ data }) {
  const { jobs } = data.jobQueue;
  return (
    <Section title="Dry-Run Jobs" description="Queued through shopifyJobQueueService.queueJobs() against the mock job queue adapter, with a catalog -> inventory / pricing dependency chain.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        {jobs.map((result) => (
          <div key={result.jobId} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 16, borderRadius: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a2744' }}>{result.jobId}</p>
              <StatusBadge value={result.status} />
            </div>
            <p style={{ fontSize: 11, color: '#888', margin: '0 0 6px' }}>{result.job?.jobType} · priority {result.job?.priority}</p>
            <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>Depends on: {result.job?.dependsOn?.length ? result.job.dependsOn.map((d) => d.dependsOnJobId).join(', ') : 'none'}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function CatalogPanel({ data }) {
  const result = data.catalog;
  return (
    <>
      <KeyValueGrid rows={[['Status', <StatusBadge key="s" value={result.status} />], ['Items', result.items.length], ['Mappings', result.mappings.length], ['Errors', result.errors.length]]} />
      <div style={{ height: 20 }} />
      <Section title="Catalog Sync Items">
        {result.items.map((item) => (
          <div key={item.productId} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 16, borderRadius: 2, marginBottom: 10 }}>
            <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#1a2744' }}>{item.title} <span style={{ fontWeight: 400, color: '#888' }}>({item.handle})</span></p>
            <p style={{ margin: 0, fontSize: 11, color: '#888' }}>Action: {item.action} · Variants: {item.variants.length} · Price: {money(item.price)}</p>
          </div>
        ))}
      </Section>
    </>
  );
}

function InventoryPanel({ data }) {
  const result = data.inventory;
  return (
    <>
      <KeyValueGrid rows={[['Status', <StatusBadge key="s" value={result.status} />], ['Items', result.items.length], ['Errors', result.errors.length]]} />
      <div style={{ height: 20 }} />
      <Section title="Inventory Sync Items">
        {result.items.map((item) => (
          <div key={item.sku} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 16, borderRadius: 2, marginBottom: 10 }}>
            <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#1a2744' }}>{item.sku}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#888' }}>Available: {item.inventoryStatus.quantityAvailable} · Locations: {item.locations.map((l) => l.name).join(', ')}</p>
          </div>
        ))}
      </Section>
    </>
  );
}

function PricingPanel({ data }) {
  const result = data.pricing;
  return (
    <>
      <KeyValueGrid rows={[['Status', <StatusBadge key="s" value={result.status} />], ['Items', result.items.length], ['Errors', result.errors.length]]} />
      <div style={{ height: 20 }} />
      <Section title="Pricing Sync Items">
        {result.items.map((item) => (
          <div key={item.sku} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 16, borderRadius: 2, marginBottom: 10 }}>
            <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#1a2744' }}>{item.sku}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#888' }}>Strategy: {item.strategy} · Price: {money(item.price)}</p>
          </div>
        ))}
      </Section>
    </>
  );
}

function CustomerPanel({ data }) {
  const result = data.customer;
  return (
    <>
      <KeyValueGrid rows={[['Status', <StatusBadge key="s" value={result.status} />], ['Sync Status', <StatusBadge key="ss" value={result.syncStatus} />], ['Errors', result.errors.length]]} />
      <div style={{ height: 20 }} />
      <Section title="Mapped Shopify Customer">
        <KeyValueGrid rows={[
          ['Shopify Customer ID', result.customer?.shopifyCustomerId ?? '—'],
          ['Company', result.customer?.company ?? '—'],
          ['Name', [result.customer?.firstName, result.customer?.lastName].filter(Boolean).join(' ') || '—'],
          ['Email', result.customer?.email ?? '—'],
          ['Quote ID', result.customer?.quoteId ?? '—'],
        ]} />
      </Section>
    </>
  );
}

function OrderPanel({ data }) {
  const result = data.order;
  return (
    <>
      <KeyValueGrid rows={[['Status', <StatusBadge key="s" value={result.status} />], ['Sync Status', <StatusBadge key="ss" value={result.syncStatus} />], ['Errors', result.errors.length]]} />
      <div style={{ height: 20 }} />
      <Section title="Mapped Shopify Order">
        <KeyValueGrid rows={[
          ['Order ID', result.order?.id ?? '—'],
          ['Quote ID', result.order?.quoteId ?? '—'],
          ['Lines', result.order?.lines.length ?? 0],
          ['Total', money(result.order?.total)],
        ]} />
      </Section>
    </>
  );
}

function FulfillmentPanel({ data }) {
  const result = data.fulfillment;
  return (
    <>
      <KeyValueGrid rows={[['Status', <StatusBadge key="s" value={result.status} />], ['Items', result.items.length], ['Errors', result.errors.length]]} />
      <div style={{ height: 20 }} />
      <Section title="Shipment Preview">
        <KeyValueGrid rows={[
          ['Shipment ID', result.shipment?.id ?? '—'],
          ['Shipment Status', <StatusBadge key="s" value={result.shipment?.status} />],
          ['Items', result.shipment?.items.length ?? 0],
        ]} />
      </Section>
    </>
  );
}

function WebhookPanel({ data }) {
  const { received, routed } = data.webhook;
  return (
    <>
      <Section title="Received & Normalized">
        <KeyValueGrid rows={[
          ['Status', <StatusBadge key="s" value={received.status} />],
          ['Topic', received.topic ?? '—'],
          ['Domain', received.domain ?? '—'],
          ['Event ID', received.event?.id ?? '—'],
        ]} />
      </Section>
      <Section title="Routed">
        <KeyValueGrid rows={[
          ['Status', <StatusBadge key="s" value={routed.status} />],
          ['Routed To', routed.metadata?.attributes?.routedTo ?? '—'],
        ]} />
      </Section>
    </>
  );
}

function WebhookVerificationPanel({ data }) {
  const { verified, mismatched } = data.webhookVerification;
  return (
    <>
      <Section title="Valid HMAC Signature">
        <KeyValueGrid rows={[
          ['Status', <StatusBadge key="s" value={verified.status} />],
          ['Verified', String(verified.verified)],
          ['Reason', verified.reason ?? '—'],
        ]} />
      </Section>
      <Section title="Mismatched HMAC Signature" description="Same payload verified again with a signature that does not match, demonstrating the failure path.">
        <KeyValueGrid rows={[
          ['Status', <StatusBadge key="s" value={mismatched.status} />],
          ['Verified', String(mismatched.verified)],
          ['Reason', mismatched.reason ?? '—'],
        ]} />
      </Section>
    </>
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
  'webhook-verification': WebhookVerificationPanel,
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
        <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#3730a3', fontSize: 12, padding: '10px 14px', borderRadius: 2, marginBottom: 20 }}>
          Demo data only — every result on this dashboard is produced by the real Shopify sync orchestrator, job queue, catalog, inventory, pricing, customer, order, fulfillment, webhook, and HMAC verification services running in dry-run mode against their existing mock adapters. No Shopify calls are made and nothing is persisted.
        </div>

        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
            {TABS.map((tab) => {
              const Icon = TAB_ICONS[tab];
              const status = data.summary.statusesByArea[tab === 'job-queue' ? 'jobQueue' : tab === 'webhook-verification' ? 'webhookVerification' : tab];
              return (
                <div key={tab} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '10px 12px', borderRadius: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: '#888' }}>
                    <Icon size={13} />
                    <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{TAB_LABELS[tab]}</span>
                  </div>
                  <StatusBadge value={status} />
                </div>
              );
            })}
          </div>
        )}

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
