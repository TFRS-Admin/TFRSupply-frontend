import type { BundlePricing, PriceSource, QuotePricingResult } from '@/types';

export interface PricingService {
  resolvePriceSource(contextId: string): Promise<PriceSource | null>;
  priceBundle(bundleId: string): Promise<BundlePricing>;
  priceQuote(quoteId: string): Promise<QuotePricingResult>;
}

export const pricingService: PricingService = {
  async resolvePriceSource(): Promise<PriceSource | null> {
    throw new Error('Not implemented');
  },
  async priceBundle(): Promise<BundlePricing> {
    throw new Error('Not implemented');
  },
  async priceQuote(): Promise<QuotePricingResult> {
    throw new Error('Not implemented');
  },
};
