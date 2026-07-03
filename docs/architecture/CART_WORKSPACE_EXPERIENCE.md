# Cart Workspace Experience

## Purpose

The Cart Workspace Experience is the customer-facing shopping workspace at `/cart` that bridges product browsing, configurators, package building, and quote requests toward a future Shopify checkout. Unlike the architecture-only Commerce, Package Builder, and Quote Builder foundations it builds on, this is a working feature: it renders a real cart, supports quantity/removal/clear actions, and ships a reusable Mini Cart for the site header — all backed by a deterministic in-memory adapter so the route works out of the box.

It does **not** implement checkout, payments, taxes, shipping calculation, customer accounts, authentication, live inventory, or order creation, and it never calls a live Shopify API.

## Architecture

```text
CartWorkspace page (/cart) ──┐
                              ├─ useCartWorkspace() / useMiniCart() ─ cartWorkspaceService ─ CartWorkspaceAdapter ─ future persistence provider
MiniCart (site header) ──────┘                                              │
                                                                    commerceService.prepareCartLine()
                                                                              │
                                                                   existing Commerce Foundation
                                                                    (CommerceAdapter, VariantMapping, CartLineDraft)
```

- `src/types/cartWorkspace.ts` owns `CartLineItem`, `CartLineInput`, `CartSummary`, `CartValidationIssue`/`CartValidationResult`, `CartState`, and the checkout preparation contracts (`CartCheckoutLinePayload`, `CartCheckoutPreparationResult`). It reuses `Money`/`ImageAsset`/`Metadata` from `src/types/common.ts` and `CommerceAvailabilityState`/`CartLineDraft` from `src/types/commerce.ts` instead of redefining either.
- `src/schemas/cartWorkspace.schema.ts` provides runtime Zod validation for every public contract, composing `moneySchema`, `imageAssetSchema`, `metadataSchema`, `commerceAvailabilityStateSchema`, and `cartLineDraftSchema` rather than duplicating their shapes.
- `src/adapters/cartWorkspace/` owns the adapter boundary:
  - `CartWorkspaceAdapter` — the interface (`getLines`, `addLine`, `updateQuantity`, `removeLine`, `clearCart`) any future persistence provider (database, session storage, Shopify cart) must implement.
  - `mockCartWorkspaceAdapter` — a deterministic, process-local, in-memory implementation seeded from `cartWorkspaceFixtureLines` (three fixture lines: an available configured product, an unconfigured product, and a backordered package). This is the default adapter behind `cartWorkspaceService`, following the same "mock adapter wired in by default so the route works out of the box" pattern used by `mockCustomerWorkspaceAdapter` and `inMemoryQuoteBuilderAdapter`.
  - `unavailableCartWorkspaceAdapter` — returns an empty cart from every method, for callers that want to explicitly opt out of the mock fixtures.
- `src/services/cartWorkspace/cartWorkspaceService.ts` owns:
  1. **State retrieval and mutation** — `getState()`, `addLine()`, `updateQuantity()`, `removeLine()`, `clearCart()` all delegate to the injected adapter and re-derive `CartState` (lines + summary) afterward.
  2. **Totals** — the exported pure function `buildCartSummary(lines)` reuses the existing Live Pricing Engine money helpers (`money`/`multiplyMoney`/`addMoney` from `@/domain/pricing`, see `PRICING_DOMAIN.md`) instead of re-implementing currency arithmetic. `estimatedShipping` and `estimatedTax` are always `null` placeholders — no shipping or tax calculation exists in this issue.
  3. **Validation** — the exported pure function `validateCartLines(lines)` flags invalid quantities and unavailable lines as blocking errors, and backorder/incomplete-configuration lines as non-blocking warnings.
  4. **Checkout preparation** — `prepareCheckout()` composes the existing `commerceService.prepareCartLine(sku, quantity)` (Commerce Foundation, see `COMMERCE_FOUNDATION.md`) for every line to build a `CartCheckoutPreparationResult`. It performs no pricing, inventory, or Shopify logic of its own — every line's readiness comes directly from `commerceService`, whose default adapter remains unavailable, so `prepareCheckout()` reports `'incomplete'` until a real commerce adapter is connected in a dedicated issue.
  5. **Change notification** — a small subscribe/notify pub-sub (`subscribe(listener)`) so every consumer of the shared in-memory cart (the Cart Workspace page and the Mini Cart) re-syncs when any of them mutates a line.
- `src/hooks/cartWorkspace/` owns `useCartWorkspace()` (full cart state + mutation actions + `prepareCheckout()`, for `/cart`) and `useMiniCart()` (summary-only, for the header). Both are the only layer allowed to call `cartWorkspaceService` from React, and both subscribe to the service's pub-sub so the two views never drift out of sync.
- `src/pages/CartWorkspace.jsx` renders `/cart`: line items (image, name, SKU, quantity, unit price, line total, availability, configuration status, package indicator), the Cart Summary, and customer actions.
- `src/components/cart/CartLineRow.jsx` and `src/components/cart/CartSummary.jsx` are presentational — they render `CartLineItem`/`CartSummary` contracts and call back into the page's handlers; they perform no calculations.
- `src/components/cart/MiniCart.jsx` is the reusable header component (item count badge + quick subtotal + "View Cart" navigation to `/cart`), wired into `src/components/navigator/SiteHeader.jsx` next to the existing "Where to Buy" action so it is available across every page that renders the site header.

## Customer Actions

`/cart` supports: update quantity, remove item, clear cart, continue shopping (link back to `/search`), configure item (placeholder notice — routes to the existing per-product configurator in a future issue), request quote (placeholder notice — hands off to the Quote Builder foundation in a future issue), and proceed to checkout (placeholder only; calls `prepareCheckout()` to show whether every line is commerce-ready, but submits nothing and calls no Shopify API).

## Non-goals

This issue does not implement Shopify checkout, payments, tax calculation, shipping calculation, customer accounts, authentication, live inventory, or order creation. `prepareCheckout()` surfaces Commerce Foundation readiness only — it does not create a Shopify cart, checkout session, or order.

## Future Migration Plan

1. Replace `mockCartWorkspaceAdapter` with a real persistence provider (session storage, database, or Shopify cart) behind `CartWorkspaceAdapter` — no service, hook, or page change required.
2. Connect a real `CommerceAdapter` (see `COMMERCE_FOUNDATION.md`) so `prepareCheckout()` resolves `'ready'` lines against live Shopify variant mappings instead of the unavailable default.
3. Wire "Configure" to the existing per-product Configurator Service route, and "Request Quote" to the existing Quote Builder / Quote Pipeline foundation, once their customer-facing entry points are approved.
4. Add real shipping and tax calculation behind dedicated services and replace the `estimatedShipping`/`estimatedTax` placeholders — do not add shipping or tax arithmetic to `cartWorkspaceService`.

## Rollback

Because this work is additive, rollback is a code revert of the Cart Workspace type, schema, adapter, service, hook, component, page, route, test, and documentation additions. Existing commerce, package builder, quote builder, configurator, and catalog paths remain unchanged.
