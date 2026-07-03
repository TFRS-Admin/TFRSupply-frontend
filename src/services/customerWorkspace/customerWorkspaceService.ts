import { mockCustomerWorkspaceAdapter, type CustomerWorkspaceAdapter } from '@/adapters/customerWorkspace';
import { customerWorkspaceDetailResultSchema, customerWorkspaceListResultSchema, customerWorkspaceSearchSchema, customerWorkspaceSummarySchema } from '@/schemas/customerWorkspace.schema';
import type { CustomerWorkspaceActivity, CustomerWorkspaceDetailResult, CustomerWorkspaceFilter, CustomerWorkspaceListResult, CustomerWorkspaceRecord, CustomerWorkspaceSearch, CustomerWorkspaceSummary } from '@/types';

export interface CustomerWorkspaceService {
  listCustomers(): Promise<CustomerWorkspaceListResult>;
  searchCustomers(search: CustomerWorkspaceSearch): Promise<CustomerWorkspaceListResult>;
  filterCustomers(filter: CustomerWorkspaceFilter): Promise<CustomerWorkspaceListResult>;
  getCustomer(customerId: string): Promise<CustomerWorkspaceDetailResult>;
  getCustomerActivity(customerId: string): Promise<CustomerWorkspaceActivity[]>;
}

/**
 * Pure aggregation — builds a customer summary from an already-loaded record
 * and its activity log. Quote count and quote/activity recency are derived
 * from the activity feed rather than a duplicate quote data model, following
 * the same "aggregate, don't recalculate" precedent as
 * liveQuoteBuilderService's buildPricingSummary().
 */
export function buildCustomerWorkspaceSummary(record: CustomerWorkspaceRecord, activity: CustomerWorkspaceActivity[]): CustomerWorkspaceSummary {
  const sortedActivity = activity.slice().sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : a.occurredAt > b.occurredAt ? -1 : 0));
  const quoteActivity = sortedActivity.filter((entry) => entry.kind === 'quote-created');
  const summary: CustomerWorkspaceSummary = {
    customerId: record.id,
    record,
    quoteCount: quoteActivity.length,
    lastQuoteAt: quoteActivity[0]?.occurredAt ?? null,
    lastActivityAt: sortedActivity[0]?.occurredAt ?? null,
    recentActivity: sortedActivity,
  };
  return customerWorkspaceSummarySchema.parse(summary);
}

function matchesQuery(summary: CustomerWorkspaceSummary, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const { customer } = summary.record;
  const haystack = [summary.record.id, customer.agencyName, customer.contactName, customer.contactEmail, customer.accountNumber]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase());
  return haystack.some((value) => value.includes(needle));
}

function matchesFilter(summary: CustomerWorkspaceSummary, filter: CustomerWorkspaceFilter): boolean {
  const { record } = summary;
  if (filter.status && filter.status.length > 0 && !filter.status.includes(record.status)) return false;
  if (filter.verticalId && record.verticalId !== filter.verticalId) return false;
  if (filter.shopifySyncStatus && filter.shopifySyncStatus.length > 0 && !filter.shopifySyncStatus.includes(record.shopifySyncStatus)) return false;
  return true;
}

function buildListResult(summaries: CustomerWorkspaceSummary[], total: number): CustomerWorkspaceListResult {
  const status = total === 0 ? 'unavailable' : summaries.length === 0 ? 'empty' : 'ready';
  return customerWorkspaceListResultSchema.parse({ status, summaries, total });
}

export function createCustomerWorkspaceService(adapter: CustomerWorkspaceAdapter = mockCustomerWorkspaceAdapter): CustomerWorkspaceService {
  async function loadAllSummaries(): Promise<CustomerWorkspaceSummary[]> {
    const records = await adapter.listCustomers();
    return Promise.all(records.map(async (record) => buildCustomerWorkspaceSummary(record, await adapter.listActivity(record.id))));
  }

  return {
    async listCustomers() {
      const summaries = await loadAllSummaries();
      return buildListResult(summaries, summaries.length);
    },

    async searchCustomers(search) {
      const validated = customerWorkspaceSearchSchema.parse(search);
      const summaries = await loadAllSummaries();
      const filtered = summaries
        .filter((summary) => (validated.query ? matchesQuery(summary, validated.query) : true))
        .filter((summary) => (validated.filter ? matchesFilter(summary, validated.filter) : true));
      return buildListResult(filtered, summaries.length);
    },

    async filterCustomers(filter) {
      const summaries = await loadAllSummaries();
      const filtered = summaries.filter((summary) => matchesFilter(summary, filter));
      return buildListResult(filtered, summaries.length);
    },

    async getCustomer(customerId) {
      const record = await adapter.getCustomer(customerId);
      if (!record) {
        return customerWorkspaceDetailResultSchema.parse({ status: 'not-found', customerId, summary: null });
      }
      const activity = await adapter.listActivity(customerId);
      const summary = buildCustomerWorkspaceSummary(record, activity);
      return customerWorkspaceDetailResultSchema.parse({ status: 'found', customerId, summary });
    },

    async getCustomerActivity(customerId) {
      return adapter.listActivity(customerId);
    },
  };
}

export const customerWorkspaceService: CustomerWorkspaceService = createCustomerWorkspaceService();
