# TFRSupply Master SKU Index & Knowledge Document

**Purpose:** This document reconciles the aspirational TFRSupply Configurator Spec against the actual inventory data found in the Police and Fire/EMS Price Books and the Shopify Variant Index. It serves as the single source of truth for all configurator options and SKU mappings.

**Core Rule:** The configurator is a FILTER. It must only present options that resolve to an existing SKU in the `shopify-variant-index.json`.

---

## 1. Discrepancy Report: Spec vs. Reality

The original configurator spec document contained several aspirational product definitions that do not exist in current inventory. These have been corrected in the Master Index below.

| Product Family | Aspirational Spec Value | Real Inventory Value | Impact on Configurator |
| :--- | :--- | :--- | :--- |
| **Valor** | Lengths: 46", 53", 60" | Lengths: **44", 51"** | Filter steps must use 44" and 51". Prefix is `VALR`. |
| **Integrity** | Lengths: 46", 53", 60" | Lengths: **44", 51"** | Filter steps must use 44" and 51". Prefix is `INTG`. |
| **Allegiant Max** | Prefix: `ALMAX` | Prefix: `ALGT` | SKUs in Shopify use `ALGT` prefix (e.g., `ALGT45JX`). Note: `ALGT` is also used for standard Allegiant. Must differentiate by length/features. |
| **Reliant S2** | Prefix: `RELS2` | Prefix: `RLNT` | SKUs in Shopify use `RLNT` prefix (e.g., `RLNT48J`). |
| **Vision SLR** | Combined Lightbar/Beacon | Split: `VSLR46`/`VSLR53`/`VSLR60` (Lightbars) & `VSLR1` (Beacons) | Must be treated as separate product families in the UI. |
| **SpectraLux ILS** | Prefix: `SPXILS` | Not in Shopify Index | SKUs are missing from the current Shopify export. Needs verification. |

---

## 2. Master SKU Index & Option Mapping

### 2.1 Valor Light Bar (`VALR`)

The Valor light bar is available in both the Police and Fire verticals. Contrary to the original specification, the actual lengths available in inventory are 44" and 51". Mounting options include standard Hook (`H`) and Low Hook (`L`). Color configurations are denoted by suffixes such as `F2` for Red/White, `P1` or `PF3` for Red/Blue/White, and `P2` for Blue/White.

| SKU | Length | Color Configuration | Mount |
| :--- | :--- | :--- | :--- |
| `VALR44J-F2H` | 44" | Red/White | Hook |
| `VALR44J-P1BH` | 44" | Red/Blue/White | Hook |
| `VALR44J-P1BL` | 44" | Red/Blue/White | Low Hook |
| `VALR44J-P2BL` | 44" | Blue/White | Low Hook |
| `VALR44J-PF3AL` | 44" | Red/Blue/White | Low Hook |
| `VALR51J-F2H` | 51" | Red/White | Hook |
| `VALR51J-P1BH` | 51" | Red/Blue/White | Hook |
| `VALR51J-P1BL` | 51" | Red/Blue/White | Low Hook |
| `VALR51J-P2BL` | 51" | Blue/White | Low Hook |
| `VALR51J-PF3AL` | 51" | Red/Blue/White | Low Hook |

### 2.2 Integrity Light Bar (`INTG`)

The Integrity light bar is available in both the Police and Fire verticals. Similar to the Valor, the actual lengths available in inventory are 44" and 51". Mounting options include standard Hook (`H`) and Low Hook (`L`). Color configurations are denoted by suffixes such as `F2` for Red/White, `P1` or `PF3` for Red/Blue/White, and `P2` for Blue/White.

| SKU | Length | Color Configuration | Mount |
| :--- | :--- | :--- | :--- |
| `INTG44J-F2H` | 44" | Red/White | Hook |
| `INTG44J-P1BL` | 44" | Red/Blue/White | Low Hook |
| `INTG44J-P2BL` | 44" | Blue/White | Low Hook |
| `INTG44J-PF3L` | 44" | Red/Blue/White | Low Hook |
| `INTG51J-F2H` | 51" | Red/White | Hook |
| `INTG51J-P1BL` | 51" | Red/Blue/White | Low Hook |
| `INTG51J-P2BL` | 51" | Blue/White | Low Hook |
| `INTG51J-PF3L` | 51" | Red/Blue/White | Low Hook |

### 2.3 Vision SLR Light Bar (`VSLR`)

