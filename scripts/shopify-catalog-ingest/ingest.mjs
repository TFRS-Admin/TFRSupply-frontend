#!/usr/bin/env node
/**
 * scripts/shopify-catalog-ingest/ingest.mjs
 *
 * Regenerates src/data/shopify/shopify-variant-index.json from a Shopify
 * products CSV export (and, optionally, a Shopify Files media export used
 * to validate/cross-reference product images), and writes a data-quality
 * report alongside it.
 *
 * Usage:
 *   node scripts/shopify-catalog-ingest/ingest.mjs \
 *     [--products <path-to-products-export.csv>] \
 *     [--media <path-to-media-export.xlsx-or-.csv>] \
 *     [--out-index <path-to-variant-index.json>] \
 *     [--out-report <path-without-extension>] \
 *     [--gid-overlay <path-to-sku-to-gid.json>] \
 *     [--app-root <repo-root-for-sku-cross-reference>]
 *
 * See docs/architecture/SHOPIFY_CATALOG_CSV_INGESTION.md for the full
 * workflow, including how to collect real Shopify Variant GIDs and merge
 * them in via --gid-overlay without needing to re-run this from scratch.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseProductsExport } from './lib/parseProductsExport.mjs';
import { parseMediaExport } from './lib/parseMediaExport.mjs';
import { buildCatalogEntries, projectRuntimeIndex } from './lib/buildVariantIndex.mjs';
import { scanAppSkuReferences } from './lib/scanAppSkuReferences.mjs';
import { buildReport, toMarkdown } from './lib/report.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    args[key] = value;
  }
  return args;
}

export function resolveOptions(argv, { cwd = REPO_ROOT } = {}) {
  const args = parseArgs(argv);
  return {
    productsPath: resolve(cwd, args.products ?? 'data/shopify-exports/products_export.csv'),
    mediaPath: args.media === undefined ? resolve(cwd, 'data/shopify-exports/media_export.xlsx') : args.media === '' ? null : resolve(cwd, args.media),
    outIndexPath: resolve(cwd, args['out-index'] ?? 'src/data/shopify/shopify-variant-index.json'),
    outReportBasePath: resolve(cwd, args['out-report'] ?? 'reports/shopify-catalog-ingest/latest'),
    gidOverlayPath: args['gid-overlay'] ? resolve(cwd, args['gid-overlay']) : null,
    appRoot: resolve(cwd, args['app-root'] ?? '.'),
    generatedDate: args['generated-date'] ?? new Date().toISOString().slice(0, 10),
  };
}

export function runIngest(options) {
  const csvText = readFileSync(options.productsPath, 'utf8');
  const { products, variants, imageOnlyRowCount, unusableVariantRows, totalRows } = parseProductsExport(csvText);

  let mediaIndex = { byUrl: new Map(), byFilename: new Map(), count: 0 };
  if (options.mediaPath) {
    const format = options.mediaPath.toLowerCase().endsWith('.csv') ? 'csv' : 'xlsx';
    mediaIndex = parseMediaExport(readFileSync(options.mediaPath), format);
  }

  const { entries, duplicates } = buildCatalogEntries({ products, variants, mediaIndex });

  const { indexDocument, gidStats } = projectRuntimeIndex(entries, {
    sourceLabel: `Shopify products export — ${options.productsPath.split('/').pop()}`,
    generatedDate: options.generatedDate,
    existingIndexPath: options.outIndexPath,
    gidOverlayPath: options.gidOverlayPath,
  });

  const appSkuReferences = scanAppSkuReferences([
    resolve(options.appRoot, 'src/data/configurators'),
    resolve(options.appRoot, 'src/data/products'),
  ]);

  const report = buildReport({
    sourceLabel: relative(REPO_ROOT, options.productsPath),
    mediaSourceLabel: options.mediaPath ? relative(REPO_ROOT, options.mediaPath) : '(none provided)',
    generatedAt: new Date().toISOString(),
    totalRows,
    products,
    variants,
    entries,
    duplicates,
    unusableVariantRows,
    imageOnlyRowCount,
    mediaIndex,
    appSkuReferences,
    gidStats,
  });

  return { indexDocument, report };
}

function writeOutputs(options, { indexDocument, report }) {
  mkdirSync(dirname(options.outIndexPath), { recursive: true });
  writeFileSync(options.outIndexPath, JSON.stringify(indexDocument));

  mkdirSync(dirname(options.outReportBasePath), { recursive: true });
  writeFileSync(`${options.outReportBasePath}.json`, JSON.stringify(report, null, 2) + '\n');
  writeFileSync(`${options.outReportBasePath}.md`, toMarkdown(report));
}

function printSummary(report) {
  const s = report.summary;
  console.log('Shopify catalog ingestion complete.');
  console.log(`  Products parsed:            ${s.totalProducts} (${s.activeProducts} active / ${s.draftOrOtherProducts} draft-or-other)`);
  console.log(`  Unique SKUs in index:       ${s.uniqueVariantsInIndex}`);
  console.log(`  Duplicate SKU groups:       ${s.duplicateSkuGroups}`);
  console.log(`  Variants missing price:     ${s.variantsMissingPrice}`);
  console.log(`  Variants missing image:     ${s.variantsMissingImage}`);
  console.log(`  Rows without usable data:   ${s.rowsWithoutUsableVariantData}`);
  console.log(`  App SKUs unmatched:         ${s.appReferencedSkusUnmatched} / ${s.appReferencedSkuCount}`);
  console.log(`  Variants with a real GID:   ${s.variantsWithShopifyVariantGid} / ${s.uniqueVariantsInIndex}`);
  if (report.gid.rejectedOverlayEntries.length > 0) {
    console.warn(`  WARNING: ${report.gid.rejectedOverlayEntries.length} --gid-overlay entries were rejected (invalid GID format) — see report for details.`);
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const options = resolveOptions(process.argv.slice(2));
  const result = runIngest(options);
  writeOutputs(options, result);
  printSummary(result.report);
}
