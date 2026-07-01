import type { BaseEntity, Money } from './common';

export type PricingCurrencyCode = 'USD' | string;
export type PriceSourceType = 'federal-signal-msrp' | 'dealer-cost' | 'dealer-contract' | 'promotional-bundle' | 'quantity-break' | 'quote' | 'manual' | 'unknown';
export type PricingWarningSeverity = 'info' | 'warning' | 'error' | 'review-required';
export type PricingResultStatus = 'priced' | 'pending' | 'not-found' | 'invalid' | 'unavailable';

export interface PriceSource extends BaseEntity {
  sourceType: PriceSourceType;
  priority: number;
  currencyCode: PricingCurrencyCode;
  name?: string;
  effectiveAt?: string;
  expiresAt?: string;
}

export interface PricingSubject {
  sku: string;
  productId?: string;
  variantId?: string;
}

export interface PricingContext {
  pricingDate: string;
  currencyCode: PricingCurrencyCode;
  dealerId?: string;
  agencyId?: string;
  contractId?: string;
  promotionCodes?: string[];
}

export interface PricingLineInput extends PricingSubject {
  quantity: number;
  requestedUnitPrice?: Money;
}

export interface BundlePricingInput extends BaseEntity {
  promotionCode?: string;
  context: PricingContext;
  items: PricingLineInput[];
}

export interface QuotePricingInput {
  quoteId?: string;
  context: PricingContext;
  lines: PricingLineInput[];
}

export interface ListPrice extends BaseEntity, PricingSubject {
  price: Money;
  source: PriceSource;
  effectiveAt?: string;
}

export interface DealerCost extends BaseEntity, PricingSubject {
  cost: Money;
  source: PriceSource;
  effectiveAt?: string;
}

export interface QuantityBreak extends BaseEntity {
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: Money;
  discountPercent?: number;
}

export interface ContractWindow extends BaseEntity {
  startsAt: string;
  endsAt: string;
  timezone?: string;
  expirationAlertDays?: number;
}

export interface ContractPrice extends BaseEntity, PricingSubject {
  contractId: string;
  sellingPrice: Money;
  dealerCost?: DealerCost;
  listPrice?: ListPrice;
  quantityBreaks?: QuantityBreak[];
  window?: ContractWindow;
}

export interface DealerContract extends BaseEntity {
  dealerId?: string;
  agencyId?: string;
  contractNumber?: string;
  source: PriceSource;
  window: ContractWindow;
  prices?: ContractPrice[];
}

export interface Margin {
  revenue: Money;
  cost: Money;
  grossProfit: Money;
  grossMarginPercent: number;
}

export interface PricingCalculationContract<TInput, TResult> {
  readonly calculationType: string;
  validateInput(input: unknown): TInput;
  validateOutput(output: unknown): TResult;
}

export interface PricingWarning {
  code: string;
  severity: PricingWarningSeverity;
  message: string;
  sku?: string;
  productId?: string;
  fieldPath?: string;
}

export interface PricingResolution<T> {
  status: PricingResultStatus;
  data: T | null;
  warnings?: PricingWarning[];
  message?: string;
}

export interface BundlePricingItem extends PricingSubject {
  quantity: number;
  listPrice?: ListPrice;
  dealerCost?: DealerCost;
  contractPrice?: ContractPrice;
  appliedQuantityBreak?: QuantityBreak;
}

export interface BundlePricing extends BaseEntity {
  items: BundlePricingItem[];
  listPrice?: Money;
  sellingPrice?: Money;
  dealerCost?: Money;
  margin?: Margin;
  source?: PriceSource;
  warnings?: PricingWarning[];
}

export interface PromotionalBundle extends BundlePricing {
  promotionCode?: string;
  window?: ContractWindow;
}

export interface QuotePricingLine extends PricingSubject {
  id: string;
  quantity: number;
  listPrice?: ListPrice;
  dealerCost?: DealerCost;
  contractPrice?: ContractPrice;
  appliedQuantityBreak?: QuantityBreak;
  sellingPrice?: Money;
  margin?: Margin;
  warnings?: PricingWarning[];
}

export interface QuotePricingResult {
  quoteId?: string;
  source: PriceSource;
  lines: QuotePricingLine[];
  subtotal: Money;
  margin?: Margin;
  warnings?: PricingWarning[];
}
