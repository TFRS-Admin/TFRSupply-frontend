export const MAX_COMPARE_PRODUCTS = 4;

/**
 * Pure product-comparison selection rules, pulled out of CompareContext so
 * add/remove/limit behavior can be unit tested without simulating user
 * interaction through server-rendered HTML (React context state changes are
 * not observable via renderToString).
 */
export function addProductToCompare(current: string[], productId: string): string[] {
  if (!productId || current.includes(productId) || current.length >= MAX_COMPARE_PRODUCTS) return current;
  return [...current, productId];
}

export function removeProductFromCompare(current: string[], productId: string): string[] {
  return current.filter((id) => id !== productId);
}

export function isProductInCompare(current: string[], productId: string): boolean {
  return current.includes(productId);
}

export function isCompareFull(current: string[]): boolean {
  return current.length >= MAX_COMPARE_PRODUCTS;
}
