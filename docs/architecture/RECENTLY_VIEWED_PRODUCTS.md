# Recently Viewed Products

## Purpose

Recently Viewed Products lets a customer pick up where they left off — the last products they opened stay one click away on Product Detail, Search, and the homepage. This is composition, not a new service layer: every rendered field is read through `catalogService.getProduct`, the same read path `CompareTray`/`RecommendedProducts` already use.

## Tracking State

`RecentlyViewedContext` (`src/context/RecentlyViewedContext.jsx`) holds the tracked product ids, most-recent-first, and persists them to `localStorage` (`tfr_recently_viewed_products`), mirroring `CompareContext`'s existing pattern. It is mounted once in `App.jsx`, alongside `VehicleProvider`/`CompareProvider`/`ConfiguratorProvider`, so the list survives navigation across the whole site.

The dedupe/ordering/limit rules are pure functions in `src/domain/catalog/recentlyViewed.ts` (`trackRecentlyViewedProduct`, `MAX_RECENTLY_VIEWED_PRODUCTS = 8`), pulled out of the context so they are unit-testable without simulating navigation through server-rendered HTML — the same reason `compareSelection.ts` exists in the same folder. Viewing a product moves its id to the front if already tracked (no duplicates) and the list is capped at 8, dropping the oldest entries. `RecentlyViewedContext` only owns React state wiring and `localStorage` persistence; it delegates every ordering decision to `trackRecentlyViewedProduct`.

`ProductDetailTemplate` (`src/pages/ProductDetailTemplate.jsx`) calls `useRecentlyViewed().trackView(product.id)` in a `useEffect` once a product loads successfully — the only place a view is recorded.

## Composed Components

| Component | Renders | Reuses |
| --- | --- | --- |
| `RecentlyViewedProducts` (`src/components/product/RecentlyViewedProducts.jsx`) | Connected "Recently Viewed" section — resolves tracked ids to products, drops the current product and any unresolvable id, and renders `RecentlyViewedProductsView` | `useRecentlyViewed`, `catalogService.getProduct`, `resolveProductDetailPath` |
| `RecentlyViewedProductsView` | Pure grid presentation (cards + "Clear Recently Viewed" action); renders nothing when given an empty product list | `ProductCard` |
| `resolveRecentlyViewedProducts` | Pure id → product resolution (exclude current id, drop missing ids), exported so it is unit-testable without a localStorage-backed context | — |

`RecentlyViewedProducts` and `RecentlyViewedProductsView` follow the same connected/pure split as `CompareTray`/`CompareTrayView`.

## Placement

- **Product Detail** (`ProductDetailTemplateView`): rendered after `RecommendedProducts`, with `excludeProductId` set to the current product so it never lists the page you're already on.
- **Search** (`ProductSearchPage`): rendered below the search results grid.
- **Homepage** (`StoreLandingView`): rendered near the top, above "Shop by Vertical", so a returning visitor sees their recent activity first.

On every placement the section is entirely absent (renders `null`) until at least one tracked id resolves to a catalog product — no "no items" message is shown, matching the existing empty behavior of `RecommendedProducts`/`RelatedPackages`/`CompareTray`.

## Mobile Layout

`RecentlyViewedProductsView` uses a `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` responsive grid, so up to 8 tracked products always render at least two per row on mobile.

## Clear Action

"Clear Recently Viewed" (in `RecentlyViewedProductsView`) calls `clearRecentlyViewed()`, which empties the tracked id list and removes the `localStorage` entry — available from any page the section renders on, since the list is shared through `RecentlyViewedProvider`.

## Non-goals

No Shopify API calls, no cart/checkout changes, no pricing calculation changes, no authentication, and no customer-account/server-side history are introduced by this feature. Recently viewed state is client-only (`localStorage`) and is not synced to any account or backend.

## Known Limitation

`catalogService.getProduct()` only resolves products backed by a full record in `src/data/products`. A product id tracked while browsing a denormalized category-listing card without a matching product record silently drops out of the section once viewed elsewhere — the same gap `CompareTray`/`RecommendedProducts` already tolerate.

## Testing

`tests/recently-viewed-products.test.mjs` covers: `trackRecentlyViewedProduct`'s tracking/dedupe/reordering and 8-item max-limit behavior, `resolveRecentlyViewedProducts`'s id resolution, current-product exclusion, and missing-id handling, `RecentlyViewedProductsView`'s empty-state and populated rendering (including the mobile grid classes and Clear action), the connected `RecentlyViewedProducts` component's empty state before any product has been tracked, and source-level wiring checks confirming Product Detail, Search, the homepage, and `App.jsx` all compose the feature.

**Known gap**: as with every other `localStorage`-backed or hook-driven customer surface (see `docs/migrations/TESTING_NOTES.md`), the repository's `node --test` + Vite-SSR stack has no DOM/browser `localStorage` layer, so persistence across page loads and the click-to-clear interaction are not exercised by an automated test — only the underlying domain, resolution, and rendering layers are. This was manually verified in a running dev server (see PR description).
