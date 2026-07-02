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

## Issue 25 Dealer Contract Resolution Engine

The dealer contract resolution engine determines which dealer contract price, quantity break, promotional bundle, and contract window apply to a pricing request built from imported dealer contract, MSRP, dealer cost, and bundle data. It selects between already-resolved pricing records; it does not calculate a final selling price, does not implement margin arithmetic, and is not wired into Quote Builder, commerce, or any UI route.

### Ownership

- `src/types/dealerContractResolution.ts` owns the resolution request, contract selection, quantity break selection, promotional bundle resolution, contract window evaluation, and result contracts.
- `src/schemas/dealerContractResolution.schema.ts` owns Zod validation for resolution requests and results.
- `src/domain/dealerContractResolution/contractWindowEvaluator.ts` owns pure `ContractWindow` active/upcoming/expiring-soon/expired evaluation.
- `src/domain/dealerContractResolution/contractSelector.ts` owns dealer contract and contract-price selection, prioritized by `PriceSource.priority` among contracts whose window is currently eligible.
- `src/domain/dealerContractResolution/quantityBreakSelector.ts` owns selection of the highest eligible `QuantityBreak` for a requested quantity.
- `src/domain/dealerContractResolution/promotionalBundleResolver.ts` owns promotional bundle eligibility by SKU membership, promotion code, and contract window.
- `src/services/dealerContractResolution/dealerContractResolutionService.ts` owns request validation, orchestration of the selectors above, warning aggregation, and result validation.
- `src/hooks/dealerContractResolution/useDealerContractResolution.ts` owns a typed React-facing hook for future migration work.

### Runtime Boundary

```text
React resolution hook → dealerContractResolutionService → contract selector / quantity break selector / bundle resolver
                                     ↓                                    ↓
                     dealer contract resolution schemas          contract window evaluator
                                     ↓
                          pricing domain schemas/types
```

The service accepts already-imported or already-resolved `DealerContract` and `PromotionalBundle` candidates on the request (for example, records produced by the pricing import pipeline) and selects among them. It does not fetch candidates itself and has no adapter boundary, because resolution is a pure, deterministic selection over supplied pricing data.

### Supported Resolution Concepts

- MSRP and dealer cost references remain untouched pass-through fields on the selected `ContractPrice` (`listPrice`, `dealerCost`); this engine does not recompute them.
- Contract pricing references are resolved through `selectDealerContract`, which matches a `DealerContract` to the requested dealer/agency/contract context, requires an eligible `ContractWindow`, and prefers the highest `PriceSource.priority` when multiple contracts qualify.
- Effective date windows are evaluated through `evaluateContractWindow`, which classifies a window as `active`, `upcoming`, `expired`, or `expiring-soon` (using `expirationAlertDays`) as of the request's `pricingDate`.
- Quantity break eligibility is resolved through `selectQuantityBreak`, which returns every eligible break plus the single highest-`minQuantity` break that applies to the requested quantity.
- Bundle eligibility is resolved through `resolvePromotionalBundle`, which requires the bundle to include the requested SKU, matches any required `promotionCode` against the request's `context.promotionCodes`, and requires an eligible bundle window when one is present.
- `DealerContractResolutionResult.warnings` surfaces review-required and warning-level `PricingWarning`s for missing contract matches and contracts nearing expiration; it does not compute margin or final selling price.

### Non-goals

This engine intentionally does not implement final pricing arithmetic, selling-price or margin calculation, live contract/bundle data fetching, an adapter boundary, Quote Builder integration, commerce integration, or UI wiring. Future issues should connect this engine's result to a pricing calculation step and to Quote Builder through explicit, tested migration work.

## Issue 28 Admin Pricing Import Dashboard

The admin pricing import dashboard is the first UI surface built on top of the pricing import pipeline (Issue 24). It renders Upload Status, Import History, Import Validation Results, Import Summary, Failed Records, Duplicate Detection, and Import Statistics for a set of mock import runs. It does not implement file storage, database persistence, live Excel/CSV parsing, authentication, dealer pricing calculations, or quote generation.

### Ownership

