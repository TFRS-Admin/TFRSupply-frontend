# Shopify Storefront Product Sync

## Purpose

This foundation establishes typed contracts, an adapter boundary, and a service/hook layer for a future read-only synchronization between a catalog `Product` (Product Data Platform / Catalog Service) and its Shopify Storefront product record. It is architecture-only: no live Shopify Storefront API call, no GraphQL execution, no checkout change, and no auth change is implemented. It reuses the existing Product Data Platform, Catalog Service, Commerce Foundation, Shopify Storefront API Foundation, and Product Detail Experience instead of duplicating any product loading, validation, or Storefront request-shape logic they already own.

## Ownership

- `src/types/shopifyStorefrontProduct.ts` owns `ShopifyStorefrontProductRequest`, `ShopifyStorefrontProductResult`, `ShopifyStorefrontProductMapping`, `ShopifyStorefrontProductPreview`, `ShopifyStorefrontProductStatus`, `ShopifyStorefrontProductError`, `ShopifyStorefrontProductErrorCode`, `ShopifyStorefrontProductAdapterMode`, and `ShopifyStorefrontProductCapabilities`.
- `src/schemas/shopifyStorefrontProduct.schema.ts` owns runtime Zod validation aligned to every one of those contracts.
- `src/adapters/shopifyStorefrontProduct/` owns the `ShopifyStorefrontProductAdapter` interface and its three implementations.
- `src/services/shopifyStorefrontProduct/shopifyStorefrontProductService.ts` owns request building, mapping derivation, preview generation, and adapter orchestration.
- `src/hooks/shopifyStorefrontProduct/useShopifyStorefrontProduct.ts` owns the React-facing `useShopifyStorefrontProduct()` and `useShopifyStorefrontProductPreview()` hooks.
- `src/components/product/StorefrontProductPanel.jsx` owns the read-only Storefront Product panel composed onto Product Detail.

## Dependency direction

```text
React hooks → shopifyStorefrontProductService → ShopifyStorefrontProductAdapter → future Shopify Storefront GraphQL API
                                          ↓                              ↑
                       shopifyStorefrontProduct schemas / types   buildStorefrontFetchRequest()
                                          ↓                    (Shopify Storefront API Foundation)
                                   catalogService (Catalog Service)
                                          ↓
                            typed product loaders (Product Data Platform)
```

`shopifyStorefrontProductService` is the sole caller of the adapter and the sole caller of `catalogService.getProduct()` for this foundation. It never calls the Commerce Foundation, Cart Workspace, or Checkout Preparation services — this is a separate, parallel boundary focused on product-level (not cart-line) Storefront readiness.

## Mapping derivation

`buildStorefrontProductMapping(product)` (exported from `src/services/shopifyStorefrontProduct`) is a pure function that derives a `ShopifyStorefrontProductMapping` from an existing catalog `Product`, reusing fields the Product Detail Experience already reads:

| Mapping field | Derived from |
| --- | --- |
| `handle` | `product.slug` |
| `variantCount` | `product.commerce.sku_table.length` when present, else `1` if `product.sku` is set, else `0` |
| `mediaCount` | `product.media.gallery.length` plus `1` if `product.media.hero` is set |
| `shopifyProductId` / `shopifyProductGid` | `product.shopify.productId` / `product.shopify.productGid` (the existing `Product.shopify` metadata bag) when present, else `null` |
| `mapped` | `true` when either Shopify identifier above is present |

No new catalog field, loader, or Shopify request produces these values — `product.shopify` already exists on `Product` (`src/types/product.ts`) as an optional, untyped metadata bag for exactly this kind of future integration.

## Adapter boundary

`src/adapters/shopifyStorefrontProduct/shopifyStorefrontProductAdapter.ts` defines the interface every implementation must satisfy:

```ts
interface ShopifyStorefrontProductAdapter {
  execute(input: ShopifyStorefrontProductAdapterInput): Promise<ShopifyStorefrontProductResult>;
}
```

`ShopifyStorefrontProductAdapterInput` carries the `requestId`, `productId`, the already-derived `mapping`, the already-built `preview`, and an optional partial `ShopifyStorefrontClientConfig` — the adapter's only job is deciding `status`/`errors` for its mode, the same narrow request/response-translation role `ShopifyStorefrontCartAdapter` plays for cart lines.

Three adapters are provided:

- `unavailableShopifyStorefrontProductAdapter` — the default adapter used by `shopifyStorefrontProductService` when no adapter is injected. Every `execute()` call returns an `adapter-unavailable` result (mapping and preview still included, computed deterministically) with a retryable error. No network call is made.
- `mockShopifyStorefrontProductAdapter` — deterministic, in-memory adapter for tests and local development. `execute()` resolves as a successful dry run (`status: 'dry-run'`) passing the mapping and preview through unchanged. It performs no I/O.
- `createLiveShopifyStorefrontProductAdapter(config)` / `liveShopifyStorefrontProductAdapter` — a **stub only**. It reuses `buildStorefrontFetchRequest()` from the Shopify Storefront API Foundation (`src/adapters/shopifyStorefront/liveShopifyStorefrontAdapter.ts`) to build the exact fetch request shape a real `productByHandle` query would send, but its `execute()` always resolves with `status: 'failed'` and error code `live-calls-disabled`; it never calls `fetch`.

## Query preview

