# Shopify Order Integration Foundation

The Shopify order integration foundation adds an architecture-only boundary for turning approved or persisted platform quotes into typed Shopify order payloads. It intentionally performs no live Shopify API calls.

## Architecture

- `src/types/shopifyOrder.ts` owns the public domain contracts for order payloads, order lines, customers, addresses, requests, results, errors, mappings, and sync status.
- `src/schemas/shopifyOrder.schema.ts` provides runtime Zod validation for every public contract.
- `src/services/shopifyOrder/shopifyOrderService.ts` validates requests, maps `Quote` objects into deterministic Shopify order payloads, creates line-level mapping metadata, and delegates to an injected adapter.
- `src/adapters/shopifyOrder/` defines the adapter boundary with mock and unavailable implementations.
- `src/hooks/shopifyOrder/useShopifyOrder.ts` exposes React hook wrappers without embedding mapping or validation logic.

## Adapter boundary

Adapters implement `ShopifyOrderAdapter` and receive validated dry-run requests. The foundation ships with:

- `mockShopifyOrderAdapter`, which returns deterministic dry-run responses for tests and future feature development.
- `unavailableShopifyOrderAdapter`, which returns an explicit unavailable result and retryable adapter error.

Neither adapter calls Shopify. Future live adapters must be introduced in a separate issue and must remain behind this interface.

## Service responsibilities

`shopifyOrderService` is responsible for:

1. Validating `ShopifyOrderRequest` with Zod.
2. Building a typed `ShopifyOrder` payload from the quote.
3. Mapping quote lines to Shopify order line identifiers.
4. Producing `ShopifyOrderMapping` synchronization metadata.
5. Delegating create/status work to an adapter.
6. Validating adapter results before returning them.

## Order mapping

Quote IDs become deterministic draft order IDs using `shopify-order-draft-<quoteId>`. Quote lines become deterministic order line IDs using `shopify-order-line-<quoteLineId>`. Customer metadata is copied from quote customer metadata unless the request supplies an explicit Shopify order customer.

## Synchronization flow

The initial flow is dry-run only:

1. Caller submits a `ShopifyOrderRequest` with `dryRun: true`.
2. Service validates the request and maps the quote to an order payload.
3. Service delegates to the configured adapter.
4. Service merges adapter sync status with order mapping metadata.
5. Caller receives a typed `ShopifyOrderResult`.

## Future extension points

- Live Shopify Admin API order adapter.
- Checkout conversion once checkout and payments are explicitly in scope.
- Webhook reconciliation and background sync jobs.
- Persistence of mappings after database persistence is designed.
- Rich tax, shipping, discount, and payment status mapping.

## Explicit non-goals

This foundation does not implement live Shopify calls, checkout, payment processing, authentication, OAuth, webhooks, background jobs, database persistence, UI changes, or routing changes.


## Related Customer Foundation

Shopify customer creation and synchronization are represented separately in [SHOPIFY_CUSTOMER_INTEGRATION.md](./SHOPIFY_CUSTOMER_INTEGRATION.md). Order integration may consume customer mapping metadata in a future issue, but this order foundation remains unchanged and does not call the customer service automatically.
