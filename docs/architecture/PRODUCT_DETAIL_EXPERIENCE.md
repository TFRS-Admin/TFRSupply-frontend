# Product Detail Experience

## Purpose

The Product Detail Experience composes existing platform foundations onto the customer-facing product detail page (`ProductDetailTemplate` / `ProductDetailTemplateView`). It adds a commerce summary, a fitment summary, deterministic recommendations, related packages, and a consolidated CTA area — without rewriting the existing hero, tabs, or configurator wiring.

This work is composition, not a new service layer. Every new component reads from a service, hook, or catalog field that already existed before this change.

## Composed Components

All new components live in `src/components/product/` and are rendered from `ProductDetailTemplateView` in `src/pages/ProductDetailTemplate.jsx`.

| Component | Renders | Reuses |
| --- | --- | --- |
| `ProductCommerceSummary` | SKU, brand, category, availability, MSRP, starting price, live commerce status | `catalogService` product fields, `useCommerceProduct` (Commerce Foundation) |
| `CommerceActionPanel` | Configure Product, Request Quote, Add to Cart (conditional), Contact Sales | Existing `cta`/`actions` product fields, `configuratorId`, `useCommerceProduct`, `commerceService.prepareCartLine`, `appConfig.quoteRecipientEmail` |
| `FitmentSummary` | Supported vehicle types, compatible packages, live vehicle compatibility summary | `product.marketing.applications`, `useVehicle` (`VehicleContext`), `useProductFitment` (Vehicle Fitment Service), `usePackageDefinition` (Package Builder Foundation) |
| `RecommendedProducts` | Deterministic "you may also need" grid | `catalogService.getProduct`/`searchProducts`, `product.commerce.related_products`, existing `ProductCard` (its resolution logic now lives in the shared `resolveRelatedProducts`, `src/domain/catalog/relatedProducts.ts`) |
| `RelatedPackages` | Package cards for packages linked to this product | `product.commerce.related_packages`, `usePackageDefinition` (Package Builder Foundation) |
| `ProductIntelligencePanel` | Recommended For / Required By / Department Standards / Commonly Installed With (Fleet Intelligence & Department Standards, `FLEET_INTELLIGENCE.md`) | `DepartmentStandardsContext`, `classifyProductUpfitCategory`, the same `resolveRelatedProducts` `RecommendedProducts` reads |

`ProductHero` gained one additive prop, `infoPanel` (a `ReactNode` rendered under the subtitle, above the bullet list). It is `null` by default, so every existing `ProductHero` caller is unaffected. `ProductDetailTemplateView` passes `<ProductCommerceSummary />` into it.

## Placement in the Page

```
SiteHeader / ProductBreadcrumb
ProductHero (infoPanel = ProductCommerceSummary)
CommerceActionPanel
Specifications / ProductTabs / ConfiguratorSection   (unchanged)
FitmentSummary
FinishYourUpfitPanel                                 (Fleet Vehicle Shopping Modes)
ProductIntelligencePanel                             (Fleet Intelligence & Department Standards)
RelatedPackages
RecommendedProducts
PrototypeFooter
```

`ConfiguratorSection` and the `ProductTabs` configurator wrapper each gained `id="build-configure"` so `CommerceActionPanel`'s "Configure Product" button can deep-link to the existing configurator UI when `product.configuratorId` is set, instead of opening an external URL.

## New Catalog Field

`ProductCommerce` (`src/types/product.ts`, `src/schemas/product.schema.ts`) gained one optional field:

```ts
related_packages?: string[];
```

This mirrors the existing `related_products` field and is additive — no product JSON currently sets it, so `RelatedPackages` and the "Compatible Packages" list in `FitmentSummary` render nothing until a product opts in.

## Deterministic Recommendations

`RecommendedProducts` never calls an AI or external ranking service. It:

1. Resolves `product.commerce.related_products` (existing field) through `catalogService.getProduct`.
2. If fewer than 3 results are found, backfills with other products from `catalogService.searchProducts({ filter: { categoryId } })`, excluding the current product and anything already included.

This is the same catalog relationship data `CategoryTemplate` and `ProductSearchPage` already read — no new data path was introduced.

