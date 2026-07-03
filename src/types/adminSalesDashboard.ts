export type AdminPlatformComponentStatus = 'operational' | 'degraded' | 'unavailable';

export interface AdminSalesDashboardQuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  available: boolean;
}

export interface AdminSalesDashboardPlatformStatus {
  authentication: AdminPlatformComponentStatus;
  sync: AdminPlatformComponentStatus;
  pricingEngine: AdminPlatformComponentStatus;
  quoteEngine: AdminPlatformComponentStatus;
  imports: AdminPlatformComponentStatus;
}

export type AdminSalesDashboardActivityKind = 'quote-edit' | 'pricing-import' | 'sync-job';

export interface AdminSalesDashboardActivityEntry {
  id: string;
  kind: AdminSalesDashboardActivityKind;
  label: string;
  detail: string;
  actor: string;
  occurredAt: string;
}

export interface AdminSalesDashboardMetrics {
  quotesCreated: number;
  importsProcessed: number;
  syncJobsRun: number;
  validationStatus: 'passing' | 'failing';
  testEnvironmentStatus: 'ready' | 'unavailable';
}

export interface AdminSalesDashboardSystemHealth {
  buildStatus: 'passing' | 'failing';
  validationStatus: 'passing' | 'failing';
  mockServicesAvailable: boolean;
  adaptersAvailable: boolean;
}

export interface AdminSalesDashboardData {
  generatedAt: string;
  quickActions: AdminSalesDashboardQuickAction[];
  platformStatus: AdminSalesDashboardPlatformStatus;
  recentActivity: AdminSalesDashboardActivityEntry[];
  metrics: AdminSalesDashboardMetrics;
  systemHealth: AdminSalesDashboardSystemHealth;
}
