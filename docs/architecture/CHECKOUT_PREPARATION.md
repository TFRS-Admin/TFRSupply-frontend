# Checkout Preparation Layer

## Purpose

The Checkout Preparation Layer prepares the customer's cart for a future Shopify Checkout. It is not checkout: it makes no live Shopify API calls, performs no redirect, and creates no payment, order, tax, or shipping record. It answers one question — "is this cart ready to hand off to Shopify?" — by composing the existing Cart Workspace, Commerce Foundation, Package Builder, and Pricing contracts, and it renders that answer as the Checkout Readiness panel on `/cart`.

## Ownership

- `src/types/checkoutPreparation.ts` owns `CheckoutPreparationRequest`, `CheckoutPreparationResult`, `CheckoutLineValidation`, `CheckoutWarning`, `CheckoutBlocker`, `CheckoutPayloadPreview`, and `CheckoutPayloadPreviewLine`. It reuses `CartLineItem`/`CartValidationResult` from `src/types/cartWorkspace.ts` and `VariantMapping` from `src/types/commerce.ts` instead of redefining either.
- `src/schemas/checkoutPreparation.schema.ts` provides runtime Zod validation for every public contract, composing `cartLineItemSchema`, `cartValidationResultSchema`, `variantMappingSchema`, and `moneySchema` rather than duplicating their shapes.
- `src/adapters/checkoutPreparation/` owns the adapter boundary:
  - `CheckoutPreparationAdapter` — the interface (`buildPayloadPreview`) any future provider must implement. It is deliberately narrow: every readiness decision (cart/configuration/package/pricing/commerce) is owned by `checkoutPreparationService`, so the adapter's only job is translating already-ready lines into the payload preview shape — the same request/response-translation role every adapter in this repository plays.
  - `mockCheckoutPreparationAdapter` — the default, deterministic implementation. It performs no I/O and calls no Shopify API; it totals the variant-mapped lines using the existing Live Pricing Engine money helpers (`money`/`multiplyMoney`/`addMoney` from `@/domain/pricing`, see `PRICING_DOMAIN.md`). This is the default adapter behind `checkoutPreparationService`, following the same "mock adapter wired in by default so the route works out of the box" pattern used by `mockCartWorkspaceAdapter`.
  - `unavailableCheckoutPreparationAdapter` — returns an empty payload preview (zero lines, zero total), for callers that want to explicitly opt out of the mock total.
- `src/services/checkoutPreparation/checkoutPreparationService.ts` owns:
  1. **Cart validation** — delegates to the existing `cartWorkspaceService.validateCart(lines)` (Cart Workspace Experience, see `CART_WORKSPACE_EXPERIENCE.md`) and re-tags its issues as `category: 'cart'` blockers/warnings. No cart validation rule is reimplemented.
  2. **Configuration validation** — reads `CartLineItem.configurationStatus` (already populated by the Cart Workspace / Configurator Experience). `'incomplete'` is a blocker, `'unknown'` is a warning.
  3. **Package validation** — reads `CartLineItem.isPackage`/`packageId` (already populated by the Package Builder-backed cart lines). A package line missing its `packageId` is a blocker.
  4. **Pricing validation** — reads `CartLineItem.unitPrice`. A missing or non-positive price is a blocker. No pricing calculation is reimplemented; the cart line's price already came from the Pricing Engine.
  5. **Commerce validation** — composes the existing `commerceService.prepareCartLine(sku, quantity)` (Commerce Foundation, see `COMMERCE_FOUNDATION.md`) per line, exactly as `cartWorkspaceService.prepareCheckout()` already does. A line is commerce-available only when the result status is `'ready'` and a `CartLineDraft` is returned.
  6. **Payload preview generation** — when every line clears every check, builds `CheckoutPayloadPreview` from each line's resolved `CartLineDraft.variantMapping` via `CheckoutPreparationAdapter.buildPayloadPreview()`.
  7. **Blocker/warning aggregation** — flattens every line's blockers/warnings into the top-level `CheckoutPreparationResult.blockers`/`.warnings`, and reports `status: 'blocked'` if any blocker exists (including an empty cart), otherwise `'ready'`.
- `src/hooks/checkoutPreparation/useCheckoutPreparation.ts` owns the React-facing entry point for `/cart`. It owns loading/error state only — every readiness decision lives in `checkoutPreparationService` — and subscribes to the same `cartWorkspaceService` pub/sub the Cart Workspace uses, so the readiness panel re-evaluates whenever a line is added, updated, or removed.
- `src/components/cart/CheckoutReadinessPanel.jsx` is presentational — it renders `CheckoutPreparationResult` contracts (cart/configuration/package/pricing/commerce indicators, overall readiness, blockers, warnings, and — only when ready — the payload preview) and performs no calculation of its own.
- `src/pages/CartWorkspace.jsx` renders the panel on `/cart` alongside the existing `CartSummary`.

