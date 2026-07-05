/**
 * lib/report.mjs
 *
 * Builds the Variant GID Overlay report artifact: everything a human needs
 * to judge whether this run's collected GIDs are safe to apply, and what
 * still needs attention in Shopify Admin or the generated Variant Index.
 * `buildReport` returns a plain JSON-serializable object; `toMarkdown`
 * renders the same data as a human-readable summary.
 */

export function buildReport({
  generatedAt,
  storeDomain,
  pageCount,
  totalFetched,
  withoutSku,
  malformed,
  duplicates,
  conflicting,
  matched,
  unmatchedShopifySkus,
  missingFromShopify,
}) {
  return {
    meta: {
      generatedAt,
      storeDomain: storeDomain ? redactStoreDomain(storeDomain) : null,
    },
    summary: {
      pagesFetched: pageCount,
      totalVariantsFetched: totalFetched,
      variantsWithoutSku: withoutSku.length,
      malformedGidsRejected: malformed.length,
      duplicateSkuGroupsRejected: duplicates.length,
      conflictingMappingsRejected: conflicting.length,
      matchedToVariantIndex: matched.length,
      unmatchedShopifySkus: unmatchedShopifySkus.length,
      missingFromShopify: missingFromShopify.length,
    },
    malformed,
    duplicates,
    conflicting,
    unmatchedShopifySkus,
    missingFromShopify,
  };
}

function redactStoreDomain(storeDomain) {
  const [shop, ...rest] = storeDomain.split('.');
  if (rest.length === 0) return storeDomain;
  return `${shop.slice(0, 3)}***.${rest.join('.')}`;
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

  lines.push('# Shopify Variant GID Overlay Report');
  lines.push('');
  lines.push(`**Generated:** ${meta.generatedAt}  `);
  lines.push(`**Store:** ${meta.storeDomain ?? '(unknown)'}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(table(
    ['Metric', 'Value'],
    [
      ['Admin API pages fetched', summary.pagesFetched],
      ['Total variants fetched from Shopify', summary.totalVariantsFetched],
      ['Variants without a SKU (skipped)', summary.variantsWithoutSku],
      ['Malformed GIDs rejected', summary.malformedGidsRejected],
      ['Duplicate SKU groups rejected', summary.duplicateSkuGroupsRejected],
      ['Conflicting mappings rejected', summary.conflictingMappingsRejected],
      ['Matched to the generated Variant Index', summary.matchedToVariantIndex],
      ['Shopify SKUs not found in the Variant Index', summary.unmatchedShopifySkus],
      ['Variant Index SKUs missing from Shopify', summary.missingFromShopify],
    ].map(([k, v]) => [k, String(v)]),
  ));

  lines.push('');
  lines.push('## Malformed GIDs rejected');
  lines.push('');
  lines.push('Shopify returned a variant or product identifier that does not match the expected `gid://shopify/...` shape. These are never written to the overlay.');
  lines.push('');
  lines.push(table(['SKU', 'Variant GID', 'Product GID', 'Reason'], report.malformed.map((m) => [m.sku, String(m.variantGid), String(m.productGid), m.reason])));

  lines.push('');
  lines.push('## Duplicate SKU mappings rejected');
  lines.push('');
  lines.push('The same SKU is attached to more than one distinct Shopify Variant GID. This SKU cannot be safely overlaid until the duplicate is resolved in Shopify Admin.');
  lines.push('');
  lines.push(table(
    ['SKU', 'Variant GIDs', 'Product handles'],
    report.duplicates.map((d) => [d.sku, d.occurrences.map((o) => o.variantGid).join(', '), d.occurrences.map((o) => o.productHandle).join(', ')]),
  ));

  lines.push('');
  lines.push('## Conflicting mappings rejected');
  lines.push('');
  lines.push('The generated Variant Index already records a different Shopify Variant GID for this SKU than Shopify Admin now reports. Surfaced for human review rather than silently overwritten.');
  lines.push('');
  lines.push(table(
    ['SKU', 'Existing Variant GID', 'Fetched Variant GID', 'Product handle'],
    report.conflicting.map((c) => [c.sku, c.existingShopifyVariantId, c.fetchedShopifyVariantId, c.productHandle ?? '']),
  ));

  lines.push('');
  lines.push('## Shopify SKUs not found in the generated Variant Index');
  lines.push('');
  lines.push('These SKUs matched a valid, non-conflicting Shopify variant but do not exist in the current Variant Index (`src/data/shopify/shopify-variant-index.json`) — possibly a SKU not yet ingested from a CSV export. Not written to the overlay.');
  lines.push('');
  lines.push(report.unmatchedShopifySkus.length === 0
    ? '_None._'
    : report.unmatchedShopifySkus.map((sku) => `- \`${sku}\``).join('\n'));

  lines.push('');
  lines.push('## Variant Index SKUs missing from Shopify');
  lines.push('');
  lines.push('These SKUs exist in the generated Variant Index but Shopify Admin returned no matching variant for them — they will remain pending GID collection after this overlay is applied.');
  lines.push('');
  lines.push(report.missingFromShopify.length === 0
    ? '_None — every Variant Index SKU was found in Shopify._'
    : report.missingFromShopify.map((sku) => `- \`${sku}\``).join('\n'));

  return lines.join('\n') + '\n';
}
