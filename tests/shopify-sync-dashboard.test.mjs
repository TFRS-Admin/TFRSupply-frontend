import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    service: await server.ssrLoadModule('/src/services/shopifySyncDashboard/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifySyncDashboard.schema.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifySyncDashboard/index.ts'),
    scenario: await server.ssrLoadModule('/src/adapters/shopifySyncDashboard/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Shopify sync admin dashboard', () => {
  it('produces a schema-valid dashboard from the default mock scenario', async () => {
    const dashboard = await modules.service.shopifySyncDashboardService.loadDashboard();
    const parsed = modules.schemas.shopifySyncDashboardDataSchema.parse(dashboard);
    assert.equal(parsed.summary.sectionCount, 10);
  });

  it('builds a dry-run orchestrator execution plan spanning catalog, inventory, pricing, customer, order, and fulfillment', async () => {
    const dashboard = await modules.service.shopifySyncDashboardService.loadDashboard();
    assert.equal(dashboard.orchestrator.executionPlan.dryRun, true);
    assert.equal(dashboard.orchestrator.executionPlan.operations.length, 6);
    assert.deepEqual(dashboard.orchestrator.executionPlan.operations.map((op) => op.operation), ['catalog', 'inventory', 'pricing', 'customer', 'order', 'fulfillment']);
    assert.equal(dashboard.orchestrator.result.status, 'succeeded');
    assert.equal(dashboard.orchestrator.result.errors.length, 0);
  });

  it('queues dry-run job queue jobs with a resolved catalog -> inventory/pricing dependency order', async () => {
    const dashboard = await modules.service.shopifySyncDashboardService.loadDashboard();
    assert.equal(dashboard.jobQueue.jobs.length, 3);
    assert.ok(dashboard.jobQueue.jobs.every((job) => job.status === 'dry-run'));
    assert.equal(dashboard.jobQueue.jobs[0].jobId, 'dashboard-catalog-job');
  });

  it('produces a dry-run catalog sync preview mapping the demo product', async () => {
    const dashboard = await modules.service.shopifySyncDashboardService.loadDashboard();
    assert.equal(dashboard.catalog.status, 'dry-run');
    assert.equal(dashboard.catalog.items[0].productId, 'navigator');
    assert.equal(dashboard.catalog.mappings[0].handle, 'navigator-lightbar');
  });

  it('produces a dry-run inventory sync preview with location adjustments', async () => {
    const dashboard = await modules.service.shopifySyncDashboardService.loadDashboard();
    assert.equal(dashboard.inventory.status, 'dry-run');
    assert.equal(dashboard.inventory.items[0].sku, 'NVG-48');
    assert.equal(dashboard.inventory.mappings[0].locationMappings[0].shopifyLocationGid, 'gid://shopify/Location/1');
  });

  it('produces a dry-run pricing sync preview with a resolved strategy', async () => {
    const dashboard = await modules.service.shopifySyncDashboardService.loadDashboard();
    assert.equal(dashboard.pricing.status, 'dry-run');
    assert.equal(dashboard.pricing.items[0].sku, 'NVG-48');
    assert.ok(dashboard.pricing.items[0].price.amount > 0);
  });

  it('produces a customer sync preview mapped from the demo quote', async () => {
    const dashboard = await modules.service.shopifySyncDashboardService.loadDashboard();
    assert.equal(dashboard.customer.status, 'accepted');
    assert.equal(dashboard.customer.syncStatus, 'dry-run');
    assert.equal(dashboard.customer.customer.company, 'Metro Police Department');
  });

  it('produces an order sync preview mapped from the demo quote', async () => {
    const dashboard = await modules.service.shopifySyncDashboardService.loadDashboard();
    assert.equal(dashboard.order.status, 'accepted');
    assert.equal(dashboard.order.syncStatus, 'dry-run');
    assert.equal(dashboard.order.order.quoteId, 'quote-shopify-sync-dashboard-001');
  });

  it('produces a fulfillment sync preview mapped from the demo order', async () => {
    const dashboard = await modules.service.shopifySyncDashboardService.loadDashboard();
    assert.equal(dashboard.fulfillment.status, 'dry-run');
    assert.equal(dashboard.fulfillment.items[0].sku, 'NVG-48');
  });

  it('receives and routes a webhook event preview without a live adapter call', async () => {
    const dashboard = await modules.service.shopifySyncDashboardService.loadDashboard();
    assert.equal(dashboard.webhook.received.status, 'validated');
    assert.equal(dashboard.webhook.received.domain, 'orders');
    assert.equal(dashboard.webhook.routed.status, 'routed');
  });

  it('verifies a valid HMAC signature and rejects a mismatched one', async () => {
    const dashboard = await modules.service.shopifySyncDashboardService.loadDashboard();
    assert.equal(dashboard.webhookVerification.verified.status, 'verified');
    assert.equal(dashboard.webhookVerification.verified.verified, true);
    assert.equal(dashboard.webhookVerification.mismatched.status, 'failed');
    assert.equal(dashboard.webhookVerification.mismatched.reason, 'signature-mismatch');
  });

  it('allows injecting a custom scenario and clock for deterministic testing', async () => {
    const { createShopifySyncDashboardService } = modules.service;
    const { mockShopifySyncDashboardScenario } = modules.scenario;
    const dashboard = await createShopifySyncDashboardService({ now: () => '2026-08-01T00:00:00.000Z' }).loadDashboard();
    assert.equal(dashboard.generatedAt, '2026-08-01T00:00:00.000Z');
    assert.equal(dashboard.catalog.items[0].productId, mockShopifySyncDashboardScenario.product.id);
  });

  it('exposes a typed hook entry point', () => {
    assert.equal(typeof modules.hooks.useShopifySyncDashboard, 'function');
  });
});
