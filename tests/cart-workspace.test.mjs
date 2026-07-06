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
    service: await server.ssrLoadModule('/src/services/cartWorkspace/cartWorkspaceService.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/cartWorkspace/index.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/cartWorkspace/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/cartWorkspace.schema.ts'),
    commerceService: await server.ssrLoadModule('/src/services/commerce/commerceService.ts'),
    variantResolver: await server.ssrLoadModule('/src/services/shopifyVariantResolver/shopifyVariantResolverService.ts'),
  };
});

/**
 * Builds a `Pick<CommerceService, 'prepareCartLine'>` backed by a Shopify
 * Variant Resolver instance whose Commerce Foundation adapter is fully under
 * test control — the same seam ConfiguratorCommerceActions' canAddToCart
 * gate reads, so these tests prove the cart/checkout pipeline agrees with
 * the configurator instead of asserting against a hand-rolled fake shape.
 */
function resolverBackedCommerce(mappingBySku) {
  const { createShopifyVariantResolverService, resolveCartLineDraft } = modules.variantResolver;
  const resolver = createShopifyVariantResolverService({
    async getShopifyProduct() { return { status: 'ready', data: null }; },
    async getShopifyVariant() { return { status: 'ready', data: null }; },
    async getVariantMapping(sku) {
      const mapping = mappingBySku[sku];
      return mapping ? { status: 'ready', data: mapping } : { status: 'pending', data: null };
    },
  });
  return { prepareCartLine: (sku, quantity) => resolveCartLineDraft(sku, quantity, resolver) };
}

after(async () => {
  await server?.close();
});

function renderHookProbe(useHook, ...args) {
  function HookProbe() {
    const state = useHook(...args);
    return React.createElement('span', {
      'data-loading': String(Boolean(state.loading)),
      'data-has-data': String(Boolean(state.data)),
      'data-has-summary': String(Boolean(state.summary)),
      'data-has-error': String(Boolean(state.error)),
    });
  }
  return renderToString(React.createElement(HookProbe));
}

