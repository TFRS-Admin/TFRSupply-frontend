import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
    storeLanding: await server.ssrLoadModule('/src/pages/StoreLanding.jsx'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
    vehicle: await server.ssrLoadModule('/src/context/VehicleContext.jsx'),
    configurator: await server.ssrLoadModule('/src/context/ConfiguratorContext.jsx'),
    compare: await server.ssrLoadModule('/src/context/CompareContext.jsx'),
    recentlyViewed: await server.ssrLoadModule('/src/context/RecentlyViewedContext.jsx'),
    savedProducts: await server.ssrLoadModule('/src/context/SavedProductsContext.jsx'),
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
  const { ConfiguratorProvider } = modules.configurator;
  const { CompareProvider } = modules.compare;
  const { RecentlyViewedProvider } = modules.recentlyViewed;
  const { SavedProductsProvider } = modules.savedProducts;
  const { FleetProjectProvider } = modules.fleetProject;
  const { FleetBuildsProvider } = modules.fleetBuilds;

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

describe('homepage route', () => {
  it('wires the "/" route to StoreLanding in App.jsx', () => {
    const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
    assert.match(appSource, /<Route path="\/" element=\{<StoreLanding \/>\} \/>/);
  });

  it('renders without throwing', () => {
    const { default: StoreLanding } = modules.storeLanding;
    const html = renderWithProviders(React.createElement(StoreLanding));
    assert.match(html, /TFR Supply/);
  });
});

describe('StoreLandingView', () => {
  it('renders the primary CTA into product discovery and the secondary CTA into the configurator flow', () => {
    const { StoreLandingView } = modules.storeLanding;
    const html = renderWithProviders(
      React.createElement(StoreLandingView, { products: [], categories: [] }),
    );

    assert.match(html, /href="\/search"[^>]*>Shop All Products/);
    assert.match(html, /href="\/fire\/light-bars\/navigator"[^>]*>Configure Your Equipment/);
  });

  it('renders a vertical navigation card for every configured vertical, including coming-soon ones', () => {
    const { StoreLandingView } = modules.storeLanding;
    const html = renderWithProviders(
      React.createElement(StoreLandingView, { products: [], categories: [] }),
    );

    assert.match(html, /Police/);
    assert.match(html, /Fire\/EMS/);
    assert.match(html, /Work Truck/);
    assert.match(html, /Signaling Devices/);
    assert.match(html, /Coming Soon/);
    assert.match(html, /href="\/police"/);
    assert.match(html, /href="\/fire"/);
    assert.match(html, /href="\/work-truck"/);
  });

  it('renders featured categories sourced from catalogService.listCategories()', () => {
    const { catalogService } = modules.catalog;
    const { StoreLandingView } = modules.storeLanding;
    const categories = catalogService.listCategories();

    const html = renderWithProviders(
      React.createElement(StoreLandingView, { products: [], categories }),
    );

    assert.equal(categories.length > 0, true);
    categories.forEach((category) => {
      assert.match(html, new RegExp(`href="/${category.verticalId}/${category.id}"`));
      assert.match(html, new RegExp(category.label));
    });
  });

  it('omits the featured categories section when catalogService has no categories', () => {
    const { StoreLandingView } = modules.storeLanding;
    const html = renderWithProviders(
      React.createElement(StoreLandingView, { products: [], categories: [] }),
    );

    assert.doesNotMatch(html, /Shop by Category/);
  });

  it('skips a category with no resolvable vertical instead of linking to a broken/protocol-relative route', () => {
    const { StoreLandingView } = modules.storeLanding;
    const brokenCategory = { id: 'orphan', label: 'Orphan Category', verticalId: '', description: 'no vertical' };

    const html = renderWithProviders(
      React.createElement(StoreLandingView, { products: [], categories: [brokenCategory] }),
    );

    assert.doesNotMatch(html, /Shop by Category/);
    assert.doesNotMatch(html, /href="\/\//);
    assert.doesNotMatch(html, /Orphan Category/);
  });

  it('renders featured products sourced from catalogService.listProducts() via ProductCard', () => {
    const { catalogService } = modules.catalog;
    const { StoreLandingView } = modules.storeLanding;
    const products = catalogService.listProducts();

    const html = renderWithProviders(
      React.createElement(StoreLandingView, { products, categories: [] }),
    );

    assert.equal(products.length > 0, true);
    assert.match(html, /VIEW DETAILS/);
    assert.match(html, new RegExp(products[0].label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  it('caps featured products at four cards', () => {
    const { catalogService } = modules.catalog;
    const { StoreLandingView } = modules.storeLanding;
    const products = catalogService.listProducts();

    const html = renderWithProviders(
      React.createElement(StoreLandingView, { products, categories: [] }),
    );

    const viewDetailsCount = (html.match(/VIEW DETAILS/g) || []).length;
    assert.equal(viewDetailsCount, Math.min(products.length, 4));
  });

  it('uses mobile-first responsive grid classes for card sections', () => {
    const { StoreLandingView } = modules.storeLanding;
    const html = renderWithProviders(
      React.createElement(StoreLandingView, { products: [], categories: [] }),
    );

    assert.match(html, /grid-cols-2 md:grid-cols-3 lg:grid-cols-5/);
  });
});
