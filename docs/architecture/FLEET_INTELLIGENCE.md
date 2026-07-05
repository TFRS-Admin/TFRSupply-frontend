# Fleet Intelligence & Department Standards

## Purpose

Fleet Intelligence & Department Standards turns Fleet Projects from a collection of configured vehicles into an intelligent fleet management layer: it actively tells a customer whether a fleet build meets a department's typical equipment standard, what's missing, and how ready the whole fleet is. This is composition and new pure domain modules, not a rewrite — it builds entirely on the existing Fleet Projects/Fleet Builds/Fleet Templates/Catalog Service/Product Detail/Workspace foundations (`FLEET_PROJECTS.md`, `FLEET_VEHICLE_SHOPPING_MODES.md`, `FLEET_TEMPLATES_AND_CLONING.md`, `PROJECT_WORKSPACE.md`, `PRODUCT_DETAIL_EXPERIENCE.md`, `CATALOG_SERVICE.md`). No backend, authentication, Shopify calls, pricing, or AI are introduced.

## Reused foundations

| Piece | What it does | Touched? |
| --- | --- | --- |
| `src/domain/fleetBuilds` (`UpfitCategoryId`, `classifyProductUpfitCategory`, `calculateFleetBuildCompletion`) | The 12-category taxonomy and per-build-style completion scoring | Extended only: `completion.ts` now exports `getFilledUpfitCategories` (the existing "does this category have a product" check, previously a private helper) so the new completion engine reuses it instead of re-deriving it |
| `FleetBuildsContext` / `FleetProjectContext` | Build/project state, `localStorage` persistence | Extended: `FleetBuild.departmentStandardId` and `FleetProject.departmentStandardId` (both optional), plus one new action on each context (`assignDepartmentStandard`) |
| `FleetTemplatesContext`, `src/domain/fleetProjects` (`summarizeFleetProject`) | Templates, per-project rollups | Untouched |
| `WorkspaceDashboard` / `WorkspaceDashboardView` | `/workspace` composition | Extended: two new sections (`WorkspaceFleetIntelligenceSection`, `DepartmentStandardsSection`) and new props threaded from the connected wrapper, following the page's existing "pure View + connected wrapper" convention |
| `FinishYourUpfitPanel` | Product Detail's per-build completion panel | Extended: a new department-standard status block rendered alongside (not instead of) the existing build-style completion columns |
| `FleetBuildCard`, `FleetProjectCard` | Build/project edit cards on the Fleet Builds tab and `/workspace` | Extended: a standard-assignment control and (on `FleetProjectCard`) a Fleet Health block |
| `catalogService`, `resolveRelatedProducts` (new, extracted from `RecommendedProducts`) | Product reads and "related products" resolution | `RecommendedProducts.jsx` refactored (behavior-preserving) to call the extracted `src/domain/catalog/relatedProducts.ts` function so Product Intelligence's "Commonly Installed With" reuses the same logic instead of duplicating it |
| `ProductDetailTemplateView` | Product Detail page composition | Extended: `ProductIntelligencePanel` composed directly after `FinishYourUpfitPanel` |

## Feature 1: Department Standards

