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
    resolverService: await server.ssrLoadModule('/src/services/shopifyVariantResolver/shopifyVariantResolverService.ts'),
    resolverHook: await server.ssrLoadModule('/src/hooks/shopifyVariantResolver/useShopifyVariantResolver.ts'),
    commerceLookup: await server.ssrLoadModule('/src/services/commerceLookupService.ts'),
  };
});

after(async () => {
  await server?.close();
});

// A real SKU from the Shopify export index (src/data/shopify/shopify-variant-index.json):
// has a catalog price but no collected Shopify variant GID yet — the common
// pre-GID-collection state this whole layer is built to represent honestly.
const KNOWN_SKU = '8200SM8-A-42';
const UNKNOWN_SKU = 'DOES-NOT-EXIST-000';

describe('shopifyVariantResolverService.resolveFromCatalog (Shopify-export fallback)', () => {
  it('resolves a known SKU with a catalog price but no variant GID as price_only, cart-disabled', () => {
    const { resolveFromCatalog } = modules.resolverService;
    const { lookupSku } = modules.commerceLookup;
    const catalogEntry = lookupSku(KNOWN_SKU);

    const resolution = resolveFromCatalog(KNOWN_SKU);

    assert.equal(resolution.sku, KNOWN_SKU);
    assert.equal(resolution.shopifyVariantId, null);
    assert.equal(resolution.price, catalogEntry.price);
    assert.equal(resolution.status, 'price_only');
    assert.equal(resolution.canAddToCart, false);
    assert.equal(resolution.source, 'shopify-export');
    assert.match(resolution.reviewFlag, /Shopify variant ID pending/);
  });

  it('resolves an unknown SKU as unmatched, cart-disabled, with an honest review flag', () => {
    const { resolveFromCatalog } = modules.resolverService;

    const resolution = resolveFromCatalog(UNKNOWN_SKU);

    assert.equal(resolution.shopifyVariantId, null);
    assert.equal(resolution.price, null);
    assert.equal(resolution.status, 'unmatched');
    assert.equal(resolution.canAddToCart, false);
    assert.equal(resolution.availability, 'unknown');
    assert.match(resolution.reviewFlag, /not found/);
  });
});

describe('createShopifyVariantResolverService (Commerce Foundation composition)', () => {
  it('falls back to the catalog resolution when the Commerce Foundation adapter is unavailable (default)', async () => {
    const { shopifyVariantResolverService, resolveFromCatalog } = modules.resolverService;

    const live = await shopifyVariantResolverService.resolveLive(KNOWN_SKU);
    assert.equal(live, null);

    const resolved = await shopifyVariantResolverService.resolve(KNOWN_SKU);
    assert.deepEqual(resolved, resolveFromCatalog(KNOWN_SKU));
  });

  it('prefers a ready live Commerce Foundation mapping over the catalog fallback', async () => {
    const { createShopifyVariantResolverService } = modules.resolverService;

    const mockCommerce = {
      async getShopifyProduct() { return { status: 'ready', data: null }; },
      async getShopifyVariant() { return { status: 'ready', data: null }; },
      async getVariantMapping(sku) {
        return {
          status: 'ready',
          data: { sku, shopifyVariantId: 'gid://shopify/ProductVariant/1', price: { amount: 199, currencyCode: 'USD' } },
        };
      },
      async prepareCartLine() { return { status: 'ready', data: null }; },
    };
    const service = createShopifyVariantResolverService(mockCommerce);

    const live = await service.resolveLive(KNOWN_SKU);
    assert.equal(live.shopifyVariantId, 'gid://shopify/ProductVariant/1');
    assert.equal(live.price, 199);
    assert.equal(live.status, 'matched');
    assert.equal(live.canAddToCart, true);
    assert.equal(live.source, 'commerce-foundation');

    const resolved = await service.resolve(KNOWN_SKU);
    assert.equal(resolved.source, 'commerce-foundation');
    assert.equal(resolved.canAddToCart, true);
  });

  it('treats a non-ready live mapping the same as no mapping', async () => {
    const { createShopifyVariantResolverService, resolveFromCatalog } = modules.resolverService;

    const service = createShopifyVariantResolverService({
      async getShopifyProduct() { return { status: 'pending', data: null }; },
      async getShopifyVariant() { return { status: 'pending', data: null }; },
      async getVariantMapping() { return { status: 'pending', data: null }; },
      async prepareCartLine() { return { status: 'pending', data: null }; },
    });

    const live = await service.resolveLive(KNOWN_SKU);
    assert.equal(live, null);

    const resolved = await service.resolve(KNOWN_SKU);
    assert.deepEqual(resolved, resolveFromCatalog(KNOWN_SKU));
  });
});

