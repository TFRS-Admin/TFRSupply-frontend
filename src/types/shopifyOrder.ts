import type { Metadata, Money } from './common';
import type { Quote } from './quote';

export type ShopifyOrderStatus = 'draft' | 'mapped' | 'validated' | 'submitted' | 'accepted' | 'failed' | 'unavailable';
export type ShopifyOrderSyncStatus = 'not-started' | 'pending' | 'dry-run' | 'succeeded' | 'failed' | 'adapter-unavailable';
export type ShopifyOrderErrorCode = 'validation-error' | 'mapping-error' | 'adapter-unavailable' | 'unsupported-line' | 'unknown';

export interface ShopifyOrderAddress {
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
}

export interface ShopifyOrderCustomer {
  customerId?: string;
  shopifyCustomerId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  taxExempt?: boolean;
  metadata?: Metadata;
}

export interface ShopifyOrderLine {
  id: string;
  quoteLineId?: string;
  sku?: string;
  shopifyVariantId?: string | null;
  title: string;
  quantity: number;
  unitPrice?: Money;
  total?: Money;
  taxable?: boolean;
  requiresShipping?: boolean;
  properties?: Record<string, string>;
  metadata?: Metadata;
}

export interface ShopifyOrder {
  id: string;
  quoteId?: string;
  status: ShopifyOrderStatus;
  customer?: ShopifyOrderCustomer;
  billingAddress?: ShopifyOrderAddress;
  shippingAddress?: ShopifyOrderAddress;
  lines: ShopifyOrderLine[];
  subtotal?: Money;
  total?: Money;
  currencyCode: string;
  tags?: string[];
  note?: string;
  sourceName: 'tfrsupply-quote-builder';
  metadata?: Metadata;
}

export interface ShopifyOrderError {
  code: ShopifyOrderErrorCode;
  message: string;
  fieldPath?: string;
  quoteLineId?: string;
  retryable: boolean;
  metadata?: Metadata;
}

export interface ShopifyOrderMapping {
  quoteId: string;
  orderId: string;
  mappedAt: string;
  lineMappings: Array<{ quoteLineId: string; orderLineId: string; sku?: string; shopifyVariantId?: string | null }>;
  warnings: ShopifyOrderError[];
  metadata?: Metadata;
}

export interface ShopifyOrderRequest {
  requestId: string;
  quote: Quote;
  dryRun: true;
  requestedAt?: string;
  customer?: ShopifyOrderCustomer;
  billingAddress?: ShopifyOrderAddress;
  shippingAddress?: ShopifyOrderAddress;
  tags?: string[];
  note?: string;
  metadata?: Metadata;
}

export interface ShopifyOrderResult {
  requestId: string;
  status: ShopifyOrderStatus;
  syncStatus: ShopifyOrderSyncStatus;
  order: ShopifyOrder | null;
  mapping: ShopifyOrderMapping | null;
  errors: ShopifyOrderError[];
  syncedAt?: string;
  metadata?: Metadata;
}
