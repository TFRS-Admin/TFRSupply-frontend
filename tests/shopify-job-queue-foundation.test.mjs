import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

const product = (overrides = {}) => ({
  id: 'navigator', label: 'Navigator Lightbar', slug: 'navigator-lightbar', title: 'Navigator Lightbar', sku: 'NVG-ROOT', verticalIds: ['police'], categoryIds: ['light-bars'], commerce: { sku_root: 'NVG', availability: 'Prototype inventory', price_display: '$1,250.00', sku_table: [{ sku: 'NVG-48', quantityAvailable: 7, shopifyVariantGid: 'gid://shopify/ProductVariant/48' }] }, shopify: { productId: 'shopify-product-1', productGid: 'gid://shopify/Product/1' },
  ...overrides,
});

const catalogPayload = (overrides = {}) => ({ requestId: 'catalog-payload-001', products: [product()], dryRun: true, requestedAt: '2026-07-02T00:00:00.000Z', ...overrides });

const jobRequest = (overrides = {}) => ({
  requestId: 'job-request-001',
  jobType: 'catalog',
  dryRun: true,
  requestedAt: '2026-07-02T00:00:00.000Z',
  payload: catalogPayload(),
  ...overrides,
});

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    service: await server.ssrLoadModule('/src/services/shopifyJobQueue/index.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/shopifyJobQueue/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifyJobQueue.schema.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifyJobQueue/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Shopify job queue foundation', () => {
  it('validates dry-run job requests and rejects live requests', () => {
    const parsed = modules.schemas.shopifyJobRequestSchema.parse(jobRequest());
    assert.equal(parsed.dryRun, true);
    assert.throws(() => modules.schemas.shopifyJobRequestSchema.parse(jobRequest({ dryRun: false })), /Invalid literal value/);
  });

  it('rejects unknown job types and priorities at the schema boundary', () => {
    assert.throws(() => modules.schemas.shopifyJobTypeSchema.parse('not-a-real-type'));
    assert.throws(() => modules.schemas.shopifyJobPrioritySchema.parse('urgent'));
    assert.doesNotThrow(() => modules.schemas.shopifyJobTypeSchema.parse('sync-orchestrator'));
  });

  it('builds deterministic job definitions with a stable generated jobId', () => {
    const svc = modules.service.createShopifyJobQueueService(modules.adapters.unavailableShopifyJobQueueAdapter);
    const job = svc.buildJobDefinition(jobRequest());
    assert.equal(job.jobId, 'job-request-001-catalog-job-1');
    assert.equal(job.status, 'planned');
    assert.equal(job.priority, 'normal');
    assert.deepEqual(job.dependsOn, []);
    assert.equal(job.executions.length, 1);
    assert.equal(job.executions[0].status, 'planned');
  });

  it('honors an explicit jobId when supplied', () => {
    const svc = modules.service.createShopifyJobQueueService(modules.adapters.unavailableShopifyJobQueueAdapter);
    const job = svc.buildJobDefinition(jobRequest({ jobId: 'custom-job-id' }));
    assert.equal(job.jobId, 'custom-job-id');
  });

  it('coordinates with the sync orchestrator to preview an execution plan without executing it', () => {
    const svc = modules.service.createShopifyJobQueueService(modules.adapters.unavailableShopifyJobQueueAdapter);
    const job = svc.buildJobDefinition(jobRequest());
    const plan = job.executions[0].plan;
    assert.equal(plan.dryRun, true);
    assert.equal(plan.operations.length, 1);
    assert.equal(plan.operations[0].operation, 'catalog');
    assert.equal(plan.operations[0].request.products[0].id, 'navigator');
  });

  it('skips the preview plan for sync-orchestrator jobs', () => {
    const svc = modules.service.createShopifyJobQueueService(modules.adapters.unavailableShopifyJobQueueAdapter);
    const job = svc.buildJobDefinition(jobRequest({ jobType: 'sync-orchestrator', payload: { requestId: 'orch-1', dryRun: true, operations: [] } }));
    assert.equal(job.executions[0].plan, undefined);
  });

  it('queues a dependency-free job as a dry-run through the mock adapter', async () => {
    const svc = modules.service.createShopifyJobQueueService(modules.adapters.createMockShopifyJobQueueAdapter());
    const result = await svc.queueJob(jobRequest());
    assert.equal(result.status, 'dry-run');
    assert.equal(result.job.status, 'dry-run');
    assert.equal(result.errors.length, 0);
  });

  it('returns adapter-unavailable without creating a real queue by default', async () => {
    const result = await modules.service.shopifyJobQueueService.queueJob(jobRequest());
    assert.equal(result.status, 'adapter-unavailable');
    assert.equal(result.errors[0].code, 'adapter-unavailable');
    assert.equal(result.job, null);
  });

  it('blocks a job with an unresolved required dependency', async () => {
    const svc = modules.service.createShopifyJobQueueService(modules.adapters.createMockShopifyJobQueueAdapter());
    const result = await svc.queueJob(jobRequest({ dependsOn: [{ dependsOnJobId: 'never-queued-job', required: true }] }));
    assert.equal(result.status, 'blocked');
    assert.equal(result.errors[0].code, 'dependency-unresolved');
  });

  it('does not block a job with an unresolved optional dependency', async () => {
    const svc = modules.service.createShopifyJobQueueService(modules.adapters.createMockShopifyJobQueueAdapter());
    const result = await svc.queueJob(jobRequest({ dependsOn: [{ dependsOnJobId: 'never-queued-job', required: false }] }));
    assert.equal(result.status, 'dry-run');
    assert.equal(result.errors.length, 0);
  });

  it('queues a dependency graph in deterministic dependency order', async () => {
    const svc = modules.service.createShopifyJobQueueService(modules.adapters.createMockShopifyJobQueueAdapter());
    const results = await svc.queueJobs([
      jobRequest({ requestId: 'batch-001', jobId: 'catalog-job', jobType: 'catalog', payload: catalogPayload() }),
      jobRequest({ requestId: 'batch-001', jobId: 'pricing-job', jobType: 'pricing', dependsOn: [{ dependsOnJobId: 'catalog-job', required: true }], payload: { requestId: 'pricing-payload-001', products: [product()], dryRun: true, requestedAt: '2026-07-02T00:00:00.000Z', defaultCurrencyCode: 'USD' } }),
    ]);
    assert.equal(results.length, 2);
    assert.equal(results[0].jobId, 'catalog-job');
    assert.equal(results[0].status, 'dry-run');
    assert.equal(results[1].jobId, 'pricing-job');
    assert.equal(results[1].status, 'dry-run');
    assert.equal(results[1].errors.length, 0);
  });

  it('detects a dependency cycle and fails every member without queueing them', async () => {
    const svc = modules.service.createShopifyJobQueueService(modules.adapters.createMockShopifyJobQueueAdapter());
    const results = await svc.queueJobs([
      jobRequest({ requestId: 'cycle-001', jobId: 'job-a', dependsOn: [{ dependsOnJobId: 'job-b', required: true }] }),
      jobRequest({ requestId: 'cycle-001', jobId: 'job-b', dependsOn: [{ dependsOnJobId: 'job-a', required: true }] }),
    ]);
    assert.equal(results.length, 2);
    for (const result of results) {
      assert.equal(result.status, 'failed');
      assert.equal(result.errors[0].code, 'dependency-cycle');
    }
  });

  it('orders queued batch jobs by priority when dependencies allow either order', async () => {
    const svc = modules.service.createShopifyJobQueueService(modules.adapters.createMockShopifyJobQueueAdapter());
    const results = await svc.queueJobs([
      jobRequest({ requestId: 'priority-001', jobId: 'low-job', priority: 'low' }),
      jobRequest({ requestId: 'priority-001', jobId: 'critical-job', priority: 'critical' }),
    ]);
    assert.deepEqual(results.map((result) => result.jobId), ['critical-job', 'low-job']);
  });

  it('queries job status after queueing through the mock adapter', async () => {
    const svc = modules.service.createShopifyJobQueueService(modules.adapters.createMockShopifyJobQueueAdapter());
    await svc.queueJob(jobRequest({ jobId: 'status-check-job' }));
    const status = await svc.getJobStatus('status-check-job', 'job-request-001');
    assert.equal(status.status, 'dry-run');
    assert.equal(status.job.jobId, 'status-check-job');
  });

  it('reports not-found for an unknown job in the mock adapter', async () => {
    const svc = modules.service.createShopifyJobQueueService(modules.adapters.createMockShopifyJobQueueAdapter());
    const status = await svc.getJobStatus('unknown-job', 'job-request-001');
    assert.equal(status.status, 'failed');
    assert.equal(status.errors[0].code, 'not-found');
  });

  it('cancels a queued job and moves it to a terminal cancelled status', async () => {
    const svc = modules.service.createShopifyJobQueueService(modules.adapters.createMockShopifyJobQueueAdapter());
    await svc.queueJob(jobRequest({ jobId: 'cancel-me-job' }));
    const cancelled = await svc.cancelJob('cancel-me-job', 'job-request-001');
    assert.equal(cancelled.status, 'cancelled');
    const status = await svc.getJobStatus('cancel-me-job', 'job-request-001');
    assert.equal(status.status, 'cancelled');
  });

  it('rejects cancelling a job that is already in a terminal status', async () => {
    const svc = modules.service.createShopifyJobQueueService(modules.adapters.createMockShopifyJobQueueAdapter());
    await svc.queueJob(jobRequest({ jobId: 'double-cancel-job' }));
    await svc.cancelJob('double-cancel-job', 'job-request-001');
    const secondCancel = await svc.cancelJob('double-cancel-job', 'job-request-001');
    assert.equal(secondCancel.status, 'cancelled');
    assert.equal(secondCancel.errors[0].code, 'invalid-status-transition');
  });

  it('returns adapter-unavailable for cancel and status calls without a connected adapter', async () => {
    const svc = modules.service.createShopifyJobQueueService(modules.adapters.unavailableShopifyJobQueueAdapter);
    const cancelled = await svc.cancelJob('any-job', 'job-request-001');
    const status = await svc.getJobStatus('any-job', 'job-request-001');
    assert.equal(cancelled.status, 'adapter-unavailable');
    assert.equal(status.status, 'adapter-unavailable');
    assert.equal(cancelled.errors[0].retryable, true);
  });

  it('keeps mock adapter state isolated per instance', async () => {
    const adapterOne = modules.adapters.createMockShopifyJobQueueAdapter();
    const adapterTwo = modules.adapters.createMockShopifyJobQueueAdapter();
    const svcOne = modules.service.createShopifyJobQueueService(adapterOne);
    await svcOne.queueJob(jobRequest({ jobId: 'isolated-job' }));
    const status = await adapterTwo.getJobStatus('isolated-job', 'job-request-001');
    assert.equal(status.status, 'failed');
    assert.equal(status.errors[0].code, 'not-found');
  });

  it('exposes typed hook entry points', () => {
    assert.equal(typeof modules.hooks.useShopifyJobQueue, 'function');
    assert.equal(typeof modules.hooks.useShopifyJobStatus, 'function');
    assert.equal(typeof modules.hooks.useShopifyJobDefinition, 'function');
  });
});
