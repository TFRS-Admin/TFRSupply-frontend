import type { QuantityBreak, QuantityBreakSelection } from '@/types';

export function selectQuantityBreak(breaks: QuantityBreak[] | undefined, quantity: number): QuantityBreakSelection {
  const eligibleBreaks = (breaks ?? [])
    .filter((quantityBreak) => quantity >= quantityBreak.minQuantity && (quantityBreak.maxQuantity == null || quantity <= quantityBreak.maxQuantity))
    .sort((a, b) => b.minQuantity - a.minQuantity);

  return {
    quantity,
    applied: eligibleBreaks[0] ?? null,
    eligibleBreaks,
  };
}
