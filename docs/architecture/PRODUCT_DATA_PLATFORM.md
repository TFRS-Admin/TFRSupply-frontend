# Product Data Platform

## Purpose

The Product Data Platform adds typed loading and runtime validation for existing product data without changing application runtime behavior. Existing JSON remains in place and existing React components continue to use the current JavaScript loader until a future migration explicitly wires in the typed loaders.

## Loader Architecture

```
src/data/loaders/
  moduleRegistry.ts       Shared JSON module discovery helpers
  productLoader.ts        Typed product loading and validation
  categoryLoader.ts       Typed category loading and validation
  verticalLoader.ts       Typed vertical loading and validation
  configuratorLoader.ts   Typed configurator loading and validation
  index.ts                Loader barrel exports

src/data/validators/
  normalizers.ts              Existing JSON shape to shared domain model mapping
  validateSchema.ts           Reusable Zod validation helper
  validationError.ts          Structured validation error model
  productDataPlatform.ts      Full catalog validation entry point and statistics
```

The typed loaders use `import.meta.glob(..., { eager: true })` against the existing `src/data` JSON folders. Each loader normalizes the current JSON shape into the shared domain interface, validates the normalized object with the matching Zod schema, and returns the typed result.

## Validation Flow

1. Locate the JSON module by filename or enumerate all modules in a folder.
2. Extract the raw JSON payload without mutating it.
3. Normalize the current data shape into the shared domain model.
4. Validate the normalized value with the matching Zod schema from `src/schemas`.
5. Return typed domain objects or throw a `ProductDataValidationError` with structured issue details.

## Schema Relationships

- Product JSON validates through `productSchema` and returns `Product`.
- Category JSON validates through `categorySchema` and returns `Category`.
- Vertical JSON validates through `verticalSchema` and returns `Vertical`.
- Configurator JSON validates through `configuratorSchema` and returns `Configurator`.

The schemas remain aligned with the shared interfaces in `src/types`; loaders do not define independent product contracts.

## Error Reporting

Validation failures are surfaced as `ProductDataValidationError` instances. Each issue is designed for future admin tooling and includes:

- `filename`
- `id`
- `productId`
- `sku`
- `fieldPath`
- `message`

Errors are not silently ignored. The loader throws when a JSON payload cannot be normalized into a valid shared domain object.

## Runtime Boundary

This PR does not replace `src/lib/dataLoader.js`, does not modify React components, does not change `ConfiguratorModule`, does not change `ProductDetailTemplate`, and does not modify commerce logic. The typed loaders are additive infrastructure for future migration work.

## Product Detail Experience Field Addition

`ProductCommerce` (`src/types/product.ts`) and `productSchema`'s commerce object (`src/schemas/product.schema.ts`) gained one optional field, `related_packages?: string[]`, mirroring the existing `related_products` field. It is additive — existing product JSON validates unchanged — and lets a product opt into the Package Builder Foundation composition added by `PRODUCT_DETAIL_EXPERIENCE.md`.

## Future Extension Points

- Wire typed loaders into admin-only validation tooling.
- Add CI catalog validation once the TypeScript runtime command is standardized.
- Add semantic rules for cross-file relationships, such as product `configuratorId` existence and category-to-product consistency.
- Add richer SKU-level error contexts when validating individual SKU option records.
- Migrate existing runtime data consumers to typed loaders in explicit, behavior-preserving follow-up issues.