describe('resolveCartLineDraft (checkout preparation ↔ Shopify Variant Resolver bridge)', () => {
  it('is checkout-ready — resolves to a ready CartLineDraft carrying the Shopify Variant GID — once the resolver reports a mapped variant', async () => {
    const { resolveCartLineDraft, createShopifyVariantResolverService } = modules.resolverService;

    const resolver = createShopifyVariantResolverService({
      async getShopifyProduct() { return { status: 'ready', data: null }; },
      async getShopifyVariant() { return { status: 'ready', data: null }; },
      async getVariantMapping(sku) {
        return { status: 'ready', data: { sku, shopifyVariantId: 'gid://shopify/ProductVariant/999', price: { amount: 249, currencyCode: 'USD' } } };
      },
    });

    const result = await resolveCartLineDraft('MAPPED-SKU', 3, resolver);

    assert.equal(result.status, 'ready');
    assert.equal(result.data.sku, 'MAPPED-SKU');
    assert.equal(result.data.quantity, 3);
    assert.equal(result.data.variantMapping.shopifyVariantId, 'gid://shopify/ProductVariant/999');
    assert.equal(result.data.variantMapping.shopifyVariantGid, 'gid://shopify/ProductVariant/999');
    assert.equal(result.data.variantMapping.price.amount, 249);
  });

  it('remains honestly blocked (pending, null data) for a real catalog SKU that has a price but no Shopify Variant GID yet', async () => {
    const { resolveCartLineDraft } = modules.resolverService;

    // Default singleton resolver — the Commerce Foundation adapter is
    // unavailable, so this falls back to the catalog, which has no
    // committed GID for this SKU yet (see resolveFromCatalog test above).
    const result = await resolveCartLineDraft(KNOWN_SKU, 1);

    assert.equal(result.status, 'pending');
    assert.equal(result.data, null);
    assert.match(result.message, /Shopify variant ID pending/);
  });

  it('remains honestly blocked (pending, null data) for a SKU that does not exist in the catalog at all', async () => {
    const { resolveCartLineDraft } = modules.resolverService;

    const result = await resolveCartLineDraft(UNKNOWN_SKU, 1);

    assert.equal(result.status, 'pending');
    assert.equal(result.data, null);
    assert.match(result.message, /not found/);
  });
});

describe('useShopifyVariantResolver (React hook)', () => {
  function ResolverProbe({ sku }) {
    const { useShopifyVariantResolver } = modules.resolverHook;
    const { resolution, loading, error } = useShopifyVariantResolver(sku);
    return React.createElement('span', {
      'data-sku': resolution?.sku ?? '',
      'data-variant-id': resolution?.shopifyVariantId ?? '',
      'data-can-add-to-cart': String(Boolean(resolution?.canAddToCart)),
      'data-status': resolution?.status ?? '',
      'data-loading': String(loading),
      'data-has-error': String(Boolean(error)),
    });
  }

  it('resolves to null with no SKU', () => {
    const html = renderToString(React.createElement(ResolverProbe, { sku: null }));
    assert.match(html, /data-sku=""/);
    assert.match(html, /data-loading="false"/);
  });

  it('resolves synchronously from the catalog fallback on first render (no loading flash)', () => {
    const { resolveFromCatalog } = modules.resolverService;
    const expected = resolveFromCatalog(KNOWN_SKU);

    const html = renderToString(React.createElement(ResolverProbe, { sku: KNOWN_SKU }));

    assert.match(html, new RegExp(`data-sku="${KNOWN_SKU}"`));
    assert.match(html, /data-variant-id=""/);
    assert.match(html, /data-can-add-to-cart="false"/);
    assert.match(html, new RegExp(`data-status="${expected.status}"`));
  });
});
