# Shopify Storefront Runtime Readiness

## Purpose

This foundation prepares the storefront for eventual live Shopify Storefront API operation without enabling any live call. It introduces a centralized Storefront Runtime Configuration module and a developer-only `/dev/storefront` dashboard that report runtime mode, configuration validation, capability matrix, feature flags, and environment diagnostics. It is infrastructure and developer-experience only: no live Shopify Storefront API call, GraphQL execution, checkout redirect, payment, order, customer login, or authentication change is implemented, and no production behavior changes. It reuses the existing Shopify Storefront API Foundation, Storefront Cart Adapter, Storefront Product Sync, Storefront Collection Sync, Shopify Checkout URL Preview, Shopify Storefront Live Configuration Readiness, and Commerce Foundation instead of duplicating any adapter, service, config-reading, or capability-aggregation logic they already own.

## Ownership

- `src/types/shopifyStorefrontRuntime.ts` owns `ShopifyStorefrontRuntimeMode`, `ShopifyStorefrontRuntimeCapabilityRow`, `ShopifyStorefrontRuntimeFeatureFlag`, `ShopifyStorefrontRuntimeDiagnostic`, and `ShopifyStorefrontRuntimeStatus`. It reuses `ShopifyStorefrontAdapterMode` and `ShopifyStorefrontCapabilitySummary` from the existing Storefront API and Live Configuration Readiness foundations instead of redefining either.
- `src/schemas/shopifyStorefrontRuntime.schema.ts` owns runtime Zod validation aligned to every one of those contracts, composing `shopifyStorefrontAdapterModeSchema` and `shopifyStorefrontCapabilitySummarySchema` rather than duplicating their shapes.
- `src/services/shopifyStorefrontRuntime/shopifyStorefrontRuntimeService.ts` owns runtime mode detection, capability matrix assembly, feature flag summarization, environment diagnostics, and developer readiness reporting.
- `src/hooks/shopifyStorefrontRuntime/useShopifyStorefrontRuntime.ts` owns the React-facing `useShopifyStorefrontRuntimeStatus()` hook.
- `src/pages/DevStorefrontDashboard.jsx` owns the read-only `/dev/storefront` developer dashboard.

## Dependency direction

```text
React hook (useShopifyStorefrontRuntimeStatus) → shopifyStorefrontRuntimeService → { shopifyStorefrontConfigService,
                                                                                      shopifyStorefrontService,
                                                                                      shopifyStorefrontCartService,
                                                                                      shopifyStorefrontProductService,
                                                                                      shopifyStorefrontCollectionService,
                                                                                      shopifyCheckoutPreviewService }
                                                            ↓
                                       shopifyStorefrontRuntime schemas / types
```

`shopifyStorefrontRuntimeService` only reads `shopifyStorefrontConfigService.getCapabilitySummary()`/`readEnvironmentConfig()` and each of the five listed foundations' own `getCapabilities()` calls — it never re-implements env parsing, config validation, adapter selection, or capability derivation, and it never calls Shopify itself. It introduces no new adapter and no new `ShopifyStorefrontAdapterMode`.

## Service responsibilities

`shopifyStorefrontRuntimeService` (`createShopifyStorefrontRuntimeService()`) exposes a single entry point:

