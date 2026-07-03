import type { Metadata } from './common';
import type { ShopifyStorefrontAdapterMode } from './shopifyStorefront';

export type ShopifyStorefrontConfigStatus = 'not-configured' | 'partially-configured' | 'configured' | 'disabled';
export type ShopifyStorefrontConfigErrorCode = 'missing-store-domain' | 'missing-api-version' | 'storefront-disabled' | 'unknown';

/**
 * Frontend-safe Storefront configuration read from Vite env variables
 * (VITE_SHOPIFY_STORE_DOMAIN, VITE_SHOPIFY_STOREFRONT_API_VERSION,
 * VITE_SHOPIFY_STOREFRONT_ENABLED). This contract deliberately has no field
 * for a Storefront access token — token handling requires a future
 * backend/proxy or approved secret strategy and is out of scope here.
 */
export interface ShopifyStorefrontEnvironmentConfig {
  storeDomain: string | null;
  apiVersion: string | null;
  storefrontEnabled: boolean;
}

export interface ShopifyStorefrontConfigError {
  code: ShopifyStorefrontConfigErrorCode;
  message: string;
  fieldPath?: string;
  metadata?: Metadata;
}

export interface ShopifyStorefrontConfigValidationResult {
  status: ShopifyStorefrontConfigStatus;
  configured: boolean;
  storefrontEnabled: boolean;
  redactedStoreDomain: string | null;
  apiVersion: string | null;
  requiredEnvVars: string[];
  presentEnvVars: string[];
  missingEnvVars: string[];
  errors: ShopifyStorefrontConfigError[];
  checkedAt?: string;
  metadata?: Metadata;
}

/**
 * Aggregated readiness snapshot across the existing Storefront foundations
 * (Storefront API, Storefront Cart Adapter, Storefront Product Sync,
 * Storefront Collection Sync). Every adapterMode/capability value here is
 * read from those existing services' getCapabilities() — this type never
 * introduces a new adapter selection mechanism. liveAdapterReady is always
 * false in this issue because a Storefront access token can never be
 * present in frontend-safe env config.
 */
export interface ShopifyStorefrontCapabilitySummary {
  configValidation: ShopifyStorefrontConfigValidationResult;
  storefrontApiEnabled: boolean;
  liveAdapterReady: boolean;
  liveAdapterReadinessReason: string;
  adapterMode: ShopifyStorefrontAdapterMode;
  cartAdapterMode: ShopifyStorefrontAdapterMode;
  productAdapterMode: ShopifyStorefrontAdapterMode;
  collectionAdapterMode: ShopifyStorefrontAdapterMode;
  supportedOperationTypes: string[];
  checkedAt?: string;
  metadata?: Metadata;
}
