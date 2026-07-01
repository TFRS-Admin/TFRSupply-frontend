import type { ContractPrice, DealerContract, DealerCost, ListPrice, PriceSource, PricingWarning, QuantityBreak } from './pricing';

export type PricingImportSourceKind = 'excel-workbook' | 'csv-file' | 'dealer-contract' | 'msrp-price-book' | 'bundle-definition' | 'quantity-break-table' | 'unknown';
export type PricingImportRecordKind = 'list-price' | 'dealer-cost' | 'contract-price' | 'dealer-contract' | 'bundle-pricing' | 'quantity-break';
export type PricingImportStatus = 'pending' | 'parsed' | 'normalized' | 'validated' | 'invalid' | 'failed';
export type PricingImportSeverity = 'info' | 'warning' | 'error';

export interface PricingImportSource {
  id: string;
  kind: PricingImportSourceKind;
  filename?: string;
  manufacturer?: string;
  dealerId?: string;
  agencyId?: string;
  contractId?: string;
  importedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface PricingParsedRow {
  rowNumber: number;
  sheetName?: string;
  values: Record<string, unknown>;
}

export interface PricingParsedDocument {
  source: PricingImportSource;
  rows: PricingParsedRow[];
}

export interface PricingImportIssue {
  code: string;
  severity: PricingImportSeverity;
  message: string;
  rowNumber?: number;
  sheetName?: string;
  fieldPath?: string;
  sku?: string;
}

export interface PricingNormalizedBaseRecord {
  importId: string;
  source: PricingImportSource;
  rowNumber?: number;
  sheetName?: string;
  sourceRow?: Record<string, unknown>;
}

export interface PricingNormalizedListPriceRecord extends PricingNormalizedBaseRecord {
  kind: 'list-price';
  record: ListPrice;
}

export interface PricingNormalizedDealerCostRecord extends PricingNormalizedBaseRecord {
  kind: 'dealer-cost';
  record: DealerCost;
}

export interface PricingNormalizedContractPriceRecord extends PricingNormalizedBaseRecord {
  kind: 'contract-price';
  record: ContractPrice;
}

export interface PricingNormalizedDealerContractRecord extends PricingNormalizedBaseRecord {
  kind: 'dealer-contract';
  record: DealerContract;
}

export interface PricingNormalizedQuantityBreakRecord extends PricingNormalizedBaseRecord {
  kind: 'quantity-break';
  record: QuantityBreak;
}

export interface PricingNormalizedBundleRecord extends PricingNormalizedBaseRecord {
  kind: 'bundle-pricing';
  record: {
    id: string;
    sku: string;
    items: Array<{ sku: string; quantity: number }>;
    source: PriceSource;
  };
}

export type PricingNormalizedRecord = PricingNormalizedListPriceRecord | PricingNormalizedDealerCostRecord | PricingNormalizedContractPriceRecord | PricingNormalizedDealerContractRecord | PricingNormalizedQuantityBreakRecord | PricingNormalizedBundleRecord;

export interface PricingImportValidationResult {
  validRecords: PricingNormalizedRecord[];
  invalidRecords: PricingNormalizedRecord[];
  issues: PricingImportIssue[];
}

export interface PricingImportResult {
  importId: string;
  source: PricingImportSource;
  status: PricingImportStatus;
  parsedRowCount: number;
  normalizedRecordCount: number;
  validRecordCount: number;
  invalidRecordCount: number;
  records: PricingNormalizedRecord[];
  issues: PricingImportIssue[];
  pricingWarnings?: PricingWarning[];
}

export interface PricingImportParser<TInput = unknown> {
  readonly sourceKind: PricingImportSourceKind;
  parse(input: TInput, source: PricingImportSource): Promise<PricingParsedDocument> | PricingParsedDocument;
}

export interface PricingImportNormalizer {
  normalize(document: PricingParsedDocument): Promise<PricingNormalizedRecord[]> | PricingNormalizedRecord[];
}

export interface PricingImportValidator {
  validate(records: PricingNormalizedRecord[]): PricingImportValidationResult;
}

export interface PricingImportRequest<TInput = unknown> {
  input: TInput;
  source: PricingImportSource;
  parser: PricingImportParser<TInput>;
  normalizer: PricingImportNormalizer;
}
