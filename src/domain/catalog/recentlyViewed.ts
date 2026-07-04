export const MAX_RECENTLY_VIEWED_PRODUCTS = 8;

/**
 * Pure recently-viewed tracking rules, pulled out of RecentlyViewedContext so
 * dedupe/ordering/limit behavior can be unit tested without simulating
 * navigation through server-rendered HTML, mirroring compareSelection.ts.
 */
export function trackRecentlyViewedProduct(current: string[], productId: string): string[] {
  if (!productId) return current;
  const deduped = current.filter((id) => id !== productId);
  return [productId, ...deduped].slice(0, MAX_RECENTLY_VIEWED_PRODUCTS);
}
