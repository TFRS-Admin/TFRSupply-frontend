# Shopify Storefront Cart Adapter Foundation

## Purpose

This foundation connects the existing Shopify Storefront API Foundation to the Cart Workspace and Checkout Preparation Layer's cart/commerce contracts, establishing a typed cart/checkout-preparation boundary. Its `previewCart()`/dry-run path (the default, adapter-unavailable-by-default `shopifyStorefrontCartService` singleton) remains architecture-only and never calls Shopify. A dedicated real-call path now exists alongside it: `shopifyStorefrontCartCreateService.createCart()` performs a real Storefront API `cartCreate` mutation and returns a real Shopify cart ID and checkout URL (see "Real Shopify cart creation" below). It reuses the existing Shopify Storefront API Foundation, Cart Workspace, Checkout Preparation Layer, and Commerce Foundation instead of duplicating any cart, commerce, or Storefront request-shape logic they already own.

## Ownership

- `src/types/shopifyStorefrontCart.ts` owns `ShopifyStorefrontCartRequest`, `ShopifyStorefrontCartResult`, `ShopifyStorefrontCartLine`, `ShopifyStorefrontCartStatus`, `ShopifyStorefrontCartError`, `ShopifyStorefrontCheckoutPreview`, `ShopifyStorefrontCartMutationPreview`, and `ShopifyStorefrontCartCapabilities`. It reuses `CartLineItem` from `src/types/cartWorkspace.ts` and `ShopifyStorefrontClientConfig` from `src/types/shopifyStorefront.ts` instead of redefining either.
- `src/schemas/shopifyStorefrontCart.schema.ts` provides runtime Zod validation for every public contract, composing `cartLineItemSchema` and `moneySchema` rather than duplicating their shapes.
- `src/adapters/shopifyStorefrontCart/` owns the adapter boundary:
  - `ShopifyStorefrontCartAdapter` — the interface (`execute`) any implementation must satisfy. It is deliberately narrow: `shopifyStorefrontCartService` owns cart-line mapping and mutation-preview generation itself, so the adapter's only job is deciding status/errors/checkout-preview metadata for an already-mapped set of lines — the same request/response-translation role every adapter in this repository plays.
  - `mockShopifyStorefrontCartAdapter` — the deterministic default implementation. It performs no I/O and calls no Shopify API; every request resolves as a successful dry run with a placeholder (non-network) `checkoutUrlPreview`.
  - `unavailableShopifyStorefrontCartAdapter` — the default adapter used by `shopifyStorefrontCartService` when no adapter is injected. Every `execute()` call returns an `adapter-unavailable` result with a retryable error and a `null` checkout preview.
  - `createLiveShopifyStorefrontCartAdapter(config, fetchImpl?)` / `liveShopifyStorefrontCartAdapter` — the **live implementation**. When both `config.storeDomain` and `config.storefrontAccessToken` are present, it builds a real `cartCreate` mutation (`buildCartCreateMutationPreview()`) via `buildStorefrontFetchRequest()` and performs an actual `fetch()` against the Storefront GraphQL endpoint (following the same fetchImpl-injection and no-throw failure-mapping pattern `createLiveShopifyStorefrontCatalogAdapter` established). Missing config, a network error, a non-2xx response, top-level GraphQL errors, and Shopify `userErrors` all resolve to a `failed` result (`configuration-error` / `network-error` / `shopify-error`) instead of throwing. On success it resolves `status: 'succeeded'` with `checkoutPreview.cartId`/`checkoutPreview.checkoutUrlPreview` set to the real Shopify cart ID and checkout URL Shopify returned.
