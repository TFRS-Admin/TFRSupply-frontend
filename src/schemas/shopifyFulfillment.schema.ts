import { z } from 'zod';
import type { ShopifyFulfillmentError, ShopifyFulfillmentErrorCode, ShopifyFulfillmentItem, ShopifyFulfillmentMapping, ShopifyFulfillmentRequest, ShopifyFulfillmentResult, ShopifyFulfillmentStatus, ShopifyShipment, ShopifyShipmentStatus, ShopifyTrackingInformation } from '@/types/shopifyFulfillment';
import { metadataSchema } from './common.schema';
import { shopifyOrderAddressSchema, shopifyOrderSchema } from './shopifyOrder.schema';

const nonEmptyString = z.string().min(1);
export const shopifyFulfillmentStatusSchema = z.enum(['draft', 'mapped', 'validated', 'dry-run', 'pending', 'partial', 'succeeded', 'failed', 'adapter-unavailable']) satisfies z.ZodType<ShopifyFulfillmentStatus>;
export const shopifyFulfillmentErrorCodeSchema = z.enum(['validation-error', 'mapping-error', 'adapter-unavailable', 'missing-line-items', 'missing-tracking', 'unsupported-location', 'unknown']) satisfies z.ZodType<ShopifyFulfillmentErrorCode>;
export const shopifyShipmentStatusSchema = z.enum(['label-pending', 'label-purchased', 'in-transit', 'delivered', 'attempted-delivery', 'failure', 'cancelled']) satisfies z.ZodType<ShopifyShipmentStatus>;

export const shopifyTrackingInformationSchema = z.object({
  trackingNumber: z.string().optional(), trackingNumbers: z.array(z.string()).optional(), trackingCompany: z.string().optional(), trackingUrl: z.string().optional(), trackingUrls: z.array(z.string()).optional(), metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyTrackingInformation>;

export const shopifyFulfillmentItemSchema = z.object({
  orderLineId: nonEmptyString, shopifyLineItemId: z.string().nullable().optional(), sku: z.string().optional(), quantity: z.number().int().positive(), locationId: z.string().optional(), metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyFulfillmentItem>;

export const shopifyShipmentSchema = z.object({
  id: nonEmptyString, fulfillmentId: z.string().optional(), items: z.array(shopifyFulfillmentItemSchema), tracking: shopifyTrackingInformationSchema.optional(), status: shopifyShipmentStatusSchema, originLocationId: z.string().optional(), destinationAddress: shopifyOrderAddressSchema.optional(), shippedAt: z.string().optional(), estimatedDeliveryAt: z.string().optional(), deliveredAt: z.string().optional(), metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyShipment>;

export const shopifyFulfillmentErrorSchema = z.object({
  code: shopifyFulfillmentErrorCodeSchema, message: nonEmptyString, fieldPath: z.string().optional(), orderLineId: z.string().optional(), retryable: z.boolean(), metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyFulfillmentError>;

export const shopifyFulfillmentMappingSchema = z.object({
  orderId: nonEmptyString, fulfillmentId: nonEmptyString, shopifyOrderId: z.string().nullable().optional(), shopifyFulfillmentId: z.string().nullable().optional(), mappedAt: nonEmptyString, itemMappings: z.array(z.object({ orderLineId: nonEmptyString, fulfillmentItemId: nonEmptyString, sku: z.string().optional(), shopifyLineItemId: z.string().nullable().optional() })), warnings: z.array(shopifyFulfillmentErrorSchema), metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyFulfillmentMapping>;

export const shopifyFulfillmentRequestSchema = z.object({
  requestId: nonEmptyString, order: shopifyOrderSchema, dryRun: z.literal(true), requestedAt: z.string().optional(), items: z.array(shopifyFulfillmentItemSchema).optional(), locationId: z.string().optional(), trackingInfo: shopifyTrackingInformationSchema.optional(), notifyCustomer: z.boolean().optional(), metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyFulfillmentRequest>;

export const shopifyFulfillmentResultSchema = z.object({
  requestId: nonEmptyString, status: shopifyFulfillmentStatusSchema, items: z.array(shopifyFulfillmentItemSchema), shipment: shopifyShipmentSchema.nullable(), mapping: shopifyFulfillmentMappingSchema.nullable(), errors: z.array(shopifyFulfillmentErrorSchema), syncedAt: z.string().optional(), metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyFulfillmentResult>;
