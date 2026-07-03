# Shopify Storefront Cart Adapter Foundation

## Purpose

This foundation connects the existing Shopify Storefront API Foundation to the Cart Workspace and Checkout Preparation Layer's cart/commerce contracts, establishing a typed cart/checkout-preparation boundary. It is architecture-only: it does not enable live checkout, perform a real Shopify Storefront API call, create a Shopify cart, generate a real checkout URL, or redirect the customer to checkout. It reuses the existing Shopify Storefront API Foundation, Cart Workspace, Checkout Preparation Layer, and Commerce Foundation instead of duplicating any cart, commerce, or Storefront request-shape logic they already own.

## Ownership

- `src/types/shopifyStorefrontCart.ts` owns `ShopifyStorefrontCartRequest`, `ShopifyStorefrontCartResult`, `ShopifyStorefrontCartLine`, `ShopifyStorefrontCartStatus`, `ShopifyStorefrontCartError`, `ShopifyStorefrontCheckoutPreview`, `ShopifyStorefrontCartMutationPreview`, and `ShopifyStorefrontCartCapabilities`. It reuses `CartLineItem` from `src/types/cartWorkspace.ts` and `ShopifyStorefrontClientConfig` from `src/types/shopifyStorefront.ts` instead of redefining either.
- `src/schemas/shopifyStorefrontCart.schema.ts` provides runtime Zod validation for every public contract, composing `cartLineItemSchema` and `moneySchema` rather than duplicating their shapes.
- `src/adapters/shopifyStorefrontCart/` owns the adapter boundary:
  - `ShopifyStorefrontCartAdapter` — the interface (`execute`) any implementation must satisfy. It is deliberately narrow: `shopifyStorefrontCartService` owns cart-line mapping and mutation-preview generation itself, so the adapter's only job is deciding status/errors/checkout-preview metadata for an already-mapped set of lines — the same request/response-translation role every adapter in this repository plays.
  - `mockShopifyStorefrontCartAdapter` — the deterministic default implementation. It performs no I/O and calls no Shopify API; every request resolves as a successful dry run with a placeholder (non-network) `checkoutUrlPreview`.
  - `unavailableShopifyStorefrontCartAdapter` — the default adapter used by `shopifyStorefrontCartService` when no adapter is injected. Every `execute()` call returns an `adapter-unavailable` result with a retryable error and a `null` checkout preview.
  - `createLiveShopifyStorefrontCartAdapter(config)` / `liveShopifyStorefrontCartAdapter` — a **stub only**. It reuses `buildStorefrontFetchRequest()` from the Shopify Storefront API Foundation (`src/adapters/shopifyStorefront/liveShopifyStorefrontAdapter.ts`) to build the exact fetch request shape a real cart mutation would send, but it never calls `fetch()`; every `execute()` call resolves with `status: 'failed'` and error code `live-calls-disabled`.
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
  - `useShopifyStorefrontCartPreview()` — reads the live Cart Workspace state via `shopifyStorefrontCartService.previewCart()` and re-evaluates whenever a cart line is added, updated, or removed, by subscribing to the same `cartWorkspaceService.subscribe()` pub/sub `useCheckoutPreparation()` already uses.

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
| `succeeded` | Reserved for a future live adapter that actually executes a Storefront cart mutation. |
| `failed` | `liveShopifyStorefrontCartAdapter` returns this today (`live-calls-disabled`), since it never calls the real API. |
| `adapter-unavailable` | The configured adapter cannot serve Storefront cart data — the default behavior. |

## Integration with existing foundations

- **Cart Workspace / Checkout Preparation**: `useShopifyStorefrontCartPreview()` is surfaced in `CheckoutReadinessPanel` (`src/components/cart/CheckoutReadinessPanel.jsx`) via a `storefrontCartPreview` prop passed from `/cart` (`src/pages/CartWorkspace.jsx`). This is purely additive, read-only UI — it renders the Storefront cart status, cart line count, checkout URL preview placeholder, mutation preview metadata, and adapter mode, and never changes any checkout blocker, warning, or payload-preview line owned by `checkoutPreparationService`. Because the default adapter is `unavailableShopifyStorefrontCartAdapter`, the panel shows an `adapter-unavailable` status and a "Not available" checkout URL preview by default, and no runtime behavior changes.
- **Shopify Storefront API Foundation**: This foundation's live adapter stub reuses `buildStorefrontFetchRequest()` rather than redefining the Storefront GraphQL fetch-request shape. It does not modify `shopifyStorefrontService`, `ShopifyStorefrontAdapter`, or any of that foundation's existing operation types.
- **Commerce Foundation**: Cart-line mapping composes the existing `commerceService.prepareCartLine(sku, quantity)` exactly as `cartWorkspaceService.prepareCheckout()` and `checkoutPreparationService` already do. Because `commerceService`'s default adapter remains the unavailable adapter described in `COMMERCE_FOUNDATION.md`, every real cart line reports `merchandiseAvailable: false` until a real `CommerceAdapter` is connected in a dedicated issue.
- **Checkout Preparation Layer**: This foundation does not read or write `CheckoutPreparationResult`, does not participate in readiness/blocker/warning computation, and does not affect `checkoutPreparationService.prepareCheckout()` in any way. It is a separate, read-only Storefront cart preview alongside the existing Checkout Readiness rows.

## Future live implementation plan

A future issue can introduce a real Storefront cart mutation client by:

1. Replacing `createLiveShopifyStorefrontCartAdapter`'s `execute()` body with an actual `fetch()` call against the request built by `buildStorefrontFetchRequest()`, parsing the GraphQL response into a real `checkoutPreview.checkoutUrlPreview`/`cartId`.
2. Expanding the mutation preview builder to support `cartCreate` (for a not-yet-existing Shopify cart) in addition to `cartLinesAdd`, and to encode line `attributes` (for example package references) into the real mutation payload.
3. Wiring a real Shopify cart ID into subsequent requests once a live cart has been created, instead of building a stateless preview on every call.
4. Connecting checkout redirect behavior only after checkout, payments, and order creation are approved in a dedicated issue — this foundation intentionally stops short of that integration.

## Explicit non-goals

This foundation does not implement: real Shopify Storefront cart mutations, a real Shopify checkout URL, checkout redirect, payments, orders, customer login, shipping, taxes, or inventory mutations. It does not change any existing Cart Workspace, Checkout Preparation, Commerce, pricing, configurator, or catalog runtime behavior. `mockShopifyStorefrontCartAdapter`'s dry-run response is not a substitute for a real Shopify cart and must not be treated as one.
