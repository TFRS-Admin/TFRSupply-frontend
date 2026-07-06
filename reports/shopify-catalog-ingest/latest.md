# Shopify Catalog Ingestion Report

**Generated:** 2026-07-06T13:20:13.072Z  
**Products source:** data/shopify-exports/products_export.csv  
**Media source:** data/shopify-exports/media_export.xlsx

## Summary

| Metric | Value |
| --- | --- |
| CSV rows parsed | 1877 |
| Products | 115 |
| Active products | 60 |
| Draft / non-active products | 55 |
| Variant rows parsed | 1851 |
| Unique SKUs in index | 1839 |
| Duplicate SKU groups | 12 |
| Variants missing price | 0 |
| Variants missing image | 273 |
| Variants with explicit variant image | 58 |
| Variants using product fallback image | 1508 |
| Image references not found in media export | 0 |
| Media export files available | 547 |
| Extra image-only rows skipped | 24 |
| Rows without usable variant data | 2 |
| App-referenced SKUs (configurators + products) | 66 |
| App-referenced SKUs not found in this export | 18 |
| Variants with a real Shopify Variant GID | 0 |
| Variants pending GID collection | 1839 |

## Duplicate SKUs

Same SKU appears under more than one product handle. Prices agree in every case observed so far; the first occurrence (by CSV row order) is written to the index as canonical.

| SKU | Canonical handle | Also appears under |
| --- | --- | --- |
| RLNT48J-AMBR2N4 | reliant-s2-light-bar-work-truck | reliant-light-bar-48 |
| RLNT48J-AMBR2H4 | reliant-s2-light-bar-work-truck | reliant-light-bar-48 |
| RLNT48J-AMBR2F4 | reliant-s2-light-bar-work-truck | reliant-light-bar-48 |
| RLNT48J-ABRH4 | reliant-s2-light-bar-work-truck | reliant-light-bar-48 |
| RLNT48J-ABWH4 | reliant-s2-light-bar-work-truck | reliant-light-bar-48 |
| RLNT48J-ABWF4 | reliant-s2-light-bar-work-truck | reliant-light-bar-48 |
| RLNT48J-AGWH4 | reliant-s2-light-bar-work-truck | reliant-light-bar-48 |
| NVG45Z-MUNI1HC6 | navigator-light-bar-work-truck | navigator-light-bar-45 |
| INTG51J-P1BL | integrity-light-bar-51 | integrity-light-bar-44 |
| INTG51J-P2BL | integrity-light-bar-51 | integrity-light-bar-44 |
| INTG51J-PF3L | integrity-light-bar-51 | integrity-light-bar-44 |
| INTG51J-F2H | integrity-light-bar-51 | integrity-light-bar-44 |

## Variants missing a price

_None._

## Variants missing an image

