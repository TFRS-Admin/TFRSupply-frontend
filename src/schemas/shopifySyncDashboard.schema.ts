import { z } from 'zod';
import type {
  ShopifySyncDashboardData,
  ShopifySyncDashboardJobQueueSection,
  ShopifySyncDashboardOrchestratorSection,
  ShopifySyncDashboardSummary,
  ShopifySyncDashboardWebhookSection,
  ShopifySyncDashboardWebhookVerificationSection,
} from '@/types/shopifySyncDashboard';
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

export const shopifySyncDashboardOrchestratorSectionSchema = z.object({
  executionPlan: shopifySyncExecutionPlanSchema,
  result: shopifySyncOrchestratorResultSchema,
}) as z.ZodType<ShopifySyncDashboardOrchestratorSection>;

export const shopifySyncDashboardJobQueueSectionSchema = z.object({
  jobs: z.array(shopifyJobResultSchema),
}) as z.ZodType<ShopifySyncDashboardJobQueueSection>;

export const shopifySyncDashboardWebhookSectionSchema = z.object({
  received: shopifyWebhookResultSchema,
  routed: shopifyWebhookResultSchema,
}) as z.ZodType<ShopifySyncDashboardWebhookSection>;

export const shopifySyncDashboardWebhookVerificationSectionSchema = z.object({
  verified: shopifyWebhookVerificationResultSchema,
  mismatched: shopifyWebhookVerificationResultSchema,
}) as z.ZodType<ShopifySyncDashboardWebhookVerificationSection>;

export const shopifySyncDashboardSummarySchema = z.object({
  sectionCount: nonNegativeInt,
  statusesByArea: z.record(nonEmptyString),
}) as z.ZodType<ShopifySyncDashboardSummary>;

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
  webhookVerification: shopifySyncDashboardWebhookVerificationSectionSchema,
  summary: shopifySyncDashboardSummarySchema,
}) as z.ZodType<ShopifySyncDashboardData>;
