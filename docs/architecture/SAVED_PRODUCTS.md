# Save for Later / Saved Products

## Purpose

Save for Later lets a customer bookmark products while browsing and come back to them later without an account — the saved list is client-only, persisted to `localStorage`, and never touches Shopify, auth, or checkout. This is composition, not a new service layer: every rendered field is read through `catalogService.getProduct`, the same read path `CompareTray`/`RecentlyViewedProducts` already use.

## Saved State

`SavedProductsContext` (`src/context/SavedProductsContext.jsx`) holds the saved product ids, most-recently-saved-first, and persists them to `localStorage` (`tfr_saved_products`), mirroring `CompareContext`/`RecentlyViewedContext`'s existing pattern. It is mounted once in `App.jsx`, alongside `VehicleProvider`/`CompareProvider`/`RecentlyViewedProvider`/`ConfiguratorProvider`, so the list survives navigation across the whole site.

The save/unsave/dedupe rules are pure functions in `src/domain/catalog/savedProducts.ts` (`saveProduct`, `unsaveProduct`, `isProductSaved`), pulled out of the context so they are unit-testable without simulating navigation through server-rendered HTML — the same reason `compareSelection.ts`/`recentlyViewed.ts` exist in the same folder. Saving a product prepends its id if not already saved (no duplicates); unsaving removes it. Unlike compare (max 4) and recently viewed (max 8), there is no upper bound on the number of saved products. `SavedProductsContext` only owns React state wiring and `localStorage` persistence; it delegates every selection decision to these pure functions.

## Composed Components

| Component | Renders | Reuses |
| --- | --- | --- |
| `SaveForLaterButton` (`src/components/product/SaveForLaterButton.jsx`) | Save/unsave toggle — `variant="icon"` is the circular overlay on `ProductCard` (top-left, opposite `CompareToggleButton`'s top-right position), `variant="inline"` is the full CTA in `CommerceActionPanel` | `useSavedProducts` |
| `SavedProductsSection` (`src/components/product/SavedProductsSection.jsx`) | Connected "Saved for Later" section — resolves saved ids to products and renders `SavedProductsSectionView` | `useSavedProducts`, `catalogService.getProduct`, `resolveProductDetailPath` |
| `SavedProductsSectionView` | Pure grid presentation (cards, "View All Saved" link, "Clear Saved" action); renders nothing when given an empty product list | `ProductCard` |
| `resolveSavedProducts` | Pure id → product resolution (drops unresolvable ids), exported so it is unit-testable without a localStorage-backed context | — |
| `SavedProductsPage` (`src/pages/SavedProductsPage.jsx`) | `/saved-products` route — full grid of saved products with an empty state and "Clear All" | `SavedProductsPageView`, `resolveSavedProducts`, `ProductCard`, `toProductCardViewModel` (from `ProductSearchPage`) |
| `SavedProductsButton` (`src/components/navigator/SavedProductsButton.jsx`) | Header entry point — heart icon with a saved-count badge, navigates to `/saved-products`, mirroring `MiniCart` | `useSavedProducts` |

`SavedProductsSection`/`SavedProductsSectionView` follow the same connected/pure split as `RecentlyViewedProducts`/`RecentlyViewedProductsView` and `CompareTray`/`CompareTrayView`.

## Placement

- **Product Cards** (`ProductCard.jsx`): a heart icon overlay (`variant="icon"`) toggles save state — only rendered when the card links to a real product (has an `href`), matching `CompareToggleButton`'s existing rule.
- **Product Detail** (`CommerceActionPanel.jsx`): a full "Save for Later" CTA (`variant="inline"`) alongside "Add to Compare" and the other commerce actions.
- **Homepage** (`StoreLandingView`): `SavedProductsSection` renders below `RecentlyViewedProducts`, showing up to 4 saved products with a link to the full `/saved-products` page.
- **Header** (`SiteHeader.jsx`): `SavedProductsButton` sits next to `MiniCart`, always visible (desktop and mobile), showing a saved-item count badge.
- **`/saved-products`**: the full listing page — `SavedProductsPage`.

On the homepage the section is entirely absent (renders `null`) until at least one saved id resolves to a catalog product — no "no items" message is shown, matching the existing empty behavior of `RecentlyViewedProducts`/`CompareTray`. `/saved-products` itself always renders, showing a dedicated empty state (heart icon, "You haven't saved any products yet", and a "Browse Products" CTA) instead of hiding.

## Mobile Layout

`SavedProductsSectionView` uses the same `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` responsive grid as `RecentlyViewedProductsView`. `SavedProductsPageView` reuses the existing `.pd-product-grid` class (already defined in `src/styles/mobileStorefront.css`), which collapses to 2 columns on tablet and 1 column on mobile — the same grid `ProductSearchPage` uses for search results. `SavedProductsButton` gets the same mobile padding/gap treatment as `MiniCart` via the `.saved-products-btn` rule.

## Clear Action

"Clear Saved" (homepage section) and "Clear All" (`/saved-products` page) both call `clearSavedProducts()`, which empties the saved id list and removes the `localStorage` entry — available from any page, since the list is shared through `SavedProductsProvider`.

## Non-goals

No Shopify API calls, no cart/checkout changes, no pricing calculation changes, no authentication, and no customer-account/server-side saved list are introduced by this feature. Saved-product state is client-only (`localStorage`) and is not synced to any account or backend.

## Known Limitation

`catalogService.getProduct()` only resolves products backed by a full record in `src/data/products`. A product id saved while browsing a denormalized category-listing card without a matching product record silently drops out of the saved sections/page once viewed elsewhere — the same gap `CompareTray`/`RecentlyViewedProducts` already tolerate.

## Testing

`tests/saved-products.test.mjs` covers: `saveProduct`/`unsaveProduct`/`isProductSaved`'s save/unsave/dedupe behavior and missing-id no-ops, `resolveSavedProducts`'s id resolution and missing-id handling, `SaveForLaterButton`'s icon/inline variants and its empty render without a `productId`, `ProductCard`'s conditional save overlay, `CommerceActionPanel`'s "Save for Later" action, `SavedProductsSectionView`'s empty-state and populated rendering (including the mobile grid classes and Clear action), `SavedProductsPageView`'s empty state and populated grid with Clear All, and source-level wiring checks confirming `ProductCard`, `CommerceActionPanel`, the homepage, and `App.jsx` all compose the feature.

**Known gap**: as with every other `localStorage`-backed or hook-driven customer surface (see `docs/migrations/TESTING_NOTES.md`), the repository's `node --test` + Vite-SSR stack has no DOM/browser `localStorage` layer, so persistence across page loads and the click-to-save/unsave interaction are not exercised by an automated test — only the underlying domain, resolution, and rendering layers are. This was manually verified in a running dev server (see PR description).
