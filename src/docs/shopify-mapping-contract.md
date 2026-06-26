# Shopify Mapping Contract
**TFR Supply Configurator — Sprint 11**

This document defines the required data contract for all Shopify mapping fields.
No field here is optional once `cart_eligible: true` is set on a product.
Any missing field will be caught by `checkMappingReadiness()` and surfaced in the AddToCartPanel UI.

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
    { "sku": "NAV-SLB-45-BB", "shopify_variant_id": "gid://shopify/ProductVariant/111" },
    { "sku": "NAV-SLB-53-RB", "shopify_variant_id": "gid://shopify/ProductVariant/222" },
    { "sku": "NAV-SLB-60-AM", "shopify_variant_id": "gid://shopify/ProductVariant/333" }
  ]
}
```

### Field Reference

| Field | Type | Required When | Description |
|-------|------|--------------|-------------|
| `product_id` | `string` | Always | Shopify Global ID (`gid://shopify/Product/…`). Null = product not linked. |
| `handle` | `string` | Always | Shopify product URL handle. Used for deep-link fallback. |
| `cart_eligible` | `boolean` | Always | Master switch. `false` = cart button is disabled regardless of other fields. |
| `storefront_available` | `boolean` | Always | Whether the Storefront API can query this product. `false` = cannot add to cart. |
| `variant_mappings[]` | `array` | `cart_eligible: true` | SKU-to-variant-ID map. Each entry maps one configurator-generated SKU to one Shopify variant GID. |
| `variant_mappings[].sku` | `string` | Per entry | Must match a value that `generateSkuPreview()` can produce. |
| `variant_mappings[].shopify_variant_id` | `string` | Per entry | Shopify Global ID (`gid://shopify/ProductVariant/…`). |

### Validation Errors Raised

| Condition | `categories` key | UI Message |
|-----------|-----------------|------------|
| `product_id` is null | `productMappingMissing` | "Product mapping missing: shopify.product_id is not set." |
| `cart_eligible` is false | `cartEligibilityDisabled` | "Cart eligibility disabled: shopify.cart_eligible is false." |
| `storefront_available` is false | `storefrontUnavailable` | "Storefront unavailable: shopify.storefront_available is false." |
| `variant_mappings` is empty | `variantMappingMissing` | "Variant mapping missing: shopify.variant_mappings[] is empty." |

---

## 2. Configurator JSON — `shopifyMapping` Block

Location: `data/configurators/{configuratorId}.json` → `.shopifyMapping`

```json
"shopifyMapping": {
  "storeHandle": "tfrsupply",
  "variantMap": [
    { "sku": "NAV-SLB-45-BB", "shopify_variant_id": "gid://shopify/ProductVariant/111" },
    { "sku": "NAV-SLB-53-RB", "shopify_variant_id": "gid://shopify/ProductVariant/222" }
  ]
}
```

### Notes
- `variantMap` here mirrors `shopify.variant_mappings` in the product JSON.
- **Source of truth:** product JSON `shopify.variant_mappings` (read by the adapter).
- Configurator JSON `shopifyMapping` is a human-readable audit copy. If they diverge, product JSON wins.
- `storeHandle` used by future backend proxy to construct the Storefront API endpoint URL.

---

## 3. Accessory Shopify Mappings

Accessories selected in the configurator generate separate cart line items in Shopify.
Each accessory option must have a corresponding Shopify variant for checkout to succeed.

**Current status:** accessory variant IDs are not yet mapped. Cart payload marks these as `⚠ null` in the inspector and adds an entry to `mappingStatus.unresolved[]`.

**Required structure (Sprint 12+):**

Add a `shopify_variant_id` field to each accessory option in the configurator JSON:

```json
{
  "id": "cable-10",
  "label": "10 ft. Main Harness",
  "skuSegment": "C10",
  "priceModifier": 28,
  "shopify_variant_id": "gid://shopify/ProductVariant/999"
}
```

Or maintain a dedicated accessory mapping file: `data/accessories/shopify-accessory-map.json`.

### Validation Errors Raised

| Condition | `categories` key | Payload indicator |
|-----------|-----------------|-------------------|
| Any selected accessory has no `shopify_variant_id` | `accessoryMappingMissing` | `accessoryLines[n].shopify_variant_id: null` + `_mappingNote` |
| All accessories unmapped | `accessoriesResolved: false` | `mappingStatus.accessoriesResolved: false` |

---

## 4. Custom Attributes Strategy

Selected configurator options are passed to Shopify as `customAttributes[]` on the cart line.

### Shape
```json
[
  { "key": "Vehicle Type",        "value": "Patrol SUV / Truck" },
  { "key": "Bar Length",          "value": "53\"" },
  { "key": "Color Configuration", "value": "Red / Blue" },
  { "key": "Mounting Type",       "value": "Permanent Mount" },
  { "key": "_configuratorId",     "value": "navigator-configurator" },
  { "key": "_skuPreview",         "value": "NAV-53-RB-PERM" },
  { "key": "_productId",          "value": "navigator" }
]
```

