# Catalog Service

## Purpose

The Catalog Service is the first safe vertical slice through the new architecture. It provides read-only access to typed product, category, and vertical domain objects through the Service Layer while leaving React components, routes, product JSON, commerce, pricing, and configurator behavior unchanged.

## Read-only Boundary

The service supports:

- Listing products.
- Getting a product by ID.
- Listing categories.
- Getting a category by ID.
- Listing verticals.
- Getting a vertical by ID.
- Searching/filtering products by free-text query and by vertical, category, or vendor (`searchProducts`, added by the Product Discovery Foundation — see `PRODUCT_DISCOVERY.md`).

It does not create, update, delete, enrich, price, or merchandize catalog records. It delegates all reads — including search — to the same typed product data loaders `listProducts()`/`getProduct()` already use; `searchProducts()` is a filter over `listTypedProducts()`, not a second read path.

## Dependency Flow

Current read path:

```
catalogService
  ↓
src/data/loaders
  ↓
normalizers
  ↓
Zod schemas
  ↓
existing JSON modules
```

Future React migration path:

```
React components
  ↓
Catalog hooks
  ↓
catalogService
  ↓
typed loaders and validators
```

React is not migrated in this PR. Existing runtime consumers continue using the current JavaScript data loader until a follow-up issue explicitly migrates them.

## Error Handling

The Catalog Service intentionally does not catch loader or validation errors. If a loader raises `ProductDataValidationError`, the error propagates to the caller with filename, ID, SKU, field path, and validation message details from the Product Data Platform.

This preserves fail-fast validation behavior and avoids returning partial or silently invalid catalog data.

## Future React Hook Migration

A future issue should introduce catalog hooks that call this service, such as:

```ts
const product = await catalogService.getProduct(productId);
```

Recommended migration order:

1. Add service-level tests around catalog reads and validation failure propagation.
2. Add read-only catalog hooks that call `catalogService`.
3. Migrate one non-critical catalog consumer to the hook.
4. Verify no direct JSON imports are added to React.
5. Continue migrating catalog consumers away from `src/lib/dataLoader.js` in small slices.

## Intentionally Not Wired Yet

This PR does not:

- Modify React components.
- Modify `ProductDetailTemplate`.
- Modify `ConfiguratorModule`.
- Modify routing.
- Modify product JSON.
- Change UI behavior.
- Change commerce behavior.
- Change pricing behavior.
- Replace `src/lib/dataLoader.js`.
- Add catalog hooks.

## Service Ownership

`src/services/catalog/catalogService.ts` owns the read-only catalog service boundary. Product data shape validation remains owned by the Product Data Platform loaders, normalizers, and Zod schemas.
