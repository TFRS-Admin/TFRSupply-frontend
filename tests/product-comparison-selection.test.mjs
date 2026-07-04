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
    compareDomain: await server.ssrLoadModule('/src/domain/catalog/compareSelection.ts'),
    compareContext: await server.ssrLoadModule('/src/context/CompareContext.jsx'),
    compareToggleButton: await server.ssrLoadModule('/src/components/product/CompareToggleButton.jsx'),
    compareTray: await server.ssrLoadModule('/src/components/product/CompareTray.jsx'),
    comparePage: await server.ssrLoadModule('/src/pages/ComparePage.jsx'),
    productCard: await server.ssrLoadModule('/src/components/product/ProductCard.jsx'),
    commerceActionPanel: await server.ssrLoadModule('/src/components/product/CommerceActionPanel.jsx'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
    vehicle: await server.ssrLoadModule('/src/context/VehicleContext.jsx'),
    configurator: await server.ssrLoadModule('/src/context/ConfiguratorContext.jsx'),
    savedProducts: await server.ssrLoadModule('/src/context/SavedProductsContext.jsx'),
    fleetBuilds: await server.ssrLoadModule('/src/context/FleetBuildsContext.jsx'),
  };
});

after(async () => {
  await server?.close();
});

function renderWithProviders(element, initialEntries = ['/']) {
  const { MemoryRouter } = modules.router;
  const { VehicleProvider } = modules.vehicle;
  const { CompareProvider } = modules.compareContext;
  const { ConfiguratorProvider } = modules.configurator;
  const { SavedProductsProvider } = modules.savedProducts;
  const { FleetBuildsProvider } = modules.fleetBuilds;

  return renderToString(
    React.createElement(MemoryRouter, { initialEntries },
      React.createElement(VehicleProvider, null,
        React.createElement(CompareProvider, null,
          React.createElement(SavedProductsProvider, null,
            React.createElement(FleetBuildsProvider, null,
              React.createElement(ConfiguratorProvider, null, element),
            ),
          ),
        ),
      ),
    ),
  );
}

describe('compareSelection domain rules (add/remove/max limit)', () => {
  it('adds a product id that is not already selected', () => {
    const { addProductToCompare } = modules.compareDomain;
    assert.deepEqual(addProductToCompare(['navigator'], 'valor'), ['navigator', 'valor']);
  });

  it('does not add a duplicate product id', () => {
    const { addProductToCompare } = modules.compareDomain;
    const current = ['navigator', 'valor'];
    assert.equal(addProductToCompare(current, 'navigator'), current);
  });

  it('enforces the 4-product maximum', () => {
    const { addProductToCompare, MAX_COMPARE_PRODUCTS } = modules.compareDomain;
    assert.equal(MAX_COMPARE_PRODUCTS, 4);
    const full = ['a', 'b', 'c', 'd'];
    assert.equal(addProductToCompare(full, 'e'), full);
    assert.equal(addProductToCompare(full, 'e').length, 4);
  });

  it('removes a selected product id', () => {
    const { removeProductFromCompare } = modules.compareDomain;
    assert.deepEqual(removeProductFromCompare(['navigator', 'valor'], 'navigator'), ['valor']);
  });

  it('removing an id not in the list is a no-op', () => {
    const { removeProductFromCompare } = modules.compareDomain;
    assert.deepEqual(removeProductFromCompare(['navigator'], 'valor'), ['navigator']);
  });

  it('reports comparing/full state', () => {
    const { isProductInCompare, isCompareFull } = modules.compareDomain;
    assert.equal(isProductInCompare(['navigator'], 'navigator'), true);
    assert.equal(isProductInCompare(['navigator'], 'valor'), false);
    assert.equal(isCompareFull(['a', 'b', 'c', 'd']), true);
    assert.equal(isCompareFull(['a']), false);
  });
});

describe('CompareToggleButton', () => {
  it('renders an inactive "Add to comparison" control by default', () => {
    const { default: CompareToggleButton } = modules.compareToggleButton;
    const html = renderWithProviders(React.createElement(CompareToggleButton, { productId: 'navigator', variant: 'icon' }));
    assert.match(html, /Add to comparison/);
    assert.match(html, /aria-pressed="false"/);
  });

  it('renders the inline variant label used in CommerceActionPanel', () => {
    const { default: CompareToggleButton } = modules.compareToggleButton;
    const html = renderWithProviders(React.createElement(CompareToggleButton, { productId: 'navigator', variant: 'inline' }));
    assert.match(html, /Add to Compare/);
  });

  it('renders nothing without a productId', () => {
    const { default: CompareToggleButton } = modules.compareToggleButton;
    const html = renderWithProviders(React.createElement(CompareToggleButton, { productId: null, variant: 'icon' }));
    assert.equal(html, '');
  });
});

