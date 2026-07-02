import type { ShopifyJob, ShopifyJobResult, ShopifyJobStatus } from '@/types';

const fallbackNow = '2026-07-02T00:00:00.000Z';

export interface ShopifyJobQueueAdapter {
  enqueueJob(job: ShopifyJob): Promise<ShopifyJobResult>;
  cancelJob(jobId: string, requestId: string): Promise<ShopifyJobResult>;
  getJobStatus(jobId: string, requestId: string): Promise<ShopifyJobResult>;
}

function unavailableResult(jobId: string, requestId: string): ShopifyJobResult {
  return {
    requestId,
    jobId,
    status: 'adapter-unavailable',
    job: null,
    errors: [{ code: 'adapter-unavailable', message: 'Shopify job queue adapter is not connected; no queue, worker, or persistence layer exists.', jobId, retryable: true }],
    metadata: { source: 'unavailable-shopify-job-queue-adapter' },
  };
}

export const unavailableShopifyJobQueueAdapter: ShopifyJobQueueAdapter = {
  async enqueueJob(job) { return unavailableResult(job.jobId, job.requestId); },
  async cancelJob(jobId, requestId) { return unavailableResult(jobId, requestId); },
  async getJobStatus(jobId, requestId) { return unavailableResult(jobId, requestId); },
};

/**
 * In-memory, per-instance simulation only. It never opens a real queue, worker,
 * scheduler, or persistence layer, and its state does not survive past the
 * lifetime of the adapter instance that created it.
 */
export function createMockShopifyJobQueueAdapter(): ShopifyJobQueueAdapter {
  const jobs = new Map<string, ShopifyJob>();

  function notFoundResult(jobId: string, requestId: string): ShopifyJobResult {
    return {
      requestId,
      jobId,
      status: 'failed',
      job: null,
      errors: [{ code: 'not-found', message: `No dry-run job "${jobId}" is registered in the mock queue.`, jobId, retryable: false }],
      metadata: { source: 'mock-shopify-job-queue-adapter' },
    };
  }

  return {
    async enqueueJob(job) {
      const status: ShopifyJobStatus = job.status === 'ready' ? 'dry-run' : job.status;
      const stored: ShopifyJob = { ...job, status, updatedAt: fallbackNow };
      jobs.set(job.jobId, stored);
      return { requestId: job.requestId, jobId: job.jobId, status, job: stored, errors: [], metadata: { source: 'mock-shopify-job-queue-adapter' } };
    },
    async cancelJob(jobId, requestId) {
      const existing = jobs.get(jobId);
      if (!existing) return notFoundResult(jobId, requestId);
      const terminalStatuses: ShopifyJobStatus[] = ['cancelled', 'failed'];
      if (terminalStatuses.includes(existing.status)) {
        return {
          requestId,
          jobId,
          status: existing.status,
          job: existing,
          errors: [{ code: 'invalid-status-transition', message: `Job "${jobId}" is already in a terminal status ("${existing.status}") and cannot be cancelled.`, jobId, retryable: false }],
          metadata: { source: 'mock-shopify-job-queue-adapter' },
        };
      }
      const cancelled: ShopifyJob = { ...existing, status: 'cancelled', updatedAt: fallbackNow };
      jobs.set(jobId, cancelled);
      return { requestId, jobId, status: 'cancelled', job: cancelled, errors: [], metadata: { source: 'mock-shopify-job-queue-adapter' } };
    },
    async getJobStatus(jobId, requestId) {
      const existing = jobs.get(jobId);
      if (!existing) return notFoundResult(jobId, requestId);
      return { requestId, jobId, status: existing.status, job: existing, errors: [], metadata: { source: 'mock-shopify-job-queue-adapter' } };
    },
  };
}

export const mockShopifyJobQueueAdapter = createMockShopifyJobQueueAdapter();
