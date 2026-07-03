import { z } from 'zod';
import type {
  CheckoutBlocker,
  CheckoutIssueCategory,
  CheckoutLineReadiness,
  CheckoutLineValidation,
  CheckoutPayloadPreview,
  CheckoutPayloadPreviewLine,
  CheckoutPreparationRequest,
  CheckoutPreparationResult,
  CheckoutReadinessStatus,
  CheckoutWarning,
} from '@/types';
import { cartLineItemSchema, cartValidationResultSchema } from './cartWorkspace.schema';
import { variantMappingSchema } from './commerce.schema';
import { moneySchema } from './common.schema';

export const checkoutIssueCategorySchema = z.enum([
  'cart',
  'configuration',
  'package',
  'pricing',
  'commerce',
]) satisfies z.ZodType<CheckoutIssueCategory>;

export const checkoutLineReadinessSchema = z.enum([
  'ready',
  'warning',
  'blocked',
]) satisfies z.ZodType<CheckoutLineReadiness>;

export const checkoutReadinessStatusSchema = z.enum(['ready', 'blocked']) satisfies z.ZodType<CheckoutReadinessStatus>;

export const checkoutPreparationRequestSchema = z.object({
  lines: z.array(cartLineItemSchema).optional(),
}) as z.ZodType<CheckoutPreparationRequest>;

export const checkoutWarningSchema = z.object({
  code: z.string().min(1),
  category: checkoutIssueCategorySchema,
  message: z.string().min(1),
  lineId: z.string().optional(),
}) as z.ZodType<CheckoutWarning>;

export const checkoutBlockerSchema = z.object({
  code: z.string().min(1),
  category: checkoutIssueCategorySchema,
  message: z.string().min(1),
  lineId: z.string().optional(),
}) as z.ZodType<CheckoutBlocker>;

export const checkoutLineValidationSchema = z.object({
  lineId: z.string().min(1),
  sku: z.string().min(1),
  cartValid: z.boolean(),
  configurationValid: z.boolean(),
  packageValid: z.boolean(),
  pricingAvailable: z.boolean(),
  commerceAvailable: z.boolean(),
  readiness: checkoutLineReadinessSchema,
  blockers: z.array(checkoutBlockerSchema),
  warnings: z.array(checkoutWarningSchema),
}) as z.ZodType<CheckoutLineValidation>;

export const checkoutPayloadPreviewLineSchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().int().positive(),
  variantMapping: variantMappingSchema,
}) as z.ZodType<CheckoutPayloadPreviewLine>;

export const checkoutPayloadPreviewSchema = z.object({
  currencyCode: z.string().min(1),
  lines: z.array(checkoutPayloadPreviewLineSchema),
  estimatedTotal: moneySchema,
}) as z.ZodType<CheckoutPayloadPreview>;

export const checkoutPreparationResultSchema = z.object({
  status: checkoutReadinessStatusSchema,
  cartValidation: cartValidationResultSchema,
  lineValidations: z.array(checkoutLineValidationSchema),
  blockers: z.array(checkoutBlockerSchema),
  warnings: z.array(checkoutWarningSchema),
  payloadPreview: checkoutPayloadPreviewSchema.nullable(),
}) as z.ZodType<CheckoutPreparationResult>;
