#!/usr/bin/env node
/**
 * scripts/shopify-variant-gid-overlay/overlay.mjs
 *
 * Queries the Shopify Admin GraphQL API for every Product Variant, matches
 * each one onto the generated Variant Index
 * (src/data/shopify/shopify-variant-index.json) by SKU, validates the
 * result (rejecting malformed GIDs, duplicate SKU mappings, and mappings
 * that conflict with a GID already on record), and writes a
 * `--gid-overlay`-compatible JSON file plus a data-quality report.
 *
 * This is the only script in the repo that makes a live Shopify API call —
 * every other Shopify integration foundation is deliberately adapter-gated
 * or CSV-based. It never fabricates a Variant GID: a SKU only ever appears
 * in the output overlay when Shopify Admin itself returned it.
 *
 * Usage:
 *   node scripts/shopify-variant-gid-overlay/overlay.mjs \
 *     [--index <path-to-shopify-variant-index.json>] \
 *     [--out-overlay <path-to-write-the-overlay-json>] \
 *     [--out-report <path-without-extension>] \
 *     [--api-version <shopify-admin-api-version>] \
 *     [--page-size <n>] \
 *     [--dry-run]
 *
 * Reads credentials only from the environment — SHOPIFY_STORE_DOMAIN and
 * SHOPIFY_ADMIN_ACCESS_TOKEN. See docs/architecture/SHOPIFY_VARIANT_GID_OVERLAY.md
 * for the full workflow, including how the resulting overlay file feeds
 * into `npm run shopify:ingest -- --gid-overlay <path>`.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readShopifyAdminCredentials } from './lib/env.mjs';
import { createShopifyAdminClient, ShopifyAdminApiError } from './lib/shopifyAdminClient.mjs';
import { validateShopifyVariants } from './lib/validateVariants.mjs';
import { matchVariantsToIndex } from './lib/matchVariants.mjs';
import { buildOverlayDocument } from './lib/writeOverlay.mjs';
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
    indexPath: resolve(cwd, args.index ?? 'src/data/shopify/shopify-variant-index.json'),
    outOverlayPath: resolve(cwd, args['out-overlay'] ?? 'reports/shopify-variant-gid-overlay/latest-overlay.json'),
    outReportBasePath: resolve(cwd, args['out-report'] ?? 'reports/shopify-variant-gid-overlay/latest'),
    apiVersion: args['api-version'] ?? '2024-10',
    pageSize: args['page-size'] ? Number(args['page-size']) : 250,
    dryRun: Boolean(args['dry-run']),
    generatedDate: args['generated-date'] ?? new Date().toISOString(),
  };
}

function readVariantIndex(indexPath) {
  if (!existsSync(indexPath)) return { variants: {} };
  const raw = JSON.parse(readFileSync(indexPath, 'utf8'));
  return { variants: raw.variants ?? {} };
}

function describeApiError(error, storeDomain) {
  if (error instanceof ShopifyAdminApiError) {
    const lines = [`Shopify Admin API request failed for store "${storeDomain}": ${error.message}`];
    if (error.status != null) lines.push(`  HTTP status: ${error.status}`);
    if (error.graphqlErrors) lines.push(`  GraphQL errors: ${JSON.stringify(error.graphqlErrors)}`);
    lines.push('');
    lines.push('Check SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_ACCESS_TOKEN, and that the token has the read_products scope.');
    return lines.join('\n');
  }
  return `Unexpected error while querying the Shopify Admin API: ${error.message}`;
}

/**
 * Pure(ish) orchestration: fetch, validate, match, build — no filesystem
 * writes. `overlay.mjs`'s `main()` owns deciding whether/what to write
 * (including skipping all writes for --dry-run).
 */
