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
