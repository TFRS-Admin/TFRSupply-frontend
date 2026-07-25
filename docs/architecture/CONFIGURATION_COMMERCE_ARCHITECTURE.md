# Configuration Commerce Architecture

## Purpose

This document defines the long-term **Configuration Commerce** architecture: the extraction of reusable platform domains from the TFRSupply storefront into shared packages that can power additional storefronts, verticals, and brands. It classifies every existing module as a shared-package candidate or storefront-specific code, defines the target package topology, and lays out a phased migration plan whose first rule is that **extraction work never blocks or destabilizes Launch Commerce**.

Two terms are used throughout:

- **Launch Commerce** — the near-term effort to take the TFRSupply storefront live on Shopify: wiring the live Storefront/Admin adapters that today are intentionally unavailable, enabling real add-to-cart, checkout redirect, and order flows. Launch Commerce ships from this repository as-is.
- **Configuration Commerce** — the long-term platform: data-driven configurators, pricing resolution, fleet/upfit workflows, and commerce orchestration packaged so a second storefront (a new vertical, a new brand, a dealer white-label) is a thin app over shared packages plus its own catalog content.

This document is architecture-only. It changes no runtime behavior and moves no files; every move it describes happens in a later, explicitly-scoped issue.

## Why the codebase is ready for this

The layering rules in `docs/ai/ARCHITECTURE_PRINCIPLES.md` have been enforced well enough that extraction is mostly mechanical rather than a rewrite. A coupling audit of the current tree found:

