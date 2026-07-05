# Quote Builder Foundation

## Purpose

The Quote Builder Foundation defines typed, validated contracts for future quote draft assembly, package handoff, pricing references, commerce readiness, and approval workflow review. It is architecture-only and does not change runtime quote submission, checkout, pricing calculations, Shopify integration, PDF generation, email delivery, routing, styling, or visible UI.

## Ownership

- `src/types/quote.ts` owns quote drafts, quote line assembly inputs, package references, pricing references, customer metadata, workflow state, approval status, and review flag contracts.
- `src/schemas/quote.schema.ts` owns Zod validation for quote assembly and validation boundaries.
- `src/adapters/quoteBuilder` owns the adapter boundary for future quote storage, assembly, validation, and workflow providers.
- `src/services/quoteBuilder` owns quote-builder orchestration and validates assembly inputs before adapter calls.
- `src/hooks/quoteBuilder` owns typed React-facing hooks for future UI migration.

## Dependency Direction

```text
React quote hooks → quoteBuilderService → QuoteBuilderAdapter → future quote workflow provider
                                  ↓
                         quote schemas / quote types
                                  ↓
              package, pricing, commerce, vehicle references by contract only
```

The default adapter is intentionally unavailable. It returns null draft lookups and review-flagged unavailable validation or assembly results so no existing runtime path starts creating quotes by accident.

## Supported Contracts

The foundation supports typed representation of:

- Quote drafts with customer metadata, vertical context, optional vehicle context, line items, package references, pricing references, workflow state, and review flags.
- Quote line assembly inputs for products, accessories, services, kits, packages, and custom lines.
- Package references that can carry package IDs, revisions, definitions, and package assembly results without re-implementing package assembly.
- Pricing references that can carry pricing request/result identifiers and future quote-pricing results without calculating prices.
- Customer metadata for agency, contact, account, billing reference, source, tags, and attributes.
- Approval status and workflow status for draft, review, approval, rejection, submission, cancellation, expiration, and change-request states.
- Review flags with severity, source, field path, and line-specific targeting.

## Non-goals

This foundation does not implement pricing calculations, checkout, Shopify integration, email sending, PDF generation, routing, styling, UI, quote persistence, approval automation, or commerce mutations. Future issues must connect provider implementations behind `QuoteBuilderAdapter` and keep pricing, package, and commerce logic in their owning bounded contexts.

## Future Migration Plan

1. Add quote-builder fixture tests around draft assembly, validation failure paths, package references, pricing references, and approval status transitions.
2. Replace `unavailableQuoteBuilderAdapter` with a provider adapter only after quote persistence and workflow requirements are approved.
3. Migrate future Quote Builder UI through `src/hooks/quoteBuilder` rather than direct service or adapter imports.
4. Connect pricing results through `QuotePricingReference` in a dedicated pricing issue without adding pricing arithmetic to Quote Builder.
5. Connect checkout or Shopify readiness through commerce-owned contracts in a dedicated commerce issue.

## Rollback

Because this work is additive and unwired, rollback is a code revert of the quote-builder type, schema, adapter, service, hook, and documentation additions. Existing configurator, quote request, admin quote, pricing, commerce, checkout, and package builder paths remain unchanged.

## Issue 23 Quote Pipeline Orchestration

The Quote Pipeline adds an additive `QuotePipelineService` boundary that composes the existing catalog, configurator, package builder, pricing, commerce, vehicle fitment, and quote builder services without wiring any React route, component, checkout flow, email delivery, PDF generation, or Shopify API call.

### Ownership

- `src/types/quote.ts` owns the typed quote pipeline input, line, package, commerce-reference, and result contracts.
- `src/schemas/quote.schema.ts` owns Zod validation for pipeline inputs, composed commerce references, and pipeline results.
- `src/services/quotePipeline/quotePipelineService.ts` owns orchestration only: it validates input, checks vehicle fitment before package assembly, delegates package assembly, delegates pricing resolution, gathers commerce/catalog/configurator references, and hands the composed draft input to Quote Builder.

### Dependency Direction

```text
future React quote hooks → quotePipelineService
                         ├─ catalogService
                         ├─ configuratorService
                         ├─ vehicleFitmentService
                         ├─ packageBuilderService
                         ├─ pricingService
                         ├─ commerceService
                         └─ quoteBuilderService
                                  ↓
                         quote pipeline schemas / quote types
```

