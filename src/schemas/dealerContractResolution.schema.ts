import { z } from 'zod';
import type {
  ContractWindowEvaluation,
  DealerContractResolutionRequest,
  DealerContractResolutionResult,
  DealerContractSelection,
  PromotionalBundleResolution,
  QuantityBreakSelection,
} from '@/types';
import {
  contractPriceSchema,
  contractWindowSchema,
  dealerContractSchema,
  priceSourceSchema,
  pricingContextSchema,
  pricingWarningSchema,
  promotionalBundleSchema,
  quantityBreakSchema,
} from './pricing.schema';

const nonEmptyString = z.string().min(1);
const positiveQuantity = z.number().int().positive();

export const contractWindowEvaluationStatusSchema = z.enum(['active', 'upcoming', 'expiring-soon', 'expired', 'unknown']);
export const dealerContractResolutionStatusSchema = z.enum(['resolved', 'no-match', 'expired', 'not-eligible', 'invalid']);

export const contractWindowEvaluationSchema = z.object({
  status: contractWindowEvaluationStatusSchema,
  window: contractWindowSchema,
  evaluatedAt: nonEmptyString,
  daysUntilStart: z.number().optional(),
  daysUntilExpiration: z.number().optional(),
}) as z.ZodType<ContractWindowEvaluation>;

export const dealerContractResolutionRequestSchema = z.object({
  sku: nonEmptyString,
  productId: z.string().optional(),
  variantId: z.string().optional(),
  quantity: positiveQuantity,
  context: pricingContextSchema,
  candidateContracts: z.array(dealerContractSchema).optional(),
  candidateBundles: z.array(promotionalBundleSchema).optional(),
}) as z.ZodType<DealerContractResolutionRequest>;

export const dealerContractSelectionSchema = z.object({
  contract: dealerContractSchema.nullable(),
  contractPrice: contractPriceSchema.nullable(),
  windowEvaluation: contractWindowEvaluationSchema.optional(),
  source: priceSourceSchema.optional(),
}) as z.ZodType<DealerContractSelection>;

export const quantityBreakSelectionSchema = z.object({
  quantity: positiveQuantity,
  applied: quantityBreakSchema.nullable(),
  eligibleBreaks: z.array(quantityBreakSchema),
}) as z.ZodType<QuantityBreakSelection>;

export const promotionalBundleResolutionSchema = z.object({
  status: dealerContractResolutionStatusSchema,
  bundle: promotionalBundleSchema.nullable(),
  windowEvaluation: contractWindowEvaluationSchema.optional(),
  reason: z.string().optional(),
}) as z.ZodType<PromotionalBundleResolution>;

export const dealerContractResolutionResultSchema = z.object({
  status: dealerContractResolutionStatusSchema,
  sku: nonEmptyString,
  productId: z.string().optional(),
  quantity: positiveQuantity,
  contractSelection: dealerContractSelectionSchema,
  quantityBreakSelection: quantityBreakSelectionSchema,
  bundleResolution: promotionalBundleResolutionSchema.nullable(),
  warnings: z.array(pricingWarningSchema),
  message: z.string().optional(),
}) as z.ZodType<DealerContractResolutionResult>;
