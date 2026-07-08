/**
 * Three-tier MSRP discount engine for client-side price display.
 *
 * This is a display-layer utility only — it computes an advertised discount
 * off MSRP for storefront cards. It is intentionally separate from the
 * dealer-contract/margin pricing domain (src/types/pricing.ts,
 * src/services/pricing/*, src/domain/pricing/pricingEngine.ts), which resolves
 * dealer cost, contract pricing, and quote-line pricing and is not wired into
 * any UI route. Tier assignments below are a starting business default and
 * should be revisited once real category economics are supplied.
 */

export type PricingTier = 'standard' | 'select' | 'premium';

export const TIER_DISCOUNT_RATES: Record<PricingTier, number> = {
  standard: 0.15,
  select: 0.25,
  premium: 0.35,
};

const DEFAULT_TIER: PricingTier = 'standard';

// Category slug -> tier. Slugs match src/data/categories/*.json.
const CATEGORY_TIERS: Record<string, PricingTier> = {
  'accessories': 'standard',
  'compartment-lights': 'standard',
  'interior-lighting': 'standard',
  'work-lights': 'standard',

  'beacons': 'select',
  'perimeter-lights': 'select',
  'signal-masters': 'select',
  'sirens-speakers': 'select',

  'light-bars': 'premium',
  'push-bumpers': 'premium',
  'stinger-spike': 'premium',
};

export function getPricingTier(category?: string | null): PricingTier {
  if (!category) return DEFAULT_TIER;
  return CATEGORY_TIERS[category] ?? DEFAULT_TIER;
}

export function getDiscountRate(category?: string | null): number {
  return TIER_DISCOUNT_RATES[getPricingTier(category)];
}

/** Rounds to the nearest cent using standard half-up rounding. */
function toCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function calculateDiscountedPrice(msrp: number, category?: string | null): number {
  if (!Number.isFinite(msrp) || msrp <= 0) return 0;
  const rate = getDiscountRate(category);
  return toCents(msrp * (1 - rate));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export interface DisplayPricing {
  /** Crossed-out reference price, or null when there is nothing to compare against. */
  msrp: number | null;
  /** Price to render as the primary, amber discounted price. */
  displayPrice: number | null;
  hasDiscount: boolean;
  discountRate: number;
  tier: PricingTier;
}

/**
 * Resolves what a product card should display: an MSRP + discounted price
 * when a compareAtPrice is available, otherwise just the plain price.
 *
 * - `compareAtPrice` is treated as MSRP/list price.
 * - `price`, when present and lower than `compareAtPrice`, is used as the
 *   already-known selling price. Otherwise the tier discount is applied to
 *   `compareAtPrice` to derive a display price.
 */
export function getDisplayPricing(
  compareAtPrice?: number | null,
  price?: number | null,
  category?: string | null
): DisplayPricing {
  const tier = getPricingTier(category);
  const discountRate = TIER_DISCOUNT_RATES[tier];

  if (Number.isFinite(compareAtPrice) && (compareAtPrice as number) > 0) {
    const msrp = compareAtPrice as number;
    const hasKnownSellingPrice = Number.isFinite(price) && (price as number) > 0 && (price as number) < msrp;
    const displayPrice = hasKnownSellingPrice ? toCents(price as number) : calculateDiscountedPrice(msrp, category);

    return {
      msrp,
      displayPrice,
      hasDiscount: displayPrice < msrp,
      discountRate,
      tier,
    };
  }

  return {
    msrp: null,
    displayPrice: Number.isFinite(price) && (price as number) > 0 ? toCents(price as number) : null,
    hasDiscount: false,
    discountRate,
    tier,
  };
}