- `src/types/pricingImportDashboard.ts` owns dashboard-facing aggregate contracts (`PricingImportRun`, `PricingImportHistoryEntry`, `PricingImportDuplicateRecordGroup`, `PricingImportDashboardSummary`, `PricingImportDashboardStatistics`, `PricingImportDashboardData`).
- `src/schemas/pricingImportDashboard.schema.ts` owns Zod validation for those aggregate contracts, composing `pricingImport.schema.ts` schemas rather than redefining pipeline shapes.
- `src/domain/pricingImportDashboard/duplicateDetector.ts` owns the pure `detectDuplicateRecords` function that groups normalized records sharing a record kind and SKU across one or more import runs.
- `src/adapters/pricingImportDashboard/mockPricingImportAdapters.ts` owns mock `PricingImportParser`/`PricingImportNormalizer` pairs and inline fixture rows for Excel workbook, CSV file, Federal Signal MSRP price book, dealer contract, and promotional bundle definition sources, plus one intentionally-throwing parser used to exercise the dashboard's failed-run path. No file I/O, network access, or storage occurs in these adapters.
- `src/services/pricingImportDashboard/pricingImportDashboardService.ts` owns `loadDashboard()`, which runs each mock definition through the existing `pricingImportService.importPricing()`, catches per-run parser/normalizer failures without throwing, and aggregates results into upload status, history, issues, duplicates, summary, and statistics.
- `src/hooks/pricingImportDashboard/usePricingImportDashboard.ts` owns the typed React-facing hook (`{ data, loading, error, loadDashboard }`); it does not call `loadDashboard` during render.
- `src/pages/AdminPricingImportDashboard.jsx` owns the admin route at `/admin/pricing-imports`, gated by the existing `checkAdminAccess` prototype guard, matching the layout conventions of `src/pages/AdminQuotesPage.jsx`.

### Runtime Boundary

```text
AdminPricingImportDashboard page → usePricingImportDashboard hook → pricingImportDashboardService
                                                                              ↓
                                                    pricingImportService.importPricing() (existing, unchanged)
                                                                              ↓
                                          mock parsers/normalizers → pricing import Zod schemas
                                                                              ↓
                                                    detectDuplicateRecords (pure domain function)
                                                                              ↓
                                              pricingImportDashboardDataSchema (dashboard aggregate)
```

`pricingImportDashboardService` does not modify `pricingImportService`, `defaultPricingImportValidator`, or any pricing import schema — it only orchestrates the existing pipeline against mock adapters and reshapes the results for display.

### Non-goals

This dashboard intentionally does not implement live file uploads, file storage, database persistence, live Excel/CSV parsing libraries, real authentication (it reuses the existing `checkAdminAccess` prototype guard), dealer pricing calculations, or quote generation. Duplicate detection only evaluates records that carry a `sku` field (list-price, dealer-cost, contract-price, bundle-pricing); dealer-contract and quantity-break records are not evaluated for duplication in this issue.

## Issue 29 Live Pricing Engine

The live pricing engine adds the first real pricing implementation over already-supplied typed pricing records. It remains intentionally data-source agnostic: no file uploads, persistence, Shopify calls, UI wiring, checkout behavior, PDF generation, or email behavior are introduced.

### Ownership

- `src/domain/pricing/pricingEngine.ts` owns deterministic pricing arithmetic for MSRP/list lookups, dealer-cost lookups, quantity-break unit price selection, quote-line pricing, bundle totals, quote subtotal, gross profit, and gross margin percent.
- `src/adapters/pricing/livePricingAdapter.ts` owns the typed adapter that prices from in-memory pricing-domain records and reuses `dealerContractResolutionService` for dealer contract, quantity break, and promotional bundle eligibility.
- `src/services/pricing/pricingService.ts` remains the service validation boundary and continues to accept any `PricingAdapter`; the default `pricingService` still uses `unavailablePricingAdapter` so existing runtime behavior remains unchanged until a caller explicitly injects the live adapter.
- `tests/live-pricing-engine.test.mjs` covers list price, dealer cost, contract selling price, quantity break selection, promotional bundle pricing, quote line totals, quote subtotal, gross profit, gross margin percent, and runtime output validation.

### Runtime Boundary

```text
Future caller with typed pricing records → pricingService → live PricingAdapter → dealerContractResolutionService
                                                ↓                     ↓
                                      pricing schemas          pricingEngine pure functions
                                                ↓                     ↓
                                         pricing domain types / imported records
```

### Pricing Rules

- MSRP/list price is selected from supplied `ListPrice` records by SKU/product/variant match and highest `PriceSource.priority`.
- Dealer cost is selected from supplied `DealerCost` records by the same deterministic subject matching and priority rules.
- Contract selling price is selected by the existing dealer contract resolution service from supplied `DealerContract` records.
- Quantity breaks use the selected contract price's breaks and apply the highest eligible `minQuantity` break for the requested quantity.
- Promotional bundles are resolved by the existing promotional bundle resolver; when an eligible bundle supplies aggregate selling price or dealer cost, those values override the calculated bundle aggregate.
- Quote lines multiply the resolved unit selling price by quantity, calculate extended dealer cost, and attach line margin.
- Quote subtotal sums priced line selling prices and quote margin aggregates subtotal revenue against summed extended dealer cost.

### Non-goals

This issue does not connect pricing to React UI, Quote Builder persistence, checkout, Shopify, imports, uploaded files, PDF generation, email sending, authentication, or database storage. Future issues must explicitly provide the typed record source and opt into `createLivePricingAdapter()`.
