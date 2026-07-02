import { z } from 'zod';
import type { ShopifyCatalogError, ShopifyCatalogErrorCode, ShopifyCatalogMapping, ShopifyCatalogPublishAction, ShopifyCatalogSyncItem, ShopifyCatalogSyncRequest, ShopifyCatalogSyncResult, ShopifyCatalogSyncStatus } from '@/types';
import { metadataSchema, moneySchema } from './common.schema';
import { productSchema } from './product.schema';

const nonEmptyString = z.string().min(1);
export const shopifyCatalogSyncStatusSchema = z.enum(['draft', 'mapped', 'validated', 'dry-run', 'succeeded', 'failed', 'adapter-unavailable']) satisfies z.ZodType<ShopifyCatalogSyncStatus>;
export const shopifyCatalogPublishActionSchema = z.enum(['create', 'update', 'archive', 'skip']) satisfies z.ZodType<ShopifyCatalogPublishAction>;
export const shopifyCatalogErrorCodeSchema = z.enum(['validation-error', 'mapping-error', 'adapter-unavailable', 'unsupported-product', 'unknown']) satisfies z.ZodType<ShopifyCatalogErrorCode>;

export const shopifyCatalogErrorSchema = z.object({ code: shopifyCatalogErrorCodeSchema, message: nonEmptyString, fieldPath: z.string().optional(), productId: z.string().optional(), sku: z.string().optional(), retryable: z.boolean(), metadata: metadataSchema.optional() }) as z.ZodType<ShopifyCatalogError>;

const shopifyCatalogVariantSchema = z.object({ sku: nonEmptyString, title: nonEmptyString, optionValues: z.record(z.string()).optional(), price: moneySchema.optional(), metadata: metadataSchema.optional() });

export const shopifyCatalogSyncItemSchema = z.object({
  productId: nonEmptyString, sku: z.string().optional(), action: shopifyCatalogPublishActionSchema, status: shopifyCatalogSyncStatusSchema, title: nonEmptyString, handle: nonEmptyString, vendor: z.string().optional(), productType: z.string().optional(), tags: z.array(z.string()), description: z.string().optional(), imageUrls: z.array(z.string()), price: moneySchema.optional(), variants: z.array(shopifyCatalogVariantSchema), errors: z.array(shopifyCatalogErrorSchema), metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyCatalogSyncItem>;

export const shopifyCatalogMappingSchema = z.object({ productId: nonEmptyString, shopifyProductId: z.string().nullable().optional(), shopifyProductGid: z.string().nullable().optional(), handle: nonEmptyString, action: shopifyCatalogPublishActionSchema, mappedAt: nonEmptyString, variantMappings: z.array(z.object({ sku: nonEmptyString, shopifyVariantId: z.string().nullable().optional(), shopifyVariantGid: z.string().nullable().optional(), action: shopifyCatalogPublishActionSchema })), warnings: z.array(shopifyCatalogErrorSchema), metadata: metadataSchema.optional() }) as z.ZodType<ShopifyCatalogMapping>;

export const shopifyCatalogSyncRequestSchema = z.object({ requestId: nonEmptyString, products: z.array(productSchema).min(1), action: shopifyCatalogPublishActionSchema.optional(), dryRun: z.literal(true), requestedAt: z.string().optional(), source: z.enum(['catalog-service', 'product-data-platform', 'manual']).optional(), metadata: metadataSchema.optional() }) as z.ZodType<ShopifyCatalogSyncRequest>;

export const shopifyCatalogSyncResultSchema = z.object({ requestId: nonEmptyString, status: shopifyCatalogSyncStatusSchema, items: z.array(shopifyCatalogSyncItemSchema), mappings: z.array(shopifyCatalogMappingSchema), errors: z.array(shopifyCatalogErrorSchema), syncedAt: z.string().optional(), metadata: metadataSchema.optional() }) as z.ZodType<ShopifyCatalogSyncResult>;
