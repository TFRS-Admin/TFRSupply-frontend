# Shopify Storefront Catalog Adapter

## Purpose

This is the first live-capable Shopify Storefront integration in this codebase. Every prior Storefront foundation (API Foundation, Cart Adapter, Product Sync, Collection Sync) ships a "live" adapter that is a request/response boundary **stub only** — it builds the exact fetch request a real call would send but never calls `fetch`. This foundation's live adapter performs a real `fetch()` against the Shopify Storefront GraphQL API when configured, and maps the response into the existing `Product`/`Category` contracts `catalogService` already exposes.

It reuses the existing Catalog Service, Product Data Platform, and Shopify Storefront API Foundation instead of duplicating any catalog read path, loader, or Storefront request-shape logic they already own. `catalogService`'s public interface is unchanged — every method keeps its existing synchronous signature and return shape.

## The safety model: synchronous reads over an asynchronously-synced snapshot

`catalogService.listProducts()`, `getProduct()`, `listCategories()`, and `getCategory()` are synchronous, but a live Shopify Storefront fetch is inherently asynchronous. This foundation resolves that by never making `catalogService` itself perform I/O:

1. `catalogAdapterService.sync()` asynchronously fetches products and collections through the currently selected `CatalogAdapter`, validates every mapped record against the existing `productSchema`/`categorySchema`, and — **only on full success with at least one valid product** — stores the validated result in an in-memory snapshot.
2. `catalogService`'s synchronous methods read `catalogAdapterService.getSyncedProducts()`/`getSyncedCategories()` first. If the snapshot is `null` (no sync has run yet, the last sync failed, or the adapter is unavailable), they fall back to the existing typed loaders unchanged — byte-for-byte the same data catalogService returned before this foundation existed.

This means: by default, and in every failure mode, `catalogService` behaves exactly as it did before this PR. A live snapshot can only ever replace loader data after a fetch has actually succeeded and validated.

## Ownership

- `src/types/catalogAdapter.ts` owns `CatalogAdapterMode`, `CatalogAdapterFetchStatus`, `CatalogAdapterError(Code)`, `CatalogAdapterProductsResult`, `CatalogAdapterCollectionsResult`, `CatalogMappingIssue`, `CatalogMappingValidationResult`, `CatalogAdapterStatusSnapshot`, and `CatalogAdapterCapabilities`.
- `src/schemas/catalogAdapter.schema.ts` owns runtime Zod validation aligned to every one of those contracts.
- `src/adapters/catalog/` owns the `CatalogAdapter` interface, its three implementations, and the pure Storefront mapping/query-builder module.
- `src/services/catalogAdapter/catalogAdapterService.ts` owns adapter mode resolution, sync orchestration, mapping validation, and the in-memory snapshot `catalogService` reads through.
- `src/services/catalog/catalogService.ts` (existing) now reads through that snapshot with loader fallback — no new file, no interface change.
- `src/hooks/catalogAdapter/useCatalogAdapterStatus.ts` owns the React-facing hook for the `/dev/storefront` dashboard.
- `src/pages/DevStorefrontDashboard.jsx` owns the `/dev/storefront` dev tool.

## Dependency direction

```text
catalogService (existing, interface unchanged)
        ↓ reads synced snapshot, falls back to loaders
catalogAdapterService
        ↓
CatalogAdapter (mock | unavailable | live)
        ↓                                   ↑
   src/data/loaders                 buildStorefrontFetchRequest()
   (mock adapter only)          (Shopify Storefront API Foundation)
```

`catalogAdapterService` is the only caller of the `CatalogAdapter` boundary. It never bypasses the adapter, and it reads `src/data/loaders` directly (not through `catalogService`) to build the baseline category list every adapter cross-references — avoiding a circular dependency back into `catalogService`.

## Adapter boundary

`src/adapters/catalog/catalogAdapter.ts` defines the interface every implementation satisfies:

```ts
interface CatalogAdapter {
  fetchProducts(existingCategories: Category[]): Promise<CatalogAdapterProductsResult>;
  fetchCollections(existingCategories: Category[]): Promise<CatalogAdapterCollectionsResult>;
}
```

Both methods take the current local `Category[]` list so an adapter can resolve `categoryIds`/`verticalIds` (products) and enrich an existing category record (collections) without inventing data Shopify has no concept of.

Three adapters are provided, matching the mock/unavailable/live shape every other Storefront foundation uses:

