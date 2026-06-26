/**
 * services/shopifyMappingService.js
 * Sprint 9 — Read-only Shopify mapping readiness validation.
 *
 * NO Shopify API calls are made here.
 * NO secrets are used.
 * This service inspects local JSON data only and reports what is missing
 * before real Shopify cart integration can be wired.
 */

/**
 * Validate a product JSON's Shopify mapping fields.
 * @param {object} productData — raw product JSON (e.g. from loadProduct())
 * @returns {{ ready: boolean, checks: Check[], missing: string[] }}
 */
export function validateProductMapping(productData) {
  const s = productData?.shopify || {};
  const checks = [
    {
      key: 'shopify_product_id',
      label: 'Shopify Product ID',
      pass: !!(s.product_id),
      note: s.product_id ? `ID: ${s.product_id}` : 'null — not yet linked to a Shopify product',
    },
    {
      key: 'shopify_handle',
      label: 'Shopify Handle / Slug',
      pass: !!(s.handle),
      note: s.handle || 'missing',
    },
    {
      key: 'variant_mappings',
      label: 'Variant Mappings Array',
      pass: Array.isArray(s.variant_mappings),
      note: Array.isArray(s.variant_mappings)
        ? s.variant_mappings.length > 0
          ? `${s.variant_mappings.length} mapping(s) defined`
          : 'array present but empty (placeholder only)'
        : 'missing',
    },
    {
      key: 'cart_eligible',
      label: 'Cart Eligible Flag',
      pass: s.cart_eligible === true,
      note: s.cart_eligible === true ? 'true' : 'false — Shopify cart not yet enabled for this product',
    },
    {
      key: 'storefront_available',
      label: 'Storefront Available Flag',
      pass: s.storefront_available === true,
      note: s.storefront_available === true ? 'true' : 'false',
    },
    {
      key: 'sku_root',
      label: 'SKU Root (commerce.sku_root)',
      pass: !!(productData?.commerce?.sku_root),
      note: productData?.commerce?.sku_root || 'missing',
    },
  ];

  const missing = checks.filter(c => !c.pass).map(c => c.label);
  return { ready: missing.length === 0, checks, missing };
}

/**
 * Validate a configurator JSON's Shopify mapping fields.
 * @param {object} configuratorData — raw configurator JSON
 * @returns {{ ready: boolean, checks: Check[], missing: string[] }}
 */
export function validateConfiguratorMapping(configuratorData) {
  const sm = configuratorData?.shopifyMapping || {};
  const checks = [
    {
      key: 'shopify_mapping_block',
      label: 'shopifyMapping Block',
      pass: !!configuratorData?.shopifyMapping,
      note: configuratorData?.shopifyMapping ? 'block present (placeholder)' : 'missing entirely',
    },
    {
      key: 'store_handle',
      label: 'shopifyMapping.storeHandle',
      pass: !!(sm.storeHandle),
      note: sm.storeHandle || 'null — not yet mapped to a Shopify store handle',
    },
    {
      key: 'variant_map',
      label: 'shopifyMapping.variantMap',
      pass: Array.isArray(sm.variantMap),
      note: Array.isArray(sm.variantMap)
        ? sm.variantMap.length > 0
          ? `${sm.variantMap.length} entry/entries`
          : 'array present but empty (placeholder only)'
        : 'missing',
    },
    {
      key: 'sku_options',
      label: 'SKU Options List (skuOptions)',
      pass: Array.isArray(configuratorData?.skuOptions) && configuratorData.skuOptions.length > 0,
      note: Array.isArray(configuratorData?.skuOptions) && configuratorData.skuOptions.length > 0
        ? `${configuratorData.skuOptions.length} existing SKUs defined`
        : 'missing — add skuOptions[] array of existing catalog SKUs',
    },
    {
      key: 'sku_root',
      label: 'SKU Root (skuRoot)',
      pass: !!(configuratorData?.skuRoot),
      note: configuratorData?.skuRoot || 'missing',
    },
  ];

  const missing = checks.filter(c => !c.pass).map(c => c.label);
  return { ready: missing.length === 0, checks, missing };
}

/**
 * Combined readiness summary for a product + its configurator.
 */
export function getShopifyReadiness(productData, configuratorData) {
  const product = validateProductMapping(productData);
  const configurator = validateConfiguratorMapping(configuratorData);
  const overallReady = product.ready && configurator.ready;
  return { overallReady, product, configurator };
}