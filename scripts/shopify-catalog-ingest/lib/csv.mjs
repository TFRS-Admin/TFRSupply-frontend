/**
 * lib/csv.mjs
 *
 * Minimal RFC4180 CSV parser. Shopify product exports embed raw HTML
 * (commas, quotes, literal newlines) inside quoted fields, so a naive
 * line-split parser silently corrupts rows — this walks the text
 * character-by-character instead.
 */

/**
 * @param {string} text
 * @returns {{ headers: string[], rows: Record<string, string>[] }}
 */
export function parseCsv(text) {
  const table = parseCsvRows(text);
  if (table.length === 0) return { headers: [], rows: [] };

  const [headers, ...dataRows] = table;
  const rows = dataRows
    .filter((row) => !(row.length === 1 && row[0] === ''))
    .map((row) => {
      const record = {};
      headers.forEach((header, i) => {
        record[header] = row[i] ?? '';
      });
      return record;
    });

  return { headers, rows };
}

/** @param {string} text @returns {string[][]} */
function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\r') {
      // handled by the following \n (or a lone \r line ending)
      if (text[i + 1] !== '\n') {
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
      }
    } else if (ch === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}
