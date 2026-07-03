import type { CustomerWorkspaceActivity, CustomerWorkspaceRecord } from '@/types';

/**
 * Deterministic in-memory customer fixtures for the Customer Workspace
 * Foundation. No network, database, or Shopify calls occur here — these
 * records exist to exercise customerWorkspaceService and the /admin/customers
 * UI against realistic, stable demo data.
 */

export const customerWorkspaceRecords: CustomerWorkspaceRecord[] = [
  {
    id: 'customer-metro-pd',
    customer: {
      customerId: 'customer-metro-pd',
      agencyName: 'Metro Police Department',
      contactName: 'Priya Patel',
      contactEmail: 'fleet@metropd.example.gov',
      contactPhone: '555-0101',
      accountNumber: 'ACCT-1001',
    },
    status: 'active',
    verticalId: 'police',
    shopifySyncStatus: 'succeeded',
    shopifyCustomerId: 'shopify-customer-metro-pd',
    createdAt: '2026-05-12T14:00:00.000Z',
    updatedAt: '2026-07-02T18:42:00.000Z',
  },
  {
    id: 'customer-statewide-fleet',
    customer: {
      customerId: 'customer-statewide-fleet',
      agencyName: 'Statewide Fleet Services',
      contactName: 'Jordan Lee',
      contactEmail: 'procurement@statewidefleet.example.gov',
      contactPhone: '555-0102',
      accountNumber: 'ACCT-1002',
    },
    status: 'active',
    verticalId: 'police',
    shopifySyncStatus: 'dry-run',
    shopifyCustomerId: 'shopify-customer-statewide-fleet',
    createdAt: '2026-04-03T09:30:00.000Z',
    updatedAt: '2026-07-01T15:52:00.000Z',
  },
  {
    id: 'customer-riverside-ems',
    customer: {
      customerId: 'customer-riverside-ems',
      agencyName: 'Riverside EMS',
      contactName: 'Ava Chen',
      contactEmail: 'ops@riversideems.example.org',
      contactPhone: '555-0103',
    },
    status: 'prospect',
    verticalId: 'fire-ems',
    shopifySyncStatus: 'not-started',
    shopifyCustomerId: null,
    createdAt: '2026-06-20T11:15:00.000Z',
    updatedAt: '2026-06-28T10:05:00.000Z',
  },
  {
    id: 'customer-north-county-fire',
    customer: {
      customerId: 'customer-north-county-fire',
      agencyName: 'North County Fire District',
      contactName: 'Miguel Torres',
      contactEmail: 'apparatus@ncfire.example.org',
      contactPhone: '555-0104',
      accountNumber: 'ACCT-1004',
    },
    status: 'active',
    verticalId: 'fire-ems',
    shopifySyncStatus: 'failed',
    shopifyCustomerId: null,
    createdAt: '2026-03-18T08:00:00.000Z',
    updatedAt: '2026-06-30T13:20:00.000Z',
  },
  {
    id: 'customer-summit-utility',
    customer: {
      customerId: 'customer-summit-utility',
      agencyName: 'Summit Utility Works',
      contactName: 'Dana Whitfield',
      contactEmail: 'fleet@summitutility.example.com',
      contactPhone: '555-0105',
      accountNumber: 'ACCT-1005',
    },
    status: 'inactive',
    verticalId: 'work-truck',
    shopifySyncStatus: 'adapter-unavailable',
    shopifyCustomerId: null,
    createdAt: '2026-01-09T16:45:00.000Z',
    updatedAt: '2026-05-15T12:00:00.000Z',
  },
  {
    id: 'customer-harbor-municipal',
    customer: {
      customerId: 'customer-harbor-municipal',
      agencyName: 'Harbor Municipal Works',
      contactName: 'Sam Okafor',
      contactEmail: 'sam.okafor@harbormunicipal.example.gov',
      contactPhone: '555-0106',
    },
    status: 'archived',
    verticalId: 'work-truck',
    shopifySyncStatus: 'not-started',
    shopifyCustomerId: null,
    createdAt: '2025-11-02T10:00:00.000Z',
    updatedAt: '2026-02-11T09:00:00.000Z',
  },
];

