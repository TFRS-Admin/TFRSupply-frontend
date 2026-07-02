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
  };
});
after(async () => { await server?.close(); });

describe('Shopify sync admin dashboard', () => {
  it('loads a schema-valid dashboard payload from the default (mock-backed) service', async () => {
    const data = await modules.service.shopifySyncDashboardService.loadDashboard();
    assert.doesNotThrow(() => modules.schemas.shopifySyncDashboardDataSchema.parse(data));
  });

  it('builds an execution plan covering every requested Shopify sync operation', async () => {
    const svc = modules.service.createShopifySyncDashboardService({ now: () => '2026-07-02T00:00:00.000Z' });
    const data = await svc.loadDashboard();
    const operations = data.orchestrator.plan.operations.map((op) => op.operation);
    for (const expected of ['catalog', 'inventory', 'pricing', 'customer', 'order', 'fulfillment', 'webhook', 'webhook-verification']) {
      assert.ok(operations.includes(expected), `expected plan to include operation "${expected}"`);
    }
  });

  it('executes the orchestrator dry-run without adapter-unavailable errors', async () => {
    const svc = modules.service.createShopifySyncDashboardService({ now: () => '2026-07-02T00:00:00.000Z' });
    const data = await svc.loadDashboard();
    assert.notEqual(data.orchestrator.result.status, 'adapter-unavailable');
    assert.notEqual(data.orchestrator.result.status, 'failed');
    assert.equal(data.orchestrator.result.errors.length, 0);
    assert.equal(data.orchestrator.result.operationResults.length, 8);
    for (const operationResult of data.orchestrator.result.operationResults) {
      assert.notEqual(operationResult.status, 'adapter-unavailable');
      assert.notEqual(operationResult.status, 'failed');
    }
  });

  it('queues one dry-run job per Shopify sync operation through the mock job queue adapter', async () => {
    const svc = modules.service.createShopifySyncDashboardService({ now: () => '2026-07-02T00:00:00.000Z' });
    const data = await svc.loadDashboard();
    assert.equal(data.jobQueue.jobs.length, 8);
    for (const job of data.jobQueue.jobs) {
      assert.equal(job.status, 'dry-run');
      assert.equal(job.errors.length, 0);
    }
  });

  it('produces a real catalog sync preview mapped from the demo product fixture', async () => {
    const svc = modules.service.createShopifySyncDashboardService({ now: () => '2026-07-02T00:00:00.000Z' });
    const data = await svc.loadDashboard();
    assert.equal(data.catalog.status, 'dry-run');
    assert.equal(data.catalog.items[0].productId, 'navigator');
  });

  it('produces a real inventory sync preview with location mappings', async () => {
    const svc = modules.service.createShopifySyncDashboardService({ now: () => '2026-07-02T00:00:00.000Z' });
    const data = await svc.loadDashboard();
    assert.equal(data.inventory.status, 'dry-run');
    assert.equal(data.inventory.mappings[0].locationMappings[0].shopifyLocationGid, 'gid://shopify/Location/1');
  });

  it('produces a real pricing sync preview', async () => {
    const svc = modules.service.createShopifySyncDashboardService({ now: () => '2026-07-02T00:00:00.000Z' });
    const data = await svc.loadDashboard();
    assert.equal(data.pricing.status, 'dry-run');
    assert.equal(data.pricing.items.length > 0, true);
  });

  it('produces a real customer sync preview from the demo quote fixture', async () => {
    const svc = modules.service.createShopifySyncDashboardService({ now: () => '2026-07-02T00:00:00.000Z' });
    const data = await svc.loadDashboard();
    assert.equal(data.customer.errors.length, 0);
  });

  it('produces a real order sync preview from the demo quote fixture', async () => {
    const svc = modules.service.createShopifySyncDashboardService({ now: () => '2026-07-02T00:00:00.000Z' });
    const data = await svc.loadDashboard();
    assert.equal(data.order.errors.length, 0);
    assert.equal(data.order.order?.quoteId, 'quote-dashboard-001');
  });

  it('produces a real fulfillment sync preview derived from the mapped order', async () => {
    const svc = modules.service.createShopifySyncDashboardService({ now: () => '2026-07-02T00:00:00.000Z' });
    const data = await svc.loadDashboard();
    assert.equal(data.fulfillment.status, 'dry-run');
    assert.equal(data.fulfillment.errors.length, 0);
  });

  it('receives and routes a demo webhook event without a live Shopify connection', async () => {
    const svc = modules.service.createShopifySyncDashboardService({ now: () => '2026-07-02T00:00:00.000Z' });
    const data = await svc.loadDashboard();
    assert.equal(data.webhook.received.topic, 'orders/create');
    assert.equal(data.webhook.routed.status, 'routed');
  });

  it('verifies the demo HMAC signature through the mock verification adapter', async () => {
    const svc = modules.service.createShopifySyncDashboardService({ now: () => '2026-07-02T00:00:00.000Z' });
    const data = await svc.loadDashboard();
    assert.equal(data.webhookVerification.verified, true);
    assert.equal(data.webhookVerification.status, 'verified');
  });

  it('is fully deterministic across repeated loads', async () => {
    const svc = modules.service.createShopifySyncDashboardService({ now: () => '2026-07-02T00:00:00.000Z' });
    const first = await svc.loadDashboard();
    const second = await svc.loadDashboard();
    assert.deepEqual(first, second);
  });

  it('exposes a typed dashboard hook entry point', () => {
    assert.equal(typeof modules.hooks.useShopifySyncDashboard, 'function');
  });
});
