import { z } from 'zod';
import type { LiveQuoteBuilderRequest, LiveQuoteBuilderResult, Quote, QuoteAssemblyInput, QuoteAssemblyResult, QuoteCustomerMetadata, QuoteDraft, QuoteLine, QuoteLineAssemblyInput, QuotePackageReference, QuotePayload, QuotePipelineCommerceReference, QuotePipelineInput, QuotePipelineLineInput, QuotePipelinePackageInput, QuotePipelineResult, QuotePricingReference, QuoteValidationResult, QuoteWorkflowState, ReviewFlag } from '@/types';
import { baseEntityObjectSchema, metadataSchema, moneySchema } from './common.schema';
import { commerceLookupResultSchema, priceSchema, shopifyProductSchema, variantMappingSchema } from './commerce.schema';
import { packageAssemblyResultSchema, packageDefinitionSchema } from './package.schema';
import { pricingContextSchema, pricingResolutionSchema, quotePricingResultSchema, pricingSubjectSchema } from './pricing.schema';
import { vehicleSchema } from './vehicle.schema';

const nonEmptyString = z.string().min(1);
const quoteMetadataValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const quoteMetadataObjectSchema = z.object({
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  attributes: z.record(quoteMetadataValueSchema).optional(),
});
const positiveQuantity = z.number().int().positive();

export const quoteReviewFlagSeveritySchema = z.enum(['info', 'warning', 'error', 'review-required']);
export const quoteApprovalStatusSchema = z.enum(['draft', 'pending-review', 'approved', 'rejected', 'changes-requested', 'expired', 'unknown']);
export const quoteWorkflowStatusSchema = z.enum(['draft', 'assembling', 'ready-for-review', 'in-review', 'approved', 'rejected', 'submitted', 'cancelled']);
export const quoteLineItemTypeSchema = z.enum(['product', 'accessory', 'service', 'kit', 'package', 'custom']);
export const quoteBuilderResultStatusSchema = z.enum(['draft', 'pending', 'assembled', 'invalid', 'unavailable']);

export const reviewFlagSchema = z.object({
  code: nonEmptyString,
  severity: quoteReviewFlagSeveritySchema,
  message: nonEmptyString,
  fieldPath: z.string().optional(),
  lineId: z.string().optional(),
  source: z.enum(['quote-builder', 'package-builder', 'pricing', 'commerce', 'approval', 'customer', 'unknown']).optional(),
}) as z.ZodType<ReviewFlag>;

export const quoteCustomerMetadataSchema = quoteMetadataObjectSchema.extend({
  customerId: z.string().optional(),
  agencyName: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  billingReference: z.string().optional(),
  accountNumber: z.string().optional(),
}) as z.ZodType<QuoteCustomerMetadata>;

export const quotePackageReferenceSchema = z.object({
  packageId: nonEmptyString,
  packageRevision: z.string().optional(),
  packageName: z.string().optional(),
  definition: packageDefinitionSchema.optional(),
  assembly: packageAssemblyResultSchema.optional(),
}) as z.ZodType<QuotePackageReference>;

export const quotePricingReferenceSchema = z.object({
  pricingRequestId: z.string().optional(),
  pricingResultId: z.string().optional(),
  status: z.string().optional(),
  subject: pricingSubjectSchema.optional(),
  result: quotePricingResultSchema.optional(),
  warnings: z.array(reviewFlagSchema).optional(),
}) as z.ZodType<QuotePricingReference>;

export const quoteWorkflowStateSchema = z.object({
  status: quoteWorkflowStatusSchema,
  approvalStatus: quoteApprovalStatusSchema,
  submittedAt: z.string().optional(),
  reviewedAt: z.string().optional(),
  reviewedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  approvedBy: z.string().optional(),
  rejectedAt: z.string().optional(),
  rejectedBy: z.string().optional(),
  expiresAt: z.string().optional(),
  reviewFlags: z.array(reviewFlagSchema).optional(),
}) as z.ZodType<QuoteWorkflowState>;

const quoteWorkflowStateInputSchema = z.object({
  status: quoteWorkflowStatusSchema.optional(),
  approvalStatus: quoteApprovalStatusSchema.optional(),
  submittedAt: z.string().optional(),
  reviewedAt: z.string().optional(),
  reviewedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  approvedBy: z.string().optional(),
  rejectedAt: z.string().optional(),
  rejectedBy: z.string().optional(),
  expiresAt: z.string().optional(),
  reviewFlags: z.array(reviewFlagSchema).optional(),
});

export const quoteLineAssemblyInputSchema = z.object({
  id: z.string().optional(),
  lineType: quoteLineItemTypeSchema,
  label: nonEmptyString,
  quantity: positiveQuantity,
  sku: z.string().optional(),
  productId: z.string().optional(),
  packageReference: quotePackageReferenceSchema.optional(),
  pricingReference: quotePricingReferenceSchema.optional(),
  metadata: metadataSchema.optional(),
}).refine((line) => Boolean(line.sku || line.productId || line.packageReference || line.lineType === 'custom' || line.lineType === 'service'), {
  message: 'Quote line assembly requires sku, productId, packageReference, or a custom/service line type.',
}) as z.ZodType<QuoteLineAssemblyInput>;

