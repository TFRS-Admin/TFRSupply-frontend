# Shopify Sync Admin Dashboard

The Shopify Sync Admin Dashboard is a visible, read-only admin route that exercises every existing Shopify synchronization foundation end to end so the platform's Shopify readiness can be verified from the deployed app, not just from unit tests. It does **not** call Shopify, persist anything, or gate access behind authentication.

## Route

`GET /admin/shopify-sync` renders `src/pages/AdminShopifySyncDashboard.jsx`, registered in `src/App.jsx` alongside the other `/admin/*` routes (`AdminDebugSummary`, `AdminQuotesPage`, `AdminPricingImportDashboard`).

## Composed foundations

The dashboard renders the real output of every existing Shopify service, composed by `shopifySyncDashboardService` (`src/services/shopifySyncDashboard/shopifySyncDashboardService.ts`):

- Shopify Sync Orchestrator (`docs/architecture/SHOPIFY_SYNC_ORCHESTRATOR.md`) — execution plan and orchestration result.
- Shopify Job Queue Foundation (`docs/architecture/SHOPIFY_JOB_QUEUE_FOUNDATION.md`) — dry-run job queue with dependency ordering.
- Shopify Catalog Synchronization (`docs/architecture/SHOPIFY_CATALOG_SYNCHRONIZATION.md`).
- Shopify Inventory Synchronization (`docs/architecture/SHOPIFY_INVENTORY_SYNCHRONIZATION.md`).
- Shopify Pricing Synchronization (`docs/architecture/SHOPIFY_PRICING_SYNCHRONIZATION.md`).
- Shopify Customer Integration (`docs/architecture/SHOPIFY_CUSTOMER_INTEGRATION.md`).
- Shopify Order Integration (`docs/architecture/SHOPIFY_ORDER_INTEGRATION.md`).
- Shopify Fulfillment Foundation (`docs/architecture/SHOPIFY_FULFILLMENT_FOUNDATION.md`).
- Shopify Webhook Foundation (`docs/architecture/SHOPIFY_WEBHOOK_FOUNDATION.md`) — receive and route.
- Shopify Webhook HMAC Verification Foundation (`docs/architecture/SHOPIFY_WEBHOOK_HMAC_VERIFICATION.md`).

`shopifySyncDashboardService` does not remap products, quotes, or webhook payloads and does not duplicate any mapping, validation, or status-aggregation logic. It only:

1. Builds one native request per domain from deterministic fixtures (`src/adapters/shopifySyncDashboard/mockShopifySyncDashboardFixtures.ts`).
2. Calls each existing service's own factory function (`createShopifyCatalogService`, `createShopifyCustomerService`, etc.) with that domain's existing **mock adapter** (`mockShopifyCatalogAdapter`, `mockShopifyCustomerAdapter`, …) so every panel shows a real dry-run/simulated result instead of an `adapter-unavailable` stub.
3. Validates the aggregated payload against `shopifySyncDashboardDataSchema` (`src/schemas/shopifySyncDashboard.schema.ts`), which composes the existing per-domain result schemas rather than redefining them.

## Fixtures

All input data is a fixed, hand-authored fixture in `src/adapters/shopifySyncDashboard/mockShopifySyncDashboardFixtures.ts`: one demo product (`navigator`), one demo quote, one inventory location, and one webhook/HMAC payload pair. No product catalog, customer, or order data is read from the live application, and no Shopify credentials are referenced.

## Adapter boundary

The dashboard only ever calls the **mock** adapter for each domain (the same in-memory, network-free simulations the foundation test suites already use), never the `unavailable*Adapter` defaults and never a live adapter. This keeps the dashboard's guarantee explicit:

- No live Shopify Admin API, Storefront API, SDK, or credential access.
- No persistence — the job queue's mock adapter state lives only for the duration of one `loadDashboard()` call.
- No authentication gate — this route is intentionally open so the dashboard can be checked directly in a deployed environment during this verification pass. A future issue must add access control before this route (or any admin route) is exposed on a production domain with real data.

## UI

`src/pages/AdminShopifySyncDashboard.jsx` follows the existing `AdminPricingImportDashboard.jsx` pattern: a tabbed layout (`orchestrator`, `job-queue`, `catalog`, `inventory`, `pricing`, `customer`, `order`, `fulfillment`, `webhook`, `hmac-verification`), a `useShopifySyncDashboard` hook (`src/hooks/shopifySyncDashboard/useShopifySyncDashboard.ts`) owning loading/error/data state, and a manual refresh button. The component only renders service output; it contains no business logic.

## Testing

`tests/shopify-sync-dashboard.test.mjs` loads the service, schema, and hook modules through Vite SSR (per `docs/migrations/TESTING_NOTES.md`) and asserts: the plan covers all eight composed operations, the orchestrator result has no adapter-unavailable or failed operations, the job queue produces one dry-run job per operation, each per-domain preview reflects the real mapped fixture data (catalog product ID, inventory location GID, order quote ID, HMAC verification), and the whole payload is deterministic across repeated loads.

## Explicit non-goals

This dashboard intentionally does not add live Shopify API calls, persistence, background workers, authentication, new business logic, or changes to any existing Shopify service, adapter, or schema contract. It is a read-only verification surface over foundations that already exist.
