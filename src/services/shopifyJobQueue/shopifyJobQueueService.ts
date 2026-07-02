import { unavailableShopifyJobQueueAdapter, type ShopifyJobQueueAdapter } from '@/adapters/shopifyJobQueue';
import { shopifyJobRequestSchema, shopifyJobResultSchema, shopifyJobSchema } from '@/schemas/shopifyJobQueue.schema';
import { shopifySyncOrchestratorService, type ShopifySyncOrchestratorService } from '@/services/shopifySyncOrchestrator';
import type { ShopifyJob, ShopifyJobError, ShopifyJobExecution, ShopifyJobPriority, ShopifyJobRequest, ShopifyJobResult, ShopifyJobStatus, ShopifyJobType, ShopifySyncExecutionPlan, ShopifySyncOperationRequest } from '@/types';

export interface ShopifyJobQueueService {
  buildJobDefinition(request: ShopifyJobRequest): ShopifyJob;
  queueJob(request: ShopifyJobRequest): Promise<ShopifyJobResult>;
  queueJobs(requests: ShopifyJobRequest[]): Promise<ShopifyJobResult[]>;
  cancelJob(jobId: string, requestId: string): Promise<ShopifyJobResult>;
  getJobStatus(jobId: string, requestId: string): Promise<ShopifyJobResult>;
}

const fallbackNow = '2026-07-02T00:00:00.000Z';
const nowFor = (value?: string) => value ?? fallbackNow;
const resolvedJobStatuses: ShopifyJobStatus[] = ['queued', 'dry-run'];
const priorityWeight: Record<ShopifyJobPriority, number> = { critical: 3, high: 2, normal: 1, low: 0 };

function buildPreviewPlan(orchestrator: ShopifySyncOrchestratorService, jobId: string, requestId: string, jobType: ShopifyJobType, payload: ShopifySyncOperationRequest): ShopifySyncExecutionPlan | undefined {
  if (jobType === 'sync-orchestrator') return undefined;
  return orchestrator.buildExecutionPlan({
    requestId: `${requestId}-preview`,
    dryRun: true,
    operations: [{ operationId: jobId, operation: jobType, request: payload }],
  });
}

