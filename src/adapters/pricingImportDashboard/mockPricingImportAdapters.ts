import type {
  PricingImportNormalizer,
  PricingImportParser,
  PricingImportSource,
  PricingImportSourceKind,
  PricingNormalizedRecord,
  PricingParsedDocument,
} from '@/types/pricingImport';
import type { PriceSource } from '@/types/pricing';

/**
 * Mock parser/normalizer pairs standing in for future concrete parsers (SheetJS-style
 * Excel readers, CSV readers, Federal Signal price book importers, dealer contract
 * ingestion, and promotional bundle definitions). No file storage, live parsing, or
 * network access happens here — every row is an inline fixture so the dashboard can
 * demonstrate the pricing import pipeline without live uploads.
 */
export interface MockPricingImportRunDefinition<TInput = Array<Record<string, unknown>>> {
  id: string;
  label: string;
  source: PricingImportSource;
  input: TInput;
  parser: PricingImportParser<TInput>;
  normalizer: PricingImportNormalizer;
  startedAt: string;
  completedAt: string;
}

type MockRow = Record<string, unknown>;

function createRowParser(sourceKind: PricingImportSourceKind): PricingImportParser<MockRow[]> {
  return {
    sourceKind,
    parse(input, source): PricingParsedDocument {
      return {
        source,
        rows: input.map((values, index) => ({ rowNumber: index + 2, values })),
      };
    },
  };
}

function createThrowingParser(sourceKind: PricingImportSourceKind, message: string): PricingImportParser<MockRow[]> {
  return {
    sourceKind,
    parse(): PricingParsedDocument {
      throw new Error(message);
    },
  };
}

const federalSignalMsrpPriceSource: PriceSource = { id: 'source-fedsig-msrp', label: 'Federal Signal MSRP', sourceType: 'federal-signal-msrp', priority: 4, currencyCode: 'USD' };
const dealerCostPriceSource: PriceSource = { id: 'source-dealer-cost', label: 'Dealer Cost Import', sourceType: 'dealer-cost', priority: 2, currencyCode: 'USD' };
const dealerContractPriceSource: PriceSource = { id: 'source-dealer-contract', label: 'Dealer Contract Import', sourceType: 'dealer-contract', priority: 8, currencyCode: 'USD' };
const promotionalBundlePriceSource: PriceSource = { id: 'source-promo-bundle', label: 'Promotional Bundle Import', sourceType: 'promotional-bundle', priority: 6, currencyCode: 'USD' };

function createListPriceNormalizer(priceSource: PriceSource): PricingImportNormalizer {
  return {
    normalize(document): PricingNormalizedRecord[] {
      return document.rows.map((row) => ({
        importId: document.source.id,
        source: document.source,
        kind: 'list-price',
        rowNumber: row.rowNumber,
        sheetName: row.sheetName,
        sourceRow: row.values,
        record: {
          id: `list-price-${document.source.id}-${row.rowNumber}`,
          label: `${row.values.sku || 'UNKNOWN'} MSRP`,
          sku: row.values.sku as string,
          price: { amount: row.values.msrp as number, currencyCode: 'USD' },
          source: priceSource,
        },
      }));
    },
  };
}

function createDealerCostNormalizer(priceSource: PriceSource): PricingImportNormalizer {
  return {
    normalize(document): PricingNormalizedRecord[] {
      return document.rows.map((row) => ({
        importId: document.source.id,
        source: document.source,
        kind: 'dealer-cost',
        rowNumber: row.rowNumber,
        sheetName: row.sheetName,
        sourceRow: row.values,
        record: {
          id: `dealer-cost-${document.source.id}-${row.rowNumber}`,
          label: `${row.values.sku || 'UNKNOWN'} Dealer Cost`,
          sku: row.values.sku as string,
          cost: { amount: row.values.cost as number, currencyCode: 'USD' },
          source: priceSource,
        },
      }));
    },
  };
}

