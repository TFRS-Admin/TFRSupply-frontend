# Shopify Storefront Live Configuration Readiness

## Purpose

This foundation prepares the app for real Shopify Storefront API connectivity by defining how frontend-safe environment configuration, adapter readiness, and capability status are validated and displayed. It is architecture-only: no live Shopify Storefront API call, GraphQL execution, checkout redirect, payment, order, customer login, or authentication change is implemented. It reuses the existing Shopify Storefront API Foundation, Storefront Product Sync, Storefront Collection Sync, Storefront Cart Adapter, and Shopify Checkout URL Preview foundations rather than duplicating any adapter, service, or hook logic they already own.

## Ownership

- `src/types/shopifyStorefrontConfig.ts` owns `ShopifyStorefrontEnvironmentConfig`, `ShopifyStorefrontConfigValidationResult`, `ShopifyStorefrontConfigStatus`, `ShopifyStorefrontConfigError`, and `ShopifyStorefrontCapabilitySummary`.
- `src/schemas/shopifyStorefrontConfig.schema.ts` owns runtime Zod validation aligned to every one of those contracts.
- `src/services/shopifyStorefrontConfig/shopifyStorefrontConfigService.ts` owns env parsing, config validation, redaction, and capability summary aggregation.
- `src/hooks/shopifyStorefrontConfig/useShopifyStorefrontConfig.ts` owns the React-facing `useShopifyStorefrontConfig()` and `useShopifyStorefrontCapabilities()` hooks.
- `src/components/shopify/StorefrontConfigReadinessRow.jsx` owns the shared, read-only readiness row rendered by the three integration points below.

## Dependency direction

```text
React hooks → shopifyStorefrontConfigService → { shopifyStorefrontService, shopifyStorefrontCartService,
                                                  shopifyStorefrontProductService, shopifyStorefrontCollectionService }
                                    ↓
                     shopifyStorefrontConfig schemas / types
```

`shopifyStorefrontConfigService` only reads existing services' `getCapabilities()` — it never re-implements adapter selection, request building, or mapping derivation, and it never calls Shopify itself. It introduces no new adapter and no new `ShopifyStorefrontAdapterMode`.

## Frontend-safe environment variables

Only these Vite env variables are read, via `import.meta.env`:

| Variable | Purpose |
| --- | --- |
| `VITE_SHOPIFY_STORE_DOMAIN` | The `*.myshopify.com` store domain. Displayed only in redacted form (see below) — never rendered or logged in full. |
| `VITE_SHOPIFY_STOREFRONT_API_VERSION` | The Storefront API version string (for example `2024-10`). |
| `VITE_SHOPIFY_STOREFRONT_ENABLED` | `"true"` (case-insensitive) to opt into treating the Storefront API as enabled; any other value (including unset) is treated as `false`. |

**No Storefront access token variable is supported by this issue.** `ShopifyStorefrontEnvironmentConfig` has no token field, `shopifyStorefrontConfigService` never reads or requires one, and no UI surfaced by this foundation ever renders or logs one. Token handling requires a future backend/proxy or another approved secret strategy — see "Explicit non-goals" below.

## Service responsibilities

`shopifyStorefrontConfigService` (`createShopifyStorefrontConfigService()`) exposes:

- `readEnvironmentConfig(env?)` — reads the three frontend-safe env variables above into a schema-validated `ShopifyStorefrontEnvironmentConfig`. Blank or missing values are normalized to `null` (or `false` for the enabled flag). Defaults to `import.meta.env` when no `env` argument is supplied.
- `validateConfig(config?)` — validates the shape and produces a `ShopifyStorefrontConfigValidationResult`: a `status` (`not-configured` | `partially-configured` | `configured` | `disabled`), the list of required/present/missing env var names, a redacted store domain, and a list of `ShopifyStorefrontConfigError` entries (`missing-store-domain`, `missing-api-version`, `storefront-disabled`). `storefrontEnabled: false` always yields `status: 'disabled'`, even if the domain and API version are both present.
- `getCapabilitySummary(config?)` — aggregates `configValidation` with the `adapterMode` reported by `shopifyStorefrontService`, `shopifyStorefrontCartService`, `shopifyStorefrontProductService`, and `shopifyStorefrontCollectionService`'s existing `getCapabilities()` calls, plus a fixed `liveAdapterReady: false` with a `liveAdapterReadinessReason` explaining that a Storefront access token can never be present in frontend-safe env config and that live calls require a future backend/proxy.
- `redactStoreDomain(domain)` — masks a store domain's subdomain label (keeping up to its first two characters visible) while leaving the `.myshopify.com` suffix visible, so a reader can sanity-check which store is configured without ever seeing the full domain in the UI.

