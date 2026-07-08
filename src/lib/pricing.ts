/**
 * TFRSupply pricing utility.
 * Calculates display price from MSRP using the three-tier discount model.
 */

export type PricingTier = 'hero' | 'standard' | 'specialized';

const TIER_1_FAMILIES = ['PATHFINDER', 'RUMBLER', 'ES100', 'DYNAMAX', 'PA4000'];
const TIER_3_FAMILIES = ['VALOR', 'LEGEND', 'NAVIGATOR', 'INTEGRITY', 'ALLEGIANT', 'STINGER'];

const TIER_DISCOUNTS: Record<PricingTier, number> = {
  hero: 0.40,
  standard: 0.27,
  specialized: 0.17,
};

export function getPricingTier(family: string): PricingTier {
  const f = (family ?? '').toUpperCase();
  if (TIER_1_FAMILIES.some(t => f.includes(t))) return 'hero';
  if (TIER_3_FAMILIES.some(t => f.includes(t))) return 'specialized';
  return 'standard';
}

export function calcDisplayPrice(msrp: number, family: string): { price: number; compareAtPrice: number; discountPct: number } {
  const tier = getPricingTier(family);
  const discount = TIER_DISCOUNTS[tier];
  const price = Math.round(msrp * (1 - discount) * 100) / 100;
  return { price, compareAtPrice: msrp, discountPct: Math.round(discount * 100) };
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}
