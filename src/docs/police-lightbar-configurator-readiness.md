# Police Light Bar Configurator — Readiness Summary

**Generated:** 2026-06-30  
**Scope:** Federal Signal light bar product families in the Police vertical  
**Configurator Engine:** `ConfiguratorModule` (unified, data-driven — `sections` JSON format)  
**Commerce Source:** `shopify-variant-index.json` via `commerceLookupService`

---

## 1. Quote-Ready Families

These families have a complete configurator JSON, price data from the Shopify export, and functioning quote payload generation. Add to Quote is enabled for all selected SKU rows. Checkout (Add to Cart) remains disabled until Shopify Admin GIDs are collected.

| Family | Configurator ID | Police SKUs | Price Source | Prices Loaded | GIDs Loaded | Checkout | Quote |
|---|---|---|---|---|---|---|---|
| **Valor® Police Light Bar** | `valor-configurator` | 8 | Shopify CSV export | ✅ 8 / 8 | ❌ 0 / 8 | 🔒 Disabled | ✅ Ready |
| **Reliant® S2 Police Light Bar** | `reliant-s2-configurator` | 8 | Shopify CSV export | ✅ 8 / 8 | ❌ 0 / 8 | 🔒 Disabled | ✅ Ready |
| **Vision SLR Police Light Bar** | `vision-slr-configurator` | 4 | Shopify CSV export | ✅ 4 / 4 | ❌ 0 / 4 | 🔒 Disabled | ✅ Ready |
| **Navigator® Serial (Police SKUs)** | `navigator-configurator` | 11 | Shopify CSV export | ✅ 11 / 11 | ❌ 0 / 11 | 🔒 Disabled | ✅ Ready |

> **Note — Navigator® Serial:** SKUs were originally sourced for Fire/EMS/Municipal (NFPA/MUNI/TOW suffixes). The Police configurator retains these rows because they appear on the `navigator-serial-light-bar` Shopify handle. Warning Color attribute is flagged `needs_verification` — verify Red/White applicability before presenting to police customers.

---

## 2. Held / Excluded Families

### ~~2a. Configurator Built — Awaiting Index Entry~~ → RESOLVED 2026-06-30

Both families are now **quote-ready**. All 14 SKUs were written into `shopify-variant-index.json` directly from the Shopify CSV export on 2026-06-30. Commerce lookup returns `price_only` for all 14 SKUs. Prices display in SKU tables, Package Total calculates correctly, Add to Quote is enabled. Add to Cart remains disabled (shopifyVariantId = null — GIDs pending Admin collection).

| Family | Configurator ID | Police SKUs | Price Range | Index Status | Quote Ready | Cart Ready |
|---|---|---|---|---|---|---|
| **Allegiant® Max Serial Police Light Bar** | `allegiant-max-serial-configurator` | 9 | $3,109 – $3,907 | `price_only` × 9 ✅ | ✅ YES | ❌ GIDs pending |
| **Integrity® Police Light Bar** | `integrity-configurator` | 5 | $4,410 – $5,584 | `price_only` × 5 ✅ | ✅ YES | ❌ GIDs pending |

**Verified CSV prices — Allegiant Max Serial:**

| SKU | Handle | CSV Price | opt3 |
|---|---|---|---|
| ALGT45JX-P1LC | allegiant-light-bar-45 | $3,109 | Red-Blue-White |
| ALGT45JX-P2LC | allegiant-light-bar-45 | $3,109 | Blue-White |
| ALGT45JX-P3LC | allegiant-light-bar-45 | $3,624 | Red-Blue-White |
| ALGT45JX-P4LC | allegiant-light-bar-45 | $3,624 | See Description ⚠ |
| ALGT53JX-P1LC | allegiant-light-bar-53 | $3,392 | Red-Blue-White |
| ALGT53JX-P2LC | allegiant-light-bar-53 | $3,392 | Blue-White |
| ALGT53JX-P3LC | allegiant-light-bar-53 | $3,907 | Red-Blue-White |
| ALGT53JX-P3LB | allegiant-light-bar-53 | $3,907 | Red-Blue-White |
| ALGT53JX-P4LC | allegiant-light-bar-53 | $3,907 | See Description ⚠ |

**Verified CSV prices — Integrity:**

| SKU | Handle | CSV Price | opt3 |
|---|---|---|---|
| INTG44J-P2BL | integrity-light-bar-44 | $4,410 | Blue-White |
| INTG44J-PF3L | integrity-light-bar-44 | $5,040 | Red-Blue-White |
| INTG51J-P1BL | integrity-light-bar-51 | $4,797 | Red-Blue-White |
| INTG51J-P2BL | integrity-light-bar-51 | $4,797 | Blue-White |
| INTG51J-PF3L | integrity-light-bar-51 | $5,584 | Red-Blue-White |

