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
    quantity: 1,
    unitPrice: { amount: 1000, currencyCode: 'USD' },
    lineTotal: { amount: 1000, currencyCode: 'USD' },
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
      return { status: 'ready', data: { sku: request.sku, shopifyVariantGid: `gid://shopify/ProductVariant/${request.sku}`, shopifyVariantId: `variant-${request.sku}`, price: { amount: 1000, currencyCode: 'USD' }, channel: 'shopify' } };
    },
  });
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
    validateCart() {
      return { valid: true, issues: [] };
    },
    subscribe() { return () => {}; },
  };
}

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
  modules = {
    schemas: await server.ssrLoadModule('/src/schemas/shopifyCheckoutPreview.schema.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/shopifyCheckoutPreview/index.ts'),
    service: await server.ssrLoadModule('/src/services/shopifyCheckoutPreview/index.ts'),
    checkoutPreparationService: await server.ssrLoadModule('/src/services/checkoutPreparation/index.ts'),
    storefrontCartService: await server.ssrLoadModule('/src/services/shopifyStorefrontCart/index.ts'),
    storefrontCartAdapters: await server.ssrLoadModule('/src/adapters/shopifyStorefrontCart/index.ts'),
    checkoutPreparationAdapters: await server.ssrLoadModule('/src/adapters/checkoutPreparation/index.ts'),
    commerceService: await server.ssrLoadModule('/src/services/commerce/index.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifyCheckoutPreview/index.ts'),
  };
});
after(async () => { await server?.close(); });

function buildDependencies({ lines, commerce, storefrontCartAdapter }) {
  const { createCommerceService } = modules.commerceService;
  const commerceService = commerce === 'ready' ? readyCommerceService(createCommerceService) : unavailableCommerceService(createCommerceService);
  const cartWorkspace = fakeCartWorkspaceService(lines);

  const { createCheckoutPreparationService } = modules.checkoutPreparationService;
  const { mockCheckoutPreparationAdapter } = modules.checkoutPreparationAdapters;
  const checkoutPreparation = createCheckoutPreparationService(mockCheckoutPreparationAdapter, cartWorkspace, commerceService);

  const { createShopifyStorefrontCartService } = modules.storefrontCartService;
  const { mockShopifyStorefrontCartAdapter, unavailableShopifyStorefrontCartAdapter } = modules.storefrontCartAdapters;
  const storefrontCart = createShopifyStorefrontCartService(
    storefrontCartAdapter === 'mock' ? mockShopifyStorefrontCartAdapter : unavailableShopifyStorefrontCartAdapter,
    cartWorkspace,
    commerceService,
  );

  return { cartWorkspace, checkoutPreparation, storefrontCart };
}

describe('Shopify Checkout URL Preview schemas', () => {
  it('validates a well-formed checkout preview request', () => {
    const request = { requestId: 'checkout-preview-request-1', lines: [baseLine()] };
    assert.equal(modules.schemas.shopifyCheckoutPreviewRequestSchema.parse(request).requestId, 'checkout-preview-request-1');
  });

  it('validates a well-formed checkout preview result', () => {
    const parsed = modules.schemas.shopifyCheckoutPreviewResultSchema.parse({
      requestId: 'checkout-preview-request-1',
      status: 'preview-ready',
      adapterMode: 'mock',
      urlPreview: { checkoutUrlPreview: 'https://example.test/checkout-url-preview', cartId: 'mock-cart-1', currencyCode: 'USD', estimatedTotal: { amount: 1000, currencyCode: 'USD' }, lineCount: 1, ready: true },
      blockers: [],
      warnings: [],
      errors: [],
      checkoutRedirectDisabled: true,
    });
    assert.equal(parsed.status, 'preview-ready');
    assert.equal(parsed.checkoutRedirectDisabled, true);
  });

  it('accepts the storefront issue category on blockers/warnings', () => {
    const parsed = modules.schemas.shopifyCheckoutPreviewBlockerSchema.parse({ code: 'checkout-preview.storefront-cart-unavailable', category: 'storefront', message: 'unavailable' });
    assert.equal(parsed.category, 'storefront');
  });

  it('rejects a result missing checkoutRedirectDisabled: true', () => {
    assert.throws(() => modules.schemas.shopifyCheckoutPreviewResultSchema.parse({
      requestId: 'checkout-preview-request-1',
      status: 'blocked',
      adapterMode: 'unavailable',
      urlPreview: null,
      blockers: [],
      warnings: [],
      errors: [],
      checkoutRedirectDisabled: false,
    }));
  });
});

