# Product Discovery Foundation

The Product Discovery Foundation is the customer-facing search/browse surface at `/search`, plus the shared card, search bar, and filter components it introduces for reuse across the storefront. It extends the existing read-only `catalogService` boundary with a `searchProducts()` method rather than introducing a parallel product query layer, and it routes every result toward the existing product detail page (`/:verticalId/:categoryId/:productId`), which already hosts the configurator, quote, and commerce CTAs — this foundation does not duplicate any of that logic.

## Architecture

```text
ProductSearchPage → useProductSearch / useCatalogLists → catalogService.searchProducts() → typed product loaders
       │                                                          │
       ├─ ProductSearchBar (controlled input, URL-driven)         └─ productSearchQuerySchema / productListResultSchema
       ├─ ProductFilterPanel (vertical + category filter groups)
       └─ ProductCard (shared with CategoryTemplate) → resolveProductDetailPath() → /:verticalId/:categoryId/:productId
```

- `src/types/product.ts` adds `ProductSearchFilter`, `ProductSearchQuery`, `ProductListResult`, and `ProductListStatus` alongside the existing `Product`/`Category`/`Vertical` contracts — no new product shape is introduced.
- `src/schemas/product.schema.ts` adds `productSearchFilterSchema`, `productSearchQuerySchema`, and `productListResultSchema`, composing the existing `productSchema` rather than redefining product fields.
- `src/services/catalog/catalogService.ts` adds `searchProducts(query?)`, which validates the request, filters `listTypedProducts()` by `verticalId`/`categoryId`/`vendor` and a case-insensitive free-text match over label/title/subtitle/description/vendor/product family/SKU/marketing features, and returns a `ProductListResult` (`status: 'ready' | 'empty' | 'unavailable'`). It calls the same loaders `listProducts()`/`getProduct()` already use — no second product read path exists.
- `src/hooks/useCatalog.ts` adds `useProductSearch()`, following the same `{ data, loading, error, search() }` shape as `useCustomerSearch()` (Customer Workspace Foundation). It contains no query-matching or filter logic — it only formats `catalogService.searchProducts()` results into render-ready state.
- `src/domain/catalog/productNavigation.ts` adds the pure function `resolveProductDetailPath(product, options?)`, the single place that builds the `/:verticalId/:categoryId/:productId` route from a `Product`'s `verticalIds[0]`/`categoryIds[0]` (or explicit overrides). It contains no React, service, or I/O code.

## Shared Components (`src/components/product/`)

- `ProductCard.jsx` — a display-only card (image, label, tagline, specs, badges, CTA) that accepts a view-model, not a raw `Product` or `CategoryProductCard`, so both `ProductSearchPage` and `CategoryTemplate` can render results from their respective data shapes without reshaping one to match the other. `CategoryTemplate.jsx`'s existing product grid was refactored to render this same component in place of its inline card markup — the filter logic and denormalized `CategoryProductCard` data on that page are unchanged.
- `ProductSearchBar.jsx` — a controlled search input; callers own debouncing/navigation via `onSearch`.
- `ProductFilterPanel.jsx` — a single-select-per-group filter sidebar with an "All" option and reset-all action, generalized from the filter UI already shipped on `CategoryTemplate` so `ProductSearchPage` did not need a second implementation.

## `/search` Page

`src/pages/ProductSearchPage.jsx`, registered in `src/App.jsx` as `/search`:

- Reads `q`, `vertical`, and `category` from the URL query string (`useSearchParams`) so a search/filter state is shareable and back/forward-navigable.
- Calls `useCatalogLists()` to populate the vertical and category filter options (reusing the existing hook — no new list-loading logic).
- Calls `useProductSearch().search({ query, filter: { verticalId, categoryId } })` whenever the URL-derived query or filters change.
- Renders results as `ProductCard`s linking to `resolveProductDetailPath(product)`; a product with no vertical/category association renders as a non-clickable "Details coming soon" card instead of a broken link.
- Shows a loading count, an empty-state message when a search/filter combination matches nothing, and a "Browse All Products" heading when no query is present.
- Also reads two additive query params from the Guided Vehicle Upfit Builder's "Browse" CTA (`GUIDED_UPFIT_BUILDER.md`): `upfitCategory` and `guidedBuild=1` (plus `fleetProjectId`/`fleetBuildId` when known). When `guidedBuild=1` is present, the page shows a "Recommended for this build" banner naming the upfit category and a link back to `/upfit-builder` — these params never filter or gate the search results themselves, which still come from the same `q`-driven free-text `searchProducts()` call every other visitor triggers.
- When a fleet build is active (`useFleetBuilds()`), the page additionally shows a "Recommended for Your Build" section (Vehicle Build Recommendations Engine, `VEHICLE_BUILD_RECOMMENDATIONS.md`) above the results grid — `generateRecommendations` scored against the active build/standard/build style and, when present, the guided step named by `upfitCategory`. This section is purely additive: it never reorders or filters the `products` grid below it.

## CTA Flow

Product Discovery's job stops at getting a shopper from a search/browse result to the right product detail page — `ProductDetailTemplate.jsx` already owns the configurator (`ConfiguratorModule`), quote/where-to-buy links (`Product.cta`), and commerce display fields (`Product.commerce`). No configurator, quote, cart, or checkout logic was added or duplicated by this foundation.

The storefront's search input (`SiteHeader.jsx`'s desktop/mobile bars, shared by every route including the homepage) is wired to submit to `/search?q=<value>` instead of being an inert `<input>` element with no handler.

## Explicit Non-goals

This foundation does not implement CRM/admin tooling, a sales pipeline, a database, live Shopify Admin/Storefront API calls, checkout changes, or authentication changes. It does not change the `Category`/`Vertical` JSON contract, the `/:verticalId` or `/:verticalId/:categoryId` routes' data source, or the configurator/quote/commerce logic on the product detail page — it only adds a new read path (`searchProducts`) over the same product data and a new page that consumes it.

## Testing

`tests/product-discovery.test.mjs` covers: `catalogService.searchProducts()` with no arguments (full catalog, `status: 'ready'`), vertical-only and combined vertical+category filtering, case-insensitive free-text matching across label/subtitle/marketing copy, the `'empty'` status case (no matches, `total` still reflects the full catalog), `useProductSearch()`'s idle initial state, and `resolveProductDetailPath()`'s route-building, option-override, and null-when-unroutable behavior.

**Known gap**: as with every other hook-driven customer page (see `docs/migrations/TESTING_NOTES.md`), the repository's `node --test` + Vite-SSR stack has no DOM/jsdom layer, so `ProductSearchPage.jsx`'s client-side behavior (typing in the search bar, clicking a filter option, the empty-state render) is not exercised by an automated browser test — only the underlying schema, service, hook, and domain layers are. This was manually verified in a running dev server (see PR description).
