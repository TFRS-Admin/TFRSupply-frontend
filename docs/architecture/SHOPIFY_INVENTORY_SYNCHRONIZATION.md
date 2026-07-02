# Shopify Inventory Synchronization Foundation

The Shopify inventory synchronization foundation adds an architecture-only boundary for converting Product Data Platform and Commerce Foundation inventory fields into Shopify-ready inventory payloads. It performs no live Shopify Admin API, Storefront API, warehouse, fulfillment, webhook, background job, persistence, OAuth, routing, or UI work.

## Architecture

React inventory hooks → `shopifyInventoryService` → `ShopifyInventoryAdapter` → future Shopify inventory provider

Supporting contracts live in:

- `src/types/shopifyInventory.ts` for public TypeScript contracts.
- `src/schemas/shopifyInventory.schema.ts` for runtime Zod validation.
- `src/adapters/shopifyInventory/` for the adapter boundary.
- `src/services/shopifyInventory/` for validation, mapping, metadata, and adapter orchestration.
- `src/hooks/shopifyInventory/` for React-facing hook wrappers.

## Adapter boundary

`ShopifyInventoryAdapter` exposes `syncInventory` and `getInventorySyncStatus`. The shipped adapters never call Shopify:

- `mockShopifyInventoryAdapter` returns deterministic dry-run and validated responses for tests and future orchestration work.
- `unavailableShopifyInventoryAdapter` returns an explicit `adapter-unavailable` result and retryable error, preserving current runtime behavior until a live provider is approved.

Future live adapters must stay behind this interface and must not leak Shopify SDK details into hooks, React components, schemas, or product data loaders.

## Service responsibilities

`shopifyInventoryService` is responsible for:

1. Parsing `ShopifyInventorySyncRequest` with Zod.
2. Mapping product-level and SKU-row inventory data into `ShopifyInventorySyncItem` payloads.
3. Building location-level `ShopifyInventoryAdjustment` records.
4. Building `ShopifyInventoryMapping` metadata for Shopify product, variant, inventory item, and location references.
5. Delegating to an injected adapter.
6. Validating the final `ShopifyInventorySyncResult` before returning it.

The service does not import React, call Shopify, write persistence, authenticate, enqueue jobs, or mutate product data.

## Inventory mapping

Inventory mapping is deterministic and additive:

- `commerce.sku_table` rows become inventory sync items when present.
- Products without a SKU table fall back to the product SKU, commerce SKU root, or product ID.
- Row quantities are read from known inventory-like fields such as `quantityAvailable`, `inventoryQuantity`, or `quantity`; otherwise the request `defaultQuantity` is used.
- Each requested location receives an adjustment for every mapped SKU.
- Existing Shopify product and variant identifiers are copied into mapping metadata when already present on product or SKU-row data.
- Location Shopify identifiers are copied from `ShopifyInventoryLocation` and never fetched from Shopify.

## Synchronization flow

1. A future caller or hook submits a dry-run `ShopifyInventorySyncRequest`.
2. The service validates the request with `shopifyInventorySyncRequestSchema`.
3. The service maps products, SKU rows, quantities, locations, adjustments, and mapping metadata.
4. The service delegates to the injected adapter.
5. The mock adapter returns deterministic dry-run/status results, or the unavailable adapter returns an explicit unavailable result.
6. The service fills empty adapter payloads with mapped items and mappings, annotates synchronization metadata, validates the result, and returns it.

## Future extension points

- Live Shopify Admin inventory-level adapter.
- Warehouse and location source adapters.
- Inventory item ID reconciliation and persistence.
- Fulfillment-aware quantity allocation.
- Background inventory publishing jobs.
- Webhook-driven reconciliation.
- UI surfaces that consume `useShopifyInventory()` only after an explicit runtime integration issue.

## Explicit non-goals

This foundation intentionally does not implement live Shopify API calls, inventory publishing, warehouse integration, fulfillment, authentication, OAuth, webhooks, background jobs, database persistence, UI changes, routing changes, or changes to current cart/checkout behavior.
