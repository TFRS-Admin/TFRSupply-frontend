import type { BaseEntity, Metadata, Money } from './common';
import type { CommerceLookupResult, Price, ShopifyProduct, VariantMapping } from './commerce';
import type { PackageAssemblyInput, PackageAssemblyResult, PackageDefinition } from './package';
import type { PricingContext, PricingResolution, QuotePricingResult, PricingSubject } from './pricing';
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
  submittedBy?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  changesRequestedAt?: string;
  changesRequestedBy?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  reviewerAssignment?: QuoteReviewerAssignment;
  auditTrail?: QuoteApprovalAuditEvent[];
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

export interface QuotePipelinePackageInput extends PackageAssemblyInput {
  packageId: string;
}

export interface QuotePipelineLineInput extends QuoteLineAssemblyInput {
  configuratorId?: string;
}

export interface QuotePipelineInput {
  draftId?: string;
  customer: QuoteCustomerMetadata;
  verticalId?: string;
  vehicle?: Vehicle;
  lines: QuotePipelineLineInput[];
  packages?: QuotePipelinePackageInput[];
  pricingContext: PricingContext;
  metadata?: Metadata;
}

export interface QuotePipelineCommerceReference {
  sku?: string;
  productId?: string;
  productLookup?: CommerceLookupResult<ShopifyProduct>;
  variantMappingLookup?: CommerceLookupResult<VariantMapping>;
}

export interface QuotePipelineResult {
  status: 'assembled' | 'pending' | 'invalid' | 'unavailable';
  quote: QuoteAssemblyResult;
  packageReferences: QuotePackageReference[];
  pricing: PricingResolution<QuotePricingResult>;
  commerceReferences: QuotePipelineCommerceReference[];
  reviewFlags: ReviewFlag[];
}


export type LiveQuoteBuilderRequest = QuotePipelineInput;

export interface LiveQuoteBuilderResult {
  status: 'priced' | 'pending' | 'invalid' | 'unavailable';
  quote: Quote | null;
  draft: QuoteDraft | null;
  pipeline: QuotePipelineResult;
  packageReferences: QuotePackageReference[];
  pricing: PricingResolution<QuotePricingResult>;
  commerceReferences: QuotePipelineCommerceReference[];
  reviewFlags: ReviewFlag[];
  pdfReady: boolean;
}

export interface QuoteRevisionMetadata {
  quoteId: string;
  version: number;
  savedAt: string;
  savedBy?: string;
  source?: string;
  note?: string;
}

export interface QuoteHistorySnapshot {
  quote: Quote;
  revision: QuoteRevisionMetadata;
}

export interface QuotePersistenceRecord {
  quote: Quote;
  revision: QuoteRevisionMetadata;
  history: QuoteHistorySnapshot[];
}

export interface QuoteSaveInput {
  quote: Quote;
  revision?: Partial<Omit<QuoteRevisionMetadata, 'quoteId' | 'version' | 'savedAt'>> & { savedAt?: string };
}

export interface QuoteUpdateInput {
  quoteId: string;
  quote: Quote;
  expectedVersion: number;
  revision?: Partial<Omit<QuoteRevisionMetadata, 'quoteId' | 'version' | 'savedAt'>> & { savedAt?: string };
}

export interface QuoteSaveResult {
  status: 'saved';
  record: QuotePersistenceRecord;
}

export interface QuoteLoadResult {
  status: 'found' | 'not-found';
  record?: QuotePersistenceRecord;
  quoteId: string;
}

export interface QuoteUpdateResult {
  status: 'updated' | 'not-found' | 'conflict';
  record?: QuotePersistenceRecord;
  quoteId: string;
  expectedVersion: number;
  currentVersion?: number;
}


export type QuoteApprovalActionType = 'submit-for-review' | 'assign-reviewer' | 'approve' | 'reject' | 'request-changes' | 'cancel-approval';
export type QuoteAuditEventType = QuoteApprovalActionType;

export interface QuoteReviewerAssignment {
  reviewerId: string;
  assignedBy: string;
  assignedAt: string;
  dueAt?: string;
  note?: string;
}

export interface QuoteApprovalAuditEvent {
  id: string;
  quoteId: string;
  type: QuoteAuditEventType;
  actorId: string;
  occurredAt: string;
  fromStatus: QuoteWorkflowStatus;
  toStatus: QuoteWorkflowStatus;
  fromApprovalStatus: QuoteApprovalStatus;
  toApprovalStatus: QuoteApprovalStatus;
  reviewerAssignment?: QuoteReviewerAssignment;
  reason?: string;
  note?: string;
  revision: QuoteRevisionMetadata;
}

export interface QuoteApprovalWorkflowState {
  quote: Quote;
  revision: QuoteRevisionMetadata;
  auditTrail: QuoteApprovalAuditEvent[];
}

export interface QuoteApprovalActionInput {
  quoteId: string;
  expectedVersion: number;
  actorId: string;
  occurredAt?: string;
  note?: string;
}

export interface SubmitQuoteForReviewInput extends QuoteApprovalActionInput {
  reviewer?: Omit<QuoteReviewerAssignment, 'assignedAt'> & { assignedAt?: string };
}

export interface AssignQuoteReviewerInput extends QuoteApprovalActionInput {
  reviewer: Omit<QuoteReviewerAssignment, 'assignedAt'> & { assignedAt?: string };
}

export interface ApproveQuoteInput extends QuoteApprovalActionInput {}

export interface RejectQuoteInput extends QuoteApprovalActionInput {
  reason: string;
}

export interface RequestQuoteChangesInput extends QuoteApprovalActionInput {
  reason: string;
}

export interface CancelQuoteApprovalInput extends QuoteApprovalActionInput {
  reason?: string;
}

export interface QuoteApprovalActionResult {
  status: 'updated' | 'not-found' | 'conflict' | 'invalid-transition';
  quoteId: string;
  expectedVersion: number;
  currentVersion?: number;
  state?: QuoteApprovalWorkflowState;
  reviewFlags: ReviewFlag[];
}

export interface QuoteHistoryResult {
  status: 'found' | 'not-found';
  quoteId: string;
  history: QuoteHistorySnapshot[];
}

export interface QuotePayload {
  quote: Quote;
  source: string;
  submittedAt?: string;
  metadata?: Record<string, string | number | boolean | null>;
}
