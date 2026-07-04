# Commerce Platform Foundation

## Purpose

The Commerce Platform Foundation defines typed boundaries for future Shopify product, variant, inventory, mapping, and cart-line readiness work. It is architecture-only and does not change checkout behavior, product detail behavior, configurator behavior, pricing calculations, quote generation, routing, or styling.

## Ownership

- `src/types/commerce.ts` owns shared commerce domain contracts.
- `src/schemas/commerce.schema.ts` owns runtime validation schemas aligned to those contracts.
- `src/adapters/commerce` owns adapter interfaces and the placeholder Shopify adapter factory.
- `src/services/commerce` owns commerce use-case orchestration.
- `src/hooks/commerce` owns typed React-facing hooks for future commerce data migration.

## Dependency Direction

```text
React hooks → commerceService → CommerceAdapter → future external commerce provider
                          ↓
                   commerce schemas/types
```

The current adapter is intentionally unavailable and returns pending lookup results. No Shopify API, checkout API, pricing resolver, quote generator, catalog runtime, or configurator runtime is connected by this foundation.

## Non-goals

This foundation does not implement checkout, pricing calculations, quote generation, Shopify API calls, add-to-cart behavior, or cart persistence. Future work must replace the unavailable adapter behind `CommerceAdapter` and validate external data with the commerce Zod schemas before exposing it to hooks or components.

## Issue 22 Shopify Synchronization Layer

The Shopify synchronization layer adds architecture-only contracts for future reconciliation between TFRSupply and Shopify. It does not call Shopify APIs, mutate catalog records, change checkout readiness, resolve prices, alter configurator behavior, or update package-builder behavior.

### Ownership

- `src/types/shopifySync.ts` owns synchronization request, result, payload, status, error, and retry metadata contracts.
- `src/schemas/shopifySync.schema.ts` owns runtime validation for synchronization payloads and envelopes.
- `src/adapters/shopifySync` owns the adapter boundary that future Shopify API implementations must satisfy.
- `src/services/shopifySync/shopifySyncService.ts` owns service-level request validation and adapter orchestration.
- `src/hooks/shopifySync/useShopifySync.ts` owns typed React-facing hooks for future UI migration.

### Dependency Direction

```text
React sync hooks → shopifySyncService → ShopifySyncAdapter → future Shopify Admin or Storefront API client
                                    ↓
                         sync schemas / sync types
                                    ↓
                         commerce domain contracts
```

The default adapter is intentionally unavailable and returns pending results with an `adapter-unavailable` synchronization error. This preserves existing runtime behavior while establishing a tested seam for product, variant, inventory, pricing-reference, metadata, status, error, and retry handling.

### Supported Contracts

The synchronization contracts support dry-run requests for:

- Product synchronization through `ShopifyProductSyncPayload`.
- Variant synchronization through `ShopifyVariantSyncPayload` and optional `VariantMapping`.
- Inventory synchronization through `ShopifyInventorySyncPayload`.
- Pricing reference synchronization through `ShopifyPricingReferenceSyncPayload` without performing pricing resolution.
- Status inspection through `ShopifySyncResult.status`.
- Structured synchronization errors through `ShopifySyncError`.
- Retry metadata through `ShopifySyncRetryMetadata`.

### Non-goals

This foundation does not implement live Shopify synchronization, Shopify API clients, scheduled jobs, webhook handling, commerce behavior changes, pricing behavior changes, package-builder changes, configurator changes, product-data mutations, or checkout changes. Future implementation work must keep Shopify API calls behind `ShopifySyncAdapter` and validate external payloads through the synchronization Zod schemas before exposing results to services or hooks.


## Shopify Customer Synchronization

Customer creation and synchronization are documented in [SHOPIFY_CUSTOMER_INTEGRATION.md](./SHOPIFY_CUSTOMER_INTEGRATION.md). The customer foundation follows the same adapter/service/hook pattern as Shopify product, variant, inventory, pricing reference, and order synchronization, while remaining unwired from checkout and live Shopify API calls.

## Cart Workspace Experience

