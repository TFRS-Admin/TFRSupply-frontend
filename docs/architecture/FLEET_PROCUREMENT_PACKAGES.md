# Fleet Procurement Packages

## Purpose

Fleet Procurement Packages is the customer's purchasing workspace, at `/procurement`, where an entire Fleet Project becomes a set of named, procurement-ready packages — "Patrol," "Supervisor," "SWAT," "K9," "Fire Command," "Unassigned Vehicles," and so on. **This is not ordering.** There is no checkout, no pricing, no PDF generation, and no backend. It is a read-only aggregation and grouping layer over the existing Fleet Projects/Fleet Builds/Fleet Templates/Department Standards/Fleet Completion Engine/Guided Upfit Builder/Vehicle Build Recommendations Engine/Fleet Quote Builder foundations — the same Fleet Build selections `/project-quote` already reads, grouped into purchasing packages instead of one project-wide quote.

## Reused foundations

| Piece | What it does | Touched? |
| --- | --- | --- |
| `FleetProjectContext` / `useFleetProject()` | Active Fleet Project | Untouched — read only |
| `FleetBuildsContext` / `useFleetBuilds()` | Project-scoped builds, `addProductToBuild` | Untouched — read/called only |
| `DepartmentStandardsContext` / `useDepartmentStandards()` | Default + company standards | Untouched — read only |
| `resolveEffectiveStandard` (`src/domain/departmentStandards`) | Resolves a build's effective Department Standard | Untouched — the grouping key every package is built from |
| `buildFleetQuoteEntries` (`src/domain/fleetQuote`, `FLEET_QUOTE_BUILDER.md`) | Resolves each build's effective standard + Guided Upfit Builder checklist once | Untouched — the exact same `FleetQuoteBuildEntry[]` `/project-quote` computes is this feature's own starting point |
| `summarizeFleetHealth` (`src/domain/departmentStandards`, `FLEET_INTELLIGENCE.md`) | Vehicle-count-weighted completion rollup | Untouched — reused per-package instead of project-wide |
| `groupQuoteItems`, `buildMissingEquipmentReport`, `aggregateVehicleQuote`, `buildExportPreview` (`src/domain/fleetQuote`) | Grouped equipment, missing-equipment report, per-vehicle recommendations, export-preview de-duplication | Untouched — every one is called with a package's entries instead of a whole project's |
| `generateRecommendations` / `resolveRecommendationProducts` (`src/domain/recommendations`) | Scored product recommendations for a build's gaps | Untouched — reused (via `aggregateVehicleQuote`) for each package's Recommended Additions |
| `RecommendationCard` / `RecommendationCardGrid`, `FleetBuildCompletionBadge`, `QuoteStat` (`src/components/fleetQuote/QuoteStat.jsx`) | Shared presentational components | Reused as-is — no duplicate stat/badge components |
| `catalogService` | Product reads | Untouched |

