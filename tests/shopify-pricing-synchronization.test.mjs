import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

const product = (overrides = {}) => ({
  id: 'navigator', label: 'Navigator Lightbar', slug: 'navigator-lightbar', title: 'Navigator Lightbar', sku: 'NVG-ROOT', verticalIds: ['police'], categoryIds: ['light-bars'],
  commerce: { sku_root: 'NVG', price_display: '$1200.00', sku_table: [{ sku: 'NVG-48', shopifyVariantGid: 'gid://shopify/ProductVariant/48' }, { sku: 'NVG-54' }] },
  shopify: { productId: 'shopify-product-1', productGid: 'gid://shopify/Product/1' },
  ...overrides,
});
const priceSource = { id: 'src-1', label: 'MSRP', sourceType: 'federal-signal-msrp', priority: 1, currencyCode: 'USD' };
const request = (overrides = {}) => ({ requestId: 'pricing-sync-001', products: [product()], dryRun: true, requestedAt: '2026-07-02T00:00:00.000Z', source: 'pricing-domain', defaultCurrencyCode: 'USD', listPrices: [{ id: 'lp-1', label: 'NVG MSRP', sku: 'NVG-48', productId: 'navigator', price: { amount: 999.99, currencyCode: 'USD' }, source: priceSource }], ...overrides });

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    service: await server.ssrLoadModule('/src/services/shopifyPricing/index.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/shopifyPricing/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifyPricing.schema.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifyPricing/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Shopify pricing synchronization foundation', () => {
  it('validates dry-run pricing requests and rejects live requests', () => {
    const parsed = modules.schemas.shopifyPricingSyncRequestSchema.parse(request());
    assert.equal(parsed.dryRun, true);
    assert.throws(() => modules.schemas.shopifyPricingSyncRequestSchema.parse(request({ dryRun: false })), /Invalid literal value/);
  });

  it('maps platform pricing into Shopify pricing payloads and metadata', () => {
    const { items, mappings } = modules.service.mapProductToShopifyPricingItems(product(), request());
    assert.equal(items.length, 2);
    assert.equal(items[0].sku, 'NVG-48');
    assert.equal(items[0].price.amount, 999.99);
    assert.equal(items[0].strategy, 'list-price');
    assert.equal(items[1].price.amount, 1200);
    assert.equal(mappings[0].shopifyProductGid, 'gid://shopify/Product/1');
  });

  it('returns deterministic mock adapter dry-run results through service orchestration', async () => {
    const svc = modules.service.createShopifyPricingService(modules.adapters.mockShopifyPricingAdapter);
    const result = await svc.syncPricing(request());
    assert.equal(result.status, 'dry-run');
    assert.equal(result.items[0].sku, 'NVG-48');
    assert.equal(result.mappings[0].mappedAt, '2026-07-02T00:00:00.000Z');
    assert.equal(result.metadata.attributes.mappedBy, 'shopifyPricingService');
  });

  it('returns explicit unavailable adapter behavior without Shopify calls', async () => {
    const svc = modules.service.createShopifyPricingService(modules.adapters.unavailableShopifyPricingAdapter);
    const result = await svc.syncPricing(request());
    assert.equal(result.status, 'adapter-unavailable');
    assert.equal(result.errors[0].code, 'adapter-unavailable');
    assert.equal(result.items[0].productId, 'navigator');
  });

  it('builds synchronization metadata for status checks and contract pricing', async () => {
    const svc = modules.service.createShopifyPricingService(modules.adapters.mockShopifyPricingAdapter);
    const result = await svc.getPricingSyncStatus(request({ contractPrices: [{ id: 'cp-1', label: 'Contract', sku: 'NVG-48', productId: 'navigator', contractId: 'contract-1', sellingPrice: { amount: 875, currencyCode: 'USD' }, source: priceSource }] }));
    assert.equal(result.status, 'validated');
    assert.equal(result.items[0].strategy, 'contract-price');
    assert.equal(result.items[0].adjustment.price.amount, 875);
    assert.equal(result.mappings[0].metadata.source, 'shopifyPricingService');
  });

  it('exposes typed hook entry points', () => {
    assert.equal(typeof modules.hooks.useShopifyPricing, 'function');
    assert.equal(typeof modules.hooks.useShopifyPricingSync, 'function');
  });
});
