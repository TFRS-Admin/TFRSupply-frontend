import { shopifyStorefrontCartService } from '@/services/shopifyStorefrontCart';
import { shopifyStorefrontCollectionService } from '@/services/shopifyStorefrontCollection';
import { shopifyStorefrontProductService } from '@/services/shopifyStorefrontProduct';
import { shopifyStorefrontService } from '@/services/shopifyStorefront';
import { shopifyStorefrontCapabilitySummarySchema, shopifyStorefrontConfigValidationResultSchema, shopifyStorefrontEnvironmentConfigSchema } from '@/schemas/shopifyStorefrontConfig.schema';
import type { ShopifyStorefrontCapabilitySummary, ShopifyStorefrontConfigError, ShopifyStorefrontConfigStatus, ShopifyStorefrontConfigValidationResult, ShopifyStorefrontEnvironmentConfig } from '@/types';

const REQUIRED_ENV_VARS = ['VITE_SHOPIFY_STORE_DOMAIN', 'VITE_SHOPIFY_STOREFRONT_API_VERSION', 'VITE_SHOPIFY_STOREFRONT_ENABLED'] as const;

const LIVE_ADAPTER_READINESS_REASON =
  'Storefront access token handling requires a future backend/proxy or approved secret strategy; live Storefront API calls remain disabled until that work lands.';

function readBooleanFlag(rawValue: unknown, defaultValue: boolean): boolean {
  if (typeof rawValue !== 'string' || rawValue.trim() === '') return defaultValue;
  return rawValue.trim().toLowerCase() === 'true';
}

