#!/usr/bin/env node
/**
 * scripts/shopify-catalog-ingest/tools/convert-matrixify-xlsx-to-csv.mjs
 *
 * Converts a Matrixify "Products" export workbook (.xlsx) into the RFC4180
 * CSV `ingest.mjs --products` reads. Matrixify's column names already match
 * (or are ignored/unused by) this pipeline's parser — including the
 * `Variant ID` column — so this is a straight sheet-to-CSV transcription,
 * no column remapping.
 *
 * Usage:
 *   node scripts/shopify-catalog-ingest/tools/convert-matrixify-xlsx-to-csv.mjs \
 *     <input.xlsx> <output.csv> [--sheet "Products"]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readXlsxSheet } from '../lib/xlsx.mjs';

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      flags[key] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    } else {
      positional.push(argv[i]);
    }
  }
  return { positional, flags };
}

function csvField(value) {
  const str = value === undefined || value === null ? '' : String(value);
  if (/[",\r\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function convertMatrixifyXlsxToCsv(inputPath, sheetName = 'Products') {
  const buffer = readFileSync(inputPath);
  const { headers, rows } = readXlsxSheet(buffer, sheetName);

  const lines = [headers.map(csvField).join(',')];
  for (const row of rows) lines.push(headers.map((h) => csvField(row[h])).join(','));

  return { csvText: lines.join('\r\n') + '\r\n', headers, rowCount: rows.length };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const [inputPath, outputPath] = positional;
  if (!inputPath || !outputPath) {
    console.error('Usage: convert-matrixify-xlsx-to-csv.mjs <input.xlsx> <output.csv> [--sheet "Products"]');
    process.exit(1);
  }

  const { csvText, headers, rowCount } = convertMatrixifyXlsxToCsv(inputPath, flags.sheet ?? 'Products');
  writeFileSync(outputPath, csvText);
  console.log(`Wrote ${rowCount} data rows, ${headers.length} columns -> ${outputPath}`);
}
