# Shopify Catalog Synchronization Foundation

## Architecture

The Shopify catalog synchronization foundation creates an additive, dry-run-only boundary for turning Product Data Platform records into Shopify-ready catalog payloads. It follows the existing service-oriented direction documented in `SERVICE_LAYER.md`, `PRODUCT_DATA_PLATFORM.md`, `CATALOG_SERVICE.md`, `COMMERCE_FOUNDATION.md`, `SHOPIFY_CUSTOMER_INTEGRATION.md`, `SHOPIFY_ORDER_INTEGRATION.md`, and `SHOPIFY_SYNC_FOUNDATION` code conventions.

## Adapter boundary

`src/adapters/shopifyCatalog` owns the external-system boundary. `ShopifyCatalogAdapter` exposes `publishCatalog` and `getCatalogSyncStatus`, while `mockShopifyCatalogAdapter` and `unavailableShopifyCatalogAdapter` deliberately avoid live Shopify API calls. The unavailable adapter returns an explicit `adapter-unavailable` result so current runtime behavior remains unchanged until a future provider is approved.

## Service responsibilities

`src/services/shopifyCatalog/shopifyCatalogService.ts` validates incoming `ShopifyCatalogSyncRequest` objects with Zod, maps `Product` records into `ShopifyCatalogSyncItem` payloads, builds deterministic mapping metadata, delegates to an injected adapter, and validates adapter results before returning them. The service does not import React, perform routing, write persistence, enqueue jobs, authenticate, or call Shopify.

## Product mapping

Products are mapped from existing catalog fields:

- `Product.id`, `slug`, `title`, and `label` become product identity, handle, and title.
- `sku` or `commerce.sku_root` becomes the primary SKU.
- `commerce.sku_table` becomes deterministic variant payloads when present.
- `verticalIds`, `categoryIds`, and legacy `verticals` become catalog tags.
- media and image fields become image URL references.
- existing `shopify` metadata is read only to preserve known Shopify identifiers in mapping metadata.

## Synchronization flow

1. A caller or hook submits a dry-run `ShopifyCatalogSyncRequest`.
2. The service validates the request with `shopifyCatalogSyncRequestSchema`.
3. Each product is mapped to a catalog item and mapping record.
4. The service delegates to the configured adapter.
5. Adapter results are merged with service-built items/mappings when the adapter intentionally returns no payload.
6. The final result is parsed with `shopifyCatalogSyncResultSchema`.

## Future extension points

- Live Shopify catalog provider adapter.
- Product publishing and archival workflows.
- Price and inventory synchronization integration.
- Background job orchestration.
- Durable mapping persistence.
- Webhook reconciliation.

Each extension must be introduced by a dedicated issue because this foundation is intentionally inert.

## Explicit non-goals

This foundation does not implement live Shopify API calls, product publishing, inventory updates, pricing synchronization, checkout, authentication, OAuth, webhooks, background jobs, database persistence, UI changes, or routing changes.
