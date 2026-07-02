import type {
  ShopifyCatalogSyncResult,
  ShopifyCustomerResult,
  ShopifyFulfillmentResult,
  ShopifyInventorySyncResult,
  ShopifyJobResult,
  ShopifyOrderResult,
  ShopifyPricingSyncResult,
  ShopifySyncExecutionPlan,
  ShopifySyncOrchestratorResult,
  ShopifyWebhookResult,
  ShopifyWebhookVerificationResult,
} from './index';

export interface ShopifySyncDashboardOrchestratorSection {
  executionPlan: ShopifySyncExecutionPlan;
  result: ShopifySyncOrchestratorResult;
}

export interface ShopifySyncDashboardJobQueueSection {
  jobs: ShopifyJobResult[];
}

export interface ShopifySyncDashboardWebhookSection {
  received: ShopifyWebhookResult;
  routed: ShopifyWebhookResult;
}

export interface ShopifySyncDashboardWebhookVerificationSection {
  verified: ShopifyWebhookVerificationResult;
  mismatched: ShopifyWebhookVerificationResult;
}

export interface ShopifySyncDashboardSummary {
  sectionCount: number;
  statusesByArea: Record<string, string>;
}

export interface ShopifySyncDashboardData {
  generatedAt: string;
  orchestrator: ShopifySyncDashboardOrchestratorSection;
  jobQueue: ShopifySyncDashboardJobQueueSection;
  catalog: ShopifyCatalogSyncResult;
  inventory: ShopifyInventorySyncResult;
  pricing: ShopifyPricingSyncResult;
  customer: ShopifyCustomerResult;
  order: ShopifyOrderResult;
  fulfillment: ShopifyFulfillmentResult;
  webhook: ShopifySyncDashboardWebhookSection;
  webhookVerification: ShopifySyncDashboardWebhookVerificationSection;
  summary: ShopifySyncDashboardSummary;
}
