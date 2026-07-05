import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { readShopifyAdminCredentials, SHOPIFY_STORE_DOMAIN_VAR, SHOPIFY_ADMIN_ACCESS_TOKEN_VAR } from '../scripts/shopify-variant-gid-overlay/lib/env.mjs';
import { createShopifyAdminClient, ShopifyAdminApiError, buildAdminGraphqlUrl } from '../scripts/shopify-variant-gid-overlay/lib/shopifyAdminClient.mjs';
import { validateShopifyVariants, isValidVariantGid, isValidProductGid } from '../scripts/shopify-variant-gid-overlay/lib/validateVariants.mjs';
import { matchVariantsToIndex } from '../scripts/shopify-variant-gid-overlay/lib/matchVariants.mjs';
import { buildOverlayDocument } from '../scripts/shopify-variant-gid-overlay/lib/writeOverlay.mjs';
import { buildReport, toMarkdown } from '../scripts/shopify-variant-gid-overlay/lib/report.mjs';
import { resolveOptions, runOverlay, main } from '../scripts/shopify-variant-gid-overlay/overlay.mjs';

const REPO_ROOT = join(import.meta.dirname, '..');
const tmpDirs = [];
function makeTmpDir() {
  const dir = mkdtempSync(join(tmpdir(), 'shopify-gid-overlay-test-'));
  tmpDirs.push(dir);
  return dir;
}
after(() => {
  for (const dir of tmpDirs) rmSync(dir, { recursive: true, force: true });
});

const noopSleep = async () => {};

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return { ok, status, json: async () => body };
}

describe('lib/env.mjs — readShopifyAdminCredentials', () => {
  it('fails gracefully listing both variables when neither is set', () => {
    const result = readShopifyAdminCredentials({});
    assert.equal(result.ok, false);
    assert.deepEqual(result.missing, [SHOPIFY_STORE_DOMAIN_VAR, SHOPIFY_ADMIN_ACCESS_TOKEN_VAR]);
    assert.match(result.message, /SHOPIFY_STORE_DOMAIN/);
    assert.match(result.message, /SHOPIFY_ADMIN_ACCESS_TOKEN/);
  });

  it('reports only the missing variable when one is set', () => {
    const result = readShopifyAdminCredentials({ SHOPIFY_STORE_DOMAIN: 'shop.myshopify.com' });
    assert.equal(result.ok, false);
    assert.deepEqual(result.missing, [SHOPIFY_ADMIN_ACCESS_TOKEN_VAR]);
  });

  it('treats a blank string as missing', () => {
    const result = readShopifyAdminCredentials({ SHOPIFY_STORE_DOMAIN: '   ', SHOPIFY_ADMIN_ACCESS_TOKEN: 'token' });
    assert.equal(result.ok, false);
    assert.deepEqual(result.missing, [SHOPIFY_STORE_DOMAIN_VAR]);
  });

  it('returns trimmed credentials when both are present', () => {
    const result = readShopifyAdminCredentials({ SHOPIFY_STORE_DOMAIN: ' shop.myshopify.com ', SHOPIFY_ADMIN_ACCESS_TOKEN: ' token-abc ' });
    assert.equal(result.ok, true);
    assert.equal(result.storeDomain, 'shop.myshopify.com');
    assert.equal(result.accessToken, 'token-abc');
  });
});