| SKU | Product handle | Product title | Status |
| --- | --- | --- | --- |
| 416900BZ-B | quadraflare-accessories | Quadraflare Accessories | draft |
| 416900-BZB | quadraflare-accessories | Quadraflare Accessories | draft |
| 416900BZ-C | quadraflare-accessories | Quadraflare Accessories | draft |
| 416900BZ-W | quadraflare-accessories | Quadraflare Accessories | draft |
| 416900-VHB | quadraflare-accessories | Quadraflare Accessories | draft |
| 416900XZ-BW | quadraflare-accessories | Quadraflare Accessories | draft |
| 416900XZ-RW | quadraflare-accessories | Quadraflare Accessories | draft |
| 416900Z-BA | quadraflare-accessories | Quadraflare Accessories | draft |
| 416900Z-RW | quadraflare-accessories | Quadraflare Accessories | draft |
| 416910Z-W | quadraflare-accessories | Quadraflare Accessories | draft |
| 416912-A | quadraflare-accessories | Quadraflare Accessories | draft |
| 416912-B | quadraflare-accessories | Quadraflare Accessories | draft |
| 416912-R | quadraflare-accessories | Quadraflare Accessories | draft |
| 416912-W | quadraflare-accessories | Quadraflare Accessories | draft |
| 416918-AGW | quadraflare-accessories | Quadraflare Accessories | draft |
| 416918-BAW | quadraflare-accessories | Quadraflare Accessories | draft |
| 416918-RAW | quadraflare-accessories | Quadraflare Accessories | draft |
| 416918-RBA | quadraflare-accessories | Quadraflare Accessories | draft |
| 416918-RBW | quadraflare-accessories | Quadraflare Accessories | draft |
| 416918-RBW-SMK | quadraflare-accessories | Quadraflare Accessories | draft |
| HKB-BCS21 | hook-brackets | Hook Brackets | draft |
| HKB-BLZR24 | hook-brackets | Hook Brackets | draft |
| HKB-COL15 | hook-brackets | Hook Brackets | draft |
| HKB-COR20 | hook-brackets | Hook Brackets | draft |
| HKB-DUR11 | hook-brackets | Hook Brackets | draft |
| HKB-DUR11B-HP | hook-brackets | Hook Brackets | draft |
| HKB-DUR11-HP | hook-brackets | Hook Brackets | draft |
| HKB-DURR | hook-brackets | Hook Brackets | draft |
| HKB-EQX23 | hook-brackets | Hook Brackets | draft |
| HKB-ESC20 | hook-brackets | Hook Brackets | draft |
| HKB-EXD22 | hook-brackets | Hook Brackets | draft |
| HKB-FHD7 | hook-brackets | Hook Brackets | draft |
| HKB-FNTR | hook-brackets | Hook Brackets | draft |
| HKB-FPIU20-44-HP | hook-brackets | Hook Brackets | draft |
| HKB-FPIU20-HP | hook-brackets | Hook Brackets | draft |
| HKB-FPIU20-LONG | hook-brackets | Hook Brackets | draft |
| HKB-FPIU25-HP-SS | hook-brackets | Hook Brackets | draft |
| HKB-FRD15-44-HP | hook-brackets | Hook Brackets | draft |
| HKB-FRD15-HP | hook-brackets | Hook Brackets | draft |
| HKB-FRD9 | hook-brackets | Hook Brackets | draft |
| HKB-FREIGHT-M2 | hook-brackets | Hook Brackets | draft |
| HKB-GUTR | hook-brackets | Hook Brackets | draft |
| HKB-KCK25 | hook-brackets | Hook Brackets | draft |
| HKB-LPCHGR11-HP | hook-brackets | Hook Brackets | draft |
| HKB-MAL7 | hook-brackets | Hook Brackets | draft |
| HKB-MAV22 | hook-brackets | Hook Brackets | draft |
| HKB-MME21 | hook-brackets | Hook Brackets | draft |
| HKB-PTH22 | hook-brackets | Hook Brackets | draft |
| HKB-RAM19 | hook-brackets | Hook Brackets | draft |
| HKB-RAV23 | hook-brackets | Hook Brackets | draft |
| HKB-RAV25RR | hook-brackets | Hook Brackets | draft |
| HKB-RNG19 | hook-brackets | Hook Brackets | draft |
| HKB-RNGR24 | hook-brackets | Hook Brackets | draft |
| HKB-ROG23 | hook-brackets | Hook Brackets | draft |
| HKB-SAV | hook-brackets | Hook Brackets | draft |
| HKB-SIL17 | hook-brackets | Hook Brackets | draft |
| HKB-TAC24 | hook-brackets | Hook Brackets | draft |
| HKB-TAH21-44-HP | hook-brackets | Hook Brackets | draft |
| HKB-TAH21-HP | hook-brackets | Hook Brackets | draft |
| HKB-THX23 | hook-brackets | Hook Brackets | draft |
| HKB-TRAV22 | hook-brackets | Hook Brackets | draft |
| HKB-TTN23 | hook-brackets | Hook Brackets | draft |
| HKB-UNH1 | hook-brackets | Hook Brackets | draft |
| HKB-UNH2 | hook-brackets | Hook Brackets | draft |
| HKB-UNH3 | hook-brackets | Hook Brackets | draft |
| HKB-UNH4 | hook-brackets | Hook Brackets | draft |
| HKB-UNH5 | hook-brackets | Hook Brackets | draft |
| HKB-UNH6 | hook-brackets | Hook Brackets | draft |
| CNTRLR-4B | switches-controls | Switches & Controls | draft |
| CNTRLR-6B | switches-controls | Switches & Controls | draft |
| CNTRLR-9B | switches-controls | Switches & Controls | draft |
| SW1 | switches-controls | Switches & Controls | draft |
| SW2 | switches-controls | Switches & Controls | draft |
| SW200-B | switches-controls | Switches & Controls | draft |
| SW30 | switches-controls | Switches & Controls | draft |
| SW300-B | switches-controls | Switches & Controls | draft |
| SW400SS-B | switches-controls | Switches & Controls | draft |
| MPSW6-A | micropulse-wide-angle-6 | MicroPulse Wide Angle 6 | active |
| MPSW6-B | micropulse-wide-angle-6 | MicroPulse Wide Angle 6 | active |
| MPSW6-BW | micropulse-wide-angle-6 | MicroPulse Wide Angle 6 | active |
| MPSW6-R | micropulse-wide-angle-6 | MicroPulse Wide Angle 6 | active |
| MPSW6-RB | micropulse-wide-angle-6 | MicroPulse Wide Angle 6 | active |
| LF12ESB-LED | littlite-gooseneck-lamps | Littlite Gooseneck Lamps | draft |
| LF12ES-LED | littlite-gooseneck-lamps | Littlite Gooseneck Lamps | draft |
| LF12TSB-LED | littlite-gooseneck-lamps | Littlite Gooseneck Lamps | draft |
| LF12TS-LED | littlite-gooseneck-lamps | Littlite Gooseneck Lamps | draft |
| LF18ER-LED-UV | littlite-gooseneck-lamps | Littlite Gooseneck Lamps | draft |
| LF18ES-LED | littlite-gooseneck-lamps | Littlite Gooseneck Lamps | draft |
| LF18TSB-LED | littlite-gooseneck-lamps | Littlite Gooseneck Lamps | draft |
| LF18TSB-LED-BLUE | littlite-gooseneck-lamps | Littlite Gooseneck Lamps | draft |
| LF18TS-LED | littlite-gooseneck-lamps | Littlite Gooseneck Lamps | draft |
| AD26-8-M44-Z | intercom-systems | Intercom Systems | active |
| AD26C-1-Z | intercom-systems | Intercom Systems | active |
| AD26C-7-Z | intercom-systems | Intercom Systems | active |
| AD26C-Z | intercom-systems | Intercom Systems | active |
| AD26D-1-Z | intercom-systems | Intercom Systems | active |
| AD26D-Z | intercom-systems | Intercom Systems | active |
| AD26-Z | intercom-systems | Intercom Systems | active |
| '650202 | intelli-flash-controllers | Intelli-Flash Controllers | active |
| '650302 | intelli-flash-controllers | Intelli-Flash Controllers | active |
| '670132 | intelli-flash-controllers | Intelli-Flash Controllers | active |
| 200B-SHORT | spire-accessories-hardware | Spire® Accessories & Hardware | draft |
| 200B-TALL | spire-accessories-hardware | Spire® Accessories & Hardware | draft |
| 200DC-SHORT | spire-accessories-hardware | Spire® Accessories & Hardware | draft |
| 200DC-TALL | spire-accessories-hardware | Spire® Accessories & Hardware | draft |
| 200767-95 | spire-accessories-hardware | Spire® Accessories & Hardware | draft |
| 200POLY-MP10 | spire-accessories-hardware | Spire® Accessories & Hardware | draft |
| 205582-95 | spire-accessories-hardware | Spire® Accessories & Hardware | draft |
| 100TR-A | spire-accessories-hardware | Spire® Accessories & Hardware | draft |
| 100TR-B | spire-accessories-hardware | Spire® Accessories & Hardware | draft |
| 100TR-G | spire-accessories-hardware | Spire® Accessories & Hardware | draft |
| 100TR-R | spire-accessories-hardware | Spire® Accessories & Hardware | draft |
| 100TR-W | spire-accessories-hardware | Spire® Accessories & Hardware | draft |
| 200SC-A | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SC-B | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SC-G | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SC-R | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SC-W | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SD-A | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SD-B | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SD-G | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SD-R | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SD-W | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SDDC-A | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SDU-A | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SM-A | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SM-B | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SM-G | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SM-R | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SM-W | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SP-A | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SP-B | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SP-G | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SP-R | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SP-W | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SS-A | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SS-B | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SS-G | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SS-R | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 200SS-W | spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft |
| 100TC-A | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TC-B | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TC-G | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TC-R | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TC-W | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TD-A | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TD-B | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TD-G | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TD-R | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TD-W | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TDDC-A | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TM-A | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TM-B | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TM-G | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TM-R | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TM-W | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TP-A | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TP-B | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TP-G | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TP-R | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TP-W | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TS-A | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TS-B | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TS-G | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TS-R | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100TS-W | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100SR-A | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100SR-B | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100SR-G | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100SR-R | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 100SR-W | spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft |
| 210960-46 | beacon-mounting-bars | Beacon Mounting Bars | draft |
| 210960-54 | beacon-mounting-bars | Beacon Mounting Bars | draft |
| 210960-65 | beacon-mounting-bars | Beacon Mounting Bars | draft |
| 210961SSG | beacon-mounting-bars | Beacon Mounting Bars | draft |
| 210962SSG | beacon-mounting-bars | Beacon Mounting Bars | draft |
| 210924SSG | beacon-mounting-bars | Beacon Mounting Bars | draft |
| 220SC-AB | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SC-AG | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SC-AR | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SC-AW | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SD-AB | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SD-AG | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SD-AR | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SD-AW | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SM-AB | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SM-AG | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SM-AR | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SM-AW | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SP-AB | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SP-AG | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SP-AR | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SP-AW | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SS-AB | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SS-AG | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SS-AR | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 220SS-AW | spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft |
| 200TC-A | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TC-B | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TC-G | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TC-R | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TC-W | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TD-A | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TD-B | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TD-G | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TD-R | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TD-W | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TDDC-A | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TM-A | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TM-B | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TM-G | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TM-R | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TM-W | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TP-A | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TP-B | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TP-G | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TP-R | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TP-W | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TS-A | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TS-B | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TS-G | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TS-R | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 200TS-W | spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft |
| 100SC-A | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SC-B | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SC-G | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SC-R | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SC-W | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SD-A | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SD-B | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SD-G | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SD-R | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SD-W | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SDDC-A | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SDU-A | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SM-A | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SM-B | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SM-G | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SM-R | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SM-W | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SP-A | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SP-B | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SP-G | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SP-R | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SP-W | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SS-A | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SS-B | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SS-G | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SS-R | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| 100SS-W | spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft |
| SSP2000B | ssp2000b-smart-siren-platinum | SSP2000B Smart Siren Platinum | active |
| FC504K | commander-accessories | Commander® Accessories & Mount Kits | draft |
| KR-4-SB-R | commander-accessories | Commander® Accessories & Mount Kits | draft |
| LT100 | commander-accessories | Commander® Accessories & Mount Kits | draft |
| LT101 | commander-accessories | Commander® Accessories & Mount Kits | draft |
| LTP570-NW0 | commander-accessories | Commander® Accessories & Mount Kits | draft |
| LTP580-NW0-A | commander-accessories | Commander® Accessories & Mount Kits | draft |
| LT-S102-A | commander-accessories | Commander® Accessories & Mount Kits | draft |
| COMFLEX-9 | commander-strip-compartment-light | Commander® Strip Compartment Light | draft |
| COMFLEX-18 | commander-strip-compartment-light | Commander® Strip Compartment Light | draft |
| COMFLEX-27 | commander-strip-compartment-light | Commander® Strip Compartment Light | draft |
| COMFLEX-36 | commander-strip-compartment-light | Commander® Strip Compartment Light | draft |
| COMFLEX-45 | commander-strip-compartment-light | Commander® Strip Compartment Light | draft |
| COMFLEX-54 | commander-strip-compartment-light | Commander® Strip Compartment Light | draft |
| COMFLEX-63 | commander-strip-compartment-light | Commander® Strip Compartment Light | draft |
| COMINT5-W | commander-strip-compartment-light | Commander® Strip Compartment Light | draft |
| COMSTLS18C-W | commander-strip-compartment-light | Commander® Strip Compartment Light | draft |
| COMSTL-TANK | commander-strip-compartment-light | Commander® Strip Compartment Light | draft |
| COMSTLF-A | commander-strip-compartment-light | Commander® Strip Compartment Light | draft |
| COMSTL-DUALBKT45 | commander-strip-compartment-light | Commander® Strip Compartment Light | draft |
| COMSTL-BKT | commander-strip-compartment-light | Commander® Strip Compartment Light | draft |
| COM7K-900 | com7-com9-scene-light | COM7/COM9 LED Scene Light | draft |
| VSLR46-AMWH | vision-slr-light-bar-work-truck | Vision SLR® Light Bar — Work Truck | draft |

