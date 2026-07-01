# Runtime Validation

## Purpose

The shared domain interfaces in `src/types` remain the source of truth for platform data contracts. Runtime validation lives in `src/schemas` and uses Zod schemas typed against those interfaces so external payloads can be validated without changing application behavior.

## Folder Organization

```
src/schemas/
  common.schema.ts        Zod schemas for shared primitives
  product.schema.ts       Zod schemas for product catalog interfaces
  configurator.schema.ts  Zod schemas for configurator interfaces and rules
  commerce.schema.ts      Zod schemas for Shopify and commerce interfaces
  vehicle.schema.ts       Zod schemas for vehicle and fitment interfaces
  package.schema.ts       Zod schemas for package builder interfaces
  quote.schema.ts         Zod schemas for quote and review interfaces
  quotePdf.schema.ts      Zod schemas for quote PDF render and document metadata interfaces
  index.ts                Runtime schema barrel for future consumers
```

## Source-of-Truth Rule

- TypeScript interfaces in `src/types` define the canonical platform contracts.
- Each Zod schema is annotated as `z.ZodType<InterfaceName>` to keep validation aligned with the corresponding interface.
- Schema files may import runtime schemas from other schema files, but they should import TypeScript contracts with `import type` only.
- When a domain interface changes, update its paired schema in the same PR.

## Coverage

The validation layer includes schemas for every shared domain interface:

- Common: `Metadata`, `BaseEntity`, `Money`, `Dimensions`, `ImageAsset`
- Product: `Product`, `ProductFamily`, `Category`, `Vertical`, `Feature`, `Specification`
- Configurator: `Configurator`, `ConfiguratorSection`, `ConfiguratorOption`, `SKUOption`, `DependencyRule`, `CompatibilityRule`
- Commerce: `ShopifyProduct`, `ShopifyVariant`, `VariantMapping`, `Price`, `InventoryStatus`
- Vehicle: `Vehicle`, `Make`, `Model`, `Year`, `Fitment`
- Package Builder: `Package`, `PackageDefinition`, `PackageLine`, `Accessory`, `PackageAssemblyInput`, `PackageAssemblyResult`, `PackageCompatibilityResult`, `PackageCompatibilityIssue`, `PackageValidationResult`
- Quote: `Quote`, `QuoteLine`, `QuotePayload`, `ReviewFlag`
- Quote PDF: `QuotePdfRenderInput`, `QuotePdfDocumentMetadata`, `QuotePdfRenderResult`, `QuotePdfRenderError`

## Import Rules

- Application code should import schemas from `@/schemas` in future validation work.
- Existing JavaScript, JSX, React components, configurator behavior, and commerce behavior are unchanged by this architecture layer.
- Do not put React imports, service calls, data loading, API calls, or business decisions in schema files.
- Keep schemas declarative; validation should parse shape and primitive data types, not execute workflow logic.

## Example

```ts
import { quotePayloadSchema } from '@/schemas';

const result = quotePayloadSchema.safeParse(payload);
```

This example is for future migration work only. No existing runtime path is wired to these schemas in this PR.

## Extension Strategy

- Add schemas beside their domain file when new interfaces are added.
- Prefer composing existing schemas over duplicating shape definitions.
- Introduce stricter refinements only when the underlying interface is also tightened or the issue explicitly requests runtime constraints.
- Keep Zod validation backward-compatible during the mixed JS/TS migration unless a dedicated migration issue approves stricter behavior.