- `src/services/shopifyStorefrontCart/shopifyStorefrontCartService.ts` owns:
  1. **Request validation** — `shopifyStorefrontCartRequestSchema.parse()` on every `buildRequest()`/`execute()` call.
  2. **Cart-line mapping** — maps each `CartLineItem` to a `ShopifyStorefrontCartLine` by calling the existing `commerceService.prepareCartLine(sku, quantity)` (Commerce Foundation), the same call `cartWorkspaceService.prepareCheckout()` and `checkoutPreparationService` already make. No commerce lookup logic is reimplemented; `merchandiseId` is the resolved `shopifyVariantGid`/`shopifyVariantId` from the existing `VariantMapping` contract, or `null` when commerce has not resolved a variant.
  3. **Mutation preview generation** — builds a pure, deterministic `ShopifyStorefrontCartMutationPreview` (`operationName`, GraphQL `query`, `variables`) representing a Storefront `cartLinesAdd` mutation. This is a string/object builder only; it performs no network I/O.
  4. **Adapter delegation** — hands the mapped cart lines, mutation preview, and an already-computed `estimatedTotal` (via the existing Live Pricing Engine `addMoney` helper from `@/domain/pricing`, over each line's existing `lineTotal`) to the injected `ShopifyStorefrontCartAdapter`.
  5. **Checkout preview metadata** — returns whatever `ShopifyStorefrontCheckoutPreview` the adapter reports (`checkoutUrlPreview`, `cartId`, `currencyCode`, `estimatedTotal`, `lineCount`, `ready`), tagging the response `metadata.attributes.adapterMode` for display purposes.
  6. **`previewCart(lines?, config?)`** — a convenience entry point that reads the live Cart Workspace state via `cartWorkspaceService.getState()` when no explicit lines are supplied, builds a request, and executes it. This is what the `/cart` Checkout Readiness panel's Storefront cart preview uses.
  7. **`getCapabilities()`** — returns `ShopifyStorefrontCartCapabilities` (`dryRunOnly: true`, `liveCallsEnabled: false`, and the injected adapter's `adapterMode`).
- `src/hooks/shopifyStorefrontCart/useShopifyStorefrontCart.ts` owns two React-facing hooks:
  - `useShopifyStorefrontCart()` — runs a single already-built `ShopifyStorefrontCartRequest` through `shopifyStorefrontCartService.execute()`. Owns loading/error state only.
  - `useShopifyStorefrontCartPreview()` — reads the live Cart Workspace state via `shopifyStorefrontCartService.previewCart()` and re-evaluates whenever a cart line is added, updated, or removed, by subscribing to the same `cartWorkspaceService.subscribe()` pub/sub `useCheckoutPreparation()` already uses. This hook still only drives the default adapter-unavailable-by-default `shopifyStorefrontCartService` singleton — it is unaffected by real cart creation below.
- `src/services/shopifyStorefrontCart/shopifyStorefrontCartCreateService.ts` owns real Shopify cart creation:
  - `readCartCreateCredentials(env?)` reads `VITE_SHOPIFY_STORE_DOMAIN`, `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN`, and an optional `VITE_SHOPIFY_STOREFRONT_API_VERSION` override from `import.meta.env`. Unlike `shopifyStorefrontConfigService.readEnvironmentConfig()`, this deliberately reads the Storefront access token — it is Shopify's public Storefront API token, designed to ship inside a client bundle, not the private Admin API secret the Storefront Runtime Configuration foundation's non-goal refers to.
  - `createCart(lines?, options?)` resolves credentials (from env by default, or `options.credentials`/`options.fetchImpl` for tests and future callers), constructs a `createLiveShopifyStorefrontCartAdapter(...)` with them, and delegates to `createShopifyStorefrontCartService(liveAdapter, ...).previewCart(lines)` — no cart-line mapping, mutation-preview, or request-building logic is reimplemented. Missing credentials are never thrown; the live adapter's own configuration gate reports a graceful `failed`/`configuration-error` result.

## Dependency direction

```text
React hooks → shopifyStorefrontCartService → ShopifyStorefrontCartAdapter → future Shopify Storefront cart mutation API
                          │                              ↑
                          │                buildStorefrontFetchRequest()
                          │                (reused from Shopify Storefront API Foundation)
                          ↓
             cartWorkspaceService.getState()   commerceService.prepareCartLine()
             (Cart Workspace Experience)        (Commerce Foundation)
                          ↓
             shopifyStorefrontCart schemas / types
```

`shopifyStorefrontCartService` is the sole caller of the adapter. It never calls `checkoutPreparationService`, and `checkoutPreparationService` never calls it back — both are independent, read-only consumers of `cartWorkspaceService` and `commerceService`, kept parallel rather than layered so neither foundation's readiness decision depends on the other.

## Cart mutation lifecycle

`ShopifyStorefrontCartStatus` mirrors the lifecycle already established by `ShopifyStorefrontResponseStatus` in the Shopify Storefront API Foundation:

| Status | Meaning |
| --- | --- |
| `not-started` | Reserved for a future request-tracking layer; no adapter in this foundation returns it today. |
| `dry-run` | `mockShopifyStorefrontCartAdapter` admitted the request and returned a deterministic, simulated success. |
| `succeeded` | The live adapter performed a real `cartCreate` mutation and Shopify returned a cart id and checkout URL. |
| `failed` | The live adapter's config gate rejected the request (`configuration-error`), or the real `fetch()` call failed (`network-error`), or Shopify reported an error (`shopify-error`). |
| `adapter-unavailable` | The configured adapter cannot serve Storefront cart data — the default behavior. |

## Integration with existing foundations

- **Cart Workspace / Checkout Preparation**: `useShopifyStorefrontCartPreview()` is surfaced in `CheckoutReadinessPanel` (`src/components/cart/CheckoutReadinessPanel.jsx`) via a `storefrontCartPreview` prop passed from `/cart` (`src/pages/CartWorkspace.jsx`). This is purely additive, read-only UI — it renders the Storefront cart status, cart line count, checkout URL preview placeholder, mutation preview metadata, and adapter mode, and never changes any checkout blocker, warning, or payload-preview line owned by `checkoutPreparationService`. Because the default adapter is `unavailableShopifyStorefrontCartAdapter`, the panel shows an `adapter-unavailable` status and a "Not available" checkout URL preview by default, and no runtime behavior changes.
- **Shopify Storefront API Foundation**: The live adapter reuses `buildStorefrontFetchRequest()` rather than redefining the Storefront GraphQL fetch-request shape. It does not modify `shopifyStorefrontService`, `ShopifyStorefrontAdapter`, or any of that foundation's existing operation types.
- **Commerce Foundation**: Cart-line mapping composes the existing `commerceService.prepareCartLine(sku, quantity)` exactly as `cartWorkspaceService.prepareCheckout()` and `checkoutPreparationService` already do. Because `commerceService`'s default adapter remains the unavailable adapter described in `COMMERCE_FOUNDATION.md`, every real cart line reports `merchandiseAvailable: false` until a real `CommerceAdapter` is connected in a dedicated issue — and `shopifyStorefrontCartCreateService.createCart()` omits any line without a resolved `merchandiseId` from the real `cartCreate` mutation entirely (Shopify's `CartInput` requires one per line).
- **Checkout Preparation Layer**: This foundation does not read or write `CheckoutPreparationResult`, does not participate in readiness/blocker/warning computation, and does not affect `checkoutPreparationService.prepareCheckout()` in any way. It is a separate, read-only Storefront cart preview alongside the existing Checkout Readiness rows.
- **Cart Workspace UI**: The `/cart` page's "Proceed to Checkout" button (`CartWorkspace.jsx`) now calls `shopifyStorefrontCartCreateService.createCart()` via `useShopifyStorefrontCartCreate()` and redirects (`window.location.href`) to the real `checkoutUrl` on success. `resolveShopifyCheckoutOutcome()` (`src/services/shopifyStorefrontCart/shopifyStorefrontCheckoutOutcome.ts`) is the pure function deciding redirect-vs-notice from a `ShopifyStorefrontCartResult`, surfacing a distinct message for `configuration-error`, `shopify-error`, and `network-error`. Every other cart line (readiness panel, mini cart, quantity/remove/clear actions, request-quote) is unchanged.

## Real Shopify cart creation

`shopifyStorefrontCartCreateService.createCart(lines?, options?)` (`src/services/shopifyStorefrontCart/shopifyStorefrontCartCreateService.ts`) is the real, non-preview entry point:

1. Resolves credentials via `readCartCreateCredentials()` (reading `VITE_SHOPIFY_STORE_DOMAIN` and `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` from `import.meta.env`) unless `options.credentials` is supplied.
2. Constructs a `createLiveShopifyStorefrontCartAdapter(...)` with those credentials (and `options.fetchImpl`, for tests) and delegates to `createShopifyStorefrontCartService(liveAdapter, ...).previewCart(lines)` — reusing the existing cart-line mapping (Commerce Foundation) and request orchestration unchanged.
3. Never throws on missing or invalid credentials: the live adapter's own `isConfigured()` gate returns a `failed` result with error code `configuration-error` before attempting any `fetch()`.
4. On success, returns `status: 'succeeded'` with `checkoutPreview.cartId` and `checkoutPreview.checkoutUrlPreview` set to the real values Shopify's `cartCreate` mutation returned — never a fabricated or placeholder URL.

This supersedes item 1 of the "Future live implementation plan" below for the cart-creation path specifically; `shopifyStorefrontCartService`'s own singleton (used by `useShopifyStorefrontCartPreview()`) is untouched and still defaults to `unavailableShopifyStorefrontCartAdapter`.

## Future live implementation plan

Remaining follow-up work:

1. ~~Replacing `createLiveShopifyStorefrontCartAdapter`'s `execute()` body with an actual `fetch()` call~~ — done (see "Real Shopify cart creation" above).
2. ~~Expanding the mutation preview builder to support `cartCreate`~~ — done; the live adapter builds and sends a real `cartCreate` mutation, encoding line `attributes` (for example package references) into the payload.
3. Wiring a real Shopify cart ID into subsequent requests once a live cart has been created (`cartLinesAdd`/`cartLinesUpdate` against an existing cart ID), instead of creating a fresh cart on every call.
4. ~~Connecting the `/cart` "Proceed to Checkout" button to `shopifyStorefrontCartCreateService.createCart()` and defining checkout redirect behavior~~ — done (see "Cart Workspace UI" above). Payments and order creation still require a dedicated issue; this foundation stops at redirecting to Shopify's own checkout.

## Explicit non-goals

This foundation does not implement: payments, orders, customer login, shipping, taxes, inventory mutations, or Fleet Advantage. It does not change any existing Cart Workspace, Checkout Preparation, Commerce, pricing, configurator, or catalog runtime behavior beyond the `/cart` "Proceed to Checkout" button's real cart-creation/redirect wiring described above. `mockShopifyStorefrontCartAdapter`'s dry-run response is not a substitute for a real Shopify cart and must not be treated as one.

## Shopify Checkout URL Preview Foundation

`shopifyStorefrontCartService.previewCart()`'s `checkoutPreview` (`ShopifyStorefrontCheckoutPreview`) is also consumed by the Shopify Checkout URL Preview Foundation (see [SHOPIFY_CHECKOUT_URL_PREVIEW.md](./SHOPIFY_CHECKOUT_URL_PREVIEW.md)), which combines it with the Checkout Preparation Layer's blockers/warnings to produce the final, read-only `ShopifyCheckoutUrlPreview` shown on `/cart`. That foundation is a read-only consumer only — it never mutates `ShopifyStorefrontCartResult`, never calls this foundation's adapter directly, and adds no cart-line-mapping or mutation-preview logic of its own.

## Shopify Storefront Live Configuration Readiness

The Shopify Storefront Live Configuration Readiness foundation (see [SHOPIFY_STOREFRONT_LIVE_CONFIG_READINESS.md](./SHOPIFY_STOREFRONT_LIVE_CONFIG_READINESS.md)) reads this foundation's `shopifyStorefrontCartService.getCapabilities()`'s `adapterMode` into its aggregated `ShopifyStorefrontCapabilitySummary`, and its `liveAdapterReady` flag is surfaced alongside the existing Storefront Cart Preview in the `/cart` Checkout Readiness panel. It adds no new cart-line mapping, mutation-preview, or adapter-selection logic to this foundation.
