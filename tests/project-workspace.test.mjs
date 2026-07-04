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
    workspacePage: await server.ssrLoadModule('/src/pages/WorkspaceDashboard.jsx'),
    workspaceButton: await server.ssrLoadModule('/src/components/navigator/WorkspaceButton.jsx'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
    vehicle: await server.ssrLoadModule('/src/context/VehicleContext.jsx'),
    compare: await server.ssrLoadModule('/src/context/CompareContext.jsx'),
    recentlyViewed: await server.ssrLoadModule('/src/context/RecentlyViewedContext.jsx'),
    savedProducts: await server.ssrLoadModule('/src/context/SavedProductsContext.jsx'),
    configurator: await server.ssrLoadModule('/src/context/ConfiguratorContext.jsx'),
  };
});

after(async () => {
  await server?.close();
});

function renderWithProviders(element, initialEntries = ['/workspace']) {
  const { MemoryRouter } = modules.router;
  const { VehicleProvider } = modules.vehicle;
  const { CompareProvider } = modules.compare;
  const { RecentlyViewedProvider } = modules.recentlyViewed;
  const { SavedProductsProvider } = modules.savedProducts;
  const { ConfiguratorProvider } = modules.configurator;

  return renderToString(
    React.createElement(MemoryRouter, { initialEntries },
      React.createElement(VehicleProvider, null,
        React.createElement(CompareProvider, null,
          React.createElement(RecentlyViewedProvider, null,
            React.createElement(SavedProductsProvider, null,
              React.createElement(ConfiguratorProvider, null, element),
            ),
          ),
        ),
      ),
    ),
  );
}

function baseViewProps(overrides = {}) {
  return {
    savedProducts: [],
    recentlyViewedProducts: [],
    compareProducts: [],
    cartSummary: null,
    cartLoading: false,
    selectedVehicle: null,
    configuratorState: { selectedFamily: null, accessories: [] },
    onClearSaved: () => {},
    onClearRecentlyViewed: () => {},
    onRemoveFromCompare: () => {},
    onClearCompare: () => {},
    onOpenVehicleModal: () => {},
    ...overrides,
  };
}

describe('resolveCompareQueueProducts (id resolution, missing ids)', () => {
  it('resolves compare ids to catalog products via the supplied getProduct', () => {
    const { catalogService } = modules.catalog;
    const { resolveCompareQueueProducts } = modules.workspacePage;

    const products = resolveCompareQueueProducts(['navigator', 'valor'], { getProduct: catalogService.getProduct });

    assert.equal(products.length, 2);
    assert.equal(products[0].id, 'navigator');
    assert.equal(products[1].id, 'valor');
  });

  it('silently drops ids that no longer resolve to a catalog product (missing product ids)', () => {
    const { resolveCompareQueueProducts } = modules.workspacePage;
    const getProduct = (id) => (id === 'navigator' ? { id: 'navigator', label: 'Navigator' } : null);

    const products = resolveCompareQueueProducts(['navigator', 'deleted-product'], { getProduct });

    assert.deepEqual(products.map((p) => p.id), ['navigator']);
  });

  it('returns an empty array (safe state) when nothing is queued', () => {
    const { catalogService } = modules.catalog;
    const { resolveCompareQueueProducts } = modules.workspacePage;
    assert.deepEqual(resolveCompareQueueProducts([], { getProduct: catalogService.getProduct }), []);
  });
});

describe('WorkspaceDashboardView (rendering)', () => {
  it('renders the workspace heading, site header, and breadcrumb', () => {
    const { WorkspaceDashboardView } = modules.workspacePage;
    const html = renderWithProviders(React.createElement(WorkspaceDashboardView, baseViewProps()));

    assert.match(html, /My Workspace<\/h1>/);
    assert.match(html, /TFR SUPPLY/);
    assert.match(html, /Home<\/a>/);
  });
});

describe('WorkspaceDashboardView (empty state)', () => {
  it('renders an empty-state note for every section when nothing has been saved, viewed, compared, or configured', () => {
    const { WorkspaceDashboardView } = modules.workspacePage;
    const html = renderWithProviders(React.createElement(WorkspaceDashboardView, baseViewProps()));

    assert.match(html, /No vehicle selected yet/);
    assert.match(html, /Your cart is empty/);
    assert.match(html, /Select up to 4 products while browsing/);
    assert.match(html, /No recent configurations yet/);
    assert.match(html, /You haven.{1,10}t saved any products yet/);
    assert.match(html, /Products you view will show up here/);
  });

  it('does not render any product cards when every section is empty', () => {
    const { WorkspaceDashboardView } = modules.workspacePage;
    const html = renderWithProviders(React.createElement(WorkspaceDashboardView, baseViewProps()));

    assert.doesNotMatch(html, /View All Saved/);
    assert.doesNotMatch(html, /Clear Recently Viewed/);
    assert.doesNotMatch(html, /Compare Now/);
  });
});