## Image references not found in the media export

These SKUs reference an image URL that does not appear (by URL or filename) in the Files media export — possibly stale or off-platform.

_None._

## Inactive / draft products

| Handle | Title | Status | Variant count |
| --- | --- | --- | --- |
| signalmaster-accessories | SignalMaster Accessories | draft | 15 |
| quadraflare-accessories | Quadraflare Accessories | draft | 20 |
| mounting-brackets-hardware | Mounting Brackets & Hardware | draft | 87 |
| micropulse-mounts-brackets | MicroPulse Mounts & Brackets | draft | 97 |
| hook-brackets | Hook Brackets | draft | 48 |
| siren-speaker-mounting-brackets | Siren Speaker Mounting Brackets | draft | 46 |
| worklights | Worklights | draft | 11 |
| trailer-lights | Trailer Lights | draft | 37 |
| switches-controls | Switches & Controls | draft | 9 |
| signalmaster-brackets | SignalMaster Brackets | draft | 4 |
| running-board-brackets | Running Board Brackets | draft | 7 |
| quadraflare-beacons | Quadraflare Beacons | draft | 92 |
| other-miscellaneous | Other Miscellaneous | draft | 45 |
| other-micropulse | Other MicroPulse | draft | 11 |
| opticom-accessories | Opticom Accessories | draft | 2 |
| message-boards | Message Boards | draft | 2 |
| littlite-gooseneck-lamps | Littlite Gooseneck Lamps | draft | 9 |
| elsd-d-pillar-shrouds | MicroPulse® Ultra D-Pillar Lights | draft | 8 |
| cables-wiring | Cables & Wiring | draft | 8 |
| vehicle-warning-accessories-hardware | Vehicle Warning Accessories & Hardware | draft | 32 |
| spire-accessories-hardware | Spire® Accessories & Hardware | draft | 12 |
| spire-200-plus-short-led-beacon | Spire® 200 Plus Short LED Beacon | draft | 27 |
| spire-100-standard-tall-led-beacon | Spire® 100 Standard Tall LED Beacon | draft | 31 |
| beacon-mounting-bars | Beacon Mounting Bars | draft | 6 |
| spire-220-plus-tall-led-beacon | Spire® 220 Plus Tall LED Beacon | draft | 20 |
| spire-220-plus-short-led-beacon | Spire® 220 Plus Short LED Beacon | draft | 20 |
| spire-200-standard-tall-led-beacon | Spire® 200 Standard Tall LED Beacon | draft | 26 |
| spire-100-standard-short-led-beacon | Spire® 100 Standard Short LED Beacon | draft | 27 |
| duraforce-accessories-hardware | DuraForce™ Accessories & Hardware | draft | 27 |
| littlite-gooseneck-lamp | Littlite® LED Gooseneck Lamp | draft | 1 |
| vehicle-harness-kits | Vehicle Harness Kits | draft | 6 |
| siren-accessories | Siren Accessories | draft | 17 |
| rumbler-mounting-brackets | Rumbler® Mounting Brackets | draft | 34 |
| stinger-accessories | Stinger® Accessories & Consumables | draft | 9 |
| stinger-replacement-kits | Stinger® Replacement Spike Kits | draft | 9 |
| stinger-trainer-system | Stinger® Trainer System | draft | 3 |
| nightspire-accessories | NightSpire® Accessories | draft | 4 |
| nightspire-searchlight | NightSpire® Searchlight | draft | 4 |
| commander-accessories | Commander® Accessories & Mount Kits | draft | 7 |
| commander-strip-compartment-light | Commander® Strip Compartment Light | draft | 13 |
| com7-com9-scene-light | COM7/COM9 LED Scene Light | draft | 1 |
| commander-sb-scene-light | Commander® SB Series Scene Light | draft | 4 |
| commander-m-scene-light | Commander® M Series Scene Light | draft | 5 |
| commander-lc-scene-light | Commander® LC Series Scene Light | draft | 4 |
| commander-plus-scene-light | Commander® Plus & Plus-S Series Scene Light | draft | 6 |
| commander-scene-light | Commander® Series Scene Light | draft | 24 |
| vision-slr-light-bar-work-truck | Vision SLR® Light Bar — Work Truck | draft | 1 |
| reliant-s2-light-bar-work-truck | Reliant® S2 Light Bar — Work Truck | draft | 10 |
| navigator-light-bar-work-truck | Navigator® Light Bar — Work Truck | draft | 4 |
| allegiant-light-bar-work-truck | Allegiant® Light Bar — Work Truck | draft | 5 |
| valor-light-bar-work-truck | Valor® Light Bar — Work Truck | draft | 4 |
| integrity-light-bar-work-truck | Integrity® Light Bar — Work Truck | draft | 4 |
| navigator-light-bar-87 | Navigator® Light Bar - 87" | draft | 3 |
| navigator-light-bar-73 | Navigator® Light Bar - 73" | draft | 7 |
| allegiant-light-bar-80 | Allegiant® Max Discrete Light Bar - 80" (Tow Configuration) | draft | 4 |

