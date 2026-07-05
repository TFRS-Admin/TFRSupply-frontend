/**
 * lib/writeOverlay.mjs
 *
 * Builds the overlay document in exactly the shape
 * scripts/shopify-catalog-ingest/ingest.mjs's `--gid-overlay` flag already
 * reads (see docs/architecture/SHOPIFY_CATALOG_CSV_INGESTION.md):
 *
 *   { "<sku>": { "shopifyVariantId": "gid://shopify/ProductVariant/123", "shopifyProductId": "gid://shopify/Product/456" } }
 *
 * This module only builds the plain-object document; overlay.mjs owns the
 * actual filesystem write (and skips it entirely in --dry-run).
 */

/**
 * @param {Array<{ sku: string, variantGid: string, productGid: string|null }>} matchedVariants
 */
export function buildOverlayDocument(matchedVariants) {
  const overlay = {};
  for (const variant of matchedVariants) {
    overlay[variant.sku] = {
      shopifyVariantId: variant.variantGid,
      shopifyProductId: variant.productGid ?? null,
    };
  }
  return overlay;
}
