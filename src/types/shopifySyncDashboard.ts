import type { Metadata } from './common';
import type { ShopifyCatalogSyncResult } from './shopifyCatalog';
import type { ShopifyCustomerResult } from './shopifyCustomer';
import type { ShopifyFulfillmentResult } from './shopifyFulfillment';
import type { ShopifyInventorySyncResult } from './shopifyInventory';
import type { ShopifyJobResult } from './shopifyJobQueue';
import type { ShopifyOrderResult } from './shopifyOrder';
import type { ShopifyPricingSyncResult } from './shopifyPricing';
import type { ShopifySyncExecutionPlan, ShopifySyncOrchestratorResult } from './shopifySyncOrchestrator';
import type { ShopifyWebhookResult } from './shopifyWebhook';
import type { ShopifyWebhookVerificationResult } from './shopifyWebhookVerification';

export interface ShopifySyncDashboardOrchestratorSection {
  plan: ShopifySyncExecutionPlan;
  result: ShopifySyncOrchestratorResult;
}

export interface ShopifySyncDashboardJobQueueSection {
  jobs: ShopifyJobResult[];
}

export interface ShopifySyncDashboardWebhookSection {
  received: ShopifyWebhookResult;
  routed: ShopifyWebhookResult;
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
  webhookVerification: ShopifyWebhookVerificationResult;
  metadata?: Metadata;
}
