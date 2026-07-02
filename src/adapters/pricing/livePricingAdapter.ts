import { dealerContractResolutionService } from '@/services/dealerContractResolution';
import { calculateMargin, priceBundle as calculateBundle, priceQuote as calculateQuote, findDealerCost, findListPrice } from '@/domain/pricing';
import { bundlePricingSchema, dealerCostSchema, listPriceSchema, pricingResolutionSchema, quotePricingResultSchema } from '@/schemas/pricing.schema';
import type { BundlePricing, BundlePricingInput, ContractPrice, DealerContract, DealerCost, ListPrice, PricingContext, PricingResolution, PricingSubject, PromotionalBundle, QuotePricingInput, QuotePricingResult } from '@/types';
import type { PricingAdapter } from './pricingAdapter';

export interface LivePricingAdapterRecords {
  listPrices?: ListPrice[];
  dealerCosts?: DealerCost[];
  dealerContracts?: DealerContract[];
  promotionalBundles?: PromotionalBundle[];
}

async function resolveContractPrice(subject: PricingSubject & { quantity?: number }, context: PricingContext, records: LivePricingAdapterRecords): Promise<{ contractPrice?: ContractPrice; promotionalBundle?: PromotionalBundle; warnings: PricingResolution<ContractPrice>['warnings'] }> {
  const result = await dealerContractResolutionService.resolve({
    ...subject,
    quantity: subject.quantity ?? 1,
    context,
    candidateContracts: records.dealerContracts,
    candidateBundles: records.promotionalBundles,
  });
  return { contractPrice: result.contractSelection.contractPrice ?? undefined, promotionalBundle: result.bundleResolution?.bundle ?? undefined, warnings: result.warnings };
}

export function createLivePricingAdapter(records: LivePricingAdapterRecords): PricingAdapter {
  const recordSet = { listPrices: records.listPrices, dealerCosts: records.dealerCosts };

  return {
    async getListPrice(subject, context) {
      const data = findListPrice(recordSet, { ...subject, quantity: 1 });
      return pricingResolutionSchema(listPriceSchema).parse(data ? { status: 'priced', data } : { status: 'not-found', data: null, message: `No list price found for SKU ${subject.sku} in ${context.currencyCode}.` });
    },
    async getDealerCost(subject, context) {
      const data = findDealerCost(recordSet, { ...subject, quantity: 1 });
      return pricingResolutionSchema(dealerCostSchema).parse(data ? { status: 'priced', data } : { status: 'not-found', data: null, message: `No dealer cost found for SKU ${subject.sku} in ${context.currencyCode}.` });
    },
    async getContractPrice(subject, context) {
      const { contractPrice, warnings } = await resolveContractPrice(subject, context, records);
      return contractPrice ? { status: 'priced', data: contractPrice, warnings } : { status: 'not-found', data: null, warnings, message: `No contract price found for SKU ${subject.sku}.` };
    },
    async priceBundle(input: BundlePricingInput): Promise<PricingResolution<BundlePricing>> {
      const resolutions = await Promise.all(input.items.map((item) => resolveContractPrice(item, input.context, records)));
      const data = calculateBundle(input, recordSet, resolutions.map((resolution) => resolution.contractPrice));
      const promotionalBundle = resolutions.find((resolution) => resolution.promotionalBundle)?.promotionalBundle;
      if (promotionalBundle?.sellingPrice) data.sellingPrice = promotionalBundle.sellingPrice;
      if (promotionalBundle?.dealerCost) data.dealerCost = promotionalBundle.dealerCost;
      if (promotionalBundle?.source) data.source = promotionalBundle.source;
      if (data.sellingPrice && data.dealerCost) {
        data.margin = calculateMargin(data.sellingPrice, data.dealerCost);
      }
      const warnings = [...resolutions.flatMap((resolution) => resolution.warnings ?? []), ...(data.warnings ?? [])];
      return pricingResolutionSchema(bundlePricingSchema).parse({ status: 'priced', data: { ...data, warnings: warnings.length ? warnings : undefined }, warnings: warnings.length ? warnings : undefined });
    },
    async priceQuote(input: QuotePricingInput): Promise<PricingResolution<QuotePricingResult>> {
      const resolutions = await Promise.all(input.lines.map((line) => resolveContractPrice(line, input.context, records)));
      const data = calculateQuote(input, recordSet, resolutions.map((resolution) => resolution.contractPrice));
      const warnings = [...resolutions.flatMap((resolution) => resolution.warnings ?? []), ...(data.warnings ?? [])];
      return pricingResolutionSchema(quotePricingResultSchema).parse({ status: 'priced', data: { ...data, warnings: warnings.length ? warnings : undefined }, warnings: warnings.length ? warnings : undefined });
    },
  };
}
