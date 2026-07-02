# Shopify Webhook HMAC Verification Foundation

The Shopify webhook HMAC verification foundation defines an architecture-only boundary for validating inbound Shopify webhook signatures before any future webhook endpoint normalizes or routes events. It does not introduce live webhook endpoints, Shopify API calls, background jobs, persistence, routing, authentication, UI, or secret management.

## Layering

`ShopifyWebhookVerificationRequest` → `shopifyWebhookVerificationService` → `ShopifyWebhookVerificationAdapter` → future crypto provider

- `src/types/shopifyWebhookVerification.ts` owns the verification request, result, status, failure, and failure-reason contracts.
- `src/schemas/shopifyWebhookVerification.schema.ts` provides Zod validation for public verification contracts.
- `src/services/shopifyWebhookVerification/shopifyWebhookVerificationService.ts` owns request pre-validation, timestamp metadata checks, HMAC header shape validation, and adapter orchestration.
- `src/adapters/shopifyWebhookVerification/` owns the crypto boundary with mock and unavailable adapter implementations.
- `tests/shopify-webhook-verification-foundation.test.mjs` covers contract validation, pre-validation failures, mock verification, signature mismatch, and unavailable adapter behavior.

## Contract responsibilities

`ShopifyWebhookVerificationRequest` requires:

- `rawBody`: the exact raw payload string that future endpoint code receives from Shopify. Parsed payloads are intentionally out of scope because Shopify HMAC verification must use the raw bytes.
- `hmacHeader`: the future endpoint's `X-Shopify-Hmac-Sha256` header value.
- `secretReference`: an opaque reference for a future adapter to resolve the webhook shared secret. The foundation does not store, fetch, or manage secrets.
- `receivedAt` and `triggeredAt`: optional timestamp metadata validated before adapter delegation when present.

`ShopifyWebhookVerificationResult` returns:

- `status`: `verified`, `failed`, or `adapter-unavailable`.
- `verified`: a boolean summary for callers that should not infer success from missing failures.
- `reason`: the primary failure reason, or `null` when verified.
- `failures`: detailed failure records with field paths and retryability.
- timestamp metadata copied through to make audit trails deterministic for future endpoints.

## Failure reasons

The service and adapter boundary support these explicit reasons:

- `missing-hmac-header`
- `invalid-hmac-header`
- `missing-raw-payload`
- `missing-secret-reference`
- `signature-mismatch`
- `timestamp-invalid`
- `adapter-unavailable`
- `validation-error`
- `unknown`

## Adapter boundary

The verification adapter intentionally owns cryptographic comparison so the service does not import Node crypto, Web Crypto, Shopify SDKs, or secret providers. Current implementations are safe placeholders:

- `unavailableShopifyWebhookVerificationAdapter` returns `adapter-unavailable` and confirms no cryptographic verification was performed.
- `mockShopifyWebhookVerificationAdapter` accepts only the deterministic `mock-valid-shopify-hmac` header and otherwise returns `signature-mismatch`.

A future live adapter can replace the mock/unavailable adapter by implementing `ShopifyWebhookVerificationAdapter.verifySignature(request)` and performing constant-time HMAC SHA-256 comparison over `request.rawBody` using the resolved secret behind `request.secretReference`.

## Out of scope

This foundation intentionally does not implement live webhook endpoints, Shopify API calls, background jobs, database persistence, UI changes, routing changes, authentication, or secret management. Future endpoint work must call this service before normalizing or routing webhook events.
