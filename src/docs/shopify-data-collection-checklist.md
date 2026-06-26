# Shopify Data Collection Checklist
**TFR Supply Configurator — Sprint 16**

---

## Export-Based Workflow (Sprint 16)

A Shopify product export CSV was imported and analyzed. The following table shows what the export provides and what still requires Shopify Admin access.

| Data | Available in CSV Export? | Notes |
|------|--------------------------|-------|
| Product handles | ✅ Yes | `navigator-light-bar-45`, `navigator-light-bar-53`, `navigator-light-bar-60` |
| Variant SKUs | ✅ Yes | Real NVG-prefix SKUs (e.g. `NVG45Z-NFPA20`) |
| Variant prices | ✅ Yes | Populated in `variant_mappings[].price` |
| Option values (Length, Color) | ✅ Yes | `option2Value` = `45"`, `53"`, `60"` |
| Product images (CDN URLs) | ✅ Yes | Updated in `navigator.json` media block |
| Product status | ✅ Yes | All Navigator bars are `draft` / not yet published |
| Shopify Product ID (numeric) | ❌ No | Must collect from Admin URL |
| Shopify Variant ID (numeric) | ❌ No | Must collect from Admin URL per variant |
| Shopify GIDs (gid://shopify/…) | ❌ No | Derived from numeric IDs — see below |
| Storefront API access token | ❌ No | Backend secret — never in source |

---

## Critical Finding: SKU Prefix Change

**Prototype SKUs (`NAV-SLB-*`) do not exist in Shopify.** Real product SKUs use `NVG`-prefix:

| Prototype SKU (removed) | Real Shopify SKU | Handle |
|------------------------|-----------------|--------|
| `NAV-SLB-45-BB` | `NVG45Z-NFPA20` / `NVG45Z-NFPA21` | `navigator-light-bar-45` |
| `NAV-SLB-45-RB` | *(no matching 45" RB variant in export)* | — |
| `NAV-SLB-53-BB` | `NVG53D-MUNI1RHC` / `NVG53Z-MUNI1RHC6` | `navigator-light-bar-53` |
| `NAV-SLB-53-RB` | `NVG53Z-NFPA20` / `NVG53Z-NFPA21` | `navigator-light-bar-53` |
| `NAV-SLB-60-BB` | *(no matching 60" BB variant in export)* | — |
| `NAV-SLB-60-RB` | `NVG60D-NFPA20` / `NVG60D-NFPA21` / `NVG60D-NFPA22` | `navigator-light-bar-60` |
| `NAV-SLB-60-AM` | `NVG60D-TOW2FC` / `NVG60Z-TOW2FC6` | `navigator-light-bar-60` |

**All SKUs in `navigator-configurator.json` and `navigator.json` updated to real NVG-prefix SKUs.**

---

## Structure Discovery: 3 Shopify Products (not 1)

The Navigator is split into **3 separate Shopify products** by length:

| Length | Shopify Handle | # Variants in Export | Status |
|--------|---------------|---------------------|--------|
| 45" | `navigator-light-bar-45` | 2 | draft |
| 53" | `navigator-light-bar-53` | 4 | draft |
| 60" | `navigator-light-bar-60` | 5 | draft |

Each product needs its own `product_id` GID. Cart payload must route to the correct handle based on the `length` step selection.

---

## How to Find Each Field in Shopify Admin

| Field | Where to Find It |
|-------|-----------------|
| Store domain | Shopify Admin → Settings → Domains |
| Product ID | Admin → Products → [Product] → URL contains numeric ID (e.g. `/products/1234567890`) → format as `gid://shopify/Product/1234567890` |
| Variant IDs | Admin → Products → [Product] → click each variant → URL contains numeric variant ID → format as `gid://shopify/ProductVariant/<id>` |
| Storefront API access | Admin → Apps → develop apps → Storefront API → confirm products are accessible |

---

## Product Worksheet: Navigator® Light Bar (45" / 53" / 60")

### A. Store-Level Fields

| Field | Required | Value |
|-------|----------|-------|
| Store domain | ✅ Yes | `______________.myshopify.com` |
| Storefront API token | ✅ Yes (backend only) | Set in Base44 Secrets: `SHOPIFY_STOREFRONT_ACCESS_TOKEN` |

---

### B. Product-Level GIDs (must collect from Admin)

| Handle | Product GID | Status |
|--------|-------------|--------|
| `navigator-light-bar-45` | `gid://shopify/Product/__________` | ⬜ Not collected |
| `navigator-light-bar-53` | `gid://shopify/Product/__________` | ⬜ Not collected |
| `navigator-light-bar-60` | `gid://shopify/Product/__________` | ⬜ Not collected |

---

### C. Variant Mappings (SKU from export, GID still needed from Admin)

#### navigator-light-bar-45

| SKU | Price (export) | Description | Variant GID |
|-----|---------------|-------------|-------------|
| `NVG45Z-NFPA20` | $4,639 | 45" Red-White NFPA 2020 | `gid://shopify/ProductVariant/__________` |
| `NVG45Z-NFPA21` | $4,249 | 45" Red-White NFPA 2021 | `gid://shopify/ProductVariant/__________` |

#### navigator-light-bar-53

| SKU | Price (export) | Description | Variant GID |
|-----|---------------|-------------|-------------|
| `NVG53D-MUNI1RHC`  | $4,552 | 53" Amber-White Municipal HC      | `gid://shopify/ProductVariant/__________` |
| `NVG53Z-MUNI1RHC6` | $5,012 | 53" Amber-White Municipal HC6     | `gid://shopify/ProductVariant/__________` |
| `NVG53Z-NFPA20`    | $5,142 | 53" Red-White NFPA 2020           | `gid://shopify/ProductVariant/__________` |
| `NVG53Z-NFPA21`    | $4,752 | 53" Red-White NFPA 2021           | `gid://shopify/ProductVariant/__________` |

#### navigator-light-bar-60

| SKU | Price (export) | Description | Variant GID |
|-----|---------------|-------------|-------------|
| `NVG60D-NFPA20`   | $3,450 | 60" Red-White NFPA 2020       | `gid://shopify/ProductVariant/__________` |
| `NVG60D-NFPA21`   | $3,850 | 60" Red-White NFPA 2021       | `gid://shopify/ProductVariant/__________` |
| `NVG60D-NFPA22`   | $4,290 | 60" Red-White NFPA 2022       | `gid://shopify/ProductVariant/__________` |
| `NVG60D-TOW2FC`   | $4,750 | 60" Tow/Utility 2FC           | `gid://shopify/ProductVariant/__________` |
| `NVG60Z-TOW2FC6`  | $5,210 | 60" Tow/Utility 2FC6          | `gid://shopify/ProductVariant/__________` |

---

### D. Accessory Variant Mappings

Accessories are prototype placeholders — they must be matched to real Shopify products/variants.

| Commerce SKU | Label | Price | Shopify Variant GID |
|-------------|-------|-------|---------------------|
| `NAV-CABLE-10` | 10 ft. Main Harness Cable        | $28  | `gid://shopify/ProductVariant/__________` |
| `NAV-CABLE-14` | 14 ft. Main Harness Cable        | $32  | `gid://shopify/ProductVariant/__________` |
| `NAV-BRKT-STD` | Standard Permanent Mount Bracket | $45  | `gid://shopify/ProductVariant/__________` |
| `NAV-BRKT-MAG` | Magnetic Mount Kit               | $75  | `gid://shopify/ProductVariant/__________` |
| `NAV-CTRL-SM4` | SignalMaster® 4-Position Switch  | $110 | `gid://shopify/ProductVariant/__________` |

> **Note:** Accessory SKUs (`NAV-*`) are prototype placeholders. Check the Shopify export for real accessory handles — SignalMaster accessories are in `signalmaster-accessories` handle.

---

### E. Configurator Step ↔ Shopify Option Reconciliation (Sprint 17)

The configurator's step `skuSegment` values must align with real Shopify option values before SKU resolution works end-to-end.

| Configurator Step | skuSegment Values | Real Shopify Option | Status |
|------------------|------------------|--------------------|----|
| Length | `45`, `53`, `60` | option2Value: `45"`, `53"`, `60"` | ✅ Close — confirm exact match |
| Color | `RW`, `AW`, `CUSTOM` | option3Value: `Red-White`, `Amber-White`, `See Description` | ⚠ Reconcile in Sprint 17 |
| Spec (NFPA/Muni/Tow) | `NFPA20`, `MUNI`, `TOW` etc. | option1Value (SKU itself) | ⚠ Confirm real option name |
| Vehicle | `PS`, `SUV`, `FA`, `CMD` | No Shopify option — `customAttribute` only | ✅ Pass-through |
| Mounting | `PERM`, `MAG`, `RACK` | No Shopify option — `customAttribute` only | ✅ Pass-through |
| Controller | `NCTRL`, `SM4`, `PF2` | No Shopify option — `customAttribute` only | ✅ Pass-through |

---

## Checklist Sign-Off

| Step | Owner | Status |
|------|-------|--------|
| Identify real SKUs from export | Dev | ✅ Done (Sprint 16) |
| Update `navigator.json` sku_table with real SKUs | Dev | ✅ Done (Sprint 16) |
| Update `navigator-configurator.json` skuOptions with real SKUs | Dev | ✅ Done (Sprint 16) |
| Update product images with real Shopify CDN URLs | Dev | ✅ Done (Sprint 16) |
| Collect product GIDs (45, 53, 60) from Admin | | ⬜ |
| Collect all 11 variant GIDs from Admin | | ⬜ |
| Confirm Storefront API access for all 3 products | | ⬜ |
| Reconcile step skuSegment values with real option values | Dev | ⬜ Sprint 17 |
| Set `SHOPIFY_STOREFRONT_ACCESS_TOKEN` in Base44 Secrets | Dev | ⬜ |
| Set `SHOPIFY_STORE_DOMAIN` in Base44 Secrets | Dev | ⬜ |
| Populate `variant_mappings[].shopify_variant_id` in navigator.json | Dev | ⬜ After GIDs collected |
| Set `cart_eligible: true` and `storefront_available: true` | Dev | ⬜ After above complete |
| QA: Add to Cart panel transitions from disabled to ready | Dev | ⬜ |
| QA: Payload inspector shows non-null variant IDs | Dev | ⬜ |

---

*Sprint 16 — CSV import complete. No API calls. No credentials in source.*