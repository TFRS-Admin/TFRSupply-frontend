# Package Builder Foundation

## Purpose

The Package Builder Foundation defines typed, validated architecture for reusable product packages, vehicle-specific packages, installer packages, and future quote generation handoff. It is architecture-only and does not change configurator behavior, commerce behavior, pricing, checkout, routing, styling, or visible UI.

## Ownership

- `src/types/package.ts` owns package definitions, package line items, accessories, metadata, assembly inputs/results, compatibility results, and validation issues.
- `src/schemas/package.schema.ts` owns Zod validation for package assembly contracts and package validation contracts.
- `src/adapters/packageBuilder` owns the adapter boundary for future package data providers.
- `src/services/packageBuilder` owns package-builder orchestration and validates assembly input before adapter calls.
- `src/hooks/packageBuilder` owns typed React-facing hooks for future UI migration.

## Dependency Direction

```text
React package hooks → packageBuilderService → PackageBuilderAdapter → future package source
                                      ↓
                         package schemas / package types
```

The default adapter is intentionally unavailable. It returns null package definitions and pending validation/assembly outcomes so no existing runtime surface begins creating packages by accident.

## Supported Contracts

The foundation supports typed representation of:

- Package definitions across reusable, vehicle-specific, installer, quote-ready, and unknown package types.
- Package line items for products, accessories, services, and kits.
- Required and optional accessories.
- Package metadata including source tags, revision, owner, effective dates, and custom attributes.
- Vehicle and fitment-aware compatibility validation results.
- Package assembly results that are intentionally composition-only and contain no pricing fields.

## Non-goals

This foundation does not implement package pricing, quote generation, checkout, Shopify integration, routing, styling, UI, configurator behavior changes, commerce changes, or pricing-domain changes. Future pricing or quote work must consume package assembly output through explicit, tested issues rather than adding selling prices to package contracts.

## Future Migration Plan

1. Add package data fixtures or provider integration behind `PackageBuilderAdapter`.
2. Validate external package payloads with `packageDefinitionSchema` and `packageAssemblyInputSchema`.
3. Add focused service tests for provider success, not-found, invalid definition, incompatible vehicle, and required-accessory failure paths.
4. Migrate package-builder UI behind `src/hooks/packageBuilder` only after behavior-preservation criteria are approved.
5. Hand package assembly results to quote generation in a later quote-builder issue without adding pricing to package composition contracts.

## Rollback

Because this work is additive and unwired, rollback is a code revert of the package builder type, schema, adapter, service, hook, test, and documentation additions. Existing configurator, commerce, pricing, and checkout paths remain unchanged.
