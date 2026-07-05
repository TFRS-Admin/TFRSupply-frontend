/**
 * lib/xlsx.mjs
 *
 * Zero-dependency reader for the one shape of .xlsx file this pipeline
 * needs to consume: a Shopify "Files" media export — a single flat sheet,
 * no formulas, no merged cells. An .xlsx is a ZIP of XML parts; Node's
 * built-in zlib already speaks the raw-deflate compression ZIP uses, so a
 * full parser/dependency isn't needed for this narrow shape. Anything
 * outside it (password-protected files, non-flat sheets) is expected to
 * fail loudly rather than silently mis-read data.
 */

import { inflateRawSync } from 'node:zlib';

/**
 * @param {Buffer} buffer
 * @param {string} entryName e.g. "xl/worksheets/sheet1.xml"
 * @returns {Buffer}
 */
function readZipEntry(buffer, entryName) {
  const eocdSig = 0x06054b50;
  let eocdOffset = -1;
  for (let i = buffer.length - 22; i >= 0; i--) {
    if (buffer.readUInt32LE(i) === eocdSig) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error('xlsx.mjs: not a valid zip file (no End Of Central Directory record found)');

  const centralDirCount = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirOffset = buffer.readUInt32LE(eocdOffset + 16);

  let offset = centralDirOffset;
  for (let i = 0; i < centralDirCount; i++) {
    const sig = buffer.readUInt32LE(offset);
    if (sig !== 0x02014b50) throw new Error(`xlsx.mjs: malformed central directory entry at offset ${offset}`);

    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength);

    if (name === entryName) {
      return extractLocalEntry(buffer, localHeaderOffset, compressionMethod, compressedSize);
    }

    offset += 46 + nameLength + extraLength + commentLength;
  }

  throw new Error(`xlsx.mjs: entry not found in archive: ${entryName}`);
}

function extractLocalEntry(buffer, localHeaderOffset, compressionMethod, compressedSize) {
  const sig = buffer.readUInt32LE(localHeaderOffset);
  if (sig !== 0x04034b50) throw new Error(`xlsx.mjs: malformed local file header at offset ${localHeaderOffset}`);

  const nameLength = buffer.readUInt16LE(localHeaderOffset + 26);
  const extraLength = buffer.readUInt16LE(localHeaderOffset + 28);
  const dataStart = localHeaderOffset + 30 + nameLength + extraLength;
  const compressed = buffer.subarray(dataStart, dataStart + compressedSize);

  if (compressionMethod === 0) return compressed;
  if (compressionMethod === 8) return inflateRawSync(compressed);
  throw new Error(`xlsx.mjs: unsupported zip compression method ${compressionMethod}`);
}

function listZipEntryNames(buffer) {
  const eocdSig = 0x06054b50;
  let eocdOffset = -1;
  for (let i = buffer.length - 22; i >= 0; i--) {
    if (buffer.readUInt32LE(i) === eocdSig) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error('xlsx.mjs: not a valid zip file (no End Of Central Directory record found)');

  const centralDirCount = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirOffset = buffer.readUInt32LE(eocdOffset + 16);

  const names = [];
  let offset = centralDirOffset;
  for (let i = 0; i < centralDirCount; i++) {
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    names.push(buffer.toString('utf8', offset + 46, offset + 46 + nameLength));
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return names;
}

function decodeXmlEntities(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, '&');
}

/** Parses xl/sharedStrings.xml (if present) into an index -> string array. */
function parseSharedStrings(xml) {
  if (!xml) return [];
  const strings = [];
  const siRegex = /<si[^>]*>([\s\S]*?)<\/si>/g;
  let match;
  while ((match = siRegex.exec(xml))) {
    const text = [...match[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => decodeXmlEntities(m[1])).join('');
    strings.push(text);
  }
  return strings;
}

/** Resolves a `<sheet name="..."/>` in workbook.xml to its worksheet part path via the rels file. */
function resolveSheetPath(workbookXml, relsXml, sheetName) {
  const sheetMatch = new RegExp(`<sheet[^>]*name="${sheetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*/?>`).exec(workbookXml);
  if (!sheetMatch) throw new Error(`xlsx.mjs: sheet "${sheetName}" not found in workbook.xml`);

  const ridMatch = /r:id="([^"]+)"/.exec(sheetMatch[0]);
  if (!ridMatch) throw new Error(`xlsx.mjs: sheet "${sheetName}" has no r:id reference`);

  const relMatch = new RegExp(`<Relationship[^>]*Id="${ridMatch[1]}"[^>]*/?>`).exec(relsXml);
  if (!relMatch) throw new Error(`xlsx.mjs: relationship "${ridMatch[1]}" not found in workbook.xml.rels`);

  const targetMatch = /Target="([^"]+)"/.exec(relMatch[0]);
  const target = targetMatch[1];
  return target.startsWith('/') ? target.slice(1) : `xl/${target}`;
}

