# Shopify Catalog CSV Ingestion

Turns a Shopify products CSV export (plus, optionally, a Shopify Files media
export) into `src/data/shopify/shopify-variant-index.json` — the file
`commerceLookupService` and `shopifyVariantResolverService` read to answer
"does this SKU map to a real, priced Shopify variant?" This is a build-time
data pipeline, not a runtime service: it runs as a Node CLI script and
writes static artifacts checked into the repo. It performs no live Shopify
API calls, no UI changes, and no checkout work.

## Why this exists

The index previously in the repo was hand-assembled over several rounds of
manual CSV auditing (see `src/docs/police-lightbar-configurator-readiness.md`
for the trail of that work). That process was error-prone in specific,
diagnosable ways this pipeline fixes:

- **Availability was hardcoded to `false`** for every variant, regardless of
  the product's actual status. Every row in the current export uses
  inventory policy `continue` ("sell when out of stock"), so the correct
  availability signal is closer to "is the product active," not "is
  inventory greater than zero." See [Availability](#availability) below.
- **Images were taken from whatever `Image Src` happened to sit on the same
  CSV row as a variant.** Shopify does not guarantee that pairing — a
  variant row's same-row image is often just the Nth product photo by
  upload order, unrelated to that specific variant. See
  [Image resolution](#image-resolution) below.
- Coverage gaps (duplicate SKUs, SKUs missing entirely, products still in
  `draft`) were tracked by hand in a Markdown doc instead of being
  regenerated automatically from the source data.

## Pipeline

```
data/shopify-exports/products_export.csv  ─┐
                                            ├─▶ scripts/shopify-catalog-ingest/ingest.mjs ─┬─▶ src/data/shopify/shopify-variant-index.json
data/shopify-exports/media_export.xlsx    ─┘                                              └─▶ reports/shopify-catalog-ingest/latest.{json,md}
```

- `data/shopify-exports/` holds the canonical input snapshots — the exact
  files this pipeline was last run against. They're committed so the
  pipeline is reproducible without needing a fresh Shopify export on hand,
  and so `npm test` has real fixtures to run the parsers against.
- `scripts/shopify-catalog-ingest/lib/` holds the parsing/build logic as
  plain, dependency-free ES modules:
  - `csv.mjs` — RFC4180 CSV parser (quoted commas, escaped quotes, embedded
    newlines — Shopify's `Body (HTML)` column needs all three).
  - `xlsx.mjs` — a zero-dependency `.xlsx` reader (ZIP central directory +
    `zlib.inflateRawSync` + a small inline-string/shared-string XML parser).
    It only supports the flat, single-sheet shape a Shopify Files export
    produces — not general spreadsheets.
  - `parseProductsExport.mjs` — groups CSV rows by `Handle`, forward-fills
    product-level columns (Shopify only populates `Title`, `Vendor`,
    `Type`, `Tags`, `Status`, etc. on a handle's first row), and splits rows
    into variants (has a `Variant SKU`), extra image rows (no SKU, no
    option value), or unusable variant rows (declares an option value but
    no SKU — see the report). Also captures the `Variant ID` column when
    the export carries one (see
    [Consuming the export's `Variant ID` column](#consuming-the-exports-variant-id-column)).
  - `parseMediaExport.mjs` — reads the Files export into lookup maps keyed
    by normalized CDN URL and by filename.
  - `buildVariantIndex.mjs` — availability/image resolution, SKU
    deduplication, and GID-preserving projection into the runtime schema.
  - `scanAppSkuReferences.mjs` — walks `src/data/configurators/*.json` and
    `src/data/products/*.json` for every `"sku"` value the app itself
    references, so the report can flag app SKUs absent from the export.
  - `report.mjs` — builds the JSON report and its Markdown rendering.
- `scripts/shopify-catalog-ingest/ingest.mjs` is the CLI entrypoint that
  wires the above together.

## Refreshing the index

1. Export products from Shopify Admin (Products → Export → CSV for all
   products) and replace `data/shopify-exports/products_export.csv`.
2. Optionally export Files (Content → Files, or a bulk-export app) and
   replace `data/shopify-exports/media_export.xlsx` (a `.csv` with the same
   columns — `ID`, `File Name`, `Link`, `Mime Type`, `Status`, ... — also
   works; pass `--media path/to/file.csv`).
3. Run:
   ```
   npm run shopify:ingest
   ```
   This reads `data/shopify-exports/products_export.csv` and
   `data/shopify-exports/media_export.xlsx` by default and writes:
   - `src/data/shopify/shopify-variant-index.json` (the runtime index)
   - `reports/shopify-catalog-ingest/latest.json` and `.md` (the data-quality report)
4. Read the printed summary (and `reports/shopify-catalog-ingest/latest.md`)
   for anything that needs follow-up: new duplicate SKUs, newly-draft
   products, missing prices/images, or app-referenced SKUs that dropped out
   of the export.
5. Commit the updated export snapshot(s), index, and report together.

All paths accept overrides — run `node scripts/shopify-catalog-ingest/ingest.mjs --help`-equivalent
by reading the flags below, or point at a one-off export without touching
the committed snapshot:

| Flag | Default | Purpose |
| --- | --- | --- |
| `--products` | `data/shopify-exports/products_export.csv` | Products CSV export |
| `--media` | `data/shopify-exports/media_export.xlsx` | Files export (`.xlsx` or `.csv`); pass `--media ""` to skip media cross-referencing |
| `--out-index` | `src/data/shopify/shopify-variant-index.json` | Runtime index output |
| `--out-report` | `reports/shopify-catalog-ingest/latest` | Report output base path (writes `.json` and `.md`) |
| `--gid-overlay` | _(none)_ | Path to a SKU → Shopify Variant GID overlay file — see [Collecting real Variant GIDs](#collecting-real-shopify-variant-gids) |
| `--app-root` | repo root | Root used to locate `src/data/configurators` / `src/data/products` for the SKU cross-reference |

## Availability

Every variant row in the current export uses inventory policy `continue`
(sell even when out of stock), so `inventoryQty` alone is not a usable
availability signal — it's `0` on essentially every row regardless of real
stock. `computeAvailability` (in `buildVariantIndex.mjs`) instead applies
Shopify's real purchasability rule:

1. Not `active` (i.e. `draft`, or status unknown) → **unavailable**.
2. Inventory not tracked (`Variant Inventory Tracker` blank) → **available**
   (Shopify doesn't gate on stock levels it isn't tracking).
3. Tracked with policy `continue` → **available** (oversell allowed).
4. Tracked with policy `deny` → available only if `inventoryQty > 0`; `null`
   (unknown) if quantity wasn't recorded at all.

This only changes the `available` field's accuracy — it does **not** affect
`canAddToCart`, which is (and remains) gated purely on having a real
`shopifyVariantId` and a price. No behavior around checkout changes because
of this fix.

## Image resolution

For each variant, in order:

1. The CSV's `Variant Image` column, when Shopify has an explicit
   variant-to-photo assignment (rare in this export — see the report's
   "explicit variant image" count).
2. Otherwise, the product's first gallery image (`Image Position` `1`) —
   what a live Shopify storefront actually falls back to for a variant with
   no dedicated photo.
3. Otherwise `null` — reported under "Variants missing an image," never
   backfilled with an unrelated image.

Every resolved image URL is cross-checked against the Files media export
(exact URL match, normalized by stripping the `?v=...` cache-busting query
string, then filename match as a fallback) and any URL not found there is
listed in the report's "Image references not found in the media export"
section — a signal the reference may be stale or the file was removed from
Shopify.

## Duplicate SKUs

A SKU can legitimately appear under more than one product handle in this
catalog (e.g. a variant cross-listed under both a standalone product and a
"work truck" bundle page). When that happens, the **first occurrence by CSV
row order** is written to the index as canonical; every occurrence (all
handles, all row numbers, all prices) is recorded in the report's
"Duplicate SKUs" section so a human can confirm the prices actually agree
(they do, for every duplicate found in the current export) or resolve a
real conflict.

## Never fabricating Shopify Variant GIDs

This pipeline never invents a Shopify Variant GID
(`gid://shopify/ProductVariant/...`). Every freshly-ingested variant gets
`shopifyVariantId: null` and `shopifyProductId: null` unless a real ID is
supplied through one of the three paths below, in this order of precedence:

1. **The export's own `Variant ID` column** — see
   [Consuming the export's `Variant ID` column](#consuming-the-exports-variant-id-column)
   below. Highest precedence: it's the freshest data straight from Shopify.
2. **`--gid-overlay`** — for exports that don't (yet) carry a `Variant ID`
   column, or to correct a bad entry.
3. **Preserved automatically across re-ingestion** — whatever was already on
   record in the previous index file, so re-running the pipeline against a
   newer export never wipes a GID nothing in this run can replace it with.

Every path validates the GID shape
(`^gid://shopify/ProductVariant/\d+$` / `^gid://shopify/Product/\d+$`) and
silently drops (and reports) anything that doesn't match — this is a
guardrail against a typo or malformed cell turning into a fake "matched" SKU.

### Consuming the export's `Variant ID` column

The current Matrixify products export populates a `Variant ID` column with
the numeric Shopify Product Variant id on every row (either a bare number
like `44556677889900`, or an already-formed
`gid://shopify/ProductVariant/44556677889900` — both are accepted).
`parseProductsExport.mjs` reads that column into `variant.variantIdRaw`;
`buildVariantIndex.mjs`'s `normalizeVariantIdToGid()` turns it into a full
GID, and `projectRuntimeIndex()` uses it directly as `shopifyVariantId` —
**no `--gid-overlay` run or Shopify Admin GraphQL call is required** when
this column is populated. A row whose `Variant ID` value doesn't parse as
numeric or as a valid GID is left `null` and reported under "Malformed
export Variant ID values," never guessed at.

**Exports without a `Variant ID` column** (older-style Shopify Admin CSV
exports, or a Matrixify template that omits it) behave exactly as before:
`shopifyVariantId` falls back to `--gid-overlay` or the previous index file,
per the precedence above. This is fully backward compatible — no flags or
export format is required to keep using the pipeline as-is.

### Preserved automatically across re-ingestion

If `--out-index` already exists (the normal case — you're refreshing an
existing index), any SKU that already carries a valid GID in that file
keeps it, as long as neither the export's `Variant ID` column nor
`--gid-overlay` supplies a new one for that SKU.

### `--gid-overlay`

For exports without a `Variant ID` column, or to apply a batch of
freshly-collected GIDs, pass a JSON file shaped:

```json
{
  "8200SM8-A-42": {
    "shopifyVariantId": "gid://shopify/ProductVariant/123456789",
    "shopifyProductId": "gid://shopify/Product/987654321"
  }
}
```

```
node scripts/shopify-catalog-ingest/ingest.mjs --gid-overlay path/to/collected-gids.json
```

Overlay entries win over whatever was already in the previous index (so you
can also use it to correct a bad entry), but lose to a `Variant ID` the
export itself supplies for that SKU. The run report shows how many entries
came from the export column, were applied from the overlay, or were
preserved/rejected.

## Collecting real Shopify Variant GIDs (exports without a `Variant ID` column)

If your export doesn't carry a populated `Variant ID` column, two ways to
get GIDs, in increasing order of scale:

**Manual, per product (small batches):** In Shopify Admin, open
Products → the product → the specific variant. The variant's numeric ID is
visible in the browser URL (`.../variants/<id>`); the GID is
`gid://shopify/ProductVariant/<id>`. The parent product's GID
(`gid://shopify/Product/<id>`) is likewise visible in the product page URL.

**Automated, full-catalog collection (recommended):**
`scripts/shopify-variant-gid-overlay/` — see
`SHOPIFY_VARIANT_GID_OVERLAY.md` — queries the Shopify Admin GraphQL API's
`productVariants` connection, pages through every variant, matches by SKU
against this pipeline's generated Variant Index, validates the result
(rejecting malformed GIDs, duplicate SKU mappings, and mappings that
conflict with a GID already on record), and writes a `--gid-overlay`-ready
JSON file:

```
npm run shopify:gid-overlay
npm run shopify:ingest -- --gid-overlay reports/shopify-variant-gid-overlay/latest-overlay.json
```

It reads Admin API credentials only from environment variables — never a
CLI flag, never hardcoded — supporting either OAuth client credentials
(`SHOPIFY_SHOP` / `SHOPIFY_CLIENT_ID` / `SHOPIFY_CLIENT_SECRET`, required
for Shopify Dev Dashboard apps) or, for backwards compatibility, a legacy
static Admin API token (`SHOPIFY_STORE_DOMAIN` /
`SHOPIFY_ADMIN_ACCESS_TOKEN`) — and fails gracefully with an explanatory
message when the required variable(s) for either mode are missing. See
`SHOPIFY_VARIANT_GID_OVERLAY.md` for the full auth setup, and its
"Admin vs. Storefront auth" section for how this differs from the
Storefront API credentials used elsewhere in this repo. It is the only
script in this repository that makes a live Shopify API call; every other
Shopify integration boundary documented
here (`SHOPIFY_CATALOG_SYNCHRONIZATION.md`,
`SHOPIFY_INVENTORY_SYNCHRONIZATION.md`, etc.) remains adapter-gated with no
live calls, and this pipeline's own CSV/media parsing and index-building
code is unchanged by it.

## What the report covers

`reports/shopify-catalog-ingest/latest.md` (and the machine-readable
`.json` alongside it) covers every category `ingest.mjs` is asked to
report on:

- Summary counts (products, variants, active vs. draft, GID coverage — split
  by export `Variant ID` column, `--gid-overlay`, and preserved-from-index).
- Malformed export `Variant ID` values that couldn't be parsed and were left `null`.
- Duplicate SKUs (which handles, which prices).
- Variants missing a price.
- Variants missing an image, and image references that don't resolve
  against the media export.
- Inactive/draft products, with their variant counts.
- Rows without usable variant data (declares an option combination but no
  SKU — can't be resolved to a sellable variant).
- App-referenced SKUs (from `src/data/configurators` and
  `src/data/products`) that don't exist anywhere in the current export —
  the same class of gap previously tracked by hand in
  `src/docs/police-lightbar-configurator-readiness.md`.

## Explicit non-goals

This pipeline does not call the Shopify Admin or Storefront API, does not
fabricate or guess Shopify Variant/Product GIDs under any circumstance,
does not implement checkout, does not modify UI components, and does not
touch anything under `src/services/shopify*` or `src/adapters/shopify*` —
it only produces the static index file those layers already know how to
read.
