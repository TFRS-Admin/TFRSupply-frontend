import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let modules;

function baseCategory(overrides = {}) {
  return {
    id: 'category-1',
    label: 'Lighting',
    slug: 'lighting',
    verticalId: 'work-truck',
    ...overrides,
  };
}

function fakeCatalogService(category, productTotal = 0) {
  return {
    getProduct() { return null; },
    listProducts() { return []; },
    getCategory(categoryId) {
      return categoryId === category?.id ? category : null;
    },
    listCategories() { return category ? [category] : []; },
    getVertical() { return null; },
    listVerticals() { return []; },
    searchProducts() { return { status: 'ready', products: [], total: productTotal }; },
  };
}

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    types: await server.ssrLoadModule('/src/types/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifyStorefrontCollection.schema.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/shopifyStorefrontCollection/index.ts'),
    service: await server.ssrLoadModule('/src/services/shopifyStorefrontCollection/index.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifyStorefrontCollection/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Shopify Storefront Collection Sync schemas', () => {
  it('validates a well-formed collection request and rejects a non-dry-run request', () => {
    const request = { requestId: 'storefront-collection-request-1', dryRun: true, categoryId: 'category-1' };
    assert.equal(modules.schemas.shopifyStorefrontCollectionRequestSchema.parse(request).dryRun, true);
    assert.throws(() => modules.schemas.shopifyStorefrontCollectionRequestSchema.parse({ ...request, dryRun: false }));
  });

  it('validates a well-formed collection result', () => {
    const parsed = modules.schemas.shopifyStorefrontCollectionResultSchema.parse({
      requestId: 'storefront-collection-request-1',
      status: 'dry-run',
      categoryId: 'category-1',
      mapping: { categoryId: 'category-1', verticalId: 'work-truck', handle: 'lighting', shopifyCollectionId: null, shopifyCollectionGid: null, mapped: false, productCount: 4 },
      preview: { operationName: 'CollectionByHandlePreview', query: 'query {}', variables: { handle: 'lighting' } },
      errors: [],
    });
    assert.equal(parsed.status, 'dry-run');
  });

  it('rejects a mapping missing a required field', () => {
    assert.throws(() => modules.schemas.shopifyStorefrontCollectionMappingSchema.parse({ categoryId: 'category-1', shopifyCollectionId: null, shopifyCollectionGid: null, mapped: false, productCount: 1 }));
  });
});

describe('Shopify Storefront Collection Sync mapping derivation', () => {
  it('derives handle and vertical from an existing catalog category', () => {
    const { buildStorefrontCollectionMapping } = modules.service;
    const mapping = buildStorefrontCollectionMapping(baseCategory(), 6);

    assert.equal(mapping.handle, 'lighting');
    assert.equal(mapping.verticalId, 'work-truck');
    assert.equal(mapping.productCount, 6);
    assert.equal(mapping.mapped, false);
    assert.equal(mapping.shopifyCollectionId, null);
  });

  it('reports mapped: true when the category already carries Shopify metadata', () => {
    const { buildStorefrontCollectionMapping } = modules.service;
    const mapping = buildStorefrontCollectionMapping(baseCategory({ shopify: { collectionId: 'shopify-collection-1', collectionGid: 'gid://shopify/Collection/1' } }), 2);

    assert.equal(mapping.mapped, true);
    assert.equal(mapping.shopifyCollectionId, 'shopify-collection-1');
    assert.equal(mapping.shopifyCollectionGid, 'gid://shopify/Collection/1');
  });
});

describe('Shopify Storefront Collection Sync service orchestration', () => {
  it('executes a dry run through the mock adapter, reusing the Catalog Service to build the mapping', async () => {
    const { createShopifyStorefrontCollectionService } = modules.service;
    const { mockShopifyStorefrontCollectionAdapter } = modules.adapters;
    const category = baseCategory();

    const service = createShopifyStorefrontCollectionService(mockShopifyStorefrontCollectionAdapter, fakeCatalogService(category, 3));
    const request = service.buildRequest(category.id);
    const result = await service.execute(request);

    assert.equal(result.status, 'dry-run');
    assert.equal(result.mapping.handle, category.slug);
    assert.equal(result.mapping.productCount, 3);
    assert.equal(result.preview.operationName, 'CollectionByHandlePreview');
    assert.deepEqual(result.preview.variables, { handle: category.slug });
    assert.equal(result.errors.length, 0);
  });

  it('reports adapter-unavailable by default and never calls Shopify', async () => {
    const { createShopifyStorefrontCollectionService } = modules.service;
    const category = baseCategory();

    const service = createShopifyStorefrontCollectionService(undefined, fakeCatalogService(category, 1));
    const result = await service.previewCollection(category.id);

    assert.equal(result.status, 'adapter-unavailable');
    assert.equal(result.errors[0].code, 'adapter-unavailable');
    assert.ok(result.mapping, 'mapping should still be computed deterministically');
  });

  it('reports a validation-error result when the catalog has no matching category', async () => {
    const { createShopifyStorefrontCollectionService } = modules.service;
    const { mockShopifyStorefrontCollectionAdapter } = modules.adapters;

    const service = createShopifyStorefrontCollectionService(mockShopifyStorefrontCollectionAdapter, fakeCatalogService(null));
    const result = await service.previewCollection('missing-category');

    assert.equal(result.status, 'failed');
    assert.equal(result.mapping, null);
    assert.equal(result.errors[0].code, 'validation-error');
  });

  it('reports capability metadata reflecting the injected adapter', () => {
    const { createShopifyStorefrontCollectionService } = modules.service;
    const { mockShopifyStorefrontCollectionAdapter, liveShopifyStorefrontCollectionAdapter } = modules.adapters;

    assert.equal(createShopifyStorefrontCollectionService().getCapabilities().adapterMode, 'unavailable');
    assert.equal(createShopifyStorefrontCollectionService(mockShopifyStorefrontCollectionAdapter).getCapabilities().adapterMode, 'mock');
    assert.equal(createShopifyStorefrontCollectionService(liveShopifyStorefrontCollectionAdapter).getCapabilities().adapterMode, 'live');
    assert.equal(createShopifyStorefrontCollectionService().getCapabilities().liveCallsEnabled, false);
  });
});

