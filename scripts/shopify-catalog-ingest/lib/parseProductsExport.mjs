/**
 * lib/parseProductsExport.mjs
 *
 * Turns Shopify's flat "one row per variant (plus extra image rows)" product
 * export into a normalized { products, variants } model.
 *
 * Shopify's export convention: only the FIRST row of a product's Handle
 * group carries product-level fields (Title, Vendor, Type, Tags, Status,
 * ...) — every later row for that handle leaves them blank. This module
 * forward-fills those fields per handle group so every variant can be
 * traced back to complete product metadata.
 */

import { parseCsv } from './csv.mjs';

const PRODUCT_LEVEL_FIELDS = {
  Title: 'title',
  Vendor: 'vendor',
  'Product Category': 'productCategory',
  Type: 'productType',
  Tags: 'tagsRaw',
  Published: 'published',
  Status: 'status',
};

function parsePrice(raw) {
  if (raw === undefined || raw === null || raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function parseIntOrNull(raw) {
  if (raw === undefined || raw === null || raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.trunc(value) : null;
}

function hasAnyOptionValue(row) {
  return Boolean(row['Option1 Value'] || row['Option2 Value'] || row['Option3 Value']);
}

/**
 * @param {string} csvText
 * @returns {{
 *   products: Map<string, object>,
 *   variants: object[],
 *   imageOnlyRowCount: number,
 *   unusableVariantRows: object[],
 *   totalRows: number,
 * }}
 */
export function parseProductsExport(csvText) {
  const { rows } = parseCsv(csvText);

  const products = new Map();
  const variants = [];
  const unusableVariantRows = [];
  let imageOnlyRowCount = 0;

  const forwardFill = {};

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // +1 for 0-index, +1 for the header row
    const handle = row.Handle?.trim();
    if (!handle) return;

    if (!forwardFill[handle]) forwardFill[handle] = {};
    const carried = forwardFill[handle];
    for (const [csvKey] of Object.entries(PRODUCT_LEVEL_FIELDS)) {
      if (row[csvKey]) carried[csvKey] = row[csvKey];
    }

    if (!products.has(handle)) {
      products.set(handle, {
        handle,
        title: '',
        vendor: '',
        productCategory: '',
        productType: '',
        tags: [],
        published: null,
        status: null,
        images: [],
        firstRowNumber: rowNumber,
      });
    }
    const product = products.get(handle);
    for (const [csvKey, modelKey] of Object.entries(PRODUCT_LEVEL_FIELDS)) {
      const value = carried[csvKey];
      if (value === undefined) continue;
      if (modelKey === 'tagsRaw') {
        product.tags = value.split(',').map((t) => t.trim()).filter(Boolean);
      } else if (modelKey === 'published') {
        product.published = value === 'true' ? true : value === 'false' ? false : null;
      } else {
        product[modelKey] = value;
      }
    }

    const imageSrc = row['Image Src']?.trim();
    if (imageSrc && !product.images.some((img) => img.src === imageSrc)) {
      product.images.push({
        src: imageSrc,
        position: parseIntOrNull(row['Image Position']),
        alt: row['Image Alt Text'] || null,
      });
    }

    const sku = row['Variant SKU']?.trim();
    if (sku) {
      variants.push({
        sku,
        handle,
        rowNumber,
        price: parsePrice(row['Variant Price']),
        compareAtPrice: parsePrice(row['Variant Compare At Price']),
        barcode: row['Variant Barcode'] || null,
        grams: parseIntOrNull(row['Variant Grams']),
        inventoryTracker: row['Variant Inventory Tracker'] || null,
        inventoryQty: parseIntOrNull(row['Variant Inventory Qty']),
        inventoryPolicy: row['Variant Inventory Policy'] || null,
        fulfillmentService: row['Variant Fulfillment Service'] || null,
        variantImage: row['Variant Image']?.trim() || null,
        variantIdRaw: row['Variant ID']?.trim() || null,
        optionSummary: [row['Option1 Value'], row['Option2 Value'], row['Option3 Value']].filter(Boolean).join(' / '),
      });
    } else if (hasAnyOptionValue(row)) {
      unusableVariantRows.push({
        handle,
        rowNumber,
        reason: 'Row declares a variant option value but has no Variant SKU',
        optionSummary: [row['Option1 Value'], row['Option2 Value'], row['Option3 Value']].filter(Boolean).join(' / '),
      });
    } else if (imageSrc) {
      imageOnlyRowCount++;
    }
  });

  for (const product of products.values()) {
    product.images.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  return { products, variants, imageOnlyRowCount, unusableVariantRows, totalRows: rows.length };
}
