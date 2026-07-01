# Vertical Landing Migration

## Summary

`src/pages/VerticalLandingTemplate.jsx` is the second production React surface migrated to the new platform architecture. It remains a read-only catalog surface and does not change routing, product JSON, UI styling, commerce, pricing, quote, package-builder, `ProductDetailTemplate`, or `ConfiguratorModule` behavior.

## Old Dependency Graph

```
VerticalLandingTemplate.jsx
  ↓
src/lib/dataLoader.js
  ↓
import.meta.glob('../data/verticals/*.json')
  ↓
vertical JSON
```

## New Dependency Graph

```
VerticalLandingTemplate.jsx
  ↓
useCatalogVertical
  ↓
catalogService.getVertical
  ↓
loadTypedVertical
  ↓
normalizeVertical
  ↓
verticalSchema
  ↓
vertical JSON
```

## Migrated Files

- `src/pages/VerticalLandingTemplate.jsx`
- `src/hooks/useCatalog.ts`
- `src/types/product.ts`
- `src/schemas/product.schema.ts`
- `src/data/validators/normalizers.ts`
- `tests/vertical-landing-migration.test.mjs`

## Preserved Behavior

The page still renders the same vertical sections from existing JSON:

- Hero
- Featured article
- Featured products
- Category grid
- Configurator cards
- Contract cards
- Resource cards

The migrated component preserves loading and error handling through the hook state contract and a view component that renders `null` while loading and rethrows errors intentionally.

## Remaining Legacy Dependencies

- `SiteHeader` still reads vertical navigation data through the legacy loader.
- `ProductDetailTemplate` remains intentionally unmigrated.
- Navigator-specific components still import product/configurator JSON directly.
- Commerce lookup services still read Shopify/product JSON directly.
- Configurator contexts and product tabs still use direct configurator JSON module access.

## Lessons Learned

- Vertical landing data requires a richer view-model surface than the base `Vertical` identity contract.
- The typed normalizer should preserve existing read-only view fields rather than forcing React components to know raw JSON shape.
- Separating `VerticalLandingTemplateView` from the route-bound default component makes loading, error, and successful render states testable without changing runtime routing.
- Existing hooks can be extended for additional catalog surfaces instead of creating duplicate hook layers.

## Recommendations for Future Migrations

1. Migrate `SiteHeader` only after vertical navigation fields are fully represented in the catalog domain.
2. Add component-level browser tests when a browser test environment is approved.
3. Migrate product detail reads in a dedicated issue because that route has more commerce and configurator coupling.
4. Continue preserving validation error propagation rather than catching data platform failures in React components.
5. Remove direct `src/lib/dataLoader.js` imports only after all equivalent service-backed hooks exist.
