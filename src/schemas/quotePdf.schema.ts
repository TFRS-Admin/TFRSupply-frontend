import { z } from 'zod';
import type { QuotePdfDocumentMetadata, QuotePdfDocumentMetadataInput, QuotePdfRenderError, QuotePdfRenderInput, QuotePdfRenderOptions, QuotePdfRenderOutput, QuotePdfRenderResult, QuotePdfValidationResult } from '@/types';
import { metadataSchema } from './common.schema';
import { quoteDraftSchema, reviewFlagSchema } from './quote.schema';

const nonEmptyString = z.string().min(1);

export const quotePdfPageSizeSchema = z.enum(['letter', 'legal', 'a4', 'tabloid']);
export const quotePdfOrientationSchema = z.enum(['portrait', 'landscape']);
export const quotePdfRenderStatusSchema = z.enum(['rendered', 'invalid', 'unavailable', 'failed']);
export const quotePdfRenderOutputStatusSchema = z.enum(['rendered', 'failed']);

export const quotePdfRenderErrorSchema = z.object({
  code: nonEmptyString,
  message: nonEmptyString,
  fieldPath: z.string().optional(),
  detail: z.string().optional(),
}) as z.ZodType<QuotePdfRenderError>;

export const quotePdfDocumentMetadataInputSchema = z.object({
  title: nonEmptyString,
  templateId: nonEmptyString,
  fileName: z.string().optional(),
  revision: z.string().optional(),
  pageSize: quotePdfPageSizeSchema.optional(),
  orientation: quotePdfOrientationSchema.optional(),
  locale: z.string().optional(),
  currencyCode: z.string().optional(),
  watermark: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<QuotePdfDocumentMetadataInput>;

export const quotePdfDocumentMetadataSchema = quotePdfDocumentMetadataInputSchema.and(z.object({
  documentId: z.string().optional(),
  fileName: nonEmptyString,
  generatedAt: nonEmptyString,
  generatedBy: z.string().optional(),
  contentType: nonEmptyString,
  pageCount: z.number().int().positive().optional(),
})) as z.ZodType<QuotePdfDocumentMetadata>;

export const quotePdfRenderOptionsSchema = z.object({
  includePricing: z.boolean().optional(),
  includePackageDetails: z.boolean().optional(),
  includeReviewFlags: z.boolean().optional(),
  includeCoverPage: z.boolean().optional(),
}) as z.ZodType<QuotePdfRenderOptions>;

export const quotePdfRenderInputSchema = z.object({
  draft: quoteDraftSchema,
  documentMetadata: quotePdfDocumentMetadataInputSchema,
  options: quotePdfRenderOptionsSchema.optional(),
}).refine((input) => input.draft.lines.length > 0, {
  message: 'Quote PDF rendering requires at least one quote line.',
  path: ['draft', 'lines'],
}).refine((input) => Boolean(input.draft.customer.agencyName || input.draft.customer.contactName || input.draft.customer.contactEmail), {
  message: 'Quote PDF rendering requires an agency name, contact name, or contact email to address the document.',
  path: ['draft', 'customer'],
}) as z.ZodType<QuotePdfRenderInput>;

export const quotePdfRenderOutputSchema = z.object({
  status: quotePdfRenderOutputStatusSchema,
  documentMetadata: quotePdfDocumentMetadataSchema.nullable(),
  errors: z.array(quotePdfRenderErrorSchema),
}) as z.ZodType<QuotePdfRenderOutput>;

export const quotePdfRenderResultSchema = z.object({
  status: quotePdfRenderStatusSchema,
  documentMetadata: quotePdfDocumentMetadataSchema.nullable(),
  reviewFlags: z.array(reviewFlagSchema),
  errors: z.array(quotePdfRenderErrorSchema),
}) as z.ZodType<QuotePdfRenderResult>;

export const quotePdfValidationResultSchema = z.object({
  valid: z.boolean(),
  reviewFlags: z.array(reviewFlagSchema),
  errors: z.array(quotePdfRenderErrorSchema),
}) as z.ZodType<QuotePdfValidationResult>;