/** @param {string} cellRef e.g. "C7" @returns {number} zero-based column index */
function columnIndexFromRef(cellRef) {
  const letters = cellRef.match(/^[A-Z]+/)?.[0] ?? '';
  let index = 0;
  for (const ch of letters) index = index * 26 + (ch.charCodeAt(0) - 64);
  return index - 1;
}

function parseSheetRows(sheetXml, sharedStrings) {
  const rows = [];
  const rowRegex = /<row[^>]*>([\s\S]*?)<\/row>/g;
  let rowMatch;
  while ((rowMatch = rowRegex.exec(sheetXml))) {
    const cells = [];
    const cellRegex = /<c\b([^>]*)>([\s\S]*?)<\/c>|<c\b([^>]*)\/>/g;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowMatch[1]))) {
      const attrs = cellMatch[1] ?? cellMatch[3] ?? '';
      const inner = cellMatch[2] ?? '';
      const refMatch = /r="([^"]+)"/.exec(attrs);
      const typeMatch = /t="([^"]+)"/.exec(attrs);
      const type = typeMatch?.[1];
      const colIndex = refMatch ? columnIndexFromRef(refMatch[1]) : cells.length;

      let value = '';
      if (type === 'inlineStr') {
        const textMatch = /<t[^>]*>([\s\S]*?)<\/t>/.exec(inner);
        value = textMatch ? decodeXmlEntities(textMatch[1]) : '';
      } else if (type === 's') {
        const vMatch = /<v>([\s\S]*?)<\/v>/.exec(inner);
        const idx = vMatch ? Number(vMatch[1]) : NaN;
        value = Number.isNaN(idx) ? '' : (sharedStrings[idx] ?? '');
      } else {
        const vMatch = /<v>([\s\S]*?)<\/v>/.exec(inner);
        value = vMatch ? decodeXmlEntities(vMatch[1]) : '';
      }

      cells[colIndex] = value;
    }
    rows.push(cells);
  }
  return rows;
}

/**
 * Reads a named sheet from an .xlsx workbook buffer.
 * @param {Buffer} buffer
 * @param {string} sheetName
 * @returns {{ headers: string[], rows: Record<string, string>[] }}
 */
export function readXlsxSheet(buffer, sheetName) {
  const workbookXml = readZipEntry(buffer, 'xl/workbook.xml').toString('utf8');
  const relsXml = readZipEntry(buffer, 'xl/_rels/workbook.xml.rels').toString('utf8');
  const sheetPath = resolveSheetPath(workbookXml, relsXml, sheetName);
  const sheetXml = readZipEntry(buffer, sheetPath).toString('utf8');

  let sharedStrings = [];
  if (listZipEntryNames(buffer).includes('xl/sharedStrings.xml')) {
    sharedStrings = parseSharedStrings(readZipEntry(buffer, 'xl/sharedStrings.xml').toString('utf8'));
  }

  const grid = parseSheetRows(sheetXml, sharedStrings);
  if (grid.length === 0) return { headers: [], rows: [] };

  const [headerRow, ...dataRows] = grid;
  const headers = headerRow.map((h, i) => h || `column_${i + 1}`);
  const rows = dataRows
    .filter((row) => row.some((cell) => cell !== undefined && cell !== ''))
    .map((row) => {
      const record = {};
      headers.forEach((header, i) => {
        record[header] = row[i] ?? '';
      });
      return record;
    });

  return { headers, rows };
}
