import type { Metadata } from './common';

export type ShopifyStorefrontOperationType =
  | 'shop-query'
  | 'product-query'
  | 'product-list-query'
  | 'collection-query'
  | 'cart-query';

export type ShopifyStorefrontAdapterMode = 'mock' | 'unavailable' | 'live';
export type ShopifyStorefrontResponseStatus = 'not-started' | 'dry-run' | 'succeeded' | 'failed' | 'adapter-unavailable';
export type ShopifyStorefrontErrorCode = 'validation-error' | 'unsupported-operation' | 'configuration-error' | 'adapter-unavailable' | 'live-calls-disabled' | 'unknown';

export interface ShopifyStorefrontClientConfig {
  storeDomain: string;
  apiVersion: string;
  storefrontAccessToken?: string;
  languageCode?: string;
  countryCode?: string;
  timeoutMs?: number;
}

export interface ShopifyStorefrontOperation {
  operationType: ShopifyStorefrontOperationType;
  operationName: string;
  query: string;
  variables?: Record<string, unknown>;
}

export interface ShopifyStorefrontRequest {
  requestId: string;
  dryRun: true;
  operation: ShopifyStorefrontOperation;
  config?: Partial<ShopifyStorefrontClientConfig>;
  requestedAt?: string;
  metadata?: Metadata;
}

export interface ShopifyStorefrontError {
  code: ShopifyStorefrontErrorCode;
  message: string;
  fieldPath?: string;
  retryable: boolean;
  metadata?: Metadata;
}

export interface ShopifyStorefrontResponse {
  requestId: string;
  status: ShopifyStorefrontResponseStatus;
  operationType: ShopifyStorefrontOperationType | null;
  data: Record<string, unknown> | null;
  errors: ShopifyStorefrontError[];
  respondedAt?: string;
  metadata?: Metadata;
}

export interface ShopifyStorefrontAvailability {
  available: boolean;
  configured: boolean;
  adapterMode: ShopifyStorefrontAdapterMode;
  reason?: string;
  checkedAt?: string;
  metadata?: Metadata;
}

export interface ShopifyStorefrontCapabilities {
  supportedOperationTypes: ShopifyStorefrontOperationType[];
  dryRunOnly: true;
  liveCallsEnabled: false;
  adapterMode: ShopifyStorefrontAdapterMode;
}
