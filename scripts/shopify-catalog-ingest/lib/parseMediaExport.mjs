/**
 * lib/parseMediaExport.mjs
 *
 * Reads a Shopify "Files" media export (.xlsx, as exported by Shopify's
 * bulk export apps, or a .csv with the same columns) into lookup indices
 * keyed by filename and by normalized CDN URL, so product image references
 * can be cross-checked against what actually exists in the media library.
 */

import { readXlsxSheet } from './xlsx.mjs';
import { parseCsv } from './csv.mjs';

/** Strips Shopify's cache-busting `?v=...` query string so URLs compare stably. */
export function normalizeMediaUrl(url) {
  if (!url) return null;
  return url.split('?')[0];
}

export function filenameFromUrl(url) {
  if (!url) return null;
  const withoutQuery = normalizeMediaUrl(url);
  const segments = withoutQuery.split('/');
  return segments[segments.length - 1] || null;
}

/**
 * @param {Buffer} buffer
 * @param {'xlsx'|'csv'} format
 * @returns {{ byUrl: Map<string, object>, byFilename: Map<string, object>, count: number }}
 */
export function parseMediaExport(buffer, format) {
  const { rows } = format === 'csv'
    ? parseCsv(buffer.toString('utf8'))
    : readXlsxSheet(buffer, 'Files');

  const byUrl = new Map();
  const byFilename = new Map();

  for (const row of rows) {
    const link = row.Link?.trim();
    const fileName = row['File Name']?.trim();
    if (!link && !fileName) continue;

    const entry = {
      id: row.ID || null,
      fileName: fileName || null,
      url: link || null,
      mimeType: row['Mime Type'] || null,
      status: row.Status || null,
    };

    if (link) byUrl.set(normalizeMediaUrl(link), entry);
    if (fileName) byFilename.set(fileName, entry);
  }

  return { byUrl, byFilename, count: rows.length };
}

/**
 * Looks up an image URL against the media index, matching by exact
 * (normalized) URL first, then falling back to filename — a product export
 * can reference a resized/alternate-host copy of a file whose base name
 * still matches an entry in the media library.
 */
export function findMediaMatch(mediaIndex, imageUrl) {
  if (!mediaIndex || !imageUrl) return null;
  const normalized = normalizeMediaUrl(imageUrl);
  return mediaIndex.byUrl.get(normalized) ?? mediaIndex.byFilename.get(filenameFromUrl(imageUrl)) ?? null;
}
