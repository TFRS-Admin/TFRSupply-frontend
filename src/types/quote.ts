import type { BaseEntity, Metadata, Money } from './common';
import type { Price } from './commerce';
import type { PackageAssemblyResult, PackageDefinition } from './package';
import type { QuotePricingResult, PricingSubject } from './pricing';
import type { Vehicle } from './vehicle';

export type QuoteReviewFlagSeverity = 'info' | 'warning' | 'error' | 'review-required';
export type QuoteApprovalStatus = 'draft' | 'pending-review' | 'approved' | 'rejected' | 'changes-requested' | 'expired' | 'unknown';
export type QuoteWorkflowStatus = 'draft' | 'assembling' | 'ready-for-review' | 'in-review' | 'approved' | 'rejected' | 'submitted' | 'cancelled';
export type QuoteLineItemType = 'product' | 'accessory' | 'service' | 'kit' | 'package' | 'custom';
export type QuoteBuilderResultStatus = 'draft' | 'pending' | 'assembled' | 'invalid' | 'unavailable';

export interface ReviewFlag {
  code: string;
  severity: QuoteReviewFlagSeverity;
  message: string;
  fieldPath?: string;
  lineId?: string;
  source?: 'quote-builder' | 'package-builder' | 'pricing' | 'commerce' | 'approval' | 'customer' | 'unknown';
}

export interface QuoteCustomerMetadata extends Metadata {
  customerId?: string;
  agencyName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  billingReference?: string;
  accountNumber?: string;
}

export interface QuotePackageReference {
  packageId: string;
  packageRevision?: string;
  packageName?: string;
  definition?: PackageDefinition;
  assembly?: PackageAssemblyResult;
}

export interface QuotePricingReference {
  pricingRequestId?: string;
  pricingResultId?: string;
  status?: string;
  subject?: PricingSubject;
  result?: QuotePricingResult;
  warnings?: ReviewFlag[];
}

export interface QuoteWorkflowState {
  status: QuoteWorkflowStatus;
  approvalStatus: QuoteApprovalStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  expiresAt?: string;
  reviewFlags?: ReviewFlag[];
}

export interface QuoteLineAssemblyInput {
  id?: string;
  lineType: QuoteLineItemType;
  label: string;
  quantity: number;
  sku?: string;
  productId?: string;
  packageReference?: QuotePackageReference;
  pricingReference?: QuotePricingReference;
  metadata?: Metadata;
}

export interface QuoteLine {
  id: string;
  sku?: string;
  productId?: string;
  label: string;
  quantity: number;
  lineType?: QuoteLineItemType;
  packageReference?: QuotePackageReference;
  pricingReference?: QuotePricingReference;
  price?: Price;
  subtotal?: Money;
  reviewFlags?: ReviewFlag[];
  metadata?: Metadata;
}

export interface QuoteAssemblyInput {
  draftId?: string;
  customer: QuoteCustomerMetadata;
  verticalId?: string;
  vehicle?: Vehicle;
  lines: QuoteLineAssemblyInput[];
  packageReferences?: QuotePackageReference[];
  pricingReference?: QuotePricingReference;
  workflow?: Partial<QuoteWorkflowState>;
  metadata?: Metadata;
}

export interface QuoteDraft extends BaseEntity {
  customer: QuoteCustomerMetadata;
  verticalId?: string;
  vehicle?: Vehicle;
  lines: QuoteLine[];
  packageReferences?: QuotePackageReference[];
  pricingReference?: QuotePricingReference;
  workflow: QuoteWorkflowState;
  reviewFlags?: ReviewFlag[];
  metadata?: Metadata;
}

export interface Quote extends BaseEntity {
  customerId?: string;
  customer?: QuoteCustomerMetadata;
  verticalId?: string;
  status: string;
  approvalStatus?: QuoteApprovalStatus;
  workflow?: QuoteWorkflowState;
  lines: QuoteLine[];
  packageReferences?: QuotePackageReference[];
  pricingReference?: QuotePricingReference;
  reviewFlags?: ReviewFlag[];
  total?: Money;
  metadata?: Metadata;
}

export interface QuoteAssemblyResult {
  status: QuoteBuilderResultStatus;
  draft: QuoteDraft | null;
  reviewFlags: ReviewFlag[];
}

export interface QuoteValidationResult {
  valid: boolean;
  reviewFlags: ReviewFlag[];
}

export interface QuotePayload {
  quote: Quote;
  source: string;
  submittedAt?: string;
  metadata?: Record<string, string | number | boolean | null>;
}