The customer-facing Cart Workspace (`/cart` and the reusable header `MiniCart`) is documented in [CART_WORKSPACE_EXPERIENCE.md](./CART_WORKSPACE_EXPERIENCE.md). It consumes this foundation's `commerceService.prepareCartLine(sku, quantity)` from `cartWorkspaceService.prepareCheckout()` to build a future Shopify checkout payload — it adds no new commerce lookup logic, no Shopify API calls, and no checkout behavior. Because `commerceService`'s default adapter remains the unavailable adapter described above, `prepareCheckout()` reports every line as not-yet-ready until a real `CommerceAdapter` is connected in a dedicated issue.

## Configurator Experience

The customer-facing Configurator Experience is documented in [CONFIGURATOR_EXPERIENCE.md](./CONFIGURATOR_EXPERIENCE.md). Its `ConfiguratorCommerceActions` panel is the first real UI consumer of `cartWorkspaceService.addLine()` — it converts the existing configurator's selected SKU and accessories into a `CartLineInput` and adds it to the same in-memory cart the Cart Workspace and `MiniCart` already read from. It also composes `quoteBuilderService.assembleQuote()` (Quote Builder Foundation) alongside the existing `mailto:` request-quote pattern. No checkout, live commerce API, or quote persistence behavior is added.

## Checkout Preparation Layer

The Checkout Preparation Layer is documented in [CHECKOUT_PREPARATION.md](./CHECKOUT_PREPARATION.md). Its `checkoutPreparationService.prepareCheckout()` composes this foundation's `commerceService.prepareCartLine(sku, quantity)` per cart line — the same call `cartWorkspaceService.prepareCheckout()` already makes — to decide commerce readiness for the `/cart` Checkout Readiness panel. It adds no new commerce lookup logic, no Shopify API calls, and no checkout, payment, order, tax, or shipping behavior. Because `commerceService`'s default adapter remains the unavailable adapter described above, every real cart line reports commerce-unavailable until a real `CommerceAdapter` is connected in a dedicated issue.

## Shopify Storefront API Foundation

The Shopify Storefront API Foundation is documented in [SHOPIFY_STOREFRONT_API_FOUNDATION.md](./SHOPIFY_STOREFRONT_API_FOUNDATION.md). It is a separate, parallel adapter boundary (`ShopifyStorefrontAdapter`) from `CommerceAdapter` and the Shopify Admin-API-oriented sync foundations — it targets the customer-facing Storefront GraphQL API instead. `shopifyStorefrontService`'s default adapter is `unavailableShopifyStorefrontAdapter`, and its live adapter (`liveShopifyStorefrontAdapter`) is a request/response boundary stub that never performs a network call. The only current UI integration is read-only: `useStorefrontAvailability()` feeds a display-only availability badge into the `/cart` Checkout Readiness panel, alongside this foundation's own commerce-readiness rows, without changing any checkout blocker, warning, or payload-preview logic.

## Shopify Storefront Cart Adapter Foundation

The Shopify Storefront Cart Adapter Foundation is documented in [SHOPIFY_STOREFRONT_CART_ADAPTER.md](./SHOPIFY_STOREFRONT_CART_ADAPTER.md). It connects the Shopify Storefront API Foundation to Cart Workspace/Checkout Preparation cart contracts through a new `ShopifyStorefrontCartAdapter` boundary and `shopifyStorefrontCartService`, which maps `CartLineItem`s to Storefront cart lines by calling this foundation's `commerceService.prepareCartLine(sku, quantity)` — the same call `cartWorkspaceService.prepareCheckout()` and `checkoutPreparationService` already make. It adds no new commerce lookup logic. Because `commerceService`'s default adapter remains the unavailable adapter described above, every real cart line reports an unmapped Storefront merchandise reference until a real `CommerceAdapter` is connected in a dedicated issue. `shopifyStorefrontCartService`'s own default adapter is `unavailableShopifyStorefrontCartAdapter`, so no live Storefront cart mutation is ever performed by default.

## Shopify Checkout URL Preview Foundation

The Shopify Checkout URL Preview Foundation is documented in [SHOPIFY_CHECKOUT_URL_PREVIEW.md](./SHOPIFY_CHECKOUT_URL_PREVIEW.md). It is the final, read-only boundary before a future live Shopify checkout: `shopifyCheckoutPreviewService` composes the existing Checkout Preparation Layer (readiness blockers/warnings) and the Shopify Storefront Cart Adapter Foundation (Storefront cart checkout-preview metadata) instead of calling this foundation's `commerceService` directly or duplicating any cart, checkout-readiness, or Storefront cart logic. `shopifyCheckoutPreviewService`'s own default adapter is `unavailableShopifyCheckoutPreviewAdapter`, so no checkout URL preview is ever generated by default, and `result.checkoutRedirectDisabled` is always `true` — no live checkout redirect is implemented by this foundation.

