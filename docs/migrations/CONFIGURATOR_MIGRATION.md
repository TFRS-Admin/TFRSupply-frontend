# Configurator Migration

## Summary

Configurator data access now flows through the typed architecture while preserving live preview behavior. Configurator UI surfaces continue to render the same sections, steps, SKU filters, SKU table, accessory rows, and quote panel behavior, but configurator JSON is loaded through `configuratorService`, the typed configurator loader, normalizer, Zod schema, and existing JSON files.

## Old Dependency Graph

```text
ProductDetailTemplate / ProductTabs
  ↓
import.meta.glob configurator JSON access
  ↓
ConfiguratorModule
  ↓
raw configurator JSON
```

## New Dependency Graph

```text
Configurator UI
  ↓
configuratorService
  ↓
loadTypedConfigurator
  ↓
normalizeConfigurator
  ↓
configuratorSchema
  ↓
configurator JSON
```

## Migrated Files

- `src/services/configurator/configuratorService.ts`
- `src/components/configurator/ConfiguratorModule.jsx`
- `src/components/product/ProductTabs.jsx`
- `src/pages/ProductDetailTemplate.jsx`
- `src/types/configurator.ts`
- `src/schemas/configurator.schema.ts`
- `src/data/validators/normalizers.ts`
- `tests/configurator-migration.test.mjs`

## Configurator Domain Extensions

The typed configurator domain now preserves the fields required by the existing configurator UI:

- `productFamily`
- `priceDisplay`
- `skuOptions` with SKU, price, and attributes
- `vehicleRules`
- `sectionMap` keyed by existing section IDs such as `skuSelector` and `accessories`
- section `steps`
- step option metadata such as `skuSegment`, `skuSegmentKey`, `required`, and `_verification`
- accessory section `items`

These fields are part of the shared configurator contract and avoid introducing a duplicate configurator model.

## Preserved Behavior

- UI styling is unchanged.
- Routing is unchanged.
- Product JSON is unchanged.
- Pricing, quote, Shopify/cart, and commerce behavior are unchanged.
- Configurator option labels, SKU filtering attributes, accessory rows, and quote panel behavior are preserved.
- Validation errors continue to surface through the typed loader and service path rather than being swallowed.

## Live Preview Smoke-Test Checklist

Use the Railway deployment as a preview environment only; do not treat it as production.

1. Open a product detail page with a configurator, such as `/fire/light-bars/navigator`.
2. Confirm the Build & Configure section renders.
3. Confirm SKU filter labels and options match the previous preview, including bar length and warning color options.
4. Select valid filter combinations and confirm the SKU table narrows as before.
5. Select a SKU and confirm accessory rows and the package quote panel appear as before.
6. Confirm Add to Cart remains disabled where Shopify variant IDs are still pending.
7. Confirm no product JSON, pricing, quote, Shopify/cart, routing, or styling changes are visible.

## Remaining Legacy Dependencies

- Configurator behavior is still implemented by `ConfiguratorModule`; this migration only changes data access.
- Commerce lookup remains on the existing commerce lookup service.
- Quote submission and Shopify/cart behavior remain intentionally unchanged.
- Browser-level interaction tests are still recommended for full client-side configurator workflows.

## Recommended Next Issue

Add browser-capable configurator interaction tests for filter selection, dead-end prevention, SKU row selection, accessory toggling, and quote payload output before migrating deeper configurator behavior.

## Configurator Experience

The customer-facing Configurator Experience (`ConfiguratorExperience` and the vehicle summary / configuration summary / pricing summary / fitment feedback / commerce action panels it composes) is documented in [CONFIGURATOR_EXPERIENCE.md](../architecture/CONFIGURATOR_EXPERIENCE.md). It sits around this migration's unchanged `ConfiguratorModule` and reads only `ConfiguratorModule`'s existing `quotePayload`, surfaced via one additive `onConfigurationChange` prop — SKU filtering, dead-end prevention, and quote-payload construction remain exactly as migrated above.
