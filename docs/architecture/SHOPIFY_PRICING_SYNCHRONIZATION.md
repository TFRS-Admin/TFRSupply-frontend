# Shopify Pricing Synchronization Foundation

## Architecture

The Shopify pricing synchronization foundation introduces an additive, dry-run-only boundary for translating platform pricing data into Shopify-ready pricing payloads. It follows the existing service-oriented path used by catalog, inventory, customer, and order synchronization:

React hooks → `shopifyPricingService` → `ShopifyPricingAdapter` → mock or unavailable adapter.

The foundation does not publish prices, persist state, enqueue jobs, or call Shopify. It only validates request contracts, maps pricing references, builds synchronization metadata, and delegates to a non-live adapter.

## Adapter boundary

`src/adapters/shopifyPricing/shopifyPricingAdapter.ts` defines the `ShopifyPricingAdapter` interface with `syncPricing` and `getPricingSyncStatus` methods. The included adapters are intentionally safe:

- `mockShopifyPricingAdapter` returns deterministic dry-run and validated results for tests and future orchestration.
- `unavailableShopifyPricingAdapter` returns `adapter-unavailable` with a retryable error and explicitly records that no live Shopify call was made.

Future live Shopify integration must be added as a separate adapter behind this interface and must not change hook or service contracts.

## Service responsibilities

`src/services/shopifyPricing/shopifyPricingService.ts` owns orchestration only:

1. Validate requests with `shopifyPricingSyncRequestSchema`.
2. Convert product, SKU row, list price, dealer cost, contract price, and quote-reference data into Shopify pricing items.
3. Build `ShopifyPriceMapping` metadata for product and variant identifiers.
4. Delegate the dry-run synchronization/status operation to an adapter.
5. Validate adapter responses with `shopifyPricingSyncResultSchema`.

The service does not resolve dealer contracts, calculate promotions, authenticate with Shopify, or publish prices.

## Pricing mapping

Pricing mapping is deterministic and additive. For each product SKU row, the service resolves a price in this order:

1. Contract price (`contractPrices`) as `contract-price`.
2. Requested quote line unit price (`pricingLines`) as `quote-reference` unless an explicit strategy is supplied.
3. List price (`listPrices`) as `list-price`.
4. Dealer cost (`dealerCosts`) as `dealer-cost`.
5. Product commerce display price or MSRP display as a `manual` fallback.

Each mapped item includes a Shopify-compatible `Price`, a `ShopifyPriceAdjustment`, a `VariantMapping`, mapping timestamps, warnings, and service metadata. This enables future publishing workflows to consume prepared payloads without reimplementing mapping logic.

## Synchronization flow

1. A React caller uses `useShopifyPricing()` or `useShopifyPricingSync()`.
2. The hook calls `shopifyPricingService.syncPricing` or `getPricingSyncStatus`.
3. The service validates and maps the request.
4. The service delegates to the configured adapter.
5. Adapter results are enriched with mapped items/mappings when the adapter does not provide them.
6. The final result is validated and returned to the caller.

## Future extension points

- Live Shopify pricing adapter with Admin API calls.
- Contract pricing publisher using dealer contract resolution outputs.
- Promotional pricing and compare-at price policies.
- Background job orchestration and retry tracking.
- Persistence of synchronization runs and audit history.
- Channel-specific pricing strategy selection.

## Explicit non-goals

This foundation intentionally does not implement live Shopify API calls, price publishing, dealer contract execution, promotional pricing, checkout, authentication, OAuth, webhooks, background jobs, database persistence, UI changes, or routing changes.
