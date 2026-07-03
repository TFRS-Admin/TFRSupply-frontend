import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

const operation = (overrides = {}) => ({
  operationType: 'product-query',
  operationName: 'ProductByHandle',
  query: 'query ProductByHandle($handle: String!) { product(handle: $handle) { id title } }',
  variables: { handle: 'navigator' },
  ...overrides,
});

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    types: await server.ssrLoadModule('/src/types/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifyStorefront.schema.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/shopifyStorefront/index.ts'),
    service: await server.ssrLoadModule('/src/services/shopifyStorefront/index.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifyStorefront/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Shopify Storefront API foundation', () => {
  it('validates dry-run requests and rejects live requests', () => {
    const request = { requestId: 'storefront-request-001', dryRun: true, operation: operation() };
    assert.equal(modules.schemas.shopifyStorefrontRequestSchema.parse(request).dryRun, true);
    assert.throws(() => modules.schemas.shopifyStorefrontRequestSchema.parse({ ...request, dryRun: false }), /Invalid literal value/);
    assert.throws(() => modules.schemas.shopifyStorefrontRequestSchema.parse({ requestId: 'missing-operation', dryRun: true }));
  });

  it('validates operation type enumeration', () => {
    assert.equal(modules.schemas.shopifyStorefrontOperationTypeSchema.parse('product-query'), 'product-query');
    assert.throws(() => modules.schemas.shopifyStorefrontOperationTypeSchema.parse('checkout-create'));
  });

  it('builds deterministic requests through the service', () => {
    const service = modules.service.createShopifyStorefrontService();
    const request = service.buildRequest(operation());
    assert.equal(request.dryRun, true);
    assert.match(request.requestId, /^storefront-request-product-query-/);
    assert.equal(request.operation.operationType, 'product-query');
  });

  it('orchestrates validation and mock adapter delegation for execute()', async () => {
    const service = modules.service.createShopifyStorefrontService(modules.adapters.mockShopifyStorefrontAdapter);
    const request = service.buildRequest(operation());
    const response = await service.execute(request);
    assert.equal(response.status, 'dry-run');
    assert.equal(response.operationType, 'product-query');
    assert.deepEqual(response.errors, []);
    assert.equal(response.metadata.source, 'shopifyStorefrontService');
  });

  it('returns adapter-unavailable results without live Storefront calls by default', async () => {
    const service = modules.service.createShopifyStorefrontService();
    const request = service.buildRequest(operation());
    const response = await service.execute(request);
    assert.equal(response.status, 'adapter-unavailable');
    assert.equal(response.errors[0].code, 'adapter-unavailable');
  });

  it('reports capability metadata reflecting the injected adapter', () => {
    const unavailableService = modules.service.createShopifyStorefrontService();
    const mockService = modules.service.createShopifyStorefrontService(modules.adapters.mockShopifyStorefrontAdapter);
    const liveService = modules.service.createShopifyStorefrontService(modules.adapters.liveShopifyStorefrontAdapter);

    assert.deepEqual(unavailableService.getCapabilities().adapterMode, 'unavailable');
    assert.deepEqual(mockService.getCapabilities().adapterMode, 'mock');
    assert.deepEqual(liveService.getCapabilities().adapterMode, 'live');
    assert.equal(unavailableService.getCapabilities().liveCallsEnabled, false);
    assert.ok(unavailableService.getCapabilities().supportedOperationTypes.includes('product-query'));
  });

  it('reports availability without connecting to a real Storefront API', async () => {
    const mockService = modules.service.createShopifyStorefrontService(modules.adapters.mockShopifyStorefrontAdapter);
    const mockAvailability = await mockService.getAvailability({ storeDomain: 'example.myshopify.com' });
    assert.equal(mockAvailability.available, true);
    assert.equal(mockAvailability.adapterMode, 'mock');
    assert.equal(mockAvailability.configured, true);

    const unavailableService = modules.service.createShopifyStorefrontService();
    const unavailableAvailability = await unavailableService.getAvailability();
    assert.equal(unavailableAvailability.available, false);
    assert.equal(unavailableAvailability.adapterMode, 'unavailable');
  });

  it('defines the live adapter request/response boundary without performing real API calls', async () => {
    const liveService = modules.service.createShopifyStorefrontService(modules.adapters.liveShopifyStorefrontAdapter);
    const request = liveService.buildRequest(operation(), { config: { storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token-abc' } });
    const response = await liveService.execute(request);
    assert.equal(response.status, 'failed');
    assert.equal(response.errors[0].code, 'live-calls-disabled');
    assert.equal(response.errors[0].retryable, false);

    const fetchRequest = modules.adapters.buildStorefrontFetchRequest(operation(), { storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token-abc' });
    assert.equal(fetchRequest.url, 'https://example.myshopify.com/api/2024-10/graphql.json');
    assert.equal(fetchRequest.method, 'POST');
    assert.equal(fetchRequest.headers['X-Shopify-Storefront-Access-Token'], 'token-abc');
    assert.match(fetchRequest.body, /ProductByHandle/);

    const liveAvailability = await liveService.getAvailability({ storeDomain: 'example.myshopify.com', storefrontAccessToken: 'token-abc' });
    assert.equal(liveAvailability.available, false);
    assert.equal(liveAvailability.configured, true);
    assert.equal(liveAvailability.adapterMode, 'live');
  });

  it('exposes typed hook entry points', () => {
    assert.equal(typeof modules.hooks.useShopifyStorefront, 'function');
    assert.equal(typeof modules.hooks.useStorefrontAvailability, 'function');
  });
});
