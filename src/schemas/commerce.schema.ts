import { z } from 'zod';
import type {
  CartLineDraft,
  CommerceAvailabilityState,
  CommerceChannel,
  CommerceLookupRequest,
  CommerceLookupResult,
  CommerceLookupStatus,
  CommerceProductReference,
  InventoryStatus,
  Price,
  ShopifyProduct,
  ShopifyVariant,
  VariantMapping,
} from '@/types';
import { baseEntityObjectSchema, metadataSchema, moneyObjectSchema, moneySchema } from './common.schema';

export const commerceChannelSchema = z.enum(['shopify', 'quote-only', 'manual']) satisfies z.ZodType<CommerceChannel>;

export const commerceAvailabilityStateSchema = z.enum([
  'available',
  'unavailable',
  'backorder',
  'preorder',
  'unknown',
]) satisfies z.ZodType<CommerceAvailabilityState>;

export const commerceLookupStatusSchema = z.enum([
  'ready',
  'not-found',
  'unmapped',
  'unavailable',
  'pending',
]) satisfies z.ZodType<CommerceLookupStatus>;

export const priceSchema = moneyObjectSchema.extend({
  compareAt: moneySchema.optional(),
  taxable: z.boolean().optional(),
}) as z.ZodType<Price>;

export const inventoryStatusSchema = z.object({
  available: z.boolean(),
  state: commerceAvailabilityStateSchema.optional(),
  quantityAvailable: z.number().optional(),
  policy: z.string().optional(),
  message: z.string().optional(),
}) as z.ZodType<InventoryStatus>;

export const commerceProductReferenceSchema = z.object({
  productId: z.string(),
  sku: z.string().optional(),
  configuratorId: z.string().optional(),
  verticalId: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<CommerceProductReference>;

export const variantMappingSchema = z.object({
  sku: z.string(),
  shopifyProductId: z.string().nullable().optional(),
  shopifyVariantId: z.string().nullable().optional(),
  shopifyProductGid: z.string().nullable().optional(),
  shopifyVariantGid: z.string().nullable().optional(),
  channel: commerceChannelSchema.optional(),
  price: priceSchema.optional(),
  optionValues: z.record(z.string()).optional(),
  productReference: commerceProductReferenceSchema.optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<VariantMapping>;

export const shopifyVariantSchema = baseEntityObjectSchema.extend({
  gid: z.string().nullable().optional(),
  sku: z.string(),
  title: z.string(),
  selectedOptions: z.record(z.string()).optional(),
  price: priceSchema.optional(),
  inventoryStatus: inventoryStatusSchema.optional(),
}) as z.ZodType<ShopifyVariant>;

export const shopifyProductSchema = baseEntityObjectSchema.extend({
  gid: z.string().nullable().optional(),
  handle: z.string(),
  cartEligible: z.boolean(),
  storefrontAvailable: z.boolean(),
  variants: z.array(shopifyVariantSchema).optional(),
  variantMappings: z.array(variantMappingSchema).optional(),
}) as z.ZodType<ShopifyProduct>;

export const commerceLookupRequestSchema = z.object({
  sku: z.string().optional(),
  productId: z.string().optional(),
  shopifyProductId: z.string().optional(),
  shopifyVariantId: z.string().optional(),
  channel: commerceChannelSchema.optional(),
}) as z.ZodType<CommerceLookupRequest>;

export const commerceLookupResultSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
  status: commerceLookupStatusSchema,
  data: dataSchema.nullable(),
  message: z.string().optional(),
}) as z.ZodType<CommerceLookupResult<z.infer<T>>>;

export const cartLineDraftSchema = z.object({
  sku: z.string(),
  quantity: z.number().int().positive(),
  variantMapping: variantMappingSchema,
  attributes: z.record(z.string()).optional(),
}) as z.ZodType<CartLineDraft>;
