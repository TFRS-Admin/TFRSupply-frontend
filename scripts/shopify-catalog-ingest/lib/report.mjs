/**
 * lib/report.mjs
 *
 * Builds the ingestion report artifact: everything a human needs to judge
 * catalog data quality and Shopify cart-readiness without opening the raw
 * CSV. `buildReport` returns a plain JSON-serializable object; `toMarkdown`
 * renders the same data as a human-readable summary.
 */

export function buildReport({
  sourceLabel,
  mediaSourceLabel,
  generatedAt,
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
  invalidVariantIdRows = [],
}) {
  const productList = [...products.values()];
  const activeProducts = productList.filter((p) => p.status === 'active');
  const draftOrOtherProducts = productList.filter((p) => p.status !== 'active');

  const missingPrices = entries.filter((e) => e.price == null);
  const missingImages = entries.filter((e) => !e.image);
  const unverifiedImages = entries.filter((e) => e.image && !e.imageVerifiedInMediaExport);
  const variantSpecificImageCount = entries.filter((e) => e.imageSource === 'variant-image').length;
  const fallbackImageCount = entries.filter((e) => e.imageSource === 'product-primary-image').length;

  const appSkus = appSkuReferences?.skus ?? new Set();
  const indexedSkus = new Set(entries.map((e) => e.sku));
  const unmatchedAppSkus = [...appSkus].filter((sku) => !indexedSkus.has(sku)).sort();

  return {
    meta: {
      generatedAt,
      productsSource: sourceLabel,
      mediaSource: mediaSourceLabel,
    },
    summary: {
      totalCsvRows: totalRows,
      totalProducts: productList.length,
      activeProducts: activeProducts.length,
      draftOrOtherProducts: draftOrOtherProducts.length,
      totalVariantRows: variants.length,
      uniqueVariantsInIndex: entries.length,
      duplicateSkuGroups: duplicates.length,
      variantsMissingPrice: missingPrices.length,
      variantsMissingImage: missingImages.length,
      variantsWithVariantSpecificImage: variantSpecificImageCount,
      variantsUsingProductFallbackImage: fallbackImageCount,
      imagesNotFoundInMediaExport: unverifiedImages.length,
      mediaExportFileCount: mediaIndex?.count ?? 0,
      imageOnlyRowsSkipped: imageOnlyRowCount,
      rowsWithoutUsableVariantData: unusableVariantRows.length,
      appReferencedSkuCount: appSkus.size,
      appReferencedSkusUnmatched: unmatchedAppSkus.length,
      variantsWithShopifyVariantGid: (gidStats.fromExport ?? 0) + gidStats.preservedFromExisting + gidStats.appliedFromOverlay,
      variantsPendingShopifyVariantGid: entries.length - ((gidStats.fromExport ?? 0) + gidStats.preservedFromExisting + gidStats.appliedFromOverlay),
    },
    duplicateSkus: duplicates,
    missingPrices: missingPrices.map((e) => ({ sku: e.sku, productHandle: e.productHandle, rowNumber: e.rowNumber })),
    missingImages: missingImages.map((e) => ({ sku: e.sku, productHandle: e.productHandle, productTitle: e.productTitle, exportStatus: e.exportStatus })),
    imagesNotFoundInMediaExport: unverifiedImages.map((e) => ({ sku: e.sku, productHandle: e.productHandle, image: e.image })),
    inactiveOrDraftProducts: draftOrOtherProducts.map((p) => ({
      handle: p.handle,
      title: p.title,
      status: p.status,
      variantCount: variants.filter((v) => v.handle === p.handle).length,
    })),
    rowsWithoutUsableVariantData: unusableVariantRows,
    appSkuCrossReference: {
      totalAppReferencedSkus: appSkus.size,
      unmatchedSkus: unmatchedAppSkus,
    },
    gid: {
      note: 'Shopify Variant IDs are read directly from the export\'s Variant ID column when present. Exports without that column fall back to --gid-overlay or whatever was already on record — see docs/architecture/SHOPIFY_CATALOG_CSV_INGESTION.md.',
      fromExport: gidStats.fromExport ?? 0,
      preservedFromExisting: gidStats.preservedFromExisting,
      appliedFromOverlay: gidStats.appliedFromOverlay,
      rejectedOverlayEntries: gidStats.rejectedOverlayEntries,
      invalidExportVariantIds: invalidVariantIdRows,
    },
  };
}

function table(headers, rows) {
  if (rows.length === 0) return '_None._';
  const headerLine = `| ${headers.join(' | ')} |`;
  const sepLine = `| ${headers.map(() => '---').join(' | ')} |`;
  const bodyLines = rows.map((row) => `| ${row.join(' | ')} |`);
  return [headerLine, sepLine, ...bodyLines].join('\n');
}

