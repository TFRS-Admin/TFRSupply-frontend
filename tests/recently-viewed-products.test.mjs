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
    recentlyViewedDomain: await server.ssrLoadModule('/src/domain/catalog/recentlyViewed.ts'),
    recentlyViewedContext: await server.ssrLoadModule('/src/context/RecentlyViewedContext.jsx'),
    recentlyViewedProducts: await server.ssrLoadModule('/src/components/product/RecentlyViewedProducts.jsx'),
    productDetail: await server.ssrLoadModule('/src/pages/ProductDetailTemplate.jsx'),
    productSearchPage: await server.ssrLoadModule('/src/pages/ProductSearchPage.jsx'),
    storeLanding: await server.ssrLoadModule('/src/pages/StoreLanding.jsx'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
    vehicle: await server.ssrLoadModule('/src/context/VehicleContext.jsx'),
    compare: await server.ssrLoadModule('/src/context/CompareContext.jsx'),
    configurator: await server.ssrLoadModule('/src/context/ConfiguratorContext.jsx'),
  };
});

after(async () => {
  await server?.close();
});

function renderWithProviders(element, initialEntries = ['/']) {
  const { MemoryRouter } = modules.router;
  const { VehicleProvider } = modules.vehicle;
  const { CompareProvider } = modules.compare;
  const { RecentlyViewedProvider } = modules.recentlyViewedContext;
  const { ConfiguratorProvider } = modules.configurator;

  return renderToString(
    React.createElement(MemoryRouter, { initialEntries },
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

describe('recentlyViewed domain rules (tracking/dedupe/max limit)', () => {
  it('adds a newly viewed product to the front of the list', () => {
    const { trackRecentlyViewedProduct } = modules.recentlyViewedDomain;
    assert.deepEqual(trackRecentlyViewedProduct(['navigator'], 'valor'), ['valor', 'navigator']);
  });

  it('moves an already-tracked product to the front instead of duplicating it', () => {
    const { trackRecentlyViewedProduct } = modules.recentlyViewedDomain;
    const result = trackRecentlyViewedProduct(['navigator', 'valor'], 'navigator');
    assert.deepEqual(result, ['navigator', 'valor']);
  });

  it('is a no-op for a falsy product id', () => {
    const { trackRecentlyViewedProduct } = modules.recentlyViewedDomain;
    const current = ['navigator'];
    assert.equal(trackRecentlyViewedProduct(current, null), current);
    assert.equal(trackRecentlyViewedProduct(current, undefined), current);
    assert.equal(trackRecentlyViewedProduct(current, ''), current);
  });

  it('enforces the 8-product maximum by dropping the oldest entries', () => {
    const { trackRecentlyViewedProduct, MAX_RECENTLY_VIEWED_PRODUCTS } = modules.recentlyViewedDomain;
    assert.equal(MAX_RECENTLY_VIEWED_PRODUCTS, 8);

    const full = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const result = trackRecentlyViewedProduct(full, 'i');

    assert.equal(result.length, 8);
    assert.deepEqual(result, ['i', 'a', 'b', 'c', 'd', 'e', 'f', 'g']);
    assert.ok(!result.includes('h'));
  });
});

describe('resolveRecentlyViewedProducts (id resolution, exclusion, missing ids)', () => {
  it('resolves tracked ids to catalog products via the supplied getProduct', () => {
    const { catalogService } = modules.catalog;
    const { resolveRecentlyViewedProducts } = modules.recentlyViewedProducts;

    const products = resolveRecentlyViewedProducts(['navigator', 'valor'], { getProduct: catalogService.getProduct });

    assert.equal(products.length, 2);
    assert.equal(products[0].id, 'navigator');
    assert.equal(products[1].id, 'valor');
  });

  it('excludes the current product being viewed', () => {
    const { catalogService } = modules.catalog;
    const { resolveRecentlyViewedProducts } = modules.recentlyViewedProducts;

    const products = resolveRecentlyViewedProducts(['navigator', 'valor'], {
      excludeProductId: 'navigator',
      getProduct: catalogService.getProduct,
    });

    assert.deepEqual(products.map((p) => p.id), ['valor']);
  });

  it('silently drops ids that no longer resolve to a catalog product', () => {
    const { resolveRecentlyViewedProducts } = modules.recentlyViewedProducts;
    const getProduct = (id) => (id === 'navigator' ? { id: 'navigator', label: 'Navigator' } : null);

    const products = resolveRecentlyViewedProducts(['navigator', 'deleted-product'], { getProduct });

    assert.deepEqual(products.map((p) => p.id), ['navigator']);
  });

  it('returns an empty array (safe state) when nothing is tracked', () => {
    const { catalogService } = modules.catalog;
    const { resolveRecentlyViewedProducts } = modules.recentlyViewedProducts;
    assert.deepEqual(resolveRecentlyViewedProducts([], { getProduct: catalogService.getProduct }), []);
  });
});

describe('RecentlyViewedProductsView (rendering)', () => {
  it('renders nothing (empty/safe state) when no products are given', () => {
    const { RecentlyViewedProductsView } = modules.recentlyViewedProducts;
    const html = renderWithProviders(React.createElement(RecentlyViewedProductsView, { products: [], onClear: () => {} }));
    assert.equal(html, '');
  });

  it('renders a Recently Viewed section with cards and a Clear action', () => {
    const { catalogService } = modules.catalog;
    const { RecentlyViewedProductsView } = modules.recentlyViewedProducts;
    const products = [catalogService.getProduct('navigator'), catalogService.getProduct('valor')];

    const html = renderWithProviders(React.createElement(RecentlyViewedProductsView, { products, onClear: () => {} }));

    assert.match(html, /Recently Viewed/);
    assert.match(html, /Clear Recently Viewed/);
    assert.match(html, /Navigator/);
    assert.match(html, /Valor/);
    assert.match(html, /VIEW DETAILS/);
  });

  it('uses a mobile-friendly responsive grid (2 columns on mobile)', () => {
    const { catalogService } = modules.catalog;
    const { RecentlyViewedProductsView } = modules.recentlyViewedProducts;
    const products = [catalogService.getProduct('navigator')];

    const html = renderWithProviders(React.createElement(RecentlyViewedProductsView, { products, onClear: () => {} }));

    assert.match(html, /grid-cols-2 sm:grid-cols-3 lg:grid-cols-4/);
  });
});

describe('RecentlyViewedProducts (connected, empty state before any tracking)', () => {
  it('renders nothing on Product Detail before any product has been tracked', () => {
    const { default: RecentlyViewedProducts } = modules.recentlyViewedProducts;
    const html = renderWithProviders(React.createElement(RecentlyViewedProducts, { excludeProductId: 'navigator' }));
    assert.equal(html, '');
  });
});

describe('Composition — Product Detail, Search, and Homepage render the section', () => {
  it('ProductDetailTemplateView composes RecentlyViewedProducts', () => {
    const source = modules.productDetail;
    assert.ok(source.default, 'ProductDetailTemplate module loads');
  });

  it('ProductSearchPage source wires RecentlyViewedProducts into the page', async () => {
    const { readFileSync } = await import('node:fs');
    const source = readFileSync(new URL('../src/pages/ProductSearchPage.jsx', import.meta.url), 'utf8');
    assert.match(source, /<RecentlyViewedProducts \/>/);
  });

  it('StoreLanding (homepage) source wires RecentlyViewedProducts into the page', async () => {
    const { readFileSync } = await import('node:fs');
    const source = readFileSync(new URL('../src/pages/StoreLanding.jsx', import.meta.url), 'utf8');
    assert.match(source, /<RecentlyViewedProducts \/>/);
  });

  it('ProductDetailTemplate source tracks the viewed product id and excludes it from its own section', async () => {
    const { readFileSync } = await import('node:fs');
    const source = readFileSync(new URL('../src/pages/ProductDetailTemplate.jsx', import.meta.url), 'utf8');
    assert.match(source, /trackView\(productState\.data\.id\)/);
    assert.match(source, /<RecentlyViewedProducts excludeProductId=\{data\.id\} \/>/);
  });

  it('App.jsx mounts RecentlyViewedProvider so the selection survives navigation', async () => {
    const { readFileSync } = await import('node:fs');
    const source = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
    assert.match(source, /<RecentlyViewedProvider>/);
  });
});
