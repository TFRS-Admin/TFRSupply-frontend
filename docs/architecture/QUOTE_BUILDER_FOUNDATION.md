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
