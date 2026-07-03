import { z } from 'zod';
import type { CustomerWorkspaceActivity, CustomerWorkspaceActivityKind, CustomerWorkspaceDetailResult, CustomerWorkspaceDetailStatus, CustomerWorkspaceFilter, CustomerWorkspaceListResult, CustomerWorkspaceListStatus, CustomerWorkspaceRecord, CustomerWorkspaceSearch, CustomerWorkspaceStatus, CustomerWorkspaceSummary } from '@/types';
import { metadataSchema } from './common.schema';
import { quoteCustomerMetadataSchema } from './quote.schema';
import { shopifyCustomerSyncStatusSchema } from './shopifyCustomer.schema';

const nonEmptyString = z.string().min(1);

export const customerWorkspaceStatusSchema = z.enum(['active', 'prospect', 'inactive', 'archived']) satisfies z.ZodType<CustomerWorkspaceStatus>;
export const customerWorkspaceActivityKindSchema = z.enum(['quote-created', 'quote-updated', 'quote-approved', 'shopify-sync', 'contact-updated']) satisfies z.ZodType<CustomerWorkspaceActivityKind>;
export const customerWorkspaceListStatusSchema = z.enum(['ready', 'empty', 'unavailable']) satisfies z.ZodType<CustomerWorkspaceListStatus>;
export const customerWorkspaceDetailStatusSchema = z.enum(['found', 'not-found']) satisfies z.ZodType<CustomerWorkspaceDetailStatus>;

export const customerWorkspaceRecordSchema = z.object({
  id: nonEmptyString,
  customer: quoteCustomerMetadataSchema,
  status: customerWorkspaceStatusSchema,
  verticalId: z.string().optional(),
  shopifySyncStatus: shopifyCustomerSyncStatusSchema,
  shopifyCustomerId: z.string().nullable().optional(),
  createdAt: nonEmptyString,
  updatedAt: nonEmptyString,
  metadata: metadataSchema.optional(),
}) as z.ZodType<CustomerWorkspaceRecord>;

export const customerWorkspaceActivitySchema = z.object({
  id: nonEmptyString,
  customerId: nonEmptyString,
  kind: customerWorkspaceActivityKindSchema,
  label: nonEmptyString,
  detail: nonEmptyString,
  occurredAt: nonEmptyString,
  quoteId: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<CustomerWorkspaceActivity>;

export const customerWorkspaceSummarySchema = z.object({
  customerId: nonEmptyString,
  record: customerWorkspaceRecordSchema,
  quoteCount: z.number().int().nonnegative(),
  lastQuoteAt: z.string().nullable(),
  lastActivityAt: z.string().nullable(),
  recentActivity: z.array(customerWorkspaceActivitySchema),
}) as z.ZodType<CustomerWorkspaceSummary>;

export const customerWorkspaceFilterSchema = z.object({
  status: z.array(customerWorkspaceStatusSchema).optional(),
  verticalId: z.string().optional(),
  shopifySyncStatus: z.array(shopifyCustomerSyncStatusSchema).optional(),
}) as z.ZodType<CustomerWorkspaceFilter>;

export const customerWorkspaceSearchSchema = z.object({
  query: z.string().optional(),
  filter: customerWorkspaceFilterSchema.optional(),
}) as z.ZodType<CustomerWorkspaceSearch>;

export const customerWorkspaceListResultSchema = z.object({
  status: customerWorkspaceListStatusSchema,
  summaries: z.array(customerWorkspaceSummarySchema),
  total: z.number().int().nonnegative(),
}) as z.ZodType<CustomerWorkspaceListResult>;

export const customerWorkspaceDetailResultSchema = z.object({
  status: customerWorkspaceDetailStatusSchema,
  customerId: nonEmptyString,
  summary: customerWorkspaceSummarySchema.nullable(),
}) as z.ZodType<CustomerWorkspaceDetailResult>;
