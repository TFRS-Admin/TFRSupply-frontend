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
    productNavigation: await server.ssrLoadModule('/src/domain/catalog/productNavigation.ts'),
  };
});

after(async () => {
  await server?.close();
});

function renderProductSearchHookProbe() {
  const { useProductSearch } = modules.hooks;

  function HookProbe() {
    const state = useProductSearch();
    return React.createElement('span', {
      'data-loading': String(state.loading),
      'data-has-data': String(Boolean(state.data)),
      'data-has-error': String(Boolean(state.error)),
    });
  }

  return renderToString(React.createElement(HookProbe));
}

describe('catalogService.searchProducts', () => {
  it('returns every product with a ready status when no query or filter is given', () => {
    const { catalogService } = modules.catalog;
    const allProducts = catalogService.listProducts();

    const result = catalogService.searchProducts();

    assert.equal(result.status, 'ready');
    assert.equal(result.total, allProducts.length);
    assert.equal(result.products.length, allProducts.length);
    assert.ok(result.products.length >= 5, `expected at least 5 products, got ${result.products.length}`);
  });

  it('filters products by verticalId without dropping the total catalog count', () => {
    const { catalogService } = modules.catalog;
    const allProducts = catalogService.listProducts();
    const expectedCount = allProducts.filter((product) => product.verticalIds.includes('police')).length;

    const result = catalogService.searchProducts({ filter: { verticalId: 'police' } });

    assert.equal(result.status, 'ready');
    assert.equal(result.total, allProducts.length);
    assert.equal(result.products.length, expectedCount);
    assert.ok(result.products.length > 0, 'expected at least one police product');
    assert.ok(result.products.every((product) => product.verticalIds.includes('police')));
  });

  it('combines verticalId and categoryId filters', () => {
    const { catalogService } = modules.catalog;
    const allProducts = catalogService.listProducts();
    const expectedCount = allProducts.filter(
      (product) => product.verticalIds.includes('fire') && product.categoryIds.includes('light-bars'),
    ).length;

    const result = catalogService.searchProducts({ filter: { verticalId: 'fire', categoryId: 'light-bars' } });

    assert.equal(result.products.length, expectedCount);
    assert.ok(result.products.length > 0, 'expected at least one matching product');
    assert.ok(result.products.every((product) => product.verticalIds.includes('fire') && product.categoryIds.includes('light-bars')));
  });

  it('matches free-text queries against label, subtitle, and marketing copy', () => {
    const { catalogService } = modules.catalog;

    const result = catalogService.searchProducts({ query: 'linear mini' });

    assert.equal(result.status, 'ready');
    assert.equal(result.products.length, 1);
    assert.equal(result.products[0].id, 'navigator-linear-mini');
  });

  it('reports an empty status without losing the catalog total when nothing matches', () => {
    const { catalogService } = modules.catalog;
    const allProducts = catalogService.listProducts();

    const result = catalogService.searchProducts({ query: 'no-such-product-xyz' });

    assert.equal(result.status, 'empty');
    assert.equal(result.products.length, 0);
    assert.equal(result.total, allProducts.length);
  });

  it('is case-insensitive and ignores surrounding whitespace', () => {
    const { catalogService } = modules.catalog;

    const result = catalogService.searchProducts({ query: '  NAVIGATOR SERIAL  ' });

    assert.equal(result.products.some((product) => product.id === 'navigator-serial'), true);
  });
});

describe('useProductSearch', () => {
  it('starts idle with no data, error, or loading state before search() is called', () => {
    const html = renderProductSearchHookProbe();

    assert.match(html, /data-loading="false"/);
    assert.match(html, /data-has-data="false"/);
    assert.match(html, /data-has-error="false"/);
  });
});

describe('resolveProductDetailPath', () => {
  it('builds the /:verticalId/:categoryId/:productId route from the product contract', () => {
    const { resolveProductDetailPath } = modules.productNavigation;

    const path = resolveProductDetailPath({ id: 'navigator', verticalIds: ['fire'], categoryIds: ['light-bars'] });

    assert.equal(path, '/fire/light-bars/navigator');
  });

  it('prefers explicit vertical/category options over the product defaults', () => {
    const { resolveProductDetailPath } = modules.productNavigation;

    const path = resolveProductDetailPath(
      { id: 'navigator', verticalIds: ['fire'], categoryIds: ['light-bars'] },
      { verticalId: 'police' },
    );

    assert.equal(path, '/police/light-bars/navigator');
  });

  it('returns null when a product has no vertical or category to route into', () => {
    const { resolveProductDetailPath } = modules.productNavigation;

    assert.equal(resolveProductDetailPath({ id: 'orphan', verticalIds: [], categoryIds: [] }), null);
    assert.equal(resolveProductDetailPath({ id: 'orphan', verticalIds: ['fire'], categoryIds: [] }), null);
  });
});
