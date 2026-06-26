# Shopify Mapping Contract
**TFR Supply Configurator — Sprint 16**

This document defines the required data contract for all Shopify mapping fields.
No field here is optional once `cart_eligible: true` is set on a product.
Any missing field will be caught by `checkMappingReadiness()` and surfaced in the AddToCartPanel UI.

---

## Important: CSV Export Limitation

**Shopify merchant CSV exports do NOT include Product IDs or Variant IDs (GIDs).**

The export provides: SKU, price, handle, option values, images, status.
The export does NOT provide: `gid://shopify/Product/…` or `gid://shopify/ProductVariant/…`.

GIDs must be collected manually from **Shopify Admin** → Products → URL, or via the **Admin API**.

---

## 1. Product JSON — `shopify` Block

Location: `data/products/{productId}.json` → `.shopify`

```json
"shopify": {
  "product_id": null,
  "_product_id_note": "Collect from Shopify Admin URL — NOT in CSV export",
  "handles": {
    "45in": "navigator-light-bar-45",
    "53in": "navigator-light-bar-53",
    "60in": "navigator-light-bar-60"
  },
  "handle": "navigator-light-bar-45",
  "cart_eligible": false,
  "storefront_available": false,
  "variant_mappings": [
    {
      "sku": "NVG45Z-NFPA20",
      "shopify_variant_id": null,
      "shopify_handle": "navigator-light-bar-45",
      "price": 4639.00,
      "_source": "shopify_export",
      "_missing": "shopify_variant_id — collect from Shopify Admin"
    }
  ]
}
```

### Field Reference

| Field | Type | Source | Required When | Description |
|-------|------|--------|--------------|-------------|
| `product_id` | `string\|null` | Admin URL | Always | Shopify GID (`gid://shopify/Product/…`). **Not in CSV export.** |
| `handles` | `object` | CSV export ✅ | Navigator only | Per-length handle map — Navigator is 3 Shopify products. |
| `handle` | `string` | CSV export ✅ | Always | Primary handle for deep-link fallback. |
| `cart_eligible` | `boolean` | Manual | Always | Master switch. `false` disables cart regardless of other fields. |
| `storefront_available` | `boolean` | Manual | Always | Whether Storefront API can query this product. |
| `variant_mappings[].sku` | `string` | CSV export ✅ | Per entry | Must exactly match a `selectedSku` from `resolveSkuMatch()`. |
| `variant_mappings[].shopify_variant_id` | `string\|null` | Admin URL | Per entry | GID. **Not in CSV export.** Null = cart disabled. |
| `variant_mappings[].price` | `number` | CSV export ✅ | Reference | Populated from export. Used for display only. |
| `variant_mappings[].shopify_handle` | `string` | CSV export ✅ | Per entry | Which of the 3 Navigator products this variant belongs to. |

### Validation Errors Raised

| Condition | `categories` key | UI Message |
|-----------|-----------------|------------|
| `product_id` is null | `productMappingMissing` | "Product mapping missing: shopify.product_id is not set." |
| `cart_eligible` is false | `cartEligibilityDisabled` | "Cart eligibility disabled: shopify.cart_eligible is false." |
| `storefront_available` is false | `storefrontUnavailable` | "Storefront unavailable: shopify.storefront_available is false." |
| `variant_mappings` is empty | `variantMappingMissing` | "Variant mapping missing: shopify.variant_mappings[] is empty." |

---

## 2. SKU Source of Truth

**All SKUs come from the existing Shopify catalog — they are never generated.**

SKUs in `skuOptions[]` are real Shopify SKUs sourced from the CSV export. The engine filters them against user selections to find `selectedSku`. The cart adapter then resolves the variant GID via exact match:

```
User selections → resolveSkuMatch(skuOptions) → selectedSku
selectedSku → variant_mappings[].sku === selectedSku → shopify_variant_id
```

### Prototype SKU Removal (Sprint 16)

Old prototype SKUs `NAV-SLB-*` have been **removed** from all files. They never existed in Shopify.

| Removed | Replaced With |
|---------|--------------|
| `NAV-SLB-45-BB` | `NVG45Z-NFPA20`, `NVG45Z-NFPA21` |
| `NAV-SLB-45-RB` | *(no matching export SKU)* |
| `NAV-SLB-53-BB` | `NVG53D-MUNI1RHC`, `NVG53Z-MUNI1RHC6` |
| `NAV-SLB-53-RB` | `NVG53Z-NFPA20`, `NVG53Z-NFPA21` |
| `NAV-SLB-60-BB` | *(no matching export SKU)* |
| `NAV-SLB-60-RB` | `NVG60D-NFPA20`, `NVG60D-NFPA21`, `NVG60D-NFPA22` |
| `NAV-SLB-60-AM` | `NVG60D-TOW2FC`, `NVG60Z-TOW2FC6` |

---

## 3. Configurator JSON — `skuOptions[]` Attribute Verification

Location: `data/configurators/{configuratorId}.json` → `.skuOptions[].attributes`

Each SKU has a `_verification` object indicating which attribute values are confirmed vs. inferred:

```json
{
  "sku": "NVG53Z-NFPA20",
  "attributes": { "length": "53", "color": "RW", "spec": "NFPA20" },
  "_verification": {
    "length": "confirmed",
    "color": "needs_verification",
    "spec": "needs_verification"
  }
}
```