- **`mockCatalogAdapter`** — wraps `listTypedProducts()`/`listTypedCategories()` from the Product Data Platform unchanged. This is the default adapter and is literally today's existing catalog read path, now expressed as an adapter implementation. It performs no I/O beyond the existing JSON module loading.
- **`unavailableCatalogAdapter`** — the explicit opt-out adapter. Returns an empty result with a retryable `adapter-unavailable` error and performs no I/O.
- **`createLiveShopifyStorefrontCatalogAdapter(config, fetchImpl?)` / `liveShopifyStorefrontCatalogAdapter`** — the live-capable adapter. Builds real GraphQL queries for the existing `product-list-query`/`collection-query` operation types (no new operation type is introduced), calls `buildStorefrontFetchRequest()` from the Shopify Storefront API Foundation to build the exact fetch request shape, and — unlike every prior "live" adapter in this codebase — actually calls `fetch()` (injectable as `fetchImpl` for deterministic testing) when `storeDomain`/`storefrontAccessToken` are present. Every failure mode (missing config, network error, non-2xx response, GraphQL `errors`) resolves to a `failed` or `adapter-unavailable` result instead of throwing.

## Why this adapter can call `fetch()` safely

Prior foundations deliberately kept every "live" adapter a stub because a Shopify Storefront access token can never be present in build-time Vite env config (see `SHOPIFY_STOREFRONT_LIVE_CONFIG_READINESS.md`) — there was no safe way to source credentials automatically. This foundation does not change that: **no Storefront access token env variable is read anywhere in this codebase.** `createLiveShopifyStorefrontCatalogAdapter` only receives a token through an explicit, developer-supplied config object — in practice, the `/dev/storefront` dashboard's manual credential form, which holds the token only in local component state and never persists it. `catalogAdapterService`'s automatic mode resolution (below) can therefore never select `'live'` on its own; it is only reachable through that explicit action.

## Runtime adapter mode resolution

`catalogAdapterService` resolves its starting mode from the same three frontend-safe env variables the Shopify Storefront Live Configuration Readiness foundation reads (`VITE_SHOPIFY_STOREFRONT_ENABLED`, `VITE_SHOPIFY_STORE_DOMAIN`, `VITE_SHOPIFY_STOREFRONT_API_VERSION` — no new env variable is introduced). It reads them directly rather than importing `shopifyStorefrontConfigService`: that service transitively imports `shopifyStorefrontProductService`/`shopifyStorefrontCollectionService`, which both depend on `catalogService` — and `catalogService` depends on this module, so importing `shopifyStorefrontConfigService` here would create a module cycle. This duplicates a handful of lines of env parsing, not any validation or business logic.

