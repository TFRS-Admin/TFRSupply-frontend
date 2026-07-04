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
    productDetail: await server.ssrLoadModule('/src/pages/ProductDetailTemplate.jsx'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
    vehicle: await server.ssrLoadModule('/src/context/VehicleContext.jsx'),
    configurator: await server.ssrLoadModule('/src/context/ConfiguratorContext.jsx'),
    compare: await server.ssrLoadModule('/src/context/CompareContext.jsx'),
    recentlyViewed: await server.ssrLoadModule('/src/context/RecentlyViewedContext.jsx'),
    sectionHeading: await server.ssrLoadModule('/src/components/product/SectionHeading.jsx'),
    productHero: await server.ssrLoadModule('/src/components/product/ProductHero.jsx'),
    commerceActionPanel: await server.ssrLoadModule('/src/components/product/CommerceActionPanel.jsx'),
    fitmentSummary: await server.ssrLoadModule('/src/components/product/FitmentSummary.jsx'),
    recommendedProducts: await server.ssrLoadModule('/src/components/product/RecommendedProducts.jsx'),
    relatedPackages: await server.ssrLoadModule('/src/components/product/RelatedPackages.jsx'),
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

describe('SectionHeading (shared section title)', () => {
  it('renders the label, an optional icon, and an optional description', () => {
    const { default: SectionHeading } = modules.sectionHeading;
    const html = renderToString(
      React.createElement(SectionHeading, { description: 'Helper copy' }, 'Recommended Products'),
    );

    assert.match(html, /Recommended Products/);
    assert.match(html, /Helper copy/);
  });

  it('is reused by Recommended Products, Related Packages, and Fitment Summary instead of duplicating the heading style', () => {
    for (const path of [
      '../src/components/product/RecommendedProducts.jsx',
      '../src/components/product/RelatedPackages.jsx',
      '../src/components/product/FitmentSummary.jsx',
      '../src/pages/ProductDetailTemplate.jsx',
    ]) {
      const source = readFileSync(new URL(path, import.meta.url), 'utf8');
      assert.match(source, /SectionHeading/, `${path} should reuse SectionHeading`);
    }
  });
});

describe('ProductHero polish', () => {
  it('renders gallery images with a position indicator and tap-friendly quick links', () => {
    const { default: ProductHero } = modules.productHero;
    const html = renderWithProviders(
      React.createElement(ProductHero, {
        title: 'Test Product',
        images: [
          { src: '/a.jpg', alt: 'A' },
          { src: '/b.jpg', alt: 'B' },
        ],
        bullets: ['Feature one', 'Feature two'],
        actions: { whereToBuyUrl: '#wtb', requestInfoUrl: '#info' },
        actionLabels: { configurator: 'Configure', manual: 'Manual' },
      }),
    );

    assert.match(html, /1<!-- --> \/ <!-- -->2/);
    assert.match(html, /Feature one/);
    assert.match(html, /product-hero-quick-links/);
    assert.match(html, /Where to Buy/);
  });

  it('renders nothing for the gallery thumbnail strip with only one image', () => {
    const { default: ProductHero } = modules.productHero;
    const html = renderWithProviders(
      React.createElement(ProductHero, {
        title: 'Single Image Product',
        images: [{ src: '/a.jpg', alt: 'A' }],
      }),
    );

    assert.doesNotMatch(html, /Show image 1/);
  });
});

describe('CommerceActionPanel CTA hierarchy', () => {
  it('gives the primary Configure Product action full-row emphasis via the pd-cta-grid hook', () => {
    const { catalogService } = modules.catalog;
    const { default: CommerceActionPanel } = modules.commerceActionPanel;
    const product = catalogService.getProduct('navigator');

    const html = renderWithProviders(React.createElement(CommerceActionPanel, { product }));

    assert.match(html, /pd-cta-grid/);
    assert.match(html, /grid-column:1 \/ -1/);
  });
});

describe('Product detail responsive grid hooks', () => {
  it('tags the recommended products, related packages, and fitment grids for tablet step-down', () => {
    const css = readFileSync(new URL('../src/styles/mobileStorefront.css', import.meta.url), 'utf8');

    assert.match(
      css,
      /@media \(min-width: 768px\) and \(max-width: 1023px\)[\s\S]*?\.pd-recommend-grid,\s*\.pd-package-grid,\s*\.pd-fitment-grid[\s\S]*?repeat\(2, 1fr\)/,
    );
  });

  it('renders the recommend/package/fitment grids with their tablet-aware class names', () => {
    const { catalogService } = modules.catalog;
    const { default: RecommendedProducts } = modules.recommendedProducts;
    const { default: RelatedPackages } = modules.relatedPackages;
    const { default: FitmentSummary } = modules.fitmentSummary;
    const product = catalogService.getProduct('navigator');

    const recommendHtml = renderWithProviders(React.createElement(RecommendedProducts, {
      product, verticalId: 'fire', categoryId: 'light-bars',
    }));
    const packagesHtml = renderWithProviders(React.createElement(RelatedPackages, {
      product: { id: 'navigator', commerce: { related_packages: ['pkg-installer-1'] } },
    }));
    const fitmentHtml = renderWithProviders(React.createElement(FitmentSummary, { product }));

    assert.match(recommendHtml, /pd-recommend-grid/);
    assert.match(packagesHtml, /pd-package-grid/);
    assert.match(fitmentHtml, /pd-fitment-grid/);
  });
});

describe('ProductDetailTemplateView composition (polished)', () => {
  it('still renders the full enhanced product detail experience end to end', () => {
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
    assert.match(html, /Product Overview/);
  });
});
