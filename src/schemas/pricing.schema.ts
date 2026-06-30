import { z } from 'zod';
import type {
  BundlePricing,
  BundlePricingItem,
  ContractPrice,
  ContractWindow,
  DealerContract,
  DealerCost,
  ListPrice,
  Margin,
  PriceSource,
  PricingWarning,
  PromotionalBundle,
  QuantityBreak,
  QuotePricingLine,
  QuotePricingResult,
} from '@/types';
import { baseEntityObjectSchema, moneySchema } from './common.schema';

export const priceSourceSchema = baseEntityObjectSchema.extend({
  sourceType: z.string(),
  priority: z.number(),
  currencyCode: z.string(),
  effectiveAt: z.string().optional(),
  expiresAt: z.string().optional(),
}) as z.ZodType<PriceSource>;

export const listPriceSchema = baseEntityObjectSchema.extend({
  sku: z.string(),
  productId: z.string().optional(),
  price: moneySchema,
  source: priceSourceSchema,
  effectiveAt: z.string().optional(),
}) as z.ZodType<ListPrice>;

export const dealerCostSchema = baseEntityObjectSchema.extend({
  sku: z.string(),
  productId: z.string().optional(),
  cost: moneySchema,
  source: priceSourceSchema,
  effectiveAt: z.string().optional(),
}) as z.ZodType<DealerCost>;

export const quantityBreakSchema = baseEntityObjectSchema.extend({
  minQuantity: z.number(),
  maxQuantity: z.number().optional(),
  price: moneySchema,
  discountPercent: z.number().optional(),
}) as z.ZodType<QuantityBreak>;

export const contractWindowSchema = baseEntityObjectSchema.extend({
  startsAt: z.string(),
  endsAt: z.string(),
  timezone: z.string().optional(),
  expirationAlertDays: z.number().optional(),
}) as z.ZodType<ContractWindow>;

export const contractPriceSchema = baseEntityObjectSchema.extend({
  sku: z.string(),
  productId: z.string().optional(),
  contractId: z.string(),
  sellingPrice: moneySchema,
  dealerCost: dealerCostSchema.optional(),
  listPrice: listPriceSchema.optional(),
  quantityBreaks: z.array(quantityBreakSchema).optional(),
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

export const bundlePricingItemSchema = z.object({
  sku: z.string(),
  productId: z.string().optional(),
  quantity: z.number(),
  listPrice: listPriceSchema.optional(),
  dealerCost: dealerCostSchema.optional(),
  contractPrice: contractPriceSchema.optional(),
}) as z.ZodType<BundlePricingItem>;

export const bundlePricingSchema = baseEntityObjectSchema.extend({
  items: z.array(bundlePricingItemSchema),
  listPrice: moneySchema.optional(),
  sellingPrice: moneySchema.optional(),
  dealerCost: moneySchema.optional(),
  margin: marginSchema.optional(),
}) as z.ZodType<BundlePricing>;

export const pricingWarningSchema = z.object({
  code: z.string(),
  severity: z.string(),
  message: z.string(),
  sku: z.string().optional(),
  productId: z.string().optional(),
  fieldPath: z.string().optional(),
}) as z.ZodType<PricingWarning>;

export const promotionalBundleSchema = bundlePricingSchema.and(z.object({
  promotionCode: z.string().optional(),
  window: contractWindowSchema.optional(),
  warnings: z.array(pricingWarningSchema).optional(),
})) as z.ZodType<PromotionalBundle>;

export const quotePricingLineSchema = z.object({
  id: z.string(),
  sku: z.string().optional(),
  productId: z.string().optional(),
  quantity: z.number(),
  listPrice: listPriceSchema.optional(),
  dealerCost: dealerCostSchema.optional(),
  contractPrice: contractPriceSchema.optional(),
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