export const customerWorkspaceActivity: CustomerWorkspaceActivity[] = [
  { id: 'activity-metro-pd-001', customerId: 'customer-metro-pd', kind: 'quote-approved', label: 'Quote approved', detail: 'Navigator Lightbar quote moved to "approved".', occurredAt: '2026-07-02T18:42:00.000Z', quoteId: 'quote-workspace-single-line' },
  { id: 'activity-metro-pd-002', customerId: 'customer-metro-pd', kind: 'quote-updated', label: 'Quote revised', detail: 'Multi-line quote updated with a mounting bracket line.', occurredAt: '2026-06-28T17:10:00.000Z', quoteId: 'quote-workspace-multi-line' },
  { id: 'activity-metro-pd-003', customerId: 'customer-metro-pd', kind: 'quote-created', label: 'Quote created', detail: 'New draft quote opened in the Quote Builder workspace.', occurredAt: '2026-06-15T20:31:00.000Z', quoteId: 'quote-workspace-single-line' },
  { id: 'activity-metro-pd-004', customerId: 'customer-metro-pd', kind: 'shopify-sync', label: 'Shopify sync succeeded', detail: 'Customer record synced to Shopify.', occurredAt: '2026-05-12T14:05:00.000Z' },

  { id: 'activity-statewide-fleet-001', customerId: 'customer-statewide-fleet', kind: 'quote-created', label: 'Quote created', detail: 'Quantity-break quote opened for Navigator Lightbar.', occurredAt: '2026-07-01T15:52:00.000Z', quoteId: 'quote-workspace-quantity-break' },
  { id: 'activity-statewide-fleet-002', customerId: 'customer-statewide-fleet', kind: 'shopify-sync', label: 'Shopify sync dry-run', detail: 'Customer record dry-run synced to Shopify.', occurredAt: '2026-04-03T09:35:00.000Z' },

  { id: 'activity-riverside-ems-001', customerId: 'customer-riverside-ems', kind: 'contact-updated', label: 'Contact updated', detail: 'Primary contact phone number updated.', occurredAt: '2026-06-28T10:05:00.000Z' },
  { id: 'activity-riverside-ems-002', customerId: 'customer-riverside-ems', kind: 'quote-created', label: 'Quote created', detail: 'Initial promotional bundle quote opened.', occurredAt: '2026-06-20T11:20:00.000Z', quoteId: 'quote-workspace-promotional-bundle' },

  { id: 'activity-north-county-fire-001', customerId: 'customer-north-county-fire', kind: 'shopify-sync', label: 'Shopify sync failed', detail: 'Customer sync failed validation; retry required.', occurredAt: '2026-06-30T13:20:00.000Z' },
  { id: 'activity-north-county-fire-002', customerId: 'customer-north-county-fire', kind: 'quote-approved', label: 'Quote approved', detail: 'Mixed-contract quote approved for apparatus order.', occurredAt: '2026-06-10T09:00:00.000Z', quoteId: 'quote-workspace-mixed-contract' },
  { id: 'activity-north-county-fire-003', customerId: 'customer-north-county-fire', kind: 'quote-created', label: 'Quote created', detail: 'Mixed-contract quote opened.', occurredAt: '2026-05-02T09:00:00.000Z', quoteId: 'quote-workspace-mixed-contract' },

  { id: 'activity-summit-utility-001', customerId: 'customer-summit-utility', kind: 'quote-created', label: 'Quote created', detail: 'Invalid-pricing scenario opened for review.', occurredAt: '2026-05-15T12:00:00.000Z', quoteId: 'quote-workspace-invalid-pricing' },

  { id: 'activity-harbor-municipal-001', customerId: 'customer-harbor-municipal', kind: 'contact-updated', label: 'Contact archived', detail: 'Account marked archived after contract lapse.', occurredAt: '2026-02-11T09:00:00.000Z' },
];
