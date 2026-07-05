# Fleet Vehicle Shopping Modes

## Purpose

Fleet Vehicle Shopping Modes turns the existing single-vehicle selector into a two-tab shopping control so a customer can either shop one vehicle (unchanged) or plan upfits across a small fleet of vehicle builds. This is composition and net-new client-side state, not a new service layer or catalog: every product read goes through the existing `catalogService`, and every build lives only in `localStorage`. It is customer-facing ecommerce, not CRM, admin, backend, or a live Shopify integration.

## Two Tabs

`VehicleSelectorModal` (`src/components/navigator/VehicleSelectorModal.jsx`) is now a tab shell around two panels in `src/components/fleetBuilds/`:

| Tab | Component | Behavior |
| --- | --- | --- |
| Shop by Vehicle | `ShopByVehiclePanel.jsx` | The pre-existing year/make/model selection against the global `VehicleContext`, extracted unchanged (same selects, same Confirm/Clear actions, same `selectedVehicle` shape) plus one additive "Currently shopping for…" summary line when a vehicle is already selected. |
| Fleet Builds | `FleetBuildsPanel.jsx` | The new fleet build workspace — add/switch/remove/rename builds, and edit each build's vehicle, quantity, and build style via `FleetBuildCard`. |

Every existing call site (`SiteHeader`, `WorkspaceDashboard`, `ConfiguratorModule`, `VehicleConfigurationSummary`) keeps working unchanged via the `onClose`-only API. `initialTab` is a new, optional prop (default `'shop'`) so new entry points (Finish Your Upfit, the Workspace Fleet Builds section) can deep-link straight into the Fleet Builds tab. The modal widened from 500px to a `calc(100% - 32px)`/max 640px shell with an internal scroll region; the existing `.vehicle-selector-modal` mobile CSS override in `src/styles/mobileStorefront.css` still clamps it to the viewport width on small screens.

`src/data/vehicles/vehicleMaster.ts` extracts the `VEHICLE_MASTER` list (with `vehicleId`/`vertical` per entry) and its cascading year/make/model helper functions out of `VehicleSelectorModal.jsx`, so both tabs share one vehicle dataset instead of duplicating it — no vehicle data changed.

## Fleet Build State

`FleetBuildsContext` (`src/context/FleetBuildsContext.jsx`) holds a list of builds and an active build id, persisted to `localStorage` (`tfr_fleet_builds`), mirroring `CompareContext`/`SavedProductsContext`'s pattern. It is mounted once in `App.jsx` alongside the other customer-facing providers. Every add/remove/rename/vehicle/quantity/style/completion decision is delegated to pure functions in `src/domain/fleetBuilds/` (`fleetBuildRules.ts`, `completion.ts`, `addToAllCompatibleBuilds.ts`) so they are unit-testable without a `localStorage`-backed context — the context only owns React state wiring, id/timestamp generation, and persistence. A build is:

```ts
{ id, name, vehicle: FleetBuildVehicle | null, quantity, buildStyle: FleetBuildStyleId | null,
  selections: Partial<Record<UpfitCategoryId, { productId, label, addedAt }[]>>, createdAt }
```

