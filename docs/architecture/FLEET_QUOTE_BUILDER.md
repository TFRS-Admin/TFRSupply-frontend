# Fleet Quote Builder

## Purpose

The Fleet Quote Builder is the customer-facing workflow, at `/project-quote`, that turns an entire Fleet Project into a professional quote package: a project summary, a vehicle-by-vehicle equipment breakdown, automatically-grouped quote line items, project-wide totals, a missing-equipment report, and a read-only export preview. It is **not** a new quote system — it is a read-only aggregation layer over the existing Fleet Projects/Fleet Builds/Fleet Templates/Fleet Intelligence & Department Standards/Guided Upfit Builder/Vehicle Build Recommendations Engine foundations. No backend, authentication, Shopify calls, pricing, taxes, checkout, or PDF generation are introduced.

## Reused foundations

| Piece | What it does | Touched? |
| --- | --- | --- |
| `FleetProjectContext` / `useFleetProject()` | Active Fleet Project, metadata | Untouched — read only |
| `FleetBuildsContext` / `useFleetBuilds()` | Project-scoped builds, `addProductToBuild`/`removeProductFromBuild` | Untouched — read/called only |
| `DepartmentStandardsContext` / `useDepartmentStandards()` | Default + company standards | Untouched — read only |
| `resolveEffectiveStandard` (`src/domain/departmentStandards`) | Resolves a build's effective Department Standard | Untouched |
| `buildGuidedUpfitChecklist` (`src/domain/upfitBuilder`, `GUIDED_UPFIT_BUILDER.md`) | Per-category tier (required/recommended/optional), status (complete/missing), and overall completion percent for one build | Untouched — the single source every Fleet Quote Builder aggregation function reads for "what's installed/missing" |
| `summarizeFleetHealth` (`src/domain/departmentStandards`, `FLEET_INTELLIGENCE.md`) | Vehicle-count-weighted fleet readiness rollup | Untouched — reused for the Project Summary's Fleet Health/vehicle count/completion percent |
| `summarizeFleetProject` (`src/domain/fleetProjects`) | Project-level `lastModified` timestamp | Untouched — reused for the Project Summary's Last Updated field |
| `generateRecommendations`/`resolveRecommendationProducts`/`resolveRelatedProductIdsForBuild` (`src/domain/recommendations`, `VEHICLE_BUILD_RECOMMENDATIONS.md`) | Scored product recommendations for a build's gaps | Untouched — powers each Vehicle Summary card's "Recommended Additions" and the Export Preview's "Recommendations" section |
| `RecommendationCard`/`RecommendationCardGrid` | Shared recommendation card UI | Reused as-is inside an expanded Vehicle Summary card |
| `FleetBuildCompletionBadge` | Shared completion pill + bar | Reused as-is on the Project Summary and Vehicle Summary cards |
| `catalogService` | Product reads | Untouched |

No fleet, catalog, completion, or recommendation logic is duplicated — every Fleet Quote Builder function composes the outputs above.

## Architecture

```text
ProjectQuotePage (/project-quote)
  └─ buildFleetQuoteEntries(builds, project, companyStandards)   — resolves standard + checklist once per build
       ├─ aggregateProjectQuote        → Project Summary block
       ├─ aggregateVehicleQuote (×N)   → Vehicle Summary cards
       ├─ buildVehicleQuoteSections    → Quote Items (per-vehicle sections)
       ├─ groupQuoteItems              → Quote Items (grouped equipment table) + Project Totals input
       ├─ calculateProjectTotals       → Project Totals
       ├─ buildMissingEquipmentReport  → Missing Equipment Report
       └─ buildExportPreview           → Export Preview
```

All of `src/domain/fleetQuote/` is pure, synchronous, and side-effect-free — every function takes already-loaded `FleetBuild`/`DepartmentStandard`/`Product` data and returns a plain object, mirroring `src/domain/departmentStandards/fleetHealth.ts` and `src/domain/recommendations/workspaceSummary.ts`. There is no new `localStorage` key and no dedicated Zod schema — this matches every sibling fleet-feature domain (`fleetBuilds`, `fleetProjects`, `departmentStandards`, `recommendations`, `upfitBuilder`), none of which validate their client-side-only contracts with schemas either.

`FleetQuoteBuildEntry` (`src/types/fleetQuote.ts`) — `{ build, standard, checklist }` — is the one shape every aggregation function is built on, resolved once by `buildFleetQuoteEntries()` per page render (or per `/workspace`/`/upfit-builder` render that needs it) rather than re-resolved by each function.

## Aggregation Model

