import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let modules;

function baseProduct(overrides = {}) {
  return {
    id: 'product-1',
    label: 'Navigator Full-Size Light Bar',
    slug: 'navigator-full-size-light-bar',
    sku: 'NAV-FSB-01',
    verticalIds: ['work-truck'],
    categoryIds: ['lighting'],
    media: { hero: 'hero.jpg', gallery: [{ src: 'a.jpg' }, { src: 'b.jpg' }] },
    commerce: { sku_table: [{ sku: 'NAV-FSB-01-A' }, { sku: 'NAV-FSB-01-B' }] },
    ...overrides,
  };
}

function fakeCatalogService(product) {
  return {
    getProduct(productId) {
      return productId === product?.id ? product : null;
    },
    listProducts() { return product ? [product] : []; },
    getCategory() { return null; },
    listCategories() { return []; },
    getVertical() { return null; },
    listVerticals() { return []; },
    searchProducts() { return { status: 'ok', products: [] }; },
  };
}

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    types: await server.ssrLoadModule('/src/types/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifyStorefrontProduct.schema.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/shopifyStorefrontProduct/index.ts'),
    service: await server.ssrLoadModule('/src/services/shopifyStorefrontProduct/index.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifyStorefrontProduct/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Shopify Storefront Product Sync schemas', () => {
  it('validates a well-formed product request and rejects a non-dry-run request', () => {
    const request = { requestId: 'storefront-product-request-1', dryRun: true, productId: 'product-1' };
    assert.equal(modules.schemas.shopifyStorefrontProductRequestSchema.parse(request).dryRun, true);
    assert.throws(() => modules.schemas.shopifyStorefrontProductRequestSchema.parse({ ...request, dryRun: false }));
  });

  it('validates a well-formed product result', () => {
    const parsed = modules.schemas.shopifyStorefrontProductResultSchema.parse({
      requestId: 'storefront-product-request-1',
      status: 'dry-run',
      productId: 'product-1',
      mapping: { productId: 'product-1', handle: 'navigator-full-size-light-bar', shopifyProductId: null, shopifyProductGid: null, mapped: false, variantCount: 2, mediaCount: 3 },
      preview: { operationName: 'ProductByHandlePreview', query: 'query {}', variables: { handle: 'navigator-full-size-light-bar' } },
      errors: [],
    });
    assert.equal(parsed.status, 'dry-run');
  });

  it('rejects a mapping missing a required field', () => {
    assert.throws(() => modules.schemas.shopifyStorefrontProductMappingSchema.parse({ productId: 'product-1', shopifyProductId: null, shopifyProductGid: null, mapped: false, variantCount: 1, mediaCount: 1 }));
  });
});

describe('Shopify Storefront Product Sync mapping derivation', () => {
  it('derives handle, variant count, and media count from an existing catalog product', () => {
    const { buildStorefrontProductMapping } = modules.service;
    const mapping = buildStorefrontProductMapping(baseProduct());

    assert.equal(mapping.handle, 'navigator-full-size-light-bar');
    assert.equal(mapping.variantCount, 2);
    assert.equal(mapping.mediaCount, 3);
    assert.equal(mapping.mapped, false);
    assert.equal(mapping.shopifyProductId, null);
  });

  it('reports mapped: true when the product already carries Shopify metadata', () => {
    const { buildStorefrontProductMapping } = modules.service;
    const mapping = buildStorefrontProductMapping(baseProduct({ shopify: { productId: 'shopify-1', productGid: 'gid://shopify/Product/1' } }));

    assert.equal(mapping.mapped, true);
    assert.equal(mapping.shopifyProductId, 'shopify-1');
    assert.equal(mapping.shopifyProductGid, 'gid://shopify/Product/1');
  });

  it('falls back to a single-variant count when no sku_table is present but a sku exists', () => {
    const { buildStorefrontProductMapping } = modules.service;
    const mapping = buildStorefrontProductMapping(baseProduct({ commerce: undefined }));

    assert.equal(mapping.variantCount, 1);
  });
});

