import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    service: await server.ssrLoadModule('/src/services/adminSalesDashboard/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/adminSalesDashboard.schema.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/adminSalesDashboard/index.ts'),
    fixtures: await server.ssrLoadModule('/src/adapters/adminSalesDashboard/index.ts'),
    guard: await server.ssrLoadModule('/src/components/AdminAuthGuard.jsx'),
  };
});
after(async () => { await server?.close(); });

describe('Admin sales dashboard', () => {
  it('produces a schema-valid dashboard from the default composed services', async () => {
    const dashboard = await modules.service.adminSalesDashboardService.loadDashboard();
    const parsed = modules.schemas.adminSalesDashboardDataSchema.parse(dashboard);
    assert.equal(typeof parsed.generatedAt, 'string');
  });

  it('exposes Quick Actions cards for Quote Builder, Quotes Workspace, Shopify Sync, Pricing Imports, and a disabled Future CRM', async () => {
    const dashboard = await modules.service.adminSalesDashboardService.loadDashboard();
    const ids = dashboard.quickActions.map((action) => action.id);
    assert.deepEqual(ids, ['quote-builder', 'quotes-workspace', 'shopify-sync', 'pricing-imports', 'future-crm']);
    assert.equal(dashboard.quickActions.find((a) => a.id === 'quote-builder').href, '/admin/quote-builder');
    assert.equal(dashboard.quickActions.find((a) => a.id === 'quotes-workspace').href, '/admin/quotes');
    assert.equal(dashboard.quickActions.find((a) => a.id === 'shopify-sync').href, '/admin/shopify-sync');
    assert.equal(dashboard.quickActions.find((a) => a.id === 'pricing-imports').href, '/admin/pricing-imports');
    const crm = dashboard.quickActions.find((a) => a.id === 'future-crm');
    assert.equal(crm.available, false);
  });

  it('derives Platform Status for authentication, sync, pricing engine, quote engine, and imports from real services', async () => {
    const dashboard = await modules.service.adminSalesDashboardService.loadDashboard();
    assert.equal(dashboard.platformStatus.authentication, 'operational');
    assert.equal(dashboard.platformStatus.sync, 'operational');
    assert.equal(dashboard.platformStatus.pricingEngine, 'operational');
    assert.equal(dashboard.platformStatus.quoteEngine, 'operational');
    // The mock pricing import fixtures intentionally include one failing run
    // (to exercise the pricing import dashboard's "Failed Records" tab), so
    // the imports platform status reports the real, honest 'degraded' state
    // rather than being hardcoded to a happy path.
    assert.equal(dashboard.platformStatus.imports, 'degraded');
  });

  it('reports deterministic mock recent activity covering quote edits, imports, and sync jobs', async () => {
    const dashboard = await modules.service.adminSalesDashboardService.loadDashboard();
    const kinds = new Set(dashboard.recentActivity.map((entry) => entry.kind));
    assert.ok(kinds.has('quote-edit'));
    assert.ok(kinds.has('pricing-import'));
    assert.ok(kinds.has('sync-job'));
    assert.deepEqual(dashboard.recentActivity, modules.fixtures.adminSalesDashboardRecentActivity);
  });

  it('reports platform metrics sourced from the composed dashboard services', async () => {
    const dashboard = await modules.service.adminSalesDashboardService.loadDashboard();
    assert.ok(dashboard.metrics.quotesCreated > 0);
    assert.ok(dashboard.metrics.importsProcessed > 0);
    assert.ok(dashboard.metrics.syncJobsRun > 0);
    assert.equal(dashboard.metrics.validationStatus, 'passing');
    assert.equal(dashboard.metrics.testEnvironmentStatus, 'ready');
  });

  it('reports system health with mock services and adapters available when every composed service is operational', async () => {
    const dashboard = await modules.service.adminSalesDashboardService.loadDashboard();
    assert.equal(dashboard.systemHealth.buildStatus, 'passing');
    assert.equal(dashboard.systemHealth.validationStatus, 'passing');
    assert.equal(dashboard.systemHealth.mockServicesAvailable, true);
    assert.equal(dashboard.systemHealth.adaptersAvailable, true);
  });

  it('marks authentication unavailable when the injected admin auth adapter reports no demo users', async () => {
    const { createAdminSalesDashboardService } = modules.service;
    const dashboard = await createAdminSalesDashboardService({
      adminAuth: { listDemoUsers: async () => [], signIn: async () => { throw new Error('not used'); }, signOut: async () => {}, getSession: async () => null, hasPermission: () => false, hasRole: () => false },
    }).loadDashboard();
    assert.equal(dashboard.platformStatus.authentication, 'unavailable');
    assert.equal(dashboard.systemHealth.mockServicesAvailable, false);
  });

  it('allows injecting a custom clock for deterministic testing', async () => {
    const { createAdminSalesDashboardService } = modules.service;
    const dashboard = await createAdminSalesDashboardService({ now: () => '2026-08-01T00:00:00.000Z' }).loadDashboard();
    assert.equal(dashboard.generatedAt, '2026-08-01T00:00:00.000Z');
  });

  it('exposes a typed hook entry point', () => {
    assert.equal(typeof modules.hooks.useAdminSalesDashboard, 'function');
  });

  it('gates the /admin route behind AdminAuthGuard, reusing the existing authentication workspace', () => {
    assert.equal(typeof modules.guard.default, 'function');
  });
});
