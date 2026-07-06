# Shopify Storefront Cart Mutation Readiness

## Purpose

This foundation prepares the Cart Workspace for live Shopify Storefront cart mutations while keeping every live call disabled by default. It adds runtime cart adapter selection, cart mutation request previews, cart line mapping validation, and cart mutation diagnostics on top of the existing Shopify Storefront Cart Adapter Foundation — it does not replace or duplicate that foundation's cart-line mapping, mutation-preview generation, or adapter implementations.

It reuses the Shopify Storefront API Foundation, Shopify Storefront Cart Adapter, Checkout Preparation, Checkout URL Preview, Cart Workspace, Storefront Runtime Dashboard, and Commerce Foundation instead of duplicating any of their request-shape, mapping, or readiness logic.

This foundation does not implement checkout redirect, payments, or orders. `cartAdapterService`'s `'live'` mode still only reaches `createLiveShopifyStorefrontCartAdapter()` through the manual `/dev/storefront` credential form (`configureLiveAdapter()`) — it is never auto-selected from build-time env config. That live adapter itself now performs a real Shopify Storefront `cartCreate` call when configured (see `SHOPIFY_STOREFRONT_CART_ADAPTER.md`'s "Real Shopify cart creation"); this foundation's own mode-selection, mapping-validation, and diagnostics logic is otherwise unchanged.

## Ownership

- `src/types/cartAdapter.ts` owns `CartAdapterMode`, `CartMappingIssue`, `CartMappingValidationResult`, `CartAdapterDiagnostic(Code/Level)`, and `CartAdapterStatusSnapshot`. It reuses `ShopifyStorefrontCartResult` from `src/types/shopifyStorefrontCart.ts` instead of redefining a preview shape.
- `src/schemas/cartAdapter.schema.ts` provides runtime Zod validation for every one of those contracts, composing `shopifyStorefrontCartResultSchema` rather than duplicating it.
- `src/services/cartAdapter/cartAdapterService.ts` owns runtime adapter mode selection, cart mutation request previews, cart line mapping validation, cart mutation diagnostics, and safe fallback.
- `src/hooks/cartAdapter/useCartAdapterStatus.ts` owns the single React-facing hook shared by both the `/dev/storefront` dashboard's Cart Readiness section and the `/cart` Checkout Readiness panel.
- `src/pages/DevStorefrontDashboard.jsx` (existing) gains a Cart Readiness section.
- `src/components/cart/CheckoutReadinessPanel.jsx` (existing) gains a Cart Mutation Readiness block.

## Dependency direction

```text
useCartAdapterStatus()
        ↓
cartAdapterService
        ↓ rebuilds on every adapter-mode change
createShopifyStorefrontCartService(activeAdapter)   (existing factory, reused unchanged)
        ↓
ShopifyStorefrontCartAdapter (mock | unavailable | live)
        ↓                                              ↑
cartWorkspaceService.getState()                commerceService.prepareCartLine()
(Cart Workspace Experience)                     (Commerce Foundation)
```

`cartAdapterService` never bypasses `shopifyStorefrontCartService`'s existing factory — it holds a mutable reference to the currently selected `ShopifyStorefrontCartAdapter` and reconstructs a `ShopifyStorefrontCartService` instance from it via the existing `createShopifyStorefrontCartService()` export whenever the mode changes, exactly as `catalogAdapterService` holds a mutable `CatalogAdapter` reference. It never modifies `shopifyStorefrontCartService`'s singleton export, which continues to default to the unavailable adapter for every existing caller unchanged (the Storefront Cart Preview block already shown in `CheckoutReadinessPanel` keeps its current default behavior).

## Runtime adapter mode resolution

