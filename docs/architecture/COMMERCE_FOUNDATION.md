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
