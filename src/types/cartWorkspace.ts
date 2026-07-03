import type { ImageAsset, Metadata, Money } from './common';
import type { CartLineDraft, CommerceAvailabilityState } from './commerce';

export type CartLineConfigurationStatus = 'not-required' | 'complete' | 'incomplete' | 'unknown';
export type CartLineSource = 'product' | 'configurator' | 'package';
export type CartValidationSeverity = 'info' | 'warning' | 'error';

export interface CartLineItem {
  id: string;
  productId: string;
  sku: string;
  label: string;
  image?: ImageAsset;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
  availability: CommerceAvailabilityState;
  configurationStatus: CartLineConfigurationStatus;
  isPackage: boolean;
  packageId?: string;
  source?: CartLineSource;
  metadata?: Metadata;
}

export interface CartLineInput {
  productId: string;
  sku: string;
  label: string;
  image?: ImageAsset;
  quantity: number;
  unitPrice: Money;
  availability?: CommerceAvailabilityState;
  configurationStatus?: CartLineConfigurationStatus;
  isPackage?: boolean;
  packageId?: string;
  source?: CartLineSource;
  metadata?: Metadata;
}

export interface CartSummary {
  itemCount: number;
  lineCount: number;
  currencyCode: string;
  subtotal: Money;
  estimatedShipping: Money | null;
  estimatedTax: Money | null;
  grandTotalEstimate: Money;
}

export interface CartValidationIssue {
  code: string;
  severity: CartValidationSeverity;
  message: string;
  lineId?: string;
  fieldPath?: string;
}

export interface CartValidationResult {
  valid: boolean;
  issues: CartValidationIssue[];
}

export interface CartState {
  lines: CartLineItem[];
  summary: CartSummary;
}

export interface CartCheckoutLinePayload {
  lineId: string;
  sku: string;
  quantity: number;
  cartLineDraft: CartLineDraft | null;
  ready: boolean;
  message?: string;
}

export type CartCheckoutPreparationStatus = 'ready' | 'incomplete' | 'unavailable';

export interface CartCheckoutPreparationResult {
  status: CartCheckoutPreparationStatus;
  lines: CartCheckoutLinePayload[];
  summary: CartSummary;
  issues: CartValidationIssue[];
}