const dealerContractNormalizer: PricingImportNormalizer = {
  normalize(document): PricingNormalizedRecord[] {
    return document.rows.map((row) => ({
      importId: document.source.id,
      source: document.source,
      kind: 'dealer-contract',
      rowNumber: row.rowNumber,
      sheetName: row.sheetName,
      sourceRow: row.values,
      record: {
        id: `dealer-contract-${document.source.id}-${row.rowNumber}`,
        label: `${row.values.contractNumber || 'Contract'} — ${row.values.dealerId || 'Unknown Dealer'}`,
        dealerId: row.values.dealerId as string | undefined,
        contractNumber: row.values.contractNumber as string | undefined,
        source: dealerContractPriceSource,
        window: {
          id: `window-${document.source.id}-${row.rowNumber}`,
          label: 'Contract Window',
          startsAt: row.values.startsAt as string,
          endsAt: row.values.endsAt as string,
        },
        prices: [
          {
            id: `contract-price-${document.source.id}-${row.rowNumber}`,
            label: `${row.values.sku} Contract Price`,
            sku: row.values.sku as string,
            contractId: `contract-${document.source.id}-${row.rowNumber}`,
            sellingPrice: { amount: row.values.sellingPrice as number, currencyCode: 'USD' },
          },
        ],
      },
    }));
  },
};

const promotionalBundleNormalizer: PricingImportNormalizer = {
  normalize(document): PricingNormalizedRecord[] {
    return document.rows.map((row) => ({
      importId: document.source.id,
      source: document.source,
      kind: 'bundle-pricing',
      rowNumber: row.rowNumber,
      sheetName: row.sheetName,
      sourceRow: row.values,
      record: {
        id: (row.values.id as string) || `bundle-${document.source.id}-${row.rowNumber}`,
        sku: row.values.sku as string,
        items: row.values.items as Array<{ sku: string; quantity: number }>,
        source: promotionalBundlePriceSource,
      },
    }));
  },
};

const excelWorkbookRun: MockPricingImportRunDefinition = {
  id: 'run-excel-fedsig-msrp',
  label: 'Federal Signal MSRP — Excel Workbook',
  source: { id: 'import-excel-fedsig-msrp', kind: 'excel-workbook', filename: 'fedsig-msrp-2026.xlsx', manufacturer: 'Federal Signal', importedAt: '2026-06-30T09:15:00.000Z' },
  input: [
    { sku: 'FS-LB-100', msrp: 1899 },
    { sku: 'FS-LB-200', msrp: 2599 },
    { sku: 'FS-LB-100', msrp: 1899 },
    { sku: '', msrp: 450 },
  ],
  parser: createRowParser('excel-workbook'),
  normalizer: createListPriceNormalizer(federalSignalMsrpPriceSource),
  startedAt: '2026-06-30T09:15:00.000Z',
  completedAt: '2026-06-30T09:15:04.000Z',
};

const csvDealerCostRun: MockPricingImportRunDefinition = {
  id: 'run-csv-dealer-cost',
  label: 'Dealer Cost — CSV File',
  source: { id: 'import-csv-dealer-cost', kind: 'csv-file', filename: 'dealer-cost-2026-q3.csv', dealerId: 'dealer-1001', importedAt: '2026-06-30T10:02:00.000Z' },
  input: [
    { sku: 'FS-LB-100', cost: 1200 },
    { sku: 'FS-SP-300', cost: 340 },
    { sku: '', cost: 90 },
  ],
  parser: createRowParser('csv-file'),
  normalizer: createDealerCostNormalizer(dealerCostPriceSource),
  startedAt: '2026-06-30T10:02:00.000Z',
  completedAt: '2026-06-30T10:02:02.000Z',
};

