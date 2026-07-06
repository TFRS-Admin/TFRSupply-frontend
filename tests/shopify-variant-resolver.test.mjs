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

// A real SKU from the Shopify export index (src/data/shopify/shopify-variant-index.json).
// The committed export is now a Matrixify export with a populated Variant ID
// column on every row, so this SKU carries a real, activated Shopify Variant
// GID — the resolver reports it matched and cart-enabled.
const KNOWN_SKU = '8200SM8-A-42';
const UNKNOWN_SKU = 'DOES-NOT-EXIST-000';

describe('shopifyVariantResolverService.resolveFromCatalog (Shopify-export fallback)', () => {
  it('resolves a known SKU with a catalog price and an activated variant GID as matched, cart-enabled', () => {
    const { resolveFromCatalog } = modules.resolverService;
    const { lookupSku } = modules.commerceLookup;
    const catalogEntry = lookupSku(KNOWN_SKU);

    const resolution = resolveFromCatalog(KNOWN_SKU);

    assert.equal(resolution.sku, KNOWN_SKU);
    assert.match(resolution.shopifyVariantId, /^gid:\/\/shopify\/ProductVariant\/\d+$/);
    assert.equal(resolution.shopifyVariantId, catalogEntry.shopifyVariantId);
    assert.equal(resolution.price, catalogEntry.price);
    assert.equal(resolution.status, 'matched');
    assert.equal(resolution.canAddToCart, true);
    assert.equal(resolution.source, 'shopify-export');
    assert.equal(resolution.reviewFlag, null);
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

  it('remains honestly blocked (pending, null data) when the resolver reports a price but no Shopify Variant GID yet', async () => {
    const { resolveCartLineDraft } = modules.resolverService;

    // Every SKU in the committed catalog now carries an activated Variant
    // GID (see resolveFromCatalog test above), so the pre-GID-collection
    // "price_only" state is exercised here via a controlled resolver stub
    // rather than a real catalog SKU — this is exactly the seam
    // `resolveCartLineDraft`'s injectable `resolver` param exists for.
    const pendingResolver = {
      async resolve(sku) {
        return {
          sku, shopifyVariantId: null, shopifyProductId: null, price: 129, currency: 'USD',
          availability: 'unknown', status: 'price_only', canAddToCart: false,
          reviewFlag: 'Shopify variant ID pending — quote only, checkout disabled', source: 'shopify-export',
        };
      },
    };

    const result = await resolveCartLineDraft('PENDING-GID-SKU', 1, pendingResolver);

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
    assert.match(html, new RegExp(`data-variant-id="${expected.shopifyVariantId}"`));
    assert.match(html, new RegExp(`data-can-add-to-cart="${String(expected.canAddToCart)}"`));
    assert.match(html, new RegExp(`data-status="${expected.status}"`));
  });
});
