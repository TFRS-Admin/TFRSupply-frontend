import { z } from 'zod';
import type {
  ShopifySyncDashboardData,
  ShopifySyncDashboardJobQueueSection,
  ShopifySyncDashboardOrchestratorSection,
  ShopifySyncDashboardWebhookSection,
} from '@/types/shopifySyncDashboard';
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

export const shopifySyncDashboardOrchestratorSectionSchema = z.object({
  plan: shopifySyncExecutionPlanSchema,
  result: shopifySyncOrchestratorResultSchema,
}) as z.ZodType<ShopifySyncDashboardOrchestratorSection>;

export const shopifySyncDashboardJobQueueSectionSchema = z.object({
  jobs: z.array(shopifyJobResultSchema),
}) as z.ZodType<ShopifySyncDashboardJobQueueSection>;

export const shopifySyncDashboardWebhookSectionSchema = z.object({
  received: shopifyWebhookResultSchema,
  routed: shopifyWebhookResultSchema,
}) as z.ZodType<ShopifySyncDashboardWebhookSection>;

export const shopifySyncDashboardDataSchema = z.object({
  generatedAt: nonEmptyString,
  orchestrator: shopifySyncDashboardOrchestratorSectionSchema,
  jobQueue: shopifySyncDashboardJobQueueSectionSchema,
  catalog: shopifyCatalogSyncResultSchema,
  inventory: shopifyInventorySyncResultSchema,
  pricing: shopifyPricingSyncResultSchema,
  customer: shopifyCustomerResultSchema,
  order: shopifyOrderResultSchema,
  fulfillment: shopifyFulfillmentResultSchema,
  webhook: shopifySyncDashboardWebhookSectionSchema,
  webhookVerification: shopifyWebhookVerificationResultSchema,
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifySyncDashboardData>;
