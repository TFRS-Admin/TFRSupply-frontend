# Project Workspace

## Purpose

The Project Workspace is a customer-facing dashboard at `/workspace` that lets a customer organize products while planning a vehicle build — saved products, recently viewed items, the compare queue, cart summary, selected vehicle, and an in-progress configuration, all in one place. This is composition, not a new service layer: every section reads from an existing context, hook, or `catalogService.getProduct`, the same read paths `SavedProductsPage`, `ComparePage`, `CartWorkspace`, and the homepage sections already use.

It is **not** a CRM, not authentication, and not a customer account system. No login, no backend, no Shopify calls, no quote changes, no configurator logic changes, and no pricing changes are introduced by this feature.

## Composed Sections

| Section | Reuses |
| --- | --- |
| Selected Vehicle | `useVehicle` (`VehicleContext`), the existing `VehicleSelectorModal` |
| Cart Summary | `useMiniCart` (Cart Workspace Foundation) |
| Compare Queue | `useCompare`/`MAX_COMPARE_PRODUCTS` (`CompareContext`), `catalogService.getProduct` |
| Recent Configurations | `useConfigurator` (`ConfiguratorContext`) — a placeholder read of existing configurator state; no new configuration persistence is introduced |
| Quote Builder shortcut | `appConfig.quoteRecipientEmail` (the same `mailto:` pattern `CommerceActionPanel`/`ComparePage` already use), plus a link to `/cart`'s existing Request Quote action |
| Continue Shopping | A plain `react-router-dom` `Link` to `/search`, matching `CartWorkspace`'s existing "Continue Shopping" link |
| Saved Products | `resolveSavedProducts` (`SavedProductsSection`), `useSavedProducts` (`SavedProductsContext`), `ProductCard` |
| Recently Viewed | `resolveRecentlyViewedProducts` (`RecentlyViewedProducts`), `useRecentlyViewed` (`RecentlyViewedContext`), `ProductCard` |
| Fleet Readiness (`WorkspaceFleetIntelligenceSection`) | `summarizeFleetHealth` (Fleet Intelligence & Department Standards, `FLEET_INTELLIGENCE.md`) across every Fleet Project's builds |
| Department Standards (`DepartmentStandardsSection`) | `useDepartmentStandards` (`DepartmentStandardsContext`) — browse the 12 default standards and any saved company standards, clone/rename/delete/edit tiers |
| Guided Upfit Builder (`GuidedUpfitBuilderWorkspaceSection`) | `buildGuidedUpfitChecklist`/`useUpfitBuilder` (Guided Vehicle Upfit Builder, `GUIDED_UPFIT_BUILDER.md`) — the active Fleet Build's guided-completion percent and next recommended step, with a link into `/upfit-builder` |
| Recommended Next Actions (`RecommendedNextActionsSection`) | `summarizeRecommendedNextActions` (Vehicle Build Recommendations Engine, `VEHICLE_BUILD_RECOMMENDATIONS.md`) — for each fleet build needing attention, its missing required categories plus scored product recommendations, with CTAs into Fleet Builds/the Guided Upfit Builder and each recommendation's product detail page |
| Project Quote (`ProjectQuoteWorkspaceSection`) | `buildFleetQuoteEntries`/`aggregateProjectQuote`/`calculateProjectTotals` (Fleet Quote Builder, `FLEET_QUOTE_BUILDER.md`) — the active Fleet Project's Quote Status badge and outstanding required/recommended equipment counts, with a link into `/project-quote` |
| Procurement Packages (`ProcurementPackagesWorkspaceSection`) | `groupFleetQuoteEntriesIntoPackages`/`aggregatePackageSummary`/`summarizeProcurementPackages` (Fleet Procurement Packages, `FLEET_PROCUREMENT_PACKAGES.md`) — Package Count, Ready Packages, and Blocked Packages across the active Fleet Project's Department-Standard-grouped packages, with a link into `/procurement` |