> ⚠ `INTG44J-P1BL` (1-Color 44″) is **absent from the CSV entirely** — no Shopify row exists for this SKU. It was correctly omitted from the Integrity configurator.

### 2b. No Shopify SKUs — Configurator Not Started

| Family | Reason Excluded |
|---|---|
| **Allegiant® Max Discrete (Police)** | Police Discrete SKUs do not exist in the current Shopify catalog. Catalog note recorded in `light-bars.json`. Do not create until Police Discrete SKUs appear in the Shopify export. |

### 2c. Navigator Variant Families — Non-Police Scope

| Family | Configurator ID | Note |
|---|---|---|
| **Navigator Discrete** | `navigator-discrete-configurator` | Fire/EMS scope (NVG25D NFPA SKUs). 3 of 7 SKUs `unmatched` in index. Not in Police vertical. |
| **Navigator Linear Mini** | `navigator-linear-mini-configurator` | 9 SKUs — all `unmatched` in index, prices unknown. Not in Police vertical. |
| **Navigator Serial (duplicate)** | `navigator-serial-configurator` | Duplicate of `navigator-configurator` with static prices baked into JSON. Retire in favor of the index-driven version. |

---

## 3. Shopify Price Source Status

All prices are sourced exclusively from `shopify-variant-index.json`, which is generated from the Shopify products CSV export. No configurator JSON file stores prices directly (all `"price": null` in `skuOptions`). The `commerceLookupService` resolves prices at runtime from the index.

| Family | Index Status | Price Range |
|---|---|---|
| Valor® Police | `price_only` × 8 | $4,970 – $6,566 |
| Reliant® S2 Police | `price_only` × 8 | $2,204 (all 8 SKUs) |
| Vision SLR Police | `price_only` × 4 | TBD (in index, amounts not re-verified here) |
| Navigator® Serial | `price_only` × 11 | $3,450 – $5,210 |
| Allegiant® Max Serial | `unmatched` × 9 | $3,109 – $3,907 — confirmed in CSV, **not yet written to index** |
| Integrity® Police | `unmatched` × 5 | $4,410 – $5,584 — confirmed in CSV, **not yet written to index** |

**`price_only` status** means the price is resolvable from the index but the Shopify variant GID (GraphQL ID) is null — checkout is disabled, quote is enabled.  
**`unmatched` status** means the SKU is not present in the index at all — both price and checkout are unavailable.

---

## 4. Variant GID Status

Shopify variant GIDs (GraphQL `gid://shopify/ProductVariant/...`) are required for cart integration (Add to Cart). The Shopify CSV export does not include GIDs — they must be collected from Shopify Admin.

| Status | Families |
|---|---|
| **GIDs collected** | None |
| **GIDs pending Admin collection** | Valor®, Reliant® S2, Vision SLR, Navigator® Serial |
| **Not applicable (unmatched)** | Allegiant® Max Serial, Integrity® |

**How to collect GIDs:**  
In Shopify Admin → Products → open each product → each variant row shows the variant ID in the URL or via the API. These should be written into `shopify-variant-index.json` under `shopifyVariantId` for each SKU entry.

---

## 5. Checkout Readiness Status

| Family | Add to Quote | Add to Cart | Blocker |
|---|---|---|---|
| Valor® Police | ✅ Enabled | 🔒 Disabled | GIDs not collected |
| Reliant® S2 Police | ✅ Enabled | 🔒 Disabled | GIDs not collected |
| Vision SLR Police | ✅ Enabled | 🔒 Disabled | GIDs not collected |
| Navigator® Serial | ✅ Enabled | 🔒 Disabled | GIDs not collected |
| Allegiant® Max Serial | ✅ Quote-Ready | 🔒 Disabled | `price_only` × 9 — GIDs pending Admin collection |
| Integrity® Police | ✅ Quote-Ready | 🔒 Disabled | `price_only` × 5 — GIDs pending Admin collection |

---

## 6. Remaining Blockers

### ~~Priority 1 — Add Allegiant® Max Serial + Integrity® to Index~~ → DONE 2026-06-30
- All 14 SKUs written to `shopify-variant-index.json` from CSV. Commerce lookup returns `price_only` × 14. Both families are quote-ready.
- `ALGT45JX-P4LC` and `ALGT53JX-P4LC` remain flagged `needs_verification` in the configurator (opt3 = "See Description") — prices are confirmed but color config should be verified before ordering.