`src/types/departmentStandards.ts` defines a `DepartmentStandard`: a name, a description, and three tiers of `UpfitCategoryId`s (`required`, `recommended`, `optional`). `src/domain/departmentStandards/defaultStandards.ts` ships 12 read-only defaults — Patrol, Slicktop, Supervisor, Traffic Enforcement, Pursuit, K9, SWAT, Fire Command, EMS Supervisor, DOT Truck, Utility, Construction — each mapping its equipment onto the **existing** 12 `UpfitCategoryId` values rather than a new taxonomy (see Known Limitations for named equipment concepts, like "Cargo Light," that don't have a dedicated category yet).

Defaults are static data (`isCustom: false`, `id === key`); a customer clones one into an editable "company standard" via `cloneDepartmentStandard` (`src/domain/departmentStandards/standardRules.ts`), which deep-copies its category tiers so editing the clone never mutates the shipped default. `DepartmentStandardsContext` (`src/context/DepartmentStandardsContext.jsx`) persists company standards to `localStorage` under `tfr_department_standards`, mirroring `FleetTemplatesContext`'s clone/rename/delete pattern. `MAX_DEPARTMENT_STANDARDS = 50`.

**Design decision — standards are not Fleet-Project-scoped.** Unlike Fleet Builds/Templates (scoped to the active project via `projectId`), company standards are account-wide: `DepartmentStandardsContext` holds one flat, unscoped list. A "County Patrol Package" a customer builds should be assignable to any project, not recreated per project. This is a deliberate difference from the Fleet Builds/Templates precedent, not an oversight.

**Design decision — Department Standards are a distinct concept from Build Styles.** `src/domain/fleetBuilds/buildStyles.ts`'s 7 `FleetBuildStyleId`s (used for `calculateFleetBuildCompletion`) are a single flat "priority categories" list with no required/recommended/optional distinction and are not user-editable. Department Standards needed three tiers, user cloning, and persistence, which would have meant redesigning Build Styles — forbidden by this feature's scope ("do not replace or redesign existing... Fleet Builds"). The two systems coexist: a build still has a `buildStyle` (drives the existing style-based completion badge) and, independently, an effective Department Standard (drives the new tiered scoring below). Some names overlap (Patrol, Slicktop, Supervisor, Traffic Enforcement, Pursuit, Fire Command) by design — the same real-world department name — but there is no code-level coupling between a `FleetBuildStyleId` and a `DepartmentStandardKey`; a customer picks each independently.

## Feature 2: Fleet Completion Engine

`evaluateFleetBuildIntelligence(build, standard)` (`src/domain/departmentStandards/completionEngine.ts`) is a pure, deterministic function: given a `FleetBuild` and a `DepartmentStandard`, it reuses `getFilledUpfitCategories(build)` to see which categories already have a product, then reports per tier (`requiredInstalled`/`requiredTotal`/`missingRequired`, and the same for `recommended`/`optional`), a weighted `completionPercent` (required 70%, recommended 20%, optional 10%, renormalized when a tier is empty so a standard with no `optional` categories doesn't understate completion), `departmentCompliant` (true iff every required category is filled), and `criticalBlockers` (= `missingRequired`, the categories blocking compliance).

It returns `null` when `standard` is `null` — a build with no standard assigned is not scored by this engine at all; every caller falls back to the existing `calculateFleetBuildCompletion` (build-style scoring) in that case, so introducing this feature never leaves an unassigned build without *some* completion signal.

No products are hardcoded anywhere in this engine — it only ever compares `UpfitCategoryId` sets already produced by the existing `classifyProductUpfitCategory`/`FleetBuild.selections` data.

**Reused by the Guided Vehicle Upfit Builder.** `src/domain/upfitBuilder/guidedChecklist.ts`'s `buildGuidedUpfitChecklist(build, standard, skippedStepIds)` calls `evaluateFleetBuildIntelligence` directly for its per-category tiers, `completionPercent`, and `departmentCompliant` — it does not re-derive or duplicate this engine's scoring, only adds a step-by-step UI and per-build skip-tracking on top. See `GUIDED_UPFIT_BUILDER.md`.

## Assigning a standard (Feature 7)

`FleetBuild.departmentStandardId` and `FleetProject.departmentStandardId` are both optional strings (a default standard's key or a company standard's id). `resolveAssignedStandardId(build, project)` (`src/domain/departmentStandards/standardAssignment.ts`) prefers the build's own assignment, falling back to its project's; `resolveEffectiveStandard` resolves that id into the full record across both defaults and company standards. `AssignStandardControl` (`src/components/departmentStandards/AssignStandardControl.jsx`) is the one `<select>` control reused on both `FleetBuildCard` (assign to an individual build) and `FleetProjectCard` (assign to a project) — assigning at the project level sets every build without its own explicit assignment to inherit it.

## Feature 3 & 6: Fleet Health and Workspace Fleet Intelligence

`summarizeFleetHealth(entries)` (`src/domain/departmentStandards/fleetHealth.ts`), where `entries` is `Array<{ build, standard }>`, is the single rollup function powering both:

- **Feature 6 (`FleetProjectCard`'s Fleet Health block)** — called with one project's builds paired with their effective standards.
- **Feature 3 (`WorkspaceFleetIntelligenceSection`, "Fleet Readiness")** — called with every build across every Fleet Project, for a Command Center-level view.

It buckets each build's `quantity` (vehicle count, mirroring `FleetProjectSummary.vehicleCount`'s existing convention) into `vehiclesReady` (department-compliant), `vehiclesInProgress` (a standard is assigned, not yet compliant, but something is installed), `vehiclesMissingEquipment` (a standard is assigned, nothing installed against it yet), or `vehiclesNeedReview` (no standard assigned at all — this build can't be scored and needs a human to assign one). `overallCompletionPercent` is a simple average of each build's percent (the engine's percent where a standard exists, `calculateFleetBuildCompletion`'s percent as fallback otherwise), mirroring `summarizeFleetProject`'s existing unweighted-average convention. `criticalGaps` aggregates missing-required categories across builds (vehicle-count-weighted), sorted descending, capped at the top 5 — the "3 Vehicles Missing Sirens" style warning.

## Feature 4: Finish Your Upfit expansion

`FinishYourUpfitPanel` keeps its existing build-style-based "Missing Upfit Categories"/"Suggested Next Categories" columns unchanged, and adds a new block underneath (only when the active build has an effective standard): "Department Standard: {name}," Missing Required Equipment, Missing Recommended Equipment, and "Recommended Next Products" — for each of the first 5 missing required/recommended categories, an "Add {category}" action when it matches the current product's own classified category (reusing the existing `onAddToActiveBuild` handler), or a "Browse {category}" link. That link reuses the existing `/search?q=` free-text query (`ProductSearchPage`) rather than introducing a second recommendation engine or a new upfit-category-to-catalog-category mapping.

## Feature 5: Product Intelligence

`ProductIntelligencePanel` (`src/components/product/ProductIntelligencePanel.jsx`), composed onto `ProductDetailTemplateView` directly after `FinishYourUpfitPanel`, shows:

- **Recommended For** / **Required By** — `getStandardsForProduct(product, standards)` (`src/domain/departmentStandards/productIntelligence.ts`) classifies the product into its upfit category via the existing `classifyProductUpfitCategory` and matches it against every standard's tiers (one match per standard, its highest-priority tier). "Required By" is the subset matched at the `required` tier; "Recommended For" is `required` or `recommended` (a product required by one department is also, generally, worth recommending).
- **Department Standards** — the full tier-by-tier match list (every standard referencing this product's category, with its tier badge), a complete reference table beyond the curated Recommended For/Required By lists.
- **Commonly Installed With** — reuses `resolveRelatedProducts` (extracted from `RecommendedProducts.jsx` into `src/domain/catalog/relatedProducts.ts`): `product.commerce.related_products` first, then same-category catalog products. This is the same relationship data `RecommendedProducts` already reads, not a second recommendation engine, per this feature's explicit "no duplicate recommendation engine" requirement.

No AI and no network calls — every field above reads `catalogService` or `DepartmentStandardsContext` synchronously.

## Feature 8: Workspace Command Center

The existing `/workspace` page already composed Fleet Projects, Fleet Builds, Fleet Templates, Saved Products, Recently Viewed, Compare Queue, Cart Summary, and a Quote Builder shortcut (`PROJECT_WORKSPACE.md`, `FLEET_PROJECTS.md`, `FLEET_TEMPLATES_AND_CLONING.md`). This feature adds `WorkspaceFleetIntelligenceSection` ("Fleet Readiness" — the account-wide rollup above) at the top, directly under the summary card grid and above the Fleet Projects section, and `DepartmentStandardsSection` (the standards library — browse defaults, clone into company standards, edit tiers) after the Fleet Projects section. No existing section was removed, reordered beyond this insertion, or redesigned — this is additive hierarchy only, per this feature's explicit "no redesign" instruction.

## State / Storage

Two new `localStorage` keys, both following the existing defensive-parse-on-load pattern (invalid/missing storage silently falls back to an empty list; there is no dedicated Zod schema, consistent with the sibling Fleet Builds/Templates/Projects contexts, which also have none):

- `tfr_department_standards` — the company standards array (`DepartmentStandardsContext`).
- No new key for assignment — `departmentStandardId` is stored inline on the existing `tfr_fleet_builds`/`tfr_fleet_projects` records.

## Non-goals

No backend, authentication, Shopify calls, checkout, pricing/quote changes, CRM, admin surface, or AI/ML ranking. No new upfit-category taxonomy — every standard's required/recommended/optional tiers are built from the existing 12 `UpfitCategoryId` values. No change to `calculateFleetBuildCompletion`'s existing build-style scoring — the new engine is additive, not a replacement.

## Known Limitations

- **Category granularity.** The example department packages in this feature's source issue name equipment (Cargo Light, Gun Lock, ALPR, Camera Systems) that have no dedicated `UpfitCategoryId` yet; the shipped default standards map these onto the closest existing category (usually `accessories`). If the catalog grows dedicated products for these, a follow-up issue should add dedicated categories to `src/domain/fleetBuilds/upfitCategories.ts` rather than continuing to overload `accessories`.
- **"Browse" links are free-text, not category-mapped.** There is no reverse mapping from `UpfitCategoryId` back to a browsable catalog `Category` (the forward mapping in `classifyProductUpfitCategory` is intentionally lossy/many-to-one). "Browse {category label}" links reuse `/search?q=` free-text search rather than a precise category filter.
- **`localStorage`-only persistence.** As with every other fleet feature, there is no automated test coverage for persistence across page loads or for real click-driven mutation (React SSR `useState` setters are no-ops after `renderToString` — see `docs/migrations/TESTING_NOTES.md`); mutation behavior is covered at the pure-domain-function level, and rendering is covered against fixtures.
- **No Configurator integration.** `ConfiguratorExperience`/`ConfiguratorModule` (`CONFIGURATOR_EXPERIENCE.md`) are untouched — Department Standards and Product Intelligence are surfaced on Product Detail and Fleet Builds/Workspace, not inside the configurator flow itself.

## Testing

`tests/fleet-intelligence.test.mjs` covers: the 12 default standards' shape and category validity, company-standard clone/rename/delete/category-tier-edit domain rules (including that shipped defaults are never mutated), standard assignment resolution (build overrides project, cross-project resolution of the same company standard), the Fleet Completion Engine (no standard, partial completion, 100% completion, an empty required tier), `summarizeFleetHealth` (no builds, no standards assigned, a realistic ready/in-progress/missing/needs-review mix, 100% completion, capped/sorted critical gaps, cross-project aggregation), Product Intelligence's standard matching, and fixture-driven rendering of every new/changed component (`WorkspaceFleetIntelligenceSection`, `DepartmentStandardsSection`, `AssignStandardControl`, `DepartmentStandardBadge`, `ProductIntelligencePanelView`, `FinishYourUpfitPanelView`'s standard-status block, `FleetBuildCard`'s assignment control, `FleetProjectCard`'s Fleet Health block), including mobile-safe responsive grid classes. `tests/fleet-projects.test.mjs`, `tests/fleet-templates-vehicle-cloning.test.mjs`, `tests/fleet-vehicle-shopping-modes.test.mjs`, `tests/project-workspace.test.mjs`, `tests/product-detail-experience.test.mjs`, `tests/product-detail-migration.test.mjs`, and `tests/product-detail-conversion-polish.test.mjs` all had `DepartmentStandardsProvider` added to their `renderWithProviders` provider stacks (matching `src/App.jsx`'s nesting) so their existing connected-component renders keep working.
