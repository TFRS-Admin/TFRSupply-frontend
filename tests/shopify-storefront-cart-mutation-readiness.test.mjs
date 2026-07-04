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
    schemas: await server.ssrLoadModule('/src/schemas/cartAdapter.schema.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/shopifyStorefrontCart/index.ts'),
    adapterService: await server.ssrLoadModule('/src/services/cartAdapter/index.ts'),
    commerceService: await server.ssrLoadModule('/src/services/commerce/index.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/cartAdapter/index.ts'),
    panel: await server.ssrLoadModule('/src/components/cart/CheckoutReadinessPanel.jsx'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
  };
});
after(async () => { await server?.close(); });

describe('cartAdapterService — runtime adapter selection', () => {
  it('defaults to the mock adapter mode when Storefront config is not enabled', () => {
    const { createCartAdapterService } = modules.adapterService;
    const service = createCartAdapterService(fakeCartWorkspaceService([]), modules.commerceService.commerceService);

    assert.equal(service.getMode(), 'mock');
    assert.equal(service.getCapabilities().adapterMode, 'mock');
    assert.equal(service.getCapabilities().dryRunOnly, true);
    assert.equal(service.getCapabilities().liveCallsEnabled, false);
  });

  it('configureLiveAdapter() with a full config selects live mode but still never enables live calls', () => {
    const { createCartAdapterService } = modules.adapterService;
    const service = createCartAdapterService(fakeCartWorkspaceService([]), modules.commerceService.commerceService);

    service.configureLiveAdapter({ storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token-abc' });

    assert.equal(service.getMode(), 'live');
    assert.equal(service.getCapabilities().adapterMode, 'live');
    assert.equal(service.getCapabilities().liveCallsEnabled, false);
    assert.equal(service.getStatus().usedFallback, false);
  });

  it('configureLiveAdapter() with an incomplete config falls back gracefully to the unavailable adapter', () => {
    const { createCartAdapterService } = modules.adapterService;
    const service = createCartAdapterService(fakeCartWorkspaceService([]), modules.commerceService.commerceService);

    service.configureLiveAdapter({ storeDomain: 'example.myshopify.com' });

    assert.equal(service.getMode(), 'unavailable');
    const status = service.getStatus();
    assert.equal(status.usedFallback, true);
    assert.match(status.fallbackReason, /falling back to the unavailable adapter/);
  });

  it('resetToDefaultAdapter() clears a live selection and any prior preview', async () => {
    const { createCartAdapterService } = modules.adapterService;
    const service = createCartAdapterService(fakeCartWorkspaceService([baseLine()]), modules.commerceService.commerceService);

    service.configureLiveAdapter({ storeDomain: 'example.myshopify.com', apiVersion: '2024-10', storefrontAccessToken: 'token-abc' });
    await service.previewMutation();
    assert.ok(service.getStatus().lastPreview);

    service.resetToDefaultAdapter();

    assert.equal(service.getMode(), 'mock');
    assert.equal(service.getStatus().lastPreview, null);
    assert.equal(service.getStatus().fallbackReason, undefined);
  });
});

describe('cartAdapterService — cart line mapping validation', () => {
  it('reports full mapping validation when the Commerce Foundation resolves every line', async () => {
    const { createCartAdapterService } = modules.adapterService;
    const { createCommerceService } = modules.commerceService;
    const lines = [baseLine()];
    const service = createCartAdapterService(fakeCartWorkspaceService(lines), readyCommerceService(createCommerceService));

    await service.previewMutation(lines);
    const { mappingValidation } = service.getStatus();

    assert.equal(mappingValidation.totalLineCount, 1);
    assert.equal(mappingValidation.mappedLineCount, 1);
    assert.equal(mappingValidation.unmappedLineCount, 0);
    assert.deepEqual(mappingValidation.issues, []);
  });

  it('reports missing merchandise IDs when the Commerce Foundation cannot resolve a variant', async () => {
    const { createCartAdapterService } = modules.adapterService;
    const { createCommerceService } = modules.commerceService;
    const lines = [baseLine()];
    const service = createCartAdapterService(fakeCartWorkspaceService(lines), unavailableCommerceService(createCommerceService));

    await service.previewMutation(lines);
    const { mappingValidation } = service.getStatus();

    assert.equal(mappingValidation.unmappedLineCount, 1);
    assert.equal(mappingValidation.mappedLineCount, 0);
    assert.equal(mappingValidation.issues.length, 1);
    assert.equal(mappingValidation.issues[0].sku, 'SKU-1');
    assert.match(mappingValidation.issues[0].reason, /merchandiseId/);
  });

  it('previewMutation() reads the live Cart Workspace state when no explicit lines are supplied', async () => {
    const { createCartAdapterService } = modules.adapterService;
    const { createCommerceService } = modules.commerceService;
    const lines = [baseLine({ id: 'preview-line' })];
    const service = createCartAdapterService(fakeCartWorkspaceService(lines), readyCommerceService(createCommerceService));

    const result = await service.previewMutation();

    assert.equal(result.cartLines.length, 1);
    assert.equal(result.cartLines[0].cartLineId, 'preview-line');
  });
});

describe('cartAdapterService — mutation request preview', () => {
  it('builds the exact cart mutation request without performing any network call', async () => {
    const { createCartAdapterService } = modules.adapterService;
    const { createCommerceService } = modules.commerceService;
    const lines = [baseLine()];
    const service = createCartAdapterService(fakeCartWorkspaceService(lines), readyCommerceService(createCommerceService));

    const result = await service.previewMutation(lines);

    assert.equal(result.mutationPreview.operationName, 'CartLinesAddPreview');
    assert.match(result.mutationPreview.query, /cartLinesAdd/);
    assert.deepEqual(result.mutationPreview.variables.lines, [{ merchandiseId: 'gid://shopify/ProductVariant/SKU-1', quantity: 2 }]);
    assert.equal(service.getStatus().lastPreview.mutationPreview.operationName, 'CartLinesAddPreview');
  });
});

describe('cartAdapterService — cart mutation diagnostics', () => {
  it('always reports a live-calls-disabled diagnostic regardless of adapter mode', () => {
    const { createCartAdapterService } = modules.adapterService;
    const service = createCartAdapterService(fakeCartWorkspaceService([]), modules.commerceService.commerceService);

    assert.ok(service.getStatus().diagnostics.some((d) => d.code === 'live-calls-disabled'));
  });

  it('reports an empty-cart diagnostic when the last preview had zero lines', async () => {
    const { createCartAdapterService } = modules.adapterService;
    const service = createCartAdapterService(fakeCartWorkspaceService([]), modules.commerceService.commerceService);

    await service.previewMutation([]);

    assert.ok(service.getStatus().diagnostics.some((d) => d.code === 'empty-cart'));
  });

  it('reports an unmapped-merchandise warning diagnostic when lines are missing a merchandise ID', async () => {
    const { createCartAdapterService } = modules.adapterService;
    const { createCommerceService } = modules.commerceService;
    const lines = [baseLine()];
    const service = createCartAdapterService(fakeCartWorkspaceService(lines), unavailableCommerceService(createCommerceService));

    await service.previewMutation(lines);
    const diagnostic = service.getStatus().diagnostics.find((d) => d.code === 'unmapped-merchandise');

    assert.ok(diagnostic);
    assert.equal(diagnostic.level, 'warning');
    assert.match(diagnostic.message, /1 of 1 cart line/);
  });

  it('reports a live-config-incomplete warning diagnostic after a graceful fallback', () => {
    const { createCartAdapterService } = modules.adapterService;
    const service = createCartAdapterService(fakeCartWorkspaceService([]), modules.commerceService.commerceService);

    service.configureLiveAdapter({});
    const diagnostic = service.getStatus().diagnostics.find((d) => d.code === 'live-config-incomplete');

    assert.ok(diagnostic);
    assert.equal(diagnostic.level, 'warning');
  });
});

describe('cartAdapter schemas', () => {
  it('validates a well-formed status snapshot', () => {
    const parsed = modules.schemas.cartAdapterStatusSnapshotSchema.parse({
      adapterMode: 'mock',
      lastPreview: null,
      lastPreviewedAt: null,
      mappingValidation: null,
      diagnostics: [{ code: 'adapter-mode', level: 'info', message: 'Cart adapter mode: mock.' }],
      usedFallback: false,
    });
    assert.equal(parsed.adapterMode, 'mock');
  });

  it('rejects a status snapshot missing a required field', () => {
    assert.throws(() => modules.schemas.cartAdapterStatusSnapshotSchema.parse({ adapterMode: 'mock' }));
  });
});

describe('cartAdapter hook — shared by /dev/storefront and /cart', () => {
  before(() => {
    modules.adapterService.cartAdapterService.resetToDefaultAdapter();
  });

  it('exposes a typed hook entry point', () => {
    assert.equal(typeof modules.hooks.useCartAdapterStatus, 'function');
  });

  it('renders without requiring a live network call', () => {
    const { useCartAdapterStatus } = modules.hooks;

    function HookProbe() {
      const state = useCartAdapterStatus();
      return React.createElement('span', {
        'data-mode': state.status.adapterMode,
        'data-loading': String(Boolean(state.loading)),
      });
    }

    const markup = renderToString(React.createElement(HookProbe));
    assert.match(markup, /data-mode="(mock|unavailable|live)"/);
  });
});

describe('Cart page integration — CheckoutReadinessPanel Cart Mutation Readiness block', () => {
  it('renders adapter mode, mapping summary, and warning diagnostics from cartAdapterStatus', () => {
    const CheckoutReadinessPanel = modules.panel.default;
    const result = { status: 'ready', blockers: [], warnings: [], payloadPreview: null };
    const cartAdapterStatus = {
      adapterMode: 'unavailable',
      lastPreview: null,
      lastPreviewedAt: null,
      mappingValidation: { totalLineCount: 2, mappedLineCount: 1, unmappedLineCount: 1, issues: [{ cartLineId: 'l1', sku: 'SKU-1', reason: 'missing' }] },
      diagnostics: [
        { code: 'adapter-mode', level: 'info', message: 'Cart adapter mode: unavailable.' },
        { code: 'unmapped-merchandise', level: 'warning', message: '1 of 2 cart line(s) are missing a Shopify merchandise ID.' },
      ],
      usedFallback: false,
    };

    const markup = renderToString(React.createElement(CheckoutReadinessPanel, { result, cartAdapterStatus }));

    assert.match(markup, /Cart Mutation Readiness/);
    assert.match(markup, /unavailable/);
    assert.match(markup, /Cart Lines Mapped/);
    assert.match(markup, /1<!-- -->\/<!-- -->2/);
    assert.match(markup, /missing a Shopify merchandise ID/);
    assert.equal(markup.toLowerCase().includes('shpat'), false);
  });

  it('renders without a cartAdapterStatus prop (backward compatible with existing callers)', () => {
    const CheckoutReadinessPanel = modules.panel.default;
    const result = { status: 'ready', blockers: [], warnings: [], payloadPreview: null };

    assert.doesNotThrow(() => renderToString(React.createElement(CheckoutReadinessPanel, { result })));
  });
});

describe('Dev dashboard — Cart Readiness section (issue #075)', () => {
  it('renders the Cart Readiness section with mapping validation, diagnostics, and mutation preview, without a token', async () => {
    modules.adapterService.cartAdapterService.resetToDefaultAdapter();
    const { MemoryRouter } = modules.router;
    const pageModule = await server.ssrLoadModule('/src/pages/DevStorefrontDashboard.jsx');
    const Page = pageModule.default;

    const markup = renderToString(React.createElement(MemoryRouter, { initialEntries: ['/dev/storefront'] }, React.createElement(Page)));

    assert.match(markup, /Cart Readiness/);
    assert.match(markup, /Cart Mutation Readiness/);
    assert.match(markup, /Cart Line Mapping Validation/);
    assert.match(markup, /Cart Mutation Diagnostics/);
    assert.match(markup, /Cart Mutation Request Preview/);
    assert.match(markup, /Activate Live Cart Adapter/);
    assert.equal(markup.toLowerCase().includes('shpat'), false);
  });

  it('still renders the existing Catalog Adapter and Runtime Configuration sections unchanged', async () => {
    const { MemoryRouter } = modules.router;
    const pageModule = await server.ssrLoadModule('/src/pages/DevStorefrontDashboard.jsx');
    const Page = pageModule.default;

    const markup = renderToString(React.createElement(MemoryRouter, { initialEntries: ['/dev/storefront'] }, React.createElement(Page)));

    assert.match(markup, /Storefront Runtime Configuration/);
    assert.match(markup, /Capability Matrix/);
    assert.match(markup, /Storefront Catalog Adapter Status/);
    assert.match(markup, /Mapping Validation Results/);
  });
});

describe('cartAdapterService — adapters (reused unchanged from Shopify Storefront Cart Adapter)', () => {
  it('exposes the same mock/unavailable/live adapter exports the existing foundation defines', () => {
    assert.equal(typeof modules.adapters.mockShopifyStorefrontCartAdapter.execute, 'function');
    assert.equal(typeof modules.adapters.unavailableShopifyStorefrontCartAdapter.execute, 'function');
    assert.equal(typeof modules.adapters.createLiveShopifyStorefrontCartAdapter, 'function');
  });
});
