# Catalog Migration Testing Notes

## Purpose

These notes describe the focused test coverage added for the migrated catalog architecture. The tests use the repository's lightweight `node --test` setup with Vite SSR module loading so the architecture can be verified without introducing browser-only or heavy testing dependencies.

## Covered

- `catalogService` list/get methods for products, categories, and verticals.
- Null return behavior for unknown product, category, and vertical identifiers.
- `normalizeCategory` preservation of category hero, filters, breadcrumbs, product cards, and category-card extension fields.
- `normalizeVertical` preservation of vertical landing sections consumed by `VerticalLandingTemplate`.
- Product validation error formatting with filename, product ID, SKU, field path, and validation message context.
- `useCatalogCategory`, `useCatalogProduct`, `useCatalogVertical`, and `useCatalogLists` initial loading-state contracts under server rendering.
- `VerticalLandingTemplateView` loading, error, and successful-render states from the existing migration test suite.
- Shopify Storefront Catalog Adapter: Storefront→Product/Collection mapping, mock/unavailable/live adapter behavior (including injected-fetch success, network error, HTTP error, and GraphQL error paths), `catalogAdapterService` runtime adapter selection and graceful fallback, `catalogService`'s snapshot-with-fallback wiring, schema validation, and the `/dev/storefront` dashboard hook (`tests/shopify-storefront-catalog-adapter.test.mjs`).

## Not Covered Yet

- Browser hydration and client-side `useEffect` success/error transitions for catalog hooks.
- DOM interaction tests for migrated category and vertical pages.
- Screenshot or pixel-diff verification for no-UI-change guarantees.
- Cross-file semantic catalog validation, such as category product IDs matching product records.
- `ProductDetailTemplate`, `ConfiguratorModule`, commerce, pricing, quote, and package-builder flows, which remain intentionally out of scope for this testing slice.
- Direct mocking of `import.meta.glob` product loader modules; validation error behavior is covered at the reusable validator boundary with product-loader context fields.

## Current Test Stack

The current test script is:

```bash
npm run test
```

It runs:

```bash
node --test tests/*.test.mjs
```

The test files create a Vite dev server in SSR mode and load TypeScript, JSX, aliases, schemas, services, hooks, and pages through `server.ssrLoadModule`. This keeps the tests aligned with the application's Vite module graph while avoiding new runtime behavior.

React Router may emit expected `useLayoutEffect` server-render warnings during SSR component tests. Those warnings do not indicate assertion failures; they reflect the current minimal non-browser test environment.

## Recommended Next Testing Layer

1. Add a browser-capable component test stack, such as Vitest with jsdom and Testing Library, when dependency installation is approved.
2. Add hook tests that assert client-side loading, success, and error transitions after effects resolve.
3. Add page-level DOM assertions for `CategoryTemplate` and `VerticalLandingTemplate` with mocked service outcomes.
4. Add Playwright or another browser E2E layer for screenshot-based no-UI-change verification during production migrations.
5. Add product-data CI validation that runs all typed loaders and reports structured `ProductDataValidationError` output before deploys.