export async function runOverlay(options, { env = process.env, fetchImpl, sleepImpl } = {}) {
  const credentials = readShopifyAdminCredentials(env);
  if (!credentials.ok) {
    return { ok: false, reason: 'missing-credentials', message: credentials.message };
  }

  const variantIndex = readVariantIndex(options.indexPath);

  const client = createShopifyAdminClient({
    storeDomain: credentials.storeDomain,
    accessToken: credentials.accessToken,
    apiVersion: options.apiVersion,
    pageSize: options.pageSize,
    fetchImpl,
    sleepImpl,
  });

  let fetchResult;
  try {
    fetchResult = await client.fetchAllProductVariants();
  } catch (error) {
    return { ok: false, reason: 'shopify-api-error', message: describeApiError(error, credentials.storeDomain) };
  }

  const validation = validateShopifyVariants(fetchResult.variants, { existingVariantsBySku: variantIndex.variants });
  const matchResult = matchVariantsToIndex(validation.valid, variantIndex.variants, { seenSkus: validation.seenSkus });
  const overlayDocument = buildOverlayDocument(matchResult.matched);

  const report = buildReport({
    generatedAt: options.generatedDate,
    storeDomain: credentials.storeDomain,
    pageCount: fetchResult.pageCount,
    totalFetched: fetchResult.variants.length,
    withoutSku: validation.withoutSku,
    malformed: validation.malformed,
    duplicates: validation.duplicates,
    conflicting: validation.conflicting,
    matched: matchResult.matched,
    unmatchedShopifySkus: matchResult.unmatchedShopifySkus,
    missingFromShopify: matchResult.missingFromShopify,
  });

  return { ok: true, overlayDocument, report };
}

function printSummary(report) {
  const s = report.summary;
  console.log('Shopify Variant GID Overlay collection complete.');
  console.log(`  Pages fetched:                    ${s.pagesFetched}`);
  console.log(`  Variants fetched from Shopify:    ${s.totalVariantsFetched}`);
  console.log(`  Variants without a SKU (skipped): ${s.variantsWithoutSku}`);
  console.log(`  Malformed GIDs rejected:          ${s.malformedGidsRejected}`);
  console.log(`  Duplicate SKU groups rejected:    ${s.duplicateSkuGroupsRejected}`);
  console.log(`  Conflicting mappings rejected:    ${s.conflictingMappingsRejected}`);
  console.log(`  Matched to Variant Index:         ${s.matchedToVariantIndex}`);
  console.log(`  Shopify SKUs unmatched to index:  ${s.unmatchedShopifySkus}`);
  console.log(`  Variant Index SKUs missing:       ${s.missingFromShopify}`);
}

export async function main(argv = process.argv.slice(2), overrides = {}) {
  const options = resolveOptions(argv);
  const result = await runOverlay(options, overrides);

  if (!result.ok) {
    console.error(result.message);
    process.exitCode = 1;
    return;
  }

  printSummary(result.report);

  if (options.dryRun) {
    console.log('');
    console.log('Dry run: no overlay or report files were written.');
    console.log(`Re-run without --dry-run to write ${options.outOverlayPath}`);
    return;
  }

  mkdirSync(dirname(options.outOverlayPath), { recursive: true });
  writeFileSync(options.outOverlayPath, JSON.stringify(result.overlayDocument, null, 2) + '\n');

  mkdirSync(dirname(options.outReportBasePath), { recursive: true });
  writeFileSync(`${options.outReportBasePath}.json`, JSON.stringify(result.report, null, 2) + '\n');
  writeFileSync(`${options.outReportBasePath}.md`, toMarkdown(result.report));

  console.log('');
  console.log(`Overlay written to ${options.outOverlayPath}`);
  console.log(`Report written to ${options.outReportBasePath}.{json,md}`);
  console.log(`Apply it with: npm run shopify:ingest -- --gid-overlay ${options.outOverlayPath}`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error('Unexpected error running the Shopify Variant GID Overlay script:');
    console.error(error.message);
    process.exitCode = 1;
  });
}