describe('lib/shopifyAdminClient.mjs', () => {
  it('builds the Admin GraphQL URL from the store domain and API version', () => {
    assert.equal(buildAdminGraphqlUrl({ storeDomain: 'shop.myshopify.com', apiVersion: '2024-10' }), 'https://shop.myshopify.com/admin/api/2024-10/graphql.json');
  });

  it('pages through productVariants until hasNextPage is false, sending the access token header', () => {
    const calls = [];
    const fetchImpl = async (url, req) => {
      calls.push({ url, headers: req.headers, body: JSON.parse(req.body) });
      const after = calls[calls.length - 1].body.variables.after;
      if (after == null) {
        return jsonResponse({
          data: {
            productVariants: {
              pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
              edges: [
                { node: { id: 'gid://shopify/ProductVariant/1', sku: 'SKU-1', product: { id: 'gid://shopify/Product/10', handle: 'h1', title: 'T1' } } },
              ],
            },
          },
        });
      }
      return jsonResponse({
        data: {
          productVariants: {
            pageInfo: { hasNextPage: false, endCursor: null },
            edges: [
              { node: { id: 'gid://shopify/ProductVariant/2', sku: 'SKU-2', product: { id: 'gid://shopify/Product/20', handle: 'h2', title: 'T2' } } },
            ],
          },
        },
      });
    };

    const client = createShopifyAdminClient({ storeDomain: 'shop.myshopify.com', accessToken: 'token-abc', fetchImpl, sleepImpl: noopSleep });
    return client.fetchAllProductVariants().then(({ variants, pageCount }) => {
      assert.equal(pageCount, 2);
      assert.deepEqual(variants.map((v) => v.sku), ['SKU-1', 'SKU-2']);
      assert.equal(variants[0].variantGid, 'gid://shopify/ProductVariant/1');
      assert.equal(variants[0].productGid, 'gid://shopify/Product/10');
      assert.equal(calls[0].headers['X-Shopify-Access-Token'], 'token-abc');
      assert.equal(calls[1].body.variables.after, 'cursor-1');
    });
  });

  it('retries a THROTTLED GraphQL error and eventually succeeds', async () => {
    let attempts = 0;
    const sleeps = [];
    const fetchImpl = async () => {
      attempts++;
      if (attempts < 3) {
        return jsonResponse({ errors: [{ message: 'Throttled', extensions: { code: 'THROTTLED' } }] });
      }
      return jsonResponse({ data: { productVariants: { pageInfo: { hasNextPage: false, endCursor: null }, edges: [] } } });
    };
    const client = createShopifyAdminClient({
      storeDomain: 'shop.myshopify.com',
      accessToken: 'token',
      fetchImpl,
      sleepImpl: async (ms) => { sleeps.push(ms); },
    });

    const { variants } = await client.fetchAllProductVariants();
    assert.deepEqual(variants, []);
    assert.equal(attempts, 3);
    assert.equal(sleeps.length, 2);
  });

  it('throws ShopifyAdminApiError on a non-OK HTTP response', async () => {
    const fetchImpl = async () => jsonResponse({}, { ok: false, status: 401 });
    const client = createShopifyAdminClient({ storeDomain: 'shop.myshopify.com', accessToken: 'bad-token', fetchImpl, sleepImpl: noopSleep });
    await assert.rejects(() => client.fetchAllProductVariants(), (error) => {
      assert.ok(error instanceof ShopifyAdminApiError);
      assert.equal(error.status, 401);
      return true;
    });
  });

  it('throws ShopifyAdminApiError on a non-throttled GraphQL error without retrying', async () => {
    let attempts = 0;
    const fetchImpl = async () => {
      attempts++;
      return jsonResponse({ errors: [{ message: 'Access denied for productVariants field.' }] });
    };
    const client = createShopifyAdminClient({ storeDomain: 'shop.myshopify.com', accessToken: 'token', fetchImpl, sleepImpl: noopSleep });
    await assert.rejects(() => client.fetchAllProductVariants(), ShopifyAdminApiError);
    assert.equal(attempts, 1);
  });
});