## Rows without usable variant data

CSV rows that declare a variant option combination but carry no Variant SKU, so they cannot be resolved to a sellable variant.

| Product handle | CSV row | Option values | Reason |
| --- | --- | --- | --- |
| vision-slr-light-bar-work-truck | 1632 | Vision SLR / 46" / Amber | Row declares a variant option value but has no Variant SKU |
| navigator-light-bar-work-truck | 1644 | Default Title / 45" / Amber | Row declares a variant option value but has no Variant SKU |

## App-referenced SKUs not found in this export

SKUs referenced by configurator/product JSON in `src/data/` that do not exist anywhere in the current Shopify export — these will resolve as `unmatched` at runtime.

- `NAV-BRKT-MAG`
- `NAV-BRKT-STD`
- `NAV-CABLE-10`
- `NAV-CABLE-14`
- `NAV-CTRL-SM4`
- `NVG-BRKT`
- `NVG-HARNESS-D`
- `NVLM-HARNESS`
- `NVLM-SUCTION`
- `NVLM10-A`
- `NVLM10-BW`
- `NVLM10-RBW`
- `NVLM18-A`
- `NVLM18-BW`
- `NVLM18-RBW`
- `NVLM25-A`
- `NVLM25-BW`
- `NVLM25-RBW`

## Shopify Variant GIDs

Shopify Variant IDs are read directly from the export's Variant ID column when present. Exports without that column fall back to --gid-overlay or whatever was already on record — see docs/architecture/SHOPIFY_CATALOG_CSV_INGESTION.md.

| Metric | Value |
| --- | --- |
| From export Variant ID column | 0 |
| Applied from --gid-overlay | 0 |
| Preserved from previous index | 0 |
| Rejected overlay entries (invalid GID format) | 0 |
| Malformed export Variant ID values (ignored) | 0 |
