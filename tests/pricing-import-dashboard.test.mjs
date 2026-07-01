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
    domain: await server.ssrLoadModule('/src/domain/pricingImportDashboard/index.ts'),
    service: await server.ssrLoadModule('/src/services/pricingImportDashboard/pricingImportDashboardService.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/pricingImportDashboard.schema.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/pricingImportDashboard/usePricingImportDashboard.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/pricingImportDashboard/mockPricingImportAdapters.ts'),
  };
});

after(async () => {
  await server?.close();
});

const priceSource = { id: 'source-1', label: 'Test Source', sourceType: 'federal-signal-msrp', priority: 4, currencyCode: 'USD' };
const importSource = { id: 'import-1', kind: 'csv-file' };

function listPriceRecord(sku, amount, rowNumber) {
  return {
    importId: 'import-1',
    source: importSource,
    kind: 'list-price',
    rowNumber,
    record: { id: `lp-${sku}-${rowNumber}`, label: `${sku} MSRP`, sku, price: { amount, currencyCode: 'USD' }, source: priceSource },
  };
}

function dealerCostRecord(sku, amount, rowNumber) {
  return {
    importId: 'import-1',
    source: importSource,
    kind: 'dealer-cost',
    rowNumber,
    record: { id: `dc-${sku}-${rowNumber}`, label: `${sku} Cost`, sku, cost: { amount, currencyCode: 'USD' }, source: priceSource },
  };
}

const rowParser = {
  sourceKind: 'csv-file',
  parse(input, source) {
    return { source, rows: input.map((values, index) => ({ rowNumber: index + 2, values })) };
  },
};

const listPriceNormalizer = {
  normalize(document) {
    return document.rows.map((row) => ({
      importId: document.source.id,
      source: document.source,
      kind: 'list-price',
      rowNumber: row.rowNumber,
      record: {
        id: `lp-${row.values.sku}-${row.rowNumber}`,
        label: `${row.values.sku || 'UNKNOWN'} MSRP`,
        sku: row.values.sku,
        price: { amount: row.values.msrp, currencyCode: 'USD' },
        source: priceSource,
      },
    }));
  },
};

describe('pricing import dashboard — duplicate detection domain', () => {
  it('flags records that share the same kind and SKU across runs', () => {
    const { detectDuplicateRecords } = modules.domain;
    const duplicates = detectDuplicateRecords([
      { runId: 'run-1', records: [listPriceRecord('SKU-A', 100, 2)] },
      { runId: 'run-2', records: [listPriceRecord('SKU-A', 105, 2)] },
    ]);

    assert.equal(duplicates.length, 1);
    assert.equal(duplicates[0].count, 2);
    assert.deepEqual([...duplicates[0].runIds].sort(), ['run-1', 'run-2']);
  });

  it('does not flag the same SKU as a duplicate across different record kinds', () => {
    const { detectDuplicateRecords } = modules.domain;
    const duplicates = detectDuplicateRecords([
      { runId: 'run-1', records: [listPriceRecord('SKU-B', 100, 2)] },
      { runId: 'run-2', records: [dealerCostRecord('SKU-B', 80, 2)] },
    ]);

    assert.equal(duplicates.length, 0);
  });
});

