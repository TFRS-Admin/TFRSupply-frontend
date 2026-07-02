/**
 * pages/AdminShopifySyncDashboard.jsx
 * Issue 45 — Admin Shopify Sync Dashboard.
 *
 * Consumes shopifySyncAdminDashboardService, which wires the existing Shopify
 * foundation services (sync orchestrator, job queue, catalog, inventory, pricing,
 * customer, order, fulfillment, webhook, webhook HMAC verification) to their
 * deterministic mock adapters. No live Shopify calls, no persistence, no auth —
 * every value on this page is a dry-run/preview result returned by real services.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useShopifySyncAdminDashboard } from '@/hooks/shopifySyncAdminDashboard';
import {
  AlertTriangle, Boxes, CheckCircle2, ClipboardList, Clock, Globe2, Layers,
  Package, RefreshCw, ShieldCheck, ShoppingCart, Truck, User, Webhook, XCircle,
} from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const TABS = ['summary', 'orchestrator', 'jobs', 'catalog', 'inventory', 'pricing', 'customer', 'order', 'fulfillment', 'webhook', 'hmac'];
const TAB_LABELS = {
  summary: 'Summary',
  orchestrator: 'Sync Orchestrator',
  jobs: 'Job Queue',
  catalog: 'Catalog Sync',
  inventory: 'Inventory Sync',
  pricing: 'Pricing Sync',
  customer: 'Customer Sync',
  order: 'Order Sync',
  fulfillment: 'Fulfillment Sync',
  webhook: 'Webhook Routing',
  hmac: 'HMAC Verification',
};
const TAB_ICONS = {
  summary: ClipboardList, orchestrator: Layers, jobs: Boxes, catalog: Package, inventory: Boxes,
  pricing: ShoppingCart, customer: User, order: ShoppingCart, fulfillment: Truck, webhook: Webhook, hmac: ShieldCheck,
};

const GOOD_STATUSES = new Set(['succeeded', 'accepted', 'dry-run', 'validated', 'mapped', 'verified', 'routed', 'queued', 'ready', 'planned', 'cancelled']);
const WARN_STATUSES = new Set(['partial', 'blocked']);
const BAD_STATUSES = new Set(['failed', 'adapter-unavailable', 'unavailable']);

function toneForStatus(status) {
  if (GOOD_STATUSES.has(status)) return 'good';
  if (WARN_STATUSES.has(status)) return 'warning';
  if (BAD_STATUSES.has(status)) return 'critical';
  return 'neutral';
}

function StatusBadge({ status }) {
  const tone = toneForStatus(status);
  const palette = {
    good: { bg: '#dcfce7', text: '#15803d', border: '#86efac', Icon: CheckCircle2 },
    warning: { bg: '#fef3c7', text: '#92400e', border: '#fde68a', Icon: AlertTriangle },
    critical: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca', Icon: XCircle },
    neutral: { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db', Icon: Clock },
  }[tone];
  const Icon = palette.Icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 2,
      background: palette.bg, color: palette.text, border: `1px solid ${palette.border}`,
    }}>
      <Icon size={11} /> {status ?? 'unknown'}
    </span>
  );
}

function StatTile({ label, value, sublabel, tone = 'neutral' }) {
  const toneColors = { neutral: '#1a2744', good: '#15803d', warning: '#92400e', critical: '#b91c1c' };
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '16px 18px', borderRadius: 2 }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888' }}>{label}</p>
      <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 800, color: toneColors[tone] || toneColors.neutral }}>{value}</p>
      {sublabel && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#aaa' }}>{sublabel}</p>}
    </div>
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

function KeyValueTable({ rows }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <tbody>
          {rows.map(([key, value]) => (
            <tr key={key} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '9px 12px', fontWeight: 600, color: '#1a2744', width: 220, whiteSpace: 'nowrap', verticalAlign: 'top' }}>{key}</td>
              <td style={{ padding: '9px 12px', color: '#1a1a1a', fontFamily: 'monospace', wordBreak: 'break-word' }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ErrorsList({ errors }) {
  if (!errors || errors.length === 0) {
    return <p style={{ fontSize: 12, color: '#15803d', margin: '8px 0 0' }}>No errors.</p>;
  }
  return (
    <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12, color: '#b91c1c' }}>
      {errors.map((err, i) => <li key={i}>{err.code}: {err.message}</li>)}
    </ul>
  );
}

// ── Panels ────────────────────────────────────────────────────────────────────

function SummaryPanel({ data }) {
  const { summary } = data;
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatTile label="Sections" value={summary.sectionCount} />
        <StatTile label="Plan Operations" value={summary.operationCount} />
        <StatTile label="Dry-Run Jobs" value={summary.jobCount} />
        <StatTile label="Errors" value={summary.errorCount} tone={summary.errorCount > 0 ? 'warning' : 'good'} />
      </div>
      <Section title="Status Counts Across All Previews" description="Every service result on this page is tallied by its status value.">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(summary.statusCounts).map(([status, count]) => (
            <span key={status} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px', background: '#f4f5f7', border: '1px solid #e5e7eb', borderRadius: 2, color: '#1a1a1a' }}>
              <StatusBadge status={status} /> <strong>{count}</strong>
            </span>
          ))}
        </div>
      </Section>
      <Section title="What This Dashboard Proves" description="Each tab exercises a real Shopify foundation service against deterministic demo data.">
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#555', lineHeight: 1.8 }}>
          <li>Sync Orchestrator builds a dependency-ordered execution plan and runs it dry-run.</li>
          <li>Job Queue accepts jobs, resolves dependencies, and previews each job&apos;s execution plan.</li>
          <li>Catalog, Inventory, Pricing, Customer, Order, and Fulfillment services map demo products/quotes to Shopify-shaped payloads.</li>
          <li>Webhook service normalizes and routes a sample inbound event.</li>
          <li>HMAC verification service checks a valid and an invalid signature.</li>
        </ul>
      </Section>
    </>
  );
}

function OrchestratorPanel({ data }) {
  const { plan, result } = data.orchestrator;
  return (
    <>
      <Section title="Execution Plan" description="Deterministic dry-run plan built by shopifySyncOrchestratorService.buildExecutionPlan().">
        <KeyValueTable rows={[
          ['Plan ID', plan.planId],
          ['Request ID', plan.requestId],
          ['Status', <StatusBadge status={plan.status} key="s" />],
          ['Dry Run', String(plan.dryRun)],
          ['Operations', plan.operations.length],
          ['Created At', plan.createdAt],
        ]} />
      </Section>
      <Section title="Planned Operations">
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#1a2744', color: '#fff' }}>
                {['Seq', 'Operation ID', 'Operation', 'Depends On'].map((h) => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plan.operations.map((op, i) => (
                <tr key={op.operationId} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 12px', color: '#1a1a1a' }}>{op.sequence}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#1a1a1a' }}>{op.operationId}</td>
                  <td style={{ padding: '10px 12px', color: '#1a1a1a' }}>{op.operation}</td>
                  <td style={{ padding: '10px 12px', color: '#888' }}>{op.dependsOn.length ? op.dependsOn.join(', ') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="Orchestration Result" description="Result of shopifySyncOrchestratorService.orchestrate() executing the plan against dry-run adapters.">
        <KeyValueTable rows={[
          ['Overall Status', <StatusBadge status={result.status} key="s" />],
          ['Started At', result.startedAt],
          ['Completed At', result.completedAt],
          ['Error Count', result.errors.length],
        ]} />
        <div style={{ marginTop: 12 }}>
          {result.operationResults.map((op) => (
            <div key={op.operationId} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 14, marginBottom: 8, borderRadius: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong style={{ fontSize: 12, color: '#1a2744' }}>{op.operationId} ({op.operation})</strong>
                <StatusBadge status={op.status} />
              </div>
              <ErrorsList errors={op.errors} />
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function JobsPanel({ data }) {
  const { jobs } = data.jobQueue;
  return (
    <Section title="Dry-Run Jobs" description="Jobs queued through shopifyJobQueueService.queueJobs(), including dependency resolution and priority ordering.">
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#1a2744', color: '#fff' }}>
              {['Job ID', 'Type', 'Priority', 'Status', 'Depends On', 'Errors'].map((h) => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map((result, i) => (
              <tr key={result.jobId} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#1a1a1a' }}>{result.jobId}</td>
                <td style={{ padding: '10px 12px', color: '#1a1a1a' }}>{result.job?.jobType ?? '—'}</td>
                <td style={{ padding: '10px 12px', color: '#1a1a1a' }}>{result.job?.priority ?? '—'}</td>
                <td style={{ padding: '10px 12px' }}><StatusBadge status={result.status} /></td>
                <td style={{ padding: '10px 12px', color: '#888' }}>{result.job?.dependsOn?.length ? result.job.dependsOn.map((d) => d.dependsOnJobId).join(', ') : '—'}</td>
                <td style={{ padding: '10px 12px', color: result.errors.length ? '#b91c1c' : '#aaa' }}>{result.errors.length || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function CatalogPanel({ data }) {
  const { catalog } = data;
  return (
    <>
      <Section title="Catalog Sync Result" description="shopifyCatalogService.syncCatalog() mapping demo products to Shopify catalog items.">
        <KeyValueTable rows={[['Status', <StatusBadge status={catalog.status} key="s" />], ['Items', catalog.items.length], ['Mappings', catalog.mappings.length]]} />
      </Section>
      <Section title="Mapped Items">
        {catalog.items.map((item) => (
          <div key={item.sku} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 14, marginBottom: 8, borderRadius: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <strong style={{ fontSize: 12, color: '#1a2744' }}>{item.title} — {item.sku}</strong>
              <StatusBadge status={item.status} />
            </div>
            <p style={{ fontSize: 11, color: '#888', margin: 0 }}>Handle: {item.handle} · Action: {item.action} · Variants: {item.variants.length}</p>
          </div>
        ))}
      </Section>
    </>
  );
}

function InventoryPanel({ data }) {
  const { inventory } = data;
  return (
    <>
      <Section title="Inventory Sync Result" description="shopifyInventoryService.syncInventory() computing per-location adjustments.">
        <KeyValueTable rows={[['Status', <StatusBadge status={inventory.status} key="s" />], ['Items', inventory.items.length], ['Mappings', inventory.mappings.length]]} />
      </Section>
      <Section title="Item Adjustments">
        {inventory.items.map((item) => (
          <div key={item.sku} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 14, marginBottom: 8, borderRadius: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <strong style={{ fontSize: 12, color: '#1a2744' }}>{item.sku}</strong>
              <StatusBadge status={item.status} />
            </div>
            <p style={{ fontSize: 11, color: '#888', margin: 0 }}>
              Available: {item.inventoryStatus.quantityAvailable} · Locations: {item.locations.map((l) => l.name).join(', ')}
            </p>
          </div>
        ))}
      </Section>
    </>
  );
}

function PricingPanel({ data }) {
  const { pricing } = data;
  return (
    <>
      <Section title="Pricing Sync Result" description="shopifyPricingService.syncPricing() resolving prices from demo products.">
        <KeyValueTable rows={[['Status', <StatusBadge status={pricing.status} key="s" />], ['Items', pricing.items.length], ['Mappings', pricing.mappings.length]]} />
      </Section>
      <Section title="Resolved Prices">
        {pricing.items.map((item) => (
          <div key={item.sku} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 14, marginBottom: 8, borderRadius: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <strong style={{ fontSize: 12, color: '#1a2744' }}>{item.sku}</strong>
              <StatusBadge status={item.status} />
            </div>
            <p style={{ fontSize: 11, color: '#888', margin: 0 }}>
              Price: ${item.price.amount.toFixed(2)} {item.price.currencyCode} · Strategy: {item.strategy}
            </p>
          </div>
        ))}
      </Section>
    </>
  );
}

function CustomerPanel({ data }) {
  const { customer } = data;
  return (
    <Section title="Customer Sync Preview" description="shopifyCustomerService.createCustomer() mapping the demo quote's customer metadata.">
      <KeyValueTable rows={[
        ['Status', <StatusBadge status={customer.status} key="s" />],
        ['Sync Status', customer.syncStatus],
        ['Shopify Customer ID', customer.customer?.shopifyCustomerId ?? '—'],
        ['Email', customer.customer?.email ?? '—'],
        ['Company', customer.customer?.company ?? '—'],
        ['Tags', customer.customer?.tags?.join(', ') ?? '—'],
      ]} />
      <div style={{ marginTop: 12 }}><ErrorsList errors={customer.errors} /></div>
    </Section>
  );
}

function OrderPanel({ data }) {
  const { order } = data;
  return (
    <Section title="Order Sync Preview" description="shopifyOrderService.createOrder() mapping the demo quote to a Shopify order draft.">
      <KeyValueTable rows={[
        ['Status', <StatusBadge status={order.status} key="s" />],
        ['Sync Status', order.syncStatus],
        ['Order ID', order.order?.id ?? '—'],
        ['Lines', order.order?.lines?.length ?? 0],
        ['Total', order.order?.total ? `$${order.order.total.amount.toFixed(2)} ${order.order.total.currencyCode}` : '—'],
      ]} />
      <div style={{ marginTop: 12 }}><ErrorsList errors={order.errors} /></div>
    </Section>
  );
}

function FulfillmentPanel({ data }) {
  const { fulfillment } = data;
  return (
    <Section title="Fulfillment Sync Preview" description="shopifyFulfillmentService.createFulfillment() mapping the draft order to a shipment.">
      <KeyValueTable rows={[
        ['Status', <StatusBadge status={fulfillment.status} key="s" />],
        ['Items', fulfillment.items.length],
        ['Shipment Status', fulfillment.shipment?.status ?? '—'],
        ['Shipment ID', fulfillment.shipment?.id ?? '—'],
      ]} />
      <div style={{ marginTop: 12 }}><ErrorsList errors={fulfillment.errors} /></div>
    </Section>
  );
}

function WebhookPanel({ data }) {
  const { webhook } = data;
  return (
    <>
      <Section title="Webhook Received" description="shopifyWebhookService.receiveWebhook() normalizing an inbound orders/create webhook.">
        <KeyValueTable rows={[
          ['Status', <StatusBadge status={webhook.received.status} key="s" />],
          ['Topic', webhook.received.topic],
          ['Domain', webhook.received.domain ?? '—'],
          ['Event ID', webhook.received.event?.id ?? '—'],
        ]} />
        <div style={{ marginTop: 12 }}><ErrorsList errors={webhook.received.errors} /></div>
      </Section>
      <Section title="Webhook Routed" description="shopifyWebhookService.routeWebhookEvent() routing the normalized event to its domain handler.">
        <KeyValueTable rows={[
          ['Status', <StatusBadge status={webhook.routed.status} key="s" />],
          ['Routed To', webhook.routed.metadata?.attributes?.routedTo ?? '—'],
        ]} />
        <div style={{ marginTop: 12 }}><ErrorsList errors={webhook.routed.errors} /></div>
      </Section>
    </>
  );
}

function HmacPanel({ data }) {
  const { hmacVerification } = data;
  return (
    <>
      <Section title="Valid Signature" description="shopifyWebhookVerificationService.verifyWebhookSignature() with a matching mock HMAC header.">
        <KeyValueTable rows={[
          ['Status', <StatusBadge status={hmacVerification.valid.status} key="s" />],
          ['Verified', String(hmacVerification.valid.verified)],
          ['Reason', hmacVerification.valid.reason ?? '—'],
        ]} />
      </Section>
      <Section title="Invalid Signature" description="Same verification service call, with a mismatched HMAC header, to demonstrate rejection.">
        <KeyValueTable rows={[
          ['Status', <StatusBadge status={hmacVerification.invalid.status} key="s" />],
          ['Verified', String(hmacVerification.invalid.verified)],
          ['Reason', hmacVerification.invalid.reason ?? '—'],
        ]} />
        <div style={{ marginTop: 12 }}><ErrorsList errors={hmacVerification.invalid.failures} /></div>
      </Section>
    </>
  );
}

const PANELS = {
  summary: SummaryPanel,
  orchestrator: OrchestratorPanel,
  jobs: JobsPanel,
  catalog: CatalogPanel,
  inventory: InventoryPanel,
  pricing: PricingPanel,
  customer: CustomerPanel,
  order: OrderPanel,
  fulfillment: FulfillmentPanel,
  webhook: WebhookPanel,
  hmac: HmacPanel,
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminShopifySyncDashboard() {
  const [activeTab, setActiveTab] = useState('summary');
  const { data, loading, error, loadDashboard } = useShopifySyncAdminDashboard();

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
            <Link to="/admin/pricing-imports" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
              <Globe2 size={13} /> Pricing Imports
            </Link>
            <Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Store</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#3730a3', fontSize: 12, padding: '10px 14px', borderRadius: 2, marginBottom: 20 }}>
          Demo data only — every result on this dashboard comes from the real shopifySyncOrchestrator, shopifyJobQueue, shopifyCatalog,
          shopifyInventory, shopifyPricing, shopifyCustomer, shopifyOrder, shopifyFulfillment, shopifyWebhook, and shopifyWebhookVerification
          services, wired to deterministic mock adapters. No live Shopify API calls are made and nothing is persisted.
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            const Icon = TAB_ICONS[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '7px 14px', fontSize: 12, fontWeight: isActive ? 700 : 400,
                  cursor: 'pointer', border: '1.5px solid', display: 'inline-flex', alignItems: 'center', gap: 6,
                  borderColor: isActive ? '#1a2744' : '#d1d5db',
                  background: isActive ? '#1a2744' : '#fff',
                  color: isActive ? '#fff' : '#555',
                  borderRadius: 2,
                }}
              >
                <Icon size={12} /> {TAB_LABELS[tab]}
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
