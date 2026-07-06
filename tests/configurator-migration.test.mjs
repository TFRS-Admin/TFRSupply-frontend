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
    configuratorService: await server.ssrLoadModule('/src/services/configurator/configuratorService.ts'),
    configuratorModule: await server.ssrLoadModule('/src/components/configurator/ConfiguratorModule.tsx'),
    vehicle: await server.ssrLoadModule('/src/context/VehicleContext.jsx'),
  };
});

after(async () => {
  await server?.close();
});

function renderWithVehicleProvider(element) {
  const { VehicleProvider } = modules.vehicle;

  return renderToString(
    React.createElement(VehicleProvider, null, element),
  );
}

describe('configuratorService loading', () => {
  it('loads a typed configurator through the service boundary', () => {
    const { configuratorService } = modules.configuratorService;
    const configurator = configuratorService.getConfigurator('navigator-configurator');

    assert.equal(configurator?.id, 'navigator-configurator');
    assert.equal(configurator?.productId, 'navigator');
    assert.equal(configurator?.productFamily, 'Navigator® Serial Light Bar');
    assert.equal(configurator?.sectionMap?.skuSelector?.label, 'SKU Filters');
    assert.equal(configurator?.skuOptions?.length, 11);
  });

  it('returns null for a missing configurator', () => {
    const { configuratorService } = modules.configuratorService;

    assert.equal(configuratorService.getConfigurator('missing-configurator'), null);
  });
});

describe('typed configurator preservation', () => {
  it('preserves SKU options and attributes used by configurator filtering', () => {
    const { configuratorService } = modules.configuratorService;
    const configurator = configuratorService.getConfigurator('navigator-configurator');
    const firstSku = configurator?.skuOptions?.[0];

    assert.equal(firstSku?.sku, 'NVG45Z-NFPA20');
    assert.equal(firstSku?.price, 4639);
    assert.deepEqual(firstSku?.attributes, { length: '45', color: 'RW' });
  });

  it('preserves section steps and option rendering metadata', () => {
    const { configuratorService } = modules.configuratorService;
    const configurator = configuratorService.getConfigurator('navigator-configurator');
    const skuSelector = configurator?.sectionMap?.skuSelector;
    const accessories = configurator?.sectionMap?.accessories;

    assert.equal(skuSelector?.steps?.[0]?.id, 'length');
    assert.equal(skuSelector?.steps?.[0]?.skuSegmentKey, 'length');
    assert.equal(skuSelector?.steps?.[0]?.options?.[0]?.label, '45"');
    assert.equal(skuSelector?.steps?.[1]?._verification, 'needs_verification');
    assert.equal(accessories?.items?.[0]?.sku, 'NAV-CABLE-10');
  });
});

describe('ConfiguratorModule rendering', () => {
  it('renders service-loaded configurator options without changing option labels', () => {
    const { configuratorService } = modules.configuratorService;
    const { default: ConfiguratorModule } = modules.configuratorModule;
    const configurator = configuratorService.getConfigurator('navigator-configurator');

    const html = renderWithVehicleProvider(
      React.createElement(ConfiguratorModule, {
        configuratorData: configurator,
        verticalId: 'fire',
        categoryId: 'light-bars',
      }),
    );

    assert.match(html, /Product Configurator/);
    assert.match(html, /Bar Length/);
    assert.match(html, /45&quot;/);
    assert.match(html, /Red \/ White/);
    assert.match(html, /Available SKUs/);
    assert.match(html, /Select a SKU row/);
  });

  it('never renders an Add to Cart affordance itself — the module has no cart action before or after a SKU is selected', () => {
    const { configuratorService } = modules.configuratorService;
    const { default: ConfiguratorModule } = modules.configuratorModule;
    const configurator = configuratorService.getConfigurator('navigator-configurator');

    const html = renderWithVehicleProvider(
      React.createElement(ConfiguratorModule, {
        configuratorData: configurator,
        verticalId: 'fire',
        categoryId: 'light-bars',
      }),
    );

    assert.doesNotMatch(html, /Add to Cart/);
  });
});

// A shape-accurate stand-in for the quotePayload ConfiguratorModule's
// internal useMemo produces once a SKU row is resolved — the same object
// QuotePanel already renders in place today.
const READY_QUOTE_PAYLOAD = {
  productFamily: 'Navigator® Serial Light Bar',
  selectedVehicle: { year: 2024, make: 'Ford', model: 'F-550' },
  selectedBaseSku: 'NVG45Z-NFPA20',
  basePrice: 4639,
  availability: 'available',
  accessorySkus: [],
  reviewFlags: [],
  checkoutReady: true,
};

const NOT_READY_QUOTE_PAYLOAD = {
  ...READY_QUOTE_PAYLOAD,
  availability: 'unknown',
  reviewFlags: ['Shopify variant ID pending — quote only, checkout disabled'],
  checkoutReady: false,
};

describe('Package Quote panel (QuotePanel) — single Add to Cart path', () => {
  it('renders no Add to Cart button — only the non-cart status pill and the unrelated Add to Quote action', () => {
    const { QuotePanel } = modules.configuratorModule;
    const html = renderToString(React.createElement(QuotePanel, { quotePayload: READY_QUOTE_PAYLOAD }));

    assert.doesNotMatch(html, /Add to Cart/);
    assert.match(html, /Add to Quote/);
    assert.match(html, /<button[^>]*>[\s\S]*?Add to Quote/);
  });

  it('shows "Continue to Cart Actions" in non-cart language once the resolver reports checkoutReady', () => {
    const { QuotePanel } = modules.configuratorModule;
    const html = renderToString(React.createElement(QuotePanel, { quotePayload: READY_QUOTE_PAYLOAD }));

    assert.match(html, /Continue to Cart Actions/);
    assert.match(html, /role="status"/);
  });

  it('shows "Review Selected SKU" instead of a cart affordance when the resolver has not resolved a variant', () => {
    const { QuotePanel } = modules.configuratorModule;
    const html = renderToString(React.createElement(QuotePanel, { quotePayload: NOT_READY_QUOTE_PAYLOAD }));

    assert.match(html, /Review Selected SKU/);
    assert.doesNotMatch(html, /Continue to Cart Actions/);
  });

  it('preserves SKU, price, and availability display regardless of resolver readiness', () => {
    const { QuotePanel } = modules.configuratorModule;
    const readyHtml = renderToString(React.createElement(QuotePanel, { quotePayload: READY_QUOTE_PAYLOAD }));
    const notReadyHtml = renderToString(React.createElement(QuotePanel, { quotePayload: NOT_READY_QUOTE_PAYLOAD }));

    for (const html of [readyHtml, notReadyHtml]) {
      assert.match(html, /NVG45Z-NFPA20/);
      assert.match(html, /\$4,639/);
    }
    assert.match(readyHtml, /In Stock/);
    assert.match(notReadyHtml, /Availability Pending/);
  });

  it('renders the prompt to select a SKU when no quote payload is present', () => {
    const { QuotePanel } = modules.configuratorModule;
    const html = renderToString(React.createElement(QuotePanel, { quotePayload: null }));

    assert.match(html, /Select a SKU row in the table above/);
    assert.doesNotMatch(html, /Add to Cart/);
  });
});
