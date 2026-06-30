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

### 2a. Configurator Built — Awaiting Index Prices

| Family | Configurator ID | Police SKUs | Reason Held |
|---|---|---|---|
| **Allegiant® Max Serial Police Light Bar** | `allegiant-max-serial-configurator` | 9 | SKUs confirmed from Shopify export (`ALGT45JX-P*`, `ALGT53JX-P*`). Prices **not yet added to `shopify-variant-index.json`** — all 9 SKUs return `unmatched`. Add prices from CSV row data ($3,109–$3,907 per export) to unblock quote generation. |
| **Integrity® Police Light Bar** | `integrity-configurator` | 5 | SKUs confirmed (`INTG44J-P*/INTG51J-P*`). Prices **not yet in index** — all 5 SKUs `unmatched`. Prices must be extracted from Police Price Book and added to index. |

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
| Allegiant® Max Serial | `unmatched` × 9 | $3,109 – $3,907 (CSV source, not yet in index) |
| Integrity® Police | `unmatched` × 5 | Unknown — Police Price Book required |

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
| Allegiant® Max Serial | ❌ Blocked | 🔒 Disabled | SKUs not in `shopify-variant-index.json` |
| Integrity® Police | ❌ Blocked | 🔒 Disabled | SKUs not in `shopify-variant-index.json` |

---

## 6. Remaining Blockers

### Priority 1 — Unblock Allegiant® Max Serial (9 SKUs)
- **Action:** Add `ALGT45JX-P1LC`, `ALGT45JX-P2LC`, `ALGT45JX-P3LC`, `ALGT45JX-P4LC`, `ALGT53JX-P1LC`, `ALGT53JX-P2LC`, `ALGT53JX-P3LC`, `ALGT53JX-P3LB`, `ALGT53JX-P4LC` to `shopify-variant-index.json` with prices from the Shopify CSV export.
- **Risk:** `P4LC` SKUs are flagged `needs_verification` — their "See Description" color label in the export must be confirmed before presenting options.
- **Effort:** Low — data is in hand from CSV export.

### Priority 2 — Unblock Integrity® Police (5 SKUs)
- **Action:** Obtain Police Price Book pricing for `INTG44J-P2BL`, `INTG44J-PF3L`, `INTG51J-P1BL`, `INTG51J-P2BL`, `INTG51J-PF3L`. Add to index.
- **Effort:** Low once price book is received.

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