import { z } from 'zod';
import type { InventoryStatus, Price, ShopifyProduct, ShopifyVariant, VariantMapping } from '@/types';
import { baseEntityObjectSchema, moneyObjectSchema, moneySchema } from './common.schema';

export const priceSchema = moneyObjectSchema.extend({
  compareAt: moneySchema.optional(),
  taxable: z.boolean().optional(),
}) as z.ZodType<Price>;

export const inventoryStatusSchema = z.object({
  available: z.boolean(),
  quantityAvailable: z.number().optional(),
  policy: z.string().optional(),
  message: z.string().optional(),
}) as z.ZodType<InventoryStatus>;

export const variantMappingSchema = z.object({
  sku: z.string(),
  shopifyVariantId: z.string().nullable().optional(),
  price: priceSchema.optional(),
  optionValues: z.record(z.string()).optional(),
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
