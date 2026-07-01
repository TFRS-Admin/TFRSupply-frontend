# Service Layer Foundation

## Purpose

The Service Layer defines the future boundary between React-facing hooks and platform data, validation, pricing, quote, commerce, vehicle, package-builder, and configurator capabilities. This foundation is additive only: service files expose typed contracts and placeholder implementations, but no React component, route, commerce flow, configurator flow, or product detail behavior is wired to them yet.

## Layer Diagram

```
React components
  ↓
Hooks
  ↓
Services
  ↓
Typed loaders
  ↓
Validators / Zod schemas
  ↓
JSON and future external data sources
```

After migration, React should not load product JSON directly. Components should ask hooks for view-ready data, hooks should call services, and services should coordinate typed loaders, validators, and future external adapters.

## Responsibilities

Services own platform use-case boundaries:

- `catalog` owns products, categories, and verticals.
- `configurator` owns configurator retrieval and future option-resolution orchestration.
- `commerce` owns commerce-facing boundaries without changing Shopify cart behavior in this PR.
- `pricing` owns future pricing resolution, bundle pricing, and quote pricing handoff boundaries.
- `quote` owns quote creation, quote retrieval, and quote submission boundaries.
- `vehicle` owns vehicle lookup and fitment evaluation boundaries.
- `packageBuilder` owns package composition and package validation boundaries.

## Rules

1. React components must not import JSON directly after migration.
2. React components must not import typed loaders directly.
3. Hooks may call services, but services should not import React or hooks.
4. Services may call typed loaders, validators, schemas, pure helpers, and future API adapters.
5. Services should return typed domain objects or service-specific result types.
6. Service methods must surface errors intentionally; they must not silently ignore invalid data.
7. Runtime behavior must be migrated service-by-service through explicit follow-up issues.

## Dependency Direction

Allowed future direction:

```
components → hooks → services → loaders → validators → schemas/types → JSON
```

Disallowed direction:

```
services → components
loaders → components
validators → services
schemas → services
```

The Service Layer is the only future access point between React and data once migration begins.

## Examples

### GOOD architecture

```ts
// hook calls service
const product = await catalogService.getProduct(productId);
```

```ts
// service calls typed loader in a future migration
const product = loadTypedProduct(productId);
```

```ts
// service returns typed domain data
async function getQuote(id: string): Promise<Quote | null>;
```

### BAD architecture

```ts
// component imports JSON directly
import product from '../data/products/navigator.json';
```

```ts
// component bypasses services and calls loader directly
const product = loadTypedProduct(productId);
```

```ts
// service imports React or a component
import ProductDetailTemplate from '@/pages/ProductDetailTemplate';
```

## Future Migration Plan

1. Keep this foundation as a no-runtime-change service boundary.
2. Add service-level tests for each service contract.
3. Migrate catalog reads from React components into hooks that call `catalogService`.
4. Migrate configurator reads behind `configuratorService` without changing option behavior.
5. Add pricing resolver implementation behind `pricingService` after pricing data sources are approved.
6. Add quote orchestration behind `quoteService` after Quote Builder contracts are finalized.
7. Add commerce adapters behind `commerceService` only when Shopify behavior changes are explicitly scoped.
8. Remove direct JSON access from React after equivalent service-backed hooks exist.

## Service Ownership

| Service | Folder | Owner Domain |
| --- | --- | --- |
| Catalog | `src/services/catalog` | Products, categories, verticals |
| Configurator | `src/services/configurator` | Configurator definitions and future selection orchestration |
| Commerce | `src/services/commerce` | Shopify-facing commerce boundaries |
| Pricing | `src/services/pricing` | Pricing sources, bundles, margins, quote pricing |
| Quote | `src/services/quote` | Quote lifecycle boundaries |
| Vehicle | `src/services/vehicle` | Vehicle lookup and fitment |
| Package Builder | `src/services/packageBuilder` | Package composition and validation |

## Anti-patterns

- Importing JSON in React components.
- Importing `src/data/loaders` from React components.
- Putting UI formatting, JSX, route navigation, or toast behavior in services.
- Calling Shopify cart logic from pricing services.
- Performing contract pricing decisions inside components.
- Swallowing validation failures and returning partial data.
- Creating circular dependencies between services.

## Current Implementation Boundary

All service implementations currently throw `new Error('Not implemented')`. This is intentional. The PR creates typed boundaries only and does not wire those boundaries into runtime application paths.
