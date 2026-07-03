# Shopify Checkout URL Preview Foundation

## Purpose

This foundation is the final, read-only boundary before a future live Shopify checkout. It generates and displays a deterministic checkout URL preview by composing the existing Checkout Preparation Layer (readiness, blockers, warnings) and the existing Shopify Storefront Cart Adapter Foundation (Storefront cart checkout-preview metadata). It is architecture-only: it makes no live Shopify API call, performs no checkout redirect, and creates no payment, order, tax, or shipping record. It reuses the existing Cart Workspace, Checkout Preparation Layer, Shopify Storefront Cart Adapter Foundation, and Commerce Foundation instead of duplicating any cart, checkout-readiness, or Storefront cart logic they already own.

## Ownership

- `src/types/shopifyCheckoutPreview.ts` owns `ShopifyCheckoutPreviewRequest`, `ShopifyCheckoutPreviewResult`, `ShopifyCheckoutPreviewStatus`, `ShopifyCheckoutPreviewError`, `ShopifyCheckoutPreviewErrorCode`, `ShopifyCheckoutPreviewAdapterMode`, `ShopifyCheckoutPreviewCapabilities`, `ShopifyCheckoutPreviewBlocker`/`ShopifyCheckoutPreviewWarning`, and `ShopifyCheckoutUrlPreview`. It reuses `CartLineItem` from `src/types/cartWorkspace.ts`, `CheckoutIssueCategory` from `src/types/checkoutPreparation.ts` (extended with the single new `'storefront'` category, `ShopifyCheckoutPreviewIssueCategory`), and `ShopifyStorefrontClientConfig` from `src/types/shopifyStorefront.ts` instead of redefining any of them.
- `src/schemas/shopifyCheckoutPreview.schema.ts` provides runtime Zod validation for every public contract, composing `cartLineItemSchema` and `checkoutIssueCategorySchema` rather than duplicating their shapes.
- `src/adapters/shopifyCheckoutPreview/` owns the adapter boundary:
  - `ShopifyCheckoutPreviewAdapter` — the interface (`execute`) any implementation must satisfy. It is deliberately narrow: `shopifyCheckoutPreviewService` owns blocker/warning aggregation itself (from `checkoutPreparationService` and the Storefront cart's availability), so the adapter's only job is deciding the final `status`/`errors`/`urlPreview` for an already-evaluated request — the same request/response-translation role every adapter in this repository plays.
  - `mockShopifyCheckoutPreviewAdapter` — the deterministic default implementation. It performs no I/O and calls no Shopify API; when there are no blockers and the Storefront cart's checkout preview reports `ready: true`, it resolves a deterministic, non-network `checkoutUrlPreview`; otherwise it reports `status: 'blocked'` with no preview.
  - `unavailableShopifyCheckoutPreviewAdapter` — the default adapter used by `shopifyCheckoutPreviewService` when no adapter is injected. Every `execute()` call returns an `adapter-unavailable` result with a retryable error and a `null` URL preview.
  - `createLiveShopifyCheckoutPreviewAdapter(config)` / `liveShopifyCheckoutPreviewAdapter` — a **stub only**. It never calls Shopify; every `execute()` call resolves with `status: 'failed'` and error code `live-calls-disabled`.
- `src/services/shopifyCheckoutPreview/shopifyCheckoutPreviewService.ts` owns:
  1. **Request validation** — `shopifyCheckoutPreviewRequestSchema.parse()` on every `buildRequest()`/`execute()` call.
  2. **Cart Workspace consumption** — reads the live Cart Workspace state via `cartWorkspaceService.getState()` when no explicit `lines` are supplied, exactly as `checkoutPreparationService` and `shopifyStorefrontCartService` already do.
  3. **Checkout readiness consumption** — calls the existing `checkoutPreparationService.prepareCheckout({ lines })` and reuses its `blockers`/`warnings` verbatim (no cart, configuration, package, pricing, or commerce validation rule is reimplemented).
  4. **Storefront cart consumption** — calls the existing `shopifyStorefrontCartService.previewCart(lines, config)` and reads its `ShopifyStorefrontCheckoutPreview` metadata (`checkoutUrlPreview`, `cartId`, `currencyCode`, `estimatedTotal`, `lineCount`, `ready`). No Storefront cart-line mapping or mutation-preview logic is reimplemented.
  5. **Checkout-URL-preview-specific blockers** — adds one new blocker (`checkout-preview.storefront-cart-unavailable`, `category: 'storefront'`) when the Storefront cart adapter is unavailable or reports no checkout preview, since a checkout URL preview cannot be generated without it.
  6. **Adapter delegation** — hands `hasBlockers` and the Storefront cart's checkout-preview metadata to the injected `ShopifyCheckoutPreviewAdapter`, which decides the final `status`/`errors`/`urlPreview`.
  7. **Status resolution** — a blocked outcome from either source always wins over what the adapter itself would otherwise report (mirroring how `checkoutPreparationService` forces `status: 'blocked'` whenever any blocker exists), while `adapter-unavailable`/`failed` (from the adapter itself) always take precedence.
  8. **`previewCheckout(lines?, config?)`** — a convenience entry point that reads the live Cart Workspace state via `cartWorkspaceService.getState()` when no explicit lines are supplied, builds a request, and executes it. This is what the `/cart` Checkout Readiness panel's checkout URL preview uses.
  9. **`getCapabilities()`** — returns `ShopifyCheckoutPreviewCapabilities` (`dryRunOnly: true`, `liveCallsEnabled: false`, `checkoutRedirectDisabled: true`, and the injected adapter's `adapterMode`).
- `src/hooks/shopifyCheckoutPreview/useShopifyCheckoutPreview.ts` owns the React-facing entry point: reads the live Cart Workspace state via `shopifyCheckoutPreviewService.previewCheckout()` and re-evaluates whenever a cart line is added, updated, or removed, by subscribing to the same `cartWorkspaceService.subscribe()` pub/sub `useCheckoutPreparation()` and `useShopifyStorefrontCartPreview()` already use. It owns loading/error state only.

## Dependency direction

```text
React hook (useShopifyCheckoutPreview) → shopifyCheckoutPreviewService → ShopifyCheckoutPreviewAdapter → future live Shopify checkout URL
                                                    │
                          ┌─────────────────────────┼─────────────────────────┐
                          │                         │                         │
              checkoutPreparationService   shopifyStorefrontCartService   cartWorkspaceService.getState()
             (Checkout Preparation Layer)  (Storefront Cart Adapter)      (Cart Workspace Experience)
                          │                         │
             checkoutPreparation schemas   shopifyStorefrontCart schemas
                          │                         │
                          └───────────┬─────────────┘
                                      ↓
                       shopifyCheckoutPreview schemas / types
```

`shopifyCheckoutPreviewService` is the sole caller of the adapter. It is a read-only consumer of `checkoutPreparationService` and `shopifyStorefrontCartService` — it never writes back to either, and neither of those services is aware this foundation exists, keeping all three independent and layered only in one direction (this foundation depends on the other two, never the reverse).

## Checkout URL preview lifecycle

`ShopifyCheckoutPreviewStatus` mirrors the lifecycle already established by `ShopifyStorefrontCartStatus`:

| Status | Meaning |
| --- | --- |
| `not-started` | Reserved for a future request-tracking layer; no adapter in this foundation returns it today. |
| `preview-ready` | `mockShopifyCheckoutPreviewAdapter` admitted the request (no blockers, Storefront cart ready) and returned a deterministic, simulated checkout URL preview. |
| `blocked` | Either `checkoutPreparationService` reported a readiness blocker, or the Storefront cart preview is unavailable — reused/added blockers are always listed in `result.blockers`. |
| `failed` | `liveShopifyCheckoutPreviewAdapter` returns this today (`live-calls-disabled`), since it never calls the real API. |
| `adapter-unavailable` | The configured adapter cannot serve a checkout URL preview — the default behavior. |

`result.checkoutRedirectDisabled` is always `true` — there is no code path in this foundation that sets it to `false`, and no component ever reads it as a signal to redirect.

## Integration with existing foundations

- **Checkout Preparation Layer**: `shopifyCheckoutPreviewService` calls `checkoutPreparationService.prepareCheckout({ lines })` and copies its `blockers`/`warnings` into its own result unmodified. It never re-validates cart, configuration, package, pricing, or commerce readiness itself.
- **Shopify Storefront Cart Adapter Foundation**: `shopifyCheckoutPreviewService` calls `shopifyStorefrontCartService.previewCart(lines, config)` and reads its `checkoutPreview` metadata to build the final `ShopifyCheckoutUrlPreview`. It never maps cart lines or builds a Storefront mutation preview itself — both remain owned by `shopifyStorefrontCartService`.
- **Cart Workspace**: `previewCheckout()` reads `cartWorkspaceService.getState()` for the live cart exactly like `checkoutPreparationService.prepareCheckout()` and `shopifyStorefrontCartService.previewCart()` already do.
- **Commerce Foundation**: Not called directly — commerce availability is already reflected in the blockers/warnings and Storefront cart preview this foundation consumes.
- **`/cart` Checkout Readiness panel**: `useShopifyCheckoutPreview()` is surfaced in `CheckoutReadinessPanel` (`src/components/cart/CheckoutReadinessPanel.jsx`) via a `checkoutUrlPreview` prop passed from `/cart` (`src/pages/CartWorkspace.jsx`). This is purely additive, read-only UI — it renders the checkout URL preview, preview status, adapter mode, blockers, warnings, and an explicit "Checkout redirect disabled" message — and never changes any checkout blocker, warning, or payload-preview line owned by `checkoutPreparationService`, nor the Storefront cart preview owned by `shopifyStorefrontCartService`. Because the default adapter is `unavailableShopifyCheckoutPreviewAdapter`, the panel shows an `adapter-unavailable` status and "Not available" checkout URL preview by default, and no runtime behavior changes.

## Future live implementation plan

A future issue can introduce a real checkout URL by:

1. Replacing `createLiveShopifyCheckoutPreviewAdapter`'s `execute()` body with logic that reads a real Shopify cart's `checkoutUrl` once `liveShopifyStorefrontCartAdapter` (Shopify Storefront Cart Adapter Foundation) is connected to a real Storefront cart mutation.
2. Deciding, in a dedicated issue, whether/how to expose an actual checkout redirect — this foundation intentionally stops short of that integration, and `checkoutRedirectDisabled` remains `true` until that issue explicitly changes it.
3. Connecting payments, orders, shipping, taxes, and customer authentication only after they are each approved in their own dedicated issues.

## Explicit non-goals

This foundation does not implement: a real Shopify checkout URL, checkout redirect, GraphQL execution, payments, orders, customer login, shipping, taxes, or authentication changes. It does not change any existing Cart Workspace, Checkout Preparation, Shopify Storefront Cart Adapter, Commerce, pricing, configurator, or catalog runtime behavior. `mockShopifyCheckoutPreviewAdapter`'s deterministic response is not a substitute for a real Shopify checkout URL and must not be treated as one.

## Shopify Storefront Live Configuration Readiness

The Shopify Storefront Live Configuration Readiness foundation (see [SHOPIFY_STOREFRONT_LIVE_CONFIG_READINESS.md](./SHOPIFY_STOREFRONT_LIVE_CONFIG_READINESS.md)) is a read-only, additive consumer of the Shopify Storefront API Foundation's capabilities — it does not read or change anything owned by this foundation's `shopifyCheckoutPreviewService`, and its `liveAdapterReady`/config-status rows are rendered in the `/cart` Checkout Readiness panel alongside, not in place of, this foundation's checkout URL preview.
