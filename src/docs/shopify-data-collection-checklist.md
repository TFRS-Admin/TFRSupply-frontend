# Shopify Data Collection Checklist
**TFR Supply Configurator — Sprint 18**

---

## Navigator Model: One Product / Many Variants

**Decision (Sprint 18):** Navigator Serial Light Bar is **one Shopify product** with **11 variants**.
Length (45", 53", 60") is a Shopify variant option, not a separate product.

| Previous assumption (removed) | Correct model |
|---|---|
| 3 Shopify products (one per length) | 1 Shopify product |
| 3 product GIDs to collect | 1 product GID to collect |
| `handles.45in`, `handles.53in`, `handles.60in` | Single `handle` field |
| Cart adapter routes by length → product | Cart adapter uses one `product_id` always |

---

## What CSV Export Provides vs. What Requires Admin

| Data | In CSV Export? | Notes |
|------|---------------|-------|
| Product handle | ✅ | `navigator-serial-light-bar` (confirm in Admin) |
| Variant SKUs (NVG-prefix) | ✅ | All 11 SKUs confirmed |
| Variant prices | ✅ | Populated in `variant_mappings[].price` |
| Product status | ✅ | Confirm published/draft in Admin |
| **Shopify Product GID** | ❌ | Must collect from Admin URL |
| **Shopify Variant GIDs** | ❌ | Must collect from Admin — one per variant |
| Storefront API token | ❌ | Backend secret — never in source |

---

## Collection Steps

### Step 1 — One Product GID

```
Shopify Admin → Products → Navigator Serial Light Bar
→ URL contains: /products/1234567890
→ format as: gid://shopify/Product/1234567890
```

Enter in `data/products/navigator.json` → `shopify.product_id`.

| Field | Value |
|-------|-------|
| `shopify.product_id` | `gid://shopify/Product/__________` |
| `shopify.handle` | `navigator-serial-light-bar` (verify) |

---

### Step 2 — 11 Variant GIDs

```
Shopify Admin → Products → Navigator Serial Light Bar → Variants
→ click each variant → URL contains: /variants/9876543210
→ format as: gid://shopify/ProductVariant/9876543210
```

Match each variant to the SKU shown in the variant editor.

| SKU | Price | Option | Variant GID |
|-----|-------|--------|-------------|
| `NVG45Z-NFPA20`   | $4,639 | 45" / Red-White / NFPA 2020    | `gid://shopify/ProductVariant/__________` |
| `NVG45Z-NFPA21`   | $4,249 | 45" / Red-White / NFPA 2021    | `gid://shopify/ProductVariant/__________` |
| `NVG53D-MUNI1RHC` | $4,552 | 53" / Amber-White / Muni HC    | `gid://shopify/ProductVariant/__________` |
| `NVG53Z-MUNI1RHC6`| $5,012 | 53" / Amber-White / Muni HC6   | `gid://shopify/ProductVariant/__________` |
| `NVG53Z-NFPA20`   | $5,142 | 53" / Red-White / NFPA 2020    | `gid://shopify/ProductVariant/__________` |
| `NVG53Z-NFPA21`   | $4,752 | 53" / Red-White / NFPA 2021    | `gid://shopify/ProductVariant/__________` |
| `NVG60D-NFPA20`   | $3,450 | 60" / Red-White / NFPA 2020    | `gid://shopify/ProductVariant/__________` |
| `NVG60D-NFPA21`   | $3,850 | 60" / Red-White / NFPA 2021    | `gid://shopify/ProductVariant/__________` |
| `NVG60D-NFPA22`   | $4,290 | 60" / Red-White / NFPA 2022    | `gid://shopify/ProductVariant/__________` |
| `NVG60D-TOW2FC`   | $4,750 | 60" / See Description / Tow 2FC  | `gid://shopify/ProductVariant/__________` |
| `NVG60Z-TOW2FC6`  | $5,210 | 60" / See Description / Tow 2FC6 | `gid://shopify/ProductVariant/__________` |

Enter each GID into `data/products/navigator.json` → `shopify.variant_mappings[].shopify_variant_id` matching by `sku`.

---

### Step 3 — Accessory Variant GIDs

Accessory SKUs are prototype placeholders. Match to real Shopify products.

| Commerce SKU | Label | Price | Shopify Variant GID |
|---|---|---|---|
| `NAV-CABLE-10` | 10 ft. Main Harness Cable        | $28  | `gid://shopify/ProductVariant/__________` |
| `NAV-CABLE-14` | 14 ft. Main Harness Cable        | $32  | `gid://shopify/ProductVariant/__________` |
| `NAV-BRKT-STD` | Standard Permanent Mount Bracket | $45  | `gid://shopify/ProductVariant/__________` |
| `NAV-BRKT-MAG` | Magnetic Mount Kit               | $75  | `gid://shopify/ProductVariant/__________` |
| `NAV-CTRL-SM4` | SignalMaster® 4-Position Switch  | $110 | `gid://shopify/ProductVariant/__________` |

---

### Step 4 — Backend Secrets

Set in Base44 dashboard → Settings → Secrets. Never in source files.

**These are Storefront API credentials, not Admin API credentials.** They
authenticate customer-facing storefront reads only and are unrelated to the
Admin API auth used by `scripts/shopify-variant-gid-overlay/` (OAuth client
credentials or a legacy static Admin API token — see
`docs/architecture/SHOPIFY_VARIANT_GID_OVERLAY.md`). Never use one in place
of the other.

| Secret | Value |
|--------|-------|
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | from Admin → Apps → develop apps → Storefront API |
| `SHOPIFY_STORE_DOMAIN` | e.g. `tfrsupply.myshopify.com` |

---

### Step 5 — Enable Cart

After all GIDs are populated, set in `navigator.json`:

```json
"cart_eligible": true,
"storefront_available": true
```

---

## Checklist Sign-Off

| Step | Owner | Status |
|------|-------|--------|
| Confirm Navigator = 1 product in Shopify Admin | | ⬜ |
| Collect 1 product GID | | ⬜ |
| Collect 11 variant GIDs | | ⬜ |
| Confirm `handle` = `navigator-serial-light-bar` | | ⬜ |
| Populate `navigator.json` → `shopify.product_id` | Dev | ⬜ |
| Populate all 11 `variant_mappings[].shopify_variant_id` | Dev | ⬜ |
| Confirm/match 5 accessory SKUs to Shopify products | | ⬜ |
| Confirm product is published (not draft) | | ⬜ |
| Set `SHOPIFY_STOREFRONT_ACCESS_TOKEN` in Base44 Secrets | Dev | ⬜ |
| Set `SHOPIFY_STORE_DOMAIN` in Base44 Secrets | Dev | ⬜ |
| Set `cart_eligible: true` + `storefront_available: true` | Dev | ⬜ After above |
| ShopifyReadinessPanel shows all checks passing | Dev | ⬜ |
| Add to Cart panel unlocks | Dev | ⬜ |

---

*Sprint 18 — One product / 11 variants model. No API calls. No credentials in source.*