All three read methods are synchronous and pure with respect to network I/O — they never perform a live Shopify API call.

## Hooks

- `useShopifyStorefrontConfig()` — returns `{ config, validation, refresh }`. Computes both via `useMemo` since env reading/validation is synchronous; `refresh()` forces a recompute.
- `useShopifyStorefrontCapabilities()` — returns `{ summary, loading, error, refresh }`, following the same loading/error/refresh shape as `useStorefrontAvailability()` from the Shopify Storefront API Foundation. Computes the capability summary once on mount and exposes `refresh()` for manual re-checks.

## Integration with existing readiness UI

- **`/cart` Checkout Readiness panel** (`src/components/cart/CheckoutReadinessPanel.jsx`, composed in `src/pages/CartWorkspace.jsx`): receives an optional `storefrontCapabilitySummary` prop (from `useShopifyStorefrontCapabilities()`) and renders the shared `StorefrontConfigReadinessRow` plus a "Live adapter ready" line with the readiness reason. Purely additive — it never changes checkout blockers, warnings, or the payload preview.
- **Product Detail Storefront Product panel** (`src/components/product/StorefrontProductPanel.jsx`): calls `useShopifyStorefrontConfig()` directly and renders `StorefrontConfigReadinessRow` beneath the existing mapping/adapter-mode section.
- **Category Storefront Collection panel** (`src/components/product/StorefrontCollectionPanel.jsx`): calls `useShopifyStorefrontConfig()` directly and renders `StorefrontConfigReadinessRow` beneath the existing mapping/adapter-mode section.

Every integration point displays: config status, Storefront API enabled/disabled, required env variable presence (including which are missing), live adapter readiness, and the redacted store domain. None displays a token, and none makes a Shopify API call.

## Architecture decisions

- **No adapter selection wiring.** This issue does not wire env config into `shopifyStorefrontService`/`shopifyStorefrontCartService`/`shopifyStorefrontProductService`/`shopifyStorefrontCollectionService`'s adapter choice — those services still default to their `unavailable` adapters regardless of env state. `getCapabilitySummary()` only *reports* each service's current `adapterMode`; it does not change it. Wiring live/mock adapter selection to this config is left to a future issue.
- **`liveAdapterReady` is a fixed `false`.** Because a Storefront access token can never appear in frontend-safe Vite env config, there is no configuration state in which a live Storefront call could safely be issued from the browser today. Rather than compute a value that could misleadingly read `true` while still being unusable, this foundation reports a constant `false` with an explicit reason, matching the existing live-adapter stubs' `live-calls-disabled` posture.
- **A shared readiness row component.** `StorefrontConfigReadinessRow` centralizes the config-status/enabled/domain/missing-vars display so the three integration points render identical, redacted output instead of three divergent implementations.

## Explicit non-goals

This foundation does not implement: real Shopify Storefront API calls, Storefront access token handling, a backend proxy, GraphQL execution, checkout redirects, payments, orders, customer login, or authentication changes. It does not alter any existing checkout, cart, pricing, configurator, or catalog runtime behavior, and it does not change which adapter (`mock` | `unavailable` | `live`) any existing Storefront service uses by default.

## Remaining technical debt / future work

- Wiring `VITE_SHOPIFY_STOREFRONT_ENABLED` (and a resolved store domain/API version) into actual adapter selection for `shopifyStorefrontService` and its siblings, once a token strategy exists.
- Introducing a backend/proxy or another approved secret strategy for the Storefront access token, after which `liveAdapterReady` can become a genuinely computed value instead of a fixed `false`.
- Extending `getCapabilitySummary()` to include a live availability probe (reusing `shopifyStorefrontService.getAvailability()`) once a live adapter is actually connected.

## Shopify Storefront Runtime Readiness

The Shopify Storefront Runtime Readiness foundation is documented in [SHOPIFY_STOREFRONT_RUNTIME_READINESS.md](./SHOPIFY_STOREFRONT_RUNTIME_READINESS.md). It reuses this foundation's `getCapabilitySummary()`/`readEnvironmentConfig()` verbatim as the `capabilitySummary` in its aggregated `ShopifyStorefrontRuntimeStatus`, and adds a developer-facing runtime mode, capability matrix, feature flag summary, and environment diagnostics on top, surfaced only on the developer-only `/dev/storefront` dashboard. It does not change this foundation's env-reading, validation, or redaction logic.
