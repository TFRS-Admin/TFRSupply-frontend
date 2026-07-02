import { z } from 'zod';
import type { ShopifyOrder, ShopifyOrderAddress, ShopifyOrderCustomer, ShopifyOrderError, ShopifyOrderErrorCode, ShopifyOrderLine, ShopifyOrderMapping, ShopifyOrderRequest, ShopifyOrderResult, ShopifyOrderStatus, ShopifyOrderSyncStatus } from '@/types';
import { metadataSchema, moneySchema } from './common.schema';
import { quoteSchema } from './quote.schema';

const nonEmptyString = z.string().min(1);
export const shopifyOrderStatusSchema = z.enum(['draft', 'mapped', 'validated', 'submitted', 'accepted', 'failed', 'unavailable']) satisfies z.ZodType<ShopifyOrderStatus>;
export const shopifyOrderSyncStatusSchema = z.enum(['not-started', 'pending', 'dry-run', 'succeeded', 'failed', 'adapter-unavailable']) satisfies z.ZodType<ShopifyOrderSyncStatus>;
export const shopifyOrderErrorCodeSchema = z.enum(['validation-error', 'mapping-error', 'adapter-unavailable', 'unsupported-line', 'unknown']) satisfies z.ZodType<ShopifyOrderErrorCode>;

export const shopifyOrderAddressSchema = z.object({
  firstName: z.string().optional(), lastName: z.string().optional(), company: z.string().optional(), address1: z.string().optional(), address2: z.string().optional(), city: z.string().optional(), province: z.string().optional(), provinceCode: z.string().optional(), country: z.string().optional(), countryCode: z.string().optional(), zip: z.string().optional(), phone: z.string().optional(),
}) as z.ZodType<ShopifyOrderAddress>;

export const shopifyOrderCustomerSchema = z.object({
  customerId: z.string().optional(), shopifyCustomerId: z.string().optional(), email: z.string().email().optional(), phone: z.string().optional(), firstName: z.string().optional(), lastName: z.string().optional(), company: z.string().optional(), taxExempt: z.boolean().optional(), metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyOrderCustomer>;

export const shopifyOrderLineSchema = z.object({
  id: nonEmptyString, quoteLineId: z.string().optional(), sku: z.string().optional(), shopifyVariantId: z.string().nullable().optional(), title: nonEmptyString, quantity: z.number().int().positive(), unitPrice: moneySchema.optional(), total: moneySchema.optional(), taxable: z.boolean().optional(), requiresShipping: z.boolean().optional(), properties: z.record(z.string()).optional(), metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyOrderLine>;

export const shopifyOrderSchema = z.object({
  id: nonEmptyString, quoteId: z.string().optional(), status: shopifyOrderStatusSchema, customer: shopifyOrderCustomerSchema.optional(), billingAddress: shopifyOrderAddressSchema.optional(), shippingAddress: shopifyOrderAddressSchema.optional(), lines: z.array(shopifyOrderLineSchema).min(1), subtotal: moneySchema.optional(), total: moneySchema.optional(), currencyCode: nonEmptyString, tags: z.array(z.string()).optional(), note: z.string().optional(), sourceName: z.literal('tfrsupply-quote-builder'), metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyOrder>;

export const shopifyOrderErrorSchema = z.object({ code: shopifyOrderErrorCodeSchema, message: nonEmptyString, fieldPath: z.string().optional(), quoteLineId: z.string().optional(), retryable: z.boolean(), metadata: metadataSchema.optional() }) as z.ZodType<ShopifyOrderError>;
export const shopifyOrderMappingSchema = z.object({ quoteId: nonEmptyString, orderId: nonEmptyString, mappedAt: nonEmptyString, lineMappings: z.array(z.object({ quoteLineId: nonEmptyString, orderLineId: nonEmptyString, sku: z.string().optional(), shopifyVariantId: z.string().nullable().optional() })), warnings: z.array(shopifyOrderErrorSchema), metadata: metadataSchema.optional() }) as z.ZodType<ShopifyOrderMapping>;
export const shopifyOrderRequestSchema = z.object({ requestId: nonEmptyString, quote: quoteSchema, dryRun: z.literal(true), requestedAt: z.string().optional(), customer: shopifyOrderCustomerSchema.optional(), billingAddress: shopifyOrderAddressSchema.optional(), shippingAddress: shopifyOrderAddressSchema.optional(), tags: z.array(z.string()).optional(), note: z.string().optional(), metadata: metadataSchema.optional() }) as z.ZodType<ShopifyOrderRequest>;
export const shopifyOrderResultSchema = z.object({ requestId: nonEmptyString, status: shopifyOrderStatusSchema, syncStatus: shopifyOrderSyncStatusSchema, order: shopifyOrderSchema.nullable(), mapping: shopifyOrderMappingSchema.nullable(), errors: z.array(shopifyOrderErrorSchema), syncedAt: z.string().optional(), metadata: metadataSchema.optional() }) as z.ZodType<ShopifyOrderResult>;
