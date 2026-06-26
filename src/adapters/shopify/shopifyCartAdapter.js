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
  const categories = {
    productMappingMissing: false,
    variantMappingMissing: false,
    cartEligibilityDisabled: false,
    storefrontUnavailable: false,
    accessoryMappingMissing: false,
  };

  if (!shopifyMap) {
    categories.productMappingMissing = true;
    reasons.push('Product mapping missing: no shopify block found.');
    return { ready: false, reasons, categories };
  }

  if (!shopifyMap.product_id) {
    categories.productMappingMissing = true;
    reasons.push('Product mapping missing: shopify.product_id is not set.');
  }

  if (!shopifyMap.cart_eligible) {
    categories.cartEligibilityDisabled = true;
    reasons.push('Cart eligibility disabled: shopify.cart_eligible is false.');
  }

  if (!shopifyMap.storefront_available) {
    categories.storefrontUnavailable = true;
    reasons.push('Storefront unavailable: shopify.storefront_available is false.');
  }

  if (!Array.isArray(shopifyMap.variant_mappings) || shopifyMap.variant_mappings.length === 0) {
    categories.variantMappingMissing = true;
    reasons.push('Variant mapping missing: shopify.variant_mappings[] is empty — SKU-to-variant IDs required.');
  }

  return { ready: reasons.length === 0, reasons, categories };
}

/**
 * Builds the structured cart payload that will be sent to the Shopify
 * Storefront API (or its backend proxy) in a future sprint.
 *
 * Payload shape — see docs/shopify-cart-architecture.md for full spec.
 *
 * selectedOptions shape (from service normalisation):
 *   [{ stepId, stepLabel, optionLabel }]
 * accessories shape (from engine getSelectedAccessories):
 *   [{ stepId, stepLabel, optionId, label, priceModifier }]
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
  const variantEntry = (shopifyMap.variant_mappings ?? []).find(m => m.sku === skuPreview);
  const resolvedVariantId = variantEntry?.shopify_variant_id ?? null;

  // Build Shopify-compatible customAttributes from resolved selection labels
  const customAttributes = selectedOptions.map(opt => ({
    key: opt.stepLabel ?? opt.stepId,
    value: opt.optionLabel ?? '',
  }));
  customAttributes.push({ key: '_configuratorId', value: configuratorId ?? '' });
  customAttributes.push({ key: '_skuPreview',     value: skuPreview ?? '' });
  customAttributes.push({ key: '_productId',      value: productId ?? '' });

  // Each selected accessory becomes a separate cart line; variant IDs pending mapping
  const accessoryLines = accessories.map(acc => ({
    optionId: acc.optionId,
    label: acc.label,
    stepLabel: acc.stepLabel,
    quantity: 1,
    shopify_variant_id: null, // null until accessory SKUs are mapped in Sprint 12+
    _mappingNote: 'Accessory mapping missing: no Shopify variant ID for this accessory.',
  }));

  const accessoriesResolved = accessoryLines.length > 0
    ? accessoryLines.every(l => !!l.shopify_variant_id)
    : true; // no accessories selected = trivially resolved

  return {
    _meta: {
      generatedAt: new Date().toISOString(),
      sprint: 'Sprint 11 — payload QA, no API call made',
      adapterVersion: '0.2.0',
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
      accessoriesResolved,
      unresolved: [
        ...(!resolvedVariantId ? [`Primary SKU "${skuPreview}" has no Shopify variant ID mapping.`] : []),
        ...accessoryLines.filter(l => !l.shopify_variant_id).map(l => `Accessory "${l.label}" has no Shopify variant ID mapping.`),
      ],
    },
    checkoutHandoff: {
      method: 'storefront_api_cart_create',
      proxyEndpoint: '/api/shopify/cart',
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