export function toMarkdown(report) {
  const { meta, summary } = report;
  const lines = [];

  lines.push('# Shopify Catalog Ingestion Report');
  lines.push('');
  lines.push(`**Generated:** ${meta.generatedAt}  `);
  lines.push(`**Products source:** ${meta.productsSource}  `);
  lines.push(`**Media source:** ${meta.mediaSource}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(table(
    ['Metric', 'Value'],
    [
      ['CSV rows parsed', summary.totalCsvRows],
      ['Products', summary.totalProducts],
      ['Active products', summary.activeProducts],
      ['Draft / non-active products', summary.draftOrOtherProducts],
      ['Variant rows parsed', summary.totalVariantRows],
      ['Unique SKUs in index', summary.uniqueVariantsInIndex],
      ['Duplicate SKU groups', summary.duplicateSkuGroups],
      ['Variants missing price', summary.variantsMissingPrice],
      ['Variants missing image', summary.variantsMissingImage],
      ['Variants with explicit variant image', summary.variantsWithVariantSpecificImage],
      ['Variants using product fallback image', summary.variantsUsingProductFallbackImage],
      ['Image references not found in media export', summary.imagesNotFoundInMediaExport],
      ['Media export files available', summary.mediaExportFileCount],
      ['Extra image-only rows skipped', summary.imageOnlyRowsSkipped],
      ['Rows without usable variant data', summary.rowsWithoutUsableVariantData],
      ['App-referenced SKUs (configurators + products)', summary.appReferencedSkuCount],
      ['App-referenced SKUs not found in this export', summary.appReferencedSkusUnmatched],
      ['Variants with a real Shopify Variant GID', summary.variantsWithShopifyVariantGid],
      ['Variants pending GID collection', summary.variantsPendingShopifyVariantGid],
    ].map(([k, v]) => [k, String(v)]),
  ));

  lines.push('');
  lines.push('## Duplicate SKUs');
  lines.push('');
  lines.push('Same SKU appears under more than one product handle. Prices agree in every case observed so far; the first occurrence (by CSV row order) is written to the index as canonical.');
  lines.push('');
  lines.push(table(
    ['SKU', 'Canonical handle', 'Also appears under'],
    report.duplicateSkus.map((d) => [
      d.sku,
      d.canonicalHandle,
      d.occurrences.filter((o) => o.handle !== d.canonicalHandle).map((o) => o.handle).join(', ') || '_(same handle)_',
    ]),
  ));

  lines.push('');
  lines.push('## Variants missing a price');
  lines.push('');
  lines.push(table(['SKU', 'Product handle', 'CSV row'], report.missingPrices.map((r) => [r.sku, r.productHandle, r.rowNumber])));

  lines.push('');
  lines.push('## Variants missing an image');
  lines.push('');
  lines.push(table(
    ['SKU', 'Product handle', 'Product title', 'Status'],
    report.missingImages.map((r) => [r.sku, r.productHandle, r.productTitle ?? '', r.exportStatus ?? '']),
  ));

  lines.push('');
  lines.push('## Image references not found in the media export');
  lines.push('');
  lines.push('These SKUs reference an image URL that does not appear (by URL or filename) in the Files media export — possibly stale or off-platform.');
  lines.push('');
  lines.push(table(['SKU', 'Product handle', 'Image URL'], report.imagesNotFoundInMediaExport.map((r) => [r.sku, r.productHandle, r.image])));

  lines.push('');
  lines.push('## Inactive / draft products');
  lines.push('');
  lines.push(table(
    ['Handle', 'Title', 'Status', 'Variant count'],
    report.inactiveOrDraftProducts.map((p) => [p.handle, p.title || '', p.status ?? '(unknown)', p.variantCount]),
  ));

  lines.push('');
  lines.push('## Rows without usable variant data');
  lines.push('');
  lines.push('CSV rows that declare a variant option combination but carry no Variant SKU, so they cannot be resolved to a sellable variant.');
  lines.push('');
  lines.push(table(
    ['Product handle', 'CSV row', 'Option values', 'Reason'],
    report.rowsWithoutUsableVariantData.map((r) => [r.handle, r.rowNumber, r.optionSummary || '', r.reason]),
  ));

  lines.push('');
  lines.push('## App-referenced SKUs not found in this export');
  lines.push('');
  lines.push('SKUs referenced by configurator/product JSON in `src/data/` that do not exist anywhere in the current Shopify export — these will resolve as `unmatched` at runtime.');
  lines.push('');
  lines.push(report.appSkuCrossReference.unmatchedSkus.length === 0
    ? '_None — every app-referenced SKU is present in this export._'
    : report.appSkuCrossReference.unmatchedSkus.map((sku) => `- \`${sku}\``).join('\n'));

  lines.push('');
  lines.push('## Shopify Variant GIDs');
  lines.push('');
  lines.push(report.gid.note);
  lines.push('');
  lines.push(table(
    ['Metric', 'Value'],
    [
      ['From export Variant ID column', report.gid.fromExport],
      ['Applied from --gid-overlay', report.gid.appliedFromOverlay],
      ['Preserved from previous index', report.gid.preservedFromExisting],
      ['Rejected overlay entries (invalid GID format)', report.gid.rejectedOverlayEntries.length],
      ['Malformed export Variant ID values (ignored)', report.gid.invalidExportVariantIds.length],
    ],
  ));
  if (report.gid.rejectedOverlayEntries.length > 0) {
    lines.push('');
    lines.push(table(['SKU', 'Reason'], report.gid.rejectedOverlayEntries.map((r) => [r.sku, r.reason])));
  }
  if (report.gid.invalidExportVariantIds.length > 0) {
    lines.push('');
    lines.push('Malformed `Variant ID` values from the export (not numeric, not a valid GID) — ignored rather than guessed at:');
    lines.push('');
    lines.push(table(
      ['SKU', 'Product handle', 'CSV row', 'Raw value'],
      report.gid.invalidExportVariantIds.map((r) => [r.sku, r.handle, r.rowNumber, r.raw]),
    ));
  }

  return lines.join('\n') + '\n';
}
