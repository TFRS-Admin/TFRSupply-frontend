# Shopify Storefront Collection Sync

## Purpose

This foundation establishes typed contracts, an adapter boundary, and a service/hook layer for a future read-only synchronization between a catalog `Category` (Catalog Service / Product Data Platform) and its Shopify Storefront collection record. It is architecture-only: no live Shopify Storefront API call, no GraphQL execution, no collection publishing, no inventory, no checkout, and no auth change is implemented. It reuses the existing Product Data Platform, Catalog Service, Commerce Foundation, and Shopify Storefront API Foundation instead of duplicating any category loading, validation, or Storefront request-shape logic they already own — following the same pattern the Shopify Storefront Product Sync Foundation established for products.

## Ownership

- `src/types/shopifyStorefrontCollection.ts` owns `ShopifyStorefrontCollectionRequest`, `ShopifyStorefrontCollectionResult`, `ShopifyStorefrontCollectionMapping`, `ShopifyStorefrontCollectionPreview`, `ShopifyStorefrontCollectionStatus`, `ShopifyStorefrontCollectionError`, `ShopifyStorefrontCollectionErrorCode`, `ShopifyStorefrontCollectionAdapterMode`, and `ShopifyStorefrontCollectionCapabilities`.
- `src/schemas/shopifyStorefrontCollection.schema.ts` owns runtime Zod validation aligned to every one of those contracts.
- `src/adapters/shopifyStorefrontCollection/` owns the `ShopifyStorefrontCollectionAdapter` interface and its three implementations.
- `src/services/shopifyStorefrontCollection/shopifyStorefrontCollectionService.ts` owns request building, mapping derivation, preview generation, and adapter orchestration.
- `src/hooks/shopifyStorefrontCollection/useShopifyStorefrontCollection.ts` owns the React-facing `useShopifyStorefrontCollection()` and `useShopifyStorefrontCollectionPreview()` hooks.
- `src/components/product/StorefrontCollectionPanel.jsx` owns the read-only Storefront Collection panel composed onto the customer-facing Category page.

## Category contract addition

`Category` (`src/types/product.ts`) gained one optional field, `shopify?: Record<string, unknown>`, mirroring the existing `Product.shopify` metadata bag that `SHOPIFY_STOREFRONT_PRODUCT_SYNC.md` already reuses. `categorySchema` (`src/schemas/product.schema.ts`) gained the matching optional field. This is additive — existing category JSON validates unchanged — and gives a future sync source a place to write `collectionId`/`collectionGid` without any new catalog loader, normalizer, or schema.

## Dependency direction

```text
React hooks → shopifyStorefrontCollectionService → ShopifyStorefrontCollectionAdapter → future Shopify Storefront GraphQL API
                                            ↓                                ↑
                       shopifyStorefrontCollection schemas / types    buildStorefrontFetchRequest()
                                            ↓                      (Shopify Storefront API Foundation)
                                     catalogService (Catalog Service)
                                            ↓
                              typed category/product loaders (Product Data Platform)
```

`shopifyStorefrontCollectionService` is the sole caller of the adapter and the sole caller of `catalogService.getCategory()` / `catalogService.searchProducts()` for this foundation. It never calls the Commerce Foundation, Cart Workspace, or Checkout Preparation services — this is a separate, parallel boundary focused on category-level (not cart-line or product-level) Storefront readiness.

## Mapping derivation

`buildStorefrontCollectionMapping(category, productCount)` (exported from `src/services/shopifyStorefrontCollection`) is a pure function that derives a `ShopifyStorefrontCollectionMapping` from an existing catalog `Category` and a product count already resolved by the service, reusing fields the Category Template already reads:

| Mapping field | Derived from |
| --- | --- |
| `handle` | `category.slug` |
| `verticalId` | `category.verticalId` |
| `productCount` | `catalogService.searchProducts({ filter: { categoryId } }).total` |
| `shopifyCollectionId` / `shopifyCollectionGid` | `category.shopify.collectionId` / `category.shopify.collectionGid` (the new `Category.shopify` metadata bag) when present, else `null` |
| `mapped` | `true` when either Shopify identifier above is present |

No new catalog loader or Shopify request produces these values — `catalogService.getCategory()` and `catalogService.searchProducts()` are the same synchronous, typed read paths `CategoryTemplate` and Product Discovery already use.