describe('cartWorkspaceService orchestration', () => {
  it('loads the seeded deterministic in-memory cart', async () => {
    const { createCartWorkspaceService } = modules.service;
    const { createMockCartWorkspaceAdapter } = modules.adapters;
    const service = createCartWorkspaceService(createMockCartWorkspaceAdapter());

    const state = await service.getState();

    assert.equal(state.lines.length, 3);
    assert.equal(state.summary.lineCount, 3);
    assert.equal(state.summary.itemCount, 4);
    assert.equal(state.summary.subtotal.amount, 5650);
    assert.equal(state.summary.grandTotalEstimate.amount, 5650);
    assert.equal(state.summary.estimatedShipping, null);
    assert.equal(state.summary.estimatedTax, null);
  });

  it('recalculates line and cart totals on quantity update', async () => {
    const { createCartWorkspaceService } = modules.service;
    const { createMockCartWorkspaceAdapter } = modules.adapters;
    const service = createCartWorkspaceService(createMockCartWorkspaceAdapter());

    const state = await service.updateQuantity('cart-line-1', 5);
    const line = state.lines.find((candidate) => candidate.id === 'cart-line-1');

    assert.equal(line.quantity, 5);
    assert.equal(line.lineTotal.amount, 5000);
    assert.equal(state.summary.subtotal.amount, 5000 + 450 + 3200);
  });

  it('removes a line item', async () => {
    const { createCartWorkspaceService } = modules.service;
    const { createMockCartWorkspaceAdapter } = modules.adapters;
    const service = createCartWorkspaceService(createMockCartWorkspaceAdapter());

    const state = await service.removeLine('cart-line-2');

    assert.equal(state.lines.length, 2);
    assert.ok(!state.lines.some((line) => line.id === 'cart-line-2'));
    assert.equal(state.summary.subtotal.amount, 2000 + 3200);
  });

  it('clears the cart', async () => {
    const { createCartWorkspaceService } = modules.service;
    const { createMockCartWorkspaceAdapter } = modules.adapters;
    const service = createCartWorkspaceService(createMockCartWorkspaceAdapter());

    const state = await service.clearCart();

    assert.equal(state.lines.length, 0);
    assert.equal(state.summary.itemCount, 0);
    assert.equal(state.summary.subtotal.amount, 0);
    assert.equal(state.summary.grandTotalEstimate.amount, 0);
  });

  it('flags backorder and incomplete-configuration lines without blocking cart validity', () => {
    const { validateCartLines } = modules.service;
    const { cartWorkspaceFixtureLines } = modules.adapters;

    const result = validateCartLines(cartWorkspaceFixtureLines);

    assert.equal(result.valid, true);
    assert.ok(result.issues.some((issue) => issue.code === 'cart.line-backorder'));
    assert.ok(result.issues.some((issue) => issue.code === 'cart.configuration-incomplete'));
  });

  it('flags unavailable lines and invalid quantities as blocking errors', () => {
    const { validateCartLines } = modules.service;
    const { cartWorkspaceFixtureLines } = modules.adapters;

    const brokenLines = [
      { ...cartWorkspaceFixtureLines[0], availability: 'unavailable' },
      { ...cartWorkspaceFixtureLines[1], quantity: 0 },
    ];

    const result = validateCartLines(brokenLines);

    assert.equal(result.valid, false);
    assert.ok(result.issues.some((issue) => issue.code === 'cart.line-unavailable' && issue.severity === 'error'));
    assert.ok(result.issues.some((issue) => issue.code === 'cart.invalid-quantity' && issue.severity === 'error'));
  });

  it('builds a pure summary from an arbitrary line list without adapter I/O', () => {
    const { buildCartSummary } = modules.service;

    const summary = buildCartSummary([
      { id: '1', unitPrice: { amount: 100, currencyCode: 'USD' }, lineTotal: { amount: 200, currencyCode: 'USD' }, quantity: 2 },
      { id: '2', unitPrice: { amount: 50, currencyCode: 'USD' }, lineTotal: { amount: 50, currencyCode: 'USD' }, quantity: 1 },
    ]);

    assert.equal(summary.itemCount, 3);
    assert.equal(summary.lineCount, 2);
    assert.equal(summary.subtotal.amount, 250);
    assert.equal(summary.grandTotalEstimate.amount, 250);
  });

  it('prepares a future checkout payload using the existing Commerce Foundation without calling a live Shopify API', async () => {
    const { createCartWorkspaceService } = modules.service;
    const { createMockCartWorkspaceAdapter } = modules.adapters;
    const { createCommerceService } = modules.commerceService;

    const readyCommerce = createCommerceService({
      async getProduct() { return { status: 'not-found', data: null }; },
      async getVariant() { return { status: 'not-found', data: null }; },
      async getVariantMapping(request) {
        return { status: 'ready', data: { sku: request.sku, shopifyVariantId: `variant-${request.sku}`, channel: 'shopify' } };
      },
    });

    const service = createCartWorkspaceService(createMockCartWorkspaceAdapter(), readyCommerce);
    const result = await service.prepareCheckout();

    assert.equal(result.status, 'ready');
    assert.equal(result.lines.length, 3);
    assert.ok(result.lines.every((line) => line.ready));
    assert.ok(result.lines.every((line) => line.cartLineDraft?.variantMapping.shopifyVariantId));
  });

  it('reports an incomplete checkout status by default — no Shopify Variant GID is committed yet for any fixture SKU', async () => {
    const { createCartWorkspaceService } = modules.service;
    const { createMockCartWorkspaceAdapter } = modules.adapters;

    const service = createCartWorkspaceService(createMockCartWorkspaceAdapter());
    const result = await service.prepareCheckout();

    assert.equal(result.status, 'incomplete');
    assert.ok(result.lines.every((line) => line.ready === false));
  });

  it('reports a ready checkout status via the Shopify Variant Resolver once a line SKU has a mapped Shopify Variant GID', async () => {
    const { createCartWorkspaceService } = modules.service;
    const { createMockCartWorkspaceAdapter } = modules.adapters;
    const { cartWorkspaceFixtureLines } = modules.adapters;

    const commerce = resolverBackedCommerce(
      Object.fromEntries(cartWorkspaceFixtureLines.map((line) => [
        line.sku,
        { sku: line.sku, shopifyVariantId: `gid://shopify/ProductVariant/${line.sku}`, price: { amount: 100, currencyCode: 'USD' } },
      ])),
    );

    const service = createCartWorkspaceService(createMockCartWorkspaceAdapter(), commerce);
    const result = await service.prepareCheckout();

    assert.equal(result.status, 'ready');
    assert.ok(result.lines.every((line) => line.ready));
    assert.ok(result.lines.every((line) => line.cartLineDraft?.variantMapping.shopifyVariantGid?.startsWith('gid://shopify/ProductVariant/')));
  });

  it('keeps checkout honestly blocked via the Shopify Variant Resolver when a line SKU has no mapped Shopify Variant GID', async () => {
    const { createCartWorkspaceService } = modules.service;
    const { createMockCartWorkspaceAdapter } = modules.adapters;

    const commerce = resolverBackedCommerce({}); // no SKU has a mapping

    const service = createCartWorkspaceService(createMockCartWorkspaceAdapter(), commerce);
    const result = await service.prepareCheckout();

    assert.equal(result.status, 'incomplete');
    assert.ok(result.lines.every((line) => line.ready === false));
    assert.ok(result.lines.every((line) => line.cartLineDraft === null));
  });

  it('reports an unavailable checkout status for an empty cart', async () => {
    const { createCartWorkspaceService } = modules.service;
    const { createMockCartWorkspaceAdapter } = modules.adapters;

    const service = createCartWorkspaceService(createMockCartWorkspaceAdapter([]));
    const result = await service.prepareCheckout();

    assert.equal(result.status, 'unavailable');
    assert.equal(result.lines.length, 0);
  });

  it('notifies subscribers on mutation and stops after unsubscribe', async () => {
    const { createCartWorkspaceService } = modules.service;
    const { createMockCartWorkspaceAdapter } = modules.adapters;
    const service = createCartWorkspaceService(createMockCartWorkspaceAdapter());

    let notifications = 0;
    const unsubscribe = service.subscribe(() => { notifications += 1; });

    await service.updateQuantity('cart-line-1', 3);
    assert.equal(notifications, 1);

    unsubscribe();
    await service.updateQuantity('cart-line-1', 4);
    assert.equal(notifications, 1);
  });
});

