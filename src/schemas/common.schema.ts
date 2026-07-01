import { z } from 'zod';
import type { BaseEntity, Dimensions, ImageAsset, Metadata, Money } from '@/types';

const metadataAttributeSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const metadataSchema = z.object({
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  attributes: z.record(metadataAttributeSchema).optional(),
}) as z.ZodType<Metadata>;

export const baseEntityObjectSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  metadata: metadataSchema.optional(),
});

export const baseEntitySchema = baseEntityObjectSchema as z.ZodType<BaseEntity>;

export const moneyObjectSchema = z.object({
  amount: z.number(),
  currencyCode: z.string(),
});

export const moneySchema = moneyObjectSchema as z.ZodType<Money>;

export const dimensionsSchema = z.object({
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  unit: z.string().optional(),
  weightUnit: z.string().optional(),
}) as z.ZodType<Dimensions>;

export const imageAssetSchema = z.object({
  id: z.string().optional(),
  src: z.string(),
  alt: z.string(),
  title: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
}) as z.ZodType<ImageAsset>;
