# Shopify Sync Admin Dashboard

The Shopify sync admin dashboard is a visible, read-only route (`/admin/shopify-sync`) that proves every Shopify sync foundation built so far is real, wired together, and produces actual service output — not just passing unit tests. It does **not** call Shopify, does not persist anything, and does not add authentication.

## Purpose

Prior Shopify foundations (orchestrator, job queue, catalog, inventory, pricing, customer, order, fulfillment, webhook, webhook HMAC verification) were only exercised by `tests/*.test.mjs`. This dashboard runs the same services, through their existing mock adapters, against one deterministic demo scenario, and renders the results so the platform team can see the foundations working from the deployed app.

## Boundary

React route → `AdminShopifySyncDashboard` page → `useShopifySyncDashboard` hook → `shopifySyncDashboardService` → existing Shopify services → existing mock adapters

The dashboard adds no new business logic. `shopifySyncDashboardService` (`src/services/shopifySyncDashboard/shopifySyncDashboardService.ts`) only:

- Builds fixed request payloads from one shared demo scenario (`src/adapters/shopifySyncDashboard/mockShopifySyncDashboardScenario.ts`): a "Navigator Lightbar" product, a warehouse location, a Metro PD quote, and a `orders/create` webhook payload.
- Constructs dashboard-owned instances of the ten existing services, each wired to that domain's existing `mockShopify*Adapter` (the same adapters the foundation test suites already exercise).
- Calls each service's existing public methods and returns the native result types unchanged. It never reimplements mapping, validation, or status logic that already lives in a service.
- Where one section depends on another (fulfillment needs a `ShopifyOrder`), it calls the owning service's existing builder method (`shopifyOrderService.buildOrderPayload()`) instead of duplicating the order-mapping logic.

Composed services:

- Shopify Sync Orchestrator (`shopifySyncOrchestratorService`) — builds an execution plan across catalog → inventory/pricing and customer → order → fulfillment, then runs it dry-run.
- Shopify Job Queue (`shopifyJobQueueService`) — queues catalog/inventory/pricing jobs through the mock job queue adapter with a dependency chain.
- Shopify Catalog Synchronization (`shopifyCatalogService`)
- Shopify Inventory Synchronization (`shopifyInventoryService`)
- Shopify Pricing Synchronization (`shopifyPricingService`)
- Shopify Customer Integration (`shopifyCustomerService`)
- Shopify Order Integration (`shopifyOrderService`)
- Shopify Fulfillment Foundation (`shopifyFulfillmentService`)
- Shopify Webhook Foundation (`shopifyWebhookService`) — receives and routes one `orders/create` webhook.
- Shopify Webhook HMAC Verification Foundation (`shopifyWebhookVerificationService`) — verifies one valid signature and one intentionally mismatched signature, to show both the success and failure path.

## Data contract

`ShopifySyncDashboardData` (`src/types/shopifySyncDashboard.ts`, validated by `src/schemas/shopifySyncDashboard.schema.ts`) is a thin composition of each service's existing result type — no new domain fields are introduced. `shopifySyncDashboardDataSchema` reuses the existing per-domain result schemas (`shopifyCatalogSyncResultSchema`, `shopifyOrderResultSchema`, etc.) instead of redeclaring their shapes.

## UI

`src/pages/AdminShopifySyncDashboard.jsx` renders ten tabs — one per bullet in the dashboard's acceptance criteria (Sync Orchestrator, Job Queue, Catalog, Inventory, Pricing, Customer, Order, Fulfillment, Webhook Routing, HMAC Verification) — plus a status-tile summary row. `src/hooks/shopifySyncDashboard/useShopifySyncDashboard.ts` follows the existing `{ data, loading, error, loadDashboard }` resource hook pattern (see `usePricingImportDashboard`). The route is registered in `src/App.jsx` alongside the other `/admin/*` routes.

The page intentionally has no access gate — unlike `/admin/pricing-imports`, this route does not call `checkAdminAccess()`, per the issue's explicit "do not add auth" scope. It is a read-only, non-persistent preview.

## Adapter boundaries

No new adapter is introduced. The dashboard depends only on each domain's existing `mockShopify*Adapter` / `createMockShopifyJobQueueAdapter()` exports, which already return deterministic dry-run/validated results without any network, credential, or persistence access. Swapping any one domain's mock adapter for a live adapter in the future requires no dashboard changes — the dashboard only depends on each service's public interface.

## Explicit non-goals

This dashboard does not call the Shopify Admin API, Storefront API, or any SDK; does not persist runs, jobs, or history; does not add authentication or authorization; does not introduce new sync, mapping, or validation logic; and does not replace or duplicate `docs/architecture/SHOPIFY_SYNC_ORCHESTRATOR.md`, `SHOPIFY_JOB_QUEUE_FOUNDATION.md`, or the other per-domain foundation docs, which remain the source of truth for their respective services.
