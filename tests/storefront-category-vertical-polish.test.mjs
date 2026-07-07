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
    categoryFilter: await server.ssrLoadModule('/src/domain/catalog/categoryProductFilter.ts'),
    categoryTemplate: await server.ssrLoadModule('/src/pages/CategoryTemplate.jsx'),
    productSearchPage: await server.ssrLoadModule('/src/pages/ProductSearchPage.jsx'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
    vehicle: await server.ssrLoadModule('/src/context/VehicleContext.jsx'),
    configurator: await server.ssrLoadModule('/src/context/ConfiguratorContext.jsx'),
    compare: await server.ssrLoadModule('/src/context/CompareContext.jsx'),
    recentlyViewed: await server.ssrLoadModule('/src/context/RecentlyViewedContext.jsx'),
    savedProducts: await server.ssrLoadModule('/src/context/SavedProductsContext.jsx'),
    fleetProject: await server.ssrLoadModule('/src/context/FleetProjectContext.jsx'),
    fleetBuilds: await server.ssrLoadModule('/src/context/FleetBuildsContext.jsx'),
    fleetTemplates: await server.ssrLoadModule('/src/context/FleetTemplatesContext.jsx'),
    departmentStandards: await server.ssrLoadModule('/src/context/DepartmentStandardsContext.jsx'),
    upfitBuilder: await server.ssrLoadModule('/src/context/UpfitBuilderContext.jsx'),
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
  const { FleetTemplatesProvider } = modules.fleetTemplates;
  const { DepartmentStandardsProvider } = modules.departmentStandards;
  const { UpfitBuilderProvider } = modules.upfitBuilder;

  return renderToString(
    React.createElement(MemoryRouter, { initialEntries },
      React.createElement(VehicleProvider, null,
        React.createElement(CompareProvider, null,
          React.createElement(RecentlyViewedProvider, null,
            React.createElement(SavedProductsProvider, null,
              React.createElement(FleetProjectProvider, null,
                React.createElement(FleetBuildsProvider, null,
                  React.createElement(FleetTemplatesProvider, null,
                    React.createElement(DepartmentStandardsProvider, null,
                      React.createElement(UpfitBuilderProvider, null,
                        React.createElement(ConfiguratorProvider, null, element),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

function renderCategoryView(verticalId, categoryId, overrides = {}) {
  const { catalogService } = modules.catalog;
  const { CategoryTemplateView } = modules.categoryTemplate;
  const data = overrides.data !== undefined ? overrides.data : catalogService.getCategory(categoryId);

  return renderWithProviders(
    React.createElement(CategoryTemplateView, {
      verticalId,
      categoryId,
      data,
      loading: overrides.loading ?? false,
      error: overrides.error ?? null,
    }),
    [`/${verticalId}/${categoryId}`],
  );
}

describe('CategoryTemplate breadcrumbs', () => {
  it('sources the vertical crumb label from catalogService instead of title-casing the verticalId', () => {
    const html = renderCategoryView('fire', 'light-bars');

    // The "fire" vertical's real label is "Fire/EMS" — a naive
    // charAt(0).toUpperCase() of the verticalId would render "Fire" instead.
    assert.match(html, />Fire\/EMS<\/a>/);
    assert.match(html, /href="\/fire"/);
  });

  it('falls back to a title-cased verticalId when the vertical is not in catalogService', () => {
    const html = renderCategoryView('unknown-vertical', 'light-bars');
    assert.match(html, />Unknown vertical<\/a>/);
  });

  it('reuses the shared ProductBreadcrumb component', () => {
    const source = readFileSync(new URL('../src/pages/CategoryTemplate.jsx', import.meta.url), 'utf8');
    assert.match(source, /import ProductBreadcrumb from '@\/components\/product\/ProductBreadcrumb'/);
    assert.match(source, /<ProductBreadcrumb/);
  });
});

describe('CategoryTemplate filter and search reuse', () => {
  it('reuses ProductFilterPanel and ProductSearchBar instead of duplicating the UI', () => {
    const source = readFileSync(new URL('../src/pages/CategoryTemplate.jsx', import.meta.url), 'utf8');
    assert.match(source, /import ProductFilterPanel from '@\/components\/product\/ProductFilterPanel'/);
    assert.match(source, /import ProductSearchBar from '@\/components\/product\/ProductSearchBar'/);
    assert.match(source, /<ProductFilterPanel/);
    assert.match(source, /<ProductSearchBar/);
  });

  it('renders the filter groups and search input for a category with filters', () => {
    const html = renderCategoryView('police', 'light-bars');

    assert.match(html, /Filter By/);
    assert.match(html, /Vehicle Type/);
    assert.match(html, /Profile/);
    assert.match(html, /Length/);
    assert.match(html, /placeholder="Search this category…"/);
  });

  it('still composes StorefrontCollectionPanel (rendered client-side; verified here at the source level since its data hook never resolves during synchronous SSR)', () => {
    const source = readFileSync(new URL('../src/pages/CategoryTemplate.jsx', import.meta.url), 'utf8');
    assert.match(source, /import StorefrontCollectionPanel from '@\/components\/product\/StorefrontCollectionPanel'/);
    assert.match(source, /<StorefrontCollectionPanel categoryId={data\.id} \/>/);
  });

  it('renders every product in the category before any filter/search is applied', () => {
    const { catalogService } = modules.catalog;
    const category = catalogService.getCategory('light-bars');
    const html = renderCategoryView('police', 'light-bars');

    category.products.forEach((product) => {
      assert.match(html, new RegExp(product.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    });
    // React SSR inserts <!-- --> comment separators between adjacent JSX
    // expressions, so "N products" is not one contiguous text node.
    assert.match(html, new RegExp(`${category.products.length}<!-- -->\\s*product<!-- -->s`));
  });
});

describe('filterCategoryProducts (extracted for unit testing without simulating user input)', () => {
  it('narrows the product list by a single-select sidebar filter', () => {
    const { filterCategoryProducts } = modules.categoryFilter;
    const { catalogService } = modules.catalog;
    const products = catalogService.getCategory('light-bars').products;
    const expectedPoliceProducts = products.filter((product) => product.vehicle_type === 'Police');

    const filtered = filterCategoryProducts(products, { vehicle_type: 'Police' }, '');

    assert.equal(filtered.length, expectedPoliceProducts.length);
    assert.ok(filtered.length > 0, 'expected at least one Police product');
    assert.ok(filtered.every((product) => product.vehicle_type === 'Police'));
  });

  it('narrows the product list by a free-text keyword against label/tagline/specs', () => {
    const { filterCategoryProducts } = modules.categoryFilter;
    const { catalogService } = modules.catalog;
    const products = catalogService.getCategory('light-bars').products;

    const filtered = filterCategoryProducts(products, {}, 'fire apparatus');

    assert.ok(filtered.length > 0);
    assert.ok(filtered.every((p) => `${p.label} ${p.tagline}`.toLowerCase().includes('fire apparatus')));
  });

  it('combines an active filter and a keyword and can produce an empty result', () => {
    const { filterCategoryProducts } = modules.categoryFilter;
    const { catalogService } = modules.catalog;
    const products = catalogService.getCategory('light-bars').products;

    const filtered = filterCategoryProducts(products, { vehicle_type: 'Police' }, 'no-such-product-xyz');

    assert.equal(filtered.length, 0);
  });

  it('is a no-op (returns every product) with no active filter and no keyword', () => {
    const { filterCategoryProducts } = modules.categoryFilter;
    const { catalogService } = modules.catalog;
    const products = catalogService.getCategory('light-bars').products;

    const filtered = filterCategoryProducts(products, {}, '');

    assert.equal(filtered.length, products.length);
  });
});

describe('CategoryTemplateView loading/error/empty states', () => {
  it('renders nothing during loading state', () => {
    const html = renderCategoryView('police', 'light-bars', { data: null, loading: true });
    assert.equal(html, '');
  });

  it('throws during error state', () => {
    const error = new Error('category failed');
    assert.throws(() => renderCategoryView('police', 'light-bars', { data: null, error }), /category failed/);
  });

  it('renders a NotFound view for an unknown category instead of throwing', () => {
    const html = renderCategoryView('police', 'does-not-exist', { data: null });
    // React SSR inserts <!-- --> between "Category" and "Not Found".
    assert.match(html, /Category<!-- --> Not Found/);
  });
});

describe('ProductSearchPage breadcrumbs', () => {
  it('reuses the shared ProductBreadcrumb component instead of a duplicated local one', () => {
    const source = readFileSync(new URL('../src/pages/ProductSearchPage.jsx', import.meta.url), 'utf8');
    assert.match(source, /import ProductBreadcrumb from '@\/components\/product\/ProductBreadcrumb'/);
    assert.doesNotMatch(source, /function Breadcrumbs/);
  });

  it('renders "Browse Products" with no query and the query text when searching', () => {
    const { default: ProductSearchPage } = modules.productSearchPage;

    const browseHtml = renderWithProviders(React.createElement(ProductSearchPage), ['/search']);
    assert.match(browseHtml, /Browse Products/);

    const queryHtml = renderWithProviders(React.createElement(ProductSearchPage), ['/search?q=navigator']);
    // React SSR HTML-escapes quotes in text content into &quot;.
    assert.match(queryHtml, /Search: &quot;navigator&quot;/);
  });
});

describe('mobile-safe product grid', () => {
  it('keeps the tablet and mobile pd-product-grid breakpoints scoped below desktop width', () => {
    const css = readFileSync(new URL('../src/styles/mobileStorefront.css', import.meta.url), 'utf8');

    assert.match(css, /@media \(min-width: 768px\) and \(max-width: 1023px\)[\s\S]*?\.pd-product-grid[\s\S]*?repeat\(2, 1fr\)/);
    assert.match(css, /@media \(max-width: 767px\)[\s\S]*?\.pd-product-grid[\s\S]*?1fr/);
  });

  it('CategoryTemplate and ProductSearchPage both use the shared pd-product-grid / pd-filter-layout classes', () => {
    const categorySource = readFileSync(new URL('../src/pages/CategoryTemplate.jsx', import.meta.url), 'utf8');
    const searchSource = readFileSync(new URL('../src/pages/ProductSearchPage.jsx', import.meta.url), 'utf8');

    for (const source of [categorySource, searchSource]) {
      assert.match(source, /className="pd-filter-layout"/);
      assert.match(source, /className="pd-product-grid"/);
    }
  });
});