## Shopify Storefront Product Sync Foundation

The Shopify Storefront Product Sync Foundation is documented in [SHOPIFY_STOREFRONT_PRODUCT_SYNC.md](./SHOPIFY_STOREFRONT_PRODUCT_SYNC.md). It is a separate, parallel adapter boundary (`ShopifyStorefrontProductAdapter`) from `CommerceAdapter` — it derives a product-level `ShopifyStorefrontProductMapping` (handle, variant count, media count, Shopify identifiers) from the Catalog Service's `catalogService.getProduct()` rather than from any Commerce Foundation lookup. `shopifyStorefrontProductService`'s default adapter is `unavailableShopifyStorefrontProductAdapter`, and its live adapter (`liveShopifyStorefrontProductAdapter`) is a query-preview boundary stub that reuses `buildStorefrontFetchRequest()` and never performs a network call. The only current UI integration is read-only: `useShopifyStorefrontProductPreview()` feeds a display-only Storefront Product panel on Product Detail, without changing any existing hero, commerce summary, fitment, or CTA behavior.

## Shopify Storefront Collection Sync Foundation

The Shopify Storefront Collection Sync Foundation is documented in [SHOPIFY_STOREFRONT_COLLECTION_SYNC.md](./SHOPIFY_STOREFRONT_COLLECTION_SYNC.md). It is a separate, parallel adapter boundary (`ShopifyStorefrontCollectionAdapter`) from `CommerceAdapter` — it derives a category-level `ShopifyStorefrontCollectionMapping` (handle, product count, Shopify identifiers) from the Catalog Service's `catalogService.getCategory()` and `catalogService.searchProducts()` rather than from any Commerce Foundation lookup. `shopifyStorefrontCollectionService`'s default adapter is `unavailableShopifyStorefrontCollectionAdapter`, and its live adapter (`liveShopifyStorefrontCollectionAdapter`) is a query-preview boundary stub that reuses `buildStorefrontFetchRequest()` and never performs a network call. The only current UI integration is read-only: `useShopifyStorefrontCollectionPreview()` feeds a display-only Storefront Collection panel on the customer-facing Category page, without changing any existing hero, breadcrumb, filter, or product grid behavior.

## Shopify Storefront Live Configuration Readiness

The Shopify Storefront Live Configuration Readiness foundation is documented in [SHOPIFY_STOREFRONT_LIVE_CONFIG_READINESS.md](./SHOPIFY_STOREFRONT_LIVE_CONFIG_READINESS.md). It reads frontend-safe Vite env variables (`VITE_SHOPIFY_STORE_DOMAIN`, `VITE_SHOPIFY_STOREFRONT_API_VERSION`, `VITE_SHOPIFY_STOREFRONT_ENABLED`) and aggregates the existing Storefront API, Cart Adapter, Product Sync, and Collection Sync foundations' `getCapabilities()` into a single `ShopifyStorefrontCapabilitySummary` via `shopifyStorefrontConfigService`. It does not call `commerceService` or `CommerceAdapter` and does not change any adapter selection — `liveAdapterReady` is always `false` because a Storefront access token can never be present in frontend-safe env config; that boundary is left to a future backend/proxy. Its only UI integration is a shared, read-only `StorefrontConfigReadinessRow` surfaced on the `/cart` Checkout Readiness panel, Product Detail's Storefront Product panel, and the Category page's Storefront Collection panel.

## Shopify Storefront Runtime Readiness

The Shopify Storefront Runtime Readiness foundation is documented in [SHOPIFY_STOREFRONT_RUNTIME_READINESS.md](./SHOPIFY_STOREFRONT_RUNTIME_READINESS.md). It is a centralized, read-only reporting layer that composes `shopifyStorefrontConfigService` and the Storefront API, Cart Adapter, Product Sync, Collection Sync, and Checkout URL Preview foundations' `getCapabilities()` into one developer-facing `ShopifyStorefrontRuntimeStatus` (runtime mode, capability matrix, feature flags, environment diagnostics, and a readiness summary), surfaced only on the developer-only `/dev/storefront` dashboard. It introduces no new adapter, no new env variable, and no adapter-selection wiring.
