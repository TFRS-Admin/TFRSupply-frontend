/**
 * lib/validateVariants.mjs
 *
 * Validates the raw Product Variant list fetched from Shopify Admin before
 * any of it is allowed to become an overlay entry. Three distinct rejection
 * categories, each reported separately so a human can fix the right thing:
 *
 *  - malformed GID     — a variant/product GID that doesn't match Shopify's
 *                        real GID shape. Defense in depth: this pipeline
 *                        never treats an unrecognized string as a variant ID.
 *  - duplicate SKU     — the same SKU is attached to more than one distinct
 *                        Shopify Variant GID in this fetch. Shopify allows a
 *                        SKU to be reused across variants; when it happens we
 *                        cannot safely choose a winner, so the whole SKU is
 *                        rejected from this run and reported for cleanup in
 *                        Shopify Admin instead.
 *  - conflicting mapping — the SKU already carries a real Shopify Variant GID
 *                        in the current generated Variant Index, and Shopify
 *                        Admin now reports a *different* GID for that SKU.
 *                        Variant GIDs are permanent identifiers, so a
 *                        disagreement here is surfaced for human review
 *                        rather than silently overwritten.
 *
 * A variant with no SKU at all is not an error — plenty of Shopify variants
 * (bundles, samples, etc.) are never referenced by this catalog — it is
 * simply excluded and counted.
 */

const VARIANT_GID_PATTERN = /^gid:\/\/shopify\/ProductVariant\/\d+$/;
const PRODUCT_GID_PATTERN = /^gid:\/\/shopify\/Product\/\d+$/;

export function isValidVariantGid(value) {
  return typeof value === 'string' && VARIANT_GID_PATTERN.test(value);
}

export function isValidProductGid(value) {
  return typeof value === 'string' && PRODUCT_GID_PATTERN.test(value);
}

/**
 * @param {Array<{ variantGid: string, sku: string|null, productGid: string|null, productHandle: string|null, productTitle: string|null }>} rawVariants
 * @param {{ existingVariantsBySku?: Record<string, { shopifyVariantId?: string|null }> }} [options]
 */
export function validateShopifyVariants(rawVariants, { existingVariantsBySku = {} } = {}) {
  const withoutSku = [];
  const malformed = [];
  const bySku = new Map();
  const seenSkus = new Set();

  for (const raw of rawVariants) {
    if (raw.sku == null || String(raw.sku).trim() === '') {
      withoutSku.push(raw);
      continue;
    }
    const sku = String(raw.sku).trim();
    seenSkus.add(sku);

    if (!isValidVariantGid(raw.variantGid)) {
      malformed.push({ sku, variantGid: raw.variantGid, productGid: raw.productGid, reason: `Not a valid gid://shopify/ProductVariant/<id>: ${JSON.stringify(raw.variantGid)}` });
      continue;
    }
    if (raw.productGid != null && !isValidProductGid(raw.productGid)) {
      malformed.push({ sku, variantGid: raw.variantGid, productGid: raw.productGid, reason: `Not a valid gid://shopify/Product/<id>: ${JSON.stringify(raw.productGid)}` });
      continue;
    }

    if (!bySku.has(sku)) bySku.set(sku, []);
    bySku.get(sku).push({
      sku,
      variantGid: raw.variantGid,
      productGid: raw.productGid ?? null,
      productHandle: raw.productHandle ?? null,
      productTitle: raw.productTitle ?? null,
    });
  }

  const valid = [];
  const duplicates = [];
  const conflicting = [];

  for (const [sku, occurrences] of bySku) {
    const uniqueGids = new Set(occurrences.map((o) => o.variantGid));
    if (uniqueGids.size > 1) {
      duplicates.push({ sku, occurrences });
      continue;
    }

    const occurrence = occurrences[0];
    const existingGid = existingVariantsBySku[sku]?.shopifyVariantId ?? null;
    if (existingGid != null && existingGid !== occurrence.variantGid) {
      conflicting.push({
        sku,
        existingShopifyVariantId: existingGid,
        fetchedShopifyVariantId: occurrence.variantGid,
        productHandle: occurrence.productHandle,
      });
      continue;
    }

    valid.push(occurrence);
  }

  return { valid, duplicates, conflicting, malformed, withoutSku, seenSkus };
}
