import type { BundlePricing, BundlePricingInput, PricingCalculationContract, PricingResolution, QuotePricingInput, QuotePricingResult } from '@/types';
import { bundlePricingInputSchema, bundlePricingSchema, quotePricingInputSchema, quotePricingResultSchema } from '@/schemas/pricing.schema';

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
