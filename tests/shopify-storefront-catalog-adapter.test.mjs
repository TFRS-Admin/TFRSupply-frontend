import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let modules;

function baseCategory(overrides = {}) {
  return {
    id: 'category-lighting',
    label: 'Lighting',
    slug: 'lighting',
    verticalId: 'police',
    ...overrides,
  };
}

function productListEdges(nodes) {
  return { data: { products: { edges: nodes.map((node) => ({ node })) } } };
}

function collectionListEdges(nodes) {
  return { data: { collections: { edges: nodes.map((node) => ({ node })) } } };
}

function fakeFetch(responses) {
  let call = 0;
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url, init });
    const response = responses[call++];
    if (response instanceof Error) throw response;
    return response;
  };
  impl.calls = calls;
  return impl;
}

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return { ok, status, json: async () => body };
}

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    schemas: await server.ssrLoadModule('/src/schemas/catalogAdapter.schema.ts'),
    productSchemas: await server.ssrLoadModule('/src/schemas/product.schema.ts'),
    mapping: await server.ssrLoadModule('/src/adapters/catalog/shopifyProductMapping.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/catalog/index.ts'),
    liveAdapter: await server.ssrLoadModule('/src/adapters/catalog/liveShopifyStorefrontCatalogAdapter.ts'),
    loaders: await server.ssrLoadModule('/src/data/loaders/index.ts'),
    adapterService: await server.ssrLoadModule('/src/services/catalogAdapter/index.ts'),
    catalogService: await server.ssrLoadModule('/src/services/catalog/index.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/catalogAdapter/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Shopify Storefront Catalog Adapter — product mapping', () => {
  it('derives categoryIds/verticalIds from matched collection handles', () => {
    const { mapStorefrontProductNode } = modules.mapping;
    const categories = [baseCategory()];
    const node = {
      id: 'gid://shopify/Product/1',
      handle: 'navigator-light-bar',
      title: 'Navigator Light Bar',
      description: 'Full-size light bar',
      vendor: 'TFR',
      images: { edges: [{ node: { url: 'https://cdn/img1.jpg' } }] },
      variants: { edges: [{ node: { sku: 'NAV-01' } }] },
      collections: { edges: [{ node: { handle: 'lighting' } }] },
    };

    const product = mapStorefrontProductNode(node, categories);

    assert.equal(product.slug, 'navigator-light-bar');
    assert.equal(product.label, 'Navigator Light Bar');
    assert.equal(product.vendor, 'TFR');
    assert.deepEqual(product.categoryIds, ['category-lighting']);
    assert.deepEqual(product.verticalIds, ['police']);
    assert.equal(product.sku, 'NAV-01');
    assert.equal(product.media.gallery[0].src, 'https://cdn/img1.jpg');
    assert.equal(product.shopify.productId, 'gid://shopify/Product/1');
  });

  it('defaults to empty categoryIds/verticalIds when no collection matches an existing category', () => {
    const { mapStorefrontProductNode } = modules.mapping;
    const node = { id: 'gid://shopify/Product/2', handle: 'unmatched', title: 'Unmatched Product', collections: { edges: [{ node: { handle: 'no-such-category' } }] } };

    const product = mapStorefrontProductNode(node, [baseCategory()]);

    assert.deepEqual(product.categoryIds, []);
    assert.deepEqual(product.verticalIds, []);
    const parsed = modules.productSchemas.productSchema.safeParse(product);
    assert.equal(parsed.success, true, 'a product with empty categoryIds/verticalIds must still validate');
  });
});

describe('Shopify Storefront Catalog Adapter — collection mapping', () => {
  it('enriches an existing local category by matching handle to slug, inheriting verticalId', () => {
    const { mapStorefrontCollectionNode } = modules.mapping;
    const category = mapStorefrontCollectionNode(
      { id: 'gid://shopify/Collection/1', handle: 'lighting', title: 'Lighting Products', description: 'All lighting' },
      [baseCategory()],
    );

    assert.ok(category);
    assert.equal(category.verticalId, 'police');
    assert.equal(category.label, 'Lighting Products');
    assert.equal(category.shopify.collectionId, 'gid://shopify/Collection/1');
  });

  it('returns null for a collection with no matching local category rather than fabricating a verticalId', () => {
    const { mapStorefrontCollectionNode } = modules.mapping;
    const category = mapStorefrontCollectionNode({ id: 'gid://shopify/Collection/2', handle: 'no-match', title: 'No Match' }, [baseCategory()]);

    assert.equal(category, null);
  });
});

