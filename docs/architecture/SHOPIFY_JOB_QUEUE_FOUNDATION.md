# Shopify Job Queue Foundation

The Shopify job queue foundation is an architecture-only layer for describing, validating, and admitting asynchronous Shopify synchronization jobs. It establishes typed contracts, deterministic job definitions, dependency handling, and an adapter boundary that a future worker can consume. It does **not** implement a real queue, worker, scheduler, persistence layer, or background processing.

## Queue architecture

The intended boundary matches every other Shopify foundation in this repository:

React hooks → `shopifyJobQueueService` → `ShopifyJobQueueAdapter` → mock or unavailable adapter.

`shopifyJobQueueService` composes the existing `shopifySyncOrchestratorService` to preview how a queued job would execute, and it never duplicates orchestration, mapping, or validation logic owned by the catalog, inventory, pricing, customer, order, fulfillment, webhook, webhook verification, or sync-foundation services. A queued job's `payload` is the native request contract for the target Shopify operation (`ShopifySyncOperationRequest`), so each operation's own service remains the owner of validation and mapping when that job eventually runs.

No queue engine, message broker, or scheduler (BullMQ, RabbitMQ, Redis, cron, etc.) is introduced. "Queueing" in this foundation means: validate the request, build a deterministic `ShopifyJob` record, resolve its declared dependencies, and hand it to an adapter that only ever returns a dry-run/administrative result.

## Service responsibilities

`src/services/shopifyJobQueue/shopifyJobQueueService.ts` exposes:

- `buildJobDefinition(request)` — pure, synchronous, deterministic. Validates the request with `shopifyJobRequestSchema`, assigns a stable `jobId` when one is not supplied (`${requestId}-${jobType}-job-${sequence}`), and builds a `ShopifyJob` with an initial `planned` status and a preview `ShopifyJobExecution`.
- `queueJob(request)` — builds a job definition, resolves its dependencies, and delegates to the adapter's `enqueueJob`. Never executes the job's payload.
- `queueJobs(requests)` — batch entry point. Builds a dependency graph across the batch, detects cycles, computes a deterministic topological/priority order, and queues each non-cyclic job in that order.
- `cancelJob(jobId, requestId)` — delegates to the adapter's `cancelJob`. The service does not decide cancellation eligibility beyond forwarding the adapter's result; only the adapter (which is the sole holder of any queue state) knows the job's current status.
- `getJobStatus(jobId, requestId)` — delegates to the adapter's `getJobStatus` and validates the result with `shopifyJobResultSchema`.

The service never calls Shopify, never starts a timer, never retries, and never persists anything itself — all of that is explicitly out of scope for this foundation.

## Adapter boundary

`src/adapters/shopifyJobQueue/shopifyJobQueueAdapter.ts` defines the `ShopifyJobQueueAdapter` interface:

```ts
interface ShopifyJobQueueAdapter {
  enqueueJob(job: ShopifyJob): Promise<ShopifyJobResult>;
  cancelJob(jobId: string, requestId: string): Promise<ShopifyJobResult>;
  getJobStatus(jobId: string, requestId: string): Promise<ShopifyJobResult>;
}
```

Two adapters are provided, both intentionally incapable of creating a real queue:

- `unavailableShopifyJobQueueAdapter` — the default adapter used by `shopifyJobQueueService` when no adapter is injected. Every method returns `adapter-unavailable` with a retryable error and never touches a queue, network, or disk.
- `mockShopifyJobQueueAdapter` / `createMockShopifyJobQueueAdapter()` — an **in-memory, per-instance simulation** used for tests and local development. It stores the jobs it is given in a `Map` that lives only as long as the adapter instance, purely so `getJobStatus`/`cancelJob` have something deterministic to report back after a `queueJob(s)` call in the same test or session. This is not a persistence layer: the state is never written to disk, a database, or any process outside the adapter instance, and a new adapter instance starts empty. `createMockShopifyJobQueueAdapter()` is exported specifically so callers (including tests) can get an isolated instance rather than share global state.

A future live adapter (e.g. one backed by a real queue/broker) must be added behind this same interface without changing the service or hook contracts.

## Job lifecycle

`ShopifyJobStatus` models the admission lifecycle only — it stops before anything resembling execution:

