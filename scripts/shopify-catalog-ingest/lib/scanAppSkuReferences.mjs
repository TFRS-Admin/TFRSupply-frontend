/**
 * lib/scanAppSkuReferences.mjs
 *
 * Reads every SKU the app itself references (configurator skuOptions,
 * product.json shopify.variant_mappings, etc.) so the ingestion report can
 * flag app-referenced SKUs that don't exist anywhere in the fresh Shopify
 * export — the same "unmatched" gap previously tracked by hand in
 * src/docs/police-lightbar-configurator-readiness.md.
 *
 * Walks generically (any string value under a "sku" key) rather than
 * hard-coding each JSON shape, so it keeps working as new configurator/
 * product files are added.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function listJsonFilesRecursive(dir) {
  let files = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      files = files.concat(listJsonFilesRecursive(path));
    } else if (name.endsWith('.json')) {
      files.push(path);
    }
  }
  return files;
}

function collectSkus(node, into) {
  if (Array.isArray(node)) {
    node.forEach((child) => collectSkus(child, into));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'sku' && typeof value === 'string' && value.trim()) {
        into.add(value.trim());
      } else {
        collectSkus(value, into);
      }
    }
  }
}

/**
 * @param {string[]} dirs directories to scan for `"sku": "..."` references
 * @returns {{ skus: Set<string>, bySource: Map<string, string[]> }}
 */
export function scanAppSkuReferences(dirs) {
  const skus = new Set();
  const bySource = new Map();

  for (const dir of dirs) {
    for (const file of listJsonFilesRecursive(dir)) {
      const found = new Set();
      let json;
      try {
        json = JSON.parse(readFileSync(file, 'utf8'));
      } catch {
        continue;
      }
      collectSkus(json, found);
      if (found.size > 0) bySource.set(file, [...found]);
      for (const sku of found) skus.add(sku);
    }
  }

  return { skus, bySource };
}
