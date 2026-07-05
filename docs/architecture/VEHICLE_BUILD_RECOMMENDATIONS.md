# Vehicle Build Recommendations Engine

## Purpose

The Vehicle Build Recommendations Engine is a deterministic, rules-based scoring layer that helps a customer choose the right products for their active vehicle build, department standard, and Guided Upfit Builder step. It is **not** AI, **not** an LLM feature, and **not** a Shopify live integration — it is a pure, synchronous domain module (`src/domain/recommendations/`) that scores existing catalog `Product`s against existing `FleetBuild`/`DepartmentStandard`/Guided Upfit Builder state using fixed, documented weights, and surfaces the ranked result as a small, shared "recommendation card" reused across five existing surfaces (Guided Upfit Builder, Finish Your Upfit, Product Detail, Product Search, and Workspace).

No catalog, fitment, or fleet-build logic is duplicated: the engine reuses `classifyProductUpfitCategory`, `getFilledUpfitCategories`, `getBuildStyleDefinition`, `resolveCatalogVerticalId`, `resolveRelatedProducts`, and `evaluateFleetBuildIntelligence` exactly as they exist today (`FLEET_INTELLIGENCE.md`, `GUIDED_UPFIT_BUILDER.md`) rather than re-deriving any of them.

## Reused foundations

| Piece | What it does | Touched? |
| --- | --- | --- |
| `classifyProductUpfitCategory` (`src/domain/fleetBuilds/upfitCategories.ts`) | Maps a product to one of the 12 upfit categories | Untouched — the engine's sole "what category is this product" signal |
| `getFilledUpfitCategories` (`src/domain/fleetBuilds/completion.ts`) | Which categories already have a selected product | Untouched |
| `getBuildStyleDefinition` / `BUILD_STYLES` (`src/domain/fleetBuilds/buildStyles.ts`) | A build style's guidance-only priority categories | Untouched |
| `resolveCatalogVerticalId` (`src/data/vehicles/vehicleMaster.ts`) | Maps a build vehicle's display vertical to a catalog vertical id | Untouched — the same vertical-level compatibility signal `addProductToAllCompatibleBuilds` already uses |
| `evaluateFleetBuildIntelligence` / `resolveEffectiveStandard` (`src/domain/departmentStandards/`) | Tiered required/recommended/optional scoring against a Department Standard | Untouched |
| `resolveRelatedProducts` (`src/domain/catalog/relatedProducts.ts`) | `product.commerce.related_products`, then same-category catalog products | Untouched — reused by both the build-scoring engine (as a "related to a selection" signal) and Product Detail's new companion/upgrade split |
| `FleetBuildsContext` / `FleetProjectContext` / `DepartmentStandardsContext` / `UpfitBuilderContext` | Active build, project, standard, guided step | Untouched — read only, composed at each call site exactly as `WorkspaceDashboard`/`FinishYourUpfitPanel` already do |
| `catalogService` | Product reads | Untouched |

No new persistence, no new `localStorage` key, no adapter, and no async I/O — every function in `src/domain/recommendations/` is synchronous and takes already-loaded data.

## The scoring engine

`scoreProductForBuild(product, context)` (`src/domain/recommendations/scoreProduct.ts`) is the pure, per-product scoring function. `context` is:

```ts
interface RecommendationScoringContext {
  build?: FleetBuild | null;
  standard?: DepartmentStandard | null;
  currentStepCategoryId?: UpfitCategoryId | null;
  relatedProductIds?: string[];
  relatedProductsReasonLabel?: string;
}
```

Every signal below is **independent and additive** — a product can fire more than one at once (e.g. a product that fills a missing required category *and* matches the current guided step scores both bonuses; a product that fills a missing category *and* whose category is part of the assigned standard also scores both, since "is required by the standard" and "is currently the gap" are different facts). Weights are centralized in `src/domain/recommendations/scoringWeights.ts`:

| Reason code | Points | Fires when |
| --- | --- | --- |
| `fills_required_category` | **+50** | The product's category is a Department Standard `required` category with no product selected yet |
| `matches_guided_step` | **+40** | The product's category matches the Guided Upfit Builder's current step |
| `matches_department_standard` | **+30** | The product's category appears in the effective Department Standard, at any tier (required/recommended/optional), independent of whether it's currently missing |
| `fills_recommended_category` | **+25** | The category is a Department Standard `recommended` category with no product selected yet |
| `matches_build_style` | **+20** | The category is one of the active Build Style's guidance-only priority categories |
| `compatible_with_vehicle` | **+20** | The product's catalog verticals include the build vehicle's vertical (`resolveCatalogVerticalId`) |
| `fills_optional_category` | **+10** | The category is a Department Standard `optional` category with no product selected yet |
| `related_to_selected_product` | **+10** | The product is related (`commerce.related_products`) to a product already selected in this build |
| `already_selected` | **−100** | The product is already selected anywhere in this build |
| `incompatible_with_vehicle` | **−100** | The product's catalog verticals don't include the build vehicle's vertical |

