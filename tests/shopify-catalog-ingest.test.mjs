import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { parseCsv } from '../scripts/shopify-catalog-ingest/lib/csv.mjs';
import { readXlsxSheet } from '../scripts/shopify-catalog-ingest/lib/xlsx.mjs';
import { parseProductsExport } from '../scripts/shopify-catalog-ingest/lib/parseProductsExport.mjs';
import { parseMediaExport, normalizeMediaUrl, filenameFromUrl, findMediaMatch } from '../scripts/shopify-catalog-ingest/lib/parseMediaExport.mjs';
import {
  computeAvailability,
  resolveVariantImage,
  buildCatalogEntries,
  projectRuntimeIndex,
} from '../scripts/shopify-catalog-ingest/lib/buildVariantIndex.mjs';
import { scanAppSkuReferences } from '../scripts/shopify-catalog-ingest/lib/scanAppSkuReferences.mjs';
import { buildReport, toMarkdown } from '../scripts/shopify-catalog-ingest/lib/report.mjs';
import { resolveOptions, runIngest } from '../scripts/shopify-catalog-ingest/ingest.mjs';

const REPO_ROOT = join(import.meta.dirname, '..');
const tmpDirs = [];
function makeTmpDir() {
  const dir = mkdtempSync(join(tmpdir(), 'shopify-ingest-test-'));
  tmpDirs.push(dir);
  return dir;
}
after(() => {
  for (const dir of tmpDirs) rmSync(dir, { recursive: true, force: true });
});

function csvField(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}
function toCsv(headers, rows) {
  const lines = [headers.map(csvField).join(',')];
  for (const row of rows) lines.push(headers.map((h) => csvField(row[h])).join(','));
  return lines.join('\r\n');
}

const PRODUCT_HEADERS = [
  'Handle', 'Title', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value',
  'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
  'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price', 'Variant Barcode',
  'Image Src', 'Image Position', 'Image Alt Text', 'Variant Image', 'Status',
];

describe('lib/csv.mjs', () => {
  it('parses a simple CSV into header-keyed rows', () => {
    const { headers, rows } = parseCsv('a,b,c\r\n1,2,3\r\n');
    assert.deepEqual(headers, ['a', 'b', 'c']);
    assert.deepEqual(rows, [{ a: '1', b: '2', c: '3' }]);
  });

  it('handles quoted fields containing commas, escaped quotes, and embedded newlines', () => {
    const text = 'Handle,Body\r\n"h1","<p>Has, a comma and a ""quote"" and\na newline</p>"\r\n';
    const { rows } = parseCsv(text);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].Handle, 'h1');
    assert.equal(rows[0].Body, '<p>Has, a comma and a "quote" and\na newline</p>');
  });

  it('fills missing trailing fields with empty string', () => {
    const { rows } = parseCsv('a,b,c\r\n1,2\r\n');
    assert.deepEqual(rows[0], { a: '1', b: '2', c: '' });
  });

  it('ignores a trailing blank line', () => {
    const { rows } = parseCsv('a,b\r\n1,2\r\n\r\n');
    assert.equal(rows.length, 1);
  });
});

