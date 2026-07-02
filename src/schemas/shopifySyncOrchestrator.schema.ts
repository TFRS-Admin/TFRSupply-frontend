import { z } from 'zod';
import type { ShopifySyncExecutionError, ShopifySyncExecutionPlan, ShopifySyncExecutionStatus, ShopifySyncOperation, ShopifySyncOperationResult, ShopifySyncOrchestratorRequest, ShopifySyncOrchestratorResult } from '@/types/shopifySyncOrchestrator';
import { metadataSchema } from './common.schema';
import { shopifyCatalogSyncRequestSchema, shopifyCatalogSyncResultSchema } from './shopifyCatalog.schema';
import { shopifyCustomerRequestSchema, shopifyCustomerResultSchema } from './shopifyCustomer.schema';
import { shopifyFulfillmentRequestSchema, shopifyFulfillmentResultSchema } from './shopifyFulfillment.schema';
import { shopifyInventorySyncRequestSchema, shopifyInventorySyncResultSchema } from './shopifyInventory.schema';
import { shopifyOrderRequestSchema, shopifyOrderResultSchema } from './shopifyOrder.schema';
import { shopifyPricingSyncRequestSchema, shopifyPricingSyncResultSchema } from './shopifyPricing.schema';
import { shopifySyncRequestSchema, shopifySyncResultSchema } from './shopifySync.schema';
import { shopifyWebhookRequestSchema, shopifyWebhookResultSchema } from './shopifyWebhook.schema';
import { shopifyWebhookVerificationRequestSchema, shopifyWebhookVerificationResultSchema } from './shopifyWebhookVerification.schema';

const nonEmptyString = z.string().min(1);
export const shopifySyncExecutionStatusSchema = z.enum(['planned', 'dry-run', 'succeeded', 'failed', 'partial', 'adapter-unavailable']) satisfies z.ZodType<ShopifySyncExecutionStatus>;
export const shopifySyncOperationSchema = z.enum(['customer', 'order', 'catalog', 'inventory', 'pricing', 'fulfillment', 'webhook', 'webhook-verification', 'sync-foundation']) satisfies z.ZodType<ShopifySyncOperation>;
export const shopifySyncExecutionErrorSchema = z.object({ code: z.enum(['validation-error', 'operation-failed', 'adapter-unavailable', 'unsupported-operation', 'unknown']), message: nonEmptyString, operationId: z.string().optional(), operation: shopifySyncOperationSchema.optional(), fieldPath: z.string().optional(), retryable: z.boolean(), metadata: metadataSchema.optional() }) as z.ZodType<ShopifySyncExecutionError>;

const requestSchemaByOperation = {
  customer: shopifyCustomerRequestSchema,
  order: shopifyOrderRequestSchema,
  catalog: shopifyCatalogSyncRequestSchema,
  inventory: shopifyInventorySyncRequestSchema,
  pricing: shopifyPricingSyncRequestSchema,
  fulfillment: shopifyFulfillmentRequestSchema,
  webhook: shopifyWebhookRequestSchema,
  'webhook-verification': shopifyWebhookVerificationRequestSchema,
  'sync-foundation': shopifySyncRequestSchema,
};

const baseOperationSchema = z.object({ operationId: z.string().optional(), dependsOn: z.array(nonEmptyString).optional(), enabled: z.boolean().optional(), metadata: metadataSchema.optional() });
const operationDefinitionSchema = z.union([
  baseOperationSchema.extend({ operation: z.literal('customer'), request: shopifyCustomerRequestSchema }),
  baseOperationSchema.extend({ operation: z.literal('order'), request: shopifyOrderRequestSchema }),
  baseOperationSchema.extend({ operation: z.literal('catalog'), request: shopifyCatalogSyncRequestSchema }),
  baseOperationSchema.extend({ operation: z.literal('inventory'), request: shopifyInventorySyncRequestSchema }),
  baseOperationSchema.extend({ operation: z.literal('pricing'), request: shopifyPricingSyncRequestSchema }),
  baseOperationSchema.extend({ operation: z.literal('fulfillment'), request: shopifyFulfillmentRequestSchema }),
  baseOperationSchema.extend({ operation: z.literal('webhook'), request: shopifyWebhookRequestSchema }),
  baseOperationSchema.extend({ operation: z.literal('webhook-verification'), request: shopifyWebhookVerificationRequestSchema }),
  baseOperationSchema.extend({ operation: z.literal('sync-foundation'), request: shopifySyncRequestSchema }),
]);

export const shopifySyncOrchestratorRequestSchema = z.object({ requestId: nonEmptyString, dryRun: z.literal(true), requestedAt: z.string().optional(), operations: z.array(operationDefinitionSchema).min(1), metadata: metadataSchema.optional() }) as unknown as z.ZodType<ShopifySyncOrchestratorRequest>;
export const shopifySyncOperationRequestSchema = z.unknown();
export const shopifySyncExecutionPlanSchema = z.object({ planId: nonEmptyString, requestId: nonEmptyString, status: shopifySyncExecutionStatusSchema, dryRun: z.literal(true), operations: z.array(z.object({ operationId: nonEmptyString, operation: shopifySyncOperationSchema, sequence: z.number().int().min(1), dependsOn: z.array(nonEmptyString), request: shopifySyncOperationRequestSchema, metadata: metadataSchema.optional() })), createdAt: nonEmptyString, metadata: metadataSchema.optional() }) as unknown as z.ZodType<ShopifySyncExecutionPlan>;
export const shopifySyncOperationResultSchema = z.object({ operationId: nonEmptyString, operation: shopifySyncOperationSchema, status: shopifySyncExecutionStatusSchema, startedAt: z.string().optional(), completedAt: z.string().optional(), skipped: z.boolean().optional(), serviceResult: z.unknown().nullable().optional(), errors: z.array(shopifySyncExecutionErrorSchema), metadata: metadataSchema.optional() }) as z.ZodType<ShopifySyncOperationResult>;
export const shopifySyncOrchestratorResultSchema = z.object({ requestId: nonEmptyString, plan: shopifySyncExecutionPlanSchema, status: shopifySyncExecutionStatusSchema, operationResults: z.array(shopifySyncOperationResultSchema), errors: z.array(shopifySyncExecutionErrorSchema), startedAt: nonEmptyString, completedAt: nonEmptyString, metadata: metadataSchema.optional() }) as z.ZodType<ShopifySyncOrchestratorResult>;