No fleet, catalog, completion, tier, or recommendation logic is duplicated — every Fleet Procurement Packages function composes the pieces above. The only genuinely new domain logic is the department-standard **grouping** (turning one project's builds into named packages) and **duplicate-configuration detection** (see below).

## Architecture

```text
ProcurementPage (/procurement)
  buildFleetQuoteEntries(builds, project, companyStandards)     — same call /project-quote makes
    └─ groupFleetQuoteEntriesIntoPackages(entries)               — NEW: groups by effective standard id
         └─ aggregatePackageSummary(group, deps) × N packages   — Package Summary block
              ├─ groupQuoteItems (fleetQuote)                    → equipmentCount
              ├─ summarizeFleetHealth (departmentStandards)      → vehicleCount, completionPercent
              ├─ detectDuplicateConfigurations                  — NEW: same-vehicle+style build pairs
              ├─ resolvePackageReadiness                          — NEW: Ready/Minor Issues/Needs Review/Blocked
              ├─ buildMissingEquipmentReport (fleetQuote)        → missingEquipment
              └─ aggregateVehicleQuote × build + dedupeRecommendedAdditions → recommendedAdditions
         └─ buildPackageContents(group)                          — NEW: Vehicle Types/Products/tiered Equipment
         └─ buildProcurementExportPreview(...)                   — calls fleetQuote's buildExportPreview directly
  selectPackagesForComparison(packages, selectedIds)              — Package Comparison
  summarizeProcurementPackages(packages)                          — Package Count/Ready/Minor Issues/Needs Review/Blocked
```

All of `src/domain/procurementPackages/` is pure, synchronous, and side-effect-free, mirroring `src/domain/fleetQuote/` — no new `localStorage` key and no dedicated Zod schema (consistent with every sibling fleet-feature domain, none of which validate their client-side-only contracts with schemas either).

## Grouping Model

`groupFleetQuoteEntriesIntoPackages(entries)` (`src/domain/procurementPackages/grouping.ts`) is the one new grouping rule the whole feature is built on: it buckets each already-resolved `FleetQuoteBuildEntry` by its effective Department Standard's **id** (not its display name — two distinct standards that happen to share a name, e.g. a company-standard clone still named "Patrol," become two distinct packages, since they are different records that could diverge later). Builds with no effective standard fall into one shared `'unassigned'` package (`UNASSIGNED_PACKAGE_ID`/`UNASSIGNED_PACKAGE_NAME = 'Unassigned Vehicles'`) rather than being dropped — a package with no Department Standard still needs a procurement decision made about it. Packages are sorted alphabetically by name, with Unassigned always last.

This is why the objective's example package names (Patrol Vehicles, Supervisor Vehicles, Traffic Division, Motor Unit, SWAT, K9, Fire Command, Public Works, Utilities, DOT) map onto the *existing* 12 Department Standards (`src/domain/departmentStandards/defaultStandards.ts`) rather than a new taxonomy — no new department/package vocabulary is introduced. A package's name is simply its Department Standard's `name`.

## Package Summary

`aggregatePackageSummary(group, deps)` (`src/domain/procurementPackages/packageSummary.ts`) composes one `ProcurementPackage` (`src/types/procurementPackages.ts`) per group:

- **Package Name** / **Department** — the group's standard name (same value, both fields — a package's name and its department are the same thing by construction).
- **Vehicles** — `summarizeFleetHealth`'s `vehicleCount` (sum of `build.quantity` across the package).
- **Equipment Count** — `groupQuoteItems(entries).length`, i.e. distinct equipment line items across the package, mirroring `ProjectQuoteTotals.totalLineItems`'s existing convention.
- **Completion** — `summarizeFleetHealth`'s vehicle-count-weighted `overallCompletionPercent`.
- **Readiness** — see below.
- **Missing Equipment** — `buildMissingEquipmentReport(entries)`, the exact same `MissingEquipmentReport` shape `/project-quote` renders, scoped to this package's builds.
- **Recommended Additions** — every build's `aggregateVehicleQuote(...).recommendedAdditions`, merged and de-duplicated by product id (`dedupeRecommendedAdditions`, capped at 5) — the same de-duplication rule `buildExportPreview` already applies project-wide, reused per package.

## Package Contents

`buildPackageContents(group)` (`src/domain/procurementPackages/packageContents.ts`) is the "Expand to display" data:

- **Vehicle Types** — one row per Fleet Build (vehicle label, build style label, quantity).
- **Products** / **Grouped Quantities** — `groupQuoteItems(entries)` again, this time rendered as a full product/category/quantity/vehicle-count table rather than just a count.
- **Required / Recommended / Optional Equipment** — every category from the package's Guided Upfit Builder checklist tier list, annotated with a package-wide `status`: `complete` (every build in the package has it filled), `partial` (some do), or `missing` (none do), plus which build ids are already equipped. Tier is read from the **first** entry's already-computed checklist — every build in a package shares the same effective Department Standard (the grouping key), so tier is identical across every entry when a standard is assigned. The Unassigned package is the one documented exception: with no standard, each build falls back to its own build style's priority categories (see `guidedChecklist.ts`'s `resolveCategoryTier`), which can differ build-to-build — reading only the first entry's tier there is a deliberate simplification (see Known Limitations).

## Package Readiness

`resolvePackageReadiness(entries, duplicateConfigurations)` (`src/domain/procurementPackages/packageReadiness.ts`) is deterministic — no probability model, no AI — mirroring `resolveQuoteReadiness`'s "collect every applicable reason, then decide a level in a fixed priority order" structure, with the level set specified by this feature (`ready` / `minor_issues` / `needs_review` / `blocked`, distinct from Fleet Quote Builder's `ready` / `minor_issues` / `incomplete` / `blocked`):

