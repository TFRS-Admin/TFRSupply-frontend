# Shopify Storefront API Foundation

## Purpose

This foundation establishes typed contracts, an adapter boundary, and a service/hook layer for a future Shopify Storefront API integration. It is architecture-only: no live Storefront API call, GraphQL execution, checkout creation, customer login, order, payment, shipping, tax, or inventory mutation is implemented. It reuses the existing Commerce Foundation, Cart Workspace, and Checkout Preparation Layer instead of duplicating any commerce lookup, validation, or readiness logic they already own.

## Ownership

- `src/types/shopifyStorefront.ts` owns `ShopifyStorefrontClientConfig`, `ShopifyStorefrontOperation`, `ShopifyStorefrontRequest`, `ShopifyStorefrontResponse`, `ShopifyStorefrontError`, `ShopifyStorefrontAvailability`, and the supporting `ShopifyStorefrontCapabilities` contract.
- `src/schemas/shopifyStorefront.schema.ts` owns runtime Zod validation aligned to every one of those contracts.
- `src/adapters/shopifyStorefront/` owns the `ShopifyStorefrontAdapter` interface and its three implementations.
- `src/services/shopifyStorefront/shopifyStorefrontService.ts` owns request building, response normalization, validation, availability reporting, and capability metadata.
- `src/hooks/shopifyStorefront/useShopifyStorefront.ts` owns the React-facing `useShopifyStorefront()` and `useStorefrontAvailability()` hooks.

## Dependency direction

```text
React hooks → shopifyStorefrontService → ShopifyStorefrontAdapter → future Shopify Storefront GraphQL API
                                    ↓
                     shopifyStorefront schemas / types
```

`shopifyStorefrontService` is the sole caller of the adapter. It never calls another domain service (Commerce, Cart Workspace, Checkout Preparation) itself — those existing services instead consume `shopifyStorefrontService.getAvailability()` for display purposes, keeping the Storefront foundation a leaf in the dependency graph.

## Adapter boundary

`src/adapters/shopifyStorefront/shopifyStorefrontAdapter.ts` defines the interface every implementation must satisfy:

```ts
interface ShopifyStorefrontAdapter {
  execute(request: ShopifyStorefrontRequest): Promise<ShopifyStorefrontResponse>;
  getAvailability(config?: Partial<ShopifyStorefrontClientConfig>): Promise<ShopifyStorefrontAvailability>;
}
```

Three adapters are provided:

- `unavailableShopifyStorefrontAdapter` — the default adapter used by `shopifyStorefrontService` when no adapter is injected. Every `execute()` call returns an `adapter-unavailable` response with a retryable error; `getAvailability()` reports `available: false`. No network call is made.
- `mockShopifyStorefrontAdapter` — deterministic, in-memory adapter for tests and local development. `execute()` resolves as a successful dry run (`status: 'dry-run'`) with an empty `data` object; `getAvailability()` reports `available: true`. It performs no I/O.
- `createLiveShopifyStorefrontAdapter(config)` / `liveShopifyStorefrontAdapter` — a **stub only**. It defines the real request/response boundary (see below) but its `execute()` always resolves with `status: 'failed'` and error code `live-calls-disabled`; it never calls `fetch`. `getAvailability()` always reports `available: false` with `adapterMode: 'live'`, since this stub cannot serve live data.

### The live request/response boundary

`src/adapters/shopifyStorefront/liveShopifyStorefrontAdapter.ts` exports `buildStorefrontFetchRequest(operation, config)`, a pure function that builds the exact `fetch` request shape (`url`, `method`, `headers`, JSON `body`) a real implementation would send to `https://{storeDomain}/api/{apiVersion}/graphql.json` with the `X-Shopify-Storefront-Access-Token` header. This function performs no network I/O — it exists so a future issue can replace the body of `execute()` with a real `fetch(fetchRequest.url, fetchRequest)` call against the exact same request shape, without changing the adapter's public interface or any caller's contract.

## Service responsibilities

`shopifyStorefrontService` (`createShopifyStorefrontService(adapter)`, defaulting to `unavailableShopifyStorefrontAdapter`) exposes:

- `buildRequest(operation, overrides?)` — builds a deterministic, schema-validated `ShopifyStorefrontRequest` (`dryRun` is always `true`). Assigns a `requestId` (`storefront-request-{operationType}-{sequence}`) when the caller does not supply one.
- `execute(request)` — validates the request with `shopifyStorefrontRequestSchema`, delegates to the adapter's `execute()`, and validates the result with `shopifyStorefrontResponseSchema` before returning it.
- `getAvailability(config?)` — delegates to the adapter's `getAvailability()` and validates the result with `shopifyStorefrontAvailabilitySchema`.
- `getCapabilities()` — returns `ShopifyStorefrontCapabilities` (`supportedOperationTypes`, `dryRunOnly: true`, `liveCallsEnabled: false`, and the injected adapter's `adapterMode`), so callers can introspect what this foundation currently supports without executing a request.

The service never calls Shopify itself and never bypasses the adapter boundary.

## Storefront API lifecycle

`ShopifyStorefrontResponseStatus` models the request lifecycle this foundation supports:

| Status | Meaning |
| --- | --- |
| `not-started` | Reserved for a future request-tracking layer; no adapter in this foundation returns it today. |
| `dry-run` | `mockShopifyStorefrontAdapter` admitted the request and returned a deterministic, simulated success. |
| `succeeded` | Reserved for a future live adapter that actually executes a Storefront GraphQL operation. |
| `failed` | `liveShopifyStorefrontAdapter` returns this today (`live-calls-disabled`), since it never calls the real API. |
| `adapter-unavailable` | The configured adapter cannot serve Storefront data — the default behavior. |

## Integration with existing foundations

- **Cart Workspace / Checkout Preparation**: `useStorefrontAvailability()` is surfaced in `CheckoutReadinessPanel` (`src/components/cart/CheckoutReadinessPanel.jsx`) via a `storefrontAvailability` prop passed from `/cart` (`src/pages/CartWorkspace.jsx`). This is purely additive, read-only UI — it renders whatever `ShopifyStorefrontAvailability` the service reports and never changes any checkout blocker, warning, or payload-preview line owned by `checkoutPreparationService`. Because the default adapter is `unavailableShopifyStorefrontAdapter`, the panel shows "Storefront API Not Connected" by default and no runtime behavior changes.
- **Commerce Foundation**: This foundation does not modify `commerceService`, `CommerceAdapter`, or any Shopify sync/catalog/pricing/inventory/order/fulfillment/webhook foundation. It is a separate, parallel boundary for the Storefront (customer-facing, read-oriented) API, as distinct from the existing Admin-API-oriented sync foundations.

## Future live implementation plan

A future issue can introduce a real Storefront API client by:

1. Replacing `createLiveShopifyStorefrontAdapter`'s `execute()` body with an actual `fetch()` call against the request built by `buildStorefrontFetchRequest()`, parsing the GraphQL response into `ShopifyStorefrontResponse.data`.
2. Updating `getAvailability()` to perform a lightweight live check (for example a `shop { name }` query) instead of unconditionally reporting `available: false`.
3. Expanding `ShopifyStorefrontOperationType` and adding corresponding GraphQL documents as new read (and, in later issues, write) operations are supported.
4. Wiring `shopifyStorefrontService` into product detail, product discovery, or cart flows only after the live adapter is connected and validated — this foundation intentionally stops short of that integration.
5. Introducing real secret handling (`storefrontAccessToken`, `storeDomain`) through environment configuration or a backend proxy, never committing credentials to source.

## Explicit non-goals

This foundation does not implement: real Shopify Storefront API calls, GraphQL execution, checkout creation, customer login, orders, payments, shipping, taxes, or inventory mutations. It does not change any existing checkout, cart, pricing, configurator, or catalog runtime behavior. `mockShopifyStorefrontAdapter`'s dry-run response is not a substitute for real product or cart data and must not be treated as one.

## Shopify Storefront Cart Adapter Foundation

The Shopify Storefront Cart Adapter Foundation is documented in [SHOPIFY_STOREFRONT_CART_ADAPTER.md](./SHOPIFY_STOREFRONT_CART_ADAPTER.md). It connects this foundation to the Cart Workspace and Checkout Preparation Layer's cart contracts, adding a parallel `ShopifyStorefrontCartAdapter` boundary and `shopifyStorefrontCartService` for cart-line mapping and Storefront cart mutation previews. Its live adapter stub reuses `buildStorefrontFetchRequest()` from this foundation rather than redefining the Storefront GraphQL request shape. It adds no new Storefront operation type, live API call, or checkout behavior to this foundation.

## Shopify Storefront Product Sync

The Shopify Storefront Product Sync Foundation is documented in [SHOPIFY_STOREFRONT_PRODUCT_SYNC.md](./SHOPIFY_STOREFRONT_PRODUCT_SYNC.md). It connects this foundation to the Product Data Platform and Catalog Service, adding a parallel `ShopifyStorefrontProductAdapter` boundary and `shopifyStorefrontProductService` for product-to-Shopify mapping derivation and read-only query previews. Its live adapter stub reuses `buildStorefrontFetchRequest()` from this foundation rather than redefining the Storefront GraphQL request shape. It adds no new Storefront operation type, live API call, or checkout behavior to this foundation.
