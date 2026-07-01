import type { BaseEntity, Money } from './common';

export interface PriceSource extends BaseEntity {
  sourceType: string;
  priority: number;
  currencyCode: string;
  effectiveAt?: string;
  expiresAt?: string;
}

export interface ListPrice extends BaseEntity {
  sku: string;
  productId?: string;
  price: Money;
  source: PriceSource;
  effectiveAt?: string;
}

export interface DealerCost extends BaseEntity {
  sku: string;
  productId?: string;
  cost: Money;
  source: PriceSource;
  effectiveAt?: string;
}

export interface QuantityBreak extends BaseEntity {
  minQuantity: number;
  maxQuantity?: number;
  price: Money;
  discountPercent?: number;
}

export interface ContractWindow extends BaseEntity {
  startsAt: string;
  endsAt: string;
  timezone?: string;
  expirationAlertDays?: number;
}

export interface ContractPrice extends BaseEntity {
  sku: string;
  productId?: string;
  contractId: string;
  sellingPrice: Money;
  dealerCost?: DealerCost;
  listPrice?: ListPrice;
  quantityBreaks?: QuantityBreak[];
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

export interface BundlePricingItem {
  sku: string;
  productId?: string;
  quantity: number;
  listPrice?: ListPrice;
  dealerCost?: DealerCost;
  contractPrice?: ContractPrice;
}

export interface BundlePricing extends BaseEntity {
  items: BundlePricingItem[];
  listPrice?: Money;
  sellingPrice?: Money;
  dealerCost?: Money;
  margin?: Margin;
}

export interface PricingWarning {
  code: string;
  severity: string;
  message: string;
  sku?: string;
  productId?: string;
  fieldPath?: string;
}

export interface PromotionalBundle extends BundlePricing {
  promotionCode?: string;
  window?: ContractWindow;
  warnings?: PricingWarning[];
}

export interface QuotePricingLine {
  id: string;
  sku?: string;
  productId?: string;
  quantity: number;
  listPrice?: ListPrice;
  dealerCost?: DealerCost;
  contractPrice?: ContractPrice;
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
