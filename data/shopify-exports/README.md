# Shopify export snapshots

Canonical input snapshots for `scripts/shopify-catalog-ingest/ingest.mjs`.
Committed so the ingestion pipeline is reproducible and has real fixtures to
test against, without needing a fresh Shopify export on hand.

- `products_export.csv` — Shopify Admin → Products → Export → CSV for all products.
- `media_export.xlsx` — Shopify Files export (bulk export app); a `.csv` with the same columns also works.

To refresh, replace these files with a fresh export and run
`npm run shopify:ingest`. See
`docs/architecture/SHOPIFY_CATALOG_CSV_INGESTION.md` for the full workflow.
