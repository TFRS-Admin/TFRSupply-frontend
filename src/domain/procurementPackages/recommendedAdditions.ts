import type { QuoteRecommendedAddition } from '@/types/fleetQuote';

/**
 * De-duplicates recommended additions by product id (keeping the first
 * occurrence) and caps the result — the same rule
 * src/domain/fleetQuote/exportPreview.ts's buildExportPreview already applies
 * project-wide, reused here to merge each package's per-build recommended
 * additions (src/domain/fleetQuote/vehicleQuoteSummary.ts's
 * aggregateVehicleQuote) into one package-level list.
 */
export function dedupeRecommendedAdditions(additions: QuoteRecommendedAddition[], limit: number): QuoteRecommendedAddition[] {
  const seenProductIds = new Set<string>();
  const result: QuoteRecommendedAddition[] = [];

  for (const addition of additions) {
    if (result.length >= limit || seenProductIds.has(addition.product.id)) continue;
    seenProductIds.add(addition.product.id);
    result.push(addition);
  }

  return result;
}
