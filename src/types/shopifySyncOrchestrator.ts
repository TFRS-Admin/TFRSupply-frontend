import type { Metadata } from './common';
import type { ShopifyCatalogSyncRequest, ShopifyCatalogSyncResult } from './shopifyCatalog';
import type { ShopifyCustomerRequest, ShopifyCustomerResult } from './shopifyCustomer';
import type { ShopifyFulfillmentRequest, ShopifyFulfillmentResult } from './shopifyFulfillment';
import type { ShopifyInventorySyncRequest, ShopifyInventorySyncResult } from './shopifyInventory';
import type { ShopifyOrderRequest, ShopifyOrderResult } from './shopifyOrder';
import type { ShopifyPricingSyncRequest, ShopifyPricingSyncResult } from './shopifyPricing';
import type { ShopifySyncRequest, ShopifySyncResult } from './shopifySync';
import type { ShopifyWebhookRequest, ShopifyWebhookResult } from './shopifyWebhook';
import type { ShopifyWebhookVerificationRequest, ShopifyWebhookVerificationResult } from './shopifyWebhookVerification';

export type ShopifySyncExecutionStatus = 'planned' | 'dry-run' | 'succeeded' | 'failed' | 'partial' | 'adapter-unavailable';
export type ShopifySyncOperation = 'customer' | 'order' | 'catalog' | 'inventory' | 'pricing' | 'fulfillment' | 'webhook' | 'webhook-verification' | 'sync-foundation';
export type ShopifySyncOperationRequest = ShopifyCustomerRequest | ShopifyOrderRequest | ShopifyCatalogSyncRequest | ShopifyInventorySyncRequest | ShopifyPricingSyncRequest | ShopifyFulfillmentRequest | ShopifyWebhookRequest | ShopifyWebhookVerificationRequest | ShopifySyncRequest;
export type ShopifySyncOperationServiceResult = ShopifyCustomerResult | ShopifyOrderResult | ShopifyCatalogSyncResult | ShopifyInventorySyncResult | ShopifyPricingSyncResult | ShopifyFulfillmentResult | ShopifyWebhookResult | ShopifyWebhookVerificationResult | ShopifySyncResult;

export interface ShopifySyncExecutionError {
  code: 'validation-error' | 'operation-failed' | 'adapter-unavailable' | 'unsupported-operation' | 'unknown';
  message: string;
  operationId?: string;
  operation?: ShopifySyncOperation;
  fieldPath?: string;
  retryable: boolean;
  metadata?: Metadata;
}

export interface ShopifySyncOperationResult {
  operationId: string;
  operation: ShopifySyncOperation;
  status: ShopifySyncExecutionStatus;
  startedAt?: string;
  completedAt?: string;
  skipped?: boolean;
  serviceResult?: ShopifySyncOperationServiceResult | null;
  errors: ShopifySyncExecutionError[];
  metadata?: Metadata;
}

export interface ShopifySyncExecutionPlan {
  planId: string;
  requestId: string;
  status: ShopifySyncExecutionStatus;
  dryRun: true;
  operations: Array<{
    operationId: string;
    operation: ShopifySyncOperation;
    sequence: number;
    dependsOn: string[];
    request: ShopifySyncOperationRequest;
    metadata?: Metadata;
  }>;
  createdAt: string;
  metadata?: Metadata;
}

export interface ShopifySyncOrchestratorRequest {
  requestId: string;
  dryRun: true;
  requestedAt?: string;
  operations: Array<{
    operationId?: string;
    operation: ShopifySyncOperation;
    request: ShopifySyncOperationRequest;
    dependsOn?: string[];
    enabled?: boolean;
    metadata?: Metadata;
  }>;
  metadata?: Metadata;
}

export interface ShopifySyncOrchestratorResult {
  requestId: string;
  plan: ShopifySyncExecutionPlan;
  status: ShopifySyncExecutionStatus;
  operationResults: ShopifySyncOperationResult[];
  errors: ShopifySyncExecutionError[];
  startedAt: string;
  completedAt: string;
  metadata?: Metadata;
}
