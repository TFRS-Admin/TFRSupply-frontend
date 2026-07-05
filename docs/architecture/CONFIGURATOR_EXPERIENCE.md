# Configurator Experience

## Purpose

The Configurator Experience composes existing platform foundations around the
existing Configurator (`ConfiguratorModule`) to give the customer-facing
configurator a polished storefront surface: a richer vehicle summary, a
configuration summary, a pricing summary, fitment feedback, and commerce
actions. This is composition, not a new configurator engine — every new
component reads from a service, hook, or the configurator's own existing
output that already existed before this change.

`ConfiguratorModule`'s SKU filtering and dead-end prevention are unchanged. It
gained exactly one additive prop, `onConfigurationChange`, fired from a
`useEffect` alongside its existing `quotePayload` state so a composing parent
can read that same payload without recomputing it.

## Shopify Variant Resolver

`ConfiguratorModule` keeps two concerns separate:

- **UI selection state** — `filterSelections`, `accessories`, `selectedSkuId`.
  Pure component state; it only decides which SKU row is the candidate.
- **Shopify variant resolution** — once filtering narrows to exactly one SKU,
  `useShopifyVariantResolver` (`src/hooks/shopifyVariantResolver`,
  `src/services/shopifyVariantResolver`) resolves that SKU to a Shopify
  variant: `shopifyVariantId`, live `price`, `availability`, and
  `canAddToCart`. `quotePayload`'s commerce fields (`basePrice`,
  `availability`, `checkoutReady`, `commerceLines[0]`) are read from this
  resolver's output instead of indexing commerce data inline.

The resolver composes two existing sources, preferring the live one exactly
the way `ConfiguratorPricingSummary` already prefers the live Pricing Engine
over a catalog fallback:

1. The Commerce Foundation (`commerceService.getVariantMapping`) — live,
   adapter-based, intentionally `unavailableCommerceAdapter` by default.
2. `commerceLookupService` — the existing Shopify-export-backed lookup that
   already powers the Available SKUs table's price/status columns.

With today's default adapter and export data (no collected variant GIDs),
the resolver honestly reports `canAddToCart: false` and the Package Quote's
Add to Cart control stays disabled — the same "unavailable adapter, honest
UI" pattern used by the Pricing Engine and Vehicle Fitment Service. The
bulk per-row lookup that drives the Available SKUs table is untouched and
still reads `commerceLookupService` directly.

## Composed Components