export const quoteLineSchema = z.object({
  id: nonEmptyString,
  sku: z.string().optional(),
  productId: z.string().optional(),
  label: nonEmptyString,
  quantity: positiveQuantity,
  lineType: quoteLineItemTypeSchema.optional(),
  packageReference: quotePackageReferenceSchema.optional(),
  pricingReference: quotePricingReferenceSchema.optional(),
  price: priceSchema.optional(),
  subtotal: moneySchema.optional(),
  reviewFlags: z.array(reviewFlagSchema).optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<QuoteLine>;

export const quoteAssemblyInputSchema = z.object({
  draftId: z.string().optional(),
  customer: quoteCustomerMetadataSchema,
  verticalId: z.string().optional(),
  vehicle: vehicleSchema.optional(),
  lines: z.array(quoteLineAssemblyInputSchema).min(1),
  packageReferences: z.array(quotePackageReferenceSchema).optional(),
  pricingReference: quotePricingReferenceSchema.optional(),
  workflow: quoteWorkflowStateInputSchema.optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<QuoteAssemblyInput>;

export const quoteDraftSchema = baseEntityObjectSchema.extend({
  customer: quoteCustomerMetadataSchema,
  verticalId: z.string().optional(),
  vehicle: vehicleSchema.optional(),
  lines: z.array(quoteLineSchema),
  packageReferences: z.array(quotePackageReferenceSchema).optional(),
  pricingReference: quotePricingReferenceSchema.optional(),
  workflow: quoteWorkflowStateSchema,
  reviewFlags: z.array(reviewFlagSchema).optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<QuoteDraft>;

export const quoteSchema = baseEntityObjectSchema.extend({
  customerId: z.string().optional(),
  customer: quoteCustomerMetadataSchema.optional(),
  verticalId: z.string().optional(),
  status: z.string(),
  approvalStatus: quoteApprovalStatusSchema.optional(),
  workflow: quoteWorkflowStateSchema.optional(),
  lines: z.array(quoteLineSchema),
  packageReferences: z.array(quotePackageReferenceSchema).optional(),
  pricingReference: quotePricingReferenceSchema.optional(),
  reviewFlags: z.array(reviewFlagSchema).optional(),
  total: moneySchema.optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<Quote>;

export const quoteAssemblyResultSchema = z.object({
  status: quoteBuilderResultStatusSchema,
  draft: quoteDraftSchema.nullable(),
  reviewFlags: z.array(reviewFlagSchema),
}) as z.ZodType<QuoteAssemblyResult>;

export const quoteValidationResultSchema = z.object({
  valid: z.boolean(),
  reviewFlags: z.array(reviewFlagSchema),
}) as z.ZodType<QuoteValidationResult>;

export const quotePipelinePackageInputSchema = z.object({
  packageId: nonEmptyString,
  definition: packageDefinitionSchema.optional(),
  selectedOptionalAccessoryIds: z.array(z.string()).optional(),
  vehicle: vehicleSchema.optional(),
  fitment: z.array(z.object({
    vehicleId: z.string().optional(),
    productId: z.string().optional(),
    compatible: z.boolean(),
    notes: z.string().optional(),
    requiredOptionIds: z.array(z.string()).optional(),
    excludedOptionIds: z.array(z.string()).optional(),
  })).optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<QuotePipelinePackageInput>;

export const quotePipelineLineInputSchema = quoteLineAssemblyInputSchema.and(z.object({
  configuratorId: z.string().optional(),
})) as z.ZodType<QuotePipelineLineInput>;

export const quotePipelineInputSchema = z.object({
  draftId: z.string().optional(),
  customer: quoteCustomerMetadataSchema,
  verticalId: z.string().optional(),
  vehicle: vehicleSchema.optional(),
  lines: z.array(quotePipelineLineInputSchema).min(1),
  packages: z.array(quotePipelinePackageInputSchema).optional(),
  pricingContext: pricingContextSchema,
  metadata: metadataSchema.optional(),
}) as z.ZodType<QuotePipelineInput>;

export const quotePipelineCommerceReferenceSchema = z.object({
  sku: z.string().optional(),
  productId: z.string().optional(),
  productLookup: commerceLookupResultSchema(shopifyProductSchema).optional(),
  variantMappingLookup: commerceLookupResultSchema(variantMappingSchema).optional(),
}) as z.ZodType<QuotePipelineCommerceReference>;

export const quotePipelineResultSchema = z.object({
  status: z.enum(['assembled', 'pending', 'invalid', 'unavailable']),
  quote: quoteAssemblyResultSchema,
  packageReferences: z.array(quotePackageReferenceSchema),
  pricing: pricingResolutionSchema(quotePricingResultSchema),
  commerceReferences: z.array(quotePipelineCommerceReferenceSchema),
  reviewFlags: z.array(reviewFlagSchema),
}) as z.ZodType<QuotePipelineResult>;


export const liveQuoteBuilderRequestSchema: z.ZodType<LiveQuoteBuilderRequest> = quotePipelineInputSchema;

export const liveQuoteBuilderResultSchema = z.object({
  status: z.enum(['priced', 'pending', 'invalid', 'unavailable']),
  quote: quoteSchema.nullable(),
  draft: quoteDraftSchema.nullable(),
  pipeline: quotePipelineResultSchema,
  packageReferences: z.array(quotePackageReferenceSchema),
  pricing: pricingResolutionSchema(quotePricingResultSchema),
  commerceReferences: z.array(quotePipelineCommerceReferenceSchema),
  reviewFlags: z.array(reviewFlagSchema),
  pdfReady: z.boolean(),
}) as z.ZodType<LiveQuoteBuilderResult>;

export const quotePayloadSchema = z.object({
  quote: quoteSchema,
  source: z.string(),
  submittedAt: z.string().optional(),
  metadata: z.record(quoteMetadataValueSchema).optional(),
}) as z.ZodType<QuotePayload>;
