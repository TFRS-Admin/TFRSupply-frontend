import { z } from 'zod';
import type {
  BundlePricing,
  BundlePricingInput,
  BundlePricingItem,
  ContractPrice,
  ContractWindow,
  DealerContract,
  DealerCost,
  ListPrice,
  Margin,
  PriceSource,
  PricingContext,
  PricingLineInput,
  PricingResolution,
  PricingSubject,
  PricingWarning,
  PromotionalBundle,
  QuantityBreak,
  QuotePricingInput,
  QuotePricingLine,
  QuotePricingResult,
} from '@/types';
import { baseEntityObjectSchema, moneySchema } from './common.schema';

const nonEmptyString = z.string().min(1);
const positiveQuantity = z.number().int().positive();

export const priceSourceTypeSchema = z.enum(['federal-signal-msrp', 'dealer-cost', 'dealer-contract', 'promotional-bundle', 'quantity-break', 'quote', 'manual', 'unknown']);
export const pricingWarningSeveritySchema = z.enum(['info', 'warning', 'error', 'review-required']);
export const pricingResultStatusSchema = z.enum(['priced', 'pending', 'not-found', 'invalid', 'unavailable']);

export const priceSourceSchema = baseEntityObjectSchema.extend({
  sourceType: priceSourceTypeSchema.or(nonEmptyString),
  priority: z.number().int().nonnegative(),
  currencyCode: nonEmptyString,
  name: z.string().optional(),
  effectiveAt: z.string().optional(),
  expiresAt: z.string().optional(),
}) as z.ZodType<PriceSource>;

const pricingSubjectObjectSchema = z.object({
  sku: nonEmptyString,
  productId: z.string().optional(),
  variantId: z.string().optional(),
});

export const pricingSubjectSchema = pricingSubjectObjectSchema as z.ZodType<PricingSubject>;

export const pricingContextSchema = z.object({
  pricingDate: nonEmptyString,
  currencyCode: nonEmptyString,
  dealerId: z.string().optional(),
  agencyId: z.string().optional(),
  contractId: z.string().optional(),
  promotionCodes: z.array(z.string()).optional(),
}) as z.ZodType<PricingContext>;

export const pricingLineInputSchema = pricingSubjectObjectSchema.extend({
  quantity: positiveQuantity,
  requestedUnitPrice: moneySchema.optional(),
}) as z.ZodType<PricingLineInput>;

export const bundlePricingInputSchema = baseEntityObjectSchema.extend({
  promotionCode: z.string().optional(),
  context: pricingContextSchema,
  items: z.array(pricingLineInputSchema).min(1),
}) as z.ZodType<BundlePricingInput>;

export const quotePricingInputSchema = z.object({
  quoteId: z.string().optional(),
  context: pricingContextSchema,
  lines: z.array(pricingLineInputSchema).min(1),
}) as z.ZodType<QuotePricingInput>;

export const listPriceSchema = baseEntityObjectSchema.merge(pricingSubjectObjectSchema).extend({
  price: moneySchema,
  source: priceSourceSchema,
  effectiveAt: z.string().optional(),
}) as z.ZodType<ListPrice>;

export const dealerCostSchema = baseEntityObjectSchema.merge(pricingSubjectObjectSchema).extend({
  cost: moneySchema,
  source: priceSourceSchema,
  effectiveAt: z.string().optional(),
}) as z.ZodType<DealerCost>;

export const quantityBreakSchema = baseEntityObjectSchema.extend({
  minQuantity: positiveQuantity,
  maxQuantity: positiveQuantity.optional(),
  unitPrice: moneySchema,
  discountPercent: z.number().min(0).max(100).optional(),
}) as z.ZodType<QuantityBreak>;

export const contractWindowSchema = baseEntityObjectSchema.extend({
  startsAt: nonEmptyString,
  endsAt: nonEmptyString,
  timezone: z.string().optional(),
  expirationAlertDays: z.number().int().nonnegative().optional(),
}) as z.ZodType<ContractWindow>;

export const contractPriceSchema = baseEntityObjectSchema.merge(pricingSubjectObjectSchema).extend({
  contractId: nonEmptyString,
  sellingPrice: moneySchema,
  dealerCost: dealerCostSchema.optional(),
  listPrice: listPriceSchema.optional(),
  quantityBreaks: z.array(quantityBreakSchema).optional(),
  window: contractWindowSchema.optional(),
}) as z.ZodType<ContractPrice>;

export const dealerContractSchema = baseEntityObjectSchema.extend({
  dealerId: z.string().optional(),
  agencyId: z.string().optional(),
  contractNumber: z.string().optional(),
  source: priceSourceSchema,
  window: contractWindowSchema,
  prices: z.array(contractPriceSchema).optional(),
}) as z.ZodType<DealerContract>;

export const marginSchema = z.object({
  revenue: moneySchema,
  cost: moneySchema,
  grossProfit: moneySchema,
  grossMarginPercent: z.number(),
}) as z.ZodType<Margin>;

export const pricingWarningSchema = z.object({
  code: nonEmptyString,
  severity: pricingWarningSeveritySchema,
  message: nonEmptyString,
  sku: z.string().optional(),
  productId: z.string().optional(),
  fieldPath: z.string().optional(),
}) as z.ZodType<PricingWarning>;

export const bundlePricingItemSchema = pricingSubjectObjectSchema.extend({
  quantity: positiveQuantity,
  listPrice: listPriceSchema.optional(),
  dealerCost: dealerCostSchema.optional(),
  contractPrice: contractPriceSchema.optional(),
  appliedQuantityBreak: quantityBreakSchema.optional(),
}) as z.ZodType<BundlePricingItem>;

const bundlePricingObjectSchema = baseEntityObjectSchema.extend({
  items: z.array(bundlePricingItemSchema),
  listPrice: moneySchema.optional(),
  sellingPrice: moneySchema.optional(),
  dealerCost: moneySchema.optional(),
  margin: marginSchema.optional(),
  source: priceSourceSchema.optional(),
  warnings: z.array(pricingWarningSchema).optional(),
});

export const bundlePricingSchema = bundlePricingObjectSchema as z.ZodType<BundlePricing>;

export const promotionalBundleSchema = bundlePricingObjectSchema.extend({
  promotionCode: z.string().optional(),
  window: contractWindowSchema.optional(),
}) as z.ZodType<PromotionalBundle>;

export const quotePricingLineSchema = pricingSubjectObjectSchema.extend({
  id: nonEmptyString,
  quantity: positiveQuantity,
  listPrice: listPriceSchema.optional(),
  dealerCost: dealerCostSchema.optional(),
  contractPrice: contractPriceSchema.optional(),
  appliedQuantityBreak: quantityBreakSchema.optional(),
  sellingPrice: moneySchema.optional(),
  margin: marginSchema.optional(),
  warnings: z.array(pricingWarningSchema).optional(),
}) as z.ZodType<QuotePricingLine>;

export const quotePricingResultSchema = z.object({
  quoteId: z.string().optional(),
  source: priceSourceSchema,
  lines: z.array(quotePricingLineSchema),
  subtotal: moneySchema,
  margin: marginSchema.optional(),
  warnings: z.array(pricingWarningSchema).optional(),
}) as z.ZodType<QuotePricingResult>;

export const pricingResolutionSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
  status: pricingResultStatusSchema,
  data: dataSchema.nullable(),
  warnings: z.array(pricingWarningSchema).optional(),
  message: z.string().optional(),
}) as z.ZodType<PricingResolution<z.infer<T>>>;