| Condition | Resolved mode |
| --- | --- |
| `VITE_SHOPIFY_STOREFRONT_ENABLED` is not `"true"` | `mock` (today's default and behavior) |
| Enabled, but store domain/API version are not both configured | `mock` |
| Enabled and configured | `unavailable` — opted in, but a live call still requires an explicit credential |
| `configureLiveAdapter(config)` called explicitly | `live` |

`resetToDefaultAdapter()` recomputes this and clears any synced snapshot, returning to the safe default.

## Mapping rules

`src/adapters/catalog/shopifyProductMapping.ts` owns the pure mapping functions:

- **`mapStorefrontProductNode(node, existingCategories)` → `Product`.** `slug`/`title`/`label` come from the Shopify handle/title. `categoryIds` and `verticalIds` are resolved by matching the product's Shopify collection handles against existing local categories' `slug` — the same category data `catalogService.listCategories()` already exposes — rather than inventing a second taxonomy. A product whose collections match nothing gets empty arrays, which the existing `Product` schema already allows. `sku` is the first variant SKU; `media.gallery` comes from product images; `shopify.productId`/`productGid` record the Shopify identifiers.
- **`mapStorefrontCollectionNode(node, existingCategories)` → `Category | null`.** This is an **enrichment merge, not a wholesale replacement**: it matches a Shopify collection to an existing local `Category` by `slug === handle` and overlays only `label`, `description`, and `shopify` collection identifiers. `verticalId` and every other required `Category` field are inherited from the existing local record, since Shopify collections carry no vertical concept this platform could safely infer. A collection with no matching local category returns `null` and is reported in `unmatchedCollectionHandles` rather than mapped with a fabricated `verticalId`.

## Service responsibilities

`catalogAdapterService` (`createCatalogAdapterService()`, singleton export `catalogAdapterService`) exposes:

- `getMode()` / `getCapabilities()` — current adapter mode and whether it supports a live fetch.
- `configureLiveAdapter(config, fetchImpl?)` — switches to the live adapter with an explicit config (and, for tests, an injectable fetch implementation). Clears any prior synced snapshot.
- `resetToDefaultAdapter()` — recomputes the default mode from Storefront Runtime Configuration and clears the snapshot.
- `sync()` — fetches products and collections through the active adapter, validates every mapped record against `productSchema`/`categorySchema`, and adopts the result as the live snapshot only when the fetch fully succeeded and produced at least one valid product; otherwise clears the snapshot so `catalogService` continues serving loader data. Never throws.
- `getStatus()` — a schema-validated `CatalogAdapterStatusSnapshot`: adapter mode, product/collection fetch status, last synchronized time, product/category counts, whether a fallback is currently active (and why), mapping validation results (valid/invalid counts, unmatched collection count, per-record issues), and errors.
- `getSyncedProducts()` / `getSyncedCategories()` — the synchronous read path `catalogService` consults.

## Dev dashboard: `/dev/storefront`

`DevStorefrontDashboard` (`src/pages/DevStorefrontDashboard.jsx`, routed at `/dev/storefront` in `src/App.jsx`) is a read-only-by-default internal tool showing:

- Active catalog adapter mode.
- Product fetch status and collection fetch status.
- Last synchronization time.
- Synced product/category counts and whether fallback data is currently being served (and why).
- Mapping validation results (valid/invalid product and category counts, unmatched collection count, per-record issues).
- A manual credential form (store domain, API version, Storefront **public** access token) to exercise the live adapter without any production credentials or build-time secret — nothing entered is persisted.
- The existing `StorefrontConfigReadinessRow` and aggregated Storefront capability summary (Storefront API/Cart/Product Sync/Collection Sync adapter modes), reused unchanged from the Shopify Storefront Live Configuration Readiness foundation.

Loading this page and clicking "Sync Now" without entering credentials is the default, safe path: it reports `adapter-unavailable`/`not-configured` and continues serving mock catalog data — this is what "live-capable mode without production credentials" looks like.

## Integration with existing foundations

- **Catalog Service**: `catalogService.ts`'s five product/category methods now read through `catalogAdapterService`'s snapshot before falling back to `src/data/loaders`. `listVerticals()`/`getVertical()` are unchanged and always loader-based — Shopify has no vertical concept, and vertical assignment for a live-synced category is inherited from the matched local category, not independently fetched.
- **Shopify Storefront API Foundation**: reuses `buildStorefrontFetchRequest()` unchanged and the existing `product-list-query`/`collection-query` operation types — no new operation type is introduced.
- **Shopify Storefront Live Configuration Readiness**: reused unchanged for enabled/configured/domain signals; no new env variable is introduced, and this foundation does not change `liveAdapterReady`'s fixed `false` value for that foundation's own capability summary.
- **Shopify Storefront Product Sync / Collection Sync**: those remain separate, read-only preview panels over `catalogService` output and are untouched by this foundation. This foundation is the first to actually swap what `catalogService` can serve; those remain additive, side-panel previews.
- **Product Discovery / Product Detail**: unchanged. Both continue to call `catalogService` exactly as before; they transparently see live-synced data only after a sync has actually succeeded, and mock data otherwise.

## Explicit non-goals

This foundation does not implement: checkout, cart mutations, customer authentication, orders, pricing changes, or inventory changes. It does not add a Storefront access token environment variable, a backend proxy, or automatic production credential sourcing. It does not change the `Product`/`Category`/`Vertical` TypeScript contracts. It does not wire live sync into any automatic app-startup path — a sync only ever runs when `catalogAdapterService.sync()` is called explicitly (today, only from the `/dev/storefront` dashboard).

## Future extension points

- Wiring an approved backend/proxy credential strategy so `catalogAdapterService` could resolve `'live'` mode automatically instead of only through the dev dashboard.
- Pagination beyond the first page of products/collections (`buildProductListOperation`/`buildCollectionListOperation` currently request a single page of up to 100 records each).
- Triggering `sync()` on an interval or from a backend job instead of only manually.
- Extending the GraphQL query to request pricing/inventory fields once the corresponding foundation is connected.
