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
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
    vehicle: await server.ssrLoadModule('/src/context/VehicleContext.jsx'),
    configuratorHook: await server.ssrLoadModule('/src/hooks/useConfiguratorData.ts'),
    vehicleSummary: await server.ssrLoadModule('/src/components/configurator/VehicleConfigurationSummary.tsx'),
    fitmentFeedback: await server.ssrLoadModule('/src/components/configurator/ConfiguratorFitmentFeedback.tsx'),
    summaryPanel: await server.ssrLoadModule('/src/components/configurator/ConfiguratorSummaryPanel.tsx'),
    pricingSummary: await server.ssrLoadModule('/src/components/configurator/ConfiguratorPricingSummary.tsx'),
    commerceActions: await server.ssrLoadModule('/src/components/configurator/ConfiguratorCommerceActions.tsx'),
    experience: await server.ssrLoadModule('/src/components/configurator/ConfiguratorExperience.tsx'),
    cartService: await server.ssrLoadModule('/src/services/cartWorkspace/cartWorkspaceService.ts'),
    cartAdapters: await server.ssrLoadModule('/src/adapters/cartWorkspace/index.ts'),
    cartSchema: await server.ssrLoadModule('/src/schemas/cartWorkspace.schema.ts'),
    quoteService: await server.ssrLoadModule('/src/services/quoteBuilder/quoteBuilderService.ts'),
    quoteSchema: await server.ssrLoadModule('/src/schemas/quote.schema.ts'),
    quoteRequestPayload: await server.ssrLoadModule('/src/domain/configuratorQuote/buildQuoteRequestPayload.ts'),
  };
});

after(async () => {
  await server?.close();
});

function renderWithProviders(element, initialEntries = ['/fire/light-bars/navigator']) {
  const { MemoryRouter } = modules.router;
  const { VehicleProvider } = modules.vehicle;

  return renderToString(
    React.createElement(MemoryRouter, { initialEntries },
      React.createElement(VehicleProvider, null, element),
    ),
  );
}

// A fabricated but shape-accurate stand-in for the object ConfiguratorModule's
// existing quotePayload useMemo produces — this is exactly what
// onConfigurationChange delivers to ConfiguratorExperience today.
const CONFIG_STATE = {
  verticalId: 'fire',
  categoryId: 'light-bars',
  productFamily: 'Navigator® Serial Light Bar',
  configuratorId: 'navigator-configurator',
  selectedVehicle: { year: 2024, make: 'Ford', model: 'F-550' },
  selectedBaseSku: 'NVG45Z-NFPA20',
  selectedFilters: { length: 'len-45' },
  basePrice: 4639,
  accessorySkus: ['NAV-CABLE-10'],
  commerceLines: [
    { sku: 'NVG45Z-NFPA20', shopifyVariantId: 'gid://shopify/ProductVariant/5551234567890', shopifyProductId: null, price: 4639, status: 'matched' },
    { sku: 'NAV-CABLE-10', shopifyVariantId: null, shopifyProductId: null, price: 28, status: 'unmatched' },
  ],
  reviewFlags: ['Required component SKU unknown — needs review: Mounting Bracket'],
  shopifyVariantId: 'gid://shopify/ProductVariant/5551234567890',
  checkoutReady: true,
};

const CONFIGURATOR_DATA = {
  sectionMap: {
    skuSelector: {
      steps: [
        { id: 'length', label: 'Bar Length', options: [{ id: 'len-45', label: '45 Inch' }, { id: 'len-53', label: '53 Inch' }] },
      ],
    },
  },
};

describe('VehicleConfigurationSummary (vehicle selection panel)', () => {
  it('builds a friendly summary sentence for a selected vehicle', () => {
    const { buildVehicleSummary } = modules.vehicleSummary;
    const summary = buildVehicleSummary({ year: 2024, make: 'Ford', model: 'F-550', trim: 'XL' });
    assert.match(summary, /2024 Ford F-550 XL/);
  });

  it('builds a fallback sentence when no vehicle is selected', () => {
    const { buildVehicleSummary } = modules.vehicleSummary;
    assert.match(buildVehicleSummary(null), /No vehicle selected/);
  });

  it('renders Year/Make/Model/Trim fields and the select-vehicle prompt with no vehicle in context', () => {
    const { default: VehicleConfigurationSummary } = modules.vehicleSummary;
    const html = renderWithProviders(React.createElement(VehicleConfigurationSummary));

    assert.match(html, /Vehicle Selection/);
    assert.match(html, />Year</);
    assert.match(html, />Make</);
    assert.match(html, />Model</);
    assert.match(html, />Trim</);
    assert.match(html, /Select Vehicle/);
    assert.match(html, /No vehicle selected/);
  });
});