export function createShopifyJobQueueService(adapter: ShopifyJobQueueAdapter = unavailableShopifyJobQueueAdapter, orchestrator: ShopifySyncOrchestratorService = shopifySyncOrchestratorService): ShopifyJobQueueService {
  function buildJobDefinition(request: ShopifyJobRequest, sequence = 1): ShopifyJob {
    const validated = shopifyJobRequestSchema.parse(request);
    const jobId = validated.jobId ?? `${validated.requestId}-${validated.jobType}-job-${sequence}`;
    const createdAt = nowFor(validated.requestedAt);
    const plan = buildPreviewPlan(orchestrator, jobId, validated.requestId, validated.jobType, validated.payload);
    const previewExecution: ShopifyJobExecution = { attempt: 0, status: 'planned', dryRun: true, plan, errors: [], metadata: { source: 'shopifyJobQueueService', attributes: { kind: 'preview' } } };
    return shopifyJobSchema.parse({
      jobId,
      requestId: validated.requestId,
      jobType: validated.jobType,
      priority: validated.priority ?? 'normal',
      status: 'planned',
      dryRun: true,
      sequence,
      payload: validated.payload,
      dependsOn: validated.dependsOn ?? [],
      executions: [previewExecution],
      retry: validated.retry,
      createdAt,
      updatedAt: createdAt,
      metadata: { ...validated.metadata, source: 'shopifyJobQueueService' },
    });
  }

  async function resolveDependencies(job: ShopifyJob, batch: Map<string, ShopifyJob>): Promise<{ status: 'ready' | 'blocked'; errors: ShopifyJobError[] }> {
    const errors: ShopifyJobError[] = [];
    let blocked = false;
    for (const dependency of job.dependsOn) {
      const batchDependency = batch.get(dependency.dependsOnJobId);
      const resolved = batchDependency
        ? resolvedJobStatuses.includes(batchDependency.status)
        : resolvedJobStatuses.includes((await adapter.getJobStatus(dependency.dependsOnJobId, job.requestId)).status);
      if (!resolved && dependency.required) {
        blocked = true;
        errors.push({ code: 'dependency-unresolved', message: `Dependency job "${dependency.dependsOnJobId}" is not resolved.`, jobId: job.jobId, dependsOnJobId: dependency.dependsOnJobId, retryable: true });
      }
    }
    return { status: blocked ? 'blocked' : 'ready', errors };
  }

  function topologicalOrder(jobs: ShopifyJob[]): { order: ShopifyJob[]; cycleMembers: Set<string> } {
    const byId = new Map(jobs.map((job) => [job.jobId, job]));
    const inDegree = new Map<string, number>(jobs.map((job) => [job.jobId, 0]));
    const dependents = new Map<string, string[]>(jobs.map((job) => [job.jobId, []]));
    for (const job of jobs) {
      for (const dependency of job.dependsOn) {
        if (!byId.has(dependency.dependsOnJobId)) continue;
        inDegree.set(job.jobId, (inDegree.get(job.jobId) ?? 0) + 1);
        dependents.get(dependency.dependsOnJobId)?.push(job.jobId);
      }
    }
    const sortReady = (list: ShopifyJob[]) => [...list].sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority] || a.sequence - b.sequence);
    let queue = sortReady(jobs.filter((job) => (inDegree.get(job.jobId) ?? 0) === 0));
    const visited = new Set<string>();
    const order: ShopifyJob[] = [];
    while (queue.length) {
      const next = queue.shift();
      if (!next || visited.has(next.jobId)) continue;
      visited.add(next.jobId);
      order.push(next);
      const newlyReady: ShopifyJob[] = [];
      for (const dependentId of dependents.get(next.jobId) ?? []) {
        const remaining = (inDegree.get(dependentId) ?? 0) - 1;
        inDegree.set(dependentId, remaining);
        const dependentJob = byId.get(dependentId);
        if (remaining === 0 && dependentJob) newlyReady.push(dependentJob);
      }
      queue = sortReady([...queue, ...newlyReady]);
    }
    const cycleMembers = new Set(jobs.filter((job) => !visited.has(job.jobId)).map((job) => job.jobId));
    return { order: [...order, ...jobs.filter((job) => cycleMembers.has(job.jobId))], cycleMembers };
  }

  async function queueJob(request: ShopifyJobRequest): Promise<ShopifyJobResult> {
    const job = buildJobDefinition(request, 1);
    const resolution = await resolveDependencies(job, new Map());
    const preparedJob: ShopifyJob = { ...job, status: resolution.status, updatedAt: fallbackNow };
    const result = await adapter.enqueueJob(preparedJob);
    return shopifyJobResultSchema.parse({ ...result, errors: [...resolution.errors, ...result.errors] });
  }

  async function queueJobs(requests: ShopifyJobRequest[]): Promise<ShopifyJobResult[]> {
    const jobs = requests.map((request, index) => buildJobDefinition(request, index + 1));
    const { order, cycleMembers } = topologicalOrder(jobs);
    const resolvedInBatch = new Map<string, ShopifyJob>();
    const results: ShopifyJobResult[] = [];
    for (const job of order) {
      if (cycleMembers.has(job.jobId)) {
        const error: ShopifyJobError = { code: 'dependency-cycle', message: `Job "${job.jobId}" is part of a dependency cycle and was not queued.`, jobId: job.jobId, retryable: false };
        const failedJob: ShopifyJob = { ...job, status: 'failed', updatedAt: fallbackNow };
        results.push(shopifyJobResultSchema.parse({ requestId: job.requestId, jobId: job.jobId, status: 'failed', job: failedJob, errors: [error], metadata: { source: 'shopifyJobQueueService' } }));
        continue;
      }
      const resolution = await resolveDependencies(job, resolvedInBatch);
      const preparedJob: ShopifyJob = { ...job, status: resolution.status, updatedAt: fallbackNow };
      const result = await adapter.enqueueJob(preparedJob);
      const parsed = shopifyJobResultSchema.parse({ ...result, errors: [...resolution.errors, ...result.errors] });
      if (parsed.job) resolvedInBatch.set(parsed.job.jobId, parsed.job);
      results.push(parsed);
    }
    return results;
  }

  async function cancelJob(jobId: string, requestId: string): Promise<ShopifyJobResult> {
    return shopifyJobResultSchema.parse(await adapter.cancelJob(jobId, requestId));
  }

  async function getJobStatus(jobId: string, requestId: string): Promise<ShopifyJobResult> {
    return shopifyJobResultSchema.parse(await adapter.getJobStatus(jobId, requestId));
  }

  return { buildJobDefinition: (request) => buildJobDefinition(request, 1), queueJob, queueJobs, cancelJob, getJobStatus };
}

export const shopifyJobQueueService = createShopifyJobQueueService();
