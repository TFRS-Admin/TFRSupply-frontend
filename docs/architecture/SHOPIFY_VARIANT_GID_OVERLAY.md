# Shopify Variant GID Overlay

## Purpose

Collects real Shopify Variant GIDs (`gid://shopify/ProductVariant/...`) and
their parent Product GIDs (`gid://shopify/Product/...`) directly from the
Shopify Admin GraphQL API, matches them onto the generated Variant Index
(`src/data/shopify/shopify-variant-index.json`) by SKU, and writes a
validated overlay file in the exact shape
`scripts/shopify-catalog-ingest/ingest.mjs`'s `--gid-overlay` flag already
consumes (see `SHOPIFY_CATALOG_CSV_INGESTION.md`).

**Not required when the products export already carries a populated
`Variant ID` column** (the current Matrixify export format) — the CSV
ingestion pipeline reads that column directly and needs no overlay or live
API call to resolve those SKUs. This overlay remains useful for exports
without that column, and for correcting an individual SKU's GID.

This closes the last data gap between "the storefront can resolve SKUs to
catalog data" and "a Package Quote's Add to Cart control can actually add a
real Shopify variant to the cart" (see `CONFIGURATOR_EXPERIENCE.md` — the
Shopify Variant Resolver already honestly reports `canAddToCart: false`
until a real GID exists for a SKU). It is a build-time/administrative data
pipeline, not a runtime service: it runs as a Node CLI script and writes a
static JSON artifact. It performs no storefront UI change, no checkout
work, and no changes to `commerceLookupService` or
`shopifyVariantResolverService`'s public contracts.

## Why this exists

`SHOPIFY_CATALOG_CSV_INGESTION.md` previously documented Shopify Variant GID
collection as a manual step: open Shopify Admin per variant, read the
numeric ID out of the URL, hand-type it into a `--gid-overlay` JSON file.
That does not scale past a handful of variants. This pipeline automates it
with the Admin GraphQL API's `productVariants` connection, while preserving
every safety guarantee the manual process implied:

- A SKU only ever gets a GID that Shopify Admin itself returned — this
  pipeline never invents or guesses one.
- A malformed, duplicated, or conflicting mapping is rejected and reported
  rather than silently written.
- Missing credentials fail with an explanatory message, not a crash.

## Pipeline

```
SHOPIFY_STORE_DOMAIN         ─┐
SHOPIFY_ADMIN_ACCESS_TOKEN   ─┼─▶ scripts/shopify-variant-gid-overlay/overlay.mjs ─┬─▶ reports/shopify-variant-gid-overlay/latest-overlay.json
src/data/shopify/            ─┘                                                    └─▶ reports/shopify-variant-gid-overlay/latest.{json,md}
  shopify-variant-index.json
```

```
reports/shopify-variant-gid-overlay/latest-overlay.json  ─▶  npm run shopify:ingest -- --gid-overlay <path>  ─▶  src/data/shopify/shopify-variant-index.json
```

- `scripts/shopify-variant-gid-overlay/lib/env.mjs` — reads
  `SHOPIFY_STORE_DOMAIN` / `SHOPIFY_ADMIN_ACCESS_TOKEN` from `process.env`
  only (never a CLI flag, never hardcoded) and returns a graceful,
  explanatory failure when either is missing.
- `scripts/shopify-variant-gid-overlay/lib/shopifyAdminClient.mjs` — the
  only module in this repository that makes a live Shopify API call. A
  minimal, dependency-free GraphQL client that pages through every
  `ProductVariant` (`id`, `sku`, `product { id handle title }`) via
  `pageInfo.hasNextPage` / `endCursor`, with bounded retry/backoff on
  Shopify's `THROTTLED` GraphQL error.