describe('ConfiguratorFitmentFeedback (fitment feedback panel)', () => {
  it('derives "compatible" for a compatible result with no issues', () => {
    const { deriveFitmentPresentation } = modules.fitmentFeedback;
    assert.equal(deriveFitmentPresentation({ status: 'compatible', compatible: true, issues: [] }), 'compatible');
  });

  it('derives "warning" for a compatible result carrying a warning-severity issue', () => {
    const { deriveFitmentPresentation } = modules.fitmentFeedback;
    assert.equal(
      deriveFitmentPresentation({ status: 'compatible', compatible: true, issues: [{ code: 'x', severity: 'warning', message: 'Advisory' }] }),
      'warning',
    );
  });

  it('derives "incompatible" for an incompatible result', () => {
    const { deriveFitmentPresentation } = modules.fitmentFeedback;
    assert.equal(deriveFitmentPresentation({ status: 'incompatible', compatible: false, issues: [] }), 'incompatible');
  });

  it('derives "unknown" for a null result', () => {
    const { deriveFitmentPresentation } = modules.fitmentFeedback;
    assert.equal(deriveFitmentPresentation(null), 'unknown');
  });

  it('renders a prompt to select a vehicle when none is selected', () => {
    const { default: ConfiguratorFitmentFeedback } = modules.fitmentFeedback;
    const html = renderWithProviders(React.createElement(ConfiguratorFitmentFeedback, { configuratorId: 'navigator-configurator', sku: 'NVG45Z-NFPA20' }));

    assert.match(html, /Fitment Feedback/);
    assert.match(html, /Select a vehicle to check fitment/);
  });
});

describe('ConfiguratorSummaryPanel (configuration summary)', () => {
  it('renders a prompt before a SKU is selected', () => {
    const { default: ConfiguratorSummaryPanel } = modules.summaryPanel;
    const html = renderWithProviders(React.createElement(ConfiguratorSummaryPanel, { configuratorData: CONFIGURATOR_DATA, configState: null }));
    assert.match(html, /Select a SKU above/);
  });

  it('renders selected options, SKU list, warnings, and a package-unavailable summary once a SKU is selected', () => {
    const { default: ConfiguratorSummaryPanel } = modules.summaryPanel;
    const html = renderWithProviders(React.createElement(ConfiguratorSummaryPanel, {
      configuratorData: CONFIGURATOR_DATA,
      configState: CONFIG_STATE,
      fitmentResult: null,
      packageId: undefined,
    }));

    assert.match(html, /Configuration Summary/);
    assert.match(html, /Bar Length/);
    assert.match(html, /45 Inch/);
    assert.match(html, /NVG45Z-NFPA20/);
    assert.match(html, /NAV-CABLE-10/);
    assert.match(html, /Needs Review/);
    assert.match(html, /Mounting Bracket/);
    assert.match(html, /No related package linked/);
    assert.match(html, /data-fitment-status="unknown"/);
  });
});

describe('ConfiguratorPricingSummary (pricing composition)', () => {
  it('renders a prompt before a SKU is selected', () => {
    const { default: ConfiguratorPricingSummary } = modules.pricingSummary;
    const html = renderWithProviders(React.createElement(ConfiguratorPricingSummary, { configState: null }));
    assert.match(html, /Select a SKU above/);
  });

  it('composes MSRP fallback, quantity/bundle pricing, and an estimated total from the configurator payload', () => {
    const { default: ConfiguratorPricingSummary } = modules.pricingSummary;
    const html = renderWithProviders(React.createElement(ConfiguratorPricingSummary, { configState: CONFIG_STATE }));

    assert.match(html, /Pricing Summary/);
    assert.match(html, /MSRP/);
    assert.match(html, /\$4,639\.00/);
    assert.match(html, /Quantity Pricing/);
    assert.match(html, /Bundle Pricing/);
    assert.match(html, /Estimated Total/);
    // basePrice (4639) + accessory price (28) = 4667, since the Pricing
    // Engine adapter is unavailable and this falls back to known SKU prices.
    assert.match(html, /\$4,667\.00/);
  });
});

