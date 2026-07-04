# Product Comparison and Selection

## Purpose

The Product Comparison and Selection experience lets a customer select up to four products while browsing and compare them side by side — specifications, fitment, availability, and CTAs — before configuring or requesting a quote. This is composition, not a new service layer: every field on the `/compare` page is read through `catalogService`, the same read path `CategoryTemplate`, `ProductSearchPage`, and `RecommendedProducts` already use.

## Selection State

`CompareContext` (`src/context/CompareContext.jsx`) holds the selected product ids and persists them to `localStorage` (`tfr_compare_products`), mirroring the existing `VehicleContext` pattern. It is mounted once in `App.jsx`, alongside `VehicleProvider`/`ConfiguratorProvider`, so the selection survives navigation across the whole site.

The add/remove/limit rules are pure functions in `src/domain/catalog/compareSelection.ts` (`addProductToCompare`, `removeProductFromCompare`, `isProductInCompare`, `isCompareFull`, `MAX_COMPARE_PRODUCTS = 4`), pulled out of the context so they are unit-testable without simulating clicks through server-rendered HTML — the same reason `categoryProductFilter.ts` exists in the same folder. `CompareContext` only owns React state wiring and `localStorage` persistence; it delegates every selection decision to these functions.

## Composed Components

| Component | Renders | Reuses |
| --- | --- | --- |
| `CompareToggleButton` (`src/components/product/CompareToggleButton.jsx`) | Add/remove-from-comparison control, in a compact circular `variant="icon"` (ProductCard overlay) and a full `variant="inline"` action button (CommerceActionPanel row) | `useCompare` |
| `ProductCard` | Compare overlay button on every product card that links to a real product page | `CompareToggleButton` |
| `CommerceActionPanel` | "Add to Compare" / "Remove from Compare" action alongside Configure/Quote/Cart/Contact | `CompareToggleButton` |
| `CompareTray` (`src/components/product/CompareTray.jsx`) | Sticky, site-wide tray with thumbnails, per-item remove, Clear All, and a Compare(n) link to `/compare`; hidden on `/compare` itself | `useCompare`, `catalogService.getProduct` |
| `ComparePage` (`src/pages/ComparePage.jsx`) | `/compare` route — desktop side-by-side table with a sticky product/CTA header row, mobile stacked cards, and an empty state | `useCompare`, `catalogService.getProduct`, `resolveProductDetailPath`, `appConfig.quoteRecipientEmail` |

`CompareTray` and `ComparePage` each split into a pure `*View`/`CompareTrayView` component (fixture-testable, no context/router required) and a connected default export, matching the `StoreLandingView`/`CategoryTemplateView`/`ProductDetailTemplateView` convention already used in `src/pages`.

## Comparison Fields

`ComparePage`'s `toCompareRow(product)` reads only existing catalog fields — no pricing or configurator logic is added:

- Image, name — `product.media?.hero`/`images`, `product.title`/`label`
- Brand — `product.vendor`
- SKU — `product.sku` / `product.commerce?.sku_root`
- Category — `product.category`
- Availability, MSRP — `product.commerce?.availability`/`msrp_display`
- Major Specifications — `product.specifications` (falls back to `product.marketing?.features`)
- Fitment Summary — deduplicated `product.marketing?.applications`
- Configure CTA — `product.configuratorId` deep-links to that product's own `#build-configure` section; otherwise falls back to `product.actions?.configuratorUrl`/`cta?.configurator_url`, same precedence `CommerceActionPanel` uses
- View Details CTA — `resolveProductDetailPath` (`src/domain/catalog`), the same canonical route builder `ProductSearchPage` uses
- Request Quote CTA — `mailto:` built from `appConfig.quoteRecipientEmail`, matching `CommerceActionPanel`

## Known Limitation

`catalogService.getProduct()` only resolves products backed by a full record in `src/data/products`. A handful of category-listing cards (denormalized entries in `src/data/categories/*.json`, e.g. `allegiant-max` in `light-bars.json`) do not yet have a matching product record — the same gap `RecommendedProducts` already tolerates. Adding one of these to comparison persists the id but the product silently drops out of the tray/page until a full catalog record exists; it is not a crash or partial-render, matching `RecommendedProducts`' existing filter-out behavior for unresolvable ids.

## Non-goals

No Shopify API calls, no cart/checkout changes, no pricing calculation changes, no configurator changes, no authentication, and no admin/CRM functionality are introduced by this feature.

## Testing

`tests/product-comparison-selection.test.mjs` covers the pure add/remove/max-limit domain rules, `CompareToggleButton` states, `ProductCard`'s compare overlay (present when linked, absent for coming-soon cards without a href), `CommerceActionPanel`'s compare action, `CompareTrayView` (empty and populated), and `ComparePageView` (empty state, desktop/mobile markup, CTA hrefs, and the unresolved-detail-route fallback).