`shopifyStorefrontProductService` builds a `ShopifyStorefrontProductPreview` (`operationName: 'ProductByHandlePreview'`) — a read-only GraphQL query string and `{ handle }` variables — for every request. This is a pure string/object builder with no network I/O, mirroring `ShopifyStorefrontCartMutationPreview` from the Shopify Storefront Cart Adapter Foundation. No GraphQL operation in this foundation is ever executed against a real endpoint.

## Service responsibilities

`shopifyStorefrontProductService` (`createShopifyStorefrontProductService(adapter, catalog)`, defaulting to `unavailableShopifyStorefrontProductAdapter` and `catalogService`) exposes:

- `buildRequest(productId, overrides?)` — builds a deterministic, schema-validated `ShopifyStorefrontProductRequest` (`dryRun` is always `true`). Assigns a `requestId` (`storefront-product-request-{sequence}`) when the caller does not supply one.
- `execute(request)` — validates the request with `shopifyStorefrontProductRequestSchema`, resolves the catalog product via `catalogService.getProduct(productId)`, derives the mapping, builds the preview, delegates to the adapter's `execute()`, and validates the result with `shopifyStorefrontProductResultSchema`. If no catalog product exists for `productId`, it returns a `failed` result with a `validation-error` without calling the adapter — the same fail-fast behavior the Catalog Service's read path already exhibits.
- `previewProduct(productId, config?)` — convenience entry point used by the Product Detail Storefront Product panel: builds and executes a request for a single `productId`.
- `getCapabilities()` — returns `ShopifyStorefrontProductCapabilities` (`dryRunOnly: true`, `liveCallsEnabled: false`, and the injected adapter's `adapterMode`).

The service never calls Shopify itself and never bypasses the adapter boundary.

## Product Detail integration

`StorefrontProductPanel` (`src/components/product/StorefrontProductPanel.jsx`) is composed onto `ProductDetailTemplateView` (`src/pages/ProductDetailTemplate.jsx`), rendered just below `CommerceActionPanel`. It calls `useShopifyStorefrontProductPreview(product.id)` and renders, read-only:

- **Storefront readiness** — a status dot/label derived from `result.status === 'dry-run' && mapping.mapped` (never fabricated as ready with the default unavailable adapter).
- **Mapping status** — "Mapped" / "Unmapped" from `mapping.mapped`.
- **Variant count** — `mapping.variantCount`.
- **Media count** — `mapping.mediaCount`.
- **Handle** — `mapping.handle`.
- **Adapter mode** — the adapter mode reported in the result's metadata (`unavailable` by default).

This is purely additive, read-only UI — it renders whatever `ShopifyStorefrontProductResult` the service reports and never changes any existing hero, commerce summary, fitment, recommendation, or CTA behavior on Product Detail. Because the default adapter is `unavailableShopifyStorefrontProductAdapter`, the panel shows "Storefront Not Ready" / "Not Connected" by default and no runtime behavior changes.

## Integration with existing foundations

- **Product Data Platform / Catalog Service**: `shopifyStorefrontProductService` is a read-only consumer of `catalogService.getProduct(productId)` — the same synchronous, typed read path `ProductDetailExperience`'s `RecommendedProducts` already uses. No new catalog field, loader, or validation rule was added.
- **Commerce Foundation**: This foundation does not modify `commerceService`, `CommerceAdapter`, `VariantMapping`, or any cart-line/checkout readiness logic. Product-level Storefront mapping (this foundation) and cart-line-level Storefront mapping (`SHOPIFY_STOREFRONT_CART_ADAPTER.md`) are deliberately separate, parallel concerns.
- **Shopify Storefront API Foundation**: The live adapter stub reuses `buildStorefrontFetchRequest()` rather than redefining the Storefront GraphQL request shape, matching the pattern the Shopify Storefront Cart Adapter Foundation already established.
- **Product Detail Experience**: `StorefrontProductPanel` is a new, additive composed component alongside `ProductCommerceSummary`, `FitmentSummary`, and `RelatedPackages` — it does not change `ProductHero`'s `infoPanel` prop or any existing composed component's behavior.

## Future live implementation plan

A future issue can introduce a real Storefront product lookup by:

1. Replacing `createLiveShopifyStorefrontProductAdapter`'s `execute()` body with an actual `fetch()` call against the request built by `buildStorefrontFetchRequest()`, parsing the GraphQL response into an updated `ShopifyStorefrontProductMapping`.
2. Populating `Product.shopify.productId` / `Product.shopify.productGid` from a real sync source so `buildStorefrontProductMapping()` reports `mapped: true` without any service change.
3. Expanding the query preview to request additional fields (pricing, inventory) only after the corresponding foundation (Commerce, Pricing) is connected.
4. Wiring `useShopifyStorefrontProductPreview()` into additional read surfaces (Product Discovery, Category listings) only after the live adapter is connected and validated — this foundation intentionally stops short of that expansion.

## Explicit non-goals

This foundation does not implement: real Shopify Storefront API calls, GraphQL execution, checkout creation or changes, authentication changes, product mutation, variant mutation, media upload, or inventory sync. It does not change any existing checkout, cart, pricing, configurator, or catalog runtime behavior. `mockShopifyStorefrontProductAdapter`'s dry-run response is not a substitute for real Shopify product data and must not be treated as one.
