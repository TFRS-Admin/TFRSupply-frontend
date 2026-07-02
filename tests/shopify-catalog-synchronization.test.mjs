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
  description: 'Purpose-built warning system',
  vendor: 'TFR Supply',
  category: 'Light Bars',
  sku: 'NVG-ROOT',
  verticalIds: ['police'],
  categoryIds: ['light-bars'],
  media: { hero: '/images/navigator.jpg', gallery: [{ src: '/images/navigator-side.jpg' }] },
  commerce: { sku_root: 'NVG', sku_table: [{ sku: 'NVG-48', length: '48in' }, { sku: 'NVG-54', length: '54in' }] },
  shopify: { productId: 'shopify-product-1', productGid: 'gid://shopify/Product/1' },
  ...overrides,
});
const request = (overrides = {}) => ({ requestId: 'catalog-sync-001', products: [product()], action: 'update', dryRun: true, requestedAt: '2026-07-02T00:00:00.000Z', source: 'catalog-service', ...overrides });

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    service: await server.ssrLoadModule('/src/services/shopifyCatalog/index.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/shopifyCatalog/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifyCatalog.schema.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifyCatalog/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Shopify catalog synchronization foundation', () => {
  it('validates dry-run catalog requests and rejects live requests', () => {
    const parsed = modules.schemas.shopifyCatalogSyncRequestSchema.parse(request());
    assert.equal(parsed.dryRun, true);
    assert.throws(() => modules.schemas.shopifyCatalogSyncRequestSchema.parse(request({ dryRun: false })), /Invalid literal value/);
  });

  it('maps platform products into Shopify catalog payloads and metadata', () => {
    const { item, mapping } = modules.service.mapProductToShopifyCatalogItem(product(), request());
    assert.equal(item.productId, 'navigator');
    assert.equal(item.handle, 'navigator-lightbar');
    assert.equal(item.variants.length, 2);
    assert.equal(item.variants[0].sku, 'NVG-48');
    assert.equal(mapping.shopifyProductGid, 'gid://shopify/Product/1');
    assert.equal(mapping.variantMappings[1].action, 'update');
  });

  it('returns deterministic mock adapter dry-run results through service orchestration', async () => {
    const svc = modules.service.createShopifyCatalogService(modules.adapters.mockShopifyCatalogAdapter);
    const result = await svc.syncCatalog(request());
    assert.equal(result.status, 'dry-run');
    assert.equal(result.items[0].title, 'Navigator Lightbar');
    assert.equal(result.mappings[0].mappedAt, '2026-07-02T00:00:00.000Z');
    assert.equal(result.metadata.attributes.mappedBy, 'shopifyCatalogService');
  });

  it('returns explicit unavailable adapter behavior without Shopify calls', async () => {
    const svc = modules.service.createShopifyCatalogService(modules.adapters.unavailableShopifyCatalogAdapter);
    const result = await svc.syncCatalog(request());
    assert.equal(result.status, 'adapter-unavailable');
    assert.equal(result.errors[0].code, 'adapter-unavailable');
    assert.equal(result.items[0].productId, 'navigator');
  });

  it('builds synchronization metadata for status checks', async () => {
    const svc = modules.service.createShopifyCatalogService(modules.adapters.mockShopifyCatalogAdapter);
    const result = await svc.getCatalogSyncStatus(request({ action: 'skip' }));
    assert.equal(result.status, 'validated');
    assert.equal(result.items[0].action, 'skip');
    assert.equal(result.mappings[0].metadata.source, 'shopifyCatalogService');
  });

  it('exposes typed hook entry points', () => {
    assert.equal(typeof modules.hooks.useShopifyCatalog, 'function');
    assert.equal(typeof modules.hooks.useShopifyCatalogSync, 'function');
  });
});
