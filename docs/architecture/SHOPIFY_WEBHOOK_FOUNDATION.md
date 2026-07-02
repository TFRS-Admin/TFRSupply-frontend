# Shopify Webhook Foundation

## Architecture

The Shopify webhook foundation introduces an additive, architecture-only boundary for receiving, validating, normalizing, and routing inbound Shopify webhook events. It is the inbound counterpart to the outbound Shopify customer, order, catalog, pricing, inventory, and fulfillment synchronization foundations, and follows the same layered path:

`ShopifyWebhookRequest` → `shopifyWebhookService` → `ShopifyWebhookAdapter` → mock or unavailable adapter → `ShopifyWebhookEvent` / `ShopifyWebhookResult`.

The foundation does not expose a live HTTP endpoint, verify HMAC signatures, call the Shopify Admin or Storefront API, enqueue background jobs, persist events, change routing, or change authentication. It only defines typed contracts, validates and normalizes a webhook request shape into a domain event, and delegates the receive/verify and route steps to a non-live adapter.

## Supported topics and domains

`ShopifyWebhookTopic` and `ShopifyWebhookDomain` (`src/types/shopifyWebhook.ts`) cover the topic families the platform expects to support:

| Domain | Topics |
| --- | --- |
| `orders` | `orders/create`, `orders/updated`, `orders/cancelled`, `orders/fulfilled` |
| `customers` | `customers/create`, `customers/update`, `customers/delete` |
| `products` | `products/create`, `products/update`, `products/delete` |
| `inventory` | `inventory_levels/update`, `inventory_items/update` |
| `pricing` | `metafields/create`, `metafields/update`, `metafields/delete` |
| `fulfillments` | `fulfillments/create`, `fulfillments/update` |

`SHOPIFY_WEBHOOK_TOPIC_DOMAINS` (`src/services/shopifyWebhook/shopifyWebhookService.ts`) is the single source of truth mapping every supported topic to its domain. Adding a new topic requires updating this map, the `ShopifyWebhookTopic` union, and `shopifyWebhookTopicSchema` together.

## Adapter boundary

`src/adapters/shopifyWebhook/shopifyWebhookAdapter.ts` defines the `ShopifyWebhookAdapter` interface with two methods:

- `verifyAndReceive(request)` — the future home of HMAC signature verification and shop-domain allow-listing. It returns a `ShopifyWebhookResult` describing whether the request was accepted.
- `routeEvent(event)` — the future home of dispatching a normalized event to a domain-specific handler (order sync, customer sync, inventory sync, pricing sync, fulfillment sync, or a product/catalog handler).

Included adapters are intentionally non-live:

- `mockShopifyWebhookAdapter` returns deterministic `validated`/`routed` results for tests and future orchestration work.
- `unavailableShopifyWebhookAdapter` returns `adapter-unavailable` with a retryable error and explicitly records that no live verification or routing occurred.

A future live adapter (real HMAC verification via `X-Shopify-Hmac-Sha256`, shop-domain allow-listing, and dispatch to the existing Shopify sync services) must be added behind this interface without changing the service or hook contracts.

## Service responsibilities

`src/services/shopifyWebhook/shopifyWebhookService.ts` owns validation, normalization, and orchestration only:

1. `receiveWebhook(request)` validates the request with `shopifyWebhookRequestSchema`, normalizes it into a `ShopifyWebhookEvent` via `normalizeShopifyWebhookRequest`, and delegates the verify/receive step to the configured adapter.
2. `normalizeShopifyWebhookRequest(request)` is a pure mapping function: it resolves the topic's domain from `SHOPIFY_WEBHOOK_TOPIC_DOMAINS`, parses `rawBody` as JSON into `payload`, and builds a `ShopifyWebhookEvent`. It throws `ShopifyWebhookNormalizationError` for an unsupported topic or malformed JSON body; `receiveWebhook` catches this and returns a `failed` result carrying the corresponding `ShopifyWebhookError` instead of throwing.
3. `routeWebhookEvent(event)` validates the event with `shopifyWebhookEventSchema` and delegates routing to the configured adapter.
4. Adapter responses are validated with `shopifyWebhookResultSchema`, falling back to the locally normalized topic/domain/event when the adapter does not supply them.

The service does not verify signatures, call Shopify, dispatch to real domain handlers, persist events, or deduplicate retried webhook deliveries.

## Normalization flow

1. A caller builds a `ShopifyWebhookRequest`: a `requestId`, `ShopifyWebhookHeaders` (topic, shop domain, webhook id, and optional API version / triggered-at / HMAC signature fields captured for a future live adapter), and the raw JSON body string.
2. `shopifyWebhookService.receiveWebhook` validates the request shape and topic against `shopifyWebhookRequestSchema`.
3. `normalizeShopifyWebhookRequest` resolves the event's `domain` from its `topic`, parses the body, and produces a `ShopifyWebhookEvent` with a deterministic `id` derived from the webhook id.
4. The adapter's `verifyAndReceive` is invoked; its result is merged with the normalized event and validated against `shopifyWebhookResultSchema`.
5. A caller may then pass the resulting `event` to `shopifyWebhookService.routeWebhookEvent`, which delegates to the adapter's `routeEvent` for dispatch.

## Typed hooks

`src/hooks/shopifyWebhook/useShopifyWebhook.ts` exposes two React hooks sharing a generic async-state helper:

- `useShopifyWebhook()` wraps `shopifyWebhookService.receiveWebhook`.
- `useShopifyWebhookRouting()` wraps `shopifyWebhookService.routeWebhookEvent`.

Both return `{ result, loading, error, run }` and do not perform any live network call themselves; `run` simply invokes the service function.

## Future extension points

- A live adapter performing HMAC-SHA256 verification against the Shopify webhook secret and shop-domain allow-listing.
- A real HTTP route (e.g. `/webhooks/shopify/:topic`) that constructs a `ShopifyWebhookRequest` from the incoming request and calls `shopifyWebhookService.receiveWebhook`.
- Domain-specific routing from `routeEvent` into the existing `shopifyOrderService`, `shopifyCustomer`, `shopifyInventoryService`, `shopifyPricingService`, and fulfillment sync services.
- Idempotency/deduplication tracking keyed by `webhookId`.
- Background job orchestration and retry/backoff for failed or unavailable deliveries.
- Persistence of received events and routing outcomes for observability.

## Explicit non-goals

This foundation intentionally does not implement a live webhook HTTP endpoint, HMAC signature verification, Shopify API calls, background jobs, database persistence, UI changes, routing changes, or authentication.