1. No builds in the package, a build missing a vehicle assignment, or any missing required equipment → **Blocked** — nothing to procure yet, or the package isn't specified enough to procure.
2. A duplicate vehicle configuration detected, or any build with no Department Standard assigned → **Needs Review** — a human judgment call is needed (is this really two vehicles, does this package need a standard).
3. Missing recommended equipment, or any build under 100% completion → **Minor Issues**.
4. Otherwise → **Ready**.

### Duplicate Configuration Detection

`detectDuplicateConfigurations(builds)` (`src/domain/procurementPackages/duplicateConfigurations.ts`) is the one genuinely new rule this feature introduces: two or more Fleet Builds within the same package sharing the same vehicle (year/make/model) **and** build style are flagged as a likely accidental duplicate entry — never merged, never removed, only surfaced as a Needs Review reason and in each package's `duplicateConfigurations` list. Builds with no vehicle assigned yet are excluded (that's already reported separately as a Blocked reason, and isn't a meaningful duplicate signature).

## Package Comparison

`selectPackagesForComparison(packages, selectedIds)` (`src/domain/procurementPackages/comparison.ts`) is a pure filter — it resolves whichever packages the customer checked "Compare" on their summary card (capped at `MAX_COMPARISON_PACKAGES = 4`, mirroring `MAX_COMPARE_PRODUCTS`'s existing convention) into an ordered list for `PackageComparisonSection`'s side-by-side table (Vehicles, Equipment, Completion, Readiness, Recommendations, Missing Equipment). No new comparison scoring is introduced — every compared value is already on `ProcurementPackage`.

## Export Preview

`buildProcurementExportPreview(input)` (`src/domain/procurementPackages/exportPreview.ts`) assembles one package's read-only export document (Department, Package Summary, Vehicle Summary, Equipment, Missing Equipment, Recommendations, Procurement Notes) by calling `src/domain/fleetQuote/exportPreview.ts`'s `buildExportPreview` **directly** — its recommendation de-duplication (by product id, capped at 8) is reused rather than re-implemented, with only the field names remapped to this feature's vocabulary (`packageName`/`equipment`/`procurementNotes` instead of `projectName`/`equipmentSummary`/`quoteNotes`). Preview only: no PDF generation, no backend call. Procurement Notes are session-only component state (keyed per package id on `ProcurementPage`), exactly like `/project-quote`'s Quote Notes — refreshing the page clears them, since no new persistence layer is introduced.

## Integration Points

- **`/procurement`** (`src/pages/ProcurementPage.jsx`) — the full workspace described above: a summary bar (Package Count/Ready/Minor Issues/Needs Review/Blocked), one expandable `PackageSummaryCard` per package (Package Contents, Recommended Additions, and a per-package Export Preview toggle inside), and a `PackageComparisonSection`. Split into a pure `ProcurementPageView` and a connected default export, matching `ProjectQuotePageView`/`WorkspaceDashboardView`'s convention.
- **Workspace** (`/workspace`) — `ProcurementPackagesWorkspaceSection` (`src/components/procurementPackages/ProcurementPackagesWorkspaceSection.jsx`), composed directly after `ProjectQuoteWorkspaceSection` and before `FleetBuildsWorkspaceSection`: Package Count, Ready Packages, Blocked Packages, and an "Open Procurement Workspace" link into `/procurement`.
- **Project Quote** (`/project-quote`) — a "Generate Procurement Package" button in the page header, shown whenever a Fleet Project is active, linking to `/procurement`. Unlike the Guided Upfit Builder's "Generate Project Quote" button, this is **not** gated behind a readiness threshold — `/procurement` itself handles every state gracefully (including an entirely-Unassigned project), so there is no minimum readiness required to open it. No PDF, no checkout, no backend.
- **Product Detail** (`FinishYourUpfitPanel`) — an "Included In Procurement Package — {package name}" / "Not Included" status directly under the existing quote-inclusion block, computed by `resolveProductPackageInclusion(builds, product.id, activeProject, companyStandards)`. This calls `resolveProductQuoteInclusion` (Fleet Quote Builder) for the underlying build/category lookup, then resolves that one build's effective standard to name the package — no new selection state. "Add to Package" reuses the existing "Add to Active Build" handler; "Remove from Package" calls the existing `removeProductFromBuild(buildId, categoryId, productId)` against whichever build actually has it — the exact same context actions the quote-inclusion block already uses, since a procurement package is a grouping over the same build selections, not a separate purchasing cart.

## Non-goals

No pricing, tax calculation, checkout, live PDF generation, email delivery, backend persistence, authentication, CRM, or admin surface. No new upfit-category taxonomy, no new department/package naming vocabulary (every package is named after an existing Department Standard), no new completion/tier scoring rule (every percent/tier/status is read from the existing Fleet Completion Engine and Guided Upfit Builder checklist), and no new recommendation engine (every recommendation is read from `generateRecommendations`/`aggregateVehicleQuote`).

## Known Limitations

- **"Add to Package" targets the package's first build.** A package can span multiple Fleet Builds; `ProcurementPage`'s "Add to Package" action on a Recommended Addition adds the product to `pkg.buildIds[0]` (the first build grouped into that package), matching the granularity of a package-level recommendation. To target a specific vehicle spec, add the product from that build's own Vehicle Summary card on `/project-quote`, or from Product Detail's "Add to Active Build."
- **The Unassigned package's tier reporting is a simplification.** `buildPackageContents` reads Required/Recommended/Optional Equipment tier from the package's first entry. With a Department Standard assigned, this is exact (every build in the package shares the same standard). Without one (the Unassigned package), each build's tier instead falls back to its own build style's priority categories, which can differ build-to-build — the first entry's tier is used as a representative sample rather than resolving each category per-build.
- **Duplicate detection is vehicle+style only.** `detectDuplicateConfigurations` does not compare selected products — two builds with the same vehicle/style but genuinely different equipment are still flagged, on the theory that a human should confirm that's intentional rather than an accidental duplicate entry, matching this feature's "review before procuring" wording.
- **Quantity vs. separate builds.** As with Fleet Quote Builder, a customer representing "40 identical Patrol Explorers" as one `FleetBuild` with `quantity: 40` behaves identically to representing it as several builds — Package Summary's `vehicleCount` sums `quantity` either way. Multiple separate builds with the *same* vehicle+style are exactly what duplicate-configuration detection is designed to flag for review.
- **No pricing anywhere.** "Equipment Count" and every other count on this page are line-item/unit counts, never dollar amounts, matching every sibling fleet feature's no-pricing convention.
- **Thin sample catalog.** As with every sibling fleet feature, `generateRecommendations` can legitimately return nothing for a given package/category combination when the sample catalog has no matching product — "Recommended Additions" degrades gracefully rather than showing an error.

## Testing

`tests/fleet-procurement-packages.test.mjs` covers: `groupFleetQuoteEntriesIntoPackages` (grouping by standard id, the Unassigned bucket, alphabetical + Unassigned-last sorting, two same-named-but-distinct standards staying separate); `detectDuplicateConfigurations` (matching vehicle+style, differing style, no-vehicle exclusion, single-build no-op); `resolvePackageReadiness`'s full rule table (blocked ×2, needs_review ×2, minor_issues, ready); `aggregatePackageSummary`'s full composition and its recommended-additions de-duplication across builds; `buildProcurementPackages`'s grouping+aggregation entry point; `buildPackageContents` (vehicle types, grouped products, partial/complete tier status); `summarizeProcurementPackages`'s counts; `selectPackagesForComparison`'s order-preserving, missing-id-tolerant filter; `buildProcurementExportPreview`'s field remapping and reuse of `buildExportPreview`'s de-duplication; `resolveProductPackageInclusion` (included/unassigned-package/not-included); a 25-build (`MAX_FLEET_BUILDS`) two-package large-fleet aggregation smoke test; empty-project states; fixture-driven rendering of every `src/components/procurementPackages/*` component (including empty/collapsed states); the Project Quote page's "Generate Procurement Package" link (shown/hidden by `hasActiveProject`) and its source-level wiring; the Product Detail package-inclusion block (included/not-included/no-active-project) and its source-level wiring; `WorkspaceDashboard.jsx`'s composition of `ProcurementPackagesWorkspaceSection`; and `App.jsx`'s `/procurement` route mount.

As with every other `localStorage`-backed fleet feature (see `docs/migrations/TESTING_NOTES.md`), real click-driven mutation (expand/collapse, the Compare checkboxes, the Export Preview toggle, Add/Remove to Package) is not exercised by an automated test — only the underlying aggregation and initial-render layers are. This was additionally verified end-to-end in a running dev server with a headless browser at desktop, tablet, and mobile viewports (see the PR description for the verification checklist).
