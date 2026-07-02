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

export interface ShopifySyncAdminDashboardOrchestratorSection {
  plan: ShopifySyncExecutionPlan;
  result: ShopifySyncOrchestratorResult;
}

export interface ShopifySyncAdminDashboardJobQueueSection {
  jobs: ShopifyJobResult[];
}

export interface ShopifySyncAdminDashboardWebhookSection {
  received: ShopifyWebhookResult;
  routed: ShopifyWebhookResult;
}

export interface ShopifySyncAdminDashboardHmacSection {
  valid: ShopifyWebhookVerificationResult;
  invalid: ShopifyWebhookVerificationResult;
}

export interface ShopifySyncAdminDashboardSummary {
  sectionCount: number;
  operationCount: number;
  jobCount: number;
  errorCount: number;
  statusCounts: Record<string, number>;
}

export interface ShopifySyncAdminDashboardData {
  generatedAt: string;
  orchestrator: ShopifySyncAdminDashboardOrchestratorSection;
  jobQueue: ShopifySyncAdminDashboardJobQueueSection;
  catalog: ShopifyCatalogSyncResult;
  inventory: ShopifyInventorySyncResult;
  pricing: ShopifyPricingSyncResult;
  customer: ShopifyCustomerResult;
  order: ShopifyOrderResult;
  fulfillment: ShopifyFulfillmentResult;
  webhook: ShopifySyncAdminDashboardWebhookSection;
  hmacVerification: ShopifySyncAdminDashboardHmacSection;
  summary: ShopifySyncAdminDashboardSummary;
  metadata?: Metadata;
}
