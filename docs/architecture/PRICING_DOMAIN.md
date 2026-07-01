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

## Issue 18 Pricing Engine Foundation

The pricing foundation now adds architecture-only service, adapter, engine-contract, hook, and Zod validation boundaries for future pricing work. These additions are intentionally inert until a later issue connects validated pricing data.

### Runtime Boundary

Current dependency direction for future pricing consumers is:

```text
React pricing hooks → pricingService → PricingAdapter → future pricing provider
                                ↓
                 pricing schemas / pricing engine contracts
                                ↓
                         pricing domain types
```

The default adapter is `unavailablePricingAdapter`, which returns pending `PricingResolution` values. This preserves existing runtime behavior and avoids live MSRP, dealer cost, contract, bundle, or quote calculations.

### File Ownership

- `src/types/pricing.ts` owns pricing domain contracts, inputs, result envelopes, warnings, calculation contracts, MSRP, dealer cost, contract windows, quantity breaks, promotional bundles, margin, and quote-pricing handoff types.
- `src/schemas/pricing.schema.ts` owns runtime validation for pricing inputs and outputs.
- `src/adapters/pricing` owns adapter contracts and the unavailable default adapter.
- `src/services/pricing/pricingService.ts` owns pricing use-case validation and adapter orchestration.
- `src/domain/pricing/pricingEngine.ts` owns calculation-contract validation helpers only; it does not implement pricing arithmetic.
- `src/hooks/pricing/usePricing.ts` owns typed React-facing hooks for future migration.

### Supported Foundation Concepts

- MSRP/list price through `ListPrice` and `getListPrice`.
- Dealer cost through `DealerCost` and `getDealerCost`.
- Contract pricing through `ContractPrice`, `DealerContract`, `ContractWindow`, and `getContractPrice`.
- Quantity pricing through `QuantityBreak` and `appliedQuantityBreak` fields.
- Promotional bundles through `BundlePricingInput`, `BundlePricing`, `PromotionalBundle`, and `priceBundle`.
- Quote-pricing handoff through `QuotePricingInput`, `QuotePricingResult`, and `priceQuote`.
- Margin contracts through `Margin`; no margin arithmetic is implemented in this foundation.

### Follow-up Work

Future pricing issues should add pure calculation implementations behind these contracts, fixture-based tests for each pricing rule, real adapter implementations, contract-window active/expired evaluation, margin-policy logic, and explicit UI or quote-builder migrations. Those follow-ups must not bypass service validation or couple pricing directly to commerce, configurator, or product catalog runtime code.

## Issue 24 Pricing Import Pipeline

The pricing import pipeline establishes architecture-only contracts for normalizing manufacturer price lists and dealer contract data before records enter the pricing domain. It does not implement live file uploads, does not read customer files, does not alter pricing calculations, and is not wired into commerce, Quote Builder, or any UI route.

### Ownership

- `src/types/pricingImport.ts` owns import source, parser, normalizer, validation, normalized record, and result contracts.
- `src/schemas/pricingImport.schema.ts` owns Zod validation for normalized import records and import results.
- `src/services/pricingImport/pricingImportService.ts` owns parser → normalizer → validator orchestration.
- `src/services/pricingImport/pricingImportValidator.ts` owns runtime validation of normalized records before any future persistence or pricing-domain handoff.
- `src/hooks/pricingImport/usePricingImport.ts` owns a typed React-facing hook for future integration work without adding visible UI or triggering imports during render.

### Dependency Direction

```text
Future import UI or jobs → pricing import hook/service → parser interface → normalizer interface
                                               ↓
                                    Zod import schemas
                                               ↓
                                    pricing domain schemas/types
```

Parsers and normalizers are injected so future Excel workbook, CSV, dealer contract, MSRP price book, bundle definition, and quantity break table ingestion can be implemented behind stable contracts. The default service only orchestrates injected implementations and validates their normalized records.

### Supported Import Contracts

The pipeline supports normalized records for:

- MSRP/list prices.
- Dealer costs.
- Contract prices.
- Dealer contract envelopes.
- Bundle definitions.
- Quantity break tables.

Each normalized record preserves import provenance through `importId`, source metadata, row number, optional sheet name, and optional source row values. This makes validation issues traceable back to the source document without committing source files or wiring storage.

### Runtime Validation

`defaultPricingImportValidator` uses `pricingNormalizedRecordSchema` to validate normalized records. Invalid records are excluded from `PricingImportResult.records` and returned with structured issues containing code, severity, row, sheet, field path, and SKU when available.

### Non-goals

This pipeline intentionally does not implement live uploads, spreadsheet parsing libraries, CSV parsing, product data mutation, price persistence, pricing calculations, commerce behavior, Quote Builder behavior, or UI rendering. Future implementation issues should add concrete parser adapters and persistence behind these contracts while keeping validation at the boundary.
