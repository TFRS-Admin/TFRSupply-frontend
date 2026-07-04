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
    catalog: await server.ssrLoadModule('/src/services/catalog/catalogService.ts'),
    productDetail: await server.ssrLoadModule('/src/pages/ProductDetailTemplate.jsx'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
    vehicle: await server.ssrLoadModule('/src/context/VehicleContext.jsx'),
    configurator: await server.ssrLoadModule('/src/context/ConfiguratorContext.jsx'),
    compare: await server.ssrLoadModule('/src/context/CompareContext.jsx'),
    recentlyViewed: await server.ssrLoadModule('/src/context/RecentlyViewedContext.jsx'),
    savedProducts: await server.ssrLoadModule('/src/context/SavedProductsContext.jsx'),
    productCommerceSummary: await server.ssrLoadModule('/src/components/product/ProductCommerceSummary.jsx'),
    commerceActionPanel: await server.ssrLoadModule('/src/components/product/CommerceActionPanel.jsx'),
    fitmentSummary: await server.ssrLoadModule('/src/components/product/FitmentSummary.jsx'),
    recommendedProducts: await server.ssrLoadModule('/src/components/product/RecommendedProducts.jsx'),
    relatedPackages: await server.ssrLoadModule('/src/components/product/RelatedPackages.jsx'),
    fleetBuilds: await server.ssrLoadModule('/src/context/FleetBuildsContext.jsx'),
  };
});

after(async () => {
  await server?.close();
});