const msrpPriceBookRun: MockPricingImportRunDefinition = {
  id: 'run-msrp-price-book',
  label: 'Federal Signal MSRP Price Book',
  source: { id: 'import-msrp-price-book', kind: 'msrp-price-book', filename: 'fedsig-price-book-2026.pdf', manufacturer: 'Federal Signal', importedAt: '2026-06-30T11:30:00.000Z' },
  input: [
    { sku: 'FS-SP-300', msrp: 499 },
    { sku: 'FS-SIREN-500', msrp: 799 },
    { sku: 'FS-LB-200', msrp: 2650 },
  ],
  parser: createRowParser('msrp-price-book'),
  normalizer: createListPriceNormalizer(federalSignalMsrpPriceSource),
  startedAt: '2026-06-30T11:30:00.000Z',
  completedAt: '2026-06-30T11:30:03.000Z',
};

const dealerContractRun: MockPricingImportRunDefinition = {
  id: 'run-dealer-contract',
  label: 'Municipal Dealer Contracts',
  source: { id: 'import-dealer-contract', kind: 'dealer-contract', filename: 'dealer-contracts-2026.csv', dealerId: 'dealer-1001', importedAt: '2026-06-30T13:45:00.000Z' },
  input: [
    { contractNumber: 'DC-2026-01', dealerId: 'dealer-1001', sku: 'FS-LB-100', sellingPrice: 1650, startsAt: '2026-01-01', endsAt: '2026-12-31' },
    { contractNumber: 'DC-2026-02', dealerId: 'dealer-1002', sku: 'FS-SP-300', sellingPrice: 420, startsAt: '2026-01-01', endsAt: '2026-12-31' },
    { contractNumber: '', dealerId: 'dealer-1003', sku: 'FS-SIREN-500', sellingPrice: 700, endsAt: '2026-12-31' },
  ],
  parser: createRowParser('dealer-contract'),
  normalizer: dealerContractNormalizer,
  startedAt: '2026-06-30T13:45:00.000Z',
  completedAt: '2026-06-30T13:45:05.000Z',
};

const promotionalBundleRun: MockPricingImportRunDefinition = {
  id: 'run-promotional-bundle',
  label: 'Promotional Bundle Definitions',
  source: { id: 'import-promotional-bundle', kind: 'bundle-definition', filename: 'promo-bundles-2026.xlsx', importedAt: '2026-06-30T14:20:00.000Z' },
  input: [
    { id: 'bundle-lightbar-siren', sku: 'BUNDLE-001', items: [{ sku: 'FS-LB-100', quantity: 1 }, { sku: 'FS-SIREN-500', quantity: 1 }] },
    { id: 'bundle-safety-pack', sku: 'BUNDLE-002', items: [{ sku: 'FS-SP-300', quantity: 2 }] },
    { id: 'bundle-invalid', sku: '', items: [] },
  ],
  parser: createRowParser('bundle-definition'),
  normalizer: promotionalBundleNormalizer,
  startedAt: '2026-06-30T14:20:00.000Z',
  completedAt: '2026-06-30T14:20:03.000Z',
};

const corruptWorkbookRun: MockPricingImportRunDefinition = {
  id: 'run-corrupt-workbook',
  label: 'Corrupt Excel Workbook (Parse Failure)',
  source: { id: 'import-corrupt-workbook', kind: 'excel-workbook', filename: 'corrupt-price-list.xlsx', importedAt: '2026-06-30T15:05:00.000Z' },
  input: [{ sku: 'FS-LB-100', msrp: 1899 }],
  parser: createThrowingParser('excel-workbook', 'Unable to parse workbook: unsupported cell format on sheet "Prices".'),
  normalizer: createListPriceNormalizer(federalSignalMsrpPriceSource),
  startedAt: '2026-06-30T15:05:00.000Z',
  completedAt: '2026-06-30T15:05:01.000Z',
};

export const mockPricingImportRunDefinitions: MockPricingImportRunDefinition[] = [
  excelWorkbookRun,
  csvDealerCostRun,
  msrpPriceBookRun,
  dealerContractRun,
  promotionalBundleRun,
  corruptWorkbookRun,
];
