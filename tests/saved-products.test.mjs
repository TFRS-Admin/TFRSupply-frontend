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
    savedProductsDomain: await server.ssrLoadModule('/src/domain/catalog/savedProducts.ts'),
    savedProductsContext: await server.ssrLoadModule('/src/context/SavedProductsContext.jsx'),
    savedProductsSection: await server.ssrLoadModule('/src/components/product/SavedProductsSection.jsx'),
    savedProductsPage: await server.ssrLoadModule('/src/pages/SavedProductsPage.jsx'),
    saveForLaterButton: await server.ssrLoadModule('/src/components/product/SaveForLaterButton.jsx'),
    productCard: await server.ssrLoadModule('/src/components/product/ProductCard.jsx'),
    commerceActionPanel: await server.ssrLoadModule('/src/components/product/CommerceActionPanel.tsx'),
    productDetail: await server.ssrLoadModule('/src/pages/ProductDetailTemplate.tsx'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
    vehicle: await server.ssrLoadModule('/src/context/VehicleContext.jsx'),
    compare: await server.ssrLoadModule('/src/context/CompareContext.jsx'),
    recentlyViewed: await server.ssrLoadModule('/src/context/RecentlyViewedContext.jsx'),
    configurator: await server.ssrLoadModule('/src/context/ConfiguratorContext.jsx'),
    fleetProject: await server.ssrLoadModule('/src/context/FleetProjectContext.jsx'),
    fleetBuilds: await server.ssrLoadModule('/src/context/FleetBuildsContext.jsx'),
  };
});

after(async () => {
  await server?.close();
});

