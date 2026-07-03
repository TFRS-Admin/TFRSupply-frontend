import type { CustomerWorkspaceAdapter } from './customerWorkspaceAdapter';

/**
 * Default adapter when no data source is injected. Returns empty results so
 * no runtime path assumes live customer data exists until a real provider is
 * connected behind CustomerWorkspaceAdapter in a dedicated issue.
 */
export const unavailableCustomerWorkspaceAdapter: CustomerWorkspaceAdapter = {
  async listCustomers() { return []; },
  async getCustomer() { return null; },
  async listActivity() { return []; },
};