describe('Shopify Storefront Collection Sync adapters', () => {
  it('unavailableShopifyStorefrontCollectionAdapter passes the mapping through untouched', async () => {
    const { unavailableShopifyStorefrontCollectionAdapter } = modules.adapters;
    const mapping = { categoryId: 'category-1', verticalId: 'work-truck', handle: 'lighting', shopifyCollectionId: null, shopifyCollectionGid: null, mapped: false, productCount: 1 };
    const preview = { operationName: 'CollectionByHandlePreview', query: 'query {}', variables: {} };

    const result = await unavailableShopifyStorefrontCollectionAdapter.execute({ requestId: 'req-1', categoryId: 'category-1', mapping, preview });

    assert.equal(result.status, 'adapter-unavailable');
    assert.deepEqual(result.mapping, mapping);
  });

  it('mockShopifyStorefrontCollectionAdapter resolves a successful dry run without I/O', async () => {
    const { mockShopifyStorefrontCollectionAdapter } = modules.adapters;
    const mapping = { categoryId: 'category-1', verticalId: 'work-truck', handle: 'lighting', shopifyCollectionId: null, shopifyCollectionGid: null, mapped: false, productCount: 1 };
    const preview = { operationName: 'CollectionByHandlePreview', query: 'query {}', variables: {} };

    const result = await mockShopifyStorefrontCollectionAdapter.execute({ requestId: 'req-mock', categoryId: 'category-1', mapping, preview });

    assert.equal(result.status, 'dry-run');
    assert.equal(result.errors.length, 0);
    assert.deepEqual(result.mapping, mapping);
  });

  it('liveShopifyStorefrontCollectionAdapter builds the real fetch request boundary without performing a network call', async () => {
    const { createLiveShopifyStorefrontCollectionAdapter } = modules.adapters;
    const liveAdapter = createLiveShopifyStorefrontCollectionAdapter();
    const mapping = { categoryId: 'category-1', verticalId: 'work-truck', handle: 'lighting', shopifyCollectionId: null, shopifyCollectionGid: null, mapped: false, productCount: 1 };
    const preview = { operationName: 'CollectionByHandlePreview', query: 'query CollectionByHandlePreview { collectionByHandle { id } }', variables: { handle: mapping.handle } };

    const result = await liveAdapter.execute({
      requestId: 'req-2',
      categoryId: 'category-1',
      mapping,
      preview,
      config: { storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token-abc' },
    });

    assert.equal(result.status, 'failed');
    assert.equal(result.errors[0].code, 'live-calls-disabled');
    assert.equal(result.errors[0].retryable, false);
    assert.equal(result.metadata.attributes.configured, true);
    assert.match(result.metadata.attributes.requestUrl, /^https:\/\/example\.myshopify\.com\/api\/2024-10\/graphql\.json$/);
  });
});

describe('Shopify Storefront Collection Sync hooks', () => {
  it('exposes typed hook entry points', () => {
    assert.equal(typeof modules.hooks.useShopifyStorefrontCollection, 'function');
    assert.equal(typeof modules.hooks.useShopifyStorefrontCollectionPreview, 'function');
  });

  it('useShopifyStorefrontCollectionPreview does not require a live network call to render', () => {
    const { useShopifyStorefrontCollectionPreview } = modules.hooks;

    function HookProbe() {
      const state = useShopifyStorefrontCollectionPreview('category-1');
      return React.createElement('span', {
        'data-loading': String(Boolean(state.loading)),
        'data-has-result': String(Boolean(state.result)),
      });
    }

    const markup = renderToString(React.createElement(HookProbe));
    assert.match(markup, /data-loading="(true|false)"/);
  });
});

describe('Shopify Storefront Collection Sync Category page integration', () => {
  it('exposes a StorefrontCollectionPanel component that renders nothing without a categoryId', async () => {
    const panelModule = await server.ssrLoadModule('/src/components/product/StorefrontCollectionPanel.jsx');
    const StorefrontCollectionPanel = panelModule.default;
    assert.equal(typeof StorefrontCollectionPanel, 'function');

    const markup = renderToString(React.createElement(StorefrontCollectionPanel, { categoryId: null }));
    assert.equal(markup, '');
  });

  it('CategoryTemplate composes StorefrontCollectionPanel', async () => {
    const fs = await import('node:fs/promises');
    const categoryTemplateSource = await fs.readFile(new URL('../src/pages/CategoryTemplate.jsx', import.meta.url), 'utf-8');
    assert.match(categoryTemplateSource, /StorefrontCollectionPanel/);
  });
});
