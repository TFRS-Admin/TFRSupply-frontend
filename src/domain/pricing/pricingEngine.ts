import type { BundlePricing, BundlePricingInput, BundlePricingItem, ContractPrice, DealerCost, ListPrice, Margin, Money, PriceSource, PricingCalculationContract, PricingLineInput, PricingResolution, PricingWarning, QuantityBreak, QuotePricingInput, QuotePricingLine, QuotePricingResult } from '@/types';
import { bundlePricingInputSchema, bundlePricingSchema, quotePricingInputSchema, quotePricingResultSchema } from '@/schemas/pricing.schema';

export interface PricingRecordSet {
  listPrices?: ListPrice[];
  dealerCosts?: DealerCost[];
  contractPrices?: ContractPrice[];
}

const quoteSource: PriceSource = {
  id: 'live-pricing-engine',
  label: 'Live Pricing Engine',
  sourceType: 'quote',
  priority: 0,
  currencyCode: 'USD',
};

function sameSubject(record: { sku: string; productId?: string; variantId?: string }, subject: { sku: string; productId?: string; variantId?: string }): boolean {
  return record.sku === subject.sku
    && (!subject.productId || !record.productId || record.productId === subject.productId)
    && (!subject.variantId || !record.variantId || record.variantId === subject.variantId);
}

function byPriority<T extends { source: PriceSource }>(records: T[]): T[] {
  return [...records].sort((a, b) => b.source.priority - a.source.priority);
}

export function money(amount: number, currencyCode: string): Money {
  return { amount: Number(amount.toFixed(2)), currencyCode };
}

export function multiplyMoney(value: Money | undefined, quantity: number, currencyCode: string): Money {
  return money((value?.amount ?? 0) * quantity, value?.currencyCode ?? currencyCode);
}

export function addMoney(values: Array<Money | undefined>, currencyCode: string): Money {
  return money(values.reduce((total, value) => total + (value?.amount ?? 0), 0), values.find(Boolean)?.currencyCode ?? currencyCode);
}

export function calculateMargin(revenue: Money, cost: Money): Margin {
  const grossProfit = money(revenue.amount - cost.amount, revenue.currencyCode);
  return {
    revenue,
    cost,
    grossProfit,
    grossMarginPercent: revenue.amount === 0 ? 0 : Number(((grossProfit.amount / revenue.amount) * 100).toFixed(2)),
  };
}

export function findListPrice(records: PricingRecordSet, subject: PricingLineInput): ListPrice | undefined {
  return byPriority(records.listPrices ?? []).find((record) => sameSubject(record, subject));
}

export function findDealerCost(records: PricingRecordSet, subject: PricingLineInput): DealerCost | undefined {
  return byPriority(records.dealerCosts ?? []).find((record) => sameSubject(record, subject));
}

export function selectBestQuantityBreak(quantityBreaks: QuantityBreak[] | undefined, quantity: number): QuantityBreak | undefined {
  return (quantityBreaks ?? [])
    .filter((quantityBreak) => quantity >= quantityBreak.minQuantity && (quantityBreak.maxQuantity == null || quantity <= quantityBreak.maxQuantity))
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];
}

export function resolveUnitSellingPrice(input: PricingLineInput, contractPrice?: ContractPrice, quantityBreak?: QuantityBreak, listPrice?: ListPrice): Money | undefined {
  return input.requestedUnitPrice ?? quantityBreak?.unitPrice ?? contractPrice?.sellingPrice ?? listPrice?.price;
}

