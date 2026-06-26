/**
 * services/shopifyMappingService.js
 * Read-only Shopify mapping readiness validation.
 *
 * NO Shopify API calls are made here.
 * NO secrets are used.
 * Inspects local JSON only.
 *
 * Sprint 18: Navigator is ONE Shopify product with 11 variants.
 * Removed multi-handle (per-length product) logic.
 * Added variant GID coverage check.
 */

/**
 * Validate a product JSON's Shopify mapping fields.
 */
export function validateProductMapping(productData) {
  const s = productData?.shopify || {};
  const variantMappings = Array.isArray(s.variant_mappings) ? s.variant_mappings : [];
  const mappedCount = variantMappings.filter(m => !!m.shopify_variant_id).length;
  const totalCount = variantMappings.length;

  const checks = [
    {
      key: 'shopify_product_id',
      label: 'Shopify Product ID',
      pass: !!(s.product_id),
      note: s.product_id
        ? `GID: ${s.product_id}`
        : 'null — collect one product GID from Shopify Admin URL',
    },
    {
      key: 'shopify_handle',
      label: 'Shopify Handle',
      pass: !!(s.handle),
      note: s.handle || 'missing — confirm handle in Shopify Admin',
    },
    {
      key: 'variant_mappings_present',
      label: 'Variant Mappings Defined',
      pass: totalCount > 0,
      note: totalCount > 0
        ? `${totalCount} variant mapping(s) defined`
        : 'array empty — add one entry per NVG SKU',
    },
    {
      key: 'variant_gids_filled',
      label: `Variant GIDs Filled (${mappedCount}/${totalCount})`,
      pass: totalCount > 0 && mappedCount === totalCount,
      note: mappedCount === totalCount
        ? 'all variant GIDs collected'
        : `${totalCount - mappedCount} of ${totalCount} variant GIDs still null — collect from Shopify Admin`,
    },
    {
      key: 'cart_eligible',
      label: 'Cart Eligible Flag',
      pass: s.cart_eligible === true,
      note: s.cart_eligible === true
        ? 'true'
        : 'false — set true after all GIDs are collected',
    },
    {
      key: 'storefront_available',
      label: 'Storefront Available Flag',
      pass: s.storefront_available === true,
      note: s.storefront_available === true
        ? 'true'
        : 'false — set true after Storefront API access confirmed',
    },
    {
      key: 'sku_root',
      label: 'SKU Root (commerce.sku_root)',
      pass: !!(productData?.commerce?.sku_root),
      note: productData?.commerce?.sku_root || 'missing',
    },
  ];

  const missing = checks.filter(c => !c.pass).map(c => c.label);
  return { ready: missing.length === 0, checks, missing, mappedCount, totalCount };
}

/**
 * Validate a configurator JSON's Shopify mapping fields.
 */
export function validateConfiguratorMapping(configuratorData) {
  const sm = configuratorData?.shopifyMapping || {};
  const skuOptions = Array.isArray(configuratorData?.skuOptions) ? configuratorData.skuOptions : [];

  const checks = [
    {
      key: 'shopify_mapping_block',
      label: 'shopifyMapping Block',
      pass: !!configuratorData?.shopifyMapping,
      note: configuratorData?.shopifyMapping ? 'block present' : 'missing entirely',
    },
    {
      key: 'store_handle',
      label: 'shopifyMapping.storeHandle',
      pass: !!(sm.storeHandle),
      note: sm.storeHandle || 'null — collect from Shopify Admin → Settings → Domains',
    },
    {
      key: 'sku_options',
      label: 'SKU Options List (skuOptions)',
      pass: skuOptions.length > 0,
      note: skuOptions.length > 0
        ? `${skuOptions.length} real NVG SKUs defined`
        : 'missing — add skuOptions[] with real catalog SKUs',
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