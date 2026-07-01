# First React Migration

## Component Migrated

`src/pages/CategoryTemplate.jsx` is the first production React surface migrated from direct legacy data access to the new platform architecture.

The selected route is low risk because it is a read-only catalog page and does not touch `ProductDetailTemplate`, `ConfiguratorModule`, checkout, pricing, quote builder, routing, commerce behavior, or product JSON.

## Old Dependency Graph

```
CategoryTemplate.jsx
  ↓
src/lib/dataLoader.js
  ↓
import.meta.glob('../data/categories/*.json')
  ↓
category JSON
```

## New Dependency Graph

```
CategoryTemplate.jsx
  ↓
useCatalogCategory
  ↓
catalogService.getCategory
  ↓
loadTypedCategory
  ↓
normalizeCategory
  ↓
categorySchema
  ↓
category JSON
```

## Before / After Architecture

Before this migration, `CategoryTemplate` imported the legacy JavaScript data loader directly and rendered raw category JSON. After this migration, the component reads category data through a React hook backed by the Catalog Service and typed Product Data Platform.

The rendered page remains read-only and uses the same category data fields needed by the existing UI: hero content, description, filters, products, labels, and breadcrumbs.

## Runtime Scope

This migration does not change:

- Routes.
- Product JSON.
- Category JSON.
- UI layout.
- Commerce behavior.
- Pricing behavior.
- Quote behavior.
- Configurator behavior.
- `ProductDetailTemplate`.
- `ConfiguratorModule`.

## Lessons Learned

- The first safe migration should target read-only catalog data before product detail or configurator flows.
- The shared category domain needed to preserve the existing category page view model fields so the UI could remain unchanged while data access moved behind the service boundary.
- Catalog hooks should expose explicit `data`, `loading`, and `error` state even when the current loaders are backed by eager JSON modules.

## Remaining Migrations

- Migrate `VerticalLandingTemplate` to a catalog hook after vertical page view-model fields are represented in the typed domain.
- Migrate `SiteHeader` category navigation after vertical navigation data is represented in the typed domain.
- Migrate product detail reads only in a dedicated issue because `ProductDetailTemplate` is explicitly out of scope for this migration.
- Retire direct React imports of `src/lib/dataLoader.js` after all equivalent hooks exist.
- Add service and hook tests for validation-error propagation.
