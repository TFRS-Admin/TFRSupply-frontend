# Pricing Domain

## Purpose

The Pricing Domain establishes architecture-only contracts for MSRP, dealer cost, contract pricing, margin analysis, bundles, promotional pricing, and quote pricing results. It does not load pricing data, wire pricing into React, change Shopify commerce behavior, or alter existing product JSON.

## Pricing vs. Commerce

Pricing answers what a product, SKU, quote line, or bundle should cost for a specific business context. Commerce answers how a purchasable item maps to Shopify products, variants, inventory, carts, and checkout.

- Pricing owns MSRP/list price, dealer cost, contract price, quantity breaks, margin concepts, and quote pricing outputs.
- Commerce owns Shopify product IDs, Shopify variant IDs, storefront availability, inventory status, cart lines, and checkout readiness.
- Future Shopify storefront pricing can become a `PriceSource`, but Shopify commerce identifiers should remain in the commerce domain.

## Pricing Source Hierarchy

Pricing source priority is modeled through `PriceSource.priority` so future resolution logic can choose the best available price without hardcoding policy into UI components.

A future source hierarchy is expected to evaluate pricing in this order:

1. Active dealer or agency contract pricing.
2. Active promotional bundle pricing.
3. Dealer cost and configured margin policy.
4. Federal Signal MSRP/list price.
5. Future Shopify storefront price as a fallback or display source.

This PR defines the source metadata only. It does not implement price resolution.

## MSRP, Dealer Cost, and Selling Price

- `ListPrice` represents MSRP or published list price, including Federal Signal MSRP.
- `DealerCost` represents internal dealer acquisition cost or agency-specific cost basis.
- `ContractPrice.sellingPrice` represents the contract selling price available under a dealer or agency contract.
- `QuotePricingLine.sellingPrice` represents a future quote-specific resolved selling price.

Keeping these concepts separate prevents storefront, quote, and margin calculations from mixing published list price with cost basis or negotiated selling price.

## Margin Concepts

`Margin` models revenue, cost, gross profit, and gross margin percent. The type is designed for future pure calculations but no margin service or policy engine is implemented in this PR.

Future margin work should calculate margin from resolved selling price and dealer cost, preserve currency consistency, and emit pricing warnings when cost, source, or selling price is missing.

## Contract Window Concepts

`ContractWindow` models the active dates for dealer and agency contracts. It supports future contract expiration alerts through `expirationAlertDays` and can be attached to `DealerContract` or `PromotionalBundle`.

This PR does not evaluate whether a contract is active, expired, or approaching expiration.

## Bundle Pricing Concepts

`BundlePricing` models a priced group of SKUs or products, including optional list price, selling price, dealer cost, and margin. `PromotionalBundle` extends that shape with promotion code, contract window, and warnings for future promotional programs.

Bundle pricing is intentionally separate from package-builder contents so future pricing can calculate bundle economics without changing package composition behavior.

## Quote Builder Connection

`QuotePricingResult` is the future handoff from pricing resolution into Quote Builder. It can contain line-level pricing, subtotal, margin summary, and warnings that the quote workflow can review before submission.

No Quote Builder integration is included in this PR. Future work should connect pricing results to quote payloads through explicit, tested migration issues.

## Intentionally Not Implemented

This architecture foundation intentionally does not include:

- Pricing data imports.
- Dealer pricing JSON.
- Contract data transcription.
- Shopify storefront API pricing reads.
- UI wiring or price display changes.
- Configurator pricing behavior.
- Product JSON changes.
- Margin calculation implementation.
- Contract expiration alert jobs.
- Quote Builder integration.

## File Ownership

- `src/types/pricing.ts` owns the pricing domain interfaces.
- `src/schemas/pricing.schema.ts` owns Zod validation for pricing interfaces.
- `src/services/pricing/pricingTypes.ts` exposes type-only service imports for future pure pricing helpers.
