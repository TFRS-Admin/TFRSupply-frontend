import type { BaseEntity, Money } from './common';
import type { Price } from './commerce';

export interface ReviewFlag {
  code: string;
  severity: string;
  message: string;
  fieldPath?: string;
}

export interface QuoteLine {
  id: string;
  sku?: string;
  productId?: string;
  label: string;
  quantity: number;
  price?: Price;
  subtotal?: Money;
  reviewFlags?: ReviewFlag[];
}

export interface Quote extends BaseEntity {
  customerId?: string;
  verticalId?: string;
  status: string;
  lines: QuoteLine[];
  reviewFlags?: ReviewFlag[];
  total?: Money;
}

export interface QuotePayload {
  quote: Quote;
  source: string;
  submittedAt?: string;
  metadata?: Record<string, string | number | boolean | null>;
}