describe('lib/xlsx.mjs', () => {
  it('reads the committed Files media export fixture', () => {
    const buffer = readFileSync(join(REPO_ROOT, 'data/shopify-exports/media_export.xlsx'));
    const { headers, rows } = readXlsxSheet(buffer, 'Files');
    assert.deepEqual(headers, ['ID', 'File Name', 'Command', 'Link', 'Alt Text', 'Created At', 'Type', 'Mime Type', 'Width', 'Height', 'Duration', 'Status', 'Errors']);
    assert.ok(rows.length > 0);
    const png = rows.find((r) => r['File Name'] === 'TFRS_512_x_512_px.png');
    assert.ok(png);
    assert.equal(png.ID, 'gid://shopify/MediaImage/54243856547951');
    assert.match(png.Link, /^https:\/\/cdn\.shopify\.com\//);
  });

  it('throws a clear error for an unknown sheet name', () => {
    const buffer = readFileSync(join(REPO_ROOT, 'data/shopify-exports/media_export.xlsx'));
    assert.throws(() => readXlsxSheet(buffer, 'Does Not Exist'), /sheet "Does Not Exist" not found/);
  });
});

describe('lib/parseProductsExport.mjs', () => {
  const csvText = toCsv(PRODUCT_HEADERS, [
    {
      Handle: 'test-product-a', Title: 'Test Product A', Vendor: 'Acme', 'Product Category': 'Cat', Type: 'Widget',
      Tags: 'foo, bar', Published: 'true', Status: 'active',
      'Option1 Name': 'Color', 'Option1 Value': 'Red',
      'Variant SKU': 'SKU-A1', 'Variant Inventory Tracker': 'shopify', 'Variant Inventory Qty': '5', 'Variant Inventory Policy': 'deny',
      'Variant Price': '100.00', 'Image Src': 'https://cdn.example.com/imgA1.jpg', 'Image Position': '1',
    },
    {
      Handle: 'test-product-a', 'Option1 Value': 'Blue',
      'Variant SKU': 'SKU-A2', 'Variant Inventory Tracker': 'shopify', 'Variant Inventory Qty': '0', 'Variant Inventory Policy': 'deny',
      'Variant Price': '110.00', 'Image Src': 'https://cdn.example.com/imgA2.jpg', 'Image Position': '2',
      'Variant Image': 'https://cdn.example.com/imgA2.jpg',
    },
    {
      Handle: 'test-product-a', 'Image Src': 'https://cdn.example.com/imgA3.jpg', 'Image Position': '3',
    },
    {
      Handle: 'test-product-b', Title: 'Test Product B', Status: 'draft', Published: 'false',
      'Variant SKU': 'SKU-B1', 'Variant Inventory Policy': 'continue',
    },
    {
      Handle: 'test-product-b', 'Option1 Value': 'Large',
    },
    {
      Handle: 'test-product-c', Title: 'Test Product C', Status: 'active', Published: 'true',
      'Variant SKU': 'SKU-A1', 'Variant Price': '100.00',
    },
  ]);

  it('forward-fills product-level fields across a handle group', () => {
    const { products } = parseProductsExport(csvText);
    const a = products.get('test-product-a');
    assert.equal(a.title, 'Test Product A');
    assert.equal(a.vendor, 'Acme');
    assert.equal(a.status, 'active');
    assert.deepEqual(a.tags, ['foo', 'bar']);
  });

  it('collects all product images sorted by position, deduplicated', () => {
    const { products } = parseProductsExport(csvText);
    const a = products.get('test-product-a');
    assert.deepEqual(a.images.map((i) => i.position), [1, 2, 3]);
  });

  it('extracts one variant per row with a SKU', () => {
    const { variants } = parseProductsExport(csvText);
    const skus = variants.map((v) => v.sku);
    assert.deepEqual(skus, ['SKU-A1', 'SKU-A2', 'SKU-B1', 'SKU-A1']);
  });

  it('parses variant price, inventory, and the explicit Variant Image column', () => {
    const { variants } = parseProductsExport(csvText);
    const a2 = variants.find((v) => v.sku === 'SKU-A2' && v.handle === 'test-product-a');
    assert.equal(a2.price, 110);
    assert.equal(a2.inventoryQty, 0);
    assert.equal(a2.variantImage, 'https://cdn.example.com/imgA2.jpg');
  });

  it('treats a SKU-less row with no option value as an extra image row, not a variant', () => {
    const { imageOnlyRowCount, unusableVariantRows } = parseProductsExport(csvText);
    assert.equal(imageOnlyRowCount, 1);
    assert.equal(unusableVariantRows.length, 1);
    assert.equal(unusableVariantRows[0].handle, 'test-product-b');
    assert.equal(unusableVariantRows[0].optionSummary, 'Large');
  });

  it('leaves a missing Variant Price as null rather than 0', () => {
    const { variants } = parseProductsExport(csvText);
    const b1 = variants.find((v) => v.sku === 'SKU-B1');
    assert.equal(b1.price, null);
  });
});

describe('lib/parseMediaExport.mjs', () => {
  it('normalizes a CDN URL by stripping the cache-busting query string', () => {
    assert.equal(normalizeMediaUrl('https://cdn.shopify.com/files/a.jpg?v=123'), 'https://cdn.shopify.com/files/a.jpg');
    assert.equal(normalizeMediaUrl(null), null);
  });

  it('extracts the filename from a URL', () => {
    assert.equal(filenameFromUrl('https://cdn.shopify.com/files/a.jpg?v=123'), 'a.jpg');
  });

  it('parses a CSV-format media export and matches by exact URL, then by filename fallback', () => {
    const csvText = toCsv(
      ['ID', 'File Name', 'Link', 'Mime Type', 'Status'],
      [{ ID: 'gid://shopify/MediaImage/1', 'File Name': 'a.jpg', Link: 'https://cdn.example.com/files/a.jpg?v=1', 'Mime Type': 'image/jpeg', Status: 'Ready' }],
    );
    const media = parseMediaExport(Buffer.from(csvText, 'utf8'), 'csv');
    assert.equal(media.count, 1);

    const exact = findMediaMatch(media, 'https://cdn.example.com/files/a.jpg?v=1');
    assert.equal(exact.id, 'gid://shopify/MediaImage/1');

    const differentVersion = findMediaMatch(media, 'https://cdn.example.com/files/a.jpg?v=999');
    assert.equal(differentVersion.id, 'gid://shopify/MediaImage/1');

    const unrelated = findMediaMatch(media, 'https://cdn.example.com/files/missing.jpg');
    assert.equal(unrelated, null);
  });
});

describe('buildVariantIndex.mjs — computeAvailability', () => {
  it('is unavailable when the product is not active, regardless of inventory', () => {
    assert.equal(computeAvailability({ status: 'draft', tracker: 'shopify', policy: 'continue', qty: 100 }), false);
    assert.equal(computeAvailability({ status: null, tracker: null, policy: null, qty: null }), false);
  });

  it('is available when inventory is untracked and the product is active', () => {
    assert.equal(computeAvailability({ status: 'active', tracker: '', policy: 'deny', qty: 0 }), true);
  });

  it('is available under "continue" policy even with zero (or negative) stock', () => {
    assert.equal(computeAvailability({ status: 'active', tracker: 'shopify', policy: 'continue', qty: 0 }), true);
    assert.equal(computeAvailability({ status: 'active', tracker: 'shopify', policy: 'continue', qty: -3 }), true);
  });

  it('respects tracked "deny" inventory: available only when qty > 0', () => {
    assert.equal(computeAvailability({ status: 'active', tracker: 'shopify', policy: 'deny', qty: 5 }), true);
    assert.equal(computeAvailability({ status: 'active', tracker: 'shopify', policy: 'deny', qty: 0 }), false);
  });

  it('returns null (unknown) for tracked "deny" inventory with no qty on record', () => {
    assert.equal(computeAvailability({ status: 'active', tracker: 'shopify', policy: 'deny', qty: null }), null);
  });
});

describe('buildVariantIndex.mjs — resolveVariantImage', () => {
  const product = { images: [{ src: 'primary.jpg', position: 1 }, { src: 'second.jpg', position: 2 }] };

  it('prefers an explicit Variant Image over the product gallery', () => {
    const result = resolveVariantImage({ variantImage: 'variant-specific.jpg' }, product);
    assert.deepEqual(result, { image: 'variant-specific.jpg', imageSource: 'variant-image' });
  });

  it('falls back to the product primary (position 1) image', () => {
    const result = resolveVariantImage({ variantImage: null }, product);
    assert.deepEqual(result, { image: 'primary.jpg', imageSource: 'product-primary-image' });
  });

  it('returns null when the product has no images at all', () => {
    const result = resolveVariantImage({ variantImage: null }, { images: [] });
    assert.deepEqual(result, { image: null, imageSource: 'none' });
  });
});

describe('buildVariantIndex.mjs — buildCatalogEntries + projectRuntimeIndex', () => {
  const products = new Map([
    ['handle-a', { handle: 'handle-a', title: 'Product A', vendor: 'Acme', productType: 'Widget', tags: [], status: 'active', images: [{ src: 'a.jpg', position: 1 }] }],
    ['handle-c', { handle: 'handle-c', title: 'Product C', vendor: 'Acme', productType: 'Widget', tags: [], status: 'active', images: [] }],
  ]);
  const variants = [
    { sku: 'SKU-1', handle: 'handle-a', price: 100, compareAtPrice: null, inventoryTracker: '', inventoryPolicy: 'continue', inventoryQty: 0, variantImage: null, rowNumber: 2 },
    { sku: 'SKU-1', handle: 'handle-c', price: 100, compareAtPrice: null, inventoryTracker: '', inventoryPolicy: 'continue', inventoryQty: 0, variantImage: null, rowNumber: 9 },
  ];
  const mediaIndex = { byUrl: new Map(), byFilename: new Map() };

  it('deduplicates a SKU that appears under multiple handles, keeping the first occurrence as canonical', () => {
    const { entries, duplicates } = buildCatalogEntries({ products, variants, mediaIndex });
    assert.equal(entries.length, 1);
    assert.equal(entries[0].productHandle, 'handle-a');
    assert.equal(duplicates.length, 1);
    assert.equal(duplicates[0].sku, 'SKU-1');
    assert.equal(duplicates[0].occurrences.length, 2);
  });

  it('never fabricates a Shopify Variant GID', () => {
    const { entries } = buildCatalogEntries({ products, variants, mediaIndex });
    const { indexDocument, gidStats } = projectRuntimeIndex(entries, { sourceLabel: 'test', generatedDate: '2026-01-01' });
    assert.equal(indexDocument.variants['SKU-1'].shopifyVariantId, null);
    assert.equal(indexDocument.variants['SKU-1'].shopifyProductId, null);
    assert.equal(gidStats.preservedFromExisting, 0);
    assert.equal(gidStats.appliedFromOverlay, 0);
  });

  it('preserves a real GID already present in the previous index file across re-ingestion', () => {
    const dir = makeTmpDir();
    const existingIndexPath = join(dir, 'existing-index.json');
    writeFileSync(existingIndexPath, JSON.stringify({
      variants: { 'SKU-1': { shopifyVariantId: 'gid://shopify/ProductVariant/999', shopifyProductId: 'gid://shopify/Product/111' } },
    }));

    const { entries } = buildCatalogEntries({ products, variants, mediaIndex });
    const { indexDocument, gidStats } = projectRuntimeIndex(entries, { sourceLabel: 'test', generatedDate: '2026-01-01', existingIndexPath });

    assert.equal(indexDocument.variants['SKU-1'].shopifyVariantId, 'gid://shopify/ProductVariant/999');
    assert.equal(indexDocument.variants['SKU-1'].shopifyProductId, 'gid://shopify/Product/111');
    assert.equal(gidStats.preservedFromExisting, 1);
  });

  it('does not carry forward a malformed GID from an existing index', () => {
    const dir = makeTmpDir();
    const existingIndexPath = join(dir, 'existing-index.json');
    writeFileSync(existingIndexPath, JSON.stringify({ variants: { 'SKU-1': { shopifyVariantId: 'not-a-real-gid' } } }));

    const { entries } = buildCatalogEntries({ products, variants, mediaIndex });
    const { indexDocument, gidStats } = projectRuntimeIndex(entries, { sourceLabel: 'test', generatedDate: '2026-01-01', existingIndexPath });

    assert.equal(indexDocument.variants['SKU-1'].shopifyVariantId, null);
    assert.equal(gidStats.preservedFromExisting, 0);
  });

  it('applies a valid --gid-overlay entry and rejects a malformed one', () => {
    const dir = makeTmpDir();
    const overlayPath = join(dir, 'overlay.json');
    writeFileSync(overlayPath, JSON.stringify({
      'SKU-1': { shopifyVariantId: 'gid://shopify/ProductVariant/42', shopifyProductId: 'gid://shopify/Product/7' },
      'SKU-DOES-NOT-EXIST': { shopifyVariantId: 'gid://shopify/ProductVariant/1' },
      'SKU-BAD': { shopifyVariantId: '12345' },
    }));

    const { entries } = buildCatalogEntries({ products, variants, mediaIndex });
    const { indexDocument, gidStats } = projectRuntimeIndex(entries, { sourceLabel: 'test', generatedDate: '2026-01-01', gidOverlayPath: overlayPath });

    assert.equal(indexDocument.variants['SKU-1'].shopifyVariantId, 'gid://shopify/ProductVariant/42');
    assert.equal(gidStats.appliedFromOverlay, 1);
    assert.equal(gidStats.rejectedOverlayEntries.length, 1);
    assert.equal(gidStats.rejectedOverlayEntries[0].sku, 'SKU-BAD');
  });

  it('keeps the existing runtime schema shape (only known keys) on each variant entry', () => {
    const { entries } = buildCatalogEntries({ products, variants, mediaIndex });
    const { indexDocument } = projectRuntimeIndex(entries, { sourceLabel: 'test', generatedDate: '2026-01-01' });
    assert.deepEqual(Object.keys(indexDocument.variants['SKU-1']).sort(), [
      'available', 'exportStatus', 'image', 'inventoryQty', 'price',
      'productHandle', 'productTitle', 'shopifyProductId', 'shopifyVariantId', 'sku',
    ].sort());
  });
});

describe('lib/scanAppSkuReferences.mjs', () => {
  it('recursively collects string values under any "sku" key across nested JSON', () => {
    const dir = makeTmpDir();
    writeFileSync(join(dir, 'configurator-a.json'), JSON.stringify({
      skuOptions: [{ sku: 'SKU-1' }, { sku: 'SKU-2' }],
      accessories: [{ required: [{ sku: null }, { sku: 'SKU-3' }] }],
    }));
    writeFileSync(join(dir, 'not-json.txt'), 'ignore me');

    const { skus, bySource } = scanAppSkuReferences([dir]);
    assert.deepEqual([...skus].sort(), ['SKU-1', 'SKU-2', 'SKU-3']);
    assert.equal(bySource.size, 1);
  });
});

describe('lib/report.mjs', () => {
  const products = new Map([
    ['handle-a', { handle: 'handle-a', title: 'Product A', status: 'active' }],
    ['handle-b', { handle: 'handle-b', title: 'Product B', status: 'draft' }],
  ]);
  const variants = [
    { sku: 'SKU-1', handle: 'handle-a' },
    { sku: 'SKU-2', handle: 'handle-b' },
  ];
  const entries = [
    { sku: 'SKU-1', productHandle: 'handle-a', productTitle: 'Product A', price: 100, image: 'a.jpg', imageSource: 'product-primary-image', imageVerifiedInMediaExport: true, exportStatus: 'active', rowNumber: 2 },
    { sku: 'SKU-2', productHandle: 'handle-b', productTitle: 'Product B', price: null, image: null, imageSource: 'none', imageVerifiedInMediaExport: false, exportStatus: 'draft', rowNumber: 5 },
  ];
  const report = buildReport({
    sourceLabel: 'test.csv',
    mediaSourceLabel: 'test-media.xlsx',
    generatedAt: '2026-01-01T00:00:00.000Z',
    totalRows: 4,
    products,
    variants,
    entries,
    duplicates: [],
    unusableVariantRows: [{ handle: 'handle-b', rowNumber: 6, optionSummary: 'Large', reason: 'no sku' }],
    imageOnlyRowCount: 1,
    mediaIndex: { count: 10 },
    appSkuReferences: { skus: new Set(['SKU-1', 'SKU-9']) },
    gidStats: { preservedFromExisting: 0, appliedFromOverlay: 0, rejectedOverlayEntries: [] },
  });

  it('summarizes counts correctly', () => {
    assert.equal(report.summary.totalProducts, 2);
    assert.equal(report.summary.activeProducts, 1);
    assert.equal(report.summary.draftOrOtherProducts, 1);
    assert.equal(report.summary.variantsMissingPrice, 1);
    assert.equal(report.summary.variantsMissingImage, 1);
    assert.equal(report.summary.rowsWithoutUsableVariantData, 1);
  });

  it('flags app-referenced SKUs absent from the export', () => {
    assert.deepEqual(report.appSkuCrossReference.unmatchedSkus, ['SKU-9']);
  });

  it('lists inactive/draft products with their variant counts', () => {
    assert.deepEqual(report.inactiveOrDraftProducts, [{ handle: 'handle-b', title: 'Product B', status: 'draft', variantCount: 1 }]);
  });

  it('renders to markdown without throwing, including all section headings', () => {
    const markdown = toMarkdown(report);
    for (const heading of [
      '## Summary', '## Duplicate SKUs', '## Variants missing a price', '## Variants missing an image',
      '## Inactive / draft products', '## Rows without usable variant data',
      '## App-referenced SKUs not found in this export', '## Shopify Variant GIDs',
    ]) {
      assert.ok(markdown.includes(heading), `expected markdown to contain "${heading}"`);
    }
  });
});

describe('ingest.mjs — end-to-end against the committed fixtures', () => {
  it('regenerates a schema-compatible index and a consistent report from the real exports', () => {
    const outDir = makeTmpDir();
    const options = resolveOptions([
      '--out-index', join(outDir, 'index.json'),
      '--out-report', join(outDir, 'report'),
      '--generated-date', '2026-01-01',
    ], { cwd: REPO_ROOT });

    const { indexDocument, report } = runIngest(options);

    assert.ok(indexDocument._totalVariants > 0);
    assert.equal(Object.keys(indexDocument.variants).length, indexDocument._totalVariants);
    assert.equal(report.summary.uniqueVariantsInIndex, indexDocument._totalVariants);

    // Every variant with a SKU in the CSV is either indexed or explicitly absorbed into a reported duplicate group.
    const duplicateSkuCount = report.duplicateSkus.reduce((sum, d) => sum + d.occurrences.length - 1, 0);
    assert.equal(indexDocument._totalVariants + duplicateSkuCount, report.summary.totalVariantRows);

    // Never fabricates GIDs from a bare CSV run.
    assert.ok(Object.values(indexDocument.variants).every((v) => v.shopifyVariantId === null));

    const known = indexDocument.variants['8200SM8-A-42'];
    assert.ok(known);
    assert.equal(known.price, 1057);
    assert.equal(known.shopifyVariantId, null);
  });

  it('defaults to the repo\'s canonical export paths when no flags are given', () => {
    const options = resolveOptions([], { cwd: REPO_ROOT });
    assert.equal(options.productsPath, join(REPO_ROOT, 'data/shopify-exports/products_export.csv'));
    assert.equal(options.mediaPath, join(REPO_ROOT, 'data/shopify-exports/media_export.xlsx'));
    assert.equal(options.outIndexPath, join(REPO_ROOT, 'src/data/shopify/shopify-variant-index.json'));
  });
});