describe('ConfiguratorCommerceActions (commerce action composition)', () => {
  it('builds a schema-valid CartLineInput from the configurator payload', () => {
    const { buildCartLineInput } = modules.commerceActions;
    const { cartLineInputSchema } = modules.cartSchema;

    const input = buildCartLineInput(CONFIG_STATE);
    const parsed = cartLineInputSchema.parse(input);

    assert.equal(parsed.sku, 'NVG45Z-NFPA20');
    assert.equal(parsed.productId, 'navigator-configurator');
    assert.equal(parsed.unitPrice.amount, 4639);
    assert.equal(parsed.source, 'configurator');
    assert.equal(parsed.configurationStatus, 'incomplete'); // CONFIG_STATE has a review flag
  });

  it('returns null when no SKU has been selected', () => {
    const { buildCartLineInput } = modules.commerceActions;
    assert.equal(buildCartLineInput(null), null);
    assert.equal(buildCartLineInput({}), null);
  });

  it('builds a schema-valid QuoteAssemblyInput with a product line and an accessory line', () => {
    const { buildQuoteAssemblyInput } = modules.commerceActions;
    const { quoteAssemblyInputSchema } = modules.quoteSchema;

    const input = buildQuoteAssemblyInput(CONFIG_STATE, null);
    const parsed = quoteAssemblyInputSchema.parse(input);

    assert.equal(parsed.lines.length, 2);
    assert.equal(parsed.lines[0].lineType, 'product');
    assert.equal(parsed.lines[0].sku, 'NVG45Z-NFPA20');
    assert.equal(parsed.lines[1].lineType, 'accessory');
    assert.equal(parsed.lines[1].sku, 'NAV-CABLE-10');
  });

  it('renders nothing before a SKU is selected', () => {
    const { default: ConfiguratorCommerceActions } = modules.commerceActions;
    const html = renderWithProviders(React.createElement(ConfiguratorCommerceActions, { configState: null, verticalId: 'fire', categoryId: 'light-bars' }));
    assert.equal(html, '');
  });

  it('renders Add to Cart, Request Quote, Save Configuration, and Continue Shopping once a SKU is selected', () => {
    const { default: ConfiguratorCommerceActions } = modules.commerceActions;
    const html = renderWithProviders(React.createElement(ConfiguratorCommerceActions, { configState: CONFIG_STATE, verticalId: 'fire', categoryId: 'light-bars' }));

    assert.match(html, /Commerce Actions/);
    assert.match(html, /Add to Cart/);
    assert.match(html, /Request Quote/);
    assert.match(html, /Save Configuration/);
    assert.match(html, /Continue Shopping/);
    assert.match(html, /href="\/fire\/light-bars"/);
  });

  it('applies the requested quantity and carries the resolver-provided shopifyVariantId into CartLineInput metadata', () => {
    const { buildCartLineInput } = modules.commerceActions;
    const { cartLineInputSchema } = modules.cartSchema;

    const input = buildCartLineInput({ ...CONFIG_STATE, shopifyVariantId: 'gid://shopify/ProductVariant/123' }, 3);
    const parsed = cartLineInputSchema.parse(input);

    assert.equal(parsed.quantity, 3);
    assert.equal(parsed.metadata?.attributes?.shopifyVariantId, 'gid://shopify/ProductVariant/123');
  });

  it('defaults quantity to 1 and clamps non-positive quantities to 1', () => {
    const { buildCartLineInput } = modules.commerceActions;
    assert.equal(buildCartLineInput(CONFIG_STATE).quantity, 1);
    assert.equal(buildCartLineInput(CONFIG_STATE, 0).quantity, 1);
    assert.equal(buildCartLineInput(CONFIG_STATE, -5).quantity, 1);
  });

  it('records a null shopifyVariantId in metadata when the resolver has not matched a Shopify variant', () => {
    const { buildCartLineInput } = modules.commerceActions;
    const input = buildCartLineInput({ ...CONFIG_STATE, shopifyVariantId: null });
    assert.equal(input.metadata.attributes.shopifyVariantId, null);
  });

  it('disables Add to Cart and shows the disabled-reason notice when the resolver reports canAddToCart: false', () => {
    const { default: ConfiguratorCommerceActions } = modules.commerceActions;
    const notReady = { ...CONFIG_STATE, checkoutReady: false };
    const html = renderWithProviders(React.createElement(ConfiguratorCommerceActions, { configState: notReady, verticalId: 'fire', categoryId: 'light-bars' }));

    assert.match(html, /data-testid="cart-disabled-reason"/);
    const addToCartButton = html.match(/<button[^>]*title="This Shopify variant is not yet checkout-ready[^>]*>/);
    assert.ok(addToCartButton, 'expected to find the Add to Cart button by its disabled title');
    assert.match(addToCartButton[0], /disabled/);
  });

  it('falls back to Add to Quote instead of a permanently-disabled Add to Cart when the Shopify variant GID is missing', () => {
    const { default: ConfiguratorCommerceActions } = modules.commerceActions;
    const noGid = { ...CONFIG_STATE, shopifyVariantId: null, checkoutReady: false };
    const html = renderWithProviders(React.createElement(ConfiguratorCommerceActions, { configState: noGid, verticalId: 'fire', categoryId: 'light-bars' }));

    assert.match(html, /data-testid="cart-disabled-reason"/);
    assert.match(html, /No Shopify variant ID yet for this SKU/);
    // Opens the quote-contact modal on click (PR-12/#321) — no href at all,
    // so there is no dual-fire mailto-plus-quoteBuilder race any more.
    const primaryAction = html.match(/<button[^>]*title="No Shopify variant ID yet for this SKU[^>]*>/);
    assert.ok(primaryAction, 'expected the primary action to render as a functional Add to Quote button, not a link or a disabled button');
    assert.doesNotMatch(primaryAction[0], /disabled/);
  });

  it('renders Request Quote with no raw mailto href — it opens the quote contact modal on click instead', () => {
    const { default: ConfiguratorCommerceActions } = modules.commerceActions;
    const html = renderWithProviders(React.createElement(ConfiguratorCommerceActions, { configState: CONFIG_STATE, verticalId: 'fire', categoryId: 'light-bars' }));

    assert.match(html, /Request Quote/);
    assert.doesNotMatch(html, /mailto:/);
  });

  it('enables Add to Cart with no disabled-reason notice when the resolver reports canAddToCart: true', () => {
    const { default: ConfiguratorCommerceActions } = modules.commerceActions;
    const html = renderWithProviders(React.createElement(ConfiguratorCommerceActions, { configState: CONFIG_STATE, verticalId: 'fire', categoryId: 'light-bars' }));

    assert.doesNotMatch(html, /data-testid="cart-disabled-reason"/);
    const addToCartButton = html.match(/<button[^>]*title="This configuration is ready to add to your cart\.[^>]*>/);
    assert.ok(addToCartButton, 'expected to find the Add to Cart button by its enabled title');
    assert.doesNotMatch(addToCartButton[0], /disabled/);
  });

  it('renders a quantity stepper defaulting to 1', () => {
    const { default: ConfiguratorCommerceActions } = modules.commerceActions;
    const html = renderWithProviders(React.createElement(ConfiguratorCommerceActions, { configState: CONFIG_STATE, verticalId: 'fire', categoryId: 'light-bars' }));

    assert.match(html, /data-testid="cart-quantity-stepper"/);
    assert.match(html, /data-testid="cart-quantity-value">1</);
  });
});

describe('buildQuoteRequestPayload (PR-12/#321 — wires the PDP quote flow to the delivery adapter)', () => {
  const CONTACT = { name: 'Jane Smith', agency: 'Metro PD', email: 'jane@metropd.gov' };

  it('returns null when no SKU has been selected', () => {
    const { buildQuoteRequestPayload } = modules.quoteRequestPayload;
    assert.equal(buildQuoteRequestPayload(null, CONFIGURATOR_DATA, CONTACT, 'sub-1'), null);
    assert.equal(buildQuoteRequestPayload({}, CONFIGURATOR_DATA, CONTACT, 'sub-1'), null);
  });

  it('resolves selected-filter step/option labels from configuratorData', () => {
    const { buildQuoteRequestPayload } = modules.quoteRequestPayload;
    const result = buildQuoteRequestPayload(CONFIG_STATE, CONFIGURATOR_DATA, CONTACT, 'sub-1');

    assert.equal(result.selectedOptions.length, 1);
    assert.equal(result.selectedOptions[0].stepId, 'length');
    assert.equal(result.selectedOptions[0].stepLabel, 'Bar Length');
    assert.deepEqual(result.selectedOptions[0].selected, ['45 Inch']);
  });

  it('falls back to raw stepId/optionId when configuratorData is unavailable', () => {
    const { buildQuoteRequestPayload } = modules.quoteRequestPayload;
    const result = buildQuoteRequestPayload(CONFIG_STATE, null, CONTACT, 'sub-1');

    assert.equal(result.selectedOptions[0].stepLabel, 'length');
    assert.deepEqual(result.selectedOptions[0].selected, ['len-45']);
  });

  it('maps accessorySkus to accessories with pricing from commerceLines', () => {
    const { buildQuoteRequestPayload } = modules.quoteRequestPayload;
    const result = buildQuoteRequestPayload(CONFIG_STATE, CONFIGURATOR_DATA, CONTACT, 'sub-1');

    assert.equal(result.accessories.length, 1);
    assert.equal(result.accessories[0].optionId, 'NAV-CABLE-10');
    assert.equal(result.accessories[0].priceModifier, 28);
  });

  it('carries the selected vehicle into vehicleSummary and reviewFlags into warningNotes', () => {
    const { buildQuoteRequestPayload } = modules.quoteRequestPayload;
    const result = buildQuoteRequestPayload(CONFIG_STATE, CONFIGURATOR_DATA, CONTACT, 'sub-1');

    assert.equal(result.vehicleSummary, '2024 Ford F-550');
    assert.deepEqual(result.warningNotes, CONFIG_STATE.reviewFlags);
    assert.equal(result.selectedSku, 'NVG45Z-NFPA20');
    assert.equal(result.contact, CONTACT);
    assert.equal(result.submissionId, 'sub-1');
  });
});

describe('Cart Workspace integration', () => {
  it('adds the configured product to a fresh in-memory cart via cartWorkspaceService.addLine', async () => {
    const { createCartWorkspaceService } = modules.cartService;
    const { createMockCartWorkspaceAdapter } = modules.cartAdapters;
    const { buildCartLineInput } = modules.commerceActions;

    const service = createCartWorkspaceService(createMockCartWorkspaceAdapter());
    const before_ = await service.getState();
    const input = buildCartLineInput(CONFIG_STATE);

    const after_ = await service.addLine(input);

    assert.equal(after_.lines.length, before_.lines.length + 1);
    const addedLine = after_.lines.find((line) => line.sku === 'NVG45Z-NFPA20');
    assert.ok(addedLine, 'expected the configured SKU to be present in the cart');
    assert.equal(addedLine.source, 'configurator');
    assert.equal(addedLine.unitPrice.amount, 4639);
  });

  it('adds the requested quantity as the line quantity and line total', async () => {
    const { createCartWorkspaceService } = modules.cartService;
    const { createMockCartWorkspaceAdapter } = modules.cartAdapters;
    const { buildCartLineInput } = modules.commerceActions;

    const service = createCartWorkspaceService(createMockCartWorkspaceAdapter());
    const input = buildCartLineInput(CONFIG_STATE, 3);

    const after_ = await service.addLine(input);

    const addedLine = after_.lines.find((line) => line.sku === 'NVG45Z-NFPA20');
    assert.ok(addedLine, 'expected the configured SKU to be present in the cart');
    assert.equal(addedLine.quantity, 3);
    assert.equal(addedLine.lineTotal.amount, 4639 * 3);
  });
});

describe('Quote Builder integration', () => {
  it('assembles a quote through the existing Quote Builder Foundation and reports its honest unavailable status', async () => {
    const { quoteBuilderService } = modules.quoteService;
    const { buildQuoteAssemblyInput } = modules.commerceActions;

    const input = buildQuoteAssemblyInput(CONFIG_STATE, null);
    const result = await quoteBuilderService.assembleQuote(input);

    assert.equal(result.status, 'unavailable');
    assert.ok(result.reviewFlags?.length > 0);
    assert.match(result.reviewFlags[0].message, /not connected/);
  });
});

describe('ConfiguratorExperience composition', () => {
  it('renders the vehicle summary and the unchanged configurator engine end to end', () => {
    const { useConfiguratorData } = modules.configuratorHook;
    const { default: ConfiguratorExperience } = modules.experience;

    function Harness() {
      const { data } = useConfiguratorData('navigator-configurator');
      if (!data) return null;
      return React.createElement(ConfiguratorExperience, {
        configuratorData: data,
        verticalId: 'fire',
        categoryId: 'light-bars',
      });
    }

    const html = renderWithProviders(React.createElement(Harness));

    assert.match(html, /Vehicle Selection/);
    assert.match(html, /TFRSupply Configurator/);
    assert.match(html, /Available SKUs/);
    // Before a SKU row is selected, the summary/pricing/commerce grid is gated off.
    assert.doesNotMatch(html, /Commerce Actions/);
  });
});
