# Vehicle Fitment Service

## Purpose

The Vehicle Fitment Service is the shared boundary for future product and package compatibility decisions against a selected vehicle. It connects the existing typed vehicle model to a reusable service, adapter, hook, and validation layer without changing current UI, configurator, quote builder, package builder, commerce, or pricing behavior.

## Ownership

- `src/types/vehicle.ts` owns vehicle identity, year, make, model, trim, chassis, fitment request, result, subject, and issue contracts.
- `src/schemas/vehicle.schema.ts` owns runtime validation for vehicle and fitment request/result payloads.
- `src/adapters/vehicleFitment` owns the fitment adapter boundary for future catalog, rules-engine, or vendor-backed compatibility sources.
- `src/services/vehicleFitment` owns service orchestration and validates requests before adapter calls and results after adapter calls.
- `src/hooks/vehicleFitment` owns typed React-facing hooks for future UI migration.

## Dependency Direction

```text
React fitment hooks → vehicleFitmentService → VehicleFitmentAdapter → future fitment provider
                                      ↓
                         vehicle schemas / vehicle types
```

The default adapter is intentionally unavailable. It returns an `unknown` compatibility result with an informational issue so no existing runtime surface begins accepting or rejecting products or packages by accident.

## Supported Contracts

The foundation supports typed representation and validation of:

- Vehicle year.
- Vehicle make.
- Vehicle model.
- Vehicle trim.
- Vehicle chassis.
- Product compatibility requests.
- Package compatibility requests.
- Required and excluded option IDs.
- Compatibility result status, notes, and issues.

## Non-goals

This service does not implement pricing, quote builder integration, package builder integration, commerce integration, configurator behavior changes, product data changes, routing changes, or UI changes. Future issues must connect real fitment rules behind `VehicleFitmentAdapter` and migrate consumers through the typed hooks without bypassing service validation.

## Future Migration Plan

1. Add validated fitment fixtures or provider integration behind `VehicleFitmentAdapter`.
2. Add service tests for compatible, incompatible, unknown, invalid request, and invalid adapter result paths.
3. Migrate a non-critical product compatibility consumer to `src/hooks/vehicleFitment` after behavior-preservation criteria are approved. **Done** — `FitmentSummary` on the product detail page (see `PRODUCT_DETAIL_EXPERIENCE.md`).
4. Connect package compatibility only through a dedicated package-builder issue.
5. Connect configurator compatibility only through a dedicated configurator issue. **Done** — `ConfiguratorFitmentFeedback` and `ConfiguratorSummaryPanel`'s compatibility status row (see `CONFIGURATOR_EXPERIENCE.md`), composed around the selected vehicle and the configurator's selected SKU via `useProductFitment`. Because the default adapter remains unavailable, every result today is still `unknown`.

## Rollback

Because this issue is additive and unwired, rollback is a code revert of the vehicle fitment type, schema, adapter, service, hook, test, and documentation additions. Existing configurator, commerce, quote builder, package builder, and pricing paths remain unchanged.