describe('lib/validateVariants.mjs', () => {
  it('validates GID shape helpers', () => {
    assert.equal(isValidVariantGid('gid://shopify/ProductVariant/123'), true);
    assert.equal(isValidVariantGid('gid://shopify/Product/123'), false);
    assert.equal(isValidProductGid('gid://shopify/Product/123'), true);
    assert.equal(isValidProductGid('123'), false);
  });

  it('excludes variants without a SKU, without rejecting them', () => {
    const { valid, withoutSku } = validateShopifyVariants([
      { variantGid: 'gid://shopify/ProductVariant/1', sku: null, productGid: 'gid://shopify/Product/1' },
      { variantGid: 'gid://shopify/ProductVariant/2', sku: '  ', productGid: 'gid://shopify/Product/1' },
    ]);
    assert.equal(valid.length, 0);
    assert.equal(withoutSku.length, 2);
  });

  it('rejects a malformed variant GID and a malformed product GID', () => {
    const { valid, malformed } = validateShopifyVariants([
      { variantGid: 'not-a-gid', sku: 'SKU-BAD-1', productGid: 'gid://shopify/Product/1' },
      { variantGid: 'gid://shopify/ProductVariant/2', sku: 'SKU-BAD-2', productGid: '12345' },
    ]);
    assert.equal(valid.length, 0);
    assert.equal(malformed.length, 2);
    assert.equal(malformed[0].sku, 'SKU-BAD-1');
    assert.equal(malformed[1].sku, 'SKU-BAD-2');
  });

  it('rejects a duplicate SKU mapped to two distinct Variant GIDs', () => {
    const { valid, duplicates } = validateShopifyVariants([
      { variantGid: 'gid://shopify/ProductVariant/1', sku: 'SKU-DUP', productGid: 'gid://shopify/Product/1', productHandle: 'h1' },
      { variantGid: 'gid://shopify/ProductVariant/2', sku: 'SKU-DUP', productGid: 'gid://shopify/Product/2', productHandle: 'h2' },
    ]);
    assert.equal(valid.length, 0);
    assert.equal(duplicates.length, 1);
    assert.equal(duplicates[0].sku, 'SKU-DUP');
    assert.equal(duplicates[0].occurrences.length, 2);
  });

  it('collapses a harmless exact-duplicate (same SKU, same GID returned twice) into one valid entry', () => {
    const { valid, duplicates } = validateShopifyVariants([
      { variantGid: 'gid://shopify/ProductVariant/1', sku: 'SKU-SAME', productGid: 'gid://shopify/Product/1' },
      { variantGid: 'gid://shopify/ProductVariant/1', sku: 'SKU-SAME', productGid: 'gid://shopify/Product/1' },
    ]);
    assert.equal(duplicates.length, 0);
    assert.equal(valid.length, 1);
  });

  it('rejects a mapping that conflicts with a GID already recorded in the Variant Index', () => {
    const { valid, conflicting } = validateShopifyVariants(
      [{ variantGid: 'gid://shopify/ProductVariant/999', sku: 'SKU-CONFLICT', productGid: 'gid://shopify/Product/1', productHandle: 'h1' }],
      { existingVariantsBySku: { 'SKU-CONFLICT': { shopifyVariantId: 'gid://shopify/ProductVariant/111' } } },
    );
    assert.equal(valid.length, 0);
    assert.equal(conflicting.length, 1);
    assert.equal(conflicting[0].existingShopifyVariantId, 'gid://shopify/ProductVariant/111');
    assert.equal(conflicting[0].fetchedShopifyVariantId, 'gid://shopify/ProductVariant/999');
  });

  it('accepts a fetched GID that matches the one already on record', () => {
    const { valid, conflicting } = validateShopifyVariants(
      [{ variantGid: 'gid://shopify/ProductVariant/111', sku: 'SKU-MATCH', productGid: 'gid://shopify/Product/1' }],
      { existingVariantsBySku: { 'SKU-MATCH': { shopifyVariantId: 'gid://shopify/ProductVariant/111' } } },
    );
    assert.equal(conflicting.length, 0);
    assert.equal(valid.length, 1);
  });

  it('passes through a well-formed, unique, non-conflicting variant', () => {
    const { valid } = validateShopifyVariants([
      { variantGid: 'gid://shopify/ProductVariant/1', sku: 'SKU-OK', productGid: 'gid://shopify/Product/1', productHandle: 'h1', productTitle: 'T1' },
    ]);
    assert.equal(valid.length, 1);
    assert.deepEqual(valid[0], { sku: 'SKU-OK', variantGid: 'gid://shopify/ProductVariant/1', productGid: 'gid://shopify/Product/1', productHandle: 'h1', productTitle: 'T1' });
  });
});