The pipeline is intentionally service composition only. It does not calculate prices, duplicate fitment rules, build package business logic, persist drafts directly, mutate commerce state, call Shopify APIs, perform checkout, send email, generate PDFs, change routing, or change visible UI.

### Runtime Boundary

The exported default pipeline uses the existing unavailable or typed-foundation adapters beneath each domain service. As a result, existing runtime behavior remains unchanged until a later issue explicitly migrates UI or API consumers to this service and replaces unavailable adapters with approved providers.

## Issue 26 Quote PDF Generation

Quote PDF generation is architected in [QUOTE_PDF_GENERATION.md](./QUOTE_PDF_GENERATION.md) as an additive, unwired boundary that consumes `QuoteDraft` by contract only. It does not add PDF generation, email delivery, or persistence to this foundation.

## Issue 31 Live Quote Builder Orchestration

The Live Quote Builder adds `src/services/liveQuoteBuilder/liveQuoteBuilderService.ts` as an additive orchestration boundary for producing a fully priced quote object from a validated quote request. The service composes the existing quote pipeline, quote builder, pricing, package builder, vehicle fitment, commerce, dealer contract resolution, and quote PDF foundations through their existing service contracts rather than duplicating domain rules or pricing calculations.

### Ownership

- `src/types/quote.ts` owns `LiveQuoteBuilderRequest` and `LiveQuoteBuilderResult`, including the materialized quote, draft, pipeline references, pricing result, commerce references, review flags, and PDF-readiness signal.
- `src/schemas/quote.schema.ts` owns runtime validation for live quote requests and results by composing the existing quote pipeline, quote, pricing, package, commerce, and review-flag schemas.
- `src/services/liveQuoteBuilder/liveQuoteBuilderService.ts` owns orchestration only: it validates the request, invokes Quote Builder validation, delegates package/fitment/pricing/commerce orchestration to Quote Pipeline, maps resolved pricing onto quote lines, keeps review flags attached, and validates PDF handoff readiness without rendering a PDF.
- `tests/live-quote-builder.test.mjs` covers successful materialization, dependency failure flags, and runtime validation failure paths.

### Runtime Boundary

The default export remains unwired to routes, React components, checkout, Shopify calls, persistence, and PDF rendering. Existing runtime behavior is unchanged until a future issue explicitly connects a UI or API surface to `liveQuoteBuilderService` and provides approved adapters behind the composed services.

### Non-goals

This orchestration does not persist quotes, render PDFs, submit checkout, call Shopify, add routes, add UI, send email, or recalculate pricing outside the pricing service and dealer-contract resolution engine.

## Issue 32 Quote Persistence and Versioning Boundary

Quote persistence is now represented by an additive repository/service boundary that can save, load, update, and inspect history for generated `Quote` objects without changing any live UI, checkout, Shopify, PDF, email, or routing behavior.

### Ownership

- `src/types/quote.ts` owns quote revision metadata, persistence records, history snapshots, optimistic-version update inputs, and save/load/update/history result contracts.
- `src/schemas/quote.schema.ts` owns runtime validation for quote persistence inputs and results by composing the existing `quoteSchema` instead of duplicating quote generation or materialization rules.
- `src/adapters/quotePersistence/quoteRepository.ts` owns the repository abstraction and the in-memory adapter used for deterministic tests and future service wiring.
- `src/services/quotePersistence/quotePersistenceService.ts` owns orchestration only: it validates inputs, assigns revision metadata, increments versions on successful updates, and surfaces conflict/not-found states from the repository.
- `tests/quote-persistence-versioning.test.mjs` covers save, load, update, optimistic conflict behavior, and history snapshots.

### Dependency Direction

```text
future React quote hooks → quotePersistenceService → QuoteRepository → future database/provider adapter
                                      ↓
                           quote persistence schemas / quote types
                                      ↓
                             existing Quote domain contract
```

The in-memory adapter is intentionally local and deterministic. It is not database persistence and is not wired into runtime quote generation. Future database work should implement `QuoteRepository` behind the same service contract rather than changing quote generation services.

### Versioning Semantics

