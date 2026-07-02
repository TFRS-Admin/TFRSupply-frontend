# Shopify Fulfillment Foundation

## Architecture

The Shopify fulfillment foundation introduces an additive, dry-run-only boundary for translating a mapped `ShopifyOrder` into Shopify-ready fulfillment and shipment payloads. It follows the same service-oriented path used by catalog, inventory, customer, pricing, and order synchronization:

React hooks → `shopifyFulfillmentService` → `ShopifyFulfillmentAdapter` → mock or unavailable adapter.

The foundation does not create live Shopify fulfillments, purchase shipping labels, contact carriers, persist state, enqueue jobs, or call Shopify. It only validates request contracts, maps order lines into fulfillment items and a draft shipment, builds synchronization metadata, and delegates to a non-live adapter.

## Adapter boundary

`src/adapters/shopifyFulfillment/shopifyFulfillmentAdapter.ts` defines the `ShopifyFulfillmentAdapter` interface with `createFulfillment` and `getFulfillmentSyncStatus` methods. The included adapters are intentionally safe:

- `mockShopifyFulfillmentAdapter` returns deterministic dry-run and validated results for tests and future orchestration.
- `unavailableShopifyFulfillmentAdapter` returns `adapter-unavailable` with a retryable error and explicitly records that no live Shopify call was made.

Future live Shopify integration (Admin API `fulfillmentCreate`, carrier services, shipping label purchase) must be added as a separate adapter behind this interface and must not change hook or service contracts.

## Service responsibilities

`src/services/shopifyFulfillment/shopifyFulfillmentService.ts` owns orchestration only:

1. Validate requests with `shopifyFulfillmentRequestSchema`.
2. Select the order lines to fulfill: an explicit `items` list on the request, or every order line where `requiresShipping !== false`.
3. Build a draft `ShopifyShipment` (status `label-pending`) carrying the selected items, optional `ShopifyTrackingInformation`, origin `locationId`, and the order's `shippingAddress`.
4. Build `ShopifyFulfillmentMapping` metadata linking order lines to fulfillment items.
5. Delegate the dry-run create/status operation to an adapter.
6. Validate adapter responses with `shopifyFulfillmentResultSchema`, falling back to the locally mapped items/shipment/mapping when the adapter does not supply them.

The service does not select carriers, purchase labels, split shipments across warehouses, notify customers, or publish to Shopify.

## Fulfillment mapping

Mapping is deterministic and additive, reusing the existing `ShopifyOrder` and `ShopifyOrderAddress` contracts from the Shopify Order Integration foundation instead of duplicating address or line shapes:

1. Shippable order lines (`requiresShipping !== false`) become `ShopifyFulfillmentItem` entries (`orderLineId`, `sku`, `shopifyLineItemId`, `quantity`, `locationId`).
2. A draft `ShopifyShipment` groups the items with tracking, origin location, and destination address.
3. A `ShopifyFulfillmentMapping` records `orderId` → `fulfillmentId`, per-item `itemMappings`, and reserves `shopifyOrderId`/`shopifyFulfillmentId` fields (`null` until a live adapter populates them).

## Synchronization flow

1. A React caller uses `useShopifyFulfillment()` or `useShopifyFulfillmentSync()`.
2. The hook calls `shopifyFulfillmentService.createFulfillment` or `getFulfillmentSyncStatus`.
3. The service validates the request and maps the order into items, a shipment, and a mapping.
4. The service delegates to the configured adapter.
5. Adapter results are enriched with the mapped items/shipment/mapping when the adapter does not provide them.
6. The final result is validated and returned to the caller.

## Future extension points

- Live Shopify fulfillment adapter using Admin API `fulfillmentCreate`/`fulfillmentTrackingInfoUpdate`.
- Carrier service and shipping label purchase integration.
- Warehouse/location-aware split fulfillment across multiple shipments.
- Fulfillment and delivery webhook consumption (`fulfillments/create`, `fulfillments/update`).
- Background job orchestration and retry tracking for fulfillment sync.
- Persistence of fulfillment and shipment history for order status views.
- Customer notification triggering on fulfillment and delivery events.

## Explicit non-goals

This foundation intentionally does not implement live Shopify API calls, shipping label purchase, carrier APIs, warehouse integrations, inventory movement, authentication, OAuth, webhooks, background jobs, database persistence, UI changes, or routing changes.
