import type { AdminSalesDashboardActivityEntry, AdminSalesDashboardQuickAction } from '@/types/adminSalesDashboard';

/**
 * Static Quick Actions catalog for the /admin landing page. "Future CRM" is
 * intentionally `available: false` — it links nowhere because no CRM
 * foundation exists yet (explicit non-goal of this dashboard).
 */
export const adminSalesDashboardQuickActions: AdminSalesDashboardQuickAction[] = [
  {
    id: 'quote-builder',
    label: 'Quote Builder',
    description: 'Build live, priced quotes against the pricing and quote pipeline foundations.',
    href: '/admin/quote-builder',
    icon: 'FileEdit',
    available: true,
  },
  {
    id: 'quotes-workspace',
    label: 'Quotes Workspace',
    description: 'Browse and review persisted quotes across the sales team.',
    href: '/admin/quotes',
    icon: 'ClipboardList',
    available: true,
  },
  {
    id: 'shopify-sync',
    label: 'Shopify Sync',
    description: 'Inspect the Shopify sync orchestrator, job queue, and per-domain sync previews.',
    href: '/admin/shopify-sync',
    icon: 'RefreshCw',
    available: true,
  },
  {
    id: 'pricing-imports',
    label: 'Pricing Imports',
    description: 'Review pricing import runs, validation results, and duplicate detection.',
    href: '/admin/pricing-imports',
    icon: 'Upload',
    available: true,
  },
  {
    id: 'future-crm',
    label: 'Future CRM',
    description: 'Customer relationship management is not yet built. Reserved for a future foundation.',
    href: '#',
    icon: 'Users',
    available: false,
  },
];

/**
 * Deterministic, static recent-activity feed. No persistence backs this list —
 * it exists only to demonstrate the Recent Activity section's shape, per the
 * issue's explicit "no persistence required" scope.
 */
export const adminSalesDashboardRecentActivity: AdminSalesDashboardActivityEntry[] = [
  {
    id: 'activity-quote-edit-001',
    kind: 'quote-edit',
    label: 'Quote revised',
    detail: 'Metro Police Department — Navigator Lightbar quote moved to "approved".',
    actor: 'Priya Patel',
    occurredAt: '2026-07-02T18:42:00.000Z',
  },
  {
    id: 'activity-sync-job-001',
    kind: 'sync-job',
    label: 'Catalog sync job completed',
    detail: 'dashboard-catalog-job dry-run finished with 1 mapped product.',
    actor: 'Miguel Torres',
    occurredAt: '2026-07-02T16:10:00.000Z',
  },
  {
    id: 'activity-pricing-import-001',
    kind: 'pricing-import',
    label: 'Pricing import processed',
    detail: 'Dealer cost sheet import validated with 0 invalid records.',
    actor: 'Ava Chen',
    occurredAt: '2026-07-02T14:05:00.000Z',
  },
  {
    id: 'activity-quote-edit-002',
    kind: 'quote-edit',
    label: 'Quote created',
    detail: 'New draft quote opened in the Quote Builder workspace.',
    actor: 'Priya Patel',
    occurredAt: '2026-07-01T20:31:00.000Z',
  },
  {
    id: 'activity-sync-job-002',
    kind: 'sync-job',
    label: 'Inventory sync job queued',
    detail: 'dashboard-inventory-job queued behind dashboard-catalog-job.',
    actor: 'Miguel Torres',
    occurredAt: '2026-07-01T15:52:00.000Z',
  },
  {
    id: 'activity-pricing-import-002',
    kind: 'pricing-import',
    label: 'Pricing import completed',
    detail: 'List price import run finished; duplicate detection reported 0 groups.',
    actor: 'Ava Chen',
    occurredAt: '2026-07-01T09:18:00.000Z',
  },
];