`FleetBuildVehicle` is a lightweight, per-build shape (`vehicleId?`, `year`, `make`, `model`, `vertical?`) — intentionally distinct from both the global `VehicleContext` selection (each build has its own vehicle) and the strict `Vehicle` fitment type, the same way `VehicleContext` itself already stores a lightweight shape rather than the strict fitment contract (see `FitmentSummary`'s `toFitmentVehicle`, `PRODUCT_DETAIL_EXPERIENCE.md`). `MAX_FLEET_BUILDS = 25` keeps the workspace a "small fleet build workspace," not an unbounded list.

## Upfit Categories and Build Styles

`src/domain/fleetBuilds/upfitCategories.ts` defines the 12 fixed upfit categories (Roof/Interior/Perimeter Lighting, Siren, Speaker, Push Bumper, Console, Partition, Rear Warning, Scene Lighting, Graphics/Markings, Accessories) and `classifyProductUpfitCategory(product)` — a deterministic classifier over existing catalog metadata only (catalog category id via `CATALOG_CATEGORY_TO_UPFIT`, then an ordered keyword scan over title/label/subtitle/product family/marketing features). It returns `null` when nothing matches; no new product database or field is introduced.

`src/domain/fleetBuilds/buildStyles.ts` defines the 7 build styles and the upfit categories each one prioritizes:

| Style | Priority categories |
| --- | --- |
| Patrol | Roof Lighting, Siren, Speaker, Console |
| Slicktop | Perimeter Lighting, Interior Lighting, Siren, Speaker, Console (no Roof Lighting) |
| Supervisor | Interior Lighting, Perimeter Lighting, Accessories |
| Traffic Enforcement | Rear Warning, Roof Lighting, Accessories |
| Pursuit | Roof Lighting, Siren, Push Bumper, Console |
| Fire Command | Interior Lighting, Siren, Scene Lighting |
| Work Truck | Roof Lighting, Scene Lighting, Accessories |

These priority lists are **guidance, not a hard dependency gate** — a build's completion percentage and "missing categories" are measured against them, but a customer can add any product to any build regardless of style.

## Completion

`calculateFleetBuildCompletion(build)` (`src/domain/fleetBuilds/completion.ts`) computes `percent`/`color`/`missingCategories`/`selectedCategories`/`suggestedNextCategories` against the build's style's priority categories, or the full 12-category list before a style is chosen. `color` is `red` at 0%, `yellow` between 0–100%, `green` at 100%. `selectedCategories` reflects every category with at least one product — including ones outside the style's priority list — so a customer's real selections are always visible; only the percentage calculation is scoped to the priority set, keeping the guidance non-blocking. `getFilledUpfitCategories` (the "does this category have a product" check this function uses internally) is also exported, so Fleet Intelligence & Department Standards' completion engine (`FLEET_INTELLIGENCE.md`) can reuse it rather than re-deriving fill state.

This build-style-based completion is independent of, and unchanged by, Department Standards scoring (`FLEET_INTELLIGENCE.md`) — a build can have both a `buildStyle` (driving this badge) and a separately-assigned Department Standard (driving the Fleet Completion Engine's own required/recommended/optional scoring). `FinishYourUpfitPanel` (below) renders both when applicable.

## Add to All Compatible Builds

`AddToAllCompatibleBuildsButton` (`src/components/fleetBuilds/`) adds a product to the matching upfit category on every fleet build whose compatibility can be positively confirmed, via `addProductToAllCompatibleBuilds` (`src/domain/fleetBuilds/addToAllCompatibleBuilds.ts`). It never adds blindly — a build is skipped, not modified, when:

- the product's upfit category can't be classified (`category_undetermined`),
- the build has no vehicle selected yet (`no_vehicle_selected`), or
- the product's catalog `verticalIds` don't include the build vehicle's vertical (`vertical_mismatch`), resolved via `resolveCatalogVerticalId` in `src/data/vehicles/vehicleMaster.ts`.

The action is idempotent (re-adding an already-present product is still reported as "added," not duplicated) and surfaces an "added to X builds, skipped Y builds" toast (`summarizeAddToAllResult`, using the existing shadcn `toast()` from `src/components/ui/use-toast.jsx`) with a per-build skip reason. It renders nothing until at least one fleet build exists, so shoppers who haven't opted into fleet mode see no change.

Placement: the product detail commerce action row (`CommerceActionPanel`), the Finish Your Upfit panel, and a `ProductCard` icon overlay reached from Product Discovery, Recommended Products, Recently Viewed, Saved Products, and the Workspace grids (any caller with the full catalog `Product` in hand — see Product Card Threading below). `CategoryTemplate`'s denormalized category-listing cards have no full `Product` record available and so do not render the overlay, the same known gap `CompareToggleButton`/`SaveForLaterButton` already have there.

### Product Card Threading

`ProductCard` gained one additive, optional prop: `product` (the full catalog `Product`), used only by the Add to All overlay — every existing caller that omits it renders exactly as before. `ProductSearchPage.toProductCardViewModel`, and the `toCardProps` helpers in `RecommendedProducts`, `SavedProductsSection`, `RecentlyViewedProducts`, and `WorkspaceDashboard` now include `product` in their returned view-model, since each of them already has the full product in hand before building `ProductCard` props.

## Product Filtering ("Recommended for This Build")

Per the issue's scope, product/category browsing is not gated by fleet build state — `classifyProductUpfitCategory` and the active build's style are available for a future "recommended for this build" treatment on Product Discovery/category pages, but this issue does not add new filtering UI there; it focuses the deterministic classification on the Add to All and Finish Your Upfit surfaces. No existing browsing path is blocked or narrowed.

## Product Detail: Finish Your Upfit

`FinishYourUpfitPanel` (`src/components/fleetBuilds/`), rendered on `ProductDetailTemplate` directly after `FitmentSummary`, shows the active fleet build's name/vehicle/style, its completion badge, missing upfit categories, suggested next categories (the first 3 missing), and three actions: Add to Active Build, Add to All Compatible Builds, and a CTA into the Fleet Builds tab (`initialTab="fleet"`). It renders nothing until at least one fleet build exists. It is split into a pure `FinishYourUpfitPanelView` (props-driven — builds/activeBuild/product, fixture-testable) and a connected default export that reads `useFleetBuilds()`, matching the `ComparePageView`/`RecentlyViewedProductsView` convention used elsewhere. Existing CTA behavior (Configure/Quote/Cart/Contact in `CommerceActionPanel`) is unchanged.

When the active build has an effective Department Standard assigned (Feature 7 of `FLEET_INTELLIGENCE.md`), the panel additionally renders a Department Standard status block underneath this existing grid — Missing Required/Recommended Equipment and Recommended Next Products — layered on top of, not replacing, the build-style completion above. See `FLEET_INTELLIGENCE.md`'s Feature 4 for that block's own logic.

## Project Workspace Integration

`FleetBuildsWorkspaceSection` (`src/components/fleetBuilds/`) is a pure, props-driven section (`builds`, `onOpenFleetBuilds`) rendered on `/workspace` between the summary grid and Saved Products — matching `WorkspaceDashboardView`'s existing convention of resolving context state in the connected `WorkspaceDashboard` wrapper and passing it down, rather than each section reading its own context. It shows every build's name, completion badge/color, vehicle/style/quantity, and missing categories, with an "Open Fleet Builds" CTA. `WorkspaceDashboard`'s single `VehicleSelectorModal` instance is now shared between the "Selected Vehicle" card and this section via one `vehicleModalTab` state (`'shop' | 'fleet' | null`) instead of each managing its own modal.

## State / Storage

Client-side only. `FleetBuildsProvider` persists `{ builds, activeBuildId }` to `localStorage` under `tfr_fleet_builds`, matching `CompareContext`/`SavedProductsContext`/`RecentlyViewedContext`'s existing defensive-parse-on-load pattern (invalid/missing storage silently falls back to an empty workspace; there is no dedicated Zod schema for this shape, consistent with those three sibling features, which also have none). No backend, authentication, or Shopify calls are introduced.

## Non-goals

No Shopify API calls, checkout changes, pricing changes, CRM, admin features, authentication, database, or hard dependency gates are introduced. Build style priority categories are guidance only — no product is ever blocked from being added to any build.

## Known Limitations

- `CategoryTemplate`'s denormalized category-listing cards have no full `Product` record, so the Add to All overlay does not appear there — the same gap `CompareToggleButton`/`SaveForLaterButton` already tolerate on that page.
- The catalog currently contains only `light-bars` products, so `classifyProductUpfitCategory` only resolves real inventory to `roof_lighting` today; the classifier itself is generic and covers all 12 categories (see its fixture-based tests), ready for the catalog to grow into them.
- As with every other `localStorage`-backed customer surface (see `docs/migrations/TESTING_NOTES.md`), the repository's `node --test` + Vite-SSR stack has no DOM/browser `localStorage` layer, so persistence across page loads and click interactions (add/switch/remove build, editing a build's vehicle/quantity/style inline) are not exercised by an automated test — only the underlying domain, resolution, and rendering layers are. This was manually verified in a running dev server at desktop and mobile viewports (see PR description).

## Testing

`tests/fleet-vehicle-shopping-modes.test.mjs` covers: the upfit category classifier (catalog-category precedence, keyword rules for all 12 categories, null-when-undetermined), build style definitions (all 7 styles, Slicktop's roof-lighting exclusion, Patrol/Pursuit's exact priority lists), fleet build CRUD rules (add with `MAX_FLEET_BUILDS` enforcement, remove, active-build resolution on removal, rename trimming/rejection, vehicle/quantity/style updates, product add/dedupe/remove), completion (0%/red, partial/yellow, 100%/green, the guidance-vs-hard-gate distinction, suggested-next capping), Add to All Compatible Builds (category-undetermined/no-vehicle/vertical-mismatch skip reasons, idempotency, mixed-build evaluation), the Shop by Vehicle tab (unchanged rendering), the two-tab `VehicleSelectorModal` (default tab, `initialTab="fleet"` deep link, mobile CSS class), `FleetBuildsPanel`'s empty state, `FleetBuildCard`'s fixture-driven rendering (name/active-state/vehicle/completion/missing/selected categories, mobile-safe grid), `FleetBuildCompletionBadge`'s three colors, `AddToAllCompatibleBuildsButton`'s empty-render guards and result summarizer, the Finish Your Upfit panel's empty/no-active-build/populated states, the Workspace Fleet Builds section, composition wiring (`App.jsx`, `WorkspaceDashboard`, `ProductDetailTemplate`, `CommerceActionPanel`), and mobile-safe responsive grid classes across all new components.

Adding the `product` prop to `ProductCard` and the fleet action to `CommerceActionPanel` required adding `FleetBuildsProvider` to the provider stack in eight existing SSR test files (`recently-viewed-products`, `saved-products`, `homepage-conversion-polish`, `product-comparison-selection`, `product-detail-conversion-polish`, `product-detail-experience`, `product-detail-migration`, `project-workspace`) so their existing `CommerceActionPanel`/`ProductCard`/`WorkspaceDashboard` renders keep working — no assertions in those files changed.
