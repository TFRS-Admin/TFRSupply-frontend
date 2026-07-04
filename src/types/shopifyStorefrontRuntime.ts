import type { Metadata } from './common';
import type { ShopifyStorefrontAdapterMode } from './shopifyStorefront';
import type { ShopifyStorefrontCapabilitySummary } from './shopifyStorefrontConfig';

/**
 * Aggregate runtime posture across every Storefront foundation's adapter
 * mode. 'mixed' covers the (currently untestable-in-default-config) case
 * where foundations report different adapter modes from each other; today
 * every foundation defaults to its own unavailable adapter, so this is
 * always 'unavailable' out of the box.
 */
export type ShopifyStorefrontRuntimeMode = ShopifyStorefrontAdapterMode | 'mixed';

export type ShopifyStorefrontRuntimeDiagnosticLevel = 'info' | 'warning' | 'error';
export type ShopifyStorefrontRuntimeDiagnosticCode =
  | 'env-mode'
  | 'missing-env-var'
  | 'storefront-disabled'
  | 'live-adapter-not-ready';

export interface ShopifyStorefrontRuntimeDiagnostic {
  code: ShopifyStorefrontRuntimeDiagnosticCode;
  level: ShopifyStorefrontRuntimeDiagnosticLevel;
  message: string;
  metadata?: Metadata;
}

/**
 * One row per existing Storefront foundation, read from that foundation's
 * own getCapabilities() call. This module never computes an adapter mode
 * itself — it only reports what each foundation already exposes.
 */
export interface ShopifyStorefrontRuntimeCapabilityRow {
  foundation: string;
  adapterMode: ShopifyStorefrontAdapterMode;
  dryRunOnly: boolean;
  liveCallsEnabled: boolean;
  notes?: string;
}

export interface ShopifyStorefrontRuntimeFeatureFlag {
  key: string;
  label: string;
  enabled: boolean;
  description: string;
}

export interface ShopifyStorefrontRuntimeStatus {
  runtimeMode: ShopifyStorefrontRuntimeMode;
  capabilitySummary: ShopifyStorefrontCapabilitySummary;
  capabilityMatrix: ShopifyStorefrontRuntimeCapabilityRow[];
  featureFlags: ShopifyStorefrontRuntimeFeatureFlag[];
  diagnostics: ShopifyStorefrontRuntimeDiagnostic[];
  readinessSummary: string;
  checkedAt?: string;
  metadata?: Metadata;
}
