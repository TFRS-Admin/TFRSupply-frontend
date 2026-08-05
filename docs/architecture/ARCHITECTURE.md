<!-- Purpose: Document this repository's current architecture, per TFRS Engineering Playbook templates/repository-architecture-template.md. -->
# TFRSupply Frontend Architecture

## Purpose

`TFRSupply-frontend` (repository: `TFRS-Admin/TFRSupply-frontend`) is the customer- and admin-facing storefront for TFR Supply's guided equipment-purchasing platform, serving Police, Fire/EMS, and Work Truck fleet customers. It helps users select the correct vehicle, find compatible products, build complete Federal Signal / upfit packages, add required and optional components, generate quote-ready packages, and proceed toward Shopify checkout. The project originated as a Base44-scaffolded app and is mid-migration toward a layered, Shopify-integrated architecture — several `docs/architecture/*.md` files describe boundaries as "foundation" or "additive only" because the wiring is in progress, not yet fully cut over.

## System Overview

```text
Browser
  ↓
React (Vite) SPA — src/pages/*, src/App.jsx, react-router-dom routing
  ↓
Components (src/components/**)  — presentational + feature UI (configurator, cart, fleet, product, admin)
  ↓
Hooks (src/hooks/**)             — one directory per domain/integration, the only layer components should call
  ↓
Services (src/services/**)       — use-case boundaries (catalog, pricing, quote, vehicle, commerce, packageBuilder, ...)
  ↓
Adapters (src/adapters/**)       — Shopify Storefront/Admin API, Base44, webhook verification, sync orchestration
  ↓
Domain (src/domain/**)           — pure business rules (pricing, dealer contract resolution, fleet builds, upfit)
  ↓
Data / loaders / validators (src/data/**, src/schemas/**) — JSON catalog, Zod validation
  ↓
Shopify (Storefront + Admin APIs) — commerce data, inventory, checkout — and Base44 (legacy scaffold surfaces)
```

Target dependency direction (see `docs/architecture/SERVICE_LAYER.md` and `docs/architecture/DOMAIN_MODEL.md`):
`components → hooks → services → loaders → validators → schemas/types → JSON/Shopify`. Services must not import React or hooks; the domain type layer (`src/types/`) must stay free of React, service, and API-client imports.

## Key Directories

| Path | Responsibility |
| --- | --- |
| `src/pages/` | Route-level views (React Router) |
| `src/components/` | Presentational and feature UI, one subdirectory per feature area (`configurator/`, `cart/`, `fleetProjects/`, `fleetQuote/`, `product/`, `navigator/`, `upfitBuilder/`, `ui/` for the design-system primitives, etc.) |
| `src/hooks/` | One directory per domain/integration (`pricing/`, `quoteBuilder/`, `shopifyStorefront*/`, `vehicleFitment/`, ...) — the only layer components should call into business logic through |
| `src/services/` | Use-case boundaries: `catalog`, `configurator`, `commerce`, `pricing`, `quote`, `vehicle`, `packageBuilder`, plus one directory per Shopify integration surface |
| `src/adapters/` | External-system adapters: Shopify Storefront/Admin/webhook/sync surfaces, Base44, vehicle fitment |
| `src/domain/` | Pure business rules: `pricing`, `dealerContractResolution`, `fleetBuilds`, `fleetProjects`, `fleetQuote`, `upfitBuilder`, `procurementPackages`, `recommendations`, `departmentStandards` |
| `src/types/` | Shared TypeScript domain contracts (`common`, `product`, `configurator`, `commerce`, `vehicle`, `package`, `quote`) — architecture-only, no runtime/React imports |
| `src/schemas/` | Zod validation schemas |
| `src/data/` | Catalog/vehicle/vendor/vertical JSON and typed loaders |
| `src/context/` | React context providers (Configurator, FleetProject, SavedProducts, Vehicle) |
| `src/config/` | App and navigation-vertical configuration |
| `scripts/` | Standalone Node scripts: Shopify catalog ingestion (`shopify-catalog-ingest/`) and variant GID overlay (`shopify-variant-gid-overlay/`) |
| `base44/` | Base44 platform config (entities, connectors) from the project's original scaffold |
| `docs/architecture/` | ~60 per-domain architecture documents — the authoritative boundary spec for each subsystem; consult the relevant file(s) before changing a boundary |
| `docs/project-management/` | Repository-specific process detail (epics, labels, definition of done, acceptance criteria library, agent personas, branch strategy) — Tier-3 reference material under the adopted playbook |
| `tests/` | Node's built-in test runner (`node --test`), one `.test.mjs` file per feature/migration slice |

## External Dependencies

- **Shopify** — Storefront API (catalog, cart, checkout) and Admin API (inventory, fulfillment, order sync) via `src/adapters/shopify*`; Shopify owns commerce data (see `docs/project-management` vision issue #107's governing principles: no invented SKUs, no hardcoded prices, Shopify owns commerce data, configurator JSON owns SKU logic).
- **Base44** — original scaffold platform (`base44/` config, `VITE_BASE44_APP_ID` / `VITE_BASE44_APP_BASE_URL` env vars per `.env.example`); being migrated away from for storefront logic.
- **Stripe** (`@stripe/stripe-js`, `@stripe/react-stripe-js`) — payment UI dependencies present in `package.json`.
- **Railway** — deployment target, see `docs/deployment/RAILWAY_DEPLOYMENT.md`.
- No first-party backend/database in this repository — data is Shopify + committed JSON/config (`src/data/`, `docs/knowledge/`).

## Architectural Decisions in Effect

This repository does not yet have a `docs/decision-log/` ADR index (see Known Constraints). The closest existing equivalent is the per-domain rationale embedded in each `docs/architecture/*.md` file (e.g. `SERVICE_LAYER.md`'s explicit "additive only, not yet wired" boundary, `DOMAIN_MODEL.md`'s dependency-direction rules) and the governing principles in GitHub issue #107 ("Vision — TFRSupply Digital Platform"): product pages own layout, `ConfiguratorModule` plugs into Build & Configure only, Shopify owns commerce data, configurator JSON owns SKU logic, no invented SKUs, no hardcoded prices, no product-family-specific React components without approval.

## Known Constraints

- Several service/adapter layers (`docs/architecture/SERVICE_LAYER.md`, `COMMERCE_FOUNDATION.md`, and similar "foundation" docs) are intentionally not yet wired into runtime component behavior — check the specific domain doc before assuming a boundary is live rather than scaffolded.
- `src/types/` must remain free of React, service, and API-client imports; violating this breaks the intended `components → hooks → services → loaders → validators → schemas/types` dependency direction.
- No `docs/decision-log/` ADR index exists yet; architectural rationale currently lives inside each `docs/architecture/*.md` file instead of a separate decision log.

## Last Reviewed

2026-07-09, as part of the TFRS Engineering Playbook adoption sprint (`docs/engineering/archive/PLAYBOOK_ADOPTION.md`). Relocated from repository root to `docs/architecture/ARCHITECTURE.md` 2026-08-04 during the Engineering OS re-sync (`migration/RESYNC_CHECKLIST.md`).

## Related Documents

[`AGENTS.md`](../../AGENTS.md) · [`docs/engineering/archive/PLAYBOOK_ADOPTION.md`](../engineering/archive/PLAYBOOK_ADOPTION.md) · this directory (per-domain detail, 60 sibling files) · [`docs/project-management/`](../project-management/)