describe('Shopify Checkout URL Preview adapters', () => {
  it('mockShopifyCheckoutPreviewAdapter resolves a deterministic preview when there are no blockers and the Storefront cart is ready', async () => {
    const { mockShopifyCheckoutPreviewAdapter } = modules.adapters;
    const storefrontCheckoutPreview = { checkoutUrlPreview: 'https://mock-storefront.example/checkout-preview/req-1', cartId: 'mock-cart-req-1', currencyCode: 'USD', estimatedTotal: { amount: 1000, currencyCode: 'USD' }, lineCount: 1, ready: true };

    const output = await mockShopifyCheckoutPreviewAdapter.execute({ requestId: 'req-1', hasBlockers: false, storefrontCheckoutPreview });

    assert.equal(output.status, 'preview-ready');
    assert.equal(output.urlPreview.checkoutUrlPreview, storefrontCheckoutPreview.checkoutUrlPreview);
    assert.equal(output.urlPreview.ready, true);
    assert.equal(output.errors.length, 0);
  });

  it('mockShopifyCheckoutPreviewAdapter reports blocked when there are blockers', async () => {
    const { mockShopifyCheckoutPreviewAdapter } = modules.adapters;
    const output = await mockShopifyCheckoutPreviewAdapter.execute({ requestId: 'req-2', hasBlockers: true, storefrontCheckoutPreview: null });

    assert.equal(output.status, 'blocked');
    assert.equal(output.urlPreview, null);
  });

  it('unavailableShopifyCheckoutPreviewAdapter returns adapter-unavailable with no preview', async () => {
    const { unavailableShopifyCheckoutPreviewAdapter } = modules.adapters;
    const output = await unavailableShopifyCheckoutPreviewAdapter.execute({ requestId: 'req-3', hasBlockers: false, storefrontCheckoutPreview: null });

    assert.equal(output.status, 'adapter-unavailable');
    assert.equal(output.urlPreview, null);
    assert.equal(output.errors[0].code, 'adapter-unavailable');
  });

  it('liveShopifyCheckoutPreviewAdapter never calls Shopify and always reports live-calls-disabled', async () => {
    const { createLiveShopifyCheckoutPreviewAdapter } = modules.adapters;
    const liveAdapter = createLiveShopifyCheckoutPreviewAdapter();

    const output = await liveAdapter.execute({
      requestId: 'req-4',
      hasBlockers: false,
      storefrontCheckoutPreview: null,
      config: { storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token-abc' },
    });

    assert.equal(output.status, 'failed');
    assert.equal(output.errors[0].code, 'live-calls-disabled');
    assert.equal(output.errors[0].retryable, false);
    assert.equal(output.metadata.attributes.configured, true);
  });
});

describe('Shopify Checkout URL Preview service orchestration', () => {
  it('generates a checkout URL preview when the cart is ready and the Storefront cart is ready (mock adapters)', async () => {
    const { createShopifyCheckoutPreviewService } = modules.service;
    const { mockShopifyCheckoutPreviewAdapter } = modules.adapters;

    const lines = [baseLine()];
    const { checkoutPreparation, storefrontCart } = buildDependencies({ lines, commerce: 'ready', storefrontCartAdapter: 'mock' });
    const service = createShopifyCheckoutPreviewService(mockShopifyCheckoutPreviewAdapter, fakeCartWorkspaceService(lines), checkoutPreparation, storefrontCart);

    const result = await service.previewCheckout(lines);

    assert.equal(result.status, 'preview-ready');
    assert.equal(result.adapterMode, 'mock');
    assert.ok(result.urlPreview);
    assert.match(result.urlPreview.checkoutUrlPreview, /^https:\/\//);
    assert.equal(result.blockers.length, 0);
    assert.equal(result.checkoutRedirectDisabled, true);
  });

  it('reports a missing-cart blocker for an empty cart (reused from checkoutPreparationService)', async () => {
    const { createShopifyCheckoutPreviewService } = modules.service;
    const { mockShopifyCheckoutPreviewAdapter } = modules.adapters;

    const { checkoutPreparation, storefrontCart } = buildDependencies({ lines: [], commerce: 'ready', storefrontCartAdapter: 'mock' });
    const service = createShopifyCheckoutPreviewService(mockShopifyCheckoutPreviewAdapter, fakeCartWorkspaceService([]), checkoutPreparation, storefrontCart);

    const result = await service.previewCheckout([]);

    assert.equal(result.status, 'blocked');
    assert.ok(result.blockers.some((blocker) => blocker.code === 'checkout.cart-empty'));
    assert.equal(result.urlPreview, null);
  });

  it('reports a missing-storefront-cart blocker when the Storefront cart adapter is unavailable', async () => {
    const { createShopifyCheckoutPreviewService } = modules.service;
    const { mockShopifyCheckoutPreviewAdapter } = modules.adapters;

    const lines = [baseLine()];
    const { checkoutPreparation, storefrontCart } = buildDependencies({ lines, commerce: 'ready', storefrontCartAdapter: 'unavailable' });
    const service = createShopifyCheckoutPreviewService(mockShopifyCheckoutPreviewAdapter, fakeCartWorkspaceService(lines), checkoutPreparation, storefrontCart);

    const result = await service.previewCheckout(lines);

    assert.equal(result.status, 'blocked');
    assert.ok(result.blockers.some((blocker) => blocker.code === 'checkout-preview.storefront-cart-unavailable' && blocker.category === 'storefront'));
    assert.equal(result.urlPreview, null);
  });

  it('reports capability metadata reflecting the injected adapter', () => {
    const { createShopifyCheckoutPreviewService } = modules.service;
    const { mockShopifyCheckoutPreviewAdapter, unavailableShopifyCheckoutPreviewAdapter, liveShopifyCheckoutPreviewAdapter } = modules.adapters;

    assert.equal(createShopifyCheckoutPreviewService().getCapabilities().adapterMode, 'unavailable');
    assert.equal(createShopifyCheckoutPreviewService(mockShopifyCheckoutPreviewAdapter).getCapabilities().adapterMode, 'mock');
    assert.equal(createShopifyCheckoutPreviewService(liveShopifyCheckoutPreviewAdapter).getCapabilities().adapterMode, 'live');
    assert.equal(createShopifyCheckoutPreviewService().getCapabilities().liveCallsEnabled, false);
    assert.equal(createShopifyCheckoutPreviewService().getCapabilities().checkoutRedirectDisabled, true);
  });

  it('never calls Shopify by default (unavailable adapter)', async () => {
    const { createShopifyCheckoutPreviewService } = modules.service;

    const lines = [baseLine()];
    const { checkoutPreparation, storefrontCart } = buildDependencies({ lines, commerce: 'ready', storefrontCartAdapter: 'mock' });
    const service = createShopifyCheckoutPreviewService(undefined, fakeCartWorkspaceService(lines), checkoutPreparation, storefrontCart);

    const result = await service.previewCheckout(lines);

    assert.equal(result.status, 'adapter-unavailable');
    assert.equal(result.urlPreview, null);
    assert.equal(result.errors[0].code, 'adapter-unavailable');
    assert.equal(result.checkoutRedirectDisabled, true);
  });

  it('previewCheckout() reads the live Cart Workspace state when no explicit lines are supplied', async () => {
    const { createShopifyCheckoutPreviewService } = modules.service;
    const { mockShopifyCheckoutPreviewAdapter } = modules.adapters;

    const lines = [baseLine({ id: 'preview-line' })];
    const { checkoutPreparation, storefrontCart } = buildDependencies({ lines, commerce: 'ready', storefrontCartAdapter: 'mock' });
    const service = createShopifyCheckoutPreviewService(mockShopifyCheckoutPreviewAdapter, fakeCartWorkspaceService(lines), checkoutPreparation, storefrontCart);

    const result = await service.previewCheckout();

    assert.equal(result.status, 'preview-ready');
  });
});

describe('Shopify Checkout URL Preview hooks', () => {
  it('exposes useShopifyCheckoutPreview', () => {
    assert.equal(typeof modules.hooks.useShopifyCheckoutPreview, 'function');
  });

  it('useShopifyCheckoutPreview does not require a live network call to render', () => {
    const { useShopifyCheckoutPreview } = modules.hooks;

    function HookProbe() {
      const state = useShopifyCheckoutPreview();
      return React.createElement('span', {
        'data-loading': String(Boolean(state.loading)),
        'data-has-result': String(Boolean(state.result)),
      });
    }

    const markup = renderToString(React.createElement(HookProbe));
    assert.match(markup, /data-loading="(true|false)"/);
  });
});