This resolution logic is extracted into `resolveRelatedProducts(product, { getProduct, searchByCategory }, limit)` (`src/domain/catalog/relatedProducts.ts`), a pure function `RecommendedProducts` calls with `catalogService` threaded in. Fleet Intelligence & Department Standards' `ProductIntelligencePanel` ("Commonly Installed With," `FLEET_INTELLIGENCE.md`) calls the same function rather than duplicating this resolution — behavior is unchanged for `RecommendedProducts` itself.

## Fitment Summary and the Vehicle Fitment Service

`VEHICLE_FITMENT_SERVICE.md`'s Future Migration Plan calls for migrating "a non-critical product compatibility consumer" to `src/hooks/vehicleFitment` once a real UI surface needs it. `FitmentSummary` is that consumer:

- It reads `useVehicle()` (`VehicleContext`) for the customer's globally-selected vehicle, which is already used by `ConfiguratorModule` and `SiteHeader`.
- `VehicleContext` stores a lightweight `{ vehicleId, year, make, model, vertical }` shape, not the strict `Vehicle` type the fitment schemas require. `FitmentSummary` exports `toFitmentVehicle()`, a pure function that maps that shape into a schema-valid `Vehicle` (with `make`/`model` as `BaseEntity` objects and `year` as `{ value }`) before calling `useProductFitment`.
- Because the default `VehicleFitmentAdapter` is intentionally unavailable, the compatibility result today is always `status: 'unknown'` with an informational issue — the UI renders that state honestly rather than fabricating a compatible/incompatible verdict.
- "Supported vehicle types" is answered separately and deterministically from `product.marketing.applications`, which already exists on every product and does not depend on the adapter.

## Commerce CTA Area

`CommerceActionPanel` always renders "Configure Product" (when configurator data exists), "Request Quote" (`mailto:` using `appConfig.quoteRecipientEmail`), and "Contact Sales" (`tel:800-621-9959`, matching the existing `StoreLanding` convention). "Add to Cart" only renders when `useCommerceProduct` reports `cartEligible: true` — with the default unavailable Commerce adapter this is always `false`, so the button is correctly absent until a real commerce adapter is wired in. Clicking "Add to Cart" calls `commerceService.prepareCartLine`; it does not implement checkout, cart persistence, or a Shopify API call.

## Storefront Product Panel

`StorefrontProductPanel` (`src/components/product/StorefrontProductPanel.jsx`), rendered below `CommerceActionPanel`, is a read-only consumer of the Shopify Storefront Product Sync Foundation (`SHOPIFY_STOREFRONT_PRODUCT_SYNC.md`). It calls `useShopifyStorefrontProductPreview(product.id)` and renders storefront readiness, mapping status, variant count, media count, handle, and adapter mode. It is purely additive — it never changes the hero, commerce summary, fitment, recommendation, or CTA behavior described above — and because that foundation's default adapter is unavailable, the panel always shows "Storefront Not Ready" / "Not Connected" today.

## Non-goals

This work does not implement checkout, live inventory, authentication, customer accounts, CRM integration, reviews, ratings, or AI-generated recommendations. It does not add a package data source — `RelatedPackages` and the "Compatible Packages" list stay empty until a future issue supplies `product.commerce.related_packages` values and a real `PackageBuilderAdapter`.

## Known Limitation / Follow-up

No shipped product JSON currently sets `commerce.related_packages`, so `RelatedPackages` is unreachable on the live site today. The component, hook wiring, type, and schema are in place; a follow-up content/data issue should populate the field once real package definitions exist behind `PackageBuilderAdapter`.

## Testing

`tests/product-detail-experience.test.mjs` covers hero commerce summary rendering (present/absent), CTA composition (configure/quote/cart/contact), fitment summary rendering and the `toFitmentVehicle` mapping, deterministic recommendation selection (explicit + fallback + empty), related package rendering, and full `ProductDetailTemplateView` composition. `tests/fleet-intelligence.test.mjs` covers `ProductIntelligencePanel`'s own rendering (empty state, populated Recommended For/Required By/Department Standards/Commonly Installed With) — see `FLEET_INTELLIGENCE.md`.