describe('Shopify Storefront Product Sync service orchestration', () => {
  it('executes a dry run through the mock adapter, reusing the Catalog Service to build the mapping', async () => {
    const { createShopifyStorefrontProductService } = modules.service;
    const { mockShopifyStorefrontProductAdapter } = modules.adapters;
    const product = baseProduct();

    const service = createShopifyStorefrontProductService(mockShopifyStorefrontProductAdapter, fakeCatalogService(product));
    const request = service.buildRequest(product.id);
    const result = await service.execute(request);

    assert.equal(result.status, 'dry-run');
    assert.equal(result.mapping.handle, product.slug);
    assert.equal(result.mapping.variantCount, 2);
    assert.equal(result.preview.operationName, 'ProductByHandlePreview');
    assert.deepEqual(result.preview.variables, { handle: product.slug });
    assert.equal(result.errors.length, 0);
  });

  it('reports adapter-unavailable by default and never calls Shopify', async () => {
    const { createShopifyStorefrontProductService } = modules.service;
    const product = baseProduct();

    const service = createShopifyStorefrontProductService(undefined, fakeCatalogService(product));
    const result = await service.previewProduct(product.id);

    assert.equal(result.status, 'adapter-unavailable');
    assert.equal(result.errors[0].code, 'adapter-unavailable');
    assert.ok(result.mapping, 'mapping should still be computed deterministically');
  });

  it('reports a validation-error result when the catalog has no matching product', async () => {
    const { createShopifyStorefrontProductService } = modules.service;
    const { mockShopifyStorefrontProductAdapter } = modules.adapters;

    const service = createShopifyStorefrontProductService(mockShopifyStorefrontProductAdapter, fakeCatalogService(null));
    const result = await service.previewProduct('missing-product');

    assert.equal(result.status, 'failed');
    assert.equal(result.mapping, null);
    assert.equal(result.errors[0].code, 'validation-error');
  });

  it('reports capability metadata reflecting the injected adapter', () => {
    const { createShopifyStorefrontProductService } = modules.service;
    const { mockShopifyStorefrontProductAdapter, liveShopifyStorefrontProductAdapter } = modules.adapters;

    assert.equal(createShopifyStorefrontProductService().getCapabilities().adapterMode, 'unavailable');
    assert.equal(createShopifyStorefrontProductService(mockShopifyStorefrontProductAdapter).getCapabilities().adapterMode, 'mock');
    assert.equal(createShopifyStorefrontProductService(liveShopifyStorefrontProductAdapter).getCapabilities().adapterMode, 'live');
    assert.equal(createShopifyStorefrontProductService().getCapabilities().liveCallsEnabled, false);
  });
});

describe('Shopify Storefront Product Sync adapters', () => {
  it('unavailableShopifyStorefrontProductAdapter passes the mapping through untouched', async () => {
    const { unavailableShopifyStorefrontProductAdapter } = modules.adapters;
    const mapping = { productId: 'product-1', handle: 'navigator-full-size-light-bar', shopifyProductId: null, shopifyProductGid: null, mapped: false, variantCount: 1, mediaCount: 1 };
    const preview = { operationName: 'ProductByHandlePreview', query: 'query {}', variables: {} };

    const result = await unavailableShopifyStorefrontProductAdapter.execute({ requestId: 'req-1', productId: 'product-1', mapping, preview });

    assert.equal(result.status, 'adapter-unavailable');
    assert.deepEqual(result.mapping, mapping);
  });

  it('liveShopifyStorefrontProductAdapter builds the real fetch request boundary without performing a network call', async () => {
    const { createLiveShopifyStorefrontProductAdapter } = modules.adapters;
    const liveAdapter = createLiveShopifyStorefrontProductAdapter();
    const mapping = { productId: 'product-1', handle: 'navigator-full-size-light-bar', shopifyProductId: null, shopifyProductGid: null, mapped: false, variantCount: 1, mediaCount: 1 };
    const preview = { operationName: 'ProductByHandlePreview', query: 'query ProductByHandlePreview { productByHandle { id } }', variables: { handle: mapping.handle } };

    const result = await liveAdapter.execute({
      requestId: 'req-2',
      productId: 'product-1',
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

describe('Shopify Storefront Product Sync hooks', () => {
  it('exposes typed hook entry points', () => {
    assert.equal(typeof modules.hooks.useShopifyStorefrontProduct, 'function');
    assert.equal(typeof modules.hooks.useShopifyStorefrontProductPreview, 'function');
  });

  it('useShopifyStorefrontProductPreview does not require a live network call to render', () => {
    const { useShopifyStorefrontProductPreview } = modules.hooks;

    function HookProbe() {
      const state = useShopifyStorefrontProductPreview('product-1');
      return React.createElement('span', {
        'data-loading': String(Boolean(state.loading)),
        'data-has-result': String(Boolean(state.result)),
      });
    }

    const markup = renderToString(React.createElement(HookProbe));
    assert.match(markup, /data-loading="(true|false)"/);
  });
});
