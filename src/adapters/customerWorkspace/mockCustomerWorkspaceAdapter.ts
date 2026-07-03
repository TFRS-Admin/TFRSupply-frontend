import type { CustomerWorkspaceAdapter } from './customerWorkspaceAdapter';
import { customerWorkspaceActivity, customerWorkspaceRecords } from './customerWorkspaceFixtures';

/**
 * Deterministic in-memory adapter backed by the fixed customer fixtures.
 * Mirrors the "mock adapter reads a fixed fixture set" pattern already used
 * by mockAdminAuthAdapter and mockShopifyCustomerAdapter — no network,
 * database, or Shopify calls occur here.
 */
export function createMockCustomerWorkspaceAdapter(): CustomerWorkspaceAdapter {
  return {
    async listCustomers() {
      return customerWorkspaceRecords.map((record) => ({ ...record }));
    },
    async getCustomer(customerId) {
      const record = customerWorkspaceRecords.find((candidate) => candidate.id === customerId);
      return record ? { ...record } : null;
    },
    async listActivity(customerId) {
      return customerWorkspaceActivity
        .filter((entry) => entry.customerId === customerId)
        .slice()
        .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : a.occurredAt > b.occurredAt ? -1 : 0));
    },
  };
}

export const mockCustomerWorkspaceAdapter: CustomerWorkspaceAdapter = createMockCustomerWorkspaceAdapter();
