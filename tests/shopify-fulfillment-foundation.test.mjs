import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

const order = (overrides = {}) => ({
  id: 'shopify-order-draft-quote-001',
  quoteId: 'quote-001',
  status: 'mapped',
  shippingAddress: { firstName: 'Jane', lastName: 'Doe', address1: '1 Main St', city: 'Springfield', provinceCode: 'IL', countryCode: 'US', zip: '62701' },
  lines: [
    { id: 'shopify-order-line-1', quoteLineId: 'line-1', sku: 'NVG-48', shopifyVariantId: 'gid://shopify/ProductVariant/48', title: 'Navigator Lightbar', quantity: 2, requiresShipping: true },
    { id: 'shopify-order-line-2', quoteLineId: 'line-2', sku: 'INSTALL-SVC', title: 'Installation Service', quantity: 1, requiresShipping: false },
  ],
  currencyCode: 'USD',
  sourceName: 'tfrsupply-quote-builder',
  ...overrides,
});
const request = (overrides = {}) => ({ requestId: 'shopify-fulfillment-request-001', order: order(), dryRun: true, requestedAt: '2026-07-02T00:00:00.000Z', locationId: 'location-1', ...overrides });

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    service: await server.ssrLoadModule('/src/services/shopifyFulfillment/index.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/shopifyFulfillment/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifyFulfillment.schema.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifyFulfillment/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Shopify fulfillment foundation', () => {
  it('validates dry-run fulfillment requests and rejects live requests', () => {
    const parsed = modules.schemas.shopifyFulfillmentRequestSchema.parse(request());
    assert.equal(parsed.dryRun, true);
    assert.throws(() => modules.schemas.shopifyFulfillmentRequestSchema.parse(request({ dryRun: false })), /Invalid literal value/);
  });

  it('maps shippable order lines into fulfillment items, a shipment, and mapping metadata', () => {
    const { items, shipment, mapping } = modules.service.mapOrderToShopifyFulfillment(order(), request());
    assert.equal(items.length, 1);
    assert.equal(items[0].orderLineId, 'shopify-order-line-1');
    assert.equal(items[0].sku, 'NVG-48');
    assert.equal(items[0].quantity, 2);
    assert.equal(shipment.status, 'label-pending');
    assert.equal(shipment.destinationAddress.city, 'Springfield');
    assert.equal(mapping.orderId, 'shopify-order-draft-quote-001');
    assert.equal(mapping.itemMappings[0].fulfillmentItemId, 'shopify-fulfillment-draft-shopify-order-draft-quote-001-shopify-order-line-1');
  });

  it('excludes non-shippable lines from fulfillment mapping', () => {
    const { items } = modules.service.mapOrderToShopifyFulfillment(order(), request());
    assert.ok(!items.some((item) => item.orderLineId === 'shopify-order-line-2'));
  });

  it('returns deterministic mock adapter dry-run results through service orchestration', async () => {
    const svc = modules.service.createShopifyFulfillmentService(modules.adapters.mockShopifyFulfillmentAdapter);
    const result = await svc.createFulfillment(request());
    assert.equal(result.status, 'dry-run');
    assert.equal(result.items[0].sku, 'NVG-48');
    assert.equal(result.mapping.fulfillmentId, 'shopify-fulfillment-draft-shopify-order-draft-quote-001');
    assert.equal(result.metadata.attributes.mappedBy, 'shopifyFulfillmentService');
  });

  it('returns explicit unavailable adapter behavior without Shopify calls', async () => {
    const svc = modules.service.createShopifyFulfillmentService(modules.adapters.unavailableShopifyFulfillmentAdapter);
    const result = await svc.createFulfillment(request());
    assert.equal(result.status, 'adapter-unavailable');
    assert.equal(result.errors[0].code, 'adapter-unavailable');
    assert.equal(result.items[0].orderLineId, 'shopify-order-line-1');
  });

  it('builds synchronization metadata for status checks with explicit tracking information', async () => {
    const svc = modules.service.createShopifyFulfillmentService(modules.adapters.mockShopifyFulfillmentAdapter);
    const result = await svc.getFulfillmentSyncStatus(request({ trackingInfo: { trackingNumber: '1Z999AA10123456784', trackingCompany: 'UPS' } }));
    assert.equal(result.status, 'validated');
    assert.equal(result.shipment.tracking.trackingCompany, 'UPS');
    assert.equal(result.mapping.metadata.source, 'shopifyFulfillmentService');
  });

  it('exposes typed hook entry points', () => {
    assert.equal(typeof modules.hooks.useShopifyFulfillment, 'function');
    assert.equal(typeof modules.hooks.useShopifyFulfillmentSync, 'function');
  });
});