- **Zero React imports** anywhere under `src/domain`, `src/services`, or `src/adapters`.
- **Zero UI files** (components/pages/hooks/context) importing `src/adapters` directly; 69 UI files consume `src/services`, 36 consume `src/domain` — always through barrels.
- **Only three imports in all of `src/domain` couple to brand data**: `fleetBuilds/addToAllCompatibleBuilds.ts`, `fleetBuilds/cloneRules.ts`, and `recommendations/scoreProduct.ts` each import `resolveCatalogVerticalId` from `@/data/vehicles/vehicleMaster`.
- ~~The configurator is already a **pure, data-driven engine** (`src/domain/configuration/configuratorEngine.js`: "No React, no Base44, no Shopify") interpreting JSON definitions in `src/data/configurators/` through zod-validated loaders.~~ **Correction (#321):** `src/domain/configuration/configuratorEngine.js` was never actually wired to the app — it was confirmed dead code (its `ConfigurationContext` was never mounted anywhere) and has been deleted. The real, live configurator logic lives inside `src/components/configurator/ConfiguratorModule.tsx` itself (React state + hooks, not a separate pure engine) — see the "Configurator UI" row below, which this changes the classification of. Extraction planning for the configurator domain should start from `ConfiguratorModule.tsx`, not the deleted file.
- Base44 platform coupling is confined to `src/api/base44Client.js`, `src/adapters/base44/`, the auth pages/`src/lib/AuthContext.jsx`, three legacy flat services, and the internal showcase.
- Every service follows one pattern: `createXService(adapter = unavailableXAdapter)` with zod validation at the boundary — dependency injection already exists at every seam.

The remaining coupling is small, known, and listed in "Boundary fixes" below.

## Module classification

### Shared-package candidates (Configuration Commerce platform)

| Domain | Current locations | Extraction readiness |
| --- | --- | --- |
| **Contracts** | `src/types/*` (52 files), `src/schemas/*` (41 files) | Ready. Pure TS + zod only; already the shared model for all three verticals. |
| **Configurator engine** | ~~`src/domain/configuration`~~ (deleted, #321 — was dead code, never wired to `ConfiguratorModule.tsx`), `src/data/loaders/configuratorLoader.ts`, `src/schemas/configurator.schema.ts`, `src/services/configurator` | **Needs re-assessment.** The actual configurator logic lives in `ConfiguratorModule.tsx` (see "Configurator UI" row) — there is no separate pure engine today. Definitions in `src/data/configurators/` are still JSON content interpreted at runtime via the loaders/schemas listed here. |
| **Pricing engine** | `src/domain/pricing`, `src/domain/dealerContractResolution`, `src/services/pricing`, `src/services/dealerContractResolution`, `src/services/pricingImport` | Ready. Pure resolution logic (list/dealer/contract/bundle/quote pricing, contract windows, quantity breaks) over injected record sets. |
| **Catalog kernel** | `src/domain/catalog`, `src/services/catalog`, `src/services/catalogAdapter`, `src/data/loaders` + `src/data/validators` machinery | Near-ready. Loader/validator machinery (`moduleRegistry.ts`, `validateSchema.ts`, normalizers) is generic; the JSON it loads is storefront content. `catalogService`'s loader dependency becomes an injected `CatalogSource`. |
| **Fleet & upfit domain** | `src/domain/fleetBuilds`, `fleetProjects`, `departmentStandards`, `upfitBuilder`, `fleetQuote`, `procurementPackages`, `recommendations` | Near-ready. All pure except the three `vehicleMaster` imports (fix: inject a `VerticalResolver`). The 12-category upfit taxonomy and 7 build styles are currently fixed constants; long-term they become package-supplied defaults a storefront can override with data. |
| **Commerce kernel** | `src/services/commerce`, `cartWorkspace`, `checkoutPreparation`, `quoteBuilder`, `quotePdf`, `quotePipeline`, `quotePersistence`, `quoteApproval`, `liveQuoteBuilder`, `emailNotification`, `packageBuilder`, `vehicleFitment` + their adapter ports | Ready pattern-wise; port interfaces currently live in `src/adapters/*` and must move into the owning package first (see Boundary fixes). |
| **Shopify integration** | All `shopify*` services/adapters/schemas (~27 triads), `src/services/shopifyVariantResolver`, `src/services/commerceLookupService.ts`, `scripts/shopify-catalog-ingest`, `scripts/shopify-variant-gid-overlay` | Ready pattern-wise, but **frozen until Launch Commerce ships** — these modules are the launch critical path. `commerceLookupService` must stop importing `src/data/shopify/shopify-variant-index.json` directly; `shopifyStorefrontConfig`'s `import.meta.env` reads must accept injected config. |
| **UI primitives** | `src/components/ui` (50 shadcn/Radix files), `src/lib/utils.js` (`cn`) | Ready. Zero app-layer imports. |
| **Commerce UI** | `src/components/cart`, `fleetQuote`, `procurementPackages`, `templates`, `shopify/StorefrontConfigReadinessRow`, most of `workspace`/`fleetProjects`/`departmentStandards`/`recommendations` | Props-driven and near-pure, but brand styling is inline (`#c8102e` hardcoded in ~75 component files, per-file font constants). Requires a design-token layer before extraction — this is the largest single extraction cost. |
| **Configurator UI** | `src/components/configurator` (`ConfiguratorModule`, `ConfiguratorExperience` panels) | Later. Medium-high coupling (contexts, services, `@/data/vehicleLengthMap`, `@/data/verticalColorOptions`); extract after the engine, kernels, and tokens exist. |

### Storefront-specific (stays in the TFRSupply app)

| Area | Locations | Why it stays |
| --- | --- | --- |
| App shell & routing | `src/pages` (35 files), `src/main`, `src/lib` (AuthContext, app-params, query-client), `Caddyfile`, `Dockerfile` | The storefront *is* this composition. |
| Base44 platform glue | `src/api/base44Client.js`, `src/adapters/base44/*`, `base44/` entities, legacy flat services (`adminAccessService.js`, `adminQuoteService.js`, `quoteRequestService.js`) | Backend platform choice of this storefront. A second storefront may use a different persistence adapter behind the same ports. |
| Brand configuration | `src/config/appConfig.js`, `src/config/navigationVerticals.js` | Quote recipient emails, admin allowlist, nav verticals, brand imagery — the injection seam for extracted packages. |
| Catalog & configurator content | `src/data/products`, `categories`, `verticals`, `vendors`, `configurators`, `vehicles/vehicleMaster.ts`, `shopify/`, `shopify-mapping/`, `data/shopify-exports/` | Content, not code. The *contracts and loaders* are shared; the JSON is TFRSupply's catalog. |
| Legacy product-specific UI | `src/components/navigator` (`NavigatorTabs` with hardcoded `NAVIGATOR_SKUS`), `src/data/navigatorData.js`, `sampleData.js` | Superseded by JSON configurators; retire rather than extract. |
| Admin/ops surfaces | `/admin/*` pages, `adminAuth`, `adminSalesDashboard`, `shopifySync*Dashboard`, `customerWorkspace`, `pricingImportDashboard` services | Operational tooling for this storefront's launch. Revisit only if a second storefront needs the same ops console. |
| Internal demos | `src/components/showcase`, `effects`, `src/pages/team44` | Not product code. |
| React contexts | `src/context/*` (11 localStorage-backed providers) | Deliberately thin state wiring that delegates to `src/domain`. They move only if/when Commerce UI extraction needs them; the domain logic they wrap moves first. |

## Target package topology

Single repository, npm workspaces (`packages/*` + the existing app), consumed as source through the existing Vite pipeline. No registry publishing and no separate repos until a second storefront actually exists — a package with one consumer earns none of the costs of versioned publishing.

```
@tfrs/contracts             types + zod schemas (deps: zod)
        ↑
@tfrs/configurator-engine   pure engine + definition schema/loader contract
@tfrs/pricing-engine        pricing + dealer contract resolution
@tfrs/catalog-kernel        catalog domain/service + generic loader/validator machinery
@tfrs/fleet-domain          fleet builds/projects/standards/upfit/quote/procurement/recommendations
        ↑
@tfrs/commerce-kernel       cart, checkout preparation, quote lifecycle services + their ports
        ↑
@tfrs/shopify-integration   all shopify* adapters/services + ingest scripts
------------------------------------------------------------------
@tfrs/design-tokens         palette, typography, spacing (brand-injectable)
@tfrs/ui-primitives         shadcn/Radix kit + cn
@tfrs/commerce-ui           props-driven commerce components (consumes tokens + primitives)
------------------------------------------------------------------
apps/tfrsupply              pages, routing, contexts, Base44 glue, brand config, catalog content
```

Dependency rules carry over from today's architecture: packages above the line never import React except the three UI packages; nothing imports an app; `@tfrs/contracts` sits at the bottom; adapters implement ports that the owning kernel package defines.

## Boundary fixes required before any extraction

Each is a small, behavior-preserving PR, verifiable with the existing test suites (`tests/*.test.mjs`), and valuable even if extraction never happens:

1. **Invert port ownership.** Service factories import `interface XAdapter` from `src/adapters/x` today, so the arrow points service→adapter. Move each port interface (plus its `unavailable*` null-object) into the service folder; adapter folders keep only implementations. Without this, every kernel package would drag its adapter folder along.
2. **Fix the one true layering violation:** `src/adapters/pricing/livePricingAdapter.ts` imports `dealerContractResolutionService` from `src/services` — an adapter importing a service. Invert to injected dependency.
3. **Inject the vertical resolver.** Replace the three `@/data/vehicles/vehicleMaster` imports in `src/domain/fleetBuilds` and `src/domain/recommendations` with a `resolveVerticalId` function parameter (defaulted at the service/context layer).
4. ~~Give `src/domain/configuration` an `index.ts` barrel — the only domain module without one.~~ **Moot (#321):** `src/domain/configuration` was dead code and has been deleted; there is nothing to add a barrel to. Whatever configurator-engine extraction work replaces this item should target `ConfiguratorModule.tsx` instead (see the "Configurator engine" classification above, marked "Needs re-assessment").
5. **Route `commerceLookupService`'s direct `shopify-variant-index.json` import through a typed loader/adapter**, matching every other data access.
6. **Externalize environment reads.** `shopifyStorefrontConfig` (and the live catalog adapter) read `import.meta.env` directly; accept a config object with the current behavior as default.
7. **Introduce a design-token module** (`src/styles/tokens`) and migrate components off the 75 hardcoded `#c8102e`/inline-font instances opportunistically. This is the long pole for UI extraction and can proceed file-by-file indefinitely.
8. **Add dependency-boundary lint rules** (e.g. `eslint-plugin-boundaries` or `no-restricted-imports` patterns) encoding the rules review currently enforces by hand: domain never imports data/adapters/services; adapters never import services; components never import adapters. This converts the migration's invariants from convention to CI.

## Phased migration plan

Phases are gated by **Launch Commerce milestones, not dates**. The standing rules:

- **Rule 1 — the launch path is frozen for restructuring.** No file moves, renames, or port inversions in `shopify*`, `commerce`, `cartWorkspace`, `checkoutPreparation`, or `shopifyVariantResolver` modules until Launch Commerce is live and stable. Fixes 1–2 above apply to these modules only in Phase 3.
- **Rule 2 — every extraction PR is behavior-preserving and green on the existing 67+ test suites** before and after, with no runtime output diff expected.
- **Rule 3 — a shared package is created only when its contents are stable** (not under active launch iteration) — extraction races nothing.

### Phase 0 — Guardrails (now, parallel to Launch Commerce)

Documentation and lint only; zero runtime change.

- Adopt this document; align new issues to the shared/storefront classification above.
- Land boundary lint rules (fix 8) in warn mode, then error mode module-by-module.
- New code rule: no new imports from `src/data` or `src/config` inside `src/domain`/`src/services` (the injection seams above are the pattern to copy).

**Exit criteria:** lint boundaries enforced in CI; no new coupling introduced by launch work.

### Phase 1 — Seams (parallel to Launch Commerce, off the critical path)

Apply boundary fixes 3–7 and fix 1 (port inversion) for **non-Shopify, non-launch modules only** (pricing, quote lifecycle, packageBuilder, vehicleFitment, catalog). Begin the token migration with newly-touched files. Small PRs, each independently revertible.

**Exit criteria:** `src/domain` has zero `src/data` imports; ports for non-launch services live with their services; tokens module exists.

### Phase 2 — Workspace layout + first packages (first quiet window at/after Launch Commerce code-freeze lift)

- Convert the repo to npm workspaces: `apps/tfrsupply` + `packages/*`. Keep the `@/` alias for app code; packages get real names resolved by Vite (`resolve.alias` + workspace linking) so the Base44 build/deploy pipeline and the `ssrLoadModule`-based test harness keep working unchanged.
- Extract the leaf, stable, pure packages first: `@tfrs/contracts`, `@tfrs/configurator-engine`, `@tfrs/pricing-engine`, `@tfrs/catalog-kernel`, `@tfrs/fleet-domain`. These are the modules Launch Commerce consumes read-only, so moving them cannot race launch iteration; coordinate the configurator-engine move with a short merge-freeze window since the configurator feeds add-to-cart.
- Split test files along package lines as modules move (the per-feature test naming already matches the module taxonomy).

**Exit criteria:** app builds and deploys exactly as before; extracted packages have their own `package.json`, barrel-only public APIs, and colocated tests.

### Phase 3 — Commerce kernel and Shopify integration (post-launch stabilization)

Only after Launch Commerce is live and its adapters have stopped churning:

- Apply port inversion (fix 1) and the adapter→service fix (fix 2) to the commerce/Shopify modules.
- Extract `@tfrs/commerce-kernel`, then `@tfrs/shopify-integration` (including the two ingest scripts, which become package bins).
- The storefront app now composes kernels + Shopify adapters + Base44 adapters through its existing config seam.

**Exit criteria:** `src/services` and `src/adapters` in the app contain only Base44/brand-specific code; all commerce orchestration is package-sourced.

### Phase 4 — UI system and the second-storefront proof

- Finish the token migration; extract `@tfrs/design-tokens` and `@tfrs/ui-primitives`, then `@tfrs/commerce-ui` (cart, fleet quote, procurement, templates — the already props-driven folders), and finally the configurator UI.
- Bootstrap a pilot second storefront under `apps/` consuming only packages + its own content directory. Every place the pilot needs to fork package code is a boundary bug — fix the package, not the fork.
- Only after the pilot proves reuse, decide whether registry publishing or repo splitting buys anything; default is to stay a source-linked monorepo.

**Exit criteria:** a second storefront runs from shared packages with zero copied platform code; TFRSupply-specific code is content, config, Base44 glue, and page composition.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Extraction competes with Launch Commerce attention | Rules 1–3; Phases 0–1 are deliberately small, off-path PRs; Phases 2–4 are milestone-gated behind launch. |
| Workspace conversion breaks the Base44 build/deploy or the Vite-SSR test harness | Phase 2 keeps consumption source-linked through Vite aliases — no package build step, no resolution change visible to the harness; convert in a single PR with a full smoke pass. |
| Token migration stalls (75 files) | It gates only the UI packages (Phase 4), never the kernels; migrate opportunistically from Phase 1 onward. |
| Fleet taxonomy (12 categories, 7 build styles) too TFRS-shaped for reuse | Ship as package defaults; make them data-overridable when the second storefront demands it — not before. |
| Premature generalization with one consumer | No registry publishing, no repo split, and no speculative configurability until the Phase 4 pilot exists. |

## Non-goals

This architecture does not introduce a backend, replace Base44, change the Shopify integration strategy, add micro-frontends, publish packages to a registry, split repositories, or alter any current runtime behavior. It also does not reorganize `docs/` — per-domain foundation docs continue to own their boundaries and move alongside their code when packages extract.
