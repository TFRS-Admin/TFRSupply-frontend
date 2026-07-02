# Shopify Synchronization Orchestrator Foundation

The Shopify synchronization orchestrator is an architecture-only coordination layer for existing Shopify synchronization foundations. It validates one orchestration request, builds a deterministic execution plan, invokes existing dry-run services, aggregates service results, and returns execution metadata. It does **not** call Shopify directly.

## Overall synchronization architecture

The intended boundary remains:

React hooks → `shopifySyncOrchestratorService` → existing Shopify services → existing adapters → mock or unavailable adapter

The orchestrator composes these existing foundations:

- Shopify Sync Foundation
- Shopify Customer Integration
- Shopify Order Integration
- Shopify Catalog Synchronization
- Shopify Inventory Synchronization
- Shopify Pricing Synchronization
- Shopify Fulfillment Foundation
- Shopify Webhook Foundation
- Shopify Webhook HMAC Verification Foundation

The orchestrator never remaps products, quotes, inventory, pricing, fulfillments, webhooks, or HMAC payloads. Each operation carries the native request contract for the target service, and the target service remains the owner of validation, mapping, service metadata, and adapter interaction.

## Execution planning

`ShopifySyncOrchestratorRequest` contains a dry-run-only list of operations. `buildExecutionPlan()` validates the request with Zod, filters disabled operations, assigns stable operation IDs when omitted, preserves declared dependencies, and emits a `ShopifySyncExecutionPlan` with deterministic metadata.

The current foundation records dependencies for future schedulers and workers but intentionally executes operations in plan order only. No background jobs, queues, topological scheduler, or retry worker is introduced in this issue.

## Service orchestration

`shopifySyncOrchestratorService.orchestrate()` performs these steps:

1. Validate the orchestration request.
2. Build an execution plan.
3. Dispatch each operation to the existing service for that operation type.
4. Preserve each native service result on `ShopifySyncOperationResult.serviceResult`.
5. Normalize operation-level status into orchestration statuses.
6. Aggregate errors and execution metadata into `ShopifySyncOrchestratorResult`.

The default service instance uses the repository's existing services, which currently resolve through safe mock or unavailable adapters. Tests can inject mocked service dependencies via `createShopifySyncOrchestratorService()` without replacing the public orchestrator contract.

## Adapter boundaries

The orchestrator has no Shopify Admin API, Storefront API, SDK, credential, secret, HTTP, or persistence dependency. Live behavior must remain behind the existing adapter interfaces for catalog, inventory, pricing, customers, orders, fulfillments, webhooks, webhook verification, and sync-foundation operations.

If a future live adapter is introduced, the orchestrator should continue to call only service methods. It should not import Shopify SDKs, build GraphQL mutations, sign webhook requests, read credentials, persist execution state, or own API retry behavior.

## Future live synchronization flow

A future live flow can build on this foundation by adding live adapters behind the existing service interfaces and then adding a separate scheduler or worker layer that consumes `ShopifySyncExecutionPlan` records. The Shopify Job Queue Foundation (`docs/architecture/SHOPIFY_JOB_QUEUE_FOUNDATION.md`) builds one layer toward that future flow: `shopifyJobQueueService` wraps `buildExecutionPlan()` to preview per-job execution plans and models dependency-aware admission, but it still stops short of dispatching, scheduling, or executing anything — it is not the worker layer described below. That future layer should:

- Resolve dependency ordering before dispatch.
- Persist plan and operation state outside this pure frontend foundation.
- Route retryable failures into a queue or worker system.
- Continue to use the existing service contracts for validation and mapping.
- Keep credentials and Shopify API calls inside approved adapter implementations.

## Retry strategy

This foundation only carries retryability metadata surfaced by downstream services. It does not sleep, retry, enqueue, back off, or schedule work. Future retry workers should use `ShopifySyncExecutionError.retryable`, native service error metadata, operation IDs, and dependency information from `ShopifySyncExecutionPlan` to decide when and how to retry.

## Explicit non-goals

This foundation intentionally does not implement live Shopify API calls, background jobs, queue processing, scheduling, retry workers, authentication, OAuth, database persistence, UI changes, routing changes, or duplicate synchronization logic.
