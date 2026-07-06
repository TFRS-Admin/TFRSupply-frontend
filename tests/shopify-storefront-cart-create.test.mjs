import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
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

function fakeCartWorkspaceService(lines) {
  return {
    async getState() {
      return { lines, summary: { itemCount: lines.length, lineCount: lines.length, currencyCode: 'USD', subtotal: { amount: 0, currencyCode: 'USD' }, estimatedShipping: null, estimatedTax: null, grandTotalEstimate: { amount: 0, currencyCode: 'USD' } } };
    },
    subscribe() { return () => {}; },
  };
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
    createService: await server.ssrLoadModule('/src/services/shopifyStorefrontCart/shopifyStorefrontCartCreateService.ts'),
    commerceService: await server.ssrLoadModule('/src/services/commerce/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Shopify Storefront cart creation — credential parsing', () => {
  it('reads store domain and access token from env, defaulting the API version', () => {
    const credentials = modules.createService.readCartCreateCredentials({
      VITE_SHOPIFY_STORE_DOMAIN: 'acme-trucks.myshopify.com',
      VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN: 'shpat_public_token',
    });
    assert.deepEqual(credentials, {
      storeDomain: 'acme-trucks.myshopify.com',
      storefrontAccessToken: 'shpat_public_token',
      apiVersion: '2024-10',
    });
  });

  it('treats missing or blank env vars as unset', () => {
    const credentials = modules.createService.readCartCreateCredentials({});
    assert.equal(credentials.storeDomain, null);
    assert.equal(credentials.storefrontAccessToken, null);

    const blank = modules.createService.readCartCreateCredentials({ VITE_SHOPIFY_STORE_DOMAIN: '   ', VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN: '' });
    assert.equal(blank.storeDomain, null);
    assert.equal(blank.storefrontAccessToken, null);
  });

  it('honors an explicit API version override', () => {
    const credentials = modules.createService.readCartCreateCredentials({
      VITE_SHOPIFY_STORE_DOMAIN: 'acme.myshopify.com',
      VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN: 'token',
      VITE_SHOPIFY_STOREFRONT_API_VERSION: '2025-01',
    });
    assert.equal(credentials.apiVersion, '2025-01');
  });
});

describe('Shopify Storefront cart creation — isConfigured', () => {
  it('is false when either the store domain or the access token is missing', () => {
    const { isConfigured } = modules.createService.createShopifyStorefrontCartCreateService();
    assert.equal(isConfigured({ storeDomain: null, storefrontAccessToken: null, apiVersion: '2024-10' }), false);
    assert.equal(isConfigured({ storeDomain: 'acme.myshopify.com', storefrontAccessToken: null, apiVersion: '2024-10' }), false);
    assert.equal(isConfigured({ storeDomain: null, storefrontAccessToken: 'token', apiVersion: '2024-10' }), false);
    assert.equal(isConfigured({ storeDomain: 'acme.myshopify.com', storefrontAccessToken: 'token', apiVersion: '2024-10' }), true);
  });
});

describe('Shopify Storefront cart creation — createCart() success', () => {
  it('creates a real Shopify cart from the resolved Cart Workspace lines and returns the real cart id and checkoutUrl', async () => {
    const { createShopifyStorefrontCartCreateService } = modules.createService;
    const { createCommerceService } = modules.commerceService;

    const lines = [baseLine()];
    const fetchImpl = fakeFetch([jsonResponse({
      data: { cartCreate: { cart: { id: 'gid://shopify/Cart/real-1', checkoutUrl: 'https://acme-trucks.myshopify.com/cart/c/real-1' }, userErrors: [] } },
    })]);

    const service = createShopifyStorefrontCartCreateService(fakeCartWorkspaceService(lines), readyCommerceService(createCommerceService));
    const result = await service.createCart(undefined, {
      credentials: { storeDomain: 'acme-trucks.myshopify.com', storefrontAccessToken: 'shpat_public_token', apiVersion: '2024-10' },
      fetchImpl,
    });

    assert.equal(result.status, 'succeeded');
    assert.equal(result.errors.length, 0);
    assert.equal(result.checkoutPreview.cartId, 'gid://shopify/Cart/real-1');
    assert.equal(result.checkoutPreview.checkoutUrlPreview, 'https://acme-trucks.myshopify.com/cart/c/real-1');
    assert.equal(result.cartLines[0].merchandiseId, 'gid://shopify/ProductVariant/SKU-1');
    assert.equal(fetchImpl.calls.length, 1);
    assert.match(fetchImpl.calls[0].url, /^https:\/\/acme-trucks\.myshopify\.com\/api\/2024-10\/graphql\.json$/);
  });

  it('accepts explicit cart lines instead of reading Cart Workspace state', async () => {
    const { createShopifyStorefrontCartCreateService } = modules.createService;
    const { createCommerceService } = modules.commerceService;

    const fetchImpl = fakeFetch([jsonResponse({
      data: { cartCreate: { cart: { id: 'gid://shopify/Cart/real-2', checkoutUrl: 'https://acme-trucks.myshopify.com/cart/c/real-2' }, userErrors: [] } },
    })]);
    const service = createShopifyStorefrontCartCreateService(fakeCartWorkspaceService([]), readyCommerceService(createCommerceService));

    const result = await service.createCart([baseLine({ id: 'explicit-line' })], {
      credentials: { storeDomain: 'acme-trucks.myshopify.com', storefrontAccessToken: 'shpat_public_token', apiVersion: '2024-10' },
      fetchImpl,
    });

    assert.equal(result.status, 'succeeded');
    assert.equal(result.cartLines[0].cartLineId, 'explicit-line');
  });
});

describe('Shopify Storefront cart creation — missing-credential failure', () => {
  it('fails gracefully and never calls fetch when both env vars are missing', async () => {
    const { createShopifyStorefrontCartCreateService } = modules.createService;
    const { createCommerceService } = modules.commerceService;

    const lines = [baseLine()];
    const fetchImpl = fakeFetch([]);
    const service = createShopifyStorefrontCartCreateService(fakeCartWorkspaceService(lines), readyCommerceService(createCommerceService));

    const result = await service.createCart(undefined, {
      credentials: { storeDomain: null, storefrontAccessToken: null, apiVersion: '2024-10' },
      fetchImpl,
    });

    assert.equal(result.status, 'failed');
    assert.equal(result.errors[0].code, 'configuration-error');
    assert.match(result.errors[0].message, /VITE_SHOPIFY_STORE_DOMAIN/);
    assert.match(result.errors[0].message, /VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN/);
    assert.equal(result.checkoutPreview, null);
    assert.equal(fetchImpl.calls.length, 0);
  });

  it('fails gracefully when only the access token is missing', async () => {
    const { createShopifyStorefrontCartCreateService } = modules.createService;
    const { createCommerceService } = modules.commerceService;

    const lines = [baseLine()];
    const fetchImpl = fakeFetch([]);
    const service = createShopifyStorefrontCartCreateService(fakeCartWorkspaceService(lines), readyCommerceService(createCommerceService));

    const result = await service.createCart(undefined, {
      credentials: { storeDomain: 'acme-trucks.myshopify.com', storefrontAccessToken: null, apiVersion: '2024-10' },
      fetchImpl,
    });

    assert.equal(result.status, 'failed');
    assert.equal(result.errors[0].code, 'configuration-error');
    assert.equal(fetchImpl.calls.length, 0);
  });

  it('never throws when credentials are missing — resolves to a failed result instead', async () => {
    const { createShopifyStorefrontCartCreateService } = modules.createService;
    const { createCommerceService } = modules.commerceService;

    const service = createShopifyStorefrontCartCreateService(fakeCartWorkspaceService([baseLine()]), readyCommerceService(createCommerceService));

    await assert.doesNotReject(() => service.createCart(undefined, { credentials: { storeDomain: null, storefrontAccessToken: null, apiVersion: '2024-10' }, fetchImpl: fakeFetch([]) }));
  });
});
