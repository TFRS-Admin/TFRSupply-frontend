/**
 * commerceLookupService.js
 *
 * Given one or more SKUs, returns Shopify-matched commerce data
 * sourced exclusively from the product JSON variant_mappings.
 *
 * No hardcoded prices. No external API calls.
 * Data source: src/data/products/*.json → shopify.variant_mappings
 *
 * Output per SKU:
 * {
 *   sku: string,
 *   shopifyVariantId: string | null,
 *   shopifyProductId: string | null,
 *   price: number | null,
 *   available: boolean | null,
 *   status: "matched" | "unmatched",
 *   reviewFlag: string | null
 * }
 */

// Eager-load all product JSONs so we can search variant_mappings without
// knowing the product ID upfront.
const productModules = import.meta.glob('../data/products/*.json', { eager: true });

// Build a flat map: SKU → { variantId, productId, price, ... }
function buildSkuIndex() {
  const index = {};
  for (const mod of Object.values(productModules)) {
    const product = mod?.default ?? mod;
    const productId = product?.shopify?.product_id ?? null;
    const mappings = product?.shopify?.variant_mappings ?? [];
    for (const variant of mappings) {
      if (!variant.sku) continue;
      index[variant.sku] = {
        shopifyVariantId: variant.shopify_variant_id ?? null,
        shopifyProductId: productId,
        price: variant.price ?? null,
        available: variant.available ?? null,
      };
    }
  }
  return index;
}

// Singleton index — built once per session
let _skuIndex = null;
function getSkuIndex() {
  if (!_skuIndex) _skuIndex = buildSkuIndex();
  return _skuIndex;
}

/**
 * Look up a single SKU.
 * @param {string} sku
 * @returns {{ sku, shopifyVariantId, shopifyProductId, price, available, status, reviewFlag }}
 */
export function lookupSku(sku) {
  const index = getSkuIndex();
  const entry = index[sku];

  if (!entry) {
    return {
      sku,
      shopifyVariantId: null,
      shopifyProductId: null,
      price: null,
      available: null,
      status: 'unmatched',
      reviewFlag: `SKU ${sku} not found in any product variant_mappings`,
    };
  }

  const isMatched =
    entry.shopifyVariantId != null &&
    entry.price != null;

  return {
    sku,
    shopifyVariantId: entry.shopifyVariantId,
    shopifyProductId: entry.shopifyProductId,
    price: entry.price,
    available: entry.available,
    status: isMatched ? 'matched' : 'unmatched',
    reviewFlag: isMatched
      ? null
      : `SKU ${sku} missing ${[
          entry.shopifyVariantId == null && 'shopify_variant_id',
          entry.price == null && 'price',
        ].filter(Boolean).join(', ')} in product JSON`,
  };
}

/**
 * Look up multiple SKUs in one call.
 * @param {string[]} skus
 * @returns {Object.<string, ReturnType<lookupSku>>}  keyed by SKU
 */
export function lookupSkus(skus) {
  return Object.fromEntries(skus.map(sku => [sku, lookupSku(sku)]));
}