All new components live in `src/components/configurator/` and are rendered
from `ConfiguratorExperience`, which now sits wherever `ConfiguratorModule`
used to be rendered directly (`ProductDetailTemplate`'s `ConfiguratorSection`
and `ProductTabs`'s `ConfiguratorContent`).

| Component | Renders | Reuses |
| --- | --- | --- |
| `VehicleConfigurationSummary` | Year / Make / Model / Trim fields, a plain-language vehicle summary sentence, and the existing vehicle selector | `useVehicle` (`VehicleContext`), existing `VehicleSelectorModal` |
| `ConfiguratorSummaryPanel` | Selected options, SKU list, compatibility status, warnings, package summary | `ConfiguratorModule`'s existing `quotePayload` (selections, `commerceLines`, `reviewFlags`), `usePackageDefinition` (Package Builder Foundation), the shared fitment-status derivation |
| `ConfiguratorPricingSummary` | MSRP, dealer pricing (when available), quantity pricing, bundle pricing, estimated total | `useListPrice` / `useDealerCost` / `useBundlePricing` (Pricing Engine), falling back to the configurator's own catalog-sourced SKU price when the Pricing Engine adapter is unavailable |
| `ConfiguratorCommerceActions` | Add Configured Product to Cart, Save Configuration (placeholder), Request Quote, Continue Shopping | `useCartWorkspace().addLine` (Cart Workspace Foundation), `quoteBuilderService.assembleQuote` (Quote Builder Foundation), `appConfig.quoteRecipientEmail` |
| `ConfiguratorFitmentFeedback` | Compatible / Incompatible / Warning / Unknown badge for the selected vehicle + SKU | `useProductFitment` (Vehicle Fitment Service), `toFitmentVehicle` (already exported by `FitmentSummary`) |
| `ConfiguratorExperience` | Orchestrates the above around the unchanged `ConfiguratorModule` | All of the above |

## Placement

```
VehicleConfigurationSummary
ConfiguratorModule                          (unchanged engine)
┌───────────────────────────┬───────────────────────────┐
│ ConfiguratorSummaryPanel   │ ConfiguratorPricingSummary │
│ ConfiguratorFitmentFeedback│ ConfiguratorCommerceActions│
└───────────────────────────┴───────────────────────────┘
```

The summary/pricing/fitment/commerce grid only renders once a base SKU is
selected in `ConfiguratorModule` — the same gate `ConfiguratorModule` already
uses for its own Package Quote panel (`showPackage`/`resolvedSkuObj`).

## Fitment Feedback: Four States From Three

The Vehicle Fitment Service's `FitmentEvaluationStatus` is `'compatible' |
'incompatible' | 'unknown'`. The Configurator Experience presents four states
by combining that status with issue severities:
`deriveFitmentPresentation()` (exported from `ConfiguratorFitmentFeedback`)
returns `'warning'` when the result is `'compatible'` but carries at least
one `warning`- or `error`-severity issue, and passes the other three statuses
through unchanged. `ConfiguratorSummaryPanel`'s "Compatibility Status" row
reuses the same function against the same fitment result rather than
re-deriving it, so the two panels never disagree.

Because the default `VehicleFitmentAdapter` is intentionally unavailable
(see `VEHICLE_FITMENT_SERVICE.md`), every fitment result today is `unknown`
with an informational issue — the UI renders that state honestly.

## Pricing Summary Fallbacks

The default `PricingAdapter` is intentionally unavailable (see
`PRICING_DOMAIN.md`), so `useListPrice`, `useDealerCost`, and
`useBundlePricing` resolve to `status: 'unavailable'` today. `MSRP` and
`Estimated Total` fall back to the configurator's own catalog-sourced SKU
price (`configState.basePrice`, the same figure the existing Package Quote
panel already displays) so the panel never shows a blank field. Dealer
Pricing only renders once `useDealerCost` reports `status: 'priced'` — it is
correctly absent today. Quantity Pricing reports how many
`BundlePricing.items[].appliedQuantityBreak` entries the engine applied, and
Bundle Pricing shows `BundlePricing.sellingPrice` once the engine is
connected.

## Commerce Actions

- **Add Configured Product to Cart** calls `useCartWorkspace().addLine()`
  with a `CartLineInput` built by the pure, independently-tested
  `buildCartLineInput(configState)` helper (exported from
  `ConfiguratorCommerceActions`). This is the first real UI consumer of
  `cartWorkspaceService.addLine` — previously only the Cart Workspace's
  seeded fixtures populated the cart.
- **Request Quote** opens the existing `mailto:appConfig.quoteRecipientEmail`
  link (same mechanism `CommerceActionPanel` already uses on the product
  page) and, in the same click, calls `quoteBuilderService.assembleQuote()`
  with a `QuoteAssemblyInput` built by the pure `buildQuoteAssemblyInput()`
  helper, surfacing the Quote Builder's real status/review-flag message
  underneath. Because the default `QuoteBuilderAdapter` is intentionally
  unavailable, that message is honestly "Quote Builder data source is not
  connected." today.
- **Save Configuration** is an explicit disabled placeholder. Configuration
  persistence is out of scope for this issue.
- **Continue Shopping** is a plain `react-router-dom` `Link` back to the
  current vertical/category listing — no new routing was introduced.

## Non-goals

This work does not implement a new configurator engine, Shopify checkout,
live pricing/commerce/fitment/quote APIs, authentication changes, CRM,
customer accounts, configuration persistence, or AI recommendations. It does
not change `ConfiguratorModule`'s filtering, dead-end prevention, or SKU
matching behavior.

## Relationship to Fleet Intelligence & Department Standards

Fleet Intelligence & Department Standards (`FLEET_INTELLIGENCE.md`) surfaces
department-standard scoring and product-to-standard matching on Product
Detail (`FinishYourUpfitPanel`, `ProductIntelligencePanel`) and `/workspace`.
It does not touch `ConfiguratorExperience`, `ConfiguratorModule`,
`ConfiguratorContext`, or any component in this doc — a configurator
selection and a fleet build's Department Standard are read independently,
with no code-level coupling between them.

## Testing

`tests/configurator-experience.test.mjs` covers: vehicle summary rendering
(selected and unselected states), configuration summary composition
(selected options, SKU list, warnings, package summary), pricing composition
(MSRP fallback, quantity/bundle pricing, estimated total), fitment feedback
state derivation (`compatible`/`incompatible`/`warning`/`unknown`), the
`buildCartLineInput`/`buildQuoteAssemblyInput` pure helpers plus a live
`cartWorkspaceService.addLine` integration against a fresh mock adapter
instance, a `quoteBuilderService.assembleQuote` integration, and full
`ConfiguratorExperience` composition end to end.
