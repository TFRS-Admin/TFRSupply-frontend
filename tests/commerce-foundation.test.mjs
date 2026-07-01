import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    commerce: await server.ssrLoadModule('/src/services/commerce/commerceService.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/commerce/useCommerce.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/commerce.schema.ts'),
  };
});

after(async () => {
  await server?.close();
});

function renderCommerceHookProbe(useHook, ...args) {
  function HookProbe() {
    const state = useHook(...args);
    return React.createElement('span', {
      'data-loading': String(state.loading),
      'data-has-data': String(Boolean(state.data)),
      'data-has-result': String(Boolean(state.result)),
      'data-has-error': String(Boolean(state.error)),
    });
  }

  return renderToString(React.createElement(HookProbe));
}

describe('commerceService foundation', () => {
  it('returns pending lookup results until a Shopify adapter is connected', async () => {
    const { commerceService } = modules.commerce;

    const product = await commerceService.getShopifyProduct('navigator');
    const variant = await commerceService.getShopifyVariant('NVG-SKU');
    const mapping = await commerceService.getVariantMapping('NVG-SKU');
    const cartLine = await commerceService.prepareCartLine('NVG-SKU', 1);

    assert.equal(product.status, 'pending');
    assert.equal(product.data, null);
    assert.equal(variant.status, 'pending');
    assert.equal(mapping.status, 'pending');
    assert.equal(cartLine.status, 'pending');
    assert.equal(cartLine.data, null);
  });

  it('creates cart-line drafts from injected ready mappings without checkout side effects', async () => {
    const { createCommerceService } = modules.commerce;
    const service = createCommerceService({
      async getProduct() {
        return { status: 'not-found', data: null };
      },
      async getVariant() {
        return { status: 'not-found', data: null };
      },
      async getVariantMapping() {
        return {
          status: 'ready',
          data: {
            sku: 'NVG-SKU',
            shopifyVariantId: '123',
            channel: 'shopify',
          },
        };
      },
    });

    const result = await service.prepareCartLine('NVG-SKU', 2);

    assert.equal(result.status, 'ready');
    assert.equal(result.data?.sku, 'NVG-SKU');
    assert.equal(result.data?.quantity, 2);
    assert.equal(result.data?.variantMapping.shopifyVariantId, '123');
  });
});

describe('commerce schemas and hooks', () => {
  it('validates variant mappings with future Shopify identifiers', () => {
    const { variantMappingSchema } = modules.schemas;

    const parsed = variantMappingSchema.parse({
      sku: 'NVG-SKU',
      shopifyProductId: 'product-1',
      shopifyVariantId: 'variant-1',
      channel: 'shopify',
      optionValues: { length: '48' },
      productReference: { productId: 'navigator' },
    });

    assert.equal(parsed.productReference?.productId, 'navigator');
    assert.equal(parsed.optionValues?.length, '48');
  });

  it('exposes typed commerce hooks without requiring live commerce data', () => {
    const { useCommerceProduct, useCommerceVariant, useVariantMapping, useCartLineDraft } = modules.hooks;

    assert.match(renderCommerceHookProbe(useCommerceProduct, null), /data-loading="false"/);
    assert.match(renderCommerceHookProbe(useCommerceVariant, null), /data-has-data="false"/);
    assert.match(renderCommerceHookProbe(useVariantMapping, null), /data-has-result="false"/);
    assert.match(renderCommerceHookProbe(useCartLineDraft, null, 1), /data-has-error="false"/);
  });
});
