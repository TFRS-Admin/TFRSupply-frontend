import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    domain: await server.ssrLoadModule('/src/domain/shopifySyncAdminDashboard/index.ts'),
    service: await server.ssrLoadModule('/src/services/shopifySyncAdminDashboard/shopifySyncAdminDashboardService.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifySyncAdminDashboard.schema.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifySyncAdminDashboard/useShopifySyncAdminDashboard.ts'),
    fixtures: await server.ssrLoadModule('/src/adapters/shopifySyncAdminDashboard/mockShopifySyncAdminDashboardFixtures.ts'),
  };
});

after(async () => {
  await server?.close();
});

describe('shopify sync admin dashboard — service aggregation', () => {
  it('loads a schema-valid dashboard composed entirely from existing Shopify foundation services', async () => {
    const { createShopifySyncAdminDashboardService } = modules.service;
    const { shopifySyncAdminDashboardDataSchema } = modules.schemas;

    const dashboard = await createShopifySyncAdminDashboardService().loadDashboard();
    const parsed = shopifySyncAdminDashboardDataSchema.parse(dashboard);

    assert.equal(parsed.generatedAt, '2026-07-02T00:00:00.000Z');
    assert.equal(parsed.metadata.attributes.liveShopifyCalls, false);
  });

  it('builds a dependency-ordered dry-run execution plan via the real sync orchestrator', async () => {
    const dashboard = await modules.service.shopifySyncAdminDashboardService.loadDashboard();
    const { plan, result } = dashboard.orchestrator;

    assert.equal(plan.dryRun, true);
    assert.equal(plan.operations.length, 3);
    assert.deepEqual(plan.operations.map((op) => op.operation), ['catalog', 'inventory', 'pricing']);
    assert.deepEqual(plan.operations[1].dependsOn, ['catalog-step']);
    assert.equal(result.status, 'dry-run');
    assert.equal(result.errors.length, 0);
  });

  it('queues dry-run jobs through the real job queue with dependency resolution', async () => {
    const dashboard = await modules.service.shopifySyncAdminDashboardService.loadDashboard();
    const { jobs } = dashboard.jobQueue;

    assert.equal(jobs.length, 4);
    for (const job of jobs) {
      assert.equal(job.status, 'dry-run');
      assert.equal(job.errors.length, 0);
    }
  });

  it('produces real catalog, inventory, and pricing previews from the demo products', async () => {
    const dashboard = await modules.service.shopifySyncAdminDashboardService.loadDashboard();

    assert.equal(dashboard.catalog.status, 'dry-run');
    assert.ok(dashboard.catalog.items.some((item) => item.sku === 'NVG-ROOT'));
    assert.ok(dashboard.catalog.items.some((item) => item.variants.some((variant) => variant.sku === 'NVG-48')));

    assert.equal(dashboard.inventory.status, 'dry-run');
    assert.ok(dashboard.inventory.items.some((item) => item.sku === 'NVG-48'));

    assert.equal(dashboard.pricing.status, 'dry-run');
    assert.ok(dashboard.pricing.items.length > 0);
  });

  it('produces real customer, order, and fulfillment previews from the demo quote', async () => {
    const dashboard = await modules.service.shopifySyncAdminDashboardService.loadDashboard();

    assert.equal(dashboard.customer.status, 'accepted');
    assert.equal(dashboard.customer.customer.company, 'Example Police Department');

    assert.equal(dashboard.order.status, 'accepted');
    assert.equal(dashboard.order.order.quoteId, 'quote-admin-dashboard-001');

    assert.equal(dashboard.fulfillment.status, 'dry-run');
    assert.ok(dashboard.fulfillment.items.length > 0);
  });

  it('normalizes and routes a real inbound webhook event', async () => {
    const dashboard = await modules.service.shopifySyncAdminDashboardService.loadDashboard();

    assert.equal(dashboard.webhook.received.status, 'validated');
    assert.equal(dashboard.webhook.received.event.topic, 'orders/create');
    assert.equal(dashboard.webhook.routed.status, 'routed');
  });

  it('verifies a valid HMAC signature and rejects an invalid one', async () => {
    const dashboard = await modules.service.shopifySyncAdminDashboardService.loadDashboard();

    assert.equal(dashboard.hmacVerification.valid.status, 'verified');
    assert.equal(dashboard.hmacVerification.valid.verified, true);

    assert.equal(dashboard.hmacVerification.invalid.status, 'failed');
    assert.equal(dashboard.hmacVerification.invalid.verified, false);
    assert.equal(dashboard.hmacVerification.invalid.failures[0].code, 'signature-mismatch');
  });

  it('never imports a live/unavailable adapter — only mock fixtures are used', async () => {
    const { demoProducts, demoQuote } = modules.fixtures;
    assert.ok(demoProducts.length >= 2);
    assert.equal(demoQuote.id, 'quote-admin-dashboard-001');
  });
});

describe('shopify sync admin dashboard — summary domain', () => {
  it('tallies status counts, operation count, job count, and error count across every section', async () => {
    const dashboard = await modules.service.shopifySyncAdminDashboardService.loadDashboard();
    const { summarizeShopifySyncAdminDashboard } = modules.domain;

    const { summary, ...withoutSummary } = dashboard;
    const recomputed = summarizeShopifySyncAdminDashboard(withoutSummary);

    assert.deepEqual(recomputed, summary);
    assert.equal(summary.operationCount, 3);
    assert.equal(summary.jobCount, 4);
    assert.equal(summary.errorCount, 1);
    assert.ok(summary.statusCounts['dry-run'] > 0);
  });
});

describe('shopify sync admin dashboard — hook', () => {
  it('exposes typed dashboard state without loading during render', () => {
    const { useShopifySyncAdminDashboard } = modules.hooks;
    function HookProbe() {
      const state = useShopifySyncAdminDashboard();
      return React.createElement('span', {
        'data-loading': String(state.loading),
        'data-has-data': String(Boolean(state.data)),
        'data-has-error': String(Boolean(state.error)),
        'data-has-action': String(typeof state.loadDashboard === 'function'),
      });
    }

    const html = renderToString(React.createElement(HookProbe));
    assert.match(html, /data-loading="false"/);
    assert.match(html, /data-has-data="false"/);
    assert.match(html, /data-has-action="true"/);
  });
});