### Priority 3 — Enable Checkout Across All Quote-Ready Families
- **Action:** Collect Shopify Admin variant GIDs for all 31 indexed Police SKUs (Valor 8 + Reliant S2 8 + Vision SLR 4 + Navigator Serial 11). Set `shopifyVariantId` in the index.
- **Effort:** Medium — requires Shopify Admin access.

### Priority 4 — Navigator® Serial Warning Color Verification
- **Action:** Confirm that the Red/White color configurations shown in the Navigator Serial Police configurator are valid for police use cases (not Fire/EMS-only). Some NFPA/Municipal suffix SKUs may require label correction.
- **Effort:** Low — review with product team.

### Priority 5 — Retire Duplicate Navigator Serial Configurator
- **Action:** Archive `navigator-serial-configurator.json` — it duplicates `navigator-configurator.json` with static prices baked in. The index-driven version (`navigator-configurator`) is the authoritative source.
- **Effort:** Minimal.

### Accessory SKUs — All Families
- Controller/head unit SKUs are `null` across all police configurator accessories. These are listed as required components but cannot be quoted specifically. Collect from Federal Signal price book and add to accessory `sku` fields.

---

## 7. Recommended Next Product Category

**Sirens & Controllers**

**Rationale:**
- Light bars are the anchoring product in every police package. The natural upsell and required companion purchase is the siren/controller (e.g., Federal Signal SS2000SM, Valor Controller, RM-2008).
- Every current police light bar configurator lists a controller as a `required` component with `sku: null` — this is the most visible gap in the current accessory build.
- Customers who configure a light bar will immediately need to identify the matching siren and speaker package. Building a Sirens & Controllers category configurator directly resolves this accessory SKU gap.
- Federal Signal sirens have well-structured SKU patterns (`SS2000SM`, `PA640`, `RM-2008`) and likely appear in the Shopify export alongside light bar products.

**Suggested configurator approach:** Filter by siren type (electronic / mechanical), wattage, and controller compatibility. Cross-reference against each light bar family's recommended controller.

---

## 8. Contradiction Analysis — Earlier Report vs. Verified State

### What the earlier readiness report stated (incorrectly)

- **Integrity:** "Prices must be extracted from Police Price Book and added to index" — implied prices were unknown.
- **Allegiant Max Serial:** Stated prices in range $3,109–$3,907 were from "CSV source" but also marked the index status as `unmatched` without flagging that the index simply hadn't been updated.

### What the live commerce lookup actually returns

All 14 SKUs — 9 Allegiant Max Serial + 5 Integrity — return `status: 'unmatched'` from `commerceLookupService` because **none of them exist as keys in `shopify-variant-index.json`**.

### Root cause of the contradiction

The earlier report was written by combining two data sources without verifying their reconciliation:

1. **CSV audit** (raw Shopify export) — correctly identified prices for all 14 SKUs.
2. **Index audit** (`shopify-variant-index.json`) — correctly reported `unmatched` at index lookup time.

The error was treating the CSV prices as usable at runtime. **The `commerceLookupService` only reads `shopify-variant-index.json` — it never reads the CSV directly.** Prices visible in the CSV export are inert until they are explicitly written into the index file. The readiness report conflated "price exists in the original CSV" with "price is resolvable at runtime," which produced a misleading impression that these families were closer to quote-ready than they actually are.

### Corrected status

| Family | Runtime Status | CSV Price Available | Index Entry Exists | Action Required |
|---|---|---|---|---|
| Allegiant® Max Serial | `unmatched` × 9 | ✅ Yes | ❌ No | Write 9 SKUs into `shopify-variant-index.json` |
| Integrity® | `unmatched` × 5 | ✅ Yes | ❌ No | Write 5 SKUs into `shopify-variant-index.json` |

Both families are one index-update away from becoming quote-ready. No price book research is needed.

---

## Appendix — Configurator File Reference

| File | Family | Police SKUs | Quote Ready |
|---|---|---|---|
| `valor-configurator.json` | Valor® Police Light Bar | 8 | ✅ |
| `reliant-s2-configurator.json` | Reliant® S2 Police Light Bar | 8 | ✅ |
| `vision-slr-configurator.json` | Vision SLR Police Light Bar | 4 | ✅ |
| `navigator-configurator.json` | Navigator® Serial (Police SKUs) | 11 | ✅ |
| `allegiant-max-serial-configurator.json` | Allegiant® Max Serial Police | 9 | ❌ Prices missing |
| `integrity-configurator.json` | Integrity® Police Light Bar | 5 | ❌ Prices missing |
| `navigator-discrete-configurator.json` | Navigator Discrete (Fire/EMS) | — | Non-police |
| `navigator-linear-mini-configurator.json` | Navigator Linear Mini | — | Non-police |
| `navigator-serial-configurator.json` | Navigator Serial (duplicate) | — | Retire |