import { z } from 'zod';
import type { Accessory, Package, PackageLine } from '@/types';
import { baseEntityObjectSchema } from './common.schema';
import { productSchema } from './product.schema';

export const accessorySchema = baseEntityObjectSchema.extend({
  sku: z.string().optional(),
  productId: z.string().optional(),
  compatibleProductIds: z.array(z.string()).optional(),
}) as z.ZodType<Accessory>;

export const packageLineSchema = z.object({
  id: z.string(),
  product: z.union([productSchema, accessorySchema]),
  quantity: z.number(),
  required: z.boolean(),
  sortOrder: z.number().optional(),
}) as z.ZodType<PackageLine>;

export const packageSchema = baseEntityObjectSchema.extend({
  verticalIds: z.array(z.string()),
  categoryIds: z.array(z.string()).optional(),
  lines: z.array(packageLineSchema),
}) as z.ZodType<Package>;
