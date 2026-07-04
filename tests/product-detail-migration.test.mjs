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
    hooks: await server.ssrLoadModule('/src/hooks/useCatalog.ts'),
    productDetail: await server.ssrLoadModule('/src/pages/ProductDetailTemplate.jsx'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
    vehicle: await server.ssrLoadModule('/src/context/VehicleContext.jsx'),
    configurator: await server.ssrLoadModule('/src/context/ConfiguratorContext.jsx'),
    compare: await server.ssrLoadModule('/src/context/CompareContext.jsx'),
    recentlyViewed: await server.ssrLoadModule('/src/context/RecentlyViewedContext.jsx'),
  };
});

after(async () => {
  await server?.close();
});

function renderWithProviders(element) {
  const { MemoryRouter } = modules.router;
  const { VehicleProvider } = modules.vehicle;
  const { ConfiguratorProvider } = modules.configurator;
  const { CompareProvider } = modules.compare;
  const { RecentlyViewedProvider } = modules.recentlyViewed;

  return renderToString(
    React.createElement(MemoryRouter, { initialEntries: ['/fire/light-bars/navigator'] },
      React.createElement(VehicleProvider, null,
        React.createElement(CompareProvider, null,
          React.createElement(RecentlyViewedProvider, null,
            React.createElement(ConfiguratorProvider, null, element),
          ),
        ),
      ),
    ),
  );
}

describe('product detail catalog loading', () => {
  it('loads a product through catalogService with product-detail view fields preserved', () => {
    const { catalogService } = modules.catalog;
    const product = catalogService.getProduct('navigator');

    assert.equal(product?.id, 'navigator');
    assert.equal(product?.title, 'Navigator® Serial Light Bar');
    assert.equal(product?.tabs_component, 'NavigatorTabs');
    assert.equal(product?.media?.gallery?.length, 4);
    assert.equal(product?.marketing?.features?.length, 12);
    assert.equal(product?.commerce?.sku_root, 'NVG');
  });

  it('returns null for a missing product through catalogService', () => {
    const { catalogService } = modules.catalog;

    assert.equal(catalogService.getProduct('missing-product'), null);
  });
});

describe('useCatalogProduct', () => {
  it('exposes loading state before effects resolve', () => {
    const { useCatalogProduct } = modules.hooks;

    function HookProbe() {
      const state = useCatalogProduct('navigator');
      return React.createElement('span', {
        'data-loading': String(state.loading),
        'data-has-data': String(Boolean(state.data)),
        'data-has-error': String(Boolean(state.error)),
      });
    }

    const html = renderToString(React.createElement(HookProbe));

    assert.match(html, /data-loading="true"/);
    assert.match(html, /data-has-data="false"/);
    assert.match(html, /data-has-error="false"/);
  });
});

describe('ProductDetailTemplateView', () => {
  it('renders nothing during product loading state', () => {
    const { ProductDetailTemplateView } = modules.productDetail;
    const html = renderWithProviders(
      React.createElement(ProductDetailTemplateView, {
        verticalId: 'fire',
        categoryId: 'light-bars',
        productId: 'navigator',
        product: null,
        productLoading: true,
        productError: null,
        category: null,
        categoryLoading: true,
        categoryError: null,
      }),
    );

    assert.equal(html, '');
  });

  it('throws during product error state', () => {
    const { ProductDetailTemplateView } = modules.productDetail;
    const error = new Error('product failed');

    assert.throws(() => renderWithProviders(
      React.createElement(ProductDetailTemplateView, {
        verticalId: 'fire',
        categoryId: 'light-bars',
        productId: 'navigator',
        product: null,
        productLoading: false,
        productError: error,
        category: null,
        categoryLoading: false,
        categoryError: null,
      }),
    ), /product failed/);
  });

  it('renders NotFound for a missing product with no category stub', () => {
    const { ProductDetailTemplateView } = modules.productDetail;
    const html = renderWithProviders(
      React.createElement(ProductDetailTemplateView, {
        verticalId: 'fire',
        categoryId: 'light-bars',
        productId: 'missing-product',
        product: null,
        productLoading: false,
        productError: null,
        category: null,
        categoryLoading: false,
        categoryError: null,
      }),
    );

    assert.match(html, /Not Found/);
    assert.match(html, /Return to Category/);
  });

  it('renders a product detail page successfully', () => {
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
    assert.match(html, /Configure This Product/);
    assert.match(html, /High-profile full-size LED light bar/);
  });
});