export function priceQuoteLine(input: PricingLineInput, records: PricingRecordSet, currencyCode: string, contractPrice?: ContractPrice): QuotePricingLine {
  const listPrice = contractPrice?.listPrice ?? findListPrice(records, input);
  const dealerCost = contractPrice?.dealerCost ?? findDealerCost(records, input);
  const appliedQuantityBreak = selectBestQuantityBreak(contractPrice?.quantityBreaks, input.quantity);
  const unitSellingPrice = resolveUnitSellingPrice(input, contractPrice, appliedQuantityBreak, listPrice);
  const sellingPrice = multiplyMoney(unitSellingPrice, input.quantity, currencyCode);
  const cost = multiplyMoney(dealerCost?.cost, input.quantity, currencyCode);
  const warnings: PricingWarning[] = [];

  if (!unitSellingPrice) warnings.push({ code: 'pricing.line.missing-selling-price', severity: 'warning', message: `No selling price found for SKU ${input.sku}.`, sku: input.sku, productId: input.productId });
  if (!dealerCost) warnings.push({ code: 'pricing.line.missing-dealer-cost', severity: 'warning', message: `No dealer cost found for SKU ${input.sku}.`, sku: input.sku, productId: input.productId });

  return {
    id: `${input.sku}-${input.quantity}`,
    sku: input.sku,
    productId: input.productId,
    variantId: input.variantId,
    quantity: input.quantity,
    listPrice,
    dealerCost,
    contractPrice,
    appliedQuantityBreak,
    sellingPrice,
    margin: calculateMargin(sellingPrice, cost),
    warnings: warnings.length ? warnings : undefined,
  };
}

export function priceBundle(input: BundlePricingInput, records: PricingRecordSet, contractPrices: Array<ContractPrice | undefined> = []): BundlePricing {
  const lines = input.items.map((item, index) => priceQuoteLine(item, records, input.context.currencyCode, contractPrices[index]));
  const items: BundlePricingItem[] = lines.map(({ id: _id, sellingPrice: _sellingPrice, margin: _margin, warnings: _warnings, ...item }) => item);
  const sellingPrice = addMoney(lines.map((line) => line.sellingPrice), input.context.currencyCode);
  const dealerCost = addMoney(lines.map((line) => multiplyMoney(line.dealerCost?.cost, line.quantity, input.context.currencyCode)), input.context.currencyCode);
  const listPrice = addMoney(lines.map((line) => multiplyMoney(line.listPrice?.price, line.quantity, input.context.currencyCode)), input.context.currencyCode);
  const warnings = lines.flatMap((line) => line.warnings ?? []);

  return {
    id: input.id,
    label: input.label,
    description: input.description,
    items,
    listPrice,
    sellingPrice,
    dealerCost,
    margin: calculateMargin(sellingPrice, dealerCost),
    source: { ...quoteSource, sourceType: 'promotional-bundle', currencyCode: input.context.currencyCode },
    warnings: warnings.length ? warnings : undefined,
  };
}

export function priceQuote(input: QuotePricingInput, records: PricingRecordSet, contractPrices: Array<ContractPrice | undefined> = []): QuotePricingResult {
  const lines = input.lines.map((line, index) => priceQuoteLine(line, records, input.context.currencyCode, contractPrices[index]));
  const subtotal = addMoney(lines.map((line) => line.sellingPrice), input.context.currencyCode);
  const cost = addMoney(lines.map((line) => multiplyMoney(line.dealerCost?.cost, line.quantity, input.context.currencyCode)), input.context.currencyCode);
  const warnings = lines.flatMap((line) => line.warnings ?? []);

  return {
    quoteId: input.quoteId,
    source: { ...quoteSource, currencyCode: input.context.currencyCode },
    lines,
    subtotal,
    margin: calculateMargin(subtotal, cost),
    warnings: warnings.length ? warnings : undefined,
  };
}


export const bundlePricingContract: PricingCalculationContract<BundlePricingInput, PricingResolution<BundlePricing>> = {
  calculationType: 'promotional-bundle-pricing',
  validateInput(input: unknown): BundlePricingInput {
    return bundlePricingInputSchema.parse(input);
  },
  validateOutput(output: unknown): PricingResolution<BundlePricing> {
    return output as PricingResolution<BundlePricing>;
  },
};

export const quotePricingContract: PricingCalculationContract<QuotePricingInput, PricingResolution<QuotePricingResult>> = {
  calculationType: 'quote-pricing',
  validateInput(input: unknown): QuotePricingInput {
    return quotePricingInputSchema.parse(input);
  },
  validateOutput(output: unknown): PricingResolution<QuotePricingResult> {
    const resolution = output as PricingResolution<QuotePricingResult>;
    if (resolution.data) quotePricingResultSchema.parse(resolution.data);
    return resolution;
  },
};

export function validateBundlePricingOutput(output: PricingResolution<BundlePricing>): PricingResolution<BundlePricing> {
  if (output.data) bundlePricingSchema.parse(output.data);
  return output;
}