| Status | Meaning |
| --- | --- |
| `planned` | `buildJobDefinition` produced a deterministic job record; nothing has been queued yet. |
| `blocked` | The job has at least one unresolved required dependency; it was recorded but not admitted for dispatch. |
| `ready` | Dependencies are resolved; the job is about to be handed to the adapter. |
| `queued` | Reserved for a future adapter that models an explicit "accepted, waiting to run" state. |
| `dry-run` | The adapter admitted the job into its (simulated) queue. `mockShopifyJobQueueAdapter.enqueueJob` is the one place that turns `ready` into `dry-run`, representing "successfully admitted." This is the terminal "successfully queued" state in this foundation — no adapter in this codebase ever transitions a job further, because nothing executes it. |
| `cancelled` | `cancelJob` succeeded; a terminal state. |
| `adapter-unavailable` | The configured adapter cannot accept jobs (the default behavior). |
| `failed` | The job could not be admitted — currently only used for dependency-cycle members and adapter-level not-found responses. |

A future worker layer would extend this lifecycle with genuine execution states (`running`, `succeeded`, `partial`, etc.) by building on top of `ShopifyJob`/`ShopifyJobExecution`; this foundation deliberately stops short of that.

## Dependency handling

Each `ShopifyJobRequest` may declare `dependsOn: ShopifyJobDependency[]`, where every entry is `{ dependsOnJobId, required }`.

- `queueJob` resolves dependencies by asking the adapter for each dependency's current status via `getJobStatus`. A dependency is considered resolved when its status is `queued` or `dry-run`. An unresolved **required** dependency blocks the job (`blocked` status, `dependency-unresolved` error) but the job is still recorded by the adapter so it can be queried or re-queued later. Unresolved optional (`required: false`) dependencies never block.
- `queueJobs` additionally builds a dependency graph across the batch itself (Kahn's algorithm), which does two things in one pass:
  - Produces a deterministic processing order: jobs with no unmet in-batch dependencies first, ties broken by `priority` (`critical` > `high` > `normal` > `low`) and then by declaration order (`sequence`).
  - Detects cycles: any job that never reaches zero in-degree (because it is part of, or downstream of, a cycle) is reported with a `dependency-cycle` error and status `failed`, and is never sent to the adapter.
- Dependencies that reference a job outside the current batch are resolved the same way `queueJob` resolves them — via `adapter.getJobStatus`.

## Retry metadata

`ShopifyJobRequest`/`ShopifyJob` reuse the existing `ShopifySyncRetryMetadata` contract (`attempt`, `maxAttempts`, `nextRetryAt`, `lastAttemptAt`, `backoffSeconds`) from the Shopify Sync Foundation instead of introducing a parallel shape. This foundation only carries that metadata through — it never sleeps, backs off, or re-dispatches a job itself. `ShopifyJobExecution.errors[].retryable` and the carried `retry` metadata are the inputs a future retry worker would use to decide whether and when to re-attempt a job.

## Coordination with the sync orchestrator

`buildJobDefinition` calls `shopifySyncOrchestratorService.buildExecutionPlan()` (a pure, synchronous function that performs no I/O and dispatches nothing) to compute a single-operation preview plan for the job's `jobType`/`payload`, and attaches it to the job's initial `ShopifyJobExecution.plan`. This lets a caller see exactly what the orchestrator would do with this job without ever calling `orchestrate()` (which executes operations). Jobs of type `sync-orchestrator` skip this preview, since the orchestrator does not build a plan for itself.

This is the extent of the coordination: the job queue foundation previews plans, it does not build or own a scheduler that drives the orchestrator.

## Future worker integration

A future worker/scheduler layer can be built entirely on top of this foundation by:

- Polling or subscribing to `ShopifyJob` records exposed by a real adapter (replacing `unavailableShopifyJobQueueAdapter`/`mockShopifyJobQueueAdapter`) that is backed by an actual queue and persistence layer.
- Using `ShopifyJob.dependsOn` and the batch ordering produced by `queueJobs` as the basis for real dependency-aware dispatch.
- Using `ShopifyJobExecution.plan` (built from `shopifySyncOrchestratorService.buildExecutionPlan`) as the execution plan to hand to `shopifySyncOrchestratorService.orchestrate()` when it is time to actually run the job.
- Recording genuine `ShopifyJobExecution` attempts (`running`, `succeeded`, `failed`, etc.) as the job actually executes, using `retry` metadata to decide on re-attempts.
- Introducing persistence, locking, and horizontal scaling concerns entirely inside the new adapter implementation, without changing `ShopifyJobQueueService`'s public contract.

## Explicit non-goals

This foundation intentionally does not implement background workers, queue engines (BullMQ, RabbitMQ, Redis, or otherwise), scheduling, retry workers, live Shopify API calls, database persistence, UI changes, or routing changes. The `mockShopifyJobQueueAdapter`'s in-memory `Map` exists solely to give tests and local development something deterministic to query within a single adapter instance's lifetime — it is not a persistence layer and must not be treated as one.