| Attribute | Verification Status | Source |
|-----------|--------------------|-|
| `length` | ✅ confirmed | CSV export `option2Value` (`45"`, `53"`, `60"`) |
| `color` | ⚠ needs_verification | Inferred from `option3Value` (`Red-White` → `RW`, `Amber-White` → `AW`) — confirm exact Shopify option name |
| `spec` | ⚠ needs_verification | Inferred from SKU suffix (`NFPA20`, `MUNI`, `TOW`) — confirm this is a real Shopify option or `customAttribute` only |

**Two TOW SKUs** (`NVG60D-TOW2FC`, `NVG60Z-TOW2FC6`) have `color: "CUSTOM"` because the export shows `"See Description"` — actual color values require the product spec sheet.

---

## 4. Navigator Product Structure

Navigator is **3 separate Shopify products** (not one), split by length:

| Length | Handle | Variants in Export | Product GID |
|--------|--------|--------------------|-------------|
| 45" | `navigator-light-bar-45` | 2 | ❌ collect from Admin |
| 53" | `navigator-light-bar-53` | 4 | ❌ collect from Admin |
| 60" | `navigator-light-bar-60` | 5 | ❌ collect from Admin |

The cart adapter must route to the correct `product_id` based on the user's `length` step selection. This is a Sprint 17 architecture task.

---

## 5. Accessory Shopify Mappings

Accessory SKUs (`NAV-CABLE-*`, `NAV-BRKT-*`, `NAV-CTRL-*`) are prototype placeholders. Real accessory products exist in the export under the `signalmaster-accessories` handle.

```json
{
  "id": "cable-10",
  "label": "10 ft. Main Harness",
  "skuSegment": "C10",
  "priceModifier": 28,
  "shopify_variant_id": null
}
```

Resolution rule: each accessory must have `shopify_variant_id` populated before cart checkout.

---

## 6. Custom Attributes Strategy

All configurator step selections pass through as `customAttributes[]` on the cart line:

```json
[
  { "key": "Vehicle Type",                "value": "Patrol SUV / Truck" },
  { "key": "Bar Length",                  "value": "53\"" },
  { "key": "Color Configuration",         "value": "Red / White" },
  { "key": "Specification",               "value": "NFPA 2021" },
  { "key": "Mounting Type",               "value": "Permanent Mount" },
  { "key": "_configuratorId",             "value": "navigator-configurator" },
  { "key": "_selectedSku",                "value": "NVG53Z-NFPA21" },
  { "key": "_productId",                  "value": "navigator" }
]
```

- Steps with no Shopify option equivalent (vehicle, mounting, controller) pass as `customAttributes` only.
- `_selectedSku` replaces the old `_skuPreview` key — uses the resolved real SKU.
- Attributes prefixed `_` are hidden from customers on Shopify default themes.

---

## 7. Checkout Handoff Plan

1. User clicks "Add to Cart" (currently disabled — `cart_eligible: false`).
2. `AddToCartPanel` calls `shopifyCartService.addToCart(cartPayload)`.
3. Service delegates to `shopifyCartAdapter.addToCart(cartPayload)`.
4. Adapter routes to correct product handle by `length` selection → calls `base44.functions.invoke('shopifyCart', cartPayload)`.
5. Deno backend reads `SHOPIFY_STOREFRONT_ACCESS_TOKEN` from `Deno.env`.
6. Backend calls Shopify `cartCreate` mutation → returns `{ cartId, checkoutUrl }`.
7. UI redirects: `window.location.href = checkoutUrl`.

**Token safety:** `SHOPIFY_STOREFRONT_ACCESS_TOKEN` lives only in the Deno backend environment — never in source or `.env`.

---

## 8. Current Mapping Status — Navigator (Sprint 16)

| Field | Status | Source |
|-------|--------|--------|
| `shopify.handles` (45/53/60) | ✅ set | CSV export |
| `shopify.handle` (primary) | ✅ set | CSV export |
| `shopify.product_id` | ❌ null | Must collect from Admin (not in export) |
| `shopify.cart_eligible` | ❌ false | Set `true` after all GIDs collected |
| `shopify.storefront_available` | ❌ false | Set `true` after Storefront API confirmed |
| `variant_mappings[].sku` (11 SKUs) | ✅ populated | CSV export |
| `variant_mappings[].price` (11) | ✅ populated | CSV export |
| `variant_mappings[].shopify_handle` (11) | ✅ populated | CSV export |
| `variant_mappings[].shopify_variant_id` (11) | ❌ null × 11 | Must collect from Admin |
| `attributes.length` verification | ✅ confirmed | CSV option2Value |
| `attributes.color` verification | ⚠ needs_verification | Inferred from option3Value |
| `attributes.spec` verification | ⚠ needs_verification | Inferred from SKU suffix |
| Accessory variant IDs (5) | ❌ not mapped | Must match to real Shopify products |
| Backend secrets | ❌ not set | Set in Base44 Secrets |
| Backend proxy function | ❌ not created | Sprint 17 |

**Add to Cart panel: disabled — expected. All 4 readiness checks failing.**

---

*Sprint 16 — Real SKUs from export. No Shopify API calls. No credentials in source.*