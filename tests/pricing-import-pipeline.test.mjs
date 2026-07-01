import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    service: await server.ssrLoadModule('/src/services/pricingImport/pricingImportService.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/pricingImport/usePricingImport.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/pricingImport.schema.ts'),
  };
});

after(async () => {
  await server?.close();
});

const source = { id: 'import-1', kind: 'msrp-price-book', filename: 'fedsig-msrp.csv', manufacturer: 'Federal Signal' };
const priceSource = { id: 'source-1', label: 'Federal Signal MSRP', sourceType: 'federal-signal-msrp', priority: 4, currencyCode: 'USD' };

const parser = {
  sourceKind: 'csv-file',
  parse(input, importSource) {
    return {
      source: importSource,
      rows: input.map((values, index) => ({ rowNumber: index + 2, values })),
    };
  },
};

const normalizer = {
  normalize(document) {
    return document.rows.map((row) => ({
      importId: document.source.id,
      source: document.source,
      kind: 'list-price',
      rowNumber: row.rowNumber,
      sourceRow: row.values,
      record: {
        id: `msrp-${row.values.sku}`,
        label: `${row.values.sku} MSRP`,
        sku: row.values.sku,
        price: { amount: row.values.msrp, currencyCode: 'USD' },
        source: priceSource,
      },
    }));
  },
};

describe('pricing import pipeline', () => {
  it('parses, normalizes, and validates records before entering pricing domain', async () => {
    const { pricingImportService } = modules.service;
    const result = await pricingImportService.importPricing({
      input: [{ sku: 'NVG-SERIAL', msrp: 1200 }],
      source,
      parser,
      normalizer,
    });

    assert.equal(result.status, 'validated');
    assert.equal(result.parsedRowCount, 1);
    assert.equal(result.validRecordCount, 1);
    assert.equal(result.records[0].record.price.amount, 1200);
  });

  it('returns validation issues for invalid normalized records', async () => {
    const { pricingImportService } = modules.service;
    const result = await pricingImportService.importPricing({
      input: [{ sku: '', msrp: 1200 }],
      source,
      parser,
      normalizer,
    });

    assert.equal(result.status, 'invalid');
    assert.equal(result.validRecordCount, 0);
    assert.equal(result.invalidRecordCount, 1);
    assert.match(result.issues[0].fieldPath, /record\.sku/);
  });

  it('defines source, normalized record, and import result schemas', () => {
    const { pricingImportResultSchema } = modules.schemas;
    const parsed = pricingImportResultSchema.parse({
      importId: 'import-2',
      source,
      status: 'validated',
      parsedRowCount: 0,
      normalizedRecordCount: 0,
      validRecordCount: 0,
      invalidRecordCount: 0,
      records: [],
      issues: [],
    });

    assert.equal(parsed.source.kind, 'msrp-price-book');
  });

  it('exposes a typed hook without starting imports during render', () => {
    const { usePricingImport } = modules.hooks;
    function HookProbe() {
      const state = usePricingImport();
      return React.createElement('span', {
        'data-loading': String(state.loading),
        'data-has-result': String(Boolean(state.result)),
        'data-has-error': String(Boolean(state.error)),
        'data-has-action': String(typeof state.importPricing === 'function'),
      });
    }

    const html = renderToString(React.createElement(HookProbe));
    assert.match(html, /data-loading="false"/);
    assert.match(html, /data-has-action="true"/);
  });
});