The Vision SLR light bar is available in both the Police and Fire verticals. The actual lengths available in inventory are 46", 53", and 60". Configurations include Red/White/Blue, Red/Blue, and Red/White. Pod counts vary between 3/5 Pods, 6 Pods, and 8 Pods.

| SKU | Length | Color Configuration | Pods | Mount |
| :--- | :--- | :--- | :--- | :--- |
| `VSLR46-2664023` | 46" | Red/White/Blue | 3/5 Pods | Hook |
| `VSLR46S-2664014` | 46" | Red/Blue | 3/5 Pods | Hook |
| `VSLR46S-NFPA1` | 46" | Red/White | 3/5 Pods | Hook |
| `VSLR53S-NFPA1` | 53" | Red/White | 3/5 Pods | Hook |
| `VSLR60S-NFPA1` | 60" | Red/White | 3/5 Pods | Hook |

### 2.4 Navigator Light Bar (`NVG`)

The Navigator light bar is primarily available in the Fire vertical. The actual lengths available in inventory span a wide range: 10", 18", 25", 45", 53", 60", 73", and 87". Mounting options include Discrete Flat, Riser, and Hook.

| SKU | Length | Color Configuration | Dome | Mount |
| :--- | :--- | :--- | :--- | :--- |
| `NVG10D-NFPA21-D` | 10" | Red | Clear | Discrete Flat |
| `NVG45Z-NFPA20` | 45" | Red/White | Clear | Hook |
| `NVG53Z-NFPA20` | 53" | Red/White | Clear | Hook |

### 2.5 Allegiant Max (`ALGT`)

The Allegiant Max light bar is available in the Police, Fire, and Work Truck verticals. The actual lengths available in inventory are 45", 53", 61", 70", 80", and 94". Note that the `ALGT` prefix is shared with the standard Allegiant. Max models typically have `JX`, `XC`, `DX`, or `DXS` suffixes.

| SKU | Length | Color Configuration | Dome/Mount |
| :--- | :--- | :--- | :--- |
| `ALGT45JX-P1LC` | 45" | Red/Blue/White | Clear Low Hook |
| `ALGT53JX-F1LR` | 53" | Amber/Red/White | Red Low Hook |
| `ALGT61XC-NFPA2` | 61" | Red/White | Clear Permanent |

### 2.6 Reliant S2 (`RLNT`)

The Reliant S2 light bar is available in both the Police and Fire verticals. The primary length available in inventory is 48".

| SKU | Length | Color Configuration | Mount |
| :--- | :--- | :--- | :--- |
| `RLNT48J-01BB` | 48" | Red/Blue/White | Blue Low Hook |
| `RLNT48J-01CC` | 48" | Red/Blue/White | Clear Low Hook |

---

## 3. Vehicle Fitment (Hook Kits - `HKB`)

Vehicle compatibility is determined by the `HKB` (Hook Kit Bracket) series. These are treated as `auto_bundle` accessories in the configurator.

| Vehicle | HKB Suffix | Example SKU |
| :--- | :--- | :--- |
| Ford Police Interceptor Utility (2020+) | `FPIU20` | `HKB-FPIU20-HP` |
| Chevy Tahoe (2021+) | `TAH21` | `HKB-TAH21-HP` |
| Dodge Durango | `DUR11` | `HKB-DUR11-HP` |
| Dodge Charger | `LPCHGR11` | `HKB-LPCHGR11-HP` |
| Ford F-150 | `FRD15` | `HKB-FRD15-HP` |
| Chevy Silverado | `SIL17` | `HKB-SIL17` |

---

## 4. Configurator JSON Implementation Rules

When the vibe-coding agent generates the `[product]-configurator.json` files, it MUST follow these rules:

1.  **Never Hardcode Prices:** All prices in the JSON must be `null` or omitted. The UI reads prices dynamically from `shopify-variant-index.json`.
2.  **Use Real Option Values:** The `options` arrays in the JSON must match the dimensions extracted above (e.g., `["44\"", "51\""]` for Valor, not `["46\"", "53\"", "60\""]`).
3.  **Filter Existing SKUs:** The `skuOptions` mapping must map exactly to the real SKUs listed in Section 2.
4.  **Auto-Bundle Hook Kits:** Use the new `auto_bundle` schema feature to link Vehicle Fitment selections to the corresponding `HKB` accessory SKUs.