## Adapter boundary

`src/adapters/shopifyStorefrontCollection/shopifyStorefrontCollectionAdapter.ts` defines the interface every implementation must satisfy:

```ts
interface ShopifyStorefrontCollectionAdapter {
  execute(input: ShopifyStorefrontCollectionAdapterInput): Promise<ShopifyStorefrontCollectionResult>;
}
```

`ShopifyStorefrontCollectionAdapterInput` carries the `requestId`, `categoryId`, the already-derived `mapping`, the already-built `preview`, and an optional partial `ShopifyStorefrontClientConfig` — the adapter's only job is deciding `status`/`errors` for its mode, the same narrow request/response-translation role `ShopifyStorefrontProductAdapter` plays for products.

Three adapters are provided:

- `unavailableShopifyStorefrontCollectionAdapter` — the default adapter used by `shopifyStorefrontCollectionService` when no adapter is injected. Every `execute()` call returns an `adapter-unavailable` result (mapping and preview still included, computed deterministically) with a retryable error. No network call is made.
- `mockShopifyStorefrontCollectionAdapter` — deterministic, in-memory adapter for tests and local development. `execute()` resolves as a successful dry run (`status: 'dry-run'`) passing the mapping and preview through unchanged. It performs no I/O.
- `createLiveShopifyStorefrontCollectionAdapter(config)` / `liveShopifyStorefrontCollectionAdapter` — a **stub only**. It reuses `buildStorefrontFetchRequest()` from the Shopify Storefront API Foundation (`src/adapters/shopifyStorefront/liveShopifyStorefrontAdapter.ts`) to build the exact fetch request shape a real `collectionByHandle` query would send, but its `execute()` always resolves with `status: 'failed'` and error code `live-calls-disabled`; it never calls `fetch`.

## Query preview

`shopifyStorefrontCollectionService` builds a `ShopifyStorefrontCollectionPreview` (`operationName: 'CollectionByHandlePreview'`) — a read-only GraphQL query string and `{ handle }` variables — for every request. This is a pure string/object builder with no network I/O, mirroring `ShopifyStorefrontProductPreview` from the Shopify Storefront Product Sync Foundation. No GraphQL operation in this foundation is ever executed against a real endpoint.

## Service responsibilities

`shopifyStorefrontCollectionService` (`createShopifyStorefrontCollectionService(adapter, catalog)`, defaulting to `unavailableShopifyStorefrontCollectionAdapter` and `catalogService`) exposes:

- `buildRequest(categoryId, overrides?)` — builds a deterministic, schema-validated `ShopifyStorefrontCollectionRequest` (`dryRun` is always `true`). Assigns a `requestId` (`storefront-collection-request-{sequence}`) when the caller does not supply one.
- `execute(request)` — validates the request with `shopifyStorefrontCollectionRequestSchema`, resolves the catalog category via `catalogService.getCategory(categoryId)`, resolves the product count via `catalogService.searchProducts()`, derives the mapping, builds the preview, delegates to the adapter's `execute()`, and validates the result with `shopifyStorefrontCollectionResultSchema`. If no catalog category exists for `categoryId`, it returns a `failed` result with a `validation-error` without calling the adapter — the same fail-fast behavior `shopifyStorefrontProductService` already exhibits.
- `previewCollection(categoryId, config?)` — convenience entry point used by the Category page's Storefront Collection panel: builds and executes a request for a single `categoryId`.
- `getCapabilities()` — returns `ShopifyStorefrontCollectionCapabilities` (`dryRunOnly: true`, `liveCallsEnabled: false`, and the injected adapter's `adapterMode`).

The service never calls Shopify itself and never bypasses the adapter boundary.

## Category page integration

`StorefrontCollectionPanel` (`src/components/product/StorefrontCollectionPanel.jsx`) is composed onto `CategoryTemplate` (`src/pages/CategoryTemplate.jsx`), rendered above the product grid's result count. It calls `useShopifyStorefrontCollectionPreview(category.id)` and renders, read-only:

- **Collection readiness** — a status dot/label derived from `result.status === 'dry-run' && mapping.mapped` (never fabricated as ready with the default unavailable adapter).
- **Mapping status** — "Mapped" / "Unmapped" from `mapping.mapped`.
- **Collection handle** — `mapping.handle`.
- **Product count** — `mapping.productCount`.
- **Adapter mode** — the adapter mode reported in the result's metadata (`unavailable` by default).

This is purely additive, read-only UI — it renders whatever `ShopifyStorefrontCollectionResult` the service reports and never changes any existing hero, breadcrumb, filter, or product grid behavior on the Category page. No routing change and no customer workflow change was made. Because the default adapter is `unavailableShopifyStorefrontCollectionAdapter`, the panel shows "Collection Not Ready" / "Not Connected" by default and no runtime behavior changes.

## Integration with existing foundations

- **Product Data Platform / Catalog Service**: `shopifyStorefrontCollectionService` is a read-only consumer of `catalogService.getCategory(categoryId)` and `catalogService.searchProducts({ filter: { categoryId } })` — the same synchronous, typed read paths `CategoryTemplate` and Product Discovery already use. No new catalog loader or validation rule was added beyond the additive `Category.shopify` field.
- **Commerce Foundation**: This foundation does not modify `commerceService`, `CommerceAdapter`, `VariantMapping`, or any cart-line/checkout readiness logic. Category-level Storefront mapping (this foundation) and cart-line-level or product-level Storefront mapping (`SHOPIFY_STOREFRONT_CART_ADAPTER.md`, `SHOPIFY_STOREFRONT_PRODUCT_SYNC.md`) are deliberately separate, parallel concerns.
- **Shopify Storefront API Foundation**: The live adapter stub reuses `buildStorefrontFetchRequest()` rather than redefining the Storefront GraphQL request shape, matching the pattern the Shopify Storefront Product Sync and Cart Adapter foundations already established.
- **Shopify Storefront Product Sync**: This foundation is a category-scoped sibling of `shopifyStorefrontProductService`, reusing the identical three-adapter (mock/unavailable/live-stub) shape, request/result contract naming, and service/hook layering, but resolving through `catalogService.getCategory()` instead of `catalogService.getProduct()`.
- **Product Discovery**: `catalogService.searchProducts({ filter: { categoryId } })` — the same read path Product Discovery's `/search` page uses — is reused unchanged to compute `productCount`; no new search filter or query type was added.

## Future live implementation plan

A future issue can introduce a real Storefront collection lookup by:

1. Replacing `createLiveShopifyStorefrontCollectionAdapter`'s `execute()` body with an actual `fetch()` call against the request built by `buildStorefrontFetchRequest()`, parsing the GraphQL response into an updated `ShopifyStorefrontCollectionMapping`.
2. Populating `Category.shopify.collectionId` / `Category.shopify.collectionGid` from a real sync source so `buildStorefrontCollectionMapping()` reports `mapped: true` without any service change.
3. Expanding the query preview to request additional collection fields (image, description, sort order) only after the corresponding foundation is connected.
4. Wiring collection publishing (creating or updating a Shopify collection from a Category) only after the live adapter is connected and validated — this foundation intentionally stops short of that expansion.

## Explicit non-goals

This foundation does not implement: real Shopify Storefront API calls, GraphQL execution, collection publishing or mutation, inventory sync, checkout creation or changes, authentication changes, or customer account changes. It does not change any existing checkout, cart, pricing, configurator, or catalog runtime behavior. `mockShopifyStorefrontCollectionAdapter`'s dry-run response is not a substitute for real Shopify collection data and must not be treated as one.

## Shopify Storefront Live Configuration Readiness

The Shopify Storefront Live Configuration Readiness foundation (see [SHOPIFY_STOREFRONT_LIVE_CONFIG_READINESS.md](./SHOPIFY_STOREFRONT_LIVE_CONFIG_READINESS.md)) reads this foundation's `shopifyStorefrontCollectionService.getCapabilities()`'s `adapterMode` into its aggregated `ShopifyStorefrontCapabilitySummary`. `StorefrontCollectionPanel` additionally renders a shared, read-only `StorefrontConfigReadinessRow` (config status, required env var presence, redacted store domain) via `useShopifyStorefrontConfig()`, alongside the existing mapping/adapter-mode display, without changing any mapping derivation or adapter-selection logic.