describe('pricing import dashboard — service aggregation', () => {
  it('aggregates parsed rows, valid/invalid counts, history order, and duplicates from injected runs', async () => {
    const { createPricingImportDashboardService } = modules.service;

    const runA = {
      id: 'run-a',
      label: 'Run A',
      source: { id: 'import-a', kind: 'csv-file' },
      input: [{ sku: 'DUP-SKU', msrp: 100 }, { sku: '', msrp: 50 }],
      parser: rowParser,
      normalizer: listPriceNormalizer,
      startedAt: '2026-06-01T00:00:00.000Z',
      completedAt: '2026-06-01T00:00:01.000Z',
    };
    const runB = {
      id: 'run-b',
      label: 'Run B',
      source: { id: 'import-b', kind: 'csv-file' },
      input: [{ sku: 'DUP-SKU', msrp: 100 }],
      parser: rowParser,
      normalizer: listPriceNormalizer,
      startedAt: '2026-06-02T00:00:00.000Z',
      completedAt: '2026-06-02T00:00:01.000Z',
    };

    const dashboardService = createPricingImportDashboardService({ runDefinitions: [runA, runB], now: () => '2026-07-01T00:00:00.000Z' });
    const dashboard = await dashboardService.loadDashboard();

    assert.equal(dashboard.generatedAt, '2026-07-01T00:00:00.000Z');
    assert.equal(dashboard.summary.totalRuns, 2);
    assert.equal(dashboard.summary.totalParsedRows, 3);
    assert.equal(dashboard.summary.totalValidRecords, 2);
    assert.equal(dashboard.summary.totalInvalidRecords, 1);
    assert.equal(dashboard.history[0].runId, 'run-b');
    assert.equal(dashboard.history[1].runId, 'run-a');
    assert.equal(dashboard.duplicates.length, 1);
    assert.equal(dashboard.duplicates[0].sku, 'DUP-SKU');
    assert.equal(dashboard.statistics.duplicateRecordCount, 1);
  });

  it('captures a parser failure as a failed run instead of throwing', async () => {
    const { createPricingImportDashboardService } = modules.service;

    const throwingParser = {
      sourceKind: 'excel-workbook',
      parse() {
        throw new Error('Unable to read workbook.');
      },
    };
    const failingRun = {
      id: 'run-fail',
      label: 'Failing Run',
      source: { id: 'import-fail', kind: 'excel-workbook' },
      input: [],
      parser: throwingParser,
      normalizer: listPriceNormalizer,
      startedAt: '2026-06-03T00:00:00.000Z',
      completedAt: '2026-06-03T00:00:01.000Z',
    };

    const dashboard = await createPricingImportDashboardService({ runDefinitions: [failingRun] }).loadDashboard();

    assert.equal(dashboard.runs[0].uploadStatus, 'failed');
    assert.equal(dashboard.runs[0].result.status, 'failed');
    assert.equal(dashboard.runs[0].result.issues[0].message, 'Unable to read workbook.');
    assert.equal(dashboard.summary.totalRuns, 1);
  });

  it('produces a schema-valid dashboard from the default mock run definitions, including a failed run and duplicates', async () => {
    const { pricingImportDashboardService } = modules.service;
    const { pricingImportDashboardDataSchema } = modules.schemas;
    const { mockPricingImportRunDefinitions } = modules.adapters;

    const dashboard = await pricingImportDashboardService.loadDashboard();
    const parsed = pricingImportDashboardDataSchema.parse(dashboard);

    assert.equal(parsed.runs.length, mockPricingImportRunDefinitions.length);
    assert.ok(parsed.duplicates.length > 0, 'expected at least one duplicate group from mock fixtures');
    assert.ok(parsed.runs.some((run) => run.uploadStatus === 'failed'), 'expected the corrupt workbook run to be marked failed');
    assert.ok(parsed.summary.totalInvalidRecords > 0, 'expected at least one invalid record from mock fixtures');
  });
});

describe('pricing import dashboard — hook', () => {
  it('exposes typed dashboard state without loading during render', () => {
    const { usePricingImportDashboard } = modules.hooks;
    function HookProbe() {
      const state = usePricingImportDashboard();
      return React.createElement('span', {
        'data-loading': String(state.loading),
        'data-has-data': String(Boolean(state.data)),
        'data-has-error': String(Boolean(state.error)),
        'data-has-action': String(typeof state.loadDashboard === 'function'),
      });
    }

    const html = renderToString(React.createElement(HookProbe));
    assert.match(html, /data-loading="false"/);
    assert.match(html, /data-has-data="false"/);
    assert.match(html, /data-has-action="true"/);
  });
});
