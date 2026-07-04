/**
 * Pure "save for later" selection rules, pulled out of SavedProductsContext so
 * save/unsave/dedupe behavior can be unit tested without simulating user
 * interaction through server-rendered HTML, mirroring compareSelection.ts and
 * recentlyViewed.ts.
 */
export function saveProduct(current: string[], productId: string): string[] {
  if (!productId || current.includes(productId)) return current;
  return [productId, ...current];
}

export function unsaveProduct(current: string[], productId: string): string[] {
  return current.filter((id) => id !== productId);
}

export function isProductSaved(current: string[], productId: string): boolean {
  return current.includes(productId);
}
