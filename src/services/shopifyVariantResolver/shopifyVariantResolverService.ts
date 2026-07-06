/**
 * services/shopifyVariantResolver/shopifyVariantResolverService.ts
 *
 * Shopify Variant Resolver — the single place that turns a resolved catalog
 * SKU into a Shopify-compatible variant answer (variant ID, live price,
 * availability, cart-eligibility). This is composition, not a new commerce
 * system: it reuses the existing Shopify-export-backed
 * `commerceLookupService` (the real data source already powering the SKU
 * table) as its synchronous fallback, and prefers the existing Commerce
 * Foundation (`commerceService.getVariantMapping`) once a live adapter is
 * connected — the same "prefer the live engine, fall back to catalog data"
 * pattern `ConfiguratorPricingSummary` already uses for pricing.
 *
 * Framework-independent and pure/async-only: no React, no component state.
 * UI state (filters, accessory toggles, which SKU row is selected) stays in
 * ConfiguratorModule; this module only answers "what does Shopify say about
 * this one SKU right now?"
 */

import { money } from '@/domain/pricing';
import { commerceService } from '@/services/commerce';
import type { CommerceService } from '@/services/commerce';
import { lookupSku } from '@/services/commerceLookupService';
import type { CartLineDraft, CommerceLookupResult, ShopifyVariantResolution, VariantMapping } from '@/types';

export interface ShopifyVariantResolverService {
  /** Synchronous resolution from the existing Shopify-export catalog data. */
  resolveFromCatalog(sku: string): ShopifyVariantResolution;
  /** Live Commerce Foundation lookup. Returns null when no live mapping is ready. */
  resolveLive(sku: string): Promise<ShopifyVariantResolution | null>;
  /** Live mapping when available, otherwise the catalog fallback. */
  resolve(sku: string): Promise<ShopifyVariantResolution>;
}

function toAvailability(available: boolean | null | undefined) {
  if (available === true) return 'available';
  if (available === false) return 'unavailable';
  return 'unknown';
}

/**
 * Resolves a SKU using the existing Shopify-export-backed lookup
 * (`commerceLookupService`) — the same data source the SKU table already
 * reads. Exported standalone so it can run synchronously (no loading flash)
 * wherever a component only needs the catalog-sourced answer.
 */
export function resolveFromCatalog(sku: string): ShopifyVariantResolution {
  const entry = lookupSku(sku);
  const shopifyVariantId = entry.shopifyVariantId ?? null;
  const price = entry.price ?? null;

  return {
    sku,
    shopifyVariantId,
    shopifyProductId: entry.shopifyProductId ?? null,
    price,
    currency: 'USD',
    availability: toAvailability(entry.available),
    status: entry.status,
    canAddToCart: Boolean(shopifyVariantId) && price != null,
    reviewFlag: entry.reviewFlag ?? null,
    source: 'shopify-export',
  };
}

export function createShopifyVariantResolverService(
  commerce: CommerceService = commerceService,
): ShopifyVariantResolverService {
  async function resolveLive(sku: string): Promise<ShopifyVariantResolution | null> {
    const mappingResult = await commerce.getVariantMapping(sku);
    if (mappingResult.status !== 'ready' || !mappingResult.data) return null;

    const mapping = mappingResult.data;
    const shopifyVariantId = mapping.shopifyVariantId ?? null;
    const price = mapping.price?.amount ?? null;

    return {
      sku,
      shopifyVariantId,
      shopifyProductId: mapping.shopifyProductId ?? null,
      price,
      currency: mapping.price?.currencyCode ?? 'USD',
      availability: 'unknown',
      status: shopifyVariantId && price != null ? 'matched' : shopifyVariantId ? 'price_only' : 'unmatched',
      canAddToCart: Boolean(shopifyVariantId) && price != null,
      reviewFlag: null,
      source: 'commerce-foundation',
    };
  }

  async function resolve(sku: string): Promise<ShopifyVariantResolution> {
    const live = await resolveLive(sku);
    return live ?? resolveFromCatalog(sku);
  }

  return { resolveFromCatalog, resolveLive, resolve };
}

export const shopifyVariantResolverService: ShopifyVariantResolverService = createShopifyVariantResolverService();

function toVariantMapping(resolution: ShopifyVariantResolution): VariantMapping {
  return {
    sku: resolution.sku,
    shopifyProductId: resolution.shopifyProductId,
    // resolution.shopifyVariantId is already a full `gid://shopify/ProductVariant/...`
    // string once collected (see docs/architecture/SHOPIFY_VARIANT_GID_OVERLAY.md) —
    // populate both fields so either naming convention downstream resolves it.
    shopifyVariantId: resolution.shopifyVariantId,
    shopifyVariantGid: resolution.shopifyVariantId,
    channel: 'shopify',
    price: resolution.price != null ? money(resolution.price, resolution.currency) : undefined,
  };
}

/**
 * Turns a single SKU into the same CartLineDraft contract
 * `commerceService.prepareCartLine` produces, but sourced from the Shopify
 * Variant Resolver (`resolve()` — live Commerce Foundation mapping when
 * connected, otherwise the Shopify-export catalog fallback) instead of the
 * permanently-unavailable default Commerce Foundation adapter. This is the
 * single place that answers "is this SKU checkout-ready?" for both the
 * configurator's Add to Cart gate (via `canAddToCart`) and the cart/checkout
 * preparation pipeline — so a SKU can never be ready in one and blocked in
 * the other for different reasons.
 *
 * `resolver` defaults to the real singleton (so production callers always
 * read the same resolver the configurator does) but is injectable so tests
 * can prove the ready/blocked branches with a controlled resolution instead
 * of depending on real Shopify Variant GIDs existing in committed catalog data.
 */
export async function resolveCartLineDraft(
  sku: string,
  quantity: number,
  resolver: Pick<ShopifyVariantResolverService, 'resolve'> = shopifyVariantResolverService,
): Promise<CommerceLookupResult<CartLineDraft>> {
  const resolution = await resolver.resolve(sku);

  if (!resolution.canAddToCart) {
    return {
      status: 'pending',
      data: null,
      message: resolution.reviewFlag ?? `Shopify variant is not yet resolved for SKU "${sku}".`,
    };
  }

  return {
    status: 'ready',
    data: { sku, quantity, variantMapping: toVariantMapping(resolution) },
  };
}

/**
 * Drop-in replacement for `commerceService` wherever a caller only ever
 * needs `prepareCartLine` — see `resolveCartLineDraft` above. Exported as an
 * object (rather than a bare function) so it satisfies
 * `Pick<CommerceService, 'prepareCartLine'>` structurally, matching the
 * shape cart/checkout preparation call sites already depend on.
 */
export const shopifyVariantResolverCommerceService: Pick<CommerceService, 'prepareCartLine'> = {
  prepareCartLine: resolveCartLineDraft,
};