describe('lib/matchVariants.mjs', () => {
  const validVariants = [
    { sku: 'SKU-1', variantGid: 'gid://shopify/ProductVariant/1', productGid: 'gid://shopify/Product/1' },
    { sku: 'SKU-2', variantGid: 'gid://shopify/ProductVariant/2', productGid: 'gid://shopify/Product/2' },
  ];
  const indexVariantsBySku = { 'SKU-1': {}, 'SKU-3': {} };

  it('matches SKUs present in both the Shopify fetch and the Variant Index', () => {
    const { matched } = matchVariantsToIndex(validVariants, indexVariantsBySku);
    assert.deepEqual(matched.map((m) => m.sku), ['SKU-1']);
  });

  it('reports Shopify SKUs absent from the Variant Index', () => {
    const { unmatchedShopifySkus } = matchVariantsToIndex(validVariants, indexVariantsBySku);
    assert.deepEqual(unmatchedShopifySkus, ['SKU-2']);
  });

  it('reports Variant Index SKUs Shopify never returned', () => {
    const { missingFromShopify } = matchVariantsToIndex(validVariants, indexVariantsBySku);
    assert.deepEqual(missingFromShopify, ['SKU-3']);
  });

  it('does not report a rejected (not merely absent) SKU as missing from Shopify when seenSkus is provided', () => {
    // SKU-3 was actually returned by Shopify but rejected during validation (e.g. as a duplicate/conflict) —
    // seenSkus reflects that, so it must not also show up as "missing from Shopify".
    const seenSkus = new Set(['SKU-1', 'SKU-2', 'SKU-3']);
    const { missingFromShopify } = matchVariantsToIndex(validVariants, indexVariantsBySku, { seenSkus });
    assert.deepEqual(missingFromShopify, []);
  });
});

describe('lib/writeOverlay.mjs — buildOverlayDocument', () => {
  it('projects matched variants into the --gid-overlay JSON shape', () => {
    const overlay = buildOverlayDocument([
      { sku: 'SKU-1', variantGid: 'gid://shopify/ProductVariant/1', productGid: 'gid://shopify/Product/1' },
    ]);
    assert.deepEqual(overlay, { 'SKU-1': { shopifyVariantId: 'gid://shopify/ProductVariant/1', shopifyProductId: 'gid://shopify/Product/1' } });
  });

  it('never fabricates a product GID when Shopify did not return one', () => {
    const overlay = buildOverlayDocument([{ sku: 'SKU-1', variantGid: 'gid://shopify/ProductVariant/1', productGid: null }]);
    assert.equal(overlay['SKU-1'].shopifyProductId, null);
  });
});

describe('lib/report.mjs', () => {
  const report = buildReport({
    generatedAt: '2026-01-01T00:00:00.000Z',
    storeDomain: 'tfrsupply.myshopify.com',
    pageCount: 2,
    totalFetched: 5,
    withoutSku: [{}],
    malformed: [{ sku: 'SKU-BAD', variantGid: 'bad', productGid: null, reason: 'bad gid' }],
    duplicates: [{ sku: 'SKU-DUP', occurrences: [{ variantGid: 'g1', productHandle: 'h1' }, { variantGid: 'g2', productHandle: 'h2' }] }],
    conflicting: [{ sku: 'SKU-CONF', existingShopifyVariantId: 'g1', fetchedShopifyVariantId: 'g2', productHandle: 'h1' }],
    matched: [{ sku: 'SKU-OK' }],
    unmatchedShopifySkus: ['SKU-EXTRA'],
    missingFromShopify: ['SKU-MISSING'],
  });

  it('summarizes counts correctly', () => {
    assert.equal(report.summary.pagesFetched, 2);
    assert.equal(report.summary.totalVariantsFetched, 5);
    assert.equal(report.summary.matchedToVariantIndex, 1);
    assert.equal(report.summary.malformedGidsRejected, 1);
    assert.equal(report.summary.duplicateSkuGroupsRejected, 1);
    assert.equal(report.summary.conflictingMappingsRejected, 1);
  });

  it('redacts the store domain in the report metadata', () => {
    assert.notEqual(report.meta.storeDomain, 'tfrsupply.myshopify.com');
    assert.match(report.meta.storeDomain, /^tfr\*\*\*\.myshopify\.com$/);
  });

  it('renders to markdown without throwing, including all section headings', () => {
    const markdown = toMarkdown(report);
    for (const heading of [
      '## Summary', '## Malformed GIDs rejected', '## Duplicate SKU mappings rejected',
      '## Conflicting mappings rejected', '## Shopify SKUs not found in the generated Variant Index',
      '## Variant Index SKUs missing from Shopify',
    ]) {
      assert.ok(markdown.includes(heading), `expected markdown to contain "${heading}"`);
    }
  });
});

