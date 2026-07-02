import { z } from 'zod';
import type {
  ShopifySyncAdminDashboardData,
  ShopifySyncAdminDashboardHmacSection,
  ShopifySyncAdminDashboardJobQueueSection,
  ShopifySyncAdminDashboardOrchestratorSection,
  ShopifySyncAdminDashboardSummary,
  ShopifySyncAdminDashboardWebhookSection,
} from '@/types/shopifySyncAdminDashboard';
import { metadataSchema } from './common.schema';
import { shopifyCatalogSyncResultSchema } from './shopifyCatalog.schema';
import { shopifyCustomerResultSchema } from './shopifyCustomer.schema';
import { shopifyFulfillmentResultSchema } from './shopifyFulfillment.schema';
import { shopifyInventorySyncResultSchema } from './shopifyInventory.schema';
import { shopifyJobResultSchema } from './shopifyJobQueue.schema';
import { shopifyOrderResultSchema } from './shopifyOrder.schema';
import { shopifyPricingSyncResultSchema } from './shopifyPricing.schema';
import { shopifySyncExecutionPlanSchema, shopifySyncOrchestratorResultSchema } from './shopifySyncOrchestrator.schema';
import { shopifyWebhookResultSchema } from './shopifyWebhook.schema';
import { shopifyWebhookVerificationResultSchema } from './shopifyWebhookVerification.schema';

const nonEmptyString = z.string().min(1);
const nonNegativeInt = z.number().int().nonnegative();

export const shopifySyncAdminDashboardOrchestratorSectionSchema = z.object({
  plan: shopifySyncExecutionPlanSchema,
  result: shopifySyncOrchestratorResultSchema,
}) as z.ZodType<ShopifySyncAdminDashboardOrchestratorSection>;

export const shopifySyncAdminDashboardJobQueueSectionSchema = z.object({
  jobs: z.array(shopifyJobResultSchema),
}) as z.ZodType<ShopifySyncAdminDashboardJobQueueSection>;

export const shopifySyncAdminDashboardWebhookSectionSchema = z.object({
  received: shopifyWebhookResultSchema,
  routed: shopifyWebhookResultSchema,
}) as z.ZodType<ShopifySyncAdminDashboardWebhookSection>;

export const shopifySyncAdminDashboardHmacSectionSchema = z.object({
  valid: shopifyWebhookVerificationResultSchema,
  invalid: shopifyWebhookVerificationResultSchema,
}) as z.ZodType<ShopifySyncAdminDashboardHmacSection>;

export const shopifySyncAdminDashboardSummarySchema = z.object({
  sectionCount: nonNegativeInt,
  operationCount: nonNegativeInt,
  jobCount: nonNegativeInt,
  errorCount: nonNegativeInt,
  statusCounts: z.record(nonNegativeInt),
}) as z.ZodType<ShopifySyncAdminDashboardSummary>;

export const shopifySyncAdminDashboardDataSchema = z.object({
  generatedAt: nonEmptyString,
  orchestrator: shopifySyncAdminDashboardOrchestratorSectionSchema,
  jobQueue: shopifySyncAdminDashboardJobQueueSectionSchema,
  catalog: shopifyCatalogSyncResultSchema,
  inventory: shopifyInventorySyncResultSchema,
  pricing: shopifyPricingSyncResultSchema,
  customer: shopifyCustomerResultSchema,
  order: shopifyOrderResultSchema,
  fulfillment: shopifyFulfillmentResultSchema,
  webhook: shopifySyncAdminDashboardWebhookSectionSchema,
  hmacVerification: shopifySyncAdminDashboardHmacSectionSchema,
  summary: shopifySyncAdminDashboardSummarySchema,
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifySyncAdminDashboardData>;
