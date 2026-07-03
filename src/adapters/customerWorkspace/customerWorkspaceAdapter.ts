import type { CustomerWorkspaceActivity, CustomerWorkspaceRecord } from '@/types';

export interface CustomerWorkspaceAdapter {
  listCustomers(): Promise<CustomerWorkspaceRecord[]>;
  getCustomer(customerId: string): Promise<CustomerWorkspaceRecord | null>;
  listActivity(customerId: string): Promise<CustomerWorkspaceActivity[]>;
}