describe('ProductCard (compare button on product cards)', () => {
  it('renders a compare toggle overlay when the card links to a real product', () => {
    const { default: ProductCard } = modules.productCard;
    const html = renderWithProviders(React.createElement(ProductCard, {
      id: 'navigator', href: '/fire/light-bars/navigator', label: 'Navigator® Serial Light Bar',
    }));
    assert.match(html, /Add to comparison/);
  });

  it('does not render a compare toggle for a coming-soon card without a href', () => {
    const { default: ProductCard } = modules.productCard;
    const html = renderWithProviders(React.createElement(ProductCard, { id: 'stub', href: null, label: 'Coming Soon Product' }));
    assert.doesNotMatch(html, /Add to comparison/);
  });
});

describe('CommerceActionPanel (compare button on product detail)', () => {
  it('renders an Add to Compare action alongside the existing CTAs', () => {
    const { catalogService } = modules.catalog;
    const { default: CommerceActionPanel } = modules.commerceActionPanel;
    const product = catalogService.getProduct('navigator');

    const html = renderWithProviders(React.createElement(CommerceActionPanel, { product }));

    assert.match(html, /Configure Product/);
    assert.match(html, /Request Quote/);
    assert.match(html, /Add to Compare/);
  });
});

describe('CompareTrayView', () => {
  it('renders nothing when no products are selected', () => {
    const { CompareTrayView } = modules.compareTray;
    const html = renderWithProviders(React.createElement(CompareTrayView, { products: [], onRemove: () => {}, onClear: () => {} }));
    assert.equal(html, '');
  });

  it('renders selected products with a Compare(n) link and Clear All control', () => {
    const { catalogService } = modules.catalog;
    const { CompareTrayView } = modules.compareTray;
    const products = [catalogService.getProduct('navigator'), catalogService.getProduct('valor')];

    const html = renderWithProviders(React.createElement(CompareTrayView, { products, onRemove: () => {}, onClear: () => {} }));

    assert.match(html, /Compare \(2\)/);
    assert.match(html, /Clear All/);
    assert.match(html, /href="\/compare"/);
    assert.match(html, /Navigator/);
    assert.match(html, /Valor/);
  });

  it('CompareTray (connected) renders nothing before any product is selected', () => {
    const { default: CompareTray } = modules.compareTray;
    const html = renderWithProviders(React.createElement(CompareTray), ['/']);
    assert.equal(html, '');
  });

  it('CompareTray (connected) renders nothing on the /compare route', () => {
    const { default: CompareTray } = modules.compareTray;
    const html = renderWithProviders(React.createElement(CompareTray), ['/compare']);
    assert.equal(html, '');
  });
});

describe('ComparePageView (compare page rendering)', () => {
  it('renders the empty state when no products are selected', () => {
    const { ComparePageView } = modules.comparePage;
    const html = renderWithProviders(React.createElement(ComparePageView, { rows: [], onRemove: () => {}, onClear: () => {} }));

    assert.match(html, /No products selected for comparison/);
    assert.match(html, /Browse Products/);
    assert.doesNotMatch(html, /Compare Products<\/h1>/);
  });

  it('renders a side-by-side table (desktop) and stacked cards (mobile) for selected products', () => {
    const { catalogService } = modules.catalog;
    const { ComparePageView, toCompareRow } = modules.comparePage;
    const rows = [catalogService.getProduct('navigator'), catalogService.getProduct('valor')].map(toCompareRow);

    const html = renderWithProviders(React.createElement(ComparePageView, { rows, onRemove: () => {}, onClear: () => {} }));

    assert.match(html, /2 of 4 products selected/);
    // Desktop side-by-side table wrapper
    assert.match(html, /class="hidden md:block"/);
    // Mobile stacked-card wrapper
    assert.match(html, /class="md:hidden"/);
    assert.match(html, /Major Specifications/);
    assert.match(html, /Fitment Summary/);
    assert.match(html, /Fire Apparatus/);
  });

  it('renders Configure, View Details, and Request Quote CTAs per product', () => {
    const { catalogService } = modules.catalog;
    const { toCompareRow } = modules.comparePage;
    const row = toCompareRow(catalogService.getProduct('navigator'));

    assert.match(row.configureHref, /#build-configure$/);
    assert.equal(row.detailHref, '/fire/light-bars/navigator');
    assert.match(row.quoteHref, /^mailto:/);
    assert.match(row.quoteHref, /Navigator/);
  });

  it('falls back to an unavailable state when a product has no resolvable detail route', () => {
    const { toCompareRow } = modules.comparePage;
    const row = toCompareRow({ id: 'orphan', label: 'Orphan Product', verticalIds: [], categoryIds: [] });
    assert.equal(row.detailHref, null);
  });
});