With no Department Standard assigned, a category's tier is derived from the active Build Style's priority categories (`recommended`, never `required` — mirroring `buildGuidedUpfitChecklist`'s existing fallback convention, since nothing is a hard gate without an explicit standard).

`scoreProductForBuild` returns a `ProductRecommendationScore` (`src/types/recommendations.ts`): `productId`, `score`, `reasonCodes`, human-readable `reasons`, `matchingCategoryId`, `matchingDepartmentStandardId`, `matchingBuildStyleId`, `compatibilityStatus` (`'compatible' | 'incompatible' | 'unknown'`), and a `recommendationType`.

### Recommendation types

`recommendationType` is resolved deterministically, in priority order:

1. **`required`** — fills a currently-missing required category.
2. **`replacement`** — the category already has a product, but that selection is flagged `incompatible` (from a clone/apply-template re-evaluation, `FLEET_TEMPLATES_AND_CLONING.md`) and this candidate is vehicle-compatible.
3. **`recommended`** — fills a currently-missing recommended category, or matches the current guided step.
4. **`upgrade`** — related to a selection already in the build, in the **same** (already-filled) category — an alternative/upgrade for that slot.
5. **`companion`** — related to a selection already in the build, in a **different** category.
6. **`optional`** — fills a currently-missing optional category.
7. Fallback: **`recommended`** — a product with a positive score from vehicle-compatibility/build-style signals alone, with no category-gap or relationship signal.

### Ranking

`generateRecommendations(products, context, { limit, excludeProductIds })` (`src/domain/recommendations/generateRecommendations.ts`) scores every candidate, then **excludes** anything already selected in the build or flagged `incompatible` — regardless of whether other positive signals pushed its raw score above zero — before sorting the remainder highest-score-first and assigning `rank` starting at 1. This is the one function every integration surface below calls.

`resolveRelatedProductIdsForBuild(build, { getProduct })` (`src/domain/recommendations/buildContext.ts`) resolves the `relatedProductIds` a caller threads into `context`: it walks every product already selected in the build and collects `commerce.related_products` from each — the same relationship field `resolveRelatedProducts` reads, not a second relationship source.

`resolveRecommendationProducts(recommendations, getProduct)` pairs each ranked recommendation with its resolved catalog `Product`, silently dropping any id that no longer resolves — the same tolerance Compare/Saved Products/Recently Viewed already apply.

## Product Detail's companion/upgrade split

Product Detail's "recommended for"/"required by" (`getStandardsForProduct`) are untouched — this feature does not duplicate that engine. It adds `groupProductRelationships(product, deps, { limit, excludeProductIds })` (`src/domain/recommendations/productRelationships.ts`), which reuses `resolveRelatedProducts` and `classifyProductUpfitCategory` to split a product's related products into:

- **Companions** — a related product in a **different** upfit category (pairs well without replacing anything).
- **Upgrades/Alternatives** — a related product in the **same** upfit category (a swap-in option).

This is a lighter, product-relationship-oriented split — distinct from `scoreProductForBuild`'s build-selection-oriented `upgrade`/`companion` classification — because Product Detail has no build-fill context to compare against; it only knows the viewed product's own category.

## Workspace summary

`summarizeRecommendedNextActions(entries, products, deps, { limitPerBuild, limitBuilds })` (`src/domain/recommendations/workspaceSummary.ts`) is the Workspace-level rollup: for each `{ build, standard }` entry (the same shape `summarizeFleetHealth` already takes), it computes the build's missing required categories (`evaluateFleetBuildIntelligence`, only meaningful once a standard is assigned) and its top `generateRecommendations` results. A build is omitted once it has no required gap **and** nothing worth recommending, so a fully-equipped or style-only build doesn't clutter the list; the rest are sorted most-urgent-first (most missing required categories) and capped.

## Integrations

### Guided Upfit Builder

`GuidedUpfitBuilderPage.jsx` computes `generateRecommendations` for the active category step (`context.currentStepCategoryId = currentStepId`) and passes the resolved `{ recommendation, product }` pairs to `UpfitBuilderCategoryStep`. The step panel renders a "Recommended Products" grid of `RecommendationCard`s (product name, category, priority badge, reasons, "Add to This Build," "View Product") when recommendations exist, falling back to the pre-existing free-text "Suggested Products" grid (`resolveSuggestedProductsForCategory`) when the engine has nothing positive to score — the same graceful degradation every sibling feature documents for this thin sample catalog. The "Browse More {category} Products" link (`resolveUpfitBrowseHref`) is unchanged.

### Finish Your Upfit panel

`FinishYourUpfitPanel` gains a new "Recommended Products for This Build" block (`src/components/fleetBuilds/FinishYourUpfitPanel.jsx`) — up to 3 scored `RecommendationCard`s reflecting the active build's current gaps, using the current guided step (when the build has one) as an additional signal. This is distinct from `DepartmentStandardStatus`'s pre-existing "Recommended Next Products" category-name list (Feature 4, `FLEET_INTELLIGENCE.md`), which is untouched.

### Product Detail (Product Intelligence)

`ProductIntelligencePanel` gains two additive sections after the existing "Commonly Installed With": **Companion Products** and **Upgrade / Alternative Products** (`groupProductRelationships`, excluding anything already shown in "Commonly Installed With" so the same product doesn't render twice). "Recommended For"/"Required By"/"Department Standards" are unchanged.

### Product Search

When a fleet build is active, `ProductSearchPage` shows a "Recommended for Your Build" section (`RecommendationCard` grid) above the regular results grid — using the active build's Department Standard, Build Style, and (via the Guided Upfit Builder's `upfitCategory` query param, when present) the current guided step. This section is purely additive: it never filters, reorders, or otherwise changes the `products` grid or the free-text search itself.

### Workspace

`/workspace` gains a **Recommended Next Actions** section (`RecommendedNextActionsSection`, composed directly after `WorkspaceFleetIntelligenceSection`) — for each build needing attention: its missing required categories, its top recommended products (`RecommendationCard`, "Add to Build"), and a "Continue in Guided Builder"/"Open Fleet Builds" CTA. Each recommendation card's "View Product" link is the CTA into Product Detail. Matches the section's sibling empty-state convention (a message, not disappearing) when there are no fleet builds yet or nothing is currently outstanding.

## UI

`RecommendationCard`/`RecommendationCardGrid` (`src/components/recommendations/RecommendationCard.jsx`) is the one compact card every surface above renders: product name, category, a `recommendationType` priority badge (Required/Recommended/Optional/Replacement/Companion/Upgrade), the human-readable `reasons` list, a "View Product" link, and an "Add to Build" button (omitted when the caller passes no `onAddToBuild`). `RecommendationCardGrid` stacks to a single column on mobile (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), and every tap target is at least 44px tall — no new design language, no redesign of any existing surface.

## Non-goals

No AI/ML, no LLM, no external recommendation service, no Shopify Storefront/live integration, no checkout or pricing changes, no admin features, no CRM, no authentication, and no backend persistence — every function in `src/domain/recommendations/` is a pure, synchronous, client-side rule over data that is already loaded (catalog, `FleetBuild`, `DepartmentStandard`, Guided Upfit Builder state). No new catalog/product data model, and no new `localStorage` key.

## Known Limitations

- **Thin sample catalog.** As with every sibling fleet feature, the 5-product/1-category sample catalog means many category/vehicle combinations legitimately score nothing — every integration surface degrades gracefully to its pre-existing fallback (free-text Suggested Products, an empty-state note) rather than showing a broken or empty-looking recommendation panel.
- **Vertical-level compatibility only.** `compatible_with_vehicle`/`incompatible_with_vehicle` compare catalog verticals (Police/Work Truck/Fire), the same signal `addProductToAllCompatibleBuilds` already uses — not year/make/model-level fitment. The Vehicle Fitment Service (`VEHICLE_FITMENT_SERVICE.md`) remains intentionally unwired (`unavailableVehicleFitmentAdapter`), so this engine does not depend on it.
- **Additive scoring can double-count a category's relevance.** `matches_department_standard` (+30) and a `fills_missing_*_category` bonus can both fire for the same category — this is intentional (they represent "is relevant to this standard" and "is currently the gap" as separate facts), not a bug; see the scoring table above.
- **No cross-session learning.** Scores are recomputed from scratch on every render from current build/catalog state — there is no history, click-through weighting, or personalization of any kind.

## Testing

`tests/vehicle-build-recommendations.test.mjs` covers: every documented scoring weight; reason generation and independent/additive signal stacking; missing required/recommended/optional category scoring; guided-step scoring; build-style scoring; vehicle compatibility (compatible/incompatible/unknown); the already-selected and incompatible penalties, including that `generateRecommendations` excludes both regardless of overall score; companion/upgrade/replacement recommendation-type classification; ranking/rank assignment and limit capping; `resolveRelatedProductIdsForBuild`; `groupProductRelationships` (companion/upgrade split, exclusion, empty-data degradation); `resolveRecommendationProducts`'s unresolved-id tolerance; `summarizeRecommendedNextActions` (surfacing, omission, most-urgent-first sort, cap); fixture-driven rendering of `RecommendationCard`/`RecommendationCardGrid` (including the 44px tap target and mobile-safe grid classes), `UpfitBuilderCategoryStep`'s recommendation-panel/fallback split, `FinishYourUpfitPanelView`'s new section, `ProductIntelligencePanelView`'s companion/upgrade sections, `ProductSearchPage`'s additive "Recommended for Your Build" section (build active vs. not, results grid untouched), and `RecommendedNextActionsSection`'s empty/populated states; and source-level wiring checks confirming each integration point calls into `src/domain/recommendations/`.
