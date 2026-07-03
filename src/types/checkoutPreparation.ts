import type { Money } from './common';
import type { CartLineItem, CartValidationResult } from './cartWorkspace';
import type { VariantMapping } from './commerce';

export type CheckoutIssueCategory = 'cart' | 'configuration' | 'package' | 'pricing' | 'commerce';

export type CheckoutLineReadiness = 'ready' | 'warning' | 'blocked';

export type CheckoutReadinessStatus = 'ready' | 'blocked';

export interface CheckoutPreparationRequest {
  /** Optional explicit line list; defaults to the live Cart Workspace state when omitted. */
  lines?: CartLineItem[];
}

export interface CheckoutWarning {
  code: string;
  category: CheckoutIssueCategory;
  message: string;
  lineId?: string;
}

export interface CheckoutBlocker {
  code: string;
  category: CheckoutIssueCategory;
  message: string;
  lineId?: string;
}

export interface CheckoutLineValidation {
  lineId: string;
  sku: string;
  cartValid: boolean;
  configurationValid: boolean;
  packageValid: boolean;
  pricingAvailable: boolean;
  commerceAvailable: boolean;
  readiness: CheckoutLineReadiness;
  blockers: CheckoutBlocker[];
  warnings: CheckoutWarning[];
}

export interface CheckoutPayloadPreviewLine {
  sku: string;
  quantity: number;
  variantMapping: VariantMapping;
}

export interface CheckoutPayloadPreview {
  currencyCode: string;
  lines: CheckoutPayloadPreviewLine[];
  estimatedTotal: Money;
}

export interface CheckoutPreparationResult {
  status: CheckoutReadinessStatus;
  cartValidation: CartValidationResult;
  lineValidations: CheckoutLineValidation[];
  blockers: CheckoutBlocker[];
  warnings: CheckoutWarning[];
  payloadPreview: CheckoutPayloadPreview | null;
}
