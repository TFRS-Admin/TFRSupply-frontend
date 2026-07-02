import type { Metadata } from './common';
import type { ShopifySyncExecutionPlan, ShopifySyncOperation, ShopifySyncOperationRequest } from './shopifySyncOrchestrator';
import type { ShopifySyncRetryMetadata } from './shopifySync';

export type ShopifyJobType = ShopifySyncOperation | 'sync-orchestrator';
export type ShopifyJobPriority = 'low' | 'normal' | 'high' | 'critical';
export type ShopifyJobStatus = 'planned' | 'blocked' | 'ready' | 'queued' | 'dry-run' | 'cancelled' | 'adapter-unavailable' | 'failed';

export interface ShopifyJobDependency {
  dependsOnJobId: string;
  required: boolean;
}

export interface ShopifyJobError {
  code: 'validation-error' | 'dependency-cycle' | 'dependency-unresolved' | 'invalid-status-transition' | 'adapter-unavailable' | 'not-found' | 'unknown';
  message: string;
  jobId?: string;
  dependsOnJobId?: string;
  retryable: boolean;
  metadata?: Metadata;
}

export interface ShopifyJobExecution {
  attempt: number;
  status: ShopifyJobStatus;
  dryRun: true;
  startedAt?: string;
  completedAt?: string;
  plan?: ShopifySyncExecutionPlan;
  errors: ShopifyJobError[];
  metadata?: Metadata;
}

export interface ShopifyJobRequest {
  requestId: string;
  jobId?: string;
  jobType: ShopifyJobType;
  priority?: ShopifyJobPriority;
  dryRun: true;
  requestedAt?: string;
  payload: ShopifySyncOperationRequest;
  dependsOn?: ShopifyJobDependency[];
  retry?: ShopifySyncRetryMetadata;
  metadata?: Metadata;
}

export interface ShopifyJob {
  jobId: string;
  requestId: string;
  jobType: ShopifyJobType;
  priority: ShopifyJobPriority;
  status: ShopifyJobStatus;
  dryRun: true;
  sequence: number;
  payload: ShopifySyncOperationRequest;
  dependsOn: ShopifyJobDependency[];
  executions: ShopifyJobExecution[];
  retry?: ShopifySyncRetryMetadata;
  createdAt: string;
  updatedAt: string;
  metadata?: Metadata;
}

export interface ShopifyJobResult {
  requestId: string;
  jobId: string;
  status: ShopifyJobStatus;
  job: ShopifyJob | null;
  errors: ShopifyJobError[];
  metadata?: Metadata;
}
