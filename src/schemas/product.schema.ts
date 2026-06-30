import { z } from 'zod';
import type { Category, Feature, Product, ProductFamily, Specification, Vertical } from '@/types';
import { baseEntityObjectSchema, dimensionsSchema, imageAssetSchema, metadataSchema } from './common.schema';

export const verticalSchema = baseEntityObjectSchema.extend({
  slug: z.string(),
  priority: z.number().optional(),
}) as z.ZodType<Vertical>;

export const categorySchema = baseEntityObjectSchema.extend({
  slug: z.string(),
  verticalId: z.string(),
  parentCategoryId: z.string().optional(),
  image: imageAssetSchema.optional(),
}) as z.ZodType<Category>;

export const productFamilySchema = baseEntityObjectSchema.extend({
  slug: z.string(),
  verticalIds: z.array(z.string()),
  categoryIds: z.array(z.string()),
  heroImage: imageAssetSchema.optional(),
}) as z.ZodType<ProductFamily>;

export const featureSchema = baseEntityObjectSchema.extend({
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
}) as z.ZodType<Feature>;

export const specificationSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  unit: z.string().optional(),
  group: z.string().optional(),
  sortOrder: z.number().optional(),
}) as z.ZodType<Specification>;

export const productSchema = baseEntityObjectSchema.extend({
  slug: z.string(),
  sku: z.string().optional(),
  familyId: z.string().optional(),
  verticalIds: z.array(z.string()),
  categoryIds: z.array(z.string()),
  features: z.array(featureSchema).optional(),
  specifications: z.array(specificationSchema).optional(),
  dimensions: dimensionsSchema.optional(),
  images: z.array(imageAssetSchema).optional(),
  documentIds: z.array(z.string()).optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<Product>;