### Rules
- User-facing attributes use the step's `stepLabel` as key and selected option's `optionLabel` as value.
- Internal metadata attributes are prefixed with `_` (underscore).
- Shopify displays `customAttributes` in the order admin and in order confirmation emails.
- Attributes beginning with `_` are hidden from customers on Shopify's default themes.
- Maximum 25 attributes per line item (Shopify limit). Navigator has ≤10 steps — safely within limit.

---

## 5. Checkout Handoff Plan

### Sprint 12 Sequence
1. User clicks "Add to Cart" (currently disabled).
2. `AddToCartPanel` calls `shopifyCartService.addToCart(cartPayload)`.
3. Service delegates to `shopifyCartAdapter.addToCart(cartPayload)`.
4. Adapter calls `base44.functions.invoke('shopifyCart', cartPayload)`.
5. Deno backend function reads `SHOPIFY_STOREFRONT_ACCESS_TOKEN` from `Deno.env`.
6. Backend calls Shopify `cartCreate` mutation → receives `{ cartId, checkoutUrl }`.
7. Adapter returns `checkoutUrl` to UI.
8. UI redirects: `window.location.href = checkoutUrl`.

### Token Safety
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` lives **only** in the Deno backend environment.
- Never in `vite.config.js`, `.env` (frontend-accessible), or any source file.
- Storefront tokens are public-facing by Shopify's design but should still be proxied to:
  (a) prevent token rotation from requiring frontend deploys
  (b) allow rate-limit management server-side
  (c) enable future B2B pricing rules to be applied server-side

---

## 6. Current Mapping Status — Navigator

| Field | Status |
|-------|--------|
| `shopify.product_id` | ❌ null |
| `shopify.handle` | ✅ set |
| `shopify.cart_eligible` | ❌ false |
| `shopify.storefront_available` | ❌ false |
| `shopify.variant_mappings` | ❌ empty |
| Accessory variant IDs | ❌ not mapped |

**Expected: Add to Cart panel shows disabled with all 4 specific reasons.**

---

---

## 7. Data Collection Workflow (Sprint 13)

Before any live Shopify integration can be wired, all mapping data must be collected from the Shopify Admin and entered into the appropriate JSON files. This is a manual, one-time process per product.

### Step-by-Step Collection Process

```
1. Open Shopify Admin → Products → [Product]
2. Note the numeric ID from the URL → format as gid://shopify/Product/{id}
3. Open each Variant → note numeric ID from URL → format as gid://shopify/ProductVariant/{id}
4. Record each variant's SKU — confirm it matches the configurator's SKU template output
5. Repeat for each accessory product/variant
6. Populate data/products/{productId}.json → shopify block
7. Populate data/configurators/{configuratorId}.json → shopifyMapping block
8. Verify ShopifyReadinessPanel shows all checks passing
9. Set SHOPIFY_STOREFRONT_ACCESS_TOKEN + SHOPIFY_STORE_DOMAIN as Base44 backend secrets
10. Wire functions/shopifyCart.js backend proxy (Sprint 14)
```

### Reference Files

| File | Purpose |
|------|---------|
| `docs/shopify-data-collection-checklist.md` | Per-product worksheet with all required fields and sign-off table |
| `data/shopify-mapping/example-navigator-mapping.json` | Placeholder mapping structure — copy and populate with real GIDs |
| `data/products/navigator.json` → `.shopify` | Live mapping target for cart adapter |
| `data/configurators/navigator-configurator.json` → `.shopifyMapping` | Audit copy of variant map |

### SKU Resolution Rule

The cart adapter resolves a Shopify variant GID from the configurator-generated SKU preview using an exact string match:

```
skuPreview (from engine) → find variant_mappings[].sku === skuPreview → return shopify_variant_id
```

If no match is found, `shopify_variant_id` is `null` and the payload inspector flags it as `⚠ null`.
The cart button remains disabled until all configured SKU combinations have matching variant IDs.

### Accessory Resolution Rule

Each accessory selected in the configurator must have a `shopify_variant_id` in either:
- The accessory's entry in `commerce.accessories[]` in the product JSON, **or**
- A dedicated `data/shopify-mapping/accessory-map.json` keyed by accessory SKU.

Until accessory variant IDs are populated, the cart payload marks all accessory lines as `shopify_variant_id: null`.

---

## 8. Current Mapping Status — Navigator (Sprint 13)

| Field | Status | Action Required |
|-------|--------|----------------|
| `shopify.product_id` | ❌ null | Collect from Shopify Admin |
| `shopify.handle` | ✅ set (`navigator-serial-light-bar`) | Confirm matches Admin |
| `shopify.cart_eligible` | ❌ false | Set `true` after GIDs collected |
| `shopify.storefront_available` | ❌ false | Set `true` after Storefront API confirmed |
| `shopify.variant_mappings` | ❌ empty (7 SKUs need GIDs) | Collect all 7 variant GIDs |
| Accessory variant IDs | ❌ not mapped (5 accessories) | Collect 5 accessory variant GIDs |
| Backend secrets | ❌ not set | Set in Base44 Secrets after collection |
| Backend proxy function | ❌ not created | Sprint 14 |

**Expected: Add to Cart panel shows disabled with all 4 specific reasons (confirmed in Sprint 12 QA).**

---

*Sprint 13 — Data collection tooling added. No Shopify API calls made. No credentials added.*