describe('overlay.mjs — resolveOptions', () => {
  it('defaults to the repo\'s canonical paths', () => {
    const options = resolveOptions([], { cwd: REPO_ROOT });
    assert.equal(options.indexPath, join(REPO_ROOT, 'src/data/shopify/shopify-variant-index.json'));
    assert.equal(options.outOverlayPath, join(REPO_ROOT, 'reports/shopify-variant-gid-overlay/latest-overlay.json'));
    assert.equal(options.outReportBasePath, join(REPO_ROOT, 'reports/shopify-variant-gid-overlay/latest'));
    assert.equal(options.apiVersion, '2024-10');
    assert.equal(options.pageSize, 250);
    assert.equal(options.dryRun, false);
  });

  it('parses --dry-run and overrides', () => {
    const options = resolveOptions(['--dry-run', '--page-size', '50', '--api-version', '2025-01'], { cwd: REPO_ROOT });
    assert.equal(options.dryRun, true);
    assert.equal(options.pageSize, 50);
    assert.equal(options.apiVersion, '2025-01');
  });
});

describe('overlay.mjs — runOverlay', () => {
  it('fails gracefully with an explanatory message when credentials are missing, without throwing', async () => {
    const options = resolveOptions(['--index', 'does-not-matter.json'], { cwd: REPO_ROOT });
    const result = await runOverlay(options, { env: {} });
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'missing-credentials');
    assert.match(result.message, /SHOPIFY_STORE_DOMAIN/);
  });

  it('surfaces a Shopify API error without throwing out of runOverlay', async () => {
    const dir = makeTmpDir();
    const indexPath = join(dir, 'index.json');
    writeFileSync(indexPath, JSON.stringify({ variants: {} }));
    const options = resolveOptions(['--index', indexPath], { cwd: REPO_ROOT });

    const result = await runOverlay(options, {
      env: { SHOPIFY_STORE_DOMAIN: 'shop.myshopify.com', SHOPIFY_ADMIN_ACCESS_TOKEN: 'token' },
      fetchImpl: async () => jsonResponse({}, { ok: false, status: 500 }),
      sleepImpl: noopSleep,
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'shopify-api-error');
    assert.match(result.message, /HTTP status: 500/);
  });

  it('fetches, validates, matches, and builds a correct overlay + report end to end', async () => {
    const dir = makeTmpDir();
    const indexPath = join(dir, 'index.json');
    writeFileSync(indexPath, JSON.stringify({
      variants: {
        'SKU-OK': {},
        'SKU-CONFLICT': { shopifyVariantId: 'gid://shopify/ProductVariant/999' },
        'SKU-MISSING-FROM-SHOPIFY': {},
      },
    }));

    const edges = [
      { node: { id: 'gid://shopify/ProductVariant/1', sku: 'SKU-OK', product: { id: 'gid://shopify/Product/1', handle: 'h-ok', title: 'OK' } } },
      { node: { id: 'gid://shopify/ProductVariant/2', sku: 'SKU-CONFLICT', product: { id: 'gid://shopify/Product/2', handle: 'h-conf', title: 'Conf' } } },
      { node: { id: 'not-a-real-gid', sku: 'SKU-MALFORMED', product: { id: 'gid://shopify/Product/3', handle: 'h-bad', title: 'Bad' } } },
      { node: { id: 'gid://shopify/ProductVariant/4', sku: 'SKU-DUP', product: { id: 'gid://shopify/Product/4', handle: 'h-dup-a', title: 'DupA' } } },
      { node: { id: 'gid://shopify/ProductVariant/5', sku: 'SKU-DUP', product: { id: 'gid://shopify/Product/5', handle: 'h-dup-b', title: 'DupB' } } },
      { node: { id: 'gid://shopify/ProductVariant/6', sku: 'SKU-NOT-IN-INDEX', product: { id: 'gid://shopify/Product/6', handle: 'h-extra', title: 'Extra' } } },
      { node: { id: 'gid://shopify/ProductVariant/7', sku: null, product: { id: 'gid://shopify/Product/7', handle: 'h-no-sku', title: 'NoSku' } } },
    ];

    const options = resolveOptions(['--index', indexPath], { cwd: REPO_ROOT });
    const result = await runOverlay(options, {
      env: { SHOPIFY_STORE_DOMAIN: 'shop.myshopify.com', SHOPIFY_ADMIN_ACCESS_TOKEN: 'token' },
      fetchImpl: async () => jsonResponse({ data: { productVariants: { pageInfo: { hasNextPage: false, endCursor: null }, edges } } }),
      sleepImpl: noopSleep,
    });

    assert.equal(result.ok, true);
    assert.deepEqual(result.overlayDocument, {
      'SKU-OK': { shopifyVariantId: 'gid://shopify/ProductVariant/1', shopifyProductId: 'gid://shopify/Product/1' },
    });

    const s = result.report.summary;
    assert.equal(s.totalVariantsFetched, 7);
    assert.equal(s.variantsWithoutSku, 1);
    assert.equal(s.malformedGidsRejected, 1);
    assert.equal(s.duplicateSkuGroupsRejected, 1);
    assert.equal(s.conflictingMappingsRejected, 1);
    assert.equal(s.matchedToVariantIndex, 1);
    assert.deepEqual(result.report.unmatchedShopifySkus, ['SKU-NOT-IN-INDEX']);
    assert.deepEqual(result.report.missingFromShopify, ['SKU-MISSING-FROM-SHOPIFY']);
  });
});