- `saveQuote` creates version `1` and stores an initial history snapshot.
- `updateQuote` requires an `expectedVersion`; matching versions produce a new record with `version = expectedVersion + 1`.
- Mismatched versions return a `conflict` result with the current record and current version, leaving the stored quote unchanged.
- `getQuoteHistory` returns ordered immutable snapshots for each saved revision.

### Non-goals

This boundary does not implement database persistence, authentication, UI, routing, PDF rendering, email sending, checkout, Shopify calls, or quote generation. It persists already-materialized `Quote` objects by contract only and reuses the existing quote schemas and domain types.

## Issue 34 Email Notification Service

Quote workflow email notifications are represented by an additive, architecture-only service boundary in [EMAIL_NOTIFICATION_SERVICE.md](./EMAIL_NOTIFICATION_SERVICE.md). The service maps existing quote approval actions to validated notification requests and template contracts while defaulting to dry-run or unavailable provider responses so no real email is sent.

This issue does not wire notifications into UI, authentication, SMTP, SendGrid, Mailgun, SES, or quote approval runtime state transitions. Future delivery providers must implement the `EmailProviderAdapter` boundary without changing quote approval or persistence contracts.

## Issue 46 Quote Builder Pricing Integration

This is the first business-facing surface built on top of the Quote Builder and Live Pricing Engine foundations. It composes the existing `liveQuoteBuilderService` (Issue 31), `quotePipelineService` (Issue 23), `pricingService` + `livePricingAdapter` + `dealerContractResolutionService` (Issues 18, 25, 29) and the existing quote domain contracts into a working pricing experience at `/admin/quote-builder`. It does not add a new pricing engine, does not duplicate pricing arithmetic, and does not implement checkout, Shopify, payments, PDF generation, email delivery, authentication, or database changes.

### Integration Boundary

Quote Builder orchestration owns three responsibilities only: requesting pricing from the existing pricing engine, aggregating quote totals, and exposing pricing summaries. It does not calculate prices, resolve dealer contracts, select quantity breaks, or evaluate promotional bundle eligibility — those remain the Pricing Engine's responsibility (`pricingEngine`, `livePricingAdapter`, `dealerContractResolutionService`).

```text
AdminQuoteBuilderPage → useQuoteBuilderWorkspace → quoteBuilderWorkspaceService
                                                              ↓
                                          liveQuoteBuilderService.generateQuote()
                                          ├─ quotePipelineService.assembleQuote()
                                          │    ├─ pricingService.priceQuote() → livePricingAdapter → dealerContractResolutionService
                                          │    └─ quoteBuilderService.assembleQuote() → QuoteBuilderAdapter
                                          └─ buildPricingSummary() (pure aggregation, no pricing arithmetic)
```

### Ownership