- `scripts/shopify-variant-gid-overlay/lib/validateVariants.mjs` — rejects
  malformed GIDs, duplicate SKU mappings, and conflicting mappings (see
  [Validation](#validation) below).
- `scripts/shopify-variant-gid-overlay/lib/matchVariants.mjs` — the SKU
  matcher: joins validated Shopify variants onto the Variant Index's
  `variants` map by SKU.
- `scripts/shopify-variant-gid-overlay/lib/writeOverlay.mjs` — projects
  matched variants into the `--gid-overlay` JSON shape.
- `scripts/shopify-variant-gid-overlay/lib/report.mjs` — builds the JSON
  report and its Markdown rendering.
- `scripts/shopify-variant-gid-overlay/overlay.mjs` — the CLI entrypoint
  that wires the above together.

## Running it

1. Set `SHOPIFY_STORE_DOMAIN` (e.g. `tfrsupply.myshopify.com`) and
   `SHOPIFY_ADMIN_ACCESS_TOKEN` (an Admin API access token with the
   `read_products` scope, from a custom/private Shopify app) in your shell
   environment. Never commit these values; never pass them as CLI flags.
2. Run:
   ```
   npm run shopify:gid-overlay
   ```
   This queries Shopify Admin for every Product Variant, matches by SKU
   against `src/data/shopify/shopify-variant-index.json`, and writes:
   - `reports/shopify-variant-gid-overlay/latest-overlay.json` (the
     `--gid-overlay`-ready file)
   - `reports/shopify-variant-gid-overlay/latest.json` and `.md` (the
     validation report)
3. Read the printed summary (and `latest.md`) for anything needing
   follow-up: rejected duplicates/conflicts, SKUs still missing a GID.
4. Apply the overlay to the Variant Index:
   ```
   npm run shopify:ingest -- --gid-overlay reports/shopify-variant-gid-overlay/latest-overlay.json
   ```
   This is the existing, unmodified CSV ingestion pipeline — see
   `SHOPIFY_CATALOG_CSV_INGESTION.md`. Overlay entries win over whatever
   GID was already in the index and are preserved across future
   re-ingestion.
5. Commit the updated `src/data/shopify/shopify-variant-index.json` (and,
   if you want the collection run itself on record, the report files).

### Dry run

Pass `--dry-run` to fetch, validate, and match without writing any file —
only the console summary is produced. Credentials are still required (a
dry run still queries Shopify; it just doesn't write output):

```
npm run shopify:gid-overlay -- --dry-run
```

### Flags

| Flag | Default | Purpose |
| --- | --- | --- |
| `--index` | `src/data/shopify/shopify-variant-index.json` | The generated Variant Index to match against |
| `--out-overlay` | `reports/shopify-variant-gid-overlay/latest-overlay.json` | Where the `--gid-overlay`-ready file is written |
| `--out-report` | `reports/shopify-variant-gid-overlay/latest` | Report output base path (writes `.json` and `.md`) |
| `--api-version` | `2024-10` | Shopify Admin API version |
| `--page-size` | `250` | `productVariants(first: …)` page size |
| `--dry-run` | _(off)_ | Fetch/validate/match only; write nothing |

## Validation

Every fetched variant passes through three rejection categories before it
can become an overlay entry — each reported separately so a human fixes the
right thing:

1. **Malformed GID** — a variant or product identifier that doesn't match
   Shopify's real GID shape (`^gid://shopify/ProductVariant/\d+$` /
   `^gid://shopify/Product/\d+$`). Defense in depth against ever treating
   an unrecognized string as a variant ID.
2. **Duplicate SKU mapping** — the same SKU is attached to more than one
   distinct Shopify Variant GID in this fetch. Shopify allows a SKU to be
   reused across variants; when that happens this pipeline cannot safely
   pick a winner, so every occurrence of that SKU is rejected and reported
   for cleanup in Shopify Admin.
3. **Conflicting mapping** — the SKU already carries a real Shopify Variant
   GID in the current Variant Index, and Shopify Admin now reports a
   *different* GID for that SKU. Variant GIDs are permanent identifiers, so
   a disagreement here is surfaced for human review rather than silently
   overwritten.

A variant with no SKU at all is not an error — many Shopify variants are
never referenced by this catalog — it is simply excluded and counted under
"Variants without a SKU" in the report.

After validation, the SKU matcher additionally reports (without rejecting
anything — these are informational, not errors):

- **Shopify SKUs not found in the Variant Index** — a valid, non-conflicting
  Shopify variant whose SKU doesn't exist in
  `shopify-variant-index.json` yet (likely not ingested from a CSV export
  yet). Not written to the overlay.
- **Variant Index SKUs missing from Shopify** — a SKU in the Variant Index
  that Shopify Admin didn't return at all. Remains pending GID collection.

## Missing credentials

If `SHOPIFY_STORE_DOMAIN` or `SHOPIFY_ADMIN_ACCESS_TOKEN` is unset or blank,
the script prints exactly which variable(s) are missing and how to set
them, then exits with a non-zero status — it never throws an unhandled
exception or partially runs against invalid credentials.

## Relationship to Shopify Catalog CSV Ingestion

This pipeline produces input for, but never modifies, the CSV ingestion
pipeline (`SHOPIFY_CATALOG_CSV_INGESTION.md`). It:

- does not read or write `products_export.csv` / `media_export.xlsx`,
- writes a `--gid-overlay` file the existing `ingest.mjs --gid-overlay`
  flag reads, at a lower precedence than the export's own `Variant ID`
  column when one is present (see
  "Consuming the export's `Variant ID` column" in
  `SHOPIFY_CATALOG_CSV_INGESTION.md`).

`commerceLookupService` and `shopifyVariantResolverService`'s contracts
(`CONFIGURATOR_EXPERIENCE.md`) are also unchanged — they keep reading
`src/data/shopify/shopify-variant-index.json` exactly as before. Once real
GIDs are merged in, `resolveFromCatalog`'s existing
`Boolean(shopifyVariantId) && price != null` rule starts reporting
`canAddToCart: true` for those SKUs with no code change required.

## Explicit non-goals

This pipeline does not modify Product Detail, the Configurator UI, the Cart
UI, checkout, customer accounts, or routing. It does not call the Shopify
Storefront API, does not implement any Shopify mutation (it is read-only —
`productVariants` is a query, never a mutation), and does not fabricate or
guess a Shopify Variant/Product GID under any circumstance.