describe('WorkspaceDashboardView (section visibility with data)', () => {
  it('renders the Selected Vehicle section with a Change Vehicle action once a vehicle is selected', () => {
    const { WorkspaceDashboardView } = modules.workspacePage;
    const html = renderWithProviders(React.createElement(WorkspaceDashboardView, baseViewProps({
      selectedVehicle: { year: '2023', make: 'Ford', model: 'Explorer', trim: 'Police Interceptor' },
    })));

    assert.match(html, /2023 Ford Explorer Police Interceptor/);
    assert.match(html, /Change Vehicle/);
  });

  it('renders Cart Summary totals and a View Cart link once the cart has items', () => {
    const { WorkspaceDashboardView } = modules.workspacePage;
    const html = renderWithProviders(React.createElement(WorkspaceDashboardView, baseViewProps({
      cartSummary: {
        itemCount: 4, lineCount: 3, currencyCode: 'USD',
        subtotal: { amount: 5650, currencyCode: 'USD' }, estimatedShipping: null, estimatedTax: null,
        grandTotalEstimate: { amount: 5650, currencyCode: 'USD' },
      },
    })));

    assert.match(html, /3 line items, 4 units/);
    assert.match(html, /View Cart/);
    assert.match(html, /\$5,650\.00/);
  });

  it('renders Compare Queue thumbnails, remove controls, and a Compare Now link once products are queued', () => {
    const { catalogService } = modules.catalog;
    const { WorkspaceDashboardView } = modules.workspacePage;
    const compareProducts = [catalogService.getProduct('navigator'), catalogService.getProduct('valor')];

    const html = renderWithProviders(React.createElement(WorkspaceDashboardView, baseViewProps({ compareProducts })));

    assert.match(html, /Compare Queue \(2\/4\)/);
    assert.match(html, /Compare Now/);
    assert.match(html, /Remove Navigator/);
  });

  it('renders an in-progress configuration summary from ConfiguratorContext state', () => {
    const { WorkspaceDashboardView } = modules.workspacePage;
    const html = renderWithProviders(React.createElement(WorkspaceDashboardView, baseViewProps({
      configuratorState: { selectedFamily: 'Navigator Light Bar', accessories: [{ id: 'a1' }, { id: 'a2' }] },
    })));

    assert.match(html, /In progress: Navigator Light Bar/);
    assert.match(html, /2 accessories selected/);
  });

  it('renders Saved Products and Recently Viewed grids with a mobile-friendly responsive class', () => {
    const { catalogService } = modules.catalog;
    const { WorkspaceDashboardView } = modules.workspacePage;
    const products = [catalogService.getProduct('navigator'), catalogService.getProduct('valor')];

    const html = renderWithProviders(React.createElement(WorkspaceDashboardView, baseViewProps({
      savedProducts: products,
      recentlyViewedProducts: products,
    })));

    assert.match(html, /View All Saved/);
    assert.match(html, /Clear Recently Viewed/);
    assert.match(html, /grid-cols-2 sm:grid-cols-3 lg:grid-cols-4/);
    assert.match(html, /Navigator/);
    assert.match(html, /Valor/);
  });

  it('always renders the Quote Builder shortcut and Continue Shopping CTA', () => {
    const { WorkspaceDashboardView } = modules.workspacePage;
    const html = renderWithProviders(React.createElement(WorkspaceDashboardView, baseViewProps()));

    assert.match(html, /Quote Builder/);
    assert.match(html, /Request a Quote/);
    assert.match(html, /Continue Shopping/);
  });
});

describe('WorkspaceDashboardView (mobile-safe structure)', () => {
  it('stacks the summary cards in a single column on mobile before widening on larger breakpoints', () => {
    const { WorkspaceDashboardView } = modules.workspacePage;
    const html = renderWithProviders(React.createElement(WorkspaceDashboardView, baseViewProps()));

    assert.match(html, /grid-cols-1 md:grid-cols-2 lg:grid-cols-3/);
  });
});

describe('WorkspaceDashboard (connected, integration with existing contexts)', () => {
  it('renders the empty workspace before anything has been saved, viewed, compared, or added to cart', () => {
    const { default: WorkspaceDashboard } = modules.workspacePage;
    const html = renderWithProviders(React.createElement(WorkspaceDashboard));

    assert.match(html, /My Workspace/);
    assert.match(html, /No vehicle selected yet/);
    assert.match(html, /You haven.{1,10}t saved any products yet/);
  });
});

describe('WorkspaceButton (header entry point)', () => {
  it('renders a button that links to /workspace', () => {
    const { default: WorkspaceButton } = modules.workspaceButton;
    const html = renderWithProviders(React.createElement(WorkspaceButton));

    assert.match(html, /Open my workspace/);
  });
});

describe('Composition — App and SiteHeader wire in the Project Workspace', () => {
  it('App.jsx mounts the /workspace route', async () => {
    const { readFileSync } = await import('node:fs');
    const source = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
    assert.match(source, /import WorkspaceDashboard from '@\/pages\/WorkspaceDashboard'/);
    assert.match(source, /path="\/workspace"/);
  });

  it('SiteHeader source wires WorkspaceButton into the header actions', async () => {
    const { readFileSync } = await import('node:fs');
    const source = readFileSync(new URL('../src/components/navigator/SiteHeader.jsx', import.meta.url), 'utf8');
    assert.match(source, /<WorkspaceButton \/>/);
  });
});
