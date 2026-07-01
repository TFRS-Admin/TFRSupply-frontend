import type { PricingContext, PricingSubject, PromotionalBundle, PromotionalBundleResolution } from '@/types';
import { evaluateContractWindow, isContractWindowEligible } from './contractWindowEvaluator';

function includesSubject(bundle: PromotionalBundle, subject: PricingSubject): boolean {
  return bundle.items.some(
    (item) => item.sku === subject.sku && (!subject.productId || !item.productId || item.productId === subject.productId),
  );
}

export function resolvePromotionalBundle(
  candidates: PromotionalBundle[] | undefined,
  subject: PricingSubject,
  context: PricingContext,
): PromotionalBundleResolution {
  if (!candidates || candidates.length === 0) {
    return { status: 'no-match', bundle: null, reason: 'No candidate promotional bundles were provided.' };
  }

  const relevant = candidates.filter((bundle) => includesSubject(bundle, subject));
  if (relevant.length === 0) {
    return { status: 'no-match', bundle: null, reason: `No promotional bundle includes SKU ${subject.sku}.` };
  }

  const promotionCodes = context.promotionCodes ?? [];
  const eligibleForPromotionCode = relevant.filter(
    (bundle) => !bundle.promotionCode || promotionCodes.includes(bundle.promotionCode),
  );

  if (eligibleForPromotionCode.length === 0) {
    return { status: 'not-eligible', bundle: null, reason: 'Candidate promotional bundles require a promotion code that was not provided.' };
  }

  for (const bundle of eligibleForPromotionCode) {
    if (!bundle.window) {
      return { status: 'resolved', bundle };
    }

    const windowEvaluation = evaluateContractWindow(bundle.window, context.pricingDate);
    if (isContractWindowEligible(windowEvaluation)) {
      return { status: 'resolved', bundle, windowEvaluation };
    }
  }

  const expiredBundle = eligibleForPromotionCode[0];
  const windowEvaluation = expiredBundle.window ? evaluateContractWindow(expiredBundle.window, context.pricingDate) : undefined;
  return {
    status: 'expired',
    bundle: null,
    windowEvaluation,
    reason: `Promotional bundle ${expiredBundle.id} is not active for ${context.pricingDate}.`,
  };
}
