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
    service: await server.ssrLoadModule('/src/services/checkoutPreparation/checkoutPreparationService.ts'),
    cartWorkspaceService: await server.ssrLoadModule('/src/services/cartWorkspace/cartWorkspaceService.ts'),
    commerceService: await server.ssrLoadModule('/src/services/commerce/commerceService.ts'),
    variantResolver: await server.ssrLoadModule('/src/services/shopifyVariantResolver/shopifyVariantResolverService.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/checkoutPreparation/index.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/checkoutPreparation/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/checkoutPreparation.schema.ts'),
  };
});

after(async () => {
  await server?.close();
});

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
      return { status: 'ready', data: { sku: request.sku, shopifyVariantId: `variant-${request.sku}`, channel: 'shopify' } };
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

/**
 * Builds a `Pick<CommerceService, 'prepareCartLine'>` backed by a real
 * Shopify Variant Resolver instance (the same seam
 * ConfiguratorCommerceActions' canAddToCart gate reads) whose Commerce
 * Foundation adapter is fully under test control — proves the checkout
 * pipeline agrees with the configurator's resolver contract instead of a
 * hand-rolled fake shape.
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

function fakeCartWorkspaceService(lines) {
  return {
    async getState() {
      const { buildCartSummary } = modules.cartWorkspaceService;
      return { lines, summary: buildCartSummary(lines) };
    },
    validateCart(candidateLines) {
      return modules.cartWorkspaceService.validateCartLines(candidateLines);
    },
  };
}

describe('checkoutPreparationService orchestration', () => {
  it('reports ready status and a payload preview for a fully valid cart', async () => {
    const { createCheckoutPreparationService } = modules.service;
    const { createCommerceService } = modules.commerceService;
    const { mockCheckoutPreparationAdapter } = modules.adapters;

    const lines = [baseLine()];
    const service = createCheckoutPreparationService(mockCheckoutPreparationAdapter, fakeCartWorkspaceService(lines), readyCommerceService(createCommerceService));

    const result = await service.prepareCheckout();

    assert.equal(result.status, 'ready');
    assert.equal(result.blockers.length, 0);
    assert.ok(result.payloadPreview);
    assert.equal(result.payloadPreview.lines.length, 1);
    assert.equal(result.payloadPreview.lines[0].sku, 'SKU-1');
    assert.equal(result.lineValidations[0].readiness, 'ready');
  });

  it('blocks checkout for an invalid cart line (unavailable availability, invalid quantity)', async () => {
    const { createCheckoutPreparationService } = modules.service;
    const { createCommerceService } = modules.commerceService;
    const { mockCheckoutPreparationAdapter } = modules.adapters;

    const lines = [baseLine({ availability: 'unavailable' })];
    const service = createCheckoutPreparationService(mockCheckoutPreparationAdapter, fakeCartWorkspaceService(lines), readyCommerceService(createCommerceService));

    const result = await service.prepareCheckout();

    assert.equal(result.status, 'blocked');
    assert.equal(result.payloadPreview, null);
    assert.ok(result.blockers.some((blocker) => blocker.code === 'cart.line-unavailable' && blocker.category === 'cart'));
  });

  it('blocks checkout when a line has no available price', async () => {
    const { createCheckoutPreparationService } = modules.service;
    const { createCommerceService } = modules.commerceService;
    const { mockCheckoutPreparationAdapter } = modules.adapters;

    const lines = [baseLine({ unitPrice: { amount: 0, currencyCode: 'USD' } })];
    const service = createCheckoutPreparationService(mockCheckoutPreparationAdapter, fakeCartWorkspaceService(lines), readyCommerceService(createCommerceService));

    const result = await service.prepareCheckout();

    assert.equal(result.status, 'blocked');
    assert.ok(result.blockers.some((blocker) => blocker.code === 'checkout.pricing-unavailable' && blocker.category === 'pricing'));
    assert.equal(result.lineValidations[0].pricingAvailable, false);
  });

  it('blocks checkout when a line has an incomplete configuration', async () => {
    const { createCheckoutPreparationService } = modules.service;
    const { createCommerceService } = modules.commerceService;
    const { mockCheckoutPreparationAdapter } = modules.adapters;

    const lines = [baseLine({ configurationStatus: 'incomplete' })];
    const service = createCheckoutPreparationService(mockCheckoutPreparationAdapter, fakeCartWorkspaceService(lines), readyCommerceService(createCommerceService));

    const result = await service.prepareCheckout();

    assert.equal(result.status, 'blocked');
    assert.ok(result.blockers.some((blocker) => blocker.code === 'checkout.configuration-incomplete' && blocker.category === 'configuration'));
    assert.equal(result.lineValidations[0].configurationValid, false);
  });

  it('blocks checkout when a package line is missing its package reference', async () => {
    const { createCheckoutPreparationService } = modules.service;
    const { createCommerceService } = modules.commerceService;
    const { mockCheckoutPreparationAdapter } = modules.adapters;

    const lines = [baseLine({ isPackage: true, packageId: undefined })];
    const service = createCheckoutPreparationService(mockCheckoutPreparationAdapter, fakeCartWorkspaceService(lines), readyCommerceService(createCommerceService));

    const result = await service.prepareCheckout();

    assert.equal(result.status, 'blocked');
    assert.ok(result.blockers.some((blocker) => blocker.code === 'checkout.package-incomplete' && blocker.category === 'package'));
    assert.equal(result.lineValidations[0].packageValid, false);
  });

  it('blocks checkout when commerce availability is unavailable (default unavailable commerce adapter)', async () => {
    const { createCheckoutPreparationService } = modules.service;
    const { createCommerceService } = modules.commerceService;
    const { mockCheckoutPreparationAdapter } = modules.adapters;

    const lines = [baseLine()];
    const service = createCheckoutPreparationService(mockCheckoutPreparationAdapter, fakeCartWorkspaceService(lines), unavailableCommerceService(createCommerceService));

    const result = await service.prepareCheckout();

    assert.equal(result.status, 'blocked');
    assert.equal(result.payloadPreview, null);
    assert.ok(result.blockers.some((blocker) => blocker.code === 'checkout.commerce-unavailable' && blocker.category === 'commerce'));
    assert.equal(result.lineValidations[0].commerceAvailable, false);
  });

  it('reports ready status and a payload preview once the Shopify Variant Resolver reports a mapped Shopify Variant GID for the line SKU', async () => {
    const { createCheckoutPreparationService } = modules.service;
    const { mockCheckoutPreparationAdapter } = modules.adapters;

    const lines = [baseLine()];
    const commerce = resolverBackedCommerce({
      'SKU-1': { sku: 'SKU-1', shopifyVariantId: 'gid://shopify/ProductVariant/1', price: { amount: 1000, currencyCode: 'USD' } },
    });
    const service = createCheckoutPreparationService(mockCheckoutPreparationAdapter, fakeCartWorkspaceService(lines), commerce);

    const result = await service.prepareCheckout();

    assert.equal(result.status, 'ready');
    assert.equal(result.lineValidations[0].commerceAvailable, true);
    assert.equal(result.payloadPreview.lines[0].variantMapping.shopifyVariantGid, 'gid://shopify/ProductVariant/1');
  });

  it('keeps checkout honestly blocked via the Shopify Variant Resolver when the line SKU has no mapped Shopify Variant GID', async () => {
    const { createCheckoutPreparationService } = modules.service;
    const { mockCheckoutPreparationAdapter } = modules.adapters;

    const lines = [baseLine()];
    const commerce = resolverBackedCommerce({}); // SKU-1 has no Shopify Variant GID mapping
    const service = createCheckoutPreparationService(mockCheckoutPreparationAdapter, fakeCartWorkspaceService(lines), commerce);

    const result = await service.prepareCheckout();

    assert.equal(result.status, 'blocked');
    assert.equal(result.payloadPreview, null);
    assert.ok(result.blockers.some((blocker) => blocker.code === 'checkout.commerce-unavailable' && blocker.category === 'commerce'));
    assert.equal(result.lineValidations[0].commerceAvailable, false);
  });

  it('reports a cart-empty blocker for an empty cart', async () => {
    const { createCheckoutPreparationService } = modules.service;
    const { createCommerceService } = modules.commerceService;
    const { mockCheckoutPreparationAdapter } = modules.adapters;

    const service = createCheckoutPreparationService(mockCheckoutPreparationAdapter, fakeCartWorkspaceService([]), readyCommerceService(createCommerceService));

    const result = await service.prepareCheckout();

    assert.equal(result.status, 'blocked');
    assert.ok(result.blockers.some((blocker) => blocker.code === 'checkout.cart-empty'));
    assert.equal(result.lineValidations.length, 0);
  });

  it('flags backorder lines as warnings without blocking checkout', async () => {
    const { createCheckoutPreparationService } = modules.service;
    const { createCommerceService } = modules.commerceService;
    const { mockCheckoutPreparationAdapter } = modules.adapters;

    const lines = [baseLine({ availability: 'backorder' })];
    const service = createCheckoutPreparationService(mockCheckoutPreparationAdapter, fakeCartWorkspaceService(lines), readyCommerceService(createCommerceService));

    const result = await service.prepareCheckout();

    assert.equal(result.status, 'ready');
    assert.ok(result.warnings.some((warning) => warning.code === 'cart.line-backorder' && warning.category === 'cart'));
    assert.equal(result.lineValidations[0].readiness, 'warning');
  });

  it('accepts an explicit request.lines override instead of the live cart', async () => {
    const { createCheckoutPreparationService } = modules.service;
    const { createCommerceService } = modules.commerceService;
    const { mockCheckoutPreparationAdapter } = modules.adapters;

    const service = createCheckoutPreparationService(mockCheckoutPreparationAdapter, fakeCartWorkspaceService([baseLine({ id: 'ignored' })]), readyCommerceService(createCommerceService));

    const result = await service.prepareCheckout({ lines: [baseLine({ id: 'override-line' })] });

    assert.equal(result.lineValidations.length, 1);
    assert.equal(result.lineValidations[0].lineId, 'override-line');
  });

  it('uses the default mock adapter, cartWorkspaceService, and commerceService singletons when no dependencies are injected', async () => {
    const { checkoutPreparationService } = modules.service;

    const result = await checkoutPreparationService.prepareCheckout();

    assert.equal(result.status, 'blocked');
    assert.ok(result.cartValidation);
    assert.ok(Array.isArray(result.lineValidations));
  });
});

describe('checkoutPreparation adapters', () => {
  it('mockCheckoutPreparationAdapter totals variant-mapped lines using the Live Pricing Engine helpers', async () => {
    const { mockCheckoutPreparationAdapter } = modules.adapters;

    const preview = await mockCheckoutPreparationAdapter.buildPayloadPreview({
      currencyCode: 'USD',
      lines: [
        { sku: 'SKU-1', quantity: 2, variantMapping: { sku: 'SKU-1', price: { amount: 100, currencyCode: 'USD' } } },
        { sku: 'SKU-2', quantity: 1, variantMapping: { sku: 'SKU-2', price: { amount: 50, currencyCode: 'USD' } } },
      ],
    });

    assert.equal(preview.estimatedTotal.amount, 250);
    assert.equal(preview.lines.length, 2);
  });

  it('unavailableCheckoutPreparationAdapter returns an empty preview', async () => {
    const { unavailableCheckoutPreparationAdapter } = modules.adapters;

    const preview = await unavailableCheckoutPreparationAdapter.buildPayloadPreview({ currencyCode: 'USD', lines: [] });

    assert.deepEqual(preview.lines, []);
    assert.equal(preview.estimatedTotal.amount, 0);
  });
});

describe('checkoutPreparation schemas', () => {
  it('validates a well-formed checkout preparation result', () => {
    const { checkoutPreparationResultSchema } = modules.schemas;

    const parsed = checkoutPreparationResultSchema.parse({
      status: 'ready',
      cartValidation: { valid: true, issues: [] },
      lineValidations: [{
        lineId: 'line-1', sku: 'SKU-1', cartValid: true, configurationValid: true, packageValid: true,
        pricingAvailable: true, commerceAvailable: true, readiness: 'ready', blockers: [], warnings: [],
      }],
      blockers: [],
      warnings: [],
      payloadPreview: {
        currencyCode: 'USD',
        lines: [{ sku: 'SKU-1', quantity: 1, variantMapping: { sku: 'SKU-1' } }],
        estimatedTotal: { amount: 100, currencyCode: 'USD' },
      },
    });

    assert.equal(parsed.status, 'ready');
  });
});

describe('checkoutPreparation hooks', () => {
  it('exposes useCheckoutPreparation without requiring a live network call', () => {
    const { useCheckoutPreparation } = modules.hooks;

    function HookProbe() {
      const state = useCheckoutPreparation();
      return React.createElement('span', {
        'data-loading': String(Boolean(state.loading)),
        'data-has-data': String(Boolean(state.data)),
        'data-has-error': String(Boolean(state.error)),
      });
    }

    const markup = renderToString(React.createElement(HookProbe));
    assert.match(markup, /data-loading="false"/);
    assert.match(markup, /data-has-data="false"/);
  });
});