- `getRuntimeStatus(config?)` — builds a `ShopifyStorefrontRuntimeStatus`:
  - **Runtime mode detection** — `runtimeMode` is derived from the five capability-matrix rows' `adapterMode` values: the shared mode when all rows agree, otherwise `'mixed'`. Every foundation defaults to its own `unavailable` adapter, so this is always `'unavailable'` out of the box.
  - **Capability matrix** — one row per existing Storefront foundation (Shopify Storefront API, Storefront Cart Adapter, Storefront Product Sync, Storefront Collection Sync, Checkout URL Preview), each read directly from that foundation's own `getCapabilities()` call (`adapterMode`, `dryRunOnly`, `liveCallsEnabled`, and a `notes` field carrying the Checkout URL Preview foundation's `checkoutRedirectDisabled` flag).
  - **Configuration validation** — reuses `shopifyStorefrontConfigService.getCapabilitySummary(config)` verbatim as `capabilitySummary`; no env parsing or validation rule is reimplemented.
  - **Feature flag summary** — five aggregated, display-only flags: `storefrontEnabled` (from config), `dryRunOnly` (true only when every foundation reports it), `liveCallsEnabled` (true if any foundation reports it), `liveAdapterReady` (from the config foundation's fixed `false`), and `checkoutRedirectDisabled` (always `true`, since no live checkout redirect exists in this codebase).
  - **Environment diagnostics** — a list of leveled (`info`/`warning`/`error`) messages: the current Vite build mode, one `missing-env-var` warning per missing required variable, a `storefront-disabled` warning when `VITE_SHOPIFY_STOREFRONT_ENABLED` is not `true`, and a standing `live-adapter-not-ready` informational note.
  - **Developer status reporting** — a human-readable `readinessSummary` sentence chosen from the config validation status (`not-configured` / `disabled` / `partially-configured` / `configured`) and the current runtime mode.

The service never calls Shopify itself and never bypasses any existing foundation's adapter boundary.

## Hook

- `useShopifyStorefrontRuntimeStatus()` — computes the runtime status once on mount via `shopifyStorefrontRuntimeService.getRuntimeStatus()` (synchronous, no network I/O) and exposes `{ status, loading, error, refresh }`, following the same shape `useShopifyStorefrontCapabilities()` already established.

## `/dev/storefront` dashboard

`DevStorefrontDashboard` (`src/pages/DevStorefrontDashboard.jsx`, routed at `/dev/storefront` in `src/App.jsx`) is a developer-only, read-only page rendering:

- **Runtime mode** and the developer-facing readiness summary sentence.
- **Configuration status** — config status, Storefront API enabled/disabled, redacted store domain, API version, missing env variables, and live adapter readiness (all sourced from `capabilitySummary.configValidation`, never a raw domain or token).
- **Capability matrix** — a table of the five Storefront foundations' adapter mode, dry-run-only, and live-calls-enabled columns.
- **Feature flags** — the five aggregated flags with on/off state and description.
- **Environment diagnostics** — the leveled diagnostic messages.
- **Related architecture docs** — a plain-text, non-hyperlinked list of this repository's Storefront/Commerce architecture doc paths for reference.

The page has no authentication guard (matching the existing `/admin/debug` prototype-internal page's posture), performs no mutation, and makes no Shopify request — every value comes from `useShopifyStorefrontRuntimeStatus()`.

## Architecture decisions

- **No adapter selection wiring.** Like the Shopify Storefront Live Configuration Readiness foundation it builds on, this foundation does not wire env config into any Storefront service's adapter choice. It only *reports* what each foundation's `getCapabilities()` already returns.
- **A single aggregation service, not five duplicated readers.** `shopifyStorefrontRuntimeService` composes the existing `shopifyStorefrontConfigService` and five foundations' `getCapabilities()` calls rather than re-reading `import.meta.env` or re-deriving adapter modes itself.
- **Doc references are plain text, not hyperlinks.** No canonical published URL exists for this repository's `docs/architecture/` files from within the running app, so the dashboard lists file paths as reference text rather than guessing or constructing a URL.

## Explicit non-goals

This foundation does not implement: real Shopify Storefront API calls, Storefront access token handling, a backend proxy, GraphQL execution, checkout redirects, payments, orders, customer login, authentication changes, or an admin UI. It does not alter any existing checkout, cart, pricing, configurator, or catalog runtime behavior, and it does not change which adapter (`mock` | `unavailable` | `live`) any existing Storefront service uses by default.

## Remaining technical debt / future work

- Once a Storefront access token strategy (backend/proxy) exists, `runtimeMode` and `liveAdapterReady` can begin reflecting a genuinely live-capable state instead of a fixed `unavailable`/`false`.
- The capability matrix and feature flag summary can be extended to include additional foundations (for example Shopify Customer, Order, or Fulfillment synchronization) if a future issue decides developer-facing runtime status should span beyond the customer-facing Storefront foundations.
