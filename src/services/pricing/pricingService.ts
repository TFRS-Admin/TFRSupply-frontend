import { unavailablePricingAdapter } from '@/adapters/pricing';
import type { PricingAdapter } from '@/adapters/pricing';
import { bundlePricingInputSchema, pricingContextSchema, pricingSubjectSchema, quotePricingInputSchema } from '@/schemas/pricing.schema';
import type { BundlePricing, BundlePricingInput, ContractPrice, DealerCost, ListPrice, PricingContext, PricingResolution, PricingSubject, QuotePricingInput, QuotePricingResult } from '@/types';

export interface PricingService {
  getListPrice(subject: PricingSubject, context: PricingContext): Promise<PricingResolution<ListPrice>>;
  getDealerCost(subject: PricingSubject, context: PricingContext): Promise<PricingResolution<DealerCost>>;
  getContractPrice(subject: PricingSubject, context: PricingContext): Promise<PricingResolution<ContractPrice>>;
  priceBundle(input: BundlePricingInput): Promise<PricingResolution<BundlePricing>>;
  priceQuote(input: QuotePricingInput): Promise<PricingResolution<QuotePricingResult>>;
}

export function createPricingService(adapter: PricingAdapter = unavailablePricingAdapter): PricingService {
  return {
    getListPrice(subject, context) {
      return adapter.getListPrice(pricingSubjectSchema.parse(subject), pricingContextSchema.parse(context));
    },
    getDealerCost(subject, context) {
      return adapter.getDealerCost(pricingSubjectSchema.parse(subject), pricingContextSchema.parse(context));
    },
    getContractPrice(subject, context) {
      return adapter.getContractPrice(pricingSubjectSchema.parse(subject), pricingContextSchema.parse(context));
    },
    priceBundle(input) {
      return adapter.priceBundle(bundlePricingInputSchema.parse(input));
    },
    priceQuote(input) {
      return adapter.priceQuote(quotePricingInputSchema.parse(input));
    },
  };
}

export const pricingService: PricingService = createPricingService();
