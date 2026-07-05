# Guided Vehicle Upfit Builder

## Purpose

The Guided Vehicle Upfit Builder is a step-by-step wizard at `/upfit-builder` that turns the existing Fleet Projects/Fleet Builds/Fleet Templates/Department Standards/Fleet Completion Engine/Product Intelligence/Vehicle Selector/Configurator/Product Discovery/Cart/Quote foundations into one guided customer workflow: select a Fleet Project, select or create a Fleet Build, select its vehicle, assign a Department Standard, pick a Build Style, work through the 12 upfit categories one at a time, review missing equipment, and hand off to Cart or a Quote request. This is composition and one small new state module, not a new configurator engine, not a backend feature, and not a Shopify live integration.

## Reused foundations

| Piece | What it does | Touched? |
| --- | --- | --- |
| `FleetProjectContext` / `useFleetProject()` | Active Fleet Project, create/switch | Untouched — read only |
| `FleetBuildsContext` / `useFleetBuilds()` | Active Fleet Build, vehicle/style/standard assignment, `addProductToActiveBuild(categoryId, product)`, `removeProductFromBuild` | Untouched — read/called only |
| `DepartmentStandardsContext` / `useDepartmentStandards()` | Default + company standards, `AssignStandardControl` | Untouched — read only, `AssignStandardControl` reused directly on the Select Department Standard step |
| `src/domain/fleetBuilds` (`ALL_UPFIT_CATEGORY_IDS`, `getUpfitCategoryLabel`, `BUILD_STYLES`, `calculateFleetBuildCompletion`, `getFilledUpfitCategories`) | The 12-category taxonomy, build styles, build-style-based completion | Untouched |
| `src/domain/departmentStandards` (`evaluateFleetBuildIntelligence`, `resolveEffectiveStandard`) | The Fleet Completion Engine's tiered required/recommended/optional scoring (`FLEET_INTELLIGENCE.md`) | Untouched — this feature's checklist reuses it directly rather than re-deriving tiers or completion percent |
| `catalogService.searchProducts` | Free-text product search | Untouched — called with a category's label, same as the existing "Browse {category}" links |
| `ProductCard`, `resolveProductDetailPath` | Product card rendering, product detail routing | Untouched |
| `ProductSearchPage` (`/search`) | Product Discovery Foundation's search/browse page | Extended: reads additive `upfitCategory`/`guidedBuild`/`fleetProjectId`/`fleetBuildId` query params to show a "Recommended for this build" banner and a link back to `/upfit-builder`. Never filters results — see `PRODUCT_DISCOVERY.md`. |
| `FinishYourUpfitPanel` (Product Detail) | Active-build completion panel | Extended: a `GuidedBuildStatus` block ("Continue Guided Build," the current guided step, an "Add to This Step" action) — see `PRODUCT_DETAIL_EXPERIENCE.md`. |
| `WorkspaceDashboard` (`/workspace`) | Command Center composition | Extended: `GuidedUpfitBuilderWorkspaceSection` — see `PROJECT_WORKSPACE.md`. |
| `AssignStandardControl`, `StandardTierChip`, `FleetBuildCompletionBadge` | Shared department-standard/completion UI | Reused as-is on the Select Department Standard step and the checklist steps |

No fleet, product, catalog, or configurator logic is duplicated. The wizard's setup stages (project/build/vehicle/standard/style) are thin UI wrapped around mutation callbacks these contexts already expose.

## Upfit Steps — step generation

`buildGuidedUpfitChecklist(build, standard, skippedStepIds)` (`src/domain/upfitBuilder/guidedChecklist.ts`) is a pure function that generates the 12-category checklist for one build:

- **Tier** (`required` / `recommended` / `optional`) comes from the build's effective Department Standard when one is assigned (the same `standard.categories` the Fleet Completion Engine already reads) — a category the standard doesn't mention defaults to `optional`. With no standard assigned, the build's own Build Style's `priorityCategories` (guidance-only, from `src/domain/fleetBuilds/buildStyles.ts`) become `recommended` and everything else `optional` — **no category is ever `required` without an explicit Department Standard**, matching this feature's "no hard dependency gates" non-goal.
- **Status** (`complete` / `missing` / `skipped`) reuses `getFilledUpfitCategories(build)` for "has a product" — a category with at least one selected product is always `complete` regardless of tier. Only `optional`-tier categories can ever report `skipped` (`canSkip: true`); `required`/`recommended` categories are never skippable, so a customer can always see (and act on) what's actually missing.
- **`overallPercent`/`departmentCompliant`** reuse `evaluateFleetBuildIntelligence`'s `completionPercent`/`departmentCompliant` when a standard is assigned, or `calculateFleetBuildCompletion`'s `percent` (with `departmentCompliant: null`) otherwise — the same fallback convention `FinishYourUpfitPanel`'s `DepartmentStandardStatus` block already uses.
- **`missingCopy`** is one of three fixed, tier-appropriate sentences (no per-category custom copy).

