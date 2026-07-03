import type { Metadata } from './common';
import type { QuoteCustomerMetadata } from './quote';
import type { ShopifyCustomerSyncStatus } from './shopifyCustomer';

export type CustomerWorkspaceStatus = 'active' | 'prospect' | 'inactive' | 'archived';

export type CustomerWorkspaceActivityKind = 'quote-created' | 'quote-updated' | 'quote-approved' | 'shopify-sync' | 'contact-updated';

export interface CustomerWorkspaceRecord {
  id: string;
  customer: QuoteCustomerMetadata;
  status: CustomerWorkspaceStatus;
  verticalId?: string;
  shopifySyncStatus: ShopifyCustomerSyncStatus;
  shopifyCustomerId?: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: Metadata;
}

export interface CustomerWorkspaceActivity {
  id: string;
  customerId: string;
  kind: CustomerWorkspaceActivityKind;
  label: string;
  detail: string;
  occurredAt: string;
  quoteId?: string;
  metadata?: Metadata;
}

export interface CustomerWorkspaceSummary {
  customerId: string;
  record: CustomerWorkspaceRecord;
  quoteCount: number;
  lastQuoteAt: string | null;
  lastActivityAt: string | null;
  recentActivity: CustomerWorkspaceActivity[];
}

export interface CustomerWorkspaceFilter {
  status?: CustomerWorkspaceStatus[];
  verticalId?: string;
  shopifySyncStatus?: ShopifyCustomerSyncStatus[];
}

export interface CustomerWorkspaceSearch {
  query?: string;
  filter?: CustomerWorkspaceFilter;
}

export type CustomerWorkspaceListStatus = 'ready' | 'empty' | 'unavailable';

export interface CustomerWorkspaceListResult {
  status: CustomerWorkspaceListStatus;
  summaries: CustomerWorkspaceSummary[];
  total: number;
}

export type CustomerWorkspaceDetailStatus = 'found' | 'not-found';

export interface CustomerWorkspaceDetailResult {
  status: CustomerWorkspaceDetailStatus;
  customerId: string;
  summary: CustomerWorkspaceSummary | null;
}
