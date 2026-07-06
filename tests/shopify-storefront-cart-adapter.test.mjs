import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let modules;

function baseLine(overrides = {}) {
  return {
    id: 'cart-line-1',
    productId: 'product-1',
    sku: 'SKU-1',
    label: 'Navigator Full-Size Light Bar',
    quantity: 2,
    unitPrice: { amount: 100, currencyCode: 'USD' },
    lineTotal: { amount: 200, currencyCode: 'USD' },
    availability: 'available',
    configurationStatus: 'not-required',
    isPackage: false,
    ...overrides,
  };
}

function readyCommerceService(createCommerceService) {
  return createCommerceService({
    async getProduct() { return { status: 'not-found', data: null }; },
    async getVariant() { return { status: 'not-found', data: null }; },
    async getVariantMapping(request) {
      return { status: 'ready', data: { sku: request.sku, shopifyVariantGid: `gid://shopify/ProductVariant/${request.sku}`, channel: 'shopify' } };
    },
  });
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

function unavailableCommerceService(createCommerceService) {
  return createCommerceService({
    async getProduct() { return { status: 'pending', data: null }; },
    async getVariant() { return { status: 'pending', data: null }; },
    async getVariantMapping() { return { status: 'pending', data: null, message: 'Commerce adapter is not connected.' }; },
  });
}

function fakeCartWorkspaceService(lines) {
  return {
    async getState() {
      return { lines, summary: { itemCount: lines.length, lineCount: lines.length, currencyCode: 'USD', subtotal: { amount: 0, currencyCode: 'USD' }, estimatedShipping: null, estimatedTax: null, grandTotalEstimate: { amount: 0, currencyCode: 'USD' } } };
    },
    subscribe() { return () => {}; },
  };
}

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    types: await server.ssrLoadModule('/src/types/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifyStorefrontCart.schema.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/shopifyStorefrontCart/index.ts'),
    service: await server.ssrLoadModule('/src/services/shopifyStorefrontCart/index.ts'),
    commerceService: await server.ssrLoadModule('/src/services/commerce/index.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifyStorefrontCart/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Shopify Storefront Cart Adapter schemas', () => {
  it('validates a well-formed cart request and rejects a non-dry-run request', () => {
    const request = { requestId: 'storefront-cart-request-1', dryRun: true, lines: [baseLine()] };
    assert.equal(modules.schemas.shopifyStorefrontCartRequestSchema.parse(request).dryRun, true);
    assert.throws(() => modules.schemas.shopifyStorefrontCartRequestSchema.parse({ ...request, dryRun: false }));
  });

  it('validates a well-formed cart result', () => {
    const parsed = modules.schemas.shopifyStorefrontCartResultSchema.parse({
      requestId: 'storefront-cart-request-1',
      status: 'dry-run',
      cartLines: [{ cartLineId: 'cart-line-1', sku: 'SKU-1', quantity: 2, merchandiseId: 'gid://shopify/ProductVariant/1', merchandiseAvailable: true }],
      lineCount: 1,
      mutationPreview: { operationName: 'CartLinesAddPreview', query: 'mutation {}', variables: {} },
      checkoutPreview: { checkoutUrlPreview: 'https://example.test/preview', cartId: 'mock-cart-1', currencyCode: 'USD', estimatedTotal: { amount: 200, currencyCode: 'USD' }, lineCount: 1, ready: true },
      errors: [],
    });
    assert.equal(parsed.status, 'dry-run');
  });
});

describe('Shopify Storefront Cart Adapter service orchestration', () => {
  it('maps Cart Workspace lines to Shopify Storefront cart lines using the existing Commerce Foundation', async () => {
    const { createShopifyStorefrontCartService } = modules.service;
    const { mockShopifyStorefrontCartAdapter } = modules.adapters;
    const { createCommerceService } = modules.commerceService;

    const lines = [baseLine()];
    const service = createShopifyStorefrontCartService(mockShopifyStorefrontCartAdapter, fakeCartWorkspaceService(lines), readyCommerceService(createCommerceService));

    const request = service.buildRequest(lines);
    const result = await service.execute(request);

    assert.equal(result.status, 'dry-run');
    assert.equal(result.cartLines.length, 1);
    assert.equal(result.cartLines[0].merchandiseId, 'gid://shopify/ProductVariant/SKU-1');
    assert.equal(result.cartLines[0].merchandiseAvailable, true);
  });

  it('reports unmapped lines when commerce cannot resolve a variant', async () => {
    const { createShopifyStorefrontCartService } = modules.service;
    const { mockShopifyStorefrontCartAdapter } = modules.adapters;
    const { createCommerceService } = modules.commerceService;

    const lines = [baseLine()];
    const service = createShopifyStorefrontCartService(mockShopifyStorefrontCartAdapter, fakeCartWorkspaceService(lines), unavailableCommerceService(createCommerceService));

    const request = service.buildRequest(lines);
    const result = await service.execute(request);

    assert.equal(result.cartLines[0].merchandiseId, null);
    assert.equal(result.cartLines[0].merchandiseAvailable, false);
    assert.equal(result.checkoutPreview.ready, false);
  });

  it('builds a Storefront cart mutation preview without performing any network call', async () => {
    const { createShopifyStorefrontCartService } = modules.service;
    const { mockShopifyStorefrontCartAdapter } = modules.adapters;
    const { createCommerceService } = modules.commerceService;

    const lines = [baseLine()];
    const service = createShopifyStorefrontCartService(mockShopifyStorefrontCartAdapter, fakeCartWorkspaceService(lines), readyCommerceService(createCommerceService));

    const request = service.buildRequest(lines);
    const result = await service.execute(request);

    assert.equal(result.mutationPreview.operationName, 'CartLinesAddPreview');
    assert.match(result.mutationPreview.query, /cartLinesAdd/);
    assert.deepEqual(result.mutationPreview.variables.lines, [{ merchandiseId: 'gid://shopify/ProductVariant/SKU-1', quantity: 2 }]);
  });

  it('reports capability metadata reflecting the injected adapter', () => {
    const { createShopifyStorefrontCartService } = modules.service;
    const { mockShopifyStorefrontCartAdapter, unavailableShopifyStorefrontCartAdapter, liveShopifyStorefrontCartAdapter } = modules.adapters;

    assert.equal(createShopifyStorefrontCartService().getCapabilities().adapterMode, 'unavailable');
    assert.equal(createShopifyStorefrontCartService(mockShopifyStorefrontCartAdapter).getCapabilities().adapterMode, 'mock');
    assert.equal(createShopifyStorefrontCartService(liveShopifyStorefrontCartAdapter).getCapabilities().adapterMode, 'live');
    assert.equal(createShopifyStorefrontCartService().getCapabilities().liveCallsEnabled, false);
  });

  it('never calls Shopify by default (unavailable adapter)', async () => {
    const { createShopifyStorefrontCartService } = modules.service;
    const { createCommerceService } = modules.commerceService;

    const lines = [baseLine()];
    const service = createShopifyStorefrontCartService(undefined, fakeCartWorkspaceService(lines), readyCommerceService(createCommerceService));

    const request = service.buildRequest(lines);
    const result = await service.execute(request);

    assert.equal(result.status, 'adapter-unavailable');
    assert.equal(result.checkoutPreview, null);
    assert.equal(result.errors[0].code, 'adapter-unavailable');
  });

  it('previewCart() reads the live Cart Workspace state when no explicit lines are supplied', async () => {
    const { createShopifyStorefrontCartService } = modules.service;
    const { mockShopifyStorefrontCartAdapter } = modules.adapters;
    const { createCommerceService } = modules.commerceService;

    const lines = [baseLine({ id: 'preview-line' })];
    const service = createShopifyStorefrontCartService(mockShopifyStorefrontCartAdapter, fakeCartWorkspaceService(lines), readyCommerceService(createCommerceService));

    const result = await service.previewCart();

    assert.equal(result.cartLines.length, 1);
    assert.equal(result.cartLines[0].cartLineId, 'preview-line');
  });
});

describe('Shopify Storefront Cart Adapter adapters', () => {
  it('mockShopifyStorefrontCartAdapter resolves a deterministic dry-run with a placeholder checkout URL preview', async () => {
    const { mockShopifyStorefrontCartAdapter } = modules.adapters;
    const cartLines = [{ cartLineId: 'cart-line-1', sku: 'SKU-1', quantity: 1, merchandiseId: 'gid://shopify/ProductVariant/1', merchandiseAvailable: true }];
    const mutationPreview = { operationName: 'CartLinesAddPreview', query: 'mutation {}', variables: {} };

    const result = await mockShopifyStorefrontCartAdapter.execute({ requestId: 'req-1', cartLines, mutationPreview, currencyCode: 'USD', estimatedTotal: { amount: 100, currencyCode: 'USD' } });

    assert.equal(result.status, 'dry-run');
    assert.equal(result.errors.length, 0);
    assert.match(result.checkoutPreview.checkoutUrlPreview, /^https:\/\/mock-storefront\.example\/checkout-preview\//);
    assert.equal(result.checkoutPreview.ready, true);
  });

  it('unavailableShopifyStorefrontCartAdapter returns adapter-unavailable with no checkout preview', async () => {
    const { unavailableShopifyStorefrontCartAdapter } = modules.adapters;
    const mutationPreview = { operationName: 'CartLinesAddPreview', query: 'mutation {}', variables: {} };

    const result = await unavailableShopifyStorefrontCartAdapter.execute({ requestId: 'req-2', cartLines: [], mutationPreview, currencyCode: 'USD', estimatedTotal: { amount: 0, currencyCode: 'USD' } });

    assert.equal(result.status, 'adapter-unavailable');
    assert.equal(result.checkoutPreview, null);
    assert.equal(result.errors[0].code, 'adapter-unavailable');
  });

  it('liveShopifyStorefrontCartAdapter reports a graceful configuration-error and never calls fetch when store domain/token are missing', async () => {
    const { createLiveShopifyStorefrontCartAdapter } = modules.adapters;
    const fetchImpl = fakeFetch([]);
    const liveAdapter = createLiveShopifyStorefrontCartAdapter(undefined, fetchImpl);
    const cartLines = [{ cartLineId: 'cart-line-1', sku: 'SKU-1', quantity: 1, merchandiseId: 'gid://shopify/ProductVariant/1', merchandiseAvailable: true }];
    const mutationPreview = { operationName: 'CartLinesAddPreview', query: 'mutation CartLinesAddPreview { cartLinesAdd { cart { id } } }', variables: { lines: [] } };

    const result = await liveAdapter.execute({ requestId: 'req-3', cartLines, mutationPreview, currencyCode: 'USD', estimatedTotal: { amount: 100, currencyCode: 'USD' } });

    assert.equal(result.status, 'failed');
    assert.equal(result.errors[0].code, 'configuration-error');
    assert.equal(result.errors[0].retryable, false);
    assert.equal(result.metadata.attributes.configured, false);
    assert.equal(fetchImpl.calls.length, 0);
  });

  it('liveShopifyStorefrontCartAdapter (Checkout Safety) never calls fetch when every cart line is unmapped', async () => {
    const { createLiveShopifyStorefrontCartAdapter } = modules.adapters;
    const fetchImpl = fakeFetch([]);
    const liveAdapter = createLiveShopifyStorefrontCartAdapter({ storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token-abc' }, fetchImpl);
    const cartLines = [
      { cartLineId: 'cart-line-1', sku: 'SKU-1', quantity: 1, merchandiseId: null, merchandiseAvailable: false },
      { cartLineId: 'cart-line-2', sku: 'SKU-2', quantity: 1, merchandiseId: null, merchandiseAvailable: false },
    ];
    const mutationPreview = { operationName: 'CartLinesAddPreview', query: 'mutation CartLinesAddPreview { cartLinesAdd { cart { id } } }', variables: { lines: [] } };

    const result = await liveAdapter.execute({ requestId: 'req-safety-1', cartLines, mutationPreview, currencyCode: 'USD', estimatedTotal: { amount: 0, currencyCode: 'USD' } });

    assert.equal(result.status, 'failed');
    assert.equal(result.errors[0].code, 'unmapped-line');
    assert.equal(result.checkoutPreview, null);
    assert.equal(fetchImpl.calls.length, 0);
  });

  it('liveShopifyStorefrontCartAdapter (Checkout Safety) never calls fetch for an empty cart', async () => {
    const { createLiveShopifyStorefrontCartAdapter } = modules.adapters;
    const fetchImpl = fakeFetch([]);
    const liveAdapter = createLiveShopifyStorefrontCartAdapter({ storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token-abc' }, fetchImpl);
    const mutationPreview = { operationName: 'CartLinesAddPreview', query: 'mutation CartLinesAddPreview { cartLinesAdd { cart { id } } }', variables: { lines: [] } };

    const result = await liveAdapter.execute({ requestId: 'req-safety-2', cartLines: [], mutationPreview, currencyCode: 'USD', estimatedTotal: { amount: 0, currencyCode: 'USD' } });

    assert.equal(result.status, 'failed');
    assert.equal(result.errors[0].code, 'unmapped-line');
    assert.equal(fetchImpl.calls.length, 0);
  });

  it('liveShopifyStorefrontCartAdapter (Checkout Safety) proceeds with only the mapped lines when the cart is mixed', async () => {
    const { createLiveShopifyStorefrontCartAdapter } = modules.adapters;
    const fetchImpl = fakeFetch([jsonResponse({
      data: { cartCreate: { cart: { id: 'gid://shopify/Cart/mixed-1', checkoutUrl: 'https://example.myshopify.com/cart/c/mixed-1' }, userErrors: [] } },
    })]);
    const liveAdapter = createLiveShopifyStorefrontCartAdapter({ storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token-abc' }, fetchImpl);
    const cartLines = [
      { cartLineId: 'cart-line-mapped', sku: 'SKU-MAPPED', quantity: 2, merchandiseId: 'gid://shopify/ProductVariant/mapped', merchandiseAvailable: true },
      { cartLineId: 'cart-line-unmapped', sku: 'SKU-UNMAPPED', quantity: 1, merchandiseId: null, merchandiseAvailable: false },
    ];
    const mutationPreview = { operationName: 'CartLinesAddPreview', query: 'mutation CartLinesAddPreview { cartLinesAdd { cart { id } } }', variables: { lines: [] } };

    const result = await liveAdapter.execute({ requestId: 'req-safety-3', cartLines, mutationPreview, currencyCode: 'USD', estimatedTotal: { amount: 200, currencyCode: 'USD' } });

    assert.equal(result.status, 'succeeded');
    assert.equal(fetchImpl.calls.length, 1);
    assert.equal(result.mutationPreview.variables.input.lines.length, 1);
    assert.equal(result.mutationPreview.variables.input.lines[0].merchandiseId, 'gid://shopify/ProductVariant/mapped');
    assert.equal(result.cartLines.length, 2);
    assert.equal(result.cartLines.find((line) => line.cartLineId === 'cart-line-unmapped').merchandiseId, null);
    assert.equal(result.checkoutPreview.checkoutUrlPreview, 'https://example.myshopify.com/cart/c/mixed-1');

    const sentBody = JSON.parse(fetchImpl.calls[0].init.body);
    assert.equal(sentBody.variables.input.lines.length, 1);
    assert.equal(sentBody.variables.input.lines[0].merchandiseId, 'gid://shopify/ProductVariant/mapped');
  });

  it('liveShopifyStorefrontCartAdapter performs a real cartCreate fetch and returns the real cart id and checkoutUrl on success', async () => {
    const { createLiveShopifyStorefrontCartAdapter } = modules.adapters;
    const fetchImpl = fakeFetch([jsonResponse({
      data: { cartCreate: { cart: { id: 'gid://shopify/Cart/abc123', checkoutUrl: 'https://example.myshopify.com/cart/c/abc123' }, userErrors: [] } },
    })]);
    const liveAdapter = createLiveShopifyStorefrontCartAdapter({ storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token-abc' }, fetchImpl);
    const cartLines = [{ cartLineId: 'cart-line-1', sku: 'SKU-1', quantity: 1, merchandiseId: 'gid://shopify/ProductVariant/1', merchandiseAvailable: true }];
    const mutationPreview = { operationName: 'CartLinesAddPreview', query: 'mutation CartLinesAddPreview { cartLinesAdd { cart { id } } }', variables: { lines: [] } };

    const result = await liveAdapter.execute({ requestId: 'req-4', cartLines, mutationPreview, currencyCode: 'USD', estimatedTotal: { amount: 100, currencyCode: 'USD' } });

    assert.equal(result.status, 'succeeded');
    assert.equal(result.errors.length, 0);
    assert.equal(result.checkoutPreview.cartId, 'gid://shopify/Cart/abc123');
    assert.equal(result.checkoutPreview.checkoutUrlPreview, 'https://example.myshopify.com/cart/c/abc123');
    assert.equal(result.mutationPreview.operationName, 'CartCreate');
    assert.match(result.mutationPreview.query, /cartCreate/);
    assert.equal(fetchImpl.calls.length, 1);
    assert.match(fetchImpl.calls[0].url, /^https:\/\/example\.myshopify\.com\/api\/2024-10\/graphql\.json$/);
    assert.equal(fetchImpl.calls[0].init.headers['X-Shopify-Storefront-Access-Token'], 'token-abc');
  });

  it('liveShopifyStorefrontCartAdapter reports a graceful failure on a Shopify userErrors response', async () => {
    const { createLiveShopifyStorefrontCartAdapter } = modules.adapters;
    const fetchImpl = fakeFetch([jsonResponse({
      data: { cartCreate: { cart: null, userErrors: [{ field: ['input', 'lines'], message: 'Merchandise is out of stock.' }] } },
    })]);
    const liveAdapter = createLiveShopifyStorefrontCartAdapter({ storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token-abc' }, fetchImpl);
    const cartLines = [{ cartLineId: 'cart-line-1', sku: 'SKU-1', quantity: 1, merchandiseId: 'gid://shopify/ProductVariant/1', merchandiseAvailable: true }];
    const mutationPreview = { operationName: 'CartLinesAddPreview', query: 'mutation CartLinesAddPreview { cartLinesAdd { cart { id } } }', variables: { lines: [] } };

    const result = await liveAdapter.execute({ requestId: 'req-5', cartLines, mutationPreview, currencyCode: 'USD', estimatedTotal: { amount: 100, currencyCode: 'USD' } });

    assert.equal(result.status, 'failed');
    assert.equal(result.errors[0].code, 'shopify-error');
    assert.match(result.errors[0].message, /out of stock/);
    assert.equal(result.checkoutPreview, null);
  });

  it('liveShopifyStorefrontCartAdapter reports a graceful failure on a network error', async () => {
    const { createLiveShopifyStorefrontCartAdapter } = modules.adapters;
    const fetchImpl = fakeFetch([new TypeError('network down')]);
    const liveAdapter = createLiveShopifyStorefrontCartAdapter({ storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token-abc' }, fetchImpl);
    const cartLines = [{ cartLineId: 'cart-line-1', sku: 'SKU-1', quantity: 1, merchandiseId: 'gid://shopify/ProductVariant/1', merchandiseAvailable: true }];
    const mutationPreview = { operationName: 'CartLinesAddPreview', query: 'mutation CartLinesAddPreview { cartLinesAdd { cart { id } } }', variables: { lines: [] } };

    const result = await liveAdapter.execute({ requestId: 'req-6', cartLines, mutationPreview, currencyCode: 'USD', estimatedTotal: { amount: 100, currencyCode: 'USD' } });

    assert.equal(result.status, 'failed');
    assert.equal(result.errors[0].code, 'network-error');
    assert.equal(result.errors[0].retryable, true);
  });
});

describe('Shopify Storefront Cart Adapter hooks', () => {
  it('exposes typed hook entry points', () => {
    assert.equal(typeof modules.hooks.useShopifyStorefrontCart, 'function');
    assert.equal(typeof modules.hooks.useShopifyStorefrontCartPreview, 'function');
  });

  it('useShopifyStorefrontCartPreview does not require a live network call to render', () => {
    const { useShopifyStorefrontCartPreview } = modules.hooks;

    function HookProbe() {
      const state = useShopifyStorefrontCartPreview();
      return React.createElement('span', {
        'data-loading': String(Boolean(state.loading)),
        'data-has-result': String(Boolean(state.result)),
      });
    }

    const markup = renderToString(React.createElement(HookProbe));
    assert.match(markup, /data-loading="(true|false)"/);
  });
});
