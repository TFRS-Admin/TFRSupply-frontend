/**
 * commerceLookupService.ts
 *
 * Resolves SKU → commerce data in this order:
 *   1. src/data/shopify/shopify-variant-index.json  (generated from Shopify CSV export — source of truth)
 *   2. src/data/products/*.json → shopify.variant_mappings  (fallback / manual override)
 *
 * shopifyVariantId is null from the CSV export (Shopify does not include GIDs in product exports).
 * Collect GIDs from Shopify Admin and add them to shopify-variant-index.json when available.
 *
 * status values:
 *   "matched"    — has shopifyVariantId + price
 *   "price_only" — has price from export, no GID yet (most common state pre-GID collection)
 *   "unmatched"  — not found in either source
 */

import shopifyIndexJson from '../data/shopify/shopify-variant-index.json';

export type ShopifyExportLookupStatus = 'matched' | 'price_only' | 'unmatched';
export type CommerceLookupSource = 'shopify_export' | 'product_json' | 'none';

export interface CommerceLookupEntry {
  sku: string;
  shopifyVariantId: string | null;
  shopifyProductId: string | null;
  price: number | null;
  available: boolean | null;
  productHandle: string | null;
  productTitle: string | null;
  image: string | null;
  source: CommerceLookupSource;
  status: ShopifyExportLookupStatus;
  reviewFlag: string | null;
}

interface ShopifyExportVariantEntry {
  sku: string;
  shopifyVariantId: string | null;
  shopifyProductId: string | null;
  price: number | null;
  available: boolean | null;
  productHandle: string | null;
  productTitle: string | null;
  image: string | null;
}

interface ShopifyExportIndex {
  variants: Record<string, ShopifyExportVariantEntry>;
}

interface ProductVariantMapping {
  sku?: string;
  shopify_variant_id?: string | null;
  price?: number | null;
}

interface ProductJsonModule {
  title?: string;
  shopify?: {
    product_id?: string | null;
    handle?: string | null;
    variant_mappings?: ProductVariantMapping[];
  };
}

interface FallbackIndexEntry {
  shopifyVariantId: string | null;
  shopifyProductId: string | null;
  price: number | null;
  available: boolean | null;
  productHandle: string | null;
  productTitle: string | null;
  image: string | null;
}

const shopifyIndex = shopifyIndexJson as unknown as ShopifyExportIndex;

// Fallback: product JSON variant_mappings
const productModules = import.meta.glob('../data/products/*.json', { eager: true }) as Record<string, { default: ProductJsonModule }>;

function buildFallbackIndex(): Record<string, FallbackIndexEntry> {
  const index: Record<string, FallbackIndexEntry> = {};
  for (const mod of Object.values(productModules)) {
    const product = mod.default ?? {};
    const productId = product?.shopify?.product_id ?? null;
    const mappings = product?.shopify?.variant_mappings ?? [];
    for (const variant of mappings) {
      if (!variant.sku) continue;
      index[variant.sku] = {
        shopifyVariantId: variant.shopify_variant_id ?? null,
        shopifyProductId: productId,
        price: variant.price ?? null,
        available: null,
        productHandle: product?.shopify?.handle ?? null,
        productTitle: product?.title ?? null,
        image: null,
      };
    }
  }
  return index;
}

let _fallbackIndex: Record<string, FallbackIndexEntry> | null = null;
function getFallbackIndex(): Record<string, FallbackIndexEntry> {
  if (!_fallbackIndex) _fallbackIndex = buildFallbackIndex();
  return _fallbackIndex;
}

/**
 * Look up a single SKU.
 */
export function lookupSku(sku: string): CommerceLookupEntry {
  // 1. Try Shopify export index
  const exportEntry = shopifyIndex.variants?.[sku];
  if (exportEntry) {
    const hasVariantId = exportEntry.shopifyVariantId != null;
    const hasPrice = exportEntry.price != null;
    return {
      sku,
      shopifyVariantId: exportEntry.shopifyVariantId,
      shopifyProductId: exportEntry.shopifyProductId,
      price: exportEntry.price,
      available: exportEntry.available,
      productHandle: exportEntry.productHandle,
      productTitle: exportEntry.productTitle,
      image: exportEntry.image,
      source: 'shopify_export',
      status: hasVariantId && hasPrice ? 'matched' : hasPrice ? 'price_only' : 'unmatched',
      reviewFlag: hasVariantId ? null : `Shopify variant ID pending — quote only, checkout disabled`,
    };
  }

  // 2. Fallback: product JSON variant_mappings
  const fallback = getFallbackIndex();
  const fbEntry = fallback[sku];
  if (fbEntry) {
    const hasVariantId = fbEntry.shopifyVariantId != null;
    const hasPrice = fbEntry.price != null;
    return {
      sku,
      shopifyVariantId: fbEntry.shopifyVariantId,
      shopifyProductId: fbEntry.shopifyProductId,
      price: fbEntry.price,
      available: fbEntry.available,
      productHandle: fbEntry.productHandle,
      productTitle: fbEntry.productTitle,
      image: fbEntry.image,
      source: 'product_json',
      status: hasVariantId && hasPrice ? 'matched' : hasPrice ? 'price_only' : 'unmatched',
      reviewFlag: hasVariantId && hasPrice ? null : `SKU ${sku} missing ${[!hasVariantId && 'shopifyVariantId', !hasPrice && 'price'].filter(Boolean).join(', ')} in product JSON`,
    };
  }

  // 3. Not found
  return {
    sku,
    shopifyVariantId: null,
    shopifyProductId: null,
    price: null,
    available: null,
    productHandle: null,
    productTitle: null,
    image: null,
    source: 'none',
    status: 'unmatched',
    reviewFlag: `SKU ${sku} not found in Shopify export or product JSON`,
  };
}

/**
 * Look up multiple SKUs. Returns object keyed by SKU.
 */
export function lookupSkus(skus: string[]): Record<string, CommerceLookupEntry> {
  return Object.fromEntries(skus.map(sku => [sku, lookupSku(sku)]));
}