The category order is the existing, fixed 12-category taxonomy (`ALL_UPFIT_CATEGORY_IDS`) — Roof Lighting, Interior Lighting, Perimeter Lighting, Siren, Speaker, Push Bumper, Console, Partition, Rear Warning, Scene Lighting, Graphics/Markings, Accessories — not a new taxonomy or a different ordering.

## Guided step sequence

`src/domain/upfitBuilder/stepSequence.ts` defines `UPFIT_BUILDER_STEP_SEQUENCE`: the 5 setup stages (`project`, `build`, `vehicle`, `standard`, `style`), then the 12 upfit categories, then `review` — 18 steps total. `getNextStepId`/`getPreviousStepId` walk the sequence (returning `null` at either end); `resolveDefaultStepId(setupState, skippedStepIds)` resolves where a build should resume when it has no persisted step yet — the first setup stage whose data isn't set (treating an explicitly-skipped `standard` stage as done), or the first upfit-category step once every stage is resolved. `buildUpfitBuilderStepperItems(setupState, checklist, skippedStepIds)` (`src/domain/upfitBuilder/stepperItems.ts`) builds the stepper sidebar's full 18-item list with a status per item; it tolerates `checklist: null` (before a build exists, category steps render as `upcoming` placeholders) so the customer always sees the whole journey ahead, not an empty list.

**Never a hard gate.** Every step's "Continue" button is always clickable (setup steps validate nothing; category steps' button reads "Continue Anyway" until complete) — this mirrors the existing Fleet Build/Department Standard/Build Style non-goal that priority categories/tiers are guidance, never a blocker. Only the stepper sidebar's status icons and the Review step's missing-equipment lists communicate what's outstanding.

**Why the resolved default is persisted immediately.** `GuidedUpfitBuilderPage` persists `resolveDefaultStepId(...)`'s result the moment a build first lands on it (a `useEffect` keyed on the active build id), rather than only on explicit Back/Next/stepper clicks. Without this, `resolveDefaultStepId` — which re-evaluates on every render from live setup-state facts — would silently fast-forward the guided flow past a later, not-yet-persisted step the instant its own data happened to already look complete (e.g., picking a vehicle would jump straight past Department Standard to Build Style if the customer had, coincidentally, already assigned a standard at the project level before that render). Persisting on arrival freezes the step until the customer explicitly navigates.

## Product Discovery integration (Browse CTA)

`resolveUpfitBrowseHref(categoryId, { fleetProjectId, fleetBuildId })` (`src/domain/upfitBuilder/browseRouting.ts`) builds a step's "Browse" link. It reuses the existing free-text `/search?q=` route (there is no reverse `UpfitCategoryId` → catalog `Category` mapping — see `FLEET_INTELLIGENCE.md`'s Known Limitations) and adds four additive query params: `upfitCategory`, `guidedBuild=1`, and (when known) `fleetProjectId`/`fleetBuildId`. These never filter or hard-gate `ProductSearchPage`'s results — they only power a "Recommended for this build" banner and a "Back to Guided Build" link back to `/upfit-builder`, so a customer who wanders off to browse broadly can find their way back.

`resolveSuggestedProductsForCategory(categoryId, { searchProducts }, limit)` (`src/domain/upfitBuilder/suggestedProducts.ts`) resolves each category step's "Suggested Products" grid via the same free-text `catalogService.searchProducts({ query: categoryLabel })` call, following `src/domain/catalog/relatedProducts.ts`'s dependency-injection pattern (the search function is threaded in by the caller, never imported directly, so the domain module stays service-import-free). Because the sample catalog's product titles don't always literally contain a category's label text (e.g. "Siren," "Roof Lighting"), this free-text match can legitimately return zero results for some categories today — the same limitation the pre-existing "Browse {category}" links on `FinishYourUpfitPanel` already have.

## Product Detail integration (Finish Your Upfit panel)

`FinishYourUpfitPanel`'s `GuidedBuildStatus` block reads `useUpfitBuilder().getCurrentStepId(activeBuild.id)` and renders:

- "Continue Guided Build" (or "Start Guided Build" with no progress yet) — a link to `/upfit-builder`.
- "Guided Step: {label}" when a guided step exists.
- "Add to This Step" — only when the current guided step is one of the 12 upfit categories — which calls `addProductToActiveBuild(currentStepId, product)` directly, bypassing `classifyProductUpfitCategory`. This lets a customer force the current product into whichever category the guided flow is on, even if the product's own auto-classified category differs (e.g. adding a light bar to the guided flow's "Siren" step because that's the equipment slot being filled). The panel's existing "Add to Active Build" (auto-classified) and "Add to All Compatible Builds" behavior is unchanged.

## Workspace integration

`GuidedUpfitBuilderWorkspaceSection` (`src/components/upfitBuilder/GuidedUpfitBuilderWorkspaceSection.jsx`), composed onto `/workspace` directly after `DepartmentStandardsSection` and before `FleetBuildsWorkspaceSection`, shows the active Fleet Build's overall guided-completion percent and next recommended step label, with a "Continue Guided Build"/"Start Guided Build" link into `/upfit-builder`. No new persistence — it reads the same `buildGuidedUpfitChecklist`/`getCurrentStepId` the guided builder page itself uses, resolved in `WorkspaceDashboard`'s connected wrapper.

