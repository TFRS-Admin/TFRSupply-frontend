import type { AdminUser } from '@/types/adminAuth';

/**
 * Deterministic, fixed demo identities. There is no registration, password
 * storage, or external identity provider — these are the only administrators
 * the mock adapter will ever recognize.
 */
export const mockAdminAuthUsers: AdminUser[] = [
  {
    id: 'demo-super-admin',
    label: 'Ava Chen',
    email: 'ava.chen@tfrsupply-demo.test',
    role: 'super-admin',
    permissions: [
      'admin.shopify-sync.view',
      'admin.quote-builder.view',
      'admin.quotes.view',
      'admin.pricing-imports.view',
    ],
    description: 'Full access demo administrator.',
    metadata: { source: 'mock-admin-auth-adapter' },
  },
  {
    id: 'demo-ops-admin',
    label: 'Miguel Torres',
    email: 'miguel.torres@tfrsupply-demo.test',
    role: 'ops-admin',
    permissions: ['admin.shopify-sync.view', 'admin.pricing-imports.view'],
    description: 'Shopify sync and pricing operations demo administrator.',
    metadata: { source: 'mock-admin-auth-adapter' },
  },
  {
    id: 'demo-sales-admin',
    label: 'Priya Patel',
    email: 'priya.patel@tfrsupply-demo.test',
    role: 'sales-admin',
    permissions: ['admin.quote-builder.view', 'admin.quotes.view'],
    description: 'Quote builder and quotes demo administrator.',
    metadata: { source: 'mock-admin-auth-adapter' },
  },
  {
    id: 'demo-viewer',
    label: 'Jordan Lee',
    email: 'jordan.lee@tfrsupply-demo.test',
    role: 'viewer',
    permissions: [],
    description: 'Authenticated but read-restricted demo administrator (no admin page permissions).',
    metadata: { source: 'mock-admin-auth-adapter' },
  },
];