function renderWithProviders(element, initialEntries = ['/fire/light-bars/navigator']) {
  const { MemoryRouter } = modules.router;
  const { VehicleProvider } = modules.vehicle;
  const { ConfiguratorProvider } = modules.configurator;
  const { CompareProvider } = modules.compare;
  const { RecentlyViewedProvider } = modules.recentlyViewed;
  const { SavedProductsProvider } = modules.savedProducts;
  const { FleetBuildsProvider } = modules.fleetBuilds;

  return renderToString(
    React.createElement(MemoryRouter, { initialEntries },
      React.createElement(VehicleProvider, null,
        React.createElement(CompareProvider, null,
          React.createElement(RecentlyViewedProvider, null,
            React.createElement(SavedProductsProvider, null,
              React.createElement(FleetBuildsProvider, null,
                React.createElement(ConfiguratorProvider, null, element),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

describe('ProductCommerceSummary (product hero enhancement)', () => {
  it('renders deterministic catalog commerce fields for a product', () => {
    const { catalogService } = modules.catalog;
    const { default: ProductCommerceSummary } = modules.productCommerceSummary;
    const product = catalogService.getProduct('navigator');

    const html = renderWithProviders(React.createElement(ProductCommerceSummary, { product }));

    assert.match(html, /SKU/);
    assert.match(html, /Brand/);
    assert.match(html, /federal-signal/);
    assert.match(html, /Category/);
    assert.match(html, /MSRP/);
    assert.match(html, /Contact for pricing/);
  });

  it('renders nothing for a product without commerce or identifying data', () => {
    const { default: ProductCommerceSummary } = modules.productCommerceSummary;
    const html = renderWithProviders(React.createElement(ProductCommerceSummary, { product: { id: 'bare', commerce: {} } }));

    assert.equal(html, '');
  });
});

describe('CommerceActionPanel (commerce CTA area)', () => {
  it('renders Configure Product, Request Quote, and Contact Sales for a configurable product', () => {
    const { catalogService } = modules.catalog;
    const { default: CommerceActionPanel } = modules.commerceActionPanel;
    const product = catalogService.getProduct('navigator');

    const html = renderWithProviders(React.createElement(CommerceActionPanel, { product }));

    assert.match(html, /Configure Product/);
    assert.match(html, /Request Quote/);
    assert.match(html, /Contact Sales/);
    assert.match(html, /href="#build-configure"/);
    assert.doesNotMatch(html, /Add to Cart/);
  });
});

describe('FitmentSummary (vehicle fitment composition)', () => {
  it('renders supported vehicle types from catalog marketing data', () => {
    const { catalogService } = modules.catalog;
    const { default: FitmentSummary } = modules.fitmentSummary;
    const product = catalogService.getProduct('navigator');

    const html = renderWithProviders(React.createElement(FitmentSummary, { product }));

    assert.match(html, /Supported Vehicle Types/);
    assert.match(html, /Fire Apparatus/);
    assert.match(html, /Vehicle Compatibility Summary/);
    assert.match(html, /Select a vehicle from the header/);
  });

  it('builds a schema-valid Vehicle from the lightweight VehicleContext selection', () => {
    const { toFitmentVehicle } = modules.fitmentSummary;

    const vehicle = toFitmentVehicle({ vehicleId: 'FORD_PIU', year: '2024', make: 'Ford', model: 'Explorer PIU', vertical: 'Police' });

    assert.equal(vehicle.id, 'FORD_PIU');
    assert.equal(vehicle.make.label, 'Ford');
    assert.equal(vehicle.model.label, 'Explorer PIU');
    assert.equal(vehicle.year.value, 2024);
  });

  it('returns null for an incomplete vehicle selection', () => {
    const { toFitmentVehicle } = modules.fitmentSummary;
    assert.equal(toFitmentVehicle(null), null);
    assert.equal(toFitmentVehicle({ make: 'Ford' }), null);
  });

  it('renders nothing for a product with no applications or related packages', () => {
    const { default: FitmentSummary } = modules.fitmentSummary;
    const html = renderWithProviders(React.createElement(FitmentSummary, { product: { id: 'bare', marketing: {}, commerce: {} } }));
    assert.equal(html, '');
  });
});

describe('RecommendedProducts (deterministic catalog recommendations)', () => {
  it('prioritizes explicit commerce.related_products from the catalog', () => {
    const { catalogService } = modules.catalog;
    const { default: RecommendedProducts } = modules.recommendedProducts;
    const product = catalogService.getProduct('navigator');
    assert.deepEqual(product.commerce.related_products, ['valor', 'allegiant-max']);

    const html = renderWithProviders(React.createElement(RecommendedProducts, {
      product,
      verticalId: 'fire',
      categoryId: 'light-bars',
    }));

    assert.match(html, /Recommended Products/);
    assert.match(html, /Valor/);
    assert.match(html, /\/police\/light-bars\/valor/);
  });

  it('falls back to same-category products when no explicit relations exist', () => {
    const { catalogService } = modules.catalog;
    const { default: RecommendedProducts } = modules.recommendedProducts;
    const product = catalogService.getProduct('valor');

    const html = renderWithProviders(React.createElement(RecommendedProducts, {
      product,
      verticalId: 'police',
      categoryId: 'light-bars',
    }));

    assert.match(html, /Recommended Products/);
    assert.match(html, /Navigator/);
  });

  it('renders nothing when no recommendations can be found', () => {
    const { default: RecommendedProducts } = modules.recommendedProducts;
    const html = renderWithProviders(React.createElement(RecommendedProducts, {
      product: { id: 'unknown-product', commerce: {}, categoryIds: ['unknown-category'] },
    }));
    assert.equal(html, '');
  });
});

describe('RelatedPackages (package builder composition)', () => {
  it('renders nothing when a product has no related package ids', () => {
    const { catalogService } = modules.catalog;
    const { default: RelatedPackages } = modules.relatedPackages;
    const product = catalogService.getProduct('navigator');

    const html = renderWithProviders(React.createElement(RelatedPackages, { product }));
    assert.equal(html, '');
  });

  it('renders the section header when related package ids are present, even before adapter data resolves', () => {
    const { default: RelatedPackages } = modules.relatedPackages;
    const html = renderWithProviders(React.createElement(RelatedPackages, {
      product: { id: 'navigator', commerce: { related_packages: ['pkg-installer-1'] } },
    }));
    assert.match(html, /Related Packages/);
  });
});

describe('ProductDetailTemplateView composition', () => {
  it('renders the enhanced product detail experience end to end', () => {
    const { catalogService } = modules.catalog;
    const { ProductDetailTemplateView } = modules.productDetail;
    const product = catalogService.getProduct('navigator');

    const html = renderWithProviders(
      React.createElement(ProductDetailTemplateView, {
        verticalId: 'fire',
        categoryId: 'light-bars',
        productId: 'navigator',
        product,
        productLoading: false,
        productError: null,
        category: null,
        categoryLoading: false,
        categoryError: null,
      }),
    );

    assert.match(html, /Navigator® Serial Light Bar/);
    assert.match(html, /Configure Product/);
    assert.match(html, /Request Quote/);
    assert.match(html, /Contact Sales/);
    assert.match(html, /SKU/);
    assert.match(html, /Supported Vehicle Types/);
    assert.match(html, /Recommended Products/);
  });
});
