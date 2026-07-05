/**
 * lib/matchVariants.mjs
 *
 * Matches validated Shopify Admin variants onto the generated Variant Index
 * (src/data/shopify/shopify-variant-index.json) by SKU — the same join key
 * `commerceLookupService` already uses. Only a SKU present in both becomes
 * an overlay entry; everything else is reported so it can be investigated,
 * never silently dropped.
 */

/**
 * @param {Array<{ sku: string, variantGid: string, productGid: string|null, productHandle: string|null, productTitle: string|null }>} validVariants
 * @param {Record<string, unknown>} indexVariantsBySku - the `variants` map from shopify-variant-index.json
 * @param {{ seenSkus?: Set<string> }} [options] - `seenSkus` is every SKU Shopify returned in this fetch,
 *   regardless of validation outcome (see `validateShopifyVariants`). Passing it keeps a SKU that was
 *   rejected as malformed/duplicate/conflicting from also being reported as "missing from Shopify" — it
 *   isn't missing, it was rejected for a different, already-reported reason. Defaults to deriving the set
 *   from `validVariants` alone when omitted.
 */
export function matchVariantsToIndex(validVariants, indexVariantsBySku = {}, { seenSkus } = {}) {
  const shopifySkus = seenSkus ?? new Set(validVariants.map((v) => v.sku));

  const matched = validVariants.filter((v) => Object.prototype.hasOwnProperty.call(indexVariantsBySku, v.sku));
  const unmatchedShopifySkus = validVariants.filter((v) => !Object.prototype.hasOwnProperty.call(indexVariantsBySku, v.sku)).map((v) => v.sku);
  const missingFromShopify = Object.keys(indexVariantsBySku).filter((sku) => !shopifySkus.has(sku));

  return { matched, unmatchedShopifySkus, missingFromShopify };
}
