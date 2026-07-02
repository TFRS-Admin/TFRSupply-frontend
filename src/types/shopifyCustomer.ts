import type { Metadata } from './common';
import type { Quote, QuoteCustomerMetadata } from './quote';

export type ShopifyCustomerStatus = 'draft' | 'mapped' | 'validated' | 'submitted' | 'accepted' | 'failed' | 'unavailable';
export type ShopifyCustomerSyncStatus = 'not-started' | 'pending' | 'dry-run' | 'succeeded' | 'failed' | 'adapter-unavailable';
export type ShopifyCustomerErrorCode = 'validation-error' | 'mapping-error' | 'adapter-unavailable' | 'missing-customer' | 'unknown';

export interface ShopifyCustomerAddress {
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  provinceCode?: string;
  country?: string;
  countryCode?: string;
  zip?: string;
  phone?: string;
  default?: boolean;
}

export interface ShopifyCustomer {
  id: string;
  platformCustomerId?: string;
  shopifyCustomerId?: string | null;
  quoteId?: string;
  status: ShopifyCustomerStatus;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  taxExempt?: boolean;
  acceptsMarketing?: boolean;
  tags?: string[];
  note?: string;
  addresses?: ShopifyCustomerAddress[];
  sourceName: 'tfrsupply-customer-sync';
  metadata?: Metadata;
}

export interface ShopifyCustomerError {
  code: ShopifyCustomerErrorCode;
  message: string;
  fieldPath?: string;
  retryable: boolean;
  metadata?: Metadata;
}

export interface ShopifyCustomerMapping {
  platformCustomerId: string;
  shopifyCustomerId: string;
  quoteId?: string;
  mappedAt: string;
  source: 'platform-customer' | 'quote-customer' | 'request-customer';
  warnings: ShopifyCustomerError[];
  metadata?: Metadata;
}

export interface ShopifyCustomerRequest {
  requestId: string;
  dryRun: true;
  requestedAt?: string;
  customer?: QuoteCustomerMetadata;
  quote?: Quote;
  shopifyCustomer?: Partial<ShopifyCustomer>;
  addresses?: ShopifyCustomerAddress[];
  tags?: string[];
  note?: string;
  metadata?: Metadata;
}

export interface ShopifyCustomerResult {
  requestId: string;
  status: ShopifyCustomerStatus;
  syncStatus: ShopifyCustomerSyncStatus;
  customer: ShopifyCustomer | null;
  mapping: ShopifyCustomerMapping | null;
  errors: ShopifyCustomerError[];
  syncedAt?: string;
  metadata?: Metadata;
}
