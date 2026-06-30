# TFRSupply Domain Model

## Purpose

The shared TypeScript domain model defines reusable platform contracts for Police, Fire/EMS, and Work Truck verticals. These files are architecture-only and intentionally contain interfaces without runtime implementation, React dependencies, or commerce behavior.

## Folder Organization

```
src/types/
  common.ts        Shared primitives used by all domains
  product.ts       Product catalog, vertical, category, feature, and specification contracts
  configurator.ts  Configurator sections, options, SKU options, and rules
  commerce.ts      Shopify mapping, variant, pricing, inventory, and cart-facing contracts
  vehicle.ts       Vehicle identity and fitment contracts
  package.ts       Package builder and accessory contracts
  quote.ts         Quote request, quote line, payload, and review flag contracts
  index.ts         Type-only barrel exports for consumers
```

## Type Relationships

- `BaseEntity`, `Money`, `Dimensions`, `ImageAsset`, and `Metadata` in `common.ts` are the shared primitives for higher-level domains.
- `Product`, `ProductFamily`, `Category`, and `Vertical` describe catalog structure independent of any single storefront or configurator.
- `Configurator` references catalog products by `productId` and organizes user choices through `ConfiguratorSection` and `ConfiguratorOption`.
- `SKUOption` represents SKU-producing configurator choices and can be connected to `VariantMapping` in the commerce layer.
- `CompatibilityRule` can reference `Fitment` from the vehicle layer to express vehicle-specific constraints without importing UI or business logic.
- `ShopifyProduct`, `ShopifyVariant`, and `VariantMapping` isolate Shopify identifiers and availability state from product catalog records.
- `Package` groups `PackageLine` entries that can point at a catalog `Product` or `Accessory` for package-builder experiences.
- `Quote`, `QuoteLine`, and `QuotePayload` provide submission contracts for configured builds, packages, and review workflows.

## Import Rules

- Import shared contracts from `src/types/index.ts` when consuming types outside the `src/types` folder.
- Use `import type` for direct type dependencies between domain files.
- Keep domain files free of React imports, service imports, API clients, and runtime constants.
- Do not import from application components, pages, hooks, services, or data loaders into `src/types`.
- Avoid circular dependencies. Domain dependencies should flow from common primitives into specialized domains.

Recommended dependency direction:

```
common
  -> product
  -> vehicle
  -> configurator
  -> commerce
  -> package
  -> quote
```

## Naming Conventions

- Use PascalCase for interfaces, such as `Product`, `ConfiguratorOption`, and `QuotePayload`.
- Use `id` for internal platform identifiers and explicit names such as `shopifyVariantId` for external identifiers.
- Use `verticalIds`, `categoryIds`, and `productId` when a relationship is represented by stable IDs instead of embedded objects.
- Prefer optional fields for data that is unavailable during early migration or upstream integration work.
- Use neutral names that work across Police, Fire/EMS, and Work Truck rather than vertical-specific terms.

## Extension Strategy

- Add new shared primitives to `common.ts` only when at least two domains need them.
- Extend domain interfaces in their owning file before adding cross-domain dependencies.
- Model external systems at the boundary, such as Shopify fields in `commerce.ts`, rather than mixing external IDs into unrelated domains.
- Keep rules declarative. `DependencyRule`, `CompatibilityRule`, and `ReviewFlag` describe decisions but do not execute them.
- Introduce stricter literal unions or branded IDs in a future strictness issue after the JavaScript migration plan is approved.

## Examples

Importing shared types from application or service code in a future migration:

```ts
import type { Product, QuotePayload, Vehicle } from '@/types';
```

Representing a product that applies to multiple verticals:

```ts
interface ExampleCatalogRecord {
  product: Product;
  supportedVehicle?: Vehicle;
  quotePayload?: QuotePayload;
}
```

Mapping a configurator SKU to commerce data:

```ts
import type { SKUOption, VariantMapping } from '@/types';

interface ExampleSkuMapping {
  option: SKUOption;
  mapping: VariantMapping;
}
```

## Current Boundaries

This model does not migrate existing JavaScript files, rename JSX files, modify React components, change configurator behavior, or change Shopify cart behavior. It exists as a source of truth for future typed migrations.
