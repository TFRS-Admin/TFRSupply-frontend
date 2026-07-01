# Commerce Platform Foundation

## Purpose

The Commerce Platform Foundation defines typed boundaries for future Shopify product, variant, inventory, mapping, and cart-line readiness work. It is architecture-only and does not change checkout behavior, product detail behavior, configurator behavior, pricing calculations, quote generation, routing, or styling.

## Ownership

- `src/types/commerce.ts` owns shared commerce domain contracts.
- `src/schemas/commerce.schema.ts` owns runtime validation schemas aligned to those contracts.
- `src/adapters/commerce` owns adapter interfaces and the placeholder Shopify adapter factory.
- `src/services/commerce` owns commerce use-case orchestration.
- `src/hooks/commerce` owns typed React-facing hooks for future commerce data migration.

## Dependency Direction

```text
React hooks → commerceService → CommerceAdapter → future external commerce provider
                          ↓
                   commerce schemas/types
```

The current adapter is intentionally unavailable and returns pending lookup results. No Shopify API, checkout API, pricing resolver, quote generator, catalog runtime, or configurator runtime is connected by this foundation.

## Non-goals

This foundation does not implement checkout, pricing calculations, quote generation, Shopify API calls, add-to-cart behavior, or cart persistence. Future work must replace the unavailable adapter behind `CommerceAdapter` and validate external data with the commerce Zod schemas before exposing it to hooks or components.
