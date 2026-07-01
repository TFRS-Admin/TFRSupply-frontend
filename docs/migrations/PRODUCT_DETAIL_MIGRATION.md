# Product Detail Migration

## Summary

`src/pages/ProductDetailTemplate.jsx` now reads product data through the typed catalog architecture instead of calling the legacy product loader directly. The migration preserves the live preview behavior and keeps routing, styling, product JSON, configurator behavior, pricing, quote, Shopify/cart behavior, and commerce logic unchanged.

## Old Dependency Graph

```text
ProductDetailTemplate.jsx
  ↓
src/lib/dataLoader.js loadProduct / loadCategory
  ↓
import.meta.glob('../data/products/*.json') and categories
  ↓
product and category JSON
```

## New Dependency Graph

```text
ProductDetailTemplate.jsx
  ↓
useCatalogProduct / useCatalogCategory
  ↓
catalogService
  ↓
loadTypedProduct / loadTypedCategory
  ↓
normalizeProduct / normalizeCategory
  ↓
Zod schemas
  ↓
product and category JSON
```

## Migrated Files

- `src/pages/ProductDetailTemplate.jsx`
- `src/types/product.ts`
- `src/schemas/product.schema.ts`
- `src/data/validators/normalizers.ts`
- `tests/product-detail-migration.test.mjs`

## Product Domain Extensions

The product domain now preserves the legacy read-only view fields required by `ProductDetailTemplate` and `ProductTabs`, including:

- `title` and `subtitle`
- `breadcrumbs`
- `media.hero` and `media.gallery`
- `marketing.features`, `marketing.benefits`, and `marketing.applications`
- `specifications` as the existing product detail specification map
- `documentation`
- `commerce` display/accessory/SKU-table fields
- `cta`
- `tabs_component`, `tabs`, and `configuratorId`

These extensions keep the typed `Product` contract as the source of truth and avoid creating a duplicate product model for the migrated page.

## Preserved Behavior

- Existing product detail layout and styling are unchanged.
- Existing configurator JSON loading remains in place to avoid changing configurator behavior.
- `NavigatorTabs` and `ProductTabs` are still selected from the product data fields as before.
- Missing full product records still fall back to category product stubs when available.
- Missing products without stubs still render the existing `NotFound` flow.
- Validation failures continue to surface intentionally through the hook/service/data-loader chain.

## Live Preview Smoke-Test Checklist

Use the Railway preview environment only; do not treat it as production.

1. Open `/fire/light-bars/navigator` and confirm the Navigator product detail page renders the same hero, gallery, CTA, and tabs.
2. Open another configured product detail route, such as `/police/light-bars/valor`, and confirm the generic product tabs still render.
3. Refresh each product detail URL directly and confirm the Caddy SPA fallback still serves the app.
4. Confirm configuring/build tabs behave as before and no configurator option behavior changed.
5. Confirm no product JSON, pricing, quote, Shopify/cart, or routing behavior changed.

## Remaining Legacy Dependencies

- Configurator rendering still loads configurator JSON directly inside existing configurator paths.
- `ProductTabs` still loads configurator JSON for configurator tab content.
- Commerce and Shopify cart behavior remain on their existing legacy paths.
- Site navigation still has legacy data access points documented in prior migration notes.

## Recommended Next Migration

Migrate configurator data access behind `configuratorService` only after dedicated tests are added for option rendering, SKU behavior, and existing configurator interactions.
