import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let modules;

function baseCartResult(overrides = {}) {
  return {
    requestId: 'storefront-cart-request-1',
    status: 'failed',
    cartLines: [],
    lineCount: 0,
    mutationPreview: null,
    checkoutPreview: null,
    errors: [],
    ...overrides,
  };
}

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    outcome: await server.ssrLoadModule('/src/services/shopifyStorefrontCart/shopifyStorefrontCheckoutOutcome.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifyStorefrontCart/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('resolveShopifyCheckoutOutcome', () => {
  it('redirects to the real checkoutUrl on a succeeded result', () => {
    const { resolveShopifyCheckoutOutcome } = modules.outcome;
    const result = baseCartResult({
      status: 'succeeded',
      errors: [],
      checkoutPreview: {
        checkoutUrlPreview: 'https://acme-trucks.myshopify.com/cart/c/real-cart-1',
        cartId: 'gid://shopify/Cart/real-cart-1',
        currencyCode: 'USD',
        estimatedTotal: { amount: 200, currencyCode: 'USD' },
        lineCount: 1,
        ready: true,
      },
    });

    const outcome = resolveShopifyCheckoutOutcome(result);
    assert.equal(outcome.type, 'redirect');
    assert.equal(outcome.checkoutUrl, 'https://acme-trucks.myshopify.com/cart/c/real-cart-1');
  });

  it('reports a clear no-valid-lines message and does not redirect when every line is unmapped', () => {
    const { resolveShopifyCheckoutOutcome } = modules.outcome;
    const result = baseCartResult({
      status: 'failed',
      cartLines: [{ cartLineId: 'cart-line-1', sku: 'SKU-1', quantity: 1, merchandiseId: null, merchandiseAvailable: false }],
      errors: [{ code: 'unmapped-line', message: 'None of the items in this cart have a matching Shopify product variant yet; no cartCreate call was made.', retryable: false }],
    });

    const outcome = resolveShopifyCheckoutOutcome(result);
    assert.equal(outcome.type, 'no-valid-lines');
    assert.match(outcome.message, /checkout-ready/);
  });

  it('redirects with a warning notice when the cart is mixed (some lines mapped, some not)', () => {
    const { resolveShopifyCheckoutOutcome } = modules.outcome;
    const result = baseCartResult({
      status: 'succeeded',
      errors: [],
      cartLines: [
        { cartLineId: 'cart-line-1', sku: 'SKU-MAPPED', quantity: 1, merchandiseId: 'gid://shopify/ProductVariant/mapped', merchandiseAvailable: true },
        { cartLineId: 'cart-line-2', sku: 'SKU-UNMAPPED', quantity: 1, merchandiseId: null, merchandiseAvailable: false },
      ],
      checkoutPreview: {
        checkoutUrlPreview: 'https://acme-trucks.myshopify.com/cart/c/mixed-1',
        cartId: 'gid://shopify/Cart/mixed-1',
        currencyCode: 'USD',
        estimatedTotal: { amount: 100, currencyCode: 'USD' },
        lineCount: 1,
        ready: true,
      },
    });

    const outcome = resolveShopifyCheckoutOutcome(result);
    assert.equal(outcome.type, 'redirect');
    assert.equal(outcome.checkoutUrl, 'https://acme-trucks.myshopify.com/cart/c/mixed-1');
    assert.match(outcome.warning, /1 item/);
  });

  it('redirects without a warning when every line in the cart is mapped', () => {
    const { resolveShopifyCheckoutOutcome } = modules.outcome;
    const result = baseCartResult({
      status: 'succeeded',
      errors: [],
      cartLines: [
        { cartLineId: 'cart-line-1', sku: 'SKU-A', quantity: 1, merchandiseId: 'gid://shopify/ProductVariant/a', merchandiseAvailable: true },
        { cartLineId: 'cart-line-2', sku: 'SKU-B', quantity: 1, merchandiseId: 'gid://shopify/ProductVariant/b', merchandiseAvailable: true },
      ],
      checkoutPreview: {
        checkoutUrlPreview: 'https://acme-trucks.myshopify.com/cart/c/all-valid-1',
        cartId: 'gid://shopify/Cart/all-valid-1',
        currencyCode: 'USD',
        estimatedTotal: { amount: 200, currencyCode: 'USD' },
        lineCount: 2,
        ready: true,
      },
    });

    const outcome = resolveShopifyCheckoutOutcome(result);
    assert.equal(outcome.type, 'redirect');
    assert.equal(outcome.warning, undefined);
  });

  it('reports a clear configuration-error message when Storefront env vars are missing', () => {
    const { resolveShopifyCheckoutOutcome } = modules.outcome;
    const result = baseCartResult({
      errors: [{ code: 'configuration-error', message: 'Live Shopify Storefront cart creation requires both a store domain and a Storefront access token.', retryable: false }],
    });

    const outcome = resolveShopifyCheckoutOutcome(result);
    assert.equal(outcome.type, 'configuration-error');
    assert.match(outcome.message, /VITE_SHOPIFY_STORE_DOMAIN/);
    assert.match(outcome.message, /VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN/);
  });

  it('reports a clear message for a Shopify userErrors / GraphQL-level failure', () => {
    const { resolveShopifyCheckoutOutcome } = modules.outcome;
    const result = baseCartResult({
      errors: [{ code: 'shopify-error', message: 'Merchandise is out of stock.', retryable: false }],
    });

    const outcome = resolveShopifyCheckoutOutcome(result);
    assert.equal(outcome.type, 'shopify-error');
    assert.match(outcome.message, /out of stock/);
  });

  it('reports a clear message for a network failure', () => {
    const { resolveShopifyCheckoutOutcome } = modules.outcome;
    const result = baseCartResult({
      errors: [{ code: 'network-error', message: 'network down', retryable: true }],
    });

    const outcome = resolveShopifyCheckoutOutcome(result);
    assert.equal(outcome.type, 'network-error');
    assert.match(outcome.message, /network down/);
  });

  it('falls back to a generic error message for any other failure code', () => {
    const { resolveShopifyCheckoutOutcome } = modules.outcome;
    const result = baseCartResult({ errors: [{ code: 'unknown', message: 'Something unexpected happened.', retryable: false }] });

    const outcome = resolveShopifyCheckoutOutcome(result);
    assert.equal(outcome.type, 'error');
    assert.match(outcome.message, /unexpected/);
  });

  it('never treats a succeeded status with no checkoutUrl as a redirect', () => {
    const { resolveShopifyCheckoutOutcome } = modules.outcome;
    const result = baseCartResult({ status: 'succeeded', checkoutPreview: null, errors: [] });

    const outcome = resolveShopifyCheckoutOutcome(result);
    assert.notEqual(outcome.type, 'redirect');
  });
});

describe('useShopifyStorefrontCartCreate', () => {
  it('exposes a createCart entry point and starts with no result', () => {
    const { useShopifyStorefrontCartCreate } = modules.hooks;
    assert.equal(typeof useShopifyStorefrontCartCreate, 'function');

    function HookProbe() {
      const state = useShopifyStorefrontCartCreate();
      return React.createElement('span', {
        'data-loading': String(Boolean(state.loading)),
        'data-has-result': String(Boolean(state.result)),
        'data-has-create-fn': String(typeof state.createCart === 'function'),
      });
    }

    const markup = renderToString(React.createElement(HookProbe));
    assert.match(markup, /data-loading="false"/);
    assert.match(markup, /data-has-result="false"/);
    assert.match(markup, /data-has-create-fn="true"/);
  });
});
