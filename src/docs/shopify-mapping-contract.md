# Shopify Mapping Contract
**TFR Supply Configurator — Sprint 18**

---

## Core Model: One Product / Many Variants

**Navigator Serial Light Bar = one Shopify product with 11 variants.**

Each NVG SKU (e.g. `NVG45Z-NFPA20`) maps to one Shopify variant.
Length (45", 53", 60") is a variant option dimension, not a separate product.

The cart adapter uses:
- One `product_id` GID for all Navigator configurations
- `selectedSku` → `variant_mappings[].sku` exact match → `shopify_variant_id`

---

## CSV Export Limitation

Shopify merchant CSV exports do NOT include Product IDs or Variant IDs (GIDs).
The export provides: SKU, price, handle, option values, images, status.
GIDs must be collected from **Shopify Admin** URL or the **Admin API**.

---

## 1. Product JSON — `shopify` Block

Location: `data/products/{productId}.json` → `.shopify`

```json
"shopify": {
  "product_id": "gid://shopify/Product/1234567890",
  "handle": "navigator-serial-light-bar",
  "cart_eligible": true,
  "storefront_available": true,
  "variant_mappings": [
    { "sku": "NVG45Z-NFPA20",  "shopify_variant_id": "gid://shopify/ProductVariant/111", "price": 4639.00, "option_length": "45\"", "option_color": "Red-White" },
    { "sku": "NVG45Z-NFPA21",  "shopify_variant_id": "gid://shopify/ProductVariant/112", "price": 4249.00, "option_length": "45\"", "option_color": "Red-White" },
    { "sku": "NVG53Z-NFPA20",  "shopify_variant_id": "gid://shopify/ProductVariant/113", "price": 5142.00, "option_length": "53\"", "option_color": "Red-White" }
  ]
}
```

### Field Reference

| Field | Type | Source | Required When | Description |
|-------|------|--------|--------------|-------------|
| `product_id` | `string\|null` | Admin URL | Always | One GID for the entire Navigator product. **Not in CSV export.** |
| `handle` | `string` | CSV / Admin | Always | Single Shopify handle for the Navigator product. |
| `cart_eligible` | `boolean` | Manual | Always | Master switch. `false` disables cart regardless of other fields. |
| `storefront_available` | `boolean` | Manual | Always | `false` until Storefront API access confirmed. |
| `variant_mappings[].sku` | `string` | CSV export ✅ | Per entry | Exact NVG SKU. Must match `selectedSku` from `resolveSkuMatch()`. |
| `variant_mappings[].shopify_variant_id` | `string\|null` | Admin URL | Per entry | One variant GID per SKU. **Not in CSV export.** `null` = cart disabled. |
| `variant_mappings[].price` | `number` | CSV export ✅ | Reference | Display only. |

---

## 2. SKU Resolution → Variant Lookup

```
User selections
  → resolveSkuMatch(skuOptions[])
  → selectedSku  (e.g. "NVG53Z-NFPA21")
  → variant_mappings[].sku === selectedSku
  → shopify_variant_id  (e.g. "gid://shopify/ProductVariant/999")
  → cart line item
```

The cart adapter uses `product_id` for the product and `shopify_variant_id` for the variant.
No per-length routing. No multi-product lookup.

---

## 3. Validation Errors (from `shopifyCartService.getCartReadiness`)

| Condition | `categories` key | UI Message |
|-----------|-----------------|------------|
| `product_id` is null | `productMappingMissing` | "Product mapping missing: shopify.product_id is not set." |
| `cart_eligible` is false | `cartEligibilityDisabled` | "Cart eligibility disabled." |
| `storefront_available` is false | `storefrontUnavailable` | "Storefront unavailable." |
| `variant_mappings` is empty | `variantMappingMissing` | "Variant mapping missing: no variants mapped." |
| Selected SKU has null `shopify_variant_id` | `variantMappingMissing` | Flagged in payload inspector as `⚠ null`. |

---

## 4. Prototype SKUs Removed

`NAV-SLB-*` prototype SKUs never existed in Shopify and are fully removed.

All 11 `variant_mappings[]` entries use real NVG-prefix SKUs from the Shopify export.

---

## 5. Accessory Mappings

Accessories generate separate cart line items. Each requires its own `shopify_variant_id`.

```json
{ "sku": "NAV-CABLE-10", "shopify_variant_id": null }
```

Status: prototype placeholders — real Shopify products not yet matched.

---

## 6. Custom Attributes

Non-SKU configurator steps (vehicle type, mounting, controller) pass as `customAttributes[]`:

```json
[
  { "key": "Vehicle Type",    "value": "Patrol SUV / Truck" },
  { "key": "Mounting Type",   "value": "Permanent Mount" },
  { "key": "_configuratorId", "value": "navigator-configurator" },
  { "key": "_selectedSku",    "value": "NVG53Z-NFPA21" },
  { "key": "_productId",      "value": "navigator" }
]
```

---

## 7. Checkout Flow (Sprint 19)

1. User completes configuration → `selectedSku` resolved
2. `AddToCartPanel` calls `shopifyCartService.addToCart(cartPayload)`
3. Service → `shopifyCartAdapter.addToCart(cartPayload)`
4. Adapter → `base44.functions.invoke('shopifyCart', cartPayload)`
5. Deno backend reads `SHOPIFY_STOREFRONT_ACCESS_TOKEN` from `Deno.env`
6. Backend calls Shopify `cartCreate` with `product_id` + `shopify_variant_id`
7. Returns `checkoutUrl` → UI redirects

---

## 8. Current Mapping Status — Navigator (Sprint 18)

| Field | Status |
|-------|--------|
| Model | ✅ One product / 11 variants |
| `shopify.handle` | ⚠ Placeholder — confirm in Admin |
| `shopify.product_id` | ❌ null — collect one GID from Admin |
| `shopify.cart_eligible` | ❌ false |
| `shopify.storefront_available` | ❌ false |
| `variant_mappings[].sku` (11) | ✅ Real NVG SKUs |
| `variant_mappings[].price` (11) | ✅ From CSV export |
| `variant_mappings[].shopify_variant_id` (11) | ❌ null × 11 — collect from Admin |
| Accessory variant IDs (5) | ❌ Not mapped |
| Backend secrets | ❌ Not set |

**Add to Cart: disabled — correct. All readiness checks failing.**

---

*Sprint 18 — One product / 11 variants. No Shopify API calls. No credentials in source.*