## UI

**Desktop** (`lg:` and up): a three-column layout — `UpfitBuilderStepperSidebar` (every step, clickable, status icons + tier chips), the active step panel (center, flexible width), and `UpfitBuilderSummarySidebar` (project/build/vehicle/style/standard, completion badge, missing-count). Both sidebars are `hidden lg:block`, matching the `WorkspaceButton`/`FleetProjectIndicator` precedent for desktop-only chrome (see `PROJECT_WORKSPACE.md`'s Mobile Layout section).

**Mobile/tablet** (below `lg:`): both sidebars are hidden; `UpfitBuilderMobileProgress` — a sticky top bar showing "Step N of 18: {label}" and a completion bar — replaces the stepper, and the active step panel becomes a single full-width column. No fixed pixel widths are used in the layout; the page was verified to have no horizontal overflow at a 390px viewport in a running dev server (see Testing below). A pre-existing, site-wide header/nav overflow at the 768px tablet breakpoint (present on `/workspace` and `/search` today, not introduced by this feature) is out of scope for this issue.

## State / Storage

One new `localStorage` key, `tfr_upfit_builder` (`UpfitBuilderContext`, `src/context/UpfitBuilderContext.jsx`), following the existing defensive-parse-on-load pattern:

```json
{
  "currentStepByBuildId": { "<fleetBuildId>": "<UpfitBuilderStepId>" },
  "skippedByBuildId": { "<fleetBuildId>": ["<UpfitBuilderStepId>", "..."] }
}
```

Everything else the guided flow reads or writes (active project, active build, vehicle, department standard, build style, category product selections) already persists via `FleetProjectContext`/`FleetBuildsContext`/`DepartmentStandardsContext` — this is the only state this feature adds. No backend and no authentication.

## Out of scope

No Shopify API calls, checkout changes, pricing changes, backend persistence, authentication, CRM, admin features, or hard dependency gates. "Continue to Cart"/"Request a Quote" on the Review step reuse the existing `/cart` route and `mailto:appConfig.quoteRecipientEmail` pattern (`CommerceActionPanel`, `WorkspaceDashboard`'s Quote Builder shortcut) — no new cart or quote logic.

## Known Limitations

- **Free-text suggested products / Browse links can return zero results.** As described above, there is no category-to-catalog mapping; a thin sample catalog whose product titles don't literally contain a category's label (e.g. "Siren") will show "No matching products found" for that step. This is a data/content gap, not a broken search path — verified working end-to-end for categories the catalog does have matching text for (e.g. free-text search for "light").
- **`localStorage`-only persistence.** As with every other fleet feature, there is no automated test coverage for real click-driven mutation (React SSR `useState` setters are no-ops after `renderToString` — see `docs/migrations/TESTING_NOTES.md`); mutation behavior is covered at the pure-domain-function level and the connected read-path is covered by seeding storage before render. This was additionally verified end-to-end in a running dev server with a headless browser (creating a build, selecting a vehicle, skipping Department Standard, picking a Build Style, adding a product from Product Detail via "Add to This Step," and returning to `/upfit-builder` to see it marked complete).
- **No Fleet Template step.** The guided flow does not include an explicit "Apply Template" stage — `FinishYourUpfitPanel`'s existing template controls remain the only place to apply a saved template to a build. A future issue could add a template-selection stage between "Select Vehicle" and "Select Department Standard" if warranted.
- **Pre-existing tablet-width header overflow.** See UI section above — not introduced or fixed by this feature.

## Testing

`tests/guided-upfit-builder.test.mjs` covers: `buildGuidedUpfitChecklist`'s tier resolution (standard-assigned vs. build-style-fallback), completion detection, missing-equipment summary, skip behavior (optional-only, `canSkip`), and reuse of `evaluateFleetBuildIntelligence`'s percent/compliance; the guided step sequence (`UPFIT_BUILDER_STEP_SEQUENCE`, `getNextStepId`/`getPreviousStepId`, `resolveDefaultStepId` including the skipped-standard case) and `buildUpfitBuilderStepperItems` (including its null-checklist fallback); `resolveUpfitBrowseHref`'s query-param construction and `ProductSearchPage`'s guided-build banner (source-level check); `resolveSuggestedProductsForCategory`; fixture-driven rendering of `UpfitBuilderCategoryStep` (missing/complete/skipped states) and `UpfitBuilderReviewStep` (missing lists, skipped list, Cart/Quote CTAs); mobile-safe responsive classes (`hidden lg:block` / `lg:hidden`) and full-page-shell rendering across every step type; `UpfitBuilderContext` active-step/skipped-step persistence via seeded `localStorage`; `FinishYourUpfitPanelView`'s Guided Build status block (Continue/Start Guided Build, Add to This Step gated to category steps only); `GuidedUpfitBuilderWorkspaceSection`'s empty/populated states; and source-level wiring checks confirming `App.jsx` mounts `/upfit-builder` and `UpfitBuilderProvider`, `WorkspaceDashboard.jsx` composes the workspace section, and `FinishYourUpfitPanel.jsx` wires `useUpfitBuilder`.
