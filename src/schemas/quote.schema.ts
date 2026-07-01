import { z } from 'zod';
import type { Quote, QuoteLine, QuotePayload, ReviewFlag } from '@/types';
import { baseEntityObjectSchema, moneySchema } from './common.schema';
import { priceSchema } from './commerce.schema';

const quoteMetadataValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const reviewFlagSchema = z.object({
  code: z.string(),
  severity: z.string(),
  message: z.string(),
  fieldPath: z.string().optional(),
}) as z.ZodType<ReviewFlag>;

export const quoteLineSchema = z.object({
  id: z.string(),
  sku: z.string().optional(),
  productId: z.string().optional(),
  label: z.string(),
  quantity: z.number(),
  price: priceSchema.optional(),
  subtotal: moneySchema.optional(),
  reviewFlags: z.array(reviewFlagSchema).optional(),
}) as z.ZodType<QuoteLine>;

export const quoteSchema = baseEntityObjectSchema.extend({
  customerId: z.string().optional(),
  verticalId: z.string().optional(),
  status: z.string(),
  lines: z.array(quoteLineSchema),
  reviewFlags: z.array(reviewFlagSchema).optional(),
  total: moneySchema.optional(),
}) as z.ZodType<Quote>;

export const quotePayloadSchema = z.object({
  quote: quoteSchema,
  source: z.string(),
  submittedAt: z.string().optional(),
  metadata: z.record(quoteMetadataValueSchema).optional(),
}) as z.ZodType<QuotePayload>;