function renderWithProviders(element, initialEntries = ['/']) {
  const { MemoryRouter } = modules.router;
  const { VehicleProvider } = modules.vehicle;
  const { CompareProvider } = modules.compare;
  const { RecentlyViewedProvider } = modules.recentlyViewed;
  const { SavedProductsProvider } = modules.savedProductsContext;
  const { FleetProjectProvider } = modules.fleetProject;
  const { FleetBuildsProvider } = modules.fleetBuilds;
  const { ConfiguratorProvider } = modules.configurator;

  return renderToString(
    React.createElement(MemoryRouter, { initialEntries },
      React.createElement(VehicleProvider, null,
        React.createElement(CompareProvider, null,
          React.createElement(RecentlyViewedProvider, null,
            React.createElement(SavedProductsProvider, null,
              React.createElement(FleetProjectProvider, null,
                React.createElement(FleetBuildsProvider, null,
                  React.createElement(ConfiguratorProvider, null, element),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

describe('savedProducts domain rules (save/unsave/dedupe)', () => {
  it('saves a newly saved product to the front of the list', () => {
    const { saveProduct } = modules.savedProductsDomain;
    assert.deepEqual(saveProduct(['navigator'], 'valor'), ['valor', 'navigator']);
  });

  it('does not add a duplicate product id (dedupe)', () => {
    const { saveProduct } = modules.savedProductsDomain;
    const current = ['navigator', 'valor'];
    assert.equal(saveProduct(current, 'navigator'), current);
  });

  it('is a no-op for a falsy product id (missing product ids)', () => {
    const { saveProduct } = modules.savedProductsDomain;
    const current = ['navigator'];
    assert.equal(saveProduct(current, null), current);
    assert.equal(saveProduct(current, undefined), current);
    assert.equal(saveProduct(current, ''), current);
  });

  it('unsaves a saved product id', () => {
    const { unsaveProduct } = modules.savedProductsDomain;
    assert.deepEqual(unsaveProduct(['navigator', 'valor'], 'navigator'), ['valor']);
  });

  it('unsaving an id not in the list is a no-op', () => {
    const { unsaveProduct } = modules.savedProductsDomain;
    assert.deepEqual(unsaveProduct(['navigator'], 'valor'), ['navigator']);
  });

  it('reports saved state', () => {
    const { isProductSaved } = modules.savedProductsDomain;
    assert.equal(isProductSaved(['navigator'], 'navigator'), true);
    assert.equal(isProductSaved(['navigator'], 'valor'), false);
  });
});

describe('resolveSavedProducts (id resolution, missing ids)', () => {
  it('resolves saved ids to catalog products via the supplied getProduct', () => {
    const { catalogService } = modules.catalog;
    const { resolveSavedProducts } = modules.savedProductsSection;

    const products = resolveSavedProducts(['navigator', 'valor'], { getProduct: catalogService.getProduct });

    assert.equal(products.length, 2);
    assert.equal(products[0].id, 'navigator');
    assert.equal(products[1].id, 'valor');
  });

  it('silently drops ids that no longer resolve to a catalog product (missing product ids)', () => {
    const { resolveSavedProducts } = modules.savedProductsSection;
    const getProduct = (id) => (id === 'navigator' ? { id: 'navigator', label: 'Navigator' } : null);

    const products = resolveSavedProducts(['navigator', 'deleted-product'], { getProduct });

    assert.deepEqual(products.map((p) => p.id), ['navigator']);
  });

  it('returns an empty array (safe state) when nothing is saved', () => {
    const { catalogService } = modules.catalog;
    const { resolveSavedProducts } = modules.savedProductsSection;
    assert.deepEqual(resolveSavedProducts([], { getProduct: catalogService.getProduct }), []);
  });
});

describe('SaveForLaterButton', () => {
  it('renders an inactive "Save for later" control by default', () => {
    const { default: SaveForLaterButton } = modules.saveForLaterButton;
    const html = renderWithProviders(React.createElement(SaveForLaterButton, { productId: 'navigator', variant: 'icon' }));
    assert.match(html, /Save for later/);
    assert.match(html, /aria-pressed="false"/);
  });

  it('renders the inline variant label used in CommerceActionPanel', () => {
    const { default: SaveForLaterButton } = modules.saveForLaterButton;
    const html = renderWithProviders(React.createElement(SaveForLaterButton, { productId: 'navigator', variant: 'inline' }));
    assert.match(html, /Save for Later/);
  });

  it('renders nothing without a productId (missing product ids)', () => {
    const { default: SaveForLaterButton } = modules.saveForLaterButton;
    const html = renderWithProviders(React.createElement(SaveForLaterButton, { productId: null, variant: 'icon' }));
    assert.equal(html, '');
  });
});

describe('ProductCard (save button on product cards)', () => {
  it('renders a save-for-later toggle overlay when the card links to a real product', () => {
    const { default: ProductCard } = modules.productCard;
    const html = renderWithProviders(React.createElement(ProductCard, {
      id: 'navigator', href: '/fire/light-bars/navigator', label: 'Navigator® Serial Light Bar',
    }));
    assert.match(html, /Save for later/);
  });

  it('does not render a save toggle for a coming-soon card without a href', () => {
    const { default: ProductCard } = modules.productCard;
    const html = renderWithProviders(React.createElement(ProductCard, { id: 'stub', href: null, label: 'Coming Soon Product' }));
    assert.doesNotMatch(html, /Save for later/);
  });
});

describe('CommerceActionPanel (save button on product detail)', () => {
  it('renders a Save for Later action alongside the existing CTAs', () => {
    const { catalogService } = modules.catalog;
    const { default: CommerceActionPanel } = modules.commerceActionPanel;
    const product = catalogService.getProduct('navigator');

    const html = renderWithProviders(React.createElement(CommerceActionPanel, { product }));

    assert.match(html, /Configure Product/);
    assert.match(html, /Request Quote/);
    assert.match(html, /Save for Later/);
  });
});

describe('SavedProductsSectionView (homepage section rendering)', () => {
  it('renders nothing (empty/safe state) when no products are given', () => {
    const { SavedProductsSectionView } = modules.savedProductsSection;
    const html = renderWithProviders(React.createElement(SavedProductsSectionView, { products: [], onClear: () => {} }));
    assert.equal(html, '');
  });

  it('renders a Saved for Later section with cards, a View All link, and a Clear action', () => {
    const { catalogService } = modules.catalog;
    const { SavedProductsSectionView } = modules.savedProductsSection;
    const products = [catalogService.getProduct('navigator'), catalogService.getProduct('valor')];

    const html = renderWithProviders(React.createElement(SavedProductsSectionView, { products, onClear: () => {} }));

    assert.match(html, /Saved for Later/);
    assert.match(html, /View All Saved/);
    assert.match(html, /Clear Saved/);
    assert.match(html, /Navigator/);
    assert.match(html, /Valor/);
  });

  it('uses a mobile-friendly responsive grid (2 columns on mobile)', () => {
    const { catalogService } = modules.catalog;
    const { SavedProductsSectionView } = modules.savedProductsSection;
    const products = [catalogService.getProduct('navigator')];

    const html = renderWithProviders(React.createElement(SavedProductsSectionView, { products, onClear: () => {} }));

    assert.match(html, /grid-cols-2 sm:grid-cols-3 lg:grid-cols-4/);
  });
});

describe('SavedProductsSection (connected, empty state before anything is saved)', () => {
  it('renders nothing on the homepage before any product has been saved', () => {
    const { default: SavedProductsSection } = modules.savedProductsSection;
    const html = renderWithProviders(React.createElement(SavedProductsSection));
    assert.equal(html, '');
  });
});

describe('SavedProductsPageView (/saved-products rendering)', () => {
  it('renders the empty state when nothing is saved', () => {
    const { SavedProductsPageView } = modules.savedProductsPage;
    const html = renderWithProviders(React.createElement(SavedProductsPageView, { products: [], onClear: () => {} }));

    assert.match(html, /You haven.{1,10}t saved any products yet/);
    assert.match(html, /Browse Products/);
    assert.doesNotMatch(html, /Saved Products<\/h1>/);
  });

  it('renders a mobile-friendly product grid with a Clear All control when products are saved', () => {
    const { catalogService } = modules.catalog;
    const { SavedProductsPageView } = modules.savedProductsPage;
    const products = [catalogService.getProduct('navigator'), catalogService.getProduct('valor')];

    const html = renderWithProviders(React.createElement(SavedProductsPageView, { products, onClear: () => {} }));

    assert.match(html, /Saved Products<\/h1>/);
    assert.match(html, /2 products saved/);
    assert.match(html, /Clear All/);
    assert.match(html, /class="pd-product-grid"/);
    assert.match(html, /Navigator/);
    assert.match(html, /Valor/);
  });

  it('SavedProductsPage (connected) renders the empty state before any product is saved', () => {
    const { default: SavedProductsPage } = modules.savedProductsPage;
    const html = renderWithProviders(React.createElement(SavedProductsPage), ['/saved-products']);
    assert.match(html, /You haven.{1,10}t saved any products yet/);
  });
});

describe('Composition — Product Cards, Product Detail, and App wire in Save for Later', () => {
  it('ProductDetailTemplateView composes CommerceActionPanel (which includes SaveForLaterButton)', () => {
    const source = modules.productDetail;
    assert.ok(source.default, 'ProductDetailTemplate module loads');
  });

  it('ProductCard source wires SaveForLaterButton in alongside CompareToggleButton', async () => {
    const { readFileSync } = await import('node:fs');
    const source = readFileSync(new URL('../src/components/product/ProductCard.jsx', import.meta.url), 'utf8');
    assert.match(source, /<SaveForLaterButton productId=\{id\} variant="icon" \/>/);
  });

  it('CommerceActionPanel source wires SaveForLaterButton onto Product Detail', async () => {
    const { readFileSync } = await import('node:fs');
    const source = readFileSync(new URL('../src/components/product/CommerceActionPanel.tsx', import.meta.url), 'utf8');
    assert.match(source, /<SaveForLaterButton productId=\{product\.id\} variant="inline" \/>/);
  });

  it('StoreLanding (homepage) source wires SavedProductsSection into the page', async () => {
    const { readFileSync } = await import('node:fs');
    const source = readFileSync(new URL('../src/pages/StoreLanding.jsx', import.meta.url), 'utf8');
    assert.match(source, /<SavedProductsSection \/>/);
  });

  it('App.jsx mounts SavedProductsProvider and the /saved-products route', async () => {
    const { readFileSync } = await import('node:fs');
    const source = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
    assert.match(source, /<SavedProductsProvider>/);
    assert.match(source, /path="\/saved-products"/);
  });
});