describe('Shopify Storefront Catalog Adapter — mock adapter', () => {
  it('wraps the existing typed loaders unchanged', async () => {
    const { mockCatalogAdapter } = modules.adapters;
    const { listTypedProducts, listTypedCategories } = modules.loaders;

    const productsResult = await mockCatalogAdapter.fetchProducts([]);
    const collectionsResult = await mockCatalogAdapter.fetchCollections([]);

    assert.equal(productsResult.status, 'success');
    assert.deepEqual(productsResult.products, listTypedProducts());
    assert.equal(collectionsResult.status, 'success');
    assert.deepEqual(collectionsResult.categories, listTypedCategories());
  });
});

describe('Shopify Storefront Catalog Adapter — unavailable adapter', () => {
  it('reports adapter-unavailable and performs no I/O', async () => {
    const { unavailableCatalogAdapter } = modules.adapters;

    const productsResult = await unavailableCatalogAdapter.fetchProducts([]);
    const collectionsResult = await unavailableCatalogAdapter.fetchCollections([]);

    assert.equal(productsResult.status, 'adapter-unavailable');
    assert.deepEqual(productsResult.products, []);
    assert.equal(productsResult.errors[0].code, 'adapter-unavailable');
    assert.equal(collectionsResult.status, 'adapter-unavailable');
  });
});

