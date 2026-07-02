# Shopify Customer Integration Foundation

The Shopify Customer Integration Foundation defines typed, validated architecture for creating and synchronizing customer payloads with Shopify in a future implementation. It is architecture-only: no live Shopify Admin API, Storefront API, OAuth, webhook, checkout, payment, persistence, routing, background job, or UI behavior is added.

## Architecture

```text
React customer hooks → shopifyCustomerService → ShopifyCustomerAdapter → future Shopify customer provider
                         │
                         ├─ Shopify customer schemas
                         └─ Quote / platform customer metadata contracts
```

- `src/types/shopifyCustomer.ts` owns customer payloads, customer addresses, requests, results, errors, mappings, and sync statuses.
- `src/schemas/shopifyCustomer.schema.ts` provides runtime Zod validation for every public customer contract.
- `src/services/shopifyCustomer/shopifyCustomerService.ts` validates requests, maps platform `QuoteCustomerMetadata` and `Quote.customer` data into deterministic Shopify customer payloads, creates synchronization metadata, and delegates to an injected adapter.
- `src/adapters/shopifyCustomer/` owns the adapter boundary with deterministic mock and unavailable implementations.
- `src/hooks/shopifyCustomer/useShopifyCustomer.ts` exposes typed React-facing hook wrappers without embedding validation or mapping logic.

## Adapter Boundary

`ShopifyCustomerAdapter` is the only boundary that future Shopify customer providers should implement. The shipped adapters intentionally do not call Shopify:

- `mockShopifyCustomerAdapter` returns deterministic dry-run results for tests, demos, and future orchestration development.
- `unavailableShopifyCustomerAdapter` returns `adapter-unavailable` metadata and an explicit retryable error so current runtime behavior remains unchanged.

Future live adapters must preserve the same request and result contracts and should be added in a dedicated issue with credentials, retry, rate-limit, and error-normalization requirements.

## Service Responsibilities

`shopifyCustomerService` owns orchestration only:

1. Parse and validate `ShopifyCustomerRequest` with Zod.
2. Determine the customer source from explicit platform customer metadata, quote customer metadata, or explicit Shopify customer overrides.
3. Map customer metadata into a deterministic `ShopifyCustomer` draft payload.
4. Produce `ShopifyCustomerMapping` synchronization metadata with stable IDs, source classification, mapped timestamp, quote reference, and warnings.
5. Delegate status/create actions to the adapter.
6. Validate the final `ShopifyCustomerResult` before returning it.

The service does not perform network I/O, persistence, authentication, background jobs, or UI formatting.

## Customer Mapping

Customer mapping reuses existing Quote Builder customer metadata instead of creating a parallel customer model:

- `QuoteCustomerMetadata.customerId` or `Quote.customerId` becomes `platformCustomerId`.
- Draft Shopify customer IDs are deterministic: `shopify-customer-draft-<platformCustomerId>`.
- `agencyName` maps to `company`.
- `contactEmail` maps to `email`.
- `contactPhone` maps to `phone`.
- `contactName` is split into first and last name fields for Shopify payload readiness.
- Request-level `shopifyCustomer`, address, tags, note, and metadata overrides can augment or override mapped values without changing Quote Builder contracts.

## Synchronization Flow

1. Future UI or orchestration calls `useShopifyCustomer()` or `useShopifyCustomerSync()`.
2. Hooks call `shopifyCustomerService.createCustomer()` or `shopifyCustomerService.getCustomerSyncStatus()`.
3. The service validates and maps the request.
4. The injected adapter returns dry-run or unavailable metadata.
5. The service fills missing customer and mapping fields from its deterministic mapping and validates the result envelope.

## Future Extension Points

- Live Shopify customer Admin API adapter behind `ShopifyCustomerAdapter`.
- Checkout and Quote Builder handoff that composes customer sync before draft order creation.
- Persistence-owned mapping storage for platform customer ID to Shopify customer ID relationships.
- Retry and rate-limit policy in a provider-specific adapter.
- Webhook reconciliation in a dedicated Shopify synchronization issue.

## Explicit Non-goals

This foundation intentionally does not implement live Shopify API calls, checkout, payment processing, authentication, OAuth, webhooks, background jobs, database persistence, UI changes, routing changes, or customer record mutation outside the returned typed payloads.