`src/pages/WorkspaceDashboard.jsx` exports `resolveCompareQueueProducts(productIds, { getProduct })` — a pure id → product resolution for the Compare Queue section, following the same `resolveSavedProducts`/`resolveRecentlyViewedProducts` pattern (drops any id that no longer resolves to a catalog product). It also exports `WorkspaceDashboardView`, a pure presentational component (no context/router required beyond `SiteHeader`'s own dependencies) split from the connected `WorkspaceDashboard` default export, matching the `SavedProductsPageView`/`ComparePageView` convention already used in `src/pages`.

## Placement

- **`/workspace`**: the full dashboard — `WorkspaceDashboard`, routed in `src/App.jsx` inside the same provider nesting (`VehicleProvider`/`CompareProvider`/`RecentlyViewedProvider`/`SavedProductsProvider`/`ConfiguratorProvider`) every other customer route already uses.
- **`/upfit-builder`**: the Guided Vehicle Upfit Builder wizard, a separate route sharing the same provider stack plus `UpfitBuilderProvider` — see `GUIDED_UPFIT_BUILDER.md`.
- **`/project-quote`**: the Fleet Quote Builder — turns the active Fleet Project into a customer-facing quote package, sharing the same provider stack — see `FLEET_QUOTE_BUILDER.md`.
- **`/procurement`**: Fleet Procurement Packages — the customer's purchasing workspace, grouping the active Fleet Project's builds into named, Department-Standard-scoped packages, sharing the same provider stack — see `FLEET_PROCUREMENT_PACKAGES.md`.
- **Header** (`SiteHeader.jsx`): `WorkspaceButton` (`src/components/navigator/WorkspaceButton.jsx`) sits in the header's right-actions cluster, next to the vehicle selector button. It is desktop-only (`hidden md:flex`), matching the vehicle-selector button's existing responsive rule — see Mobile Layout below for why.
- **Mobile drawer** (`MobileNavDrawer.jsx`): a "My Workspace" entry sits directly below the vehicle selector button, wired through a new `onNavigateWorkspace` prop threaded from `SiteHeader`.

Unlike the homepage's Saved Products/Recently Viewed sections (which render `null` when empty), every Project Workspace section always renders with a friendly empty-state message and a "Browse Products" link back to `/search` — a dashboard should show the customer what's available to fill in, not hide itself.

## Mobile Layout

The header's icon row (vehicle selector, saved products, mini cart, "Where to Buy", hamburger) is already at its practical width limit on a 390px viewport. Adding `WorkspaceButton` to that row as a 5th icon overflowed the page horizontally (measured `document.body.scrollWidth` of 415px against a 390px viewport). Rather than shrinking every icon further, `WorkspaceButton` follows the same `hidden md:flex` pattern already used by the vehicle selector button — desktop-only in the icon row, with the mobile off-canvas drawer carrying its own "My Workspace" entry point instead. This was verified with a headless-browser check confirming no horizontal overflow at 390px, both empty and with every section populated.

The dashboard's summary cards use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (single column on mobile, widening on larger breakpoints). The Saved Products/Recently Viewed product grids reuse the existing `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` class already used by `SavedProductsSectionView`/`RecentlyViewedProductsView` elsewhere in the app.

See `FLEET_INTELLIGENCE.md` for the Fleet Readiness and Department Standards sections' own domain logic, state, and testing — this doc only covers their placement on `/workspace`.

## Non-goals

No authentication, no customer accounts, no backend, no Shopify calls, no checkout, no quote submission changes, no configurator engine changes, and no pricing changes are introduced. "Recent Configurations" is an explicit placeholder reading `ConfiguratorContext`'s existing `selectedFamily`/`accessories` state — no new configuration persistence, history, or "resume" mechanism is added. The Quote Builder shortcut is a `mailto:` link and a link to `/cart`, not a new quote-drafting UI — see `QUOTE_BUILDER_FOUNDATION.md` for why no customer-facing quote builder route exists yet.

## Known Limitation

`ConfiguratorContext` (`useConfigurator()`) is a separate, older global store from the newer `ConfiguratorExperience`/`ConfiguratorModule` composition — it is still actively written to by the legacy `FamilyPage`/`NavigatorOptionsModule`/`BuildReview` flow, but not by `ConfiguratorExperience`. The Recent Configurations section only reflects state from that legacy flow; a configuration completed through `ConfiguratorExperience` will not currently appear there. This is an explicit placeholder per the issue's scope, not a bug — see the Future Migration Plan below.

## Future Migration Plan

1. If a "recent configurations" list backed by real persistence is approved, add it as its own foundation (mirroring `RecentlyViewedContext`'s tracked-id/localStorage pattern) rather than expanding `ConfiguratorContext`.
2. Once a customer-facing quote-drafting UI is approved (see `QUOTE_BUILDER_FOUNDATION.md`'s Future Migration Plan), replace the Quote Builder shortcut's `mailto:`/`/cart` link with a real entry point.
3. If Compare Queue removal-in-place is expanded, keep reusing `useCompare().removeFromCompare`/`clearCompare` rather than introducing new compare-selection rules.

## Testing

`tests/project-workspace.test.mjs` covers: `resolveCompareQueueProducts`'s id resolution and missing-id handling, `WorkspaceDashboardView`'s rendering (heading, header, breadcrumb), empty-state messaging across every section when nothing has been saved/viewed/compared/configured/added to cart, section visibility once a vehicle/cart/compare-queue/configuration/saved/recently-viewed item is present, the mobile-safe responsive grid classes, the connected `WorkspaceDashboard`'s integration with the real context/hook stack, `WorkspaceButton`'s render, and source-level wiring checks confirming `App.jsx` mounts the `/workspace` route and `SiteHeader` composes `WorkspaceButton`.

**Known gap**: as with every other `localStorage`-backed or hook-driven customer surface (see `docs/migrations/TESTING_NOTES.md`), the repository's `node --test` + Vite-SSR stack has no DOM/browser `localStorage` layer, so persistence across page loads and click interactions (Change Vehicle, Clear, Remove from Compare) are not exercised by an automated test — only the underlying resolution and rendering layers are. This was manually verified in a running dev server with a headless browser at both desktop (1440px) and mobile (390px) viewports, empty and fully populated, confirming no horizontal overflow and correct section rendering (see PR description).
