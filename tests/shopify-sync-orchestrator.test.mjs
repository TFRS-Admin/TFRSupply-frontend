import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

const product = () => ({
  id: 'navigator', label: 'Navigator Lightbar', slug: 'navigator-lightbar', title: 'Navigator Lightbar', sku: 'NVG-ROOT', verticalIds: ['police'], categoryIds: ['light-bars'], commerce: { sku_root: 'NVG', availability: 'Prototype inventory', price_display: '$1,250.00', sku_table: [{ sku: 'NVG-48', quantityAvailable: 7, shopifyVariantGid: 'gid://shopify/ProductVariant/48' }] }, shopify: { productId: 'shopify-product-1', productGid: 'gid://shopify/Product/1' },
});
const locations = [{ locationId: 'warehouse-east', name: 'East Warehouse', shopifyLocationGid: 'gid://shopify/Location/1' }];
const request = (overrides = {}) => ({
  requestId: 'orchestrator-001',
  dryRun: true,
  requestedAt: '2026-07-02T00:00:00.000Z',
  operations: [
    { operationId: 'catalog-step', operation: 'catalog', request: { requestId: 'catalog-001', products: [product()], dryRun: true, requestedAt: '2026-07-02T00:00:00.000Z' } },
    { operationId: 'inventory-step', operation: 'inventory', dependsOn: ['catalog-step'], request: { requestId: 'inventory-001', products: [product()], locations, dryRun: true, requestedAt: '2026-07-02T00:00:00.000Z' } },
    { operationId: 'pricing-step', operation: 'pricing', dependsOn: ['catalog-step'], request: { requestId: 'pricing-001', products: [product()], dryRun: true, requestedAt: '2026-07-02T00:00:00.000Z', defaultCurrencyCode: 'USD' } },
  ],
  ...overrides,
});

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    service: await server.ssrLoadModule('/src/services/shopifySyncOrchestrator/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifySyncOrchestrator.schema.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifySyncOrchestrator/index.ts'),
    catalogService: await server.ssrLoadModule('/src/services/shopifyCatalog/index.ts'),
    catalogAdapters: await server.ssrLoadModule('/src/adapters/shopifyCatalog/index.ts'),
    inventoryService: await server.ssrLoadModule('/src/services/shopifyInventory/index.ts'),
    inventoryAdapters: await server.ssrLoadModule('/src/adapters/shopifyInventory/index.ts'),
    pricingService: await server.ssrLoadModule('/src/services/shopifyPricing/index.ts'),
    pricingAdapters: await server.ssrLoadModule('/src/adapters/shopifyPricing/index.ts'),
  };
});
after(async () => { await server?.close(); });

const mockDependencies = () => ({
  catalog: modules.catalogService.createShopifyCatalogService(modules.catalogAdapters.mockShopifyCatalogAdapter),
  inventory: modules.inventoryService.createShopifyInventoryService(modules.inventoryAdapters.mockShopifyInventoryAdapter),
  pricing: modules.pricingService.createShopifyPricingService(modules.pricingAdapters.mockShopifyPricingAdapter),
  customer: { createCustomer: async () => { throw new Error('not used'); }, getCustomerSyncStatus: async () => { throw new Error('not used'); } },
  order: { createOrder: async () => { throw new Error('not used'); }, getOrderSyncStatus: async () => { throw new Error('not used'); } },
  fulfillment: { createFulfillment: async () => { throw new Error('not used'); }, getFulfillmentSyncStatus: async () => { throw new Error('not used'); } },
  webhook: { receiveWebhook: async () => { throw new Error('not used'); }, routeWebhookEvent: async () => { throw new Error('not used'); } },
  webhookVerification: { verifyWebhookSignature: async () => { throw new Error('not used'); } },
  syncFoundation: { syncProduct: async () => { throw new Error('not used'); }, syncVariant: async () => { throw new Error('not used'); }, syncInventory: async () => { throw new Error('not used'); }, syncPricingReference: async () => { throw new Error('not used'); }, getSyncStatus: async () => { throw new Error('not used'); } },
});

describe('Shopify sync orchestrator foundation', () => {
  it('validates orchestrator requests and rejects live orchestration', () => {
    assert.equal(modules.schemas.shopifySyncOrchestratorRequestSchema.parse(request()).dryRun, true);
    assert.throws(() => modules.schemas.shopifySyncOrchestratorRequestSchema.parse(request({ dryRun: false })), /Invalid literal value/);
  });

  it('generates deterministic execution plans', () => {
    const svc = modules.service.createShopifySyncOrchestratorService(mockDependencies());
    const plan = svc.buildExecutionPlan(request());
    assert.equal(plan.planId, 'shopify-sync-plan-orchestrator-001');
    assert.equal(plan.operations.length, 3);
    assert.deepEqual(plan.operations[1].dependsOn, ['catalog-step']);
    assert.equal(plan.metadata.attributes.operationCount, 3);
  });

  it('executes dry-run orchestration and aggregates successful service results', async () => {
    const svc = modules.service.createShopifySyncOrchestratorService(mockDependencies());
    const result = await svc.orchestrate(request());
    assert.equal(result.status, 'dry-run');
    assert.equal(result.operationResults.length, 3);
    assert.equal(result.operationResults[0].serviceResult.items[0].productId, 'navigator');
    assert.equal(result.operationResults[1].serviceResult.mappings[0].locationMappings[0].shopifyLocationGid, 'gid://shopify/Location/1');
    assert.equal(result.errors.length, 0);
    assert.equal(result.metadata.attributes.operationCount, 3);
  });

  it('aggregates adapter-unavailable errors without making Shopify calls', async () => {
    const svc = modules.service.createShopifySyncOrchestratorService();
    const result = await svc.orchestrate(request({ operations: [request().operations[1]] }));
    assert.equal(result.status, 'adapter-unavailable');
    assert.equal(result.errors[0].code, 'adapter-unavailable');
    assert.equal(result.operationResults[0].serviceResult.items[0].sku, 'NVG-48');
  });

  it('exposes typed hook entry points', () => {
    assert.equal(typeof modules.hooks.useShopifySyncOrchestrator, 'function');
    assert.equal(typeof modules.hooks.useShopifySyncExecutionPlan, 'function');
  });
});
