# Architecture Principles

## Purpose

This document defines the architectural rules every AI agent must follow when touching TFRSupply platform code. It is the condensed, principle-level companion to the detailed boundary docs under `docs/architecture/` (`SERVICE_LAYER.md`, `VALIDATION.md`, `DOMAIN_MODEL.md`, and the per-domain foundation docs). When a principle here and a detailed doc disagree, the detailed doc for that specific domain wins; open a documentation issue to reconcile them.

## Service-Oriented Architecture

- Every platform capability (catalog, configurator, commerce, pricing, quote, quote PDF, vehicle, package builder) is owned by exactly one service under `src/services/<domain>`.
- Services are the only layer hooks are allowed to call for platform data. React components and hooks must not reach past a service into loaders, adapters, or JSON directly.
- Services coordinate; they do not contain UI formatting, JSX, routing, or toast/notification behavior.

## Domain-Driven Organization

- Contracts live in `src/types/<domain>.ts`, pure logic lives in `src/domain/<domain>`, adapters live in `src/adapters/<domain>`, and services live in `src/services/<domain>`. Folder names match across all four layers for a given domain.
- Domain interfaces are grouped by the platform concept they describe (product, configurator, commerce, vehicle, package, quote, pricing), not by which page or feature currently consumes them, per `docs/architecture/DOMAIN_MODEL.md`.
- Vertical-specific behavior (Police, Fire/EMS, Work Truck) is expressed through data and configuration, not through vertical-specific types or services.

## Runtime Validation

- `src/types` interfaces are the compile-time source of truth. `src/schemas/<domain>.schema.ts` Zod schemas validate runtime payloads against those same interfaces and are annotated `z.ZodType<InterfaceName>`, per `docs/architecture/VALIDATION.md`.
- Validation happens at the boundary — where external or file-based data enters the system — not deep inside business logic.
- Validation failures are surfaced loudly (thrown, typed error, or explicit failure result). Never silently substitute defaults for invalid data.

## Composition Over Duplication

- Compose existing schemas, domain functions, and service methods instead of duplicating shape or logic definitions.
- Extend a domain interface in its owning file before introducing a cross-domain dependency or a parallel type.
- Reuse the existing hook/service resource pattern (see `useCatalogResource` in `src/hooks/useCatalog.ts`, `usePricingResource` in `src/hooks/pricing/usePricing.ts`) rather than inventing a new state-shape per hook.

## Pure Business Logic

- Business rules and calculations (pricing resolution, contract window evaluation, fitment compatibility, configurator dependency rules) live in `src/domain/<domain>` as deterministic, side-effect-free functions.
- Domain modules must not import React, hooks, adapters, or perform network/storage I/O. They take typed input and return typed output.
- Every domain rule ships with fixture-based tests that cover its expected decision paths before a service wires it into a live path.

## Adapter Boundaries

- Adapters (`src/adapters/<domain>`) are the only layer permitted to talk to an external system or future provider (Shopify, quote submission, pricing data sources, vehicle data sources).
- Every adapter contract has a safe default implementation (an "unavailable" adapter) that returns pending/null results so introducing the contract never changes current runtime behavior.
- Services depend on the adapter's typed interface, never on a concrete SDK or fetch call directly, so swapping implementations requires no service or hook changes.

## Typed Contracts

- Every service method, adapter method, and domain function has an explicit TypeScript signature; no implicit `any` inputs or outputs for new code.
- Shared contracts are imported with `import type` from `src/types/index.ts` (or the domain's schema/type module) rather than redeclared locally.
- Result types (e.g., `PricingResolution<T>`, `ProductDataValidationError`) are shared across services and hooks instead of each layer inventing its own success/error shape.

## No Direct JSON Imports

- React components and hooks must not import product, configurator, or other platform JSON directly once a surface has migrated to the service architecture.
- Only typed loaders (`src/data/loaders`) may read JSON; loaders hand validated, typed data to services.
- Introducing a new JSON-backed data source requires a loader + validator + schema, not a direct import from application code.

## Shared Domain Models

- `src/types` is the single shared model for Police, Fire/EMS, and Work Truck verticals; do not fork a type per vertical.
- New shared primitives go in `src/types/common.ts` only when at least two domains need them.
- Dependency direction between domain type files flows from common primitives outward: `common → product → vehicle → configurator → commerce → package → quote` (see `docs/architecture/DOMAIN_MODEL.md`).

## Separation of UI from Business Logic

- Dependency direction is one-way: `components → hooks → services → loaders/adapters → validators → schemas/types → JSON` (see `docs/architecture/SERVICE_LAYER.md`).
- Services, loaders, validators, schemas, and domain modules must never import React, hooks, or components — this direction must never reverse.
- Components hold layout, styling, and interaction wiring only; loading/empty/error/success state comes from hooks, and business decisions come from services and domain modules.

## Anti-Patterns to Reject in Review

- A component importing JSON or a typed loader directly.
- A service, adapter, loader, or domain module importing React, a hook, or a component.
- A hook containing pricing, commerce, or validation decisions instead of delegating to a service.
- A new adapter without a safe "unavailable" default implementation.
- Duplicated type or schema definitions instead of composing existing ones.
- Circular dependencies between services or between domain type files.
