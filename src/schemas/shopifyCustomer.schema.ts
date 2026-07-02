import { z } from 'zod';
import type { ShopifyCustomer, ShopifyCustomerAddress, ShopifyCustomerError, ShopifyCustomerErrorCode, ShopifyCustomerMapping, ShopifyCustomerRequest, ShopifyCustomerResult, ShopifyCustomerStatus, ShopifyCustomerSyncStatus } from '@/types';
import { metadataSchema } from './common.schema';
import { quoteCustomerMetadataSchema, quoteSchema } from './quote.schema';

const nonEmptyString = z.string().min(1);

export const shopifyCustomerStatusSchema = z.enum(['draft', 'mapped', 'validated', 'submitted', 'accepted', 'failed', 'unavailable']) satisfies z.ZodType<ShopifyCustomerStatus>;
export const shopifyCustomerSyncStatusSchema = z.enum(['not-started', 'pending', 'dry-run', 'succeeded', 'failed', 'adapter-unavailable']) satisfies z.ZodType<ShopifyCustomerSyncStatus>;
export const shopifyCustomerErrorCodeSchema = z.enum(['validation-error', 'mapping-error', 'adapter-unavailable', 'missing-customer', 'unknown']) satisfies z.ZodType<ShopifyCustomerErrorCode>;

export const shopifyCustomerAddressSchema = z.object({
  firstName: z.string().optional(), lastName: z.string().optional(), company: z.string().optional(), address1: z.string().optional(), address2: z.string().optional(), city: z.string().optional(), province: z.string().optional(), provinceCode: z.string().optional(), country: z.string().optional(), countryCode: z.string().optional(), zip: z.string().optional(), phone: z.string().optional(), default: z.boolean().optional(),
}) as z.ZodType<ShopifyCustomerAddress>;

const shopifyCustomerObjectSchema = z.object({
  id: nonEmptyString, platformCustomerId: z.string().optional(), shopifyCustomerId: z.string().nullable().optional(), quoteId: z.string().optional(), status: shopifyCustomerStatusSchema, email: z.string().email().optional(), phone: z.string().optional(), firstName: z.string().optional(), lastName: z.string().optional(), company: z.string().optional(), taxExempt: z.boolean().optional(), acceptsMarketing: z.boolean().optional(), tags: z.array(z.string()).optional(), note: z.string().optional(), addresses: z.array(shopifyCustomerAddressSchema).optional(), sourceName: z.literal('tfrsupply-customer-sync'), metadata: metadataSchema.optional(),
});
export const shopifyCustomerSchema = shopifyCustomerObjectSchema as z.ZodType<ShopifyCustomer>;

export const shopifyCustomerErrorSchema = z.object({ code: shopifyCustomerErrorCodeSchema, message: nonEmptyString, fieldPath: z.string().optional(), retryable: z.boolean(), metadata: metadataSchema.optional() }) as z.ZodType<ShopifyCustomerError>;
export const shopifyCustomerMappingSchema = z.object({ platformCustomerId: nonEmptyString, shopifyCustomerId: nonEmptyString, quoteId: z.string().optional(), mappedAt: nonEmptyString, source: z.enum(['platform-customer', 'quote-customer', 'request-customer']), warnings: z.array(shopifyCustomerErrorSchema), metadata: metadataSchema.optional() }) as z.ZodType<ShopifyCustomerMapping>;
export const shopifyCustomerRequestSchema = z.object({ requestId: nonEmptyString, dryRun: z.literal(true), requestedAt: z.string().optional(), customer: quoteCustomerMetadataSchema.optional(), quote: quoteSchema.optional(), shopifyCustomer: shopifyCustomerObjectSchema.partial().optional(), addresses: z.array(shopifyCustomerAddressSchema).optional(), tags: z.array(z.string()).optional(), note: z.string().optional(), metadata: metadataSchema.optional() }).refine((request) => Boolean(request.customer || request.quote?.customer || request.shopifyCustomer), { message: 'Shopify customer request requires platform customer, quote customer, or explicit Shopify customer metadata.' }) as z.ZodType<ShopifyCustomerRequest>;
export const shopifyCustomerResultSchema = z.object({ requestId: nonEmptyString, status: shopifyCustomerStatusSchema, syncStatus: shopifyCustomerSyncStatusSchema, customer: shopifyCustomerSchema.nullable(), mapping: shopifyCustomerMappingSchema.nullable(), errors: z.array(shopifyCustomerErrorSchema), syncedAt: z.string().optional(), metadata: metadataSchema.optional() }) as z.ZodType<ShopifyCustomerResult>;
