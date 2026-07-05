/**
 * lib/buildVariantIndex.mjs
 *
 * Combines the parsed products/variants model with the media export into
 * enriched catalog entries, then projects those entries into the exact
 * runtime shape `commerceLookupService` / `shopifyVariantResolverService`
 * already read (see src/data/shopify/shopify-variant-index.json).
 *
 * Shopify Variant GIDs are never fabricated here (the CSV export does not
 * contain them). Regenerating the index from a fresh CSV must not destroy
 * any real GIDs a human already collected from Shopify Admin — see
 * `projectRuntimeIndex`, which merges forward from the previous index file
 * and/or an explicit `--gid-overlay` file.
 */

import { existsSync, readFileSync } from 'node:fs';
import { findMediaMatch } from './parseMediaExport.mjs';

const GID_PATTERN = {
  shopifyVariantId: /^gid:\/\/shopify\/ProductVariant\/\d+$/,
  shopifyProductId: /^gid:\/\/shopify\/Product\/\d+$/,
};

/**
 * Whether a variant can actually be added to cart right now, independent of
 * whether we have a Shopify Variant GID for it yet. Every row in this
 * dataset uses inventory policy "continue" (oversell allowed), so a naive
 * `inventoryQty > 0` check would incorrectly mark every variant unavailable
 * — Shopify's own storefront would still sell it.
 */
export function computeAvailability({ status, tracker, policy, qty }) {
  if (status !== 'active') return false;
  const isTracked = Boolean(tracker);
  if (!isTracked) return true;
  if (policy === 'continue') return true;
  if (qty == null) return null;
  return qty > 0;
}

/**
 * Image precedence: an explicit `Variant Image` is Shopify's own
 * variant-to-photo assignment and wins outright. Absent that, the product's
 * first gallery image (Image Position 1) is what a live Shopify storefront
 * actually shows for a variant with no dedicated photo. This deliberately
 * replaces the previous ad hoc behavior of using "whatever Image Src
 * happened to share a CSV row with this variant" — that was a same-row
 * coincidence, not a real Shopify image assignment.
 */
export function resolveVariantImage(variant, product) {
  if (variant.variantImage) return { image: variant.variantImage, imageSource: 'variant-image' };
  const primary = product.images.find((img) => img.position === 1) ?? product.images[0];
  if (primary) return { image: primary.src, imageSource: 'product-primary-image' };
  return { image: null, imageSource: 'none' };
}

/**
 * @returns {{ entries: object[], duplicates: object[] }}
 */
export function buildCatalogEntries({ products, variants, mediaIndex }) {
  const bySku = new Map();
  const duplicates = new Map();

  for (const variant of variants) {
    if (bySku.has(variant.sku)) {
      if (!duplicates.has(variant.sku)) duplicates.set(variant.sku, [bySku.get(variant.sku).__occurrence]);
      duplicates.get(variant.sku).push({ handle: variant.handle, rowNumber: variant.rowNumber, price: variant.price });
      continue;
    }

    const product = products.get(variant.handle);
    const { image, imageSource } = resolveVariantImage(variant, product);
    const mediaMatch = findMediaMatch(mediaIndex, image);

    const entry = {
      sku: variant.sku,
      shopifyVariantId: null,
      shopifyProductId: null,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      available: computeAvailability({
        status: product.status,
        tracker: variant.inventoryTracker,
        policy: variant.inventoryPolicy,
        qty: variant.inventoryQty,
      }),
      inventoryQty: variant.inventoryQty,
      productHandle: variant.handle,
      productTitle: product.title || null,
      vendor: product.vendor || null,
      productType: product.productType || null,
      tags: product.tags,
      image,
      imageSource,
      imageVerifiedInMediaExport: Boolean(mediaMatch),
      exportStatus: product.status ?? null,
      rowNumber: variant.rowNumber,
      __occurrence: { handle: variant.handle, rowNumber: variant.rowNumber, price: variant.price },
    };
    bySku.set(variant.sku, entry);
  }

  const entries = [...bySku.values()].map(({ __occurrence: _drop, ...entry }) => entry);
  const duplicateList = [...duplicates.entries()].map(([sku, occurrences]) => ({
    sku,
    canonicalHandle: bySku.get(sku).productHandle,
    occurrences,
  }));

  return { entries, duplicates: duplicateList };
}

function isValidGid(kind, value) {
  return typeof value === 'string' && GID_PATTERN[kind].test(value);
}

