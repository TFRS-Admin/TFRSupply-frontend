# Shopify Sync Admin Dashboard

The Shopify Sync Admin Dashboard is a visible, deployed route (`/admin/shopify-sync`) that proves the Shopify foundation services described in `SHOPIFY_SYNC_ORCHESTRATOR.md`, `SHOPIFY_JOB_QUEUE_FOUNDATION.md`, `COMMERCE_FOUNDATION.md`, `SHOPIFY_CUSTOMER_INTEGRATION.md`, `SHOPIFY_ORDER_INTEGRATION.md`, `SHOPIFY_FULFILLMENT_FOUNDATION.md`, `SHOPIFY_INVENTORY_SYNCHRONIZATION.md`, and `SHOPIFY_WEBHOOK_FOUNDATION.md` are real, callable, and produce sensible output — without making a live Shopify API call, without persisting anything, and without requiring authentication.

## Purpose

Every Shopify foundation issue before this one shipped as a service/adapter/schema layer with no UI surface. This dashboard exists purely to demonstrate those layers end to end from the deployed app: an operator (or reviewer) can load `/admin/shopify-sync` and see the actual typed results the sync orchestrator, job queue, and each domain service (catalog, inventory, pricing, customer, order, fulfillment, webhook, HMAC verification) produce for a fixed set of demo inputs.

## Non-goals

- No live Shopify API calls. Every service is wired to its existing `mockShopify*Adapter`, never to a live or `unavailable` adapter.
- No persistence. Nothing queued, mapped, or "synced" on this page is written to a database, file, or external store — state lives only for the duration of one `loadDashboard()` call.
- No authentication or authorization gate. Unlike `AdminPricingImportDashboard` (`checkAdminAccess`), this route is intentionally open, per the issue that introduced it. If this route needs to be gated later, that is a separate, explicitly authorized issue.
- No new business logic. Mapping, validation, orchestration, and dependency resolution all come from the existing `shopifySync*` services; this feature only supplies fixed demo inputs and aggregates typed outputs.

## Layering

React route → `AdminShopifySyncDashboard` page → `useShopifySyncAdminDashboard` hook → `shopifySyncAdminDashboardService` → existing `shopifySync*` services (wired to `mockShopify*Adapter`s) → `summarizeShopifySyncAdminDashboard` domain helper for aggregate counts.

- `src/services/shopifySyncAdminDashboard/shopifySyncAdminDashboardService.ts` builds each Shopify sub-service with its existing mock adapter (`mockShopifyCatalogAdapter`, `mockShopifyInventoryAdapter`, `mockShopifyPricingAdapter`, `mockShopifyCustomerAdapter`, `mockShopifyOrderAdapter`, `mockShopifyFulfillmentAdapter`, `mockShopifyWebhookAdapter`, `mockShopifyWebhookVerificationAdapter`, `createMockShopifyJobQueueAdapter()`), wires them into `createShopifySyncOrchestratorService()`, and calls each service's real public methods (`buildExecutionPlan`, `orchestrate`, `queueJobs`, `syncCatalog`, `syncInventory`, `syncPricing`, `createCustomer`, `createOrder`, `createFulfillment`, `receiveWebhook`, `routeWebhookEvent`, `verifyWebhookSignature`) against deterministic demo fixtures.
- `src/adapters/shopifySyncAdminDashboard/mockShopifySyncAdminDashboardFixtures.ts` holds the fixed demo inputs (two demo products, one demo quote, one inventory location, one inbound webhook payload, a valid and an invalid mock HMAC header). These are inputs to the real services, not a duplicate implementation of any service.
- `src/domain/shopifySyncAdminDashboard/dashboardSummary.ts` is a pure function that tallies status counts, operation/job counts, and error/failure counts across every section already produced by the services above. It contains no service, adapter, or React imports.
- `src/schemas/shopifySyncAdminDashboard.schema.ts` validates the aggregate dashboard payload by composing the existing per-domain result schemas (`shopifyCatalogSyncResultSchema`, `shopifyJobResultSchema`, `shopifySyncOrchestratorResultSchema`, etc.) rather than redefining their shapes.
- `src/hooks/shopifySyncAdminDashboard/useShopifySyncAdminDashboard.ts` follows the same `{ data, loading, error, loadDashboard }` shape as `usePricingImportDashboard`.
- `src/pages/AdminShopifySyncDashboard.jsx` renders one tab per required section (Summary, Sync Orchestrator, Job Queue, Catalog, Inventory, Pricing, Customer, Order, Fulfillment, Webhook Routing, HMAC Verification) and loads the dashboard on mount.

## What each tab proves

| Tab | Service call | What it demonstrates |
| --- | --- | --- |
| Summary | `summarizeShopifySyncAdminDashboard` (domain) | Aggregate status counts and error/failure totals across every section below. |
| Sync Orchestrator | `shopifySyncOrchestratorService.buildExecutionPlan` / `.orchestrate` | A dependency-ordered (`catalog` → `inventory`, `catalog` → `pricing`) dry-run execution plan and its result. |
| Job Queue | `shopifyJobQueueService.queueJobs` | Priority- and dependency-aware admission of four dry-run jobs, including a `webhook-verification` job. |
| Catalog Sync | `shopifyCatalogService.syncCatalog` | Demo products mapped to Shopify catalog items/variants. |
| Inventory Sync | `shopifyInventoryService.syncInventory` | Per-location inventory adjustments for demo product variants. |
| Pricing Sync | `shopifyPricingService.syncPricing` | Price resolution for demo product variants. |
| Customer Sync | `shopifyCustomerService.createCustomer` | The demo quote's customer metadata mapped to a Shopify customer draft. |
| Order Sync | `shopifyOrderService.createOrder` | The demo quote mapped to a Shopify order draft. |
| Fulfillment Sync | `shopifyFulfillmentService.createFulfillment` | The mapped order's lines turned into a fulfillment/shipment preview. |
| Webhook Routing | `shopifyWebhookService.receiveWebhook` / `.routeWebhookEvent` | Normalizing and routing a sample `orders/create` webhook. |
| HMAC Verification | `shopifyWebhookVerificationService.verifyWebhookSignature` | One request with a valid mock HMAC header (verified) and one with an invalid header (rejected with `signature-mismatch`). |

## Testing

`tests/shopify-sync-admin-dashboard.test.mjs` loads the service, schema, domain, and hook modules through the existing Vite SSR `node --test` pattern (see `docs/migrations/TESTING_NOTES.md`) and asserts:

- The full dashboard payload validates against `shopifySyncAdminDashboardDataSchema`.
- The orchestrator plan has the expected operations and dependency edges, and executes as a dry run with zero errors.
- The job queue admits all four demo jobs as `dry-run` with resolved dependencies.
- Catalog/inventory/pricing previews contain the expected demo SKUs.
- Customer/order/fulfillment previews are built from the demo quote.
- The webhook is normalized and routed successfully.
- HMAC verification succeeds for a valid header and fails with `signature-mismatch` for an invalid one.
- The summary domain function recomputes the same aggregate the service returns.
- The hook exposes `{ data, loading, error, loadDashboard }` without loading during render.

## Explicit non-goals (repeated for emphasis)

No live Shopify calls, no persistence, no authentication, no new mapping/validation/orchestration logic. If any of those become required, they are separate, explicitly authorized issues — not silent additions to this dashboard.
