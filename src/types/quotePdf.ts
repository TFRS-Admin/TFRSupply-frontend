import type { Metadata } from './common';
import type { QuoteDraft, ReviewFlag } from './quote';

export type QuotePdfPageSize = 'letter' | 'legal' | 'a4' | 'tabloid';
export type QuotePdfOrientation = 'portrait' | 'landscape';
export type QuotePdfRenderStatus = 'rendered' | 'invalid' | 'unavailable' | 'failed';
export type QuotePdfRenderOutputStatus = 'rendered' | 'failed';

export interface QuotePdfRenderError {
  code: string;
  message: string;
  fieldPath?: string;
  detail?: string;
}

export interface QuotePdfDocumentMetadataInput {
  title: string;
  templateId: string;
  fileName?: string;
  revision?: string;
  pageSize?: QuotePdfPageSize;
  orientation?: QuotePdfOrientation;
  locale?: string;
  currencyCode?: string;
  watermark?: string;
  metadata?: Metadata;
}

export interface QuotePdfDocumentMetadata extends QuotePdfDocumentMetadataInput {
  documentId?: string;
  fileName: string;
  generatedAt: string;
  generatedBy?: string;
  contentType: string;
  pageCount?: number;
}

export interface QuotePdfRenderOptions {
  includePricing?: boolean;
  includePackageDetails?: boolean;
  includeReviewFlags?: boolean;
  includeCoverPage?: boolean;
}

export interface QuotePdfRenderInput {
  draft: QuoteDraft;
  documentMetadata: QuotePdfDocumentMetadataInput;
  options?: QuotePdfRenderOptions;
}

export interface QuotePdfRenderOutput {
  status: QuotePdfRenderOutputStatus;
  documentMetadata: QuotePdfDocumentMetadata | null;
  errors: QuotePdfRenderError[];
}

export interface QuotePdfRenderResult {
  status: QuotePdfRenderStatus;
  documentMetadata: QuotePdfDocumentMetadata | null;
  reviewFlags: ReviewFlag[];
  errors: QuotePdfRenderError[];
}

export interface QuotePdfValidationResult {
  valid: boolean;
  reviewFlags: ReviewFlag[];
  errors: QuotePdfRenderError[];
}
