# Admin Sales Dashboard

The Admin Sales Dashboard is the authenticated `/admin` landing page administrators reach after signing in through the Admin Authentication Workspace. It composes every existing admin-facing foundation — authentication, Shopify sync, pricing imports, and the quote builder/persistence stack — into one status and metrics overview. It does **not** call Shopify, does not persist anything beyond a demo quote round-trip against the existing in-memory quote repository, and does not add new sync, pricing, or quote logic.

## Purpose

Prior to this dashboard, `/admin/shopify-sync`, `/admin/pricing-imports`, `/admin/quote-builder`, and `/admin/quotes` were four unrelated entry points with no shared landing page. Administrators had no single place to see whether the platform's mock foundations were healthy, what quick actions were available, or a rollup of demo activity and metrics. This dashboard is a thin composition layer — it introduces no new domain logic, only reads and displays results already produced by existing services.

## Boundary

React route (`/admin`) → `AdminSalesDashboard` page → `useAdminSalesDashboard` hook → `adminSalesDashboardService` → existing services (`adminAuthenticationService`, `shopifySyncDashboardService`, `pricingImportDashboardService`, `quoteBuilderWorkspaceService`, `quotePersistenceService`)

This mirrors the same "dashboard-owned composition service" pattern established by `docs/architecture/SHOPIFY_SYNC_ADMIN_DASHBOARD.md` and the Pricing Import Dashboard: a service composes existing services against their existing mock adapters, and a page renders the native result types.

## Data contract

`AdminSalesDashboardData` (`src/types/adminSalesDashboard.ts`, validated by `src/schemas/adminSalesDashboard.schema.ts`) has five sections matching the issue's acceptance criteria:

- `quickActions: AdminSalesDashboardQuickAction[]` — static navigation cards (id, label, description, href, icon, `available`).
- `platformStatus: AdminSalesDashboardPlatformStatus` — one `'operational' | 'degraded' | 'unavailable'` value per area: `authentication`, `sync`, `pricingEngine`, `quoteEngine`, `imports`.
- `recentActivity: AdminSalesDashboardActivityEntry[]` — deterministic mock activity entries (`kind: 'quote-edit' | 'pricing-import' | 'sync-job'`).
- `metrics: AdminSalesDashboardMetrics` — quotes created, imports processed, sync jobs run, validation status, test environment status.
- `systemHealth: AdminSalesDashboardSystemHealth` — build status, validation status, mock service availability, adapter availability.

No new domain fields duplicate an existing service's result shape — each dashboard field is either a static fixture (Quick Actions, Recent Activity) or a value read directly off an existing service's response (Platform Status, Metrics, System Health).

## Service composition

`src/services/adminSalesDashboard/adminSalesDashboardService.ts` calls, in parallel, the same public methods every other admin dashboard already calls:

- `adminAuthenticationService.listDemoUsers()` — authentication status is `'operational'` when the mock adapter returns demo identities, `'unavailable'` otherwise.
- `shopifySyncDashboardService.loadDashboard()` — sync status is derived from `summary.statusesByArea` using the same failure-status set (`failed`, `blocked`, `cancelled`, `adapter-unavailable`, `partial`) the Shopify Sync Admin Dashboard page already uses for its own badges.
- `quoteBuilderWorkspaceService.loadScenarios()` — pricing engine status reads each scenario's `result.pricing.status`; quote engine status additionally requires every scenario's overall `result.status` to be `'priced'`.
- `quotePersistenceService.saveQuote()` / `.loadQuote()` — a demo round-trip using the same fixture quote already defined in `mockShopifySyncDashboardScenario` (no duplicate quote fixture is introduced), confirming the persistence adapter is reachable.
- `pricingImportDashboardService.loadDashboard()` — imports status is `'degraded'` when any run's status is `'failed'`. The mock pricing import fixtures intentionally include one failing run (to exercise the pricing import dashboard's own "Failed Records" tab), so this dashboard honestly surfaces that same `'degraded'` state rather than hardcoding a happy path.

Platform Metrics and System Health are derived from the same composed results (`quotesCreated` = scenario count, `importsProcessed` = import run count, `syncJobsRun` = job queue length) — no separate demo-data source is introduced for the metrics section.

## UI

`src/pages/AdminSalesDashboard.jsx` renders the five required sections — Quick Actions, Platform Status, Recent Activity, Platform Metrics, System Health — using the same visual language (status badges, stat tiles, section headers) already established by `AdminShopifySyncDashboard.jsx` and `AdminPricingImportDashboard.jsx`. `src/hooks/adminSalesDashboard/useAdminSalesDashboard.ts` follows the existing `{ data, loading, error, loadDashboard }` resource hook pattern.

The route is registered in `src/App.jsx` as `/admin`, wrapped in the existing `AdminAuthGuard` (`src/components/AdminAuthGuard.jsx`) with no `requiredPermission` — any signed-in demo administrator, regardless of role, can reach the landing page, since it only links out to other routes that already carry their own `requiredPermission` checks (`/admin/quote-builder`, `/admin/shopify-sync`). This adds no new `AdminPermission` value and no change to the authentication service itself, per the issue's explicit "no authentication changes" scope.

## Explicit non-goals

This dashboard does not call the Shopify Admin API, does not read or write a real database, does not run background workers, does not send email or push notifications, does not implement a CRM, and does not change the Admin Authentication Workspace's roles, permissions, or session lifecycle. "Future CRM" is rendered as a disabled Quick Action card (`available: false`, `href: '#'`) with no target route, since no CRM foundation exists yet.

## Testing

`tests/admin-sales-dashboard.test.mjs` covers: schema validation of the composed dashboard, Quick Actions card identity/hrefs/availability, Platform Status derivation from real service results (including the intentionally degraded imports state), the static Recent Activity fixture, Platform Metrics and System Health values, an injected-dependency case where authentication reports `'unavailable'`, deterministic clock injection, and the hook/route wiring entry points.

**Known gap**: as with the Shopify Sync Admin Dashboard and Admin Authentication Workspace (see `docs/migrations/TESTING_NOTES.md`), the repository's `node --test` + Vite-SSR stack has no DOM/jsdom layer, so `AdminSalesDashboard.jsx`'s client-side render (button clicks, sign-out) is not exercised by an automated browser test — only the underlying service, schema, and hook layer are.