describe('overlay.mjs — main (dry-run vs. write)', () => {
  const env = { SHOPIFY_STORE_DOMAIN: 'shop.myshopify.com', SHOPIFY_ADMIN_ACCESS_TOKEN: 'token' };
  const fetchImpl = async () => jsonResponse({
    data: {
      productVariants: {
        pageInfo: { hasNextPage: false, endCursor: null },
        edges: [{ node: { id: 'gid://shopify/ProductVariant/1', sku: 'SKU-OK', product: { id: 'gid://shopify/Product/1', handle: 'h', title: 'T' } } }],
      },
    },
  });

  it('--dry-run performs the full fetch/validate/match but writes no files', async () => {
    const dir = makeTmpDir();
    const indexPath = join(dir, 'index.json');
    writeFileSync(indexPath, JSON.stringify({ variants: { 'SKU-OK': {} } }));
    const outOverlayPath = join(dir, 'overlay.json');
    const outReportBasePath = join(dir, 'report');

    await main(['--index', indexPath, '--out-overlay', outOverlayPath, '--out-report', outReportBasePath, '--dry-run'], { env, fetchImpl, sleepImpl: noopSleep });

    assert.equal(existsSync(outOverlayPath), false);
    assert.equal(existsSync(`${outReportBasePath}.json`), false);
    assert.equal(existsSync(`${outReportBasePath}.md`), false);
  });

  it('a real run writes the overlay and report files', async () => {
    const dir = makeTmpDir();
    const indexPath = join(dir, 'index.json');
    writeFileSync(indexPath, JSON.stringify({ variants: { 'SKU-OK': {} } }));
    const outOverlayPath = join(dir, 'nested', 'overlay.json');
    const outReportBasePath = join(dir, 'nested', 'report');

    await main(['--index', indexPath, '--out-overlay', outOverlayPath, '--out-report', outReportBasePath], { env, fetchImpl, sleepImpl: noopSleep });

    assert.equal(existsSync(outOverlayPath), true);
    const overlay = JSON.parse(readFileSync(outOverlayPath, 'utf8'));
    assert.deepEqual(overlay, { 'SKU-OK': { shopifyVariantId: 'gid://shopify/ProductVariant/1', shopifyProductId: 'gid://shopify/Product/1' } });

    assert.equal(existsSync(`${outReportBasePath}.json`), true);
    assert.equal(existsSync(`${outReportBasePath}.md`), true);
  });

  it('missing credentials exit gracefully (exitCode 1) without writing files or throwing', async () => {
    const dir = makeTmpDir();
    const outOverlayPath = join(dir, 'overlay.json');
    const originalExitCode = process.exitCode;
    process.exitCode = 0;

    await main(['--out-overlay', outOverlayPath], { env: {}, fetchImpl, sleepImpl: noopSleep });

    assert.equal(process.exitCode, 1);
    assert.equal(existsSync(outOverlayPath), false);
    process.exitCode = originalExitCode;
  });
});