`cartAdapterService` resolves its starting mode from the same three frontend-safe Storefront env variables `catalogAdapterService` reads, via `shopifyStorefrontConfigService.readEnvironmentConfig()` (no new env variable is introduced, and no circular import exists here — unlike `catalogAdapterService`, this module is not on `shopifyStorefrontConfigService`'s import chain):

| Condition | Resolved mode |
| --- | --- |
| `VITE_SHOPIFY_STOREFRONT_ENABLED` is not `"true"` | `mock` |
| Enabled, but store domain/API version are not both configured | `mock` |
| Enabled and configured | `unavailable` — opted in, but a live call still requires an explicit credential |
| `configureLiveAdapter(config)` called with a store domain **and** a Storefront access token | `live` |
| `configureLiveAdapter(config)` called with either missing | `unavailable` (graceful fallback — see below) |

`resetToDefaultAdapter()` recomputes the table above and clears the last preview.

## Safe fallback to mock/unavailable mode

`configureLiveAdapter(config)` only selects `'live'` when both `config.storeDomain` and `config.storefrontAccessToken` are present. An incomplete config never silently reports `'live'` — it falls back to `unavailableShopifyStorefrontCartAdapter`, sets `usedFallback: true`, and records a `fallbackReason` explaining why, surfaced as a `live-config-incomplete` diagnostic. This mirrors the graceful-fallback guarantee `catalogAdapterService.sync()` provides for catalog data: a partially configured live attempt never produces a broken or ambiguous state.

## Cart mutation request preview

`cartAdapterService.previewMutation(lines?, config?)` delegates to `shopifyStorefrontCartService.previewCart()` on whichever adapter is currently active, reusing that service's existing cart-line mapping (via the Commerce Foundation) and `ShopifyStorefrontCartMutationPreview` builder (the `cartLinesAdd` GraphQL operation name, query, and variables) unchanged. The result — including the live-capable request shape and, when the live adapter is active, the exact fetch URL it would call (`buildStorefrontFetchRequest()` from the Shopify Storefront API Foundation) — is stored as `lastPreview` and surfaced read-only in both dashboards. No network call is ever made to produce this preview.

## Cart line mapping validation

`getStatus().mappingValidation` summarizes the last preview's `cartLines`: total line count, mapped count, unmapped count, and one `CartMappingIssue` (`cartLineId`, `sku`, `reason`) per line whose `merchandiseId` the Commerce Foundation has not resolved. This does not re-derive mapping — it reads the same `merchandiseAvailable`/`merchandiseId` flags `shopifyStorefrontCartService`'s existing `mapCartLine()` already computes.

## Cart mutation diagnostics

`getStatus().diagnostics` is a small, display-only list mirroring `shopifyStorefrontRuntimeService`'s diagnostics shape (`code`, `level`, `message`):

- `adapter-mode` (info) — the currently selected mode.
- `live-calls-disabled` (info) — always present; no adapter mode in this foundation performs a real Shopify API call.
- `live-config-incomplete` (warning) — present only after a `configureLiveAdapter()` fallback.
- `empty-cart` (info) — present when the last preview had zero cart lines.
- `unmapped-merchandise` (warning) — present when one or more cart lines are missing a merchandise ID.

## Dev dashboard: `/dev/storefront` Cart Readiness section

`DevStorefrontDashboard` gains a Cart Readiness section, driven by `useCartAdapterStatus()`, showing the active cart adapter mode, mapping validation counts and issues, diagnostics, the mutation request preview (operation name, query, variables), and a manual credential form (store domain, API version, Storefront **public** access token) that calls `activateLiveAdapter()` — the same no-persistence, no-production-credential pattern the existing Catalog Adapter Status section already uses. Leaving the form blank is the default, safe path.

## Cart page: `/cart` Cart Mutation Readiness

`CheckoutReadinessPanel` gains a read-only "Cart Mutation Readiness" block, also driven by `useCartAdapterStatus()` (no credential form on this customer-facing page), showing the active adapter mode, mapping validation summary, and diagnostics. It never changes checkout readiness, blockers, warnings, or the payload preview owned by `checkoutPreparationService`, and it never triggers a live Shopify API call.

## Integration with existing foundations

- **Shopify Storefront Cart Adapter**: reused unchanged — `cartAdapterService` only selects among the existing `mockShopifyStorefrontCartAdapter` / `unavailableShopifyStorefrontCartAdapter` / `createLiveShopifyStorefrontCartAdapter()` and the existing `createShopifyStorefrontCartService()` factory. No new adapter implementation, mutation-preview shape, or cart-line mapping logic is introduced.
- **Cart Workspace**: `previewMutation()` reads live Cart Workspace state via the existing `cartWorkspaceService.getState()`/`subscribe()` pattern when no explicit lines are supplied, identically to `useShopifyStorefrontCartPreview()`.
- **Commerce Foundation**: cart line mapping validation reads the existing `merchandiseId`/`merchandiseAvailable` flags produced by `commerceService.prepareCartLine()`; because `commerceService`'s default adapter is the unavailable adapter, every real cart line reports as unmapped by default, exactly matching `COMMERCE_FOUNDATION.md`.
- **Checkout Preparation / Checkout URL Preview**: untouched. This foundation adds no new blocker, warning, or payload-preview logic and does not read or write `CheckoutPreparationResult` or `ShopifyCheckoutUrlPreview`.
- **Storefront Runtime Dashboard**: the existing capability matrix (`shopifyStorefrontRuntimeService`) and its "Storefront Cart Adapter" row continue to read `shopifyStorefrontCartService.getCapabilities()` (the static default adapter) unchanged; the new Cart Readiness section is an additive, independent panel on the same dashboard page, not a replacement of that row.

## Explicit non-goals

This foundation does not implement: real Shopify Storefront cart mutations, checkout, checkout redirect, payments, orders, customer login, shipping, taxes, or inventory mutations. It does not add a Storefront access token environment variable, a backend proxy, or automatic production credential sourcing. It does not change `ShopifyStorefrontCartRequest`/`ShopifyStorefrontCartResult`/`ShopifyStorefrontCartLine` or any other existing Shopify Storefront Cart Adapter contract. It does not change `shopifyStorefrontCartService`'s singleton default behavior for any existing caller.

## Future extension points

- Replacing `createLiveShopifyStorefrontCartAdapter`'s `execute()` body with an actual `fetch()` call, exactly as described in `SHOPIFY_STOREFRONT_CART_ADAPTER.md`'s "Future live implementation plan" — `cartAdapterService`'s adapter-selection and fallback contract would not need to change.
- Wiring `cartAdapterService`'s selected adapter into the existing `shopifyStorefrontCartService` singleton (and therefore `useShopifyStorefrontCartPreview()`) once a backend/proxy credential strategy is approved, so the `/cart` Storefront Cart Preview block reflects runtime adapter selection directly instead of through the separate Cart Mutation Readiness block.
