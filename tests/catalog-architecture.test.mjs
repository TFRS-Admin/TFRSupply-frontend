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
    normalizers: await server.ssrLoadModule('/src/data/validators/normalizers.ts'),
    productSchema: await server.ssrLoadModule('/src/schemas/product.schema.ts'),
    validateSchema: await server.ssrLoadModule('/src/data/validators/validateSchema.ts'),
    validationError: await server.ssrLoadModule('/src/data/validators/validationError.ts'),
  };
});

after(async () => {
  await server?.close();
});

function renderHookProbe(useHook, argument) {
  function HookProbe() {
    const state = useHook(argument);
    return React.createElement('span', {
      'data-loading': String(state.loading),
      'data-has-data': String(Boolean(state.data)),
      'data-has-error': String(Boolean(state.error)),
    });
  }

  return renderToString(React.createElement(HookProbe));
}

function renderListHookProbe() {
  const { useCatalogLists } = modules.hooks;

  function HookProbe() {
    const state = useCatalogLists();
    return React.createElement('span', {
      'data-loading': String(state.loading),
      'data-product-count': String(state.products.length),
      'data-category-count': String(state.categories.length),
      'data-vertical-count': String(state.verticals.length),
      'data-has-error': String(Boolean(state.error)),
    });
  }

  return renderToString(React.createElement(HookProbe));
}

describe('catalogService get/list methods', () => {
  it('lists and gets products, categories, and verticals through the service boundary', () => {
    const { catalogService } = modules.catalog;

    const products = catalogService.listProducts();
    const categories = catalogService.listCategories();
    const verticals = catalogService.listVerticals();

    assert.equal(products.length, 5);
    assert.equal(categories.length, 1);
    assert.equal(verticals.length, 3);
    assert.equal(catalogService.getProduct('navigator')?.id, 'navigator');
    assert.equal(catalogService.getCategory('light-bars')?.id, 'light-bars');
    assert.equal(catalogService.getVertical('police')?.id, 'police');
  });

  it('returns null for unknown catalog identifiers without swallowing validation failures', () => {
    const { catalogService } = modules.catalog;

    assert.equal(catalogService.getProduct('missing-product'), null);
    assert.equal(catalogService.getCategory('missing-category'), null);
    assert.equal(catalogService.getVertical('missing-vertical'), null);
  });
});

describe('category normalizer', () => {
  it('preserves existing category view fields and product-card extension fields', () => {
    const { normalizeCategory } = modules.normalizers;

    const category = normalizeCategory({
      id: 'light-bars',
      label: 'Light Bars',
      description: 'Warning products',
      verticals: ['police'],
      hero: {
        title: 'Emergency Light Bars',
        subtitle: 'Purpose-built warning systems',
        image: '/images/light-bars.jpg',
        imageAlt: 'Light bar on vehicle',
      },
      filters: [{ id: 'mount', label: 'Mount', options: ['Roof', 'Interior'] }],
      products: [{
        id: 'navigator',
        label: 'Navigator',
        href: '/products/navigator',
        specs: ['Serial control'],
        badges: ['Featured'],
        customDisplayField: 'Preserved for category cards',
      }],
      breadcrumbs: [{ label: 'Home', to: '/' }, { label: 'Light Bars' }],
    });

    assert.equal(category.id, 'light-bars');
    assert.equal(category.verticalId, 'police');
    assert.equal(category.hero?.title, 'Emergency Light Bars');
    assert.equal(category.image?.src, '/images/light-bars.jpg');
    assert.deepEqual(category.filters?.[0]?.options, ['Roof', 'Interior']);
    assert.equal(category.products?.[0]?.customDisplayField, 'Preserved for category cards');
    assert.equal(category.breadcrumbs?.[1]?.label, 'Light Bars');
  });
});

describe('vertical normalizer', () => {
  it('preserves vertical landing sections used by the migrated template', () => {
    const { normalizeVertical } = modules.normalizers;

    const vertical = normalizeVertical({
      id: 'police',
      label: 'Police',
      hero: {
        title: 'Police Vehicle Safety Devices',
        subtitle: 'Reduce roadside risk',
      },
      categories_section: {
        eyebrow: 'Catalog',
        title: 'Shop by category',
        items: [{ label: 'Light Bars', categoryId: 'light-bars', href: '/police/light-bars' }],
      },
      resources_section: {
        title: 'Resources',
        items: [{ label: 'Guide', href: '/resources/guide', external: true }],
      },
    });

    assert.equal(vertical.slug, 'police');
    assert.equal(vertical.hero?.title, 'Police Vehicle Safety Devices');
    assert.equal(vertical.categories_section?.items[0]?.categoryId, 'light-bars');
    assert.equal(vertical.resources_section?.items[0]?.external, true);
  });
});

describe('product validation errors', () => {
  it('formats Zod validation failures with product-loader context fields', () => {
    const { productSchema } = modules.productSchema;
    const { validateProductData } = modules.validateSchema;
    const { ProductDataValidationError } = modules.validationError;

    assert.throws(
      () => validateProductData(productSchema, {
        id: 'broken-product',
        label: 'Broken Product',
        slug: 'broken-product',
        verticalIds: 'police',
        categoryIds: [],
      }, {
        filename: '../products/broken-product.json',
        id: 'broken-product',
        productId: 'broken-product',
        sku: 'BROKEN-SKU',
      }),
      (error) => {
        assert.ok(error instanceof ProductDataValidationError);
        assert.match(error.message, /file=\.\.\/products\/broken-product\.json/);
        assert.match(error.message, /productId=broken-product/);
        assert.match(error.message, /sku=BROKEN-SKU/);
        assert.match(error.message, /field=verticalIds/);
        assert.match(error.message, /Expected array/);
        return true;
      },
    );
  });
});

describe('useCatalog hooks', () => {
  it('exposes category hook loading state before effects resolve', () => {
    const { useCatalogCategory } = modules.hooks;
    const html = renderHookProbe(useCatalogCategory, 'light-bars');

    assert.match(html, /data-loading="true"/);
    assert.match(html, /data-has-data="false"/);
    assert.match(html, /data-has-error="false"/);
  });

  it('exposes product hook loading state before effects resolve', () => {
    const { useCatalogProduct } = modules.hooks;
    const html = renderHookProbe(useCatalogProduct, 'navigator');

    assert.match(html, /data-loading="true"/);
    assert.match(html, /data-has-data="false"/);
    assert.match(html, /data-has-error="false"/);
  });

  it('exposes vertical hook loading state before effects resolve', () => {
    const { useCatalogVertical } = modules.hooks;
    const html = renderHookProbe(useCatalogVertical, 'police');

    assert.match(html, /data-loading="true"/);
    assert.match(html, /data-has-data="false"/);
    assert.match(html, /data-has-error="false"/);
  });

  it('exposes list hook loading state with empty collections before effects resolve', () => {
    const html = renderListHookProbe();

    assert.match(html, /data-loading="true"/);
    assert.match(html, /data-product-count="0"/);
    assert.match(html, /data-category-count="0"/);
    assert.match(html, /data-vertical-count="0"/);
    assert.match(html, /data-has-error="false"/);
  });
});