describe('Shopify Storefront Catalog Adapter — live adapter', () => {
  it('reports not-configured and never calls fetch when storeDomain/token are missing', async () => {
    const { createLiveShopifyStorefrontCatalogAdapter } = modules.liveAdapter;
    const fetchImpl = fakeFetch([]);
    const adapter = createLiveShopifyStorefrontCatalogAdapter(undefined, fetchImpl);

    const result = await adapter.fetchProducts([]);

    assert.equal(result.status, 'adapter-unavailable');
    assert.equal(result.errors[0].code, 'not-configured');
    assert.equal(fetchImpl.calls.length, 0);
  });

  it('reports a network-error result when fetch throws, without throwing itself', async () => {
    const { createLiveShopifyStorefrontCatalogAdapter } = modules.liveAdapter;
    const fetchImpl = fakeFetch([new TypeError('network down')]);
    const adapter = createLiveShopifyStorefrontCatalogAdapter({ storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token' }, fetchImpl);

    const result = await adapter.fetchProducts([]);

    assert.equal(result.status, 'failed');
    assert.equal(result.errors[0].code, 'network-error');
    assert.equal(result.errors[0].retryable, true);
  });

  it('reports an http-error result on a non-2xx response', async () => {
    const { createLiveShopifyStorefrontCatalogAdapter } = modules.liveAdapter;
    const fetchImpl = fakeFetch([jsonResponse({}, { ok: false, status: 500 })]);
    const adapter = createLiveShopifyStorefrontCatalogAdapter({ storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token' }, fetchImpl);

    const result = await adapter.fetchCollections([]);

    assert.equal(result.status, 'failed');
    assert.equal(result.errors[0].code, 'http-error');
  });

  it('reports a graphql-error result when the response carries GraphQL errors', async () => {
    const { createLiveShopifyStorefrontCatalogAdapter } = modules.liveAdapter;
    const fetchImpl = fakeFetch([jsonResponse({ errors: [{ message: 'Throttled' }] })]);
    const adapter = createLiveShopifyStorefrontCatalogAdapter({ storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token' }, fetchImpl);

    const result = await adapter.fetchProducts([]);

    assert.equal(result.status, 'failed');
    assert.equal(result.errors[0].code, 'graphql-error');
    assert.equal(result.errors[0].message, 'Throttled');
  });

  it('performs a real fetch against the Storefront GraphQL endpoint and maps a successful response', async () => {
    const { createLiveShopifyStorefrontCatalogAdapter } = modules.liveAdapter;
    const fetchImpl = fakeFetch([
      jsonResponse(productListEdges([{
        id: 'gid://shopify/Product/9',
        handle: 'duraforce-console',
        title: 'DuraForce Console',
        vendor: 'TFR',
        images: { edges: [] },
        variants: { edges: [{ node: { sku: 'DF-9' } }] },
        collections: { edges: [{ node: { handle: 'lighting' } }] },
      }])),
    ]);
    const config = { storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token-abc' };
    const adapter = createLiveShopifyStorefrontCatalogAdapter(config, fetchImpl);

    const result = await adapter.fetchProducts([baseCategory()]);

    assert.equal(result.status, 'success');
    assert.equal(result.products.length, 1);
    assert.equal(result.products[0].slug, 'duraforce-console');
    assert.deepEqual(result.products[0].categoryIds, ['category-lighting']);
    assert.match(fetchImpl.calls[0].url, /^https:\/\/example\.myshopify\.com\/api\/2024-10\/graphql\.json$/);
    assert.equal(fetchImpl.calls[0].init.headers['X-Shopify-Storefront-Access-Token'], 'token-abc');
  });

  it('maps matched collections and reports unmatched collection handles separately', async () => {
    const { createLiveShopifyStorefrontCatalogAdapter } = modules.liveAdapter;
    const fetchImpl = fakeFetch([
      jsonResponse(collectionListEdges([
        { id: 'gid://shopify/Collection/5', handle: 'lighting', title: 'Lighting' },
        { id: 'gid://shopify/Collection/6', handle: 'no-match', title: 'No Match' },
      ])),
    ]);
    const config = { storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token' };
    const adapter = createLiveShopifyStorefrontCatalogAdapter(config, fetchImpl);

    const result = await adapter.fetchCollections([baseCategory()]);

    assert.equal(result.status, 'success');
    assert.equal(result.categories.length, 1);
    assert.deepEqual(result.unmatchedCollectionHandles, ['no-match']);
  });
});

describe('catalogAdapterService', () => {
  it('defaults to the mock adapter mode when Storefront config is not enabled', () => {
    const { createCatalogAdapterService } = modules.adapterService;
    const service = createCatalogAdapterService();

    assert.equal(service.getMode(), 'mock');
    assert.equal(service.getSyncedProducts(), null);
    assert.equal(service.getCapabilities().adapterMode, 'mock');
  });

  it('sync() with the default mock adapter reports success without ever triggering a fallback', async () => {
    const { createCatalogAdapterService } = modules.adapterService;
    const service = createCatalogAdapterService();

    const status = await service.sync();

    assert.equal(status.adapterMode, 'mock');
    assert.equal(status.productFetchStatus, 'success');
    assert.equal(status.collectionFetchStatus, 'success');
    assert.equal(status.usedFallback, false);
    assert.ok(status.lastSyncedAt);
    assert.ok(status.mappingValidation);
    assert.equal(status.mappingValidation.invalidProductCount, 0);
  });

  it('configureLiveAdapter() with no credentials falls back gracefully and reports usedFallback: true', async () => {
    const { createCatalogAdapterService } = modules.adapterService;
    const service = createCatalogAdapterService();

    service.configureLiveAdapter({});
    const status = await service.sync();

    assert.equal(service.getMode(), 'live');
    assert.equal(status.productFetchStatus, 'adapter-unavailable');
    assert.equal(status.usedFallback, true);
    assert.match(status.fallbackReason, /mock catalog data/);
    assert.equal(service.getSyncedProducts(), null);
  });

  it('configureLiveAdapter() with an injected fetch stub adopts the synced snapshot on success', async () => {
    const { createCatalogAdapterService } = modules.adapterService;
    const service = createCatalogAdapterService();
    const fetchImpl = fakeFetch([
      jsonResponse(productListEdges([{ id: 'gid://shopify/Product/1', handle: 'live-product', title: 'Live Product', collections: { edges: [] } }])),
      jsonResponse(collectionListEdges([])),
    ]);

    service.configureLiveAdapter({ storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token' }, fetchImpl);
    const status = await service.sync();

    assert.equal(status.usedFallback, false);
    assert.equal(status.productCount, 1);
    assert.deepEqual(service.getSyncedProducts().map((product) => product.slug), ['live-product']);
  });

  it('a fetch that succeeds but maps zero valid products still falls back safely', async () => {
    const { createCatalogAdapterService } = modules.adapterService;
    const service = createCatalogAdapterService();
    const fetchImpl = fakeFetch([
      jsonResponse(productListEdges([{ id: 'gid://shopify/Product/1', handle: undefined, title: 'Missing Handle', collections: { edges: [] } }])),
      jsonResponse(collectionListEdges([])),
    ]);

    service.configureLiveAdapter({ storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token' }, fetchImpl);
    const status = await service.sync();

    assert.equal(status.mappingValidation.invalidProductCount, 1);
    assert.equal(status.usedFallback, true);
    assert.equal(service.getSyncedProducts(), null);
  });

  it('resetToDefaultAdapter() clears a live snapshot and returns to the safe default', async () => {
    const { createCatalogAdapterService } = modules.adapterService;
    const service = createCatalogAdapterService();
    const fetchImpl = fakeFetch([
      jsonResponse(productListEdges([{ id: 'gid://shopify/Product/1', handle: 'live-product', title: 'Live Product', collections: { edges: [] } }])),
      jsonResponse(collectionListEdges([])),
    ]);
    service.configureLiveAdapter({ storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token' }, fetchImpl);
    await service.sync();
    assert.equal(service.getSyncedProducts().length, 1);

    service.resetToDefaultAdapter();

    assert.equal(service.getMode(), 'mock');
    assert.equal(service.getSyncedProducts(), null);
    assert.equal(service.getStatus().lastSyncedAt, null);
  });
});

describe('catalogService wiring to the Catalog Adapter snapshot', () => {
  after(() => {
    modules.adapterService.catalogAdapterService.resetToDefaultAdapter();
  });

  it('listProducts()/getProduct() fall back to loader data when no live sync has succeeded', () => {
    const { catalogService } = modules.catalogService;
    const { listTypedProducts } = modules.loaders;

    assert.deepEqual(catalogService.listProducts(), listTypedProducts());
  });

  it('listProducts()/getProduct() read from the synced snapshot once a live sync succeeds', async () => {
    const { catalogService } = modules.catalogService;
    const { catalogAdapterService } = modules.adapterService;
    const fetchImpl = fakeFetch([
      jsonResponse(productListEdges([{ id: 'gid://shopify/Product/1', handle: 'live-only-product', title: 'Live Only Product', collections: { edges: [] } }])),
      jsonResponse(collectionListEdges([])),
    ]);

    catalogAdapterService.configureLiveAdapter({ storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token' }, fetchImpl);
    await catalogAdapterService.sync();

    const products = catalogService.listProducts();
    assert.equal(products.length, 1);
    assert.equal(products[0].slug, 'live-only-product');
    assert.equal(catalogService.getProduct('shopify-product-live-only-product').slug, 'live-only-product');
    assert.equal(catalogService.getProduct('does-not-exist'), null);
  });

  it('falls back to loader data again after resetToDefaultAdapter()', () => {
    const { catalogService } = modules.catalogService;
    const { catalogAdapterService } = modules.adapterService;
    const { listTypedProducts } = modules.loaders;

    catalogAdapterService.resetToDefaultAdapter();

    assert.deepEqual(catalogService.listProducts(), listTypedProducts());
  });
});

describe('Shopify Storefront Catalog Adapter schemas', () => {
  it('validates a well-formed status snapshot', () => {
    const parsed = modules.schemas.catalogAdapterStatusSnapshotSchema.parse({
      adapterMode: 'mock',
      productFetchStatus: 'success',
      collectionFetchStatus: 'success',
      lastSyncedAt: '2026-07-04T00:00:00.000Z',
      productCount: 3,
      categoryCount: 2,
      usedFallback: false,
      mappingValidation: { validProductCount: 3, invalidProductCount: 0, validCategoryCount: 2, unmatchedCollectionCount: 0, issues: [] },
      errors: [],
    });
    assert.equal(parsed.adapterMode, 'mock');
  });

  it('rejects a status snapshot missing a required field', () => {
    assert.throws(() => modules.schemas.catalogAdapterStatusSnapshotSchema.parse({ adapterMode: 'mock' }));
  });
});

describe('Shopify Storefront Catalog Adapter dev dashboard hook', () => {
  it('exposes a typed hook entry point that renders without a live network call', () => {
    const { useCatalogAdapterStatus } = modules.hooks;
    assert.equal(typeof useCatalogAdapterStatus, 'function');

    function HookProbe() {
      const state = useCatalogAdapterStatus();
      return React.createElement('span', { 'data-mode': state.status.adapterMode, 'data-loading': String(state.loading) });
    }

    const markup = renderToString(React.createElement(HookProbe));
    assert.match(markup, /data-mode="(mock|unavailable|live)"/);
  });
});