- **Project Summary** (`aggregateProjectQuote`) — Project Name, Department (`resolveProjectDepartmentLabel`: the one shared Department Standard name across every build, `"Mixed"` when builds disagree, `"Not Assigned"` with none), Fleet Health (`summarizeFleetHealth`'s color, one of Needs Attention/In Progress/On Track), Vehicle Count, Completion % (`summarizeFleetHealth`'s vehicle-count-weighted average), Quote Status (`resolveQuoteReadiness`), and Last Updated (`summarizeFleetProject`'s `lastModified`).
- **Vehicle Summary** (`aggregateVehicleQuote`, one per Fleet Build) — vehicle, department standard, completion, quantity, "Estimated Equipment Count" (distinct selected products × `build.quantity`, the same formula `FleetProjectSummary.estimatedProductCount` already uses, just per-build instead of project-wide), missing required/recommended category labels, and a `recommendationStatus` (`fully_equipped` | `has_recommendations` | `no_recommendations`). Expanding a card reveals Installed Products, Missing Products (every checklist step not `complete`, with its tier), and Recommended Additions (`generateRecommendations`, capped at 5).
- **Quote Items** — two views over the same builds, not two data sources:
  - `buildVehicleQuoteSections` — one section per Fleet Build, labeled `"{Model} {Build Style} x{quantity}"` (e.g. "Explorer Patrol x18"), listing its selected products grouped by upfit category — the literal "Roof Bars / Sirens / Consoles / …" example.
  - `groupQuoteItems` — "group identical equipment together": one line per distinct product **across the whole project**. `quantity` is the total physical units required (`Σ build.quantity` over every Fleet Build that selected it); `vehicleCount` is how many **distinct** Fleet Builds (vehicle specs) selected it. The two only diverge when the same product appears in more than one Fleet Build (e.g. the same siren used in both a Patrol and a Supervisor build) — in the common case of one build per product, they're equal. This is a documented design decision, not an accident: "Quantity" answers "how many total units," "Vehicle Count" answers "how many different vehicle specs use this."
- **Project Totals** (`calculateProjectTotals`) — Total Vehicles (`Σ build.quantity`), Total Line Items (`groupQuoteItems(...).length`), Total Equipment Pieces (`Σ group.quantity`), Completion % (`summarizeFleetHealth`'s overall percent), Required/Recommended Equipment Remaining (vehicle-count-weighted: missing-category count × `build.quantity`, summed across builds — mirroring `summarizeFleetHealth`'s `criticalGaps` convention so "3 required items remaining" reflects vehicles, not just builds). No pricing, no taxes.
- **Missing Equipment Report** (`buildMissingEquipmentReport`) — every checklist step not `complete`, split into `critical`/`recommended`/`optional` (by tier) and, separately, grouped by `byVehicle`/`byDepartmentStandard`/`byCategory` — two views of the same flat entry list, not three independent computations.
- **Export Preview** (`buildExportPreview`) — assembles Department, Project, Vehicle Summary, Equipment Summary, Missing Equipment, and a deduplicated, capped (8) Recommendations list from already-computed pieces, plus a `quoteNotes` string the caller supplies. Preview only: no PDF rendering, no backend call, no persistence. Quote Notes live in the page's own React state — refreshing the page clears them, since no new persistence layer is introduced by this feature (see Known Limitations).

## Readiness Model

`resolveQuoteReadiness(hasActiveProject, entries)` (`src/domain/fleetQuote/quoteReadiness.ts`) is deterministic — no probability model, no AI — and evaluates in a fixed priority order:

1. No active Fleet Project → **Blocked** ("No active Fleet Project selected.").
2. An active project with zero Fleet Builds → **Blocked** ("No vehicles have been added to this project yet.").
3. Otherwise, tally: builds missing a vehicle assignment, builds missing a Department Standard, missing-required-category count (from each entry's checklist), missing-recommended-category count, and builds under 100% completion.
4. Any missing required equipment, or any build missing a vehicle → **Incomplete**.
5. No required gaps, but some build has no standard, some recommended equipment is missing, or some build is under 100% → **Minor Issues**.
6. Otherwise → **Ready**.

Each level carries a human-readable `reasons` list (e.g. "2 required equipment items missing across the fleet.") surfaced on the Project Summary card, the Workspace Project Quote card, and nowhere else. `meetsProjectQuoteReadinessThreshold(readiness)` checks membership in `PROJECT_QUOTE_READY_LEVELS = ['ready', 'minor_issues']` — the Guided Upfit Builder's "Generate Project Quote" button threshold. This list is the one place to edit if the threshold needs to change; it is not hardcoded inline in any page.

## Integration Points

- **`/project-quote`** (`src/pages/ProjectQuotePage.jsx`) — the full workspace described above. Split into a pure `ProjectQuotePageView` and a connected default export, matching `WorkspaceDashboardView`/`GuidedUpfitBuilderPageView`'s convention.
- **Workspace** (`/workspace`) — `ProjectQuoteWorkspaceSection` (`src/components/fleetQuote/ProjectQuoteWorkspaceSection.jsx`), composed directly after `GuidedUpfitBuilderWorkspaceSection` and before `FleetBuildsWorkspaceSection`: the active project's Quote Status badge, outstanding required/recommended counts, and an "Open Project Quote" link into `/project-quote`.
- **Guided Upfit Builder** (`/upfit-builder`) — the Review step (`UpfitBuilderReviewStep`) gains a "Generate Project Quote" button, next to "Continue to Cart"/"Request a Quote", shown only when `meetsProjectQuoteReadinessThreshold` passes for the active project (computed in `GuidedUpfitBuilderPage.jsx` from the same `buildFleetQuoteEntries` every other integration point uses).
- **Product Detail** (`FinishYourUpfitPanel`) — an "Included In Quote — {build name}" / "Not Yet Included" status directly under the Guided Build status block, computed by `resolveProductQuoteInclusion(builds, product.id)` (scans every build in the active project, not just the active one). "Add to Quote" reuses the existing "Add to Active Build" handler (`addProductToActiveBuild`); "Remove from Quote" calls the existing `removeProductFromBuild(buildId, categoryId, productId)` against whichever build actually has it. No new cart or quote state — this is the existing Fleet Build selection state, read and mutated through the existing context actions.
- **Fleet Procurement Packages** (`/procurement`, `FLEET_PROCUREMENT_PACKAGES.md`) — `buildFleetQuoteEntries` is this feature's own starting point too: `groupFleetQuoteEntriesIntoPackages` buckets the same `FleetQuoteBuildEntry[]` by effective Department Standard into named purchasing packages, and every per-package aggregation (`groupQuoteItems`, `buildMissingEquipmentReport`, `aggregateVehicleQuote`, `buildExportPreview`) is this doc's own function called with a package's entries instead of the whole project's. `/project-quote`'s header also gains a "Generate Procurement Package" link into `/procurement`. No quote logic is duplicated by that feature.

## Non-goals

No pricing calculations, tax calculation, checkout, live PDF generation, email delivery, backend persistence, authentication, CRM, or admin surface. No new upfit-category taxonomy, no new completion/tier scoring rule (every tier/status/percent is read from `buildGuidedUpfitChecklist`), and no new recommendation engine (every recommendation is read from `generateRecommendations`).

## Known Limitations

- **Guided Upfit Builder skip state is intentionally ignored.** `buildFleetQuoteEntries` always calls `buildGuidedUpfitChecklist(build, standard, [])` — an empty skipped-steps list — rather than reading `UpfitBuilderContext`'s per-build skipped optional categories. A category a customer explicitly skipped in the guided flow still reports as outstanding here, since a customer-facing quote should reflect true install state, not an in-progress workflow shortcut.
- **`quantity`/`vehicleCount` can look identical.** As documented above, they only diverge when the same product is selected across more than one Fleet Build. For the common one-build-per-vehicle-spec case, the two numbers match — this is expected, not a bug.
- **Quote Notes are session-only.** The Export Preview's notes textarea is plain React component state; refreshing `/project-quote` clears it. If durable notes are needed, add a `quoteNotes` field to `FleetProject` in a dedicated follow-up rather than reaching into this feature's page state.
- **No pricing anywhere.** "Estimated Equipment Count," "Total Equipment Pieces," and every other count on this page are line-item/unit counts, never dollar amounts — matching `FleetProjectSummary.estimatedProductCount`'s existing no-pricing convention.
- **Thin sample catalog.** As with every sibling fleet feature, `generateRecommendations` can legitimately return nothing for a given build/category combination when the sample catalog has no matching product — "Recommended Additions"/`recommendationStatus: 'no_recommendations'` degrade gracefully rather than showing an error.

## Testing

`tests/fleet-quote-builder.test.mjs` covers: `buildFleetQuoteEntries`'s standard/checklist resolution and skip-state decoupling; `resolveProjectDepartmentLabel` (empty/shared/mixed/unassigned); `resolveQuoteReadiness`'s full rule table (blocked ×2, incomplete ×2, minor_issues ×2, ready) and `meetsProjectQuoteReadinessThreshold`; `aggregateVehicleQuote` (installed/missing products, estimated equipment count, all three `recommendationStatus` values); `aggregateProjectQuote`'s composition of Fleet Health/department label/readiness; `buildVehicleQuoteSections`'s labeling and category grouping; `groupQuoteItems`'s quantity-vs-vehicleCount divergence across two builds sharing a product; `calculateProjectTotals`'s arithmetic (including an all-empty project); `buildMissingEquipmentReport`'s tier split and vehicle/standard/category grouping; `resolveProductQuoteInclusion` (included/not-included/empty-project); `buildExportPreview`'s recommendation de-duplication and notes default; a 25-build (`MAX_FLEET_BUILDS`) large-fleet aggregation smoke test; fixture-driven rendering of every `src/components/fleetQuote/*` component (including empty states); the Guided Upfit Builder's "Generate Project Quote" button (shown/hidden by prop) and source-level wiring of its readiness computation; the Product Detail quote-inclusion block (included/not-included/no-active-project) and its source-level wiring; `WorkspaceDashboard.jsx`'s composition of `ProjectQuoteWorkspaceSection`; and `App.jsx`'s `/project-quote` route mount.

As with every other `localStorage`-backed fleet feature (see `docs/migrations/TESTING_NOTES.md`), real click-driven mutation (Add/Remove to Quote, the Missing Equipment Report's grouping tabs, the Export Preview toggle) is not exercised by an automated test — only the underlying aggregation and initial-render layers are. This was additionally verified end-to-end in a running dev server with a headless browser at desktop, tablet, and mobile viewports (see the PR description for the verification checklist).