- `src/types/quote.ts` owns `QuotePricingSummary` and `QuotePricingValidationStatus`, the Quote Builder's aggregate pricing output (subtotal, total cost, gross profit, gross margin percent, total quantity, line count, validation status). It also extends `QuoteLine` with `listPrice`, `dealerCost`, `margin`, and `appliedQuantityBreak` so already-computed per-line pricing engine output (from `QuotePricingLine`) can be surfaced without recalculation, and extends `Quote`/`LiveQuoteBuilderResult` with `pricingSummary`.
- `src/schemas/quote.schema.ts` owns `quotePricingSummarySchema` and the extended `quoteLineSchema`/`quoteSchema`/`liveQuoteBuilderResultSchema`, composing the existing `pricing.schema.ts` schemas (`marginSchema`, `quantityBreakSchema`) rather than redefining pricing shapes.
- `src/services/liveQuoteBuilder/liveQuoteBuilderService.ts` gains `buildPricingSummary()`, a pure aggregation function (sum of line quantities, pass-through of the pricing engine's existing `Margin`, and a validation-status derivation from existing review flags and the pricing engine's own `pricing.line.missing-selling-price` warning code). It performs no pricing arithmetic. `applyPricingToLines()` now also copies `listPrice`, `dealerCost`, `margin`, and `appliedQuantityBreak` from each already-priced `QuotePricingLine` onto the materialized `QuoteLine`.
- `src/adapters/pricing/livePricingAdapter.ts` fixes a pre-existing gap where `priceQuote()` resolved promotional bundle eligibility per line (via `dealerContractResolutionService`) but never applied it, unlike `priceBundle()`. `priceQuote()` now applies the resolved bundle's per-unit selling price and dealer cost to a matching line's effective contract price before pricing, reusing the same `money()`/`calculateMargin()` primitives already used elsewhere in the pricing engine. This is a Pricing Engine-owned fix (promotional logic remains the Pricing Engine's responsibility), not new Quote Builder pricing logic.
- `src/adapters/quoteBuilder/inMemoryQuoteBuilderAdapter.ts` is a new deterministic, in-memory `QuoteBuilderAdapter` implementation (assembles a `QuoteDraft` from a validated `QuoteAssemblyInput`, keeps drafts in a process-local `Map`). It does not replace the default `unavailableQuoteBuilderAdapter`; `quoteBuilderService`'s default export is unchanged. Callers that want draft assembly to actually run (like the new workspace service) inject it explicitly via `createQuoteBuilderService(inMemoryQuoteBuilderAdapter)`.
- `src/adapters/quoteBuilderWorkspace/quoteBuilderWorkspaceFixtures.ts` owns deterministic fixture `ListPrice`, `DealerCost`, `DealerContract`, and `PromotionalBundle` records plus named demo quote scenarios (single line, multi-line, quantity break, promotional bundle, mixed contract, invalid pricing). No file uploads, network calls, or persistence occur here.
- `src/services/quoteBuilderWorkspace/quoteBuilderWorkspaceService.ts` composes `createLivePricingAdapter()`, `createInMemoryQuoteBuilderAdapter()`, `createQuotePipelineService()`, and `createLiveQuoteBuilderService()` against the fixture records and runs each demo scenario through `generateQuote()`. This is orchestration only; every calculation still happens inside the composed services.
- `src/hooks/quoteBuilderWorkspace/useQuoteBuilderWorkspace.ts` is the typed React-facing hook (`{ data, loading, error, loadScenarios }`); it does not call `loadScenarios` during render.
- `src/pages/AdminQuoteBuilderPage.jsx` owns the admin route at `/admin/quote-builder`, gated by the existing `checkAdminAccess` prototype guard, matching the layout conventions of `AdminPricingImportDashboard.jsx`. It renders Line MSRP, Dealer Cost, Selling Price, Margin %, Profit $, Quote Totals, and Pricing Status directly from `LiveQuoteBuilderResult` — it performs no pricing calculations of its own.

### Runtime Boundary

`liveQuoteBuilderService`'s and `pricingService`'s default exports are unchanged — they still use `unavailableQuoteBuilderAdapter` and `unavailablePricingAdapter` respectively, so no existing runtime path is affected. Only `quoteBuilderWorkspaceService` explicitly composes the live adapters, and only the new `/admin/quote-builder` route consumes it.

### Non-goals

This integration does not implement checkout, Shopify synchronization, payments, PDF generation, email delivery, authentication, or database persistence. It does not add a new pricing calculation path — every price, margin, quantity break, and promotional bundle value displayed comes from the existing `pricingEngine`/`livePricingAdapter`/`dealerContractResolutionService` composition. See [PRICING_DOMAIN.md](./PRICING_DOMAIN.md) Issue 46 for the pricing-side half of this boundary.

## Fleet Quote Builder — a separate, project-level customer surface

The Fleet Quote Builder (`FLEET_QUOTE_BUILDER.md`, `/project-quote`) is a **distinct** customer-facing feature from everything else in this document — it does not use `QuoteDraft`, `QuoteAssemblyInput`, `QuoteBuilderAdapter`, `quoteBuilderService`, or any type in `src/types/quote.ts`. Where this foundation's Quote Builder assembles a priced, line-item `Quote` for one product/configurator/package selection, the Fleet Quote Builder aggregates an entire **Fleet Project** (many Fleet Builds, each representing N identical vehicles) into a read-only quote **package**: a project summary, per-vehicle equipment breakdowns, grouped line items, totals, a missing-equipment report, and an export preview — with no pricing, no `QuoteLine`, and no draft/workflow/approval state of any kind. The two features share nothing but a name; do not thread `src/domain/fleetQuote` output into `quoteBuilderService.assembleQuote()` or vice versa. If a future issue wants the Fleet Quote Builder's output priced and formally submitted as a `Quote`, that would be new orchestration work connecting `src/domain/fleetQuote`'s aggregation output to `quotePipelineService`/`liveQuoteBuilderService` — not a change to either existing foundation.
