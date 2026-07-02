import type { Metadata } from './common';
import type { ShopifyOrder, ShopifyOrderAddress } from './shopifyOrder';

export type ShopifyFulfillmentStatus = 'draft' | 'mapped' | 'validated' | 'dry-run' | 'pending' | 'partial' | 'succeeded' | 'failed' | 'adapter-unavailable';
export type ShopifyFulfillmentErrorCode = 'validation-error' | 'mapping-error' | 'adapter-unavailable' | 'missing-line-items' | 'missing-tracking' | 'unsupported-location' | 'unknown';
export type ShopifyShipmentStatus = 'label-pending' | 'label-purchased' | 'in-transit' | 'delivered' | 'attempted-delivery' | 'failure' | 'cancelled';

export interface ShopifyTrackingInformation {
  trackingNumber?: string;
  trackingNumbers?: string[];
  trackingCompany?: string;
  trackingUrl?: string;
  trackingUrls?: string[];
  metadata?: Metadata;
}

export interface ShopifyFulfillmentItem {
  orderLineId: string;
  shopifyLineItemId?: string | null;
  sku?: string;
  quantity: number;
  locationId?: string;
  metadata?: Metadata;
}

export interface ShopifyShipment {
  id: string;
  fulfillmentId?: string;
  items: ShopifyFulfillmentItem[];
  tracking?: ShopifyTrackingInformation;
  status: ShopifyShipmentStatus;
  originLocationId?: string;
  destinationAddress?: ShopifyOrderAddress;
  shippedAt?: string;
  estimatedDeliveryAt?: string;
  deliveredAt?: string;
  metadata?: Metadata;
}

export interface ShopifyFulfillmentError {
  code: ShopifyFulfillmentErrorCode;
  message: string;
  fieldPath?: string;
  orderLineId?: string;
  retryable: boolean;
  metadata?: Metadata;
}

export interface ShopifyFulfillmentMapping {
  orderId: string;
  fulfillmentId: string;
  shopifyOrderId?: string | null;
  shopifyFulfillmentId?: string | null;
  mappedAt: string;
  itemMappings: Array<{ orderLineId: string; fulfillmentItemId: string; sku?: string; shopifyLineItemId?: string | null }>;
  warnings: ShopifyFulfillmentError[];
  metadata?: Metadata;
}

export interface ShopifyFulfillmentRequest {
  requestId: string;
  order: ShopifyOrder;
  dryRun: true;
  requestedAt?: string;
  items?: ShopifyFulfillmentItem[];
  locationId?: string;
  trackingInfo?: ShopifyTrackingInformation;
  notifyCustomer?: boolean;
  metadata?: Metadata;
}

export interface ShopifyFulfillmentResult {
  requestId: string;
  status: ShopifyFulfillmentStatus;
  items: ShopifyFulfillmentItem[];
  shipment: ShopifyShipment | null;
  mapping: ShopifyFulfillmentMapping | null;
  errors: ShopifyFulfillmentError[];
  syncedAt?: string;
  metadata?: Metadata;
}
