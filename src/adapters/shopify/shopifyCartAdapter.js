/**
 * adapters/shopify/shopifyCartAdapter.js
 * Sprint 10 — Shopify Cart Adapter (stub/architecture only)
 *
 * UI MUST NOT import this file directly.
 * All UI access goes through services/shopifyCartService.js.
 *
 * When Sprint 11+ live integration begins:
 *  - Replace the stub addToCart() with a fetch() call to a backend proxy function.
 *  - The proxy holds the Storefront API token server-side (never in browser bundle).
 *  - This adapter file is the ONLY place Shopify API surface is touched.
 *
 * Storefront API endpoint (future):
 *   POST /api/2024-01/graphql.json  (via backend proxy, not direct from browser)
 *
 * Required environment variable (backend proxy only, never frontend):
 *   SHOPIFY_STOREFRONT_ACCESS_TOKEN
 *   SHOPIFY_STORE_DOMAIN  (e.g. tfrsupply.myshopify.com)
 */

/**
 * Validates whether the Shopify product mapping block is populated enough
 * to support cart operations.
 *
 * @param {object} shopifyMap - product JSON's `shopify` block
 * @returns {{ ready: boolean, reasons: string[] }}
 */
export function checkMappingReadiness(shopifyMap) {
  const reasons = [];

  if (!shopifyMap) {
    reasons.push('No Shopify mapping block found on product.');
    return { ready: false, reasons };
  }

  if (!shopifyMap.product_id) {
    reasons.push('shopify.product_id is null — product not linked to Shopify.');
  }

  if (!shopifyMap.handle) {
    reasons.push('shopify.handle is missing.');
  }

  if (!Array.isArray(shopifyMap.variant_mappings) || shopifyMap.variant_mappings.length === 0) {
    reasons.push('shopify.variant_mappings is empty — SKU-to-variant map required.');
  }

  if (!shopifyMap.storefront_available) {
    reasons.push('shopify.storefront_available is false.');
  }

  return { ready: reasons.length === 0, reasons };
}

/**
 * Builds the structured cart payload that will be sent to the Shopify
 * Storefront API (or its backend proxy) in a future sprint.
 *
 * Payload shape — see docs/shopify-cart-architecture.md for full spec.
 *
 * @param {object} params
 * @returns {object} cartPayload
 */
export function buildCartPayload({
  productId,
  configuratorId,
  skuPreview,
  selectedOptions = [],
  accessories = [],
  quantity = 1,
  shopifyMap = {},
}) {
  // Attempt to resolve variantId from sku-to-variant mapping
  const variantEntry = (shopifyMap.variant_mappings ?? []).find(
    m => m.sku === skuPreview
  );
  const resolvedVariantId = variantEntry?.shopify_variant_id ?? null;

  // Build Shopify-compatible customAttributes from selected options
  const customAttributes = selectedOptions.map(opt => ({
    key: opt.stepLabel ?? opt.stepId,
    value: opt.optionLabel ?? opt.optionId,
  }));

  // Append configurator metadata as custom attributes
  customAttributes.push({ key: '_configuratorId', value: configuratorId ?? '' });
  customAttributes.push({ key: '_skuPreview', value: skuPreview ?? '' });
  customAttributes.push({ key: '_productId', value: productId ?? '' });

  // Accessory line items (each accessory becomes a separate cart line in Shopify)
  const accessoryLines = accessories.map(acc => ({
    sku: acc.sku,
    label: acc.label,
    quantity: acc.quantity ?? 1,
    shopify_variant_id: null, // populated when accessory SKUs are mapped in Shopify
  }));

  return {
    _meta: {
      generatedAt: new Date().toISOString(),
      sprint: 'Sprint 10 — stub, no API call made',
      adapterVersion: '0.1.0',
    },
    primaryLine: {
      shopify_product_id: shopifyMap.product_id ?? null,
      shopify_variant_id: resolvedVariantId,
      shopify_handle: shopifyMap.handle ?? null,
      quantity,
      sku: skuPreview,
      customAttributes,
    },
    accessoryLines,
    mappingStatus: {
      variantResolved: !!resolvedVariantId,
      accessoriesResolved: false, // will be true when all accessory SKUs are mapped
    },
    checkoutHandoff: {
      // Future: pass primaryLine + accessoryLines to Storefront API cartCreate mutation
      // via backend proxy. Never call Storefront API from browser.
      method: 'storefront_api_cart_create', // planned
      proxyEndpoint: '/api/shopify/cart',   // future backend function endpoint
      tokenLocation: 'server_env_only',
    },
  };
}

/**
 * STUB — future implementation.
 * Will call backend proxy → Shopify Storefront API cartCreate mutation.
 * Throws intentionally if called before Sprint 11 wiring is complete.
 */
export async function addToCart(cartPayload) {
  throw new Error(
    '[shopifyCartAdapter] addToCart() is not yet implemented. ' +
    'Wire backend proxy in Sprint 11 before calling this function.'
  );
}