import { z } from 'zod';
import type {
  CartCheckoutLinePayload,
  CartCheckoutPreparationResult,
  CartCheckoutPreparationStatus,
  CartLineConfigurationStatus,
  CartLineInput,
  CartLineItem,
  CartLineSource,
  CartState,
  CartSummary,
  CartValidationIssue,
  CartValidationResult,
  CartValidationSeverity,
} from '@/types';
import { cartLineDraftSchema, commerceAvailabilityStateSchema } from './commerce.schema';
import { imageAssetSchema, metadataSchema, moneySchema } from './common.schema';

export const cartLineConfigurationStatusSchema = z.enum([
  'not-required',
  'complete',
  'incomplete',
  'unknown',
]) satisfies z.ZodType<CartLineConfigurationStatus>;

export const cartLineSourceSchema = z.enum(['product', 'configurator', 'package']) satisfies z.ZodType<CartLineSource>;

export const cartValidationSeveritySchema = z.enum(['info', 'warning', 'error']) satisfies z.ZodType<CartValidationSeverity>;

export const cartCheckoutPreparationStatusSchema = z.enum([
  'ready',
  'incomplete',
  'unavailable',
]) satisfies z.ZodType<CartCheckoutPreparationStatus>;

export const cartLineItemSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  sku: z.string().min(1),
  label: z.string().min(1),
  image: imageAssetSchema.optional(),
  quantity: z.number().int().positive(),
  unitPrice: moneySchema,
  lineTotal: moneySchema,
  availability: commerceAvailabilityStateSchema,
  configurationStatus: cartLineConfigurationStatusSchema,
  isPackage: z.boolean(),
  packageId: z.string().optional(),
  source: cartLineSourceSchema.optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<CartLineItem>;

export const cartLineInputSchema = z.object({
  productId: z.string().min(1),
  sku: z.string().min(1),
  label: z.string().min(1),
  image: imageAssetSchema.optional(),
  quantity: z.number().int().positive(),
  unitPrice: moneySchema,
  availability: commerceAvailabilityStateSchema.optional(),
  configurationStatus: cartLineConfigurationStatusSchema.optional(),
  isPackage: z.boolean().optional(),
  packageId: z.string().optional(),
  source: cartLineSourceSchema.optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<CartLineInput>;

export const cartSummarySchema = z.object({
  itemCount: z.number().int().nonnegative(),
  lineCount: z.number().int().nonnegative(),
  currencyCode: z.string().min(1),
  subtotal: moneySchema,
  estimatedShipping: moneySchema.nullable(),
  estimatedTax: moneySchema.nullable(),
  grandTotalEstimate: moneySchema,
}) as z.ZodType<CartSummary>;

export const cartValidationIssueSchema = z.object({
  code: z.string().min(1),
  severity: cartValidationSeveritySchema,
  message: z.string().min(1),
  lineId: z.string().optional(),
  fieldPath: z.string().optional(),
}) as z.ZodType<CartValidationIssue>;

export const cartValidationResultSchema = z.object({
  valid: z.boolean(),
  issues: z.array(cartValidationIssueSchema),
}) as z.ZodType<CartValidationResult>;

export const cartStateSchema = z.object({
  lines: z.array(cartLineItemSchema),
  summary: cartSummarySchema,
}) as z.ZodType<CartState>;

export const cartCheckoutLinePayloadSchema = z.object({
  lineId: z.string().min(1),
  sku: z.string().min(1),
  quantity: z.number().int().positive(),
  cartLineDraft: cartLineDraftSchema.nullable(),
  ready: z.boolean(),
  message: z.string().optional(),
}) as z.ZodType<CartCheckoutLinePayload>;

export const cartCheckoutPreparationResultSchema = z.object({
  status: cartCheckoutPreparationStatusSchema,
  lines: z.array(cartCheckoutLinePayloadSchema),
  summary: cartSummarySchema,
  issues: z.array(cartValidationIssueSchema),
}) as z.ZodType<CartCheckoutPreparationResult>;
