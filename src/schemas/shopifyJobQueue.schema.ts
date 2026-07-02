import { z } from 'zod';
import type { ShopifyJob, ShopifyJobDependency, ShopifyJobError, ShopifyJobExecution, ShopifyJobPriority, ShopifyJobRequest, ShopifyJobResult, ShopifyJobStatus, ShopifyJobType } from '@/types/shopifyJobQueue';
import { metadataSchema } from './common.schema';
import { shopifySyncRetryMetadataSchema } from './shopifySync.schema';
import { shopifySyncExecutionPlanSchema, shopifySyncOperationRequestSchema, shopifySyncOperationSchema } from './shopifySyncOrchestrator.schema';

const nonEmptyString = z.string().min(1);

export const shopifyJobTypeSchema = z.union([shopifySyncOperationSchema, z.literal('sync-orchestrator')]) satisfies z.ZodType<ShopifyJobType>;
export const shopifyJobPrioritySchema = z.enum(['low', 'normal', 'high', 'critical']) satisfies z.ZodType<ShopifyJobPriority>;
export const shopifyJobStatusSchema = z.enum(['planned', 'blocked', 'ready', 'queued', 'dry-run', 'cancelled', 'adapter-unavailable', 'failed']) satisfies z.ZodType<ShopifyJobStatus>;

export const shopifyJobDependencySchema = z.object({
  dependsOnJobId: nonEmptyString,
  required: z.boolean(),
}) as z.ZodType<ShopifyJobDependency>;

export const shopifyJobErrorSchema = z.object({
  code: z.enum(['validation-error', 'dependency-cycle', 'dependency-unresolved', 'invalid-status-transition', 'adapter-unavailable', 'not-found', 'unknown']),
  message: nonEmptyString,
  jobId: z.string().optional(),
  dependsOnJobId: z.string().optional(),
  retryable: z.boolean(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyJobError>;

export const shopifyJobExecutionSchema = z.object({
  attempt: z.number().int().min(0),
  status: shopifyJobStatusSchema,
  dryRun: z.literal(true),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  plan: shopifySyncExecutionPlanSchema.optional(),
  errors: z.array(shopifyJobErrorSchema),
  metadata: metadataSchema.optional(),
}) as unknown as z.ZodType<ShopifyJobExecution>;

export const shopifyJobRequestSchema = z.object({
  requestId: nonEmptyString,
  jobId: z.string().optional(),
  jobType: shopifyJobTypeSchema,
  priority: shopifyJobPrioritySchema.optional(),
  dryRun: z.literal(true),
  requestedAt: z.string().optional(),
  payload: shopifySyncOperationRequestSchema,
  dependsOn: z.array(shopifyJobDependencySchema).optional(),
  retry: shopifySyncRetryMetadataSchema.optional(),
  metadata: metadataSchema.optional(),
}) as unknown as z.ZodType<ShopifyJobRequest>;

export const shopifyJobSchema = z.object({
  jobId: nonEmptyString,
  requestId: nonEmptyString,
  jobType: shopifyJobTypeSchema,
  priority: shopifyJobPrioritySchema,
  status: shopifyJobStatusSchema,
  dryRun: z.literal(true),
  sequence: z.number().int().min(1),
  payload: shopifySyncOperationRequestSchema,
  dependsOn: z.array(shopifyJobDependencySchema),
  executions: z.array(shopifyJobExecutionSchema),
  retry: shopifySyncRetryMetadataSchema.optional(),
  createdAt: nonEmptyString,
  updatedAt: nonEmptyString,
  metadata: metadataSchema.optional(),
}) as unknown as z.ZodType<ShopifyJob>;

export const shopifyJobResultSchema = z.object({
  requestId: nonEmptyString,
  jobId: nonEmptyString,
  status: shopifyJobStatusSchema,
  job: shopifyJobSchema.nullable(),
  errors: z.array(shopifyJobErrorSchema),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyJobResult>;