describe('cartWorkspace adapters', () => {
  it('unavailableCartWorkspaceAdapter returns an empty cart from every method', async () => {
    const { unavailableCartWorkspaceAdapter } = modules.adapters;

    assert.deepEqual(await unavailableCartWorkspaceAdapter.getLines(), []);
    assert.deepEqual(await unavailableCartWorkspaceAdapter.addLine({ productId: 'p', sku: 'p', label: 'p', quantity: 1, unitPrice: { amount: 1, currencyCode: 'USD' } }), []);
    assert.deepEqual(await unavailableCartWorkspaceAdapter.updateQuantity('any', 2), []);
    assert.deepEqual(await unavailableCartWorkspaceAdapter.removeLine('any'), []);
    assert.deepEqual(await unavailableCartWorkspaceAdapter.clearCart(), []);
  });

  it('mockCartWorkspaceAdapter merges quantity into an existing line when adding a duplicate SKU', async () => {
    const { createMockCartWorkspaceAdapter } = modules.adapters;
    const adapter = createMockCartWorkspaceAdapter();

    const lines = await adapter.addLine({ productId: 'nav-light-bar', sku: 'NAV-SKU', label: 'Navigator Full-Size Light Bar', quantity: 1, unitPrice: { amount: 1000, currencyCode: 'USD' } });
    const navLine = lines.find((line) => line.sku === 'NAV-SKU');

    assert.equal(navLine.quantity, 3);
    assert.equal(navLine.lineTotal.amount, 3000);
  });

  it('mockCartWorkspaceAdapter keeps independent state per instance', async () => {
    const { createMockCartWorkspaceAdapter } = modules.adapters;
    const a = createMockCartWorkspaceAdapter();
    const b = createMockCartWorkspaceAdapter();

    await a.clearCart();

    assert.equal((await a.getLines()).length, 0);
    assert.equal((await b.getLines()).length, 3);
  });
});

describe('cartWorkspace schemas', () => {
  it('validates a well-formed cart state', () => {
    const { cartStateSchema } = modules.schemas;

    const parsed = cartStateSchema.parse({
      lines: [{
        id: 'line-1', productId: 'p1', sku: 'SKU-1', label: 'Product',
        quantity: 1, unitPrice: { amount: 10, currencyCode: 'USD' }, lineTotal: { amount: 10, currencyCode: 'USD' },
        availability: 'available', configurationStatus: 'not-required', isPackage: false,
      }],
      summary: {
        itemCount: 1, lineCount: 1, currencyCode: 'USD',
        subtotal: { amount: 10, currencyCode: 'USD' }, estimatedShipping: null, estimatedTax: null,
        grandTotalEstimate: { amount: 10, currencyCode: 'USD' },
      },
    });

    assert.equal(parsed.lines[0].sku, 'SKU-1');
  });
});

describe('cartWorkspace hooks', () => {
  it('exposes useCartWorkspace and useMiniCart without requiring a live network call', () => {
    const { useCartWorkspace, useMiniCart } = modules.hooks;

    assert.match(renderHookProbe(useCartWorkspace), /data-loading="false"/);
    assert.match(renderHookProbe(useMiniCart), /data-loading="true"/);
  });
});