/**
 * Reads sku -> { shopifyVariantId, shopifyProductId } pairs out of an
 * existing runtime index file, so re-ingesting a fresh CSV export doesn't
 * wipe GIDs a human already collected from Shopify Admin.
 */
function extractExistingGids(indexPath) {
  const gids = new Map();
  if (!indexPath || !existsSync(indexPath)) return gids;

  const existing = JSON.parse(readFileSync(indexPath, 'utf8'));
  for (const [sku, entry] of Object.entries(existing.variants ?? {})) {
    if (isValidGid('shopifyVariantId', entry.shopifyVariantId)) {
      gids.set(sku, {
        shopifyVariantId: entry.shopifyVariantId,
        shopifyProductId: isValidGid('shopifyProductId', entry.shopifyProductId) ? entry.shopifyProductId : null,
      });
    }
  }
  return gids;
}

/**
 * Validates a `--gid-overlay` JSON file: `{ "<sku>": { "shopifyVariantId": "gid://shopify/ProductVariant/123", "shopifyProductId": "gid://shopify/Product/456" } }`.
 * Anything that doesn't look like a real Shopify GID is rejected rather than applied — this pipeline never invents GIDs.
 */
function readGidOverlay(overlayPath) {
  if (!overlayPath) return { gids: new Map(), rejected: [] };
  const raw = JSON.parse(readFileSync(overlayPath, 'utf8'));
  const gids = new Map();
  const rejected = [];

  for (const [sku, value] of Object.entries(raw)) {
    const shopifyVariantId = value?.shopifyVariantId ?? null;
    const shopifyProductId = value?.shopifyProductId ?? null;
    if (!isValidGid('shopifyVariantId', shopifyVariantId)) {
      rejected.push({ sku, reason: `shopifyVariantId is not a valid gid://shopify/ProductVariant/<id>: ${JSON.stringify(shopifyVariantId)}` });
      continue;
    }
    if (shopifyProductId !== null && !isValidGid('shopifyProductId', shopifyProductId)) {
      rejected.push({ sku, reason: `shopifyProductId is not a valid gid://shopify/Product/<id>: ${JSON.stringify(shopifyProductId)}` });
      continue;
    }
    gids.set(sku, { shopifyVariantId, shopifyProductId });
  }

  return { gids, rejected };
}

/**
 * Projects enriched catalog entries into the runtime index document shape
 * consumed by commerceLookupService, merging forward any real GIDs already
 * on record.
 *
 * @param {object[]} entries
 * @param {{ sourceLabel: string, generatedDate: string, existingIndexPath?: string, gidOverlayPath?: string }} options
 */
export function projectRuntimeIndex(entries, options) {
  const existingGids = extractExistingGids(options.existingIndexPath);
  const { gids: overlayGids, rejected: rejectedOverlayEntries } = readGidOverlay(options.gidOverlayPath);

  let preservedFromExisting = 0;
  let appliedFromOverlay = 0;

  const variantsMap = {};
  for (const entry of entries) {
    const overlay = overlayGids.get(entry.sku);
    const existing = existingGids.get(entry.sku);
    const gids = overlay ?? existing ?? null;
    if (gids && overlay) appliedFromOverlay++;
    else if (gids && existing) preservedFromExisting++;

    variantsMap[entry.sku] = {
      sku: entry.sku,
      shopifyVariantId: gids?.shopifyVariantId ?? null,
      shopifyProductId: gids?.shopifyProductId ?? null,
      price: entry.price,
      available: entry.available,
      inventoryQty: entry.inventoryQty,
      productHandle: entry.productHandle,
      productTitle: entry.productTitle,
      image: entry.image,
      exportStatus: entry.exportStatus,
    };
  }

  const indexDocument = {
    _source: options.sourceLabel,
    _note: 'Auto-generated by scripts/shopify-catalog-ingest/ingest.mjs. shopifyVariantId/shopifyProductId are null unless collected from Shopify Admin/API and preserved across re-ingestion or supplied via --gid-overlay — see docs/architecture/SHOPIFY_CATALOG_CSV_INGESTION.md. Do not hand-edit; regenerate from a fresh export instead.',
    _generated: options.generatedDate,
    _totalVariants: entries.length,
    variants: variantsMap,
  };

  return {
    indexDocument,
    gidStats: { preservedFromExisting, appliedFromOverlay, rejectedOverlayEntries },
  };
}