function readStringFlag(rawValue: unknown): string | null {
  if (typeof rawValue !== 'string') return null;
  const trimmed = rawValue.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Reads only frontend-safe Storefront env variables (Vite's import.meta.env,
 * exposed at build time). Never reads or exposes a Storefront access
 * token — token handling is out of scope for this issue.
 */
export function readEnvironmentConfig(env: Record<string, unknown> = (import.meta as unknown as { env: Record<string, unknown> }).env ?? {}): ShopifyStorefrontEnvironmentConfig {
  const config: ShopifyStorefrontEnvironmentConfig = {
    storeDomain: readStringFlag(env.VITE_SHOPIFY_STORE_DOMAIN),
    apiVersion: readStringFlag(env.VITE_SHOPIFY_STOREFRONT_API_VERSION),
    storefrontEnabled: readBooleanFlag(env.VITE_SHOPIFY_STOREFRONT_ENABLED, false),
  };
  return shopifyStorefrontEnvironmentConfigSchema.parse(config);
}

/**
 * Masks a store domain for display. Keeps up to the first two characters of
 * the subdomain label and the shop suffix (e.g. ".myshopify.com") visible so
 * a reader can sanity-check which store is configured, without printing the
 * full domain anywhere in the UI.
 */
export function redactStoreDomain(domain: string): string {
  const [label, ...rest] = domain.split('.');
  const suffix = rest.join('.');
  const visibleChars = Math.min(2, label.length);
  const maskedLength = Math.max(label.length - visibleChars, 3);
  const redactedLabel = label.length <= 2 ? '*'.repeat(label.length) : `${label.slice(0, visibleChars)}${'*'.repeat(maskedLength)}`;
  return suffix ? `${redactedLabel}.${suffix}` : redactedLabel;
}

function deriveStatus(config: ShopifyStorefrontEnvironmentConfig): ShopifyStorefrontConfigStatus {
  if (!config.storefrontEnabled) return 'disabled';
  if (config.storeDomain && config.apiVersion) return 'configured';
  if (config.storeDomain || config.apiVersion) return 'partially-configured';
  return 'not-configured';
}

/**
 * Validates the frontend-safe Storefront env shape. Never requires or
 * checks a Storefront access token — that boundary belongs to a future
 * backend/proxy.
 */
export function validateConfig(config: ShopifyStorefrontEnvironmentConfig = readEnvironmentConfig()): ShopifyStorefrontConfigValidationResult {
  const errors: ShopifyStorefrontConfigError[] = [];
  if (!config.storeDomain) {
    errors.push({ code: 'missing-store-domain', message: 'VITE_SHOPIFY_STORE_DOMAIN is not set.', fieldPath: 'storeDomain' });
  }
  if (!config.apiVersion) {
    errors.push({ code: 'missing-api-version', message: 'VITE_SHOPIFY_STOREFRONT_API_VERSION is not set.', fieldPath: 'apiVersion' });
  }
  if (!config.storefrontEnabled) {
    errors.push({ code: 'storefront-disabled', message: 'VITE_SHOPIFY_STOREFRONT_ENABLED is not set to true.', fieldPath: 'storefrontEnabled' });
  }

  const presentEnvVars: string[] = [];
  if (config.storeDomain) presentEnvVars.push('VITE_SHOPIFY_STORE_DOMAIN');
  if (config.apiVersion) presentEnvVars.push('VITE_SHOPIFY_STOREFRONT_API_VERSION');
  if (config.storefrontEnabled) presentEnvVars.push('VITE_SHOPIFY_STOREFRONT_ENABLED');
  const missingEnvVars = REQUIRED_ENV_VARS.filter((name) => !presentEnvVars.includes(name));

  const result: ShopifyStorefrontConfigValidationResult = {
    status: deriveStatus(config),
    configured: Boolean(config.storeDomain && config.apiVersion),
    storefrontEnabled: config.storefrontEnabled,
    redactedStoreDomain: config.storeDomain ? redactStoreDomain(config.storeDomain) : null,
    apiVersion: config.apiVersion,
    requiredEnvVars: [...REQUIRED_ENV_VARS],
    presentEnvVars,
    missingEnvVars,
    errors,
    checkedAt: new Date().toISOString(),
    metadata: { source: 'shopifyStorefrontConfigService' },
  };
  return shopifyStorefrontConfigValidationResultSchema.parse(result);
}

/**
 * Aggregates readiness across the existing Storefront foundations (API,
 * Cart Adapter, Product Sync, Collection Sync) by reading each service's
 * getCapabilities() — it never duplicates their adapter-selection logic and
 * never performs a live Shopify API call. liveAdapterReady is always false
 * because frontend-safe env config can never carry a Storefront access
 * token in this issue.
 */
export function getCapabilitySummary(config: ShopifyStorefrontEnvironmentConfig = readEnvironmentConfig()): ShopifyStorefrontCapabilitySummary {
  const configValidation = validateConfig(config);
  const storefrontCapabilities = shopifyStorefrontService.getCapabilities();
  const cartCapabilities = shopifyStorefrontCartService.getCapabilities();
  const productCapabilities = shopifyStorefrontProductService.getCapabilities();
  const collectionCapabilities = shopifyStorefrontCollectionService.getCapabilities();

  const summary: ShopifyStorefrontCapabilitySummary = {
    configValidation,
    storefrontApiEnabled: configValidation.storefrontEnabled,
    liveAdapterReady: false,
    liveAdapterReadinessReason: LIVE_ADAPTER_READINESS_REASON,
    adapterMode: storefrontCapabilities.adapterMode,
    cartAdapterMode: cartCapabilities.adapterMode,
    productAdapterMode: productCapabilities.adapterMode,
    collectionAdapterMode: collectionCapabilities.adapterMode,
    supportedOperationTypes: storefrontCapabilities.supportedOperationTypes,
    checkedAt: new Date().toISOString(),
    metadata: { source: 'shopifyStorefrontConfigService' },
  };
  return shopifyStorefrontCapabilitySummarySchema.parse(summary);
}

export interface ShopifyStorefrontConfigService {
  readEnvironmentConfig(env?: Record<string, unknown>): ShopifyStorefrontEnvironmentConfig;
  validateConfig(config?: ShopifyStorefrontEnvironmentConfig): ShopifyStorefrontConfigValidationResult;
  getCapabilitySummary(config?: ShopifyStorefrontEnvironmentConfig): ShopifyStorefrontCapabilitySummary;
}

export function createShopifyStorefrontConfigService(): ShopifyStorefrontConfigService {
  return { readEnvironmentConfig, validateConfig, getCapabilitySummary };
}

export const shopifyStorefrontConfigService = createShopifyStorefrontConfigService();
