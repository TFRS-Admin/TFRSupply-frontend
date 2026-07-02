import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

const product = (overrides = {}) => ({
  id: 'navigator',
  label: 'Navigator Lightbar',
  slug: 'navigator-lightbar',
  title: 'Navigator Lightbar',
  sku: 'NVG-ROOT',
  verticalIds: ['police'],
  categoryIds: ['light-bars'],
  commerce: { sku_root: 'NVG', availability: 'Prototype inventory', sku_table: [{ sku: 'NVG-48', length: '48in', quantityAvailable: 7, shopifyVariantGid: 'gid://shopify/ProductVariant/48' }, { sku: 'NVG-54', length: '54in', inventoryQuantity: 2 }] },
  shopify: { productId: 'shopify-product-1', productGid: 'gid://shopify/Product/1' },
  ...overrides,
});
const locations = [{ locationId: 'warehouse-east', name: 'East Warehouse', shopifyLocationGid: 'gid://shopify/Location/1' }];
const request = (overrides = {}) => ({ requestId: 'inventory-sync-001', products: [product()], locations, dryRun: true, requestedAt: '2026-07-02T00:00:00.000Z', source: 'commerce-foundation', defaultQuantity: 0, ...overrides });

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    service: await server.ssrLoadModule('/src/services/shopifyInventory/index.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/shopifyInventory/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifyInventory.schema.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifyInventory/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Shopify inventory synchronization foundation', () => {
  it('validates dry-run inventory requests and rejects live requests', () => {
    const parsed = modules.schemas.shopifyInventorySyncRequestSchema.parse(request());
    assert.equal(parsed.dryRun, true);
    assert.throws(() => modules.schemas.shopifyInventorySyncRequestSchema.parse(request({ dryRun: false })), /Invalid literal value/);
  });

  it('maps platform inventory into Shopify inventory payloads and metadata', () => {
    const { items, mappings } = modules.service.mapProductToShopifyInventoryItems(product(), request());
    assert.equal(items.length, 2);
    assert.equal(items[0].sku, 'NVG-48');
    assert.equal(items[0].inventoryStatus.quantityAvailable, 7);
    assert.equal(items[0].adjustments[0].locationId, 'warehouse-east');
    assert.equal(mappings[0].shopifyProductGid, 'gid://shopify/Product/1');
    assert.equal(mappings[0].locationMappings[0].shopifyLocationGid, 'gid://shopify/Location/1');
  });

  it('returns deterministic mock adapter dry-run results through service orchestration', async () => {
    const svc = modules.service.createShopifyInventoryService(modules.adapters.mockShopifyInventoryAdapter);
    const result = await svc.syncInventory(request());
    assert.equal(result.status, 'dry-run');
    assert.equal(result.items[0].sku, 'NVG-48');
    assert.equal(result.mappings[0].mappedAt, '2026-07-02T00:00:00.000Z');
    assert.equal(result.metadata.attributes.mappedBy, 'shopifyInventoryService');
  });

  it('returns explicit unavailable adapter behavior without Shopify calls', async () => {
    const svc = modules.service.createShopifyInventoryService(modules.adapters.unavailableShopifyInventoryAdapter);
    const result = await svc.syncInventory(request());
    assert.equal(result.status, 'adapter-unavailable');
    assert.equal(result.errors[0].code, 'adapter-unavailable');
    assert.equal(result.items[0].productId, 'navigator');
  });

  it('builds synchronization metadata for status checks', async () => {
    const svc = modules.service.createShopifyInventoryService(modules.adapters.mockShopifyInventoryAdapter);
    const result = await svc.getInventorySyncStatus(request({ reason: 'warehouse-reconciliation' }));
    assert.equal(result.status, 'validated');
    assert.equal(result.items[0].adjustments[0].reason, 'warehouse-reconciliation');
    assert.equal(result.mappings[0].metadata.source, 'shopifyInventoryService');
  });

  it('exposes typed hook entry points', () => {
    assert.equal(typeof modules.hooks.useShopifyInventory, 'function');
    assert.equal(typeof modules.hooks.useShopifyInventorySync, 'function');
  });
});