## Dependency Direction

```text
CheckoutReadinessPanel (on /cart) ── useCheckoutPreparation() ── checkoutPreparationService
                                                                          │
                                                    ┌─────────────────────┼─────────────────────┐
                                                    │                     │                     │
                                        cartWorkspaceService     commerceService      CheckoutPreparationAdapter
                                     (cart validation + lines)  (Commerce Foundation)  (payload preview totals)
                                                    │                     │
                                          checkout schemas/types  commerce schemas/types
```

`checkoutPreparationService` never imports Shopify SDKs, browser routing, or payment logic. It only calls `cartWorkspaceService`, `commerceService`, and its own adapter.

## Supported Contracts

- `CheckoutPreparationRequest` — an optional explicit `lines: CartLineItem[]` override; when omitted, `checkoutPreparationService` reads the live Cart Workspace state.
- `CheckoutPreparationResult` — `status` (`'ready' | 'blocked'`), the reused `cartValidation` (`CartValidationResult`), per-line `lineValidations` (`CheckoutLineValidation[]`), flattened `blockers`/`warnings`, and `payloadPreview` (`null` unless `status === 'ready'`).
- `CheckoutLineValidation` — per-line `cartValid`/`configurationValid`/`packageValid`/`pricingAvailable`/`commerceAvailable` booleans, a `readiness` (`'ready' | 'warning' | 'blocked'`), and that line's `blockers`/`warnings`.
- `CheckoutWarning`/`CheckoutBlocker` — `code`, `category` (`'cart' | 'configuration' | 'package' | 'pricing' | 'commerce'`), `message`, and optional `lineId`.
- `CheckoutPayloadPreview`/`CheckoutPayloadPreviewLine` — the future Shopify checkout payload shape (`sku`, `quantity`, `variantMapping`) and an `estimatedTotal`, for display only.

## UI

`/cart` renders a Checkout Readiness panel beneath the Cart Summary showing pass/fail indicators for cart, configuration, package, pricing, and commerce validation, plus overall readiness. When not ready, it lists every blocker (and any warnings, such as backorder lines, which do not block). When ready, it shows a read-only preview of the checkout payload — SKU, quantity, resolved Shopify variant reference, and estimated total — with an explicit note that no Shopify checkout session has been created and no redirect occurs.

## Integration with the Shopify Storefront Cart Adapter Foundation

`/cart`'s Checkout Readiness panel also renders an optional, read-only Storefront cart preview from `useShopifyStorefrontCartPreview()` (Shopify Storefront Cart Adapter Foundation, see [SHOPIFY_STOREFRONT_CART_ADAPTER.md](./SHOPIFY_STOREFRONT_CART_ADAPTER.md)) via a `storefrontCartPreview` prop. This is purely additive display — Storefront cart status, cart line count, a checkout URL preview placeholder, mutation preview metadata, and adapter mode — and never changes `checkoutPreparationService`'s readiness decision, blockers, warnings, or payload preview.

## Non-goals

This layer does not implement Shopify checkout, a Shopify cart/draft-order API call, payments, order creation, tax calculation, shipping calculation, or customer authentication. It does not resolve pricing, evaluate package compatibility, or look up commerce availability itself — those decisions come from the existing Pricing Engine, Package Builder, and Commerce Foundation via the `CartLineItem`/`commerceService` contracts they already populate. Because `commerceService`'s default adapter remains the unavailable adapter described in `COMMERCE_FOUNDATION.md`, `checkoutPreparationService.prepareCheckout()` reports `status: 'blocked'` (commerce unavailable) for every real cart line until a real `CommerceAdapter` is connected in a dedicated issue.

## Future Migration Plan

1. Connect a real `CommerceAdapter` (see `COMMERCE_FOUNDATION.md`) so commerce validation resolves `'ready'` against live Shopify variant mappings instead of the unavailable default.
2. Replace `mockCheckoutPreparationAdapter`'s deterministic total with a real payload-preview provider (for example, a live Shopify draft-checkout price quote) behind `CheckoutPreparationAdapter` — no service, hook, or page change required.
3. Wire the payload preview into an actual Shopify Checkout redirect once checkout, payments, and order creation are approved in a dedicated issue.

## Rollback

Because this work is additive, rollback is a code revert of the Checkout Preparation type, schema, adapter, service, hook, component, test, and documentation additions. Existing Cart Workspace, Commerce Foundation, Package Builder, Pricing, and Quote Builder paths remain unchanged.
