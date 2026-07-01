import type { BundlePricing, BundlePricingInput, ContractPrice, DealerCost, ListPrice, PricingContext, PricingResolution, PricingSubject, QuotePricingInput, QuotePricingResult } from '@/types';

export interface PricingAdapter {
  getListPrice(subject: PricingSubject, context: PricingContext): Promise<PricingResolution<ListPrice>>;
  getDealerCost(subject: PricingSubject, context: PricingContext): Promise<PricingResolution<DealerCost>>;
  getContractPrice(subject: PricingSubject, context: PricingContext): Promise<PricingResolution<ContractPrice>>;
  priceBundle(input: BundlePricingInput): Promise<PricingResolution<BundlePricing>>;
  priceQuote(input: QuotePricingInput): Promise<PricingResolution<QuotePricingResult>>;
}

export const unavailablePricingAdapter: PricingAdapter = {
  async getListPrice() {
    return { status: 'pending', data: null, message: 'Live MSRP pricing is not connected.' };
  },
  async getDealerCost() {
    return { status: 'pending', data: null, message: 'Live dealer cost pricing is not connected.' };
  },
  async getContractPrice() {
    return { status: 'pending', data: null, message: 'Live contract pricing is not connected.' };
  },
  async priceBundle() {
    return { status: 'pending', data: null, message: 'Promotional bundle pricing is not connected.' };
  },
  async priceQuote() {
    return { status: 'pending', data: null, message: 'Quote pricing is intentionally not calculated by this foundation.' };
  },
};
