import { shopifyCheckoutPreviewService } from '@/services/shopifyCheckoutPreview';
import { shopifyStorefrontService } from '@/services/shopifyStorefront';
import { shopifyStorefrontCartService } from '@/services/shopifyStorefrontCart';
import { shopifyStorefrontCollectionService } from '@/services/shopifyStorefrontCollection';
import { shopifyStorefrontConfigService } from '@/services/shopifyStorefrontConfig';
import { shopifyStorefrontProductService } from '@/services/shopifyStorefrontProduct';
import { shopifyStorefrontRuntimeStatusSchema } from '@/schemas/shopifyStorefrontRuntime.schema';
import type {
  ShopifyStorefrontCapabilitySummary,
  ShopifyStorefrontConfigValidationResult,
  ShopifyStorefrontEnvironmentConfig,
  ShopifyStorefrontRuntimeCapabilityRow,
  ShopifyStorefrontRuntimeDiagnostic,
  ShopifyStorefrontRuntimeFeatureFlag,
  ShopifyStorefrontRuntimeMode,
  ShopifyStorefrontRuntimeStatus,
} from '@/types';

const LIVE_ADAPTER_NOT_READY_MESSAGE =
  'Live Storefront API calls remain disabled until a backend/proxy token strategy is approved (Shopify Storefront Live Configuration Readiness).';

/**
 * Reads every existing Storefront foundation's own getCapabilities() call —
 * it never computes or infers an adapter mode itself. Rows are ordered to
 * mirror the dependency chain: Storefront API is the leaf every other
 * foundation's live adapter stub reuses buildStorefrontFetchRequest() from.
 */
function buildCapabilityMatrix(): ShopifyStorefrontRuntimeCapabilityRow[] {
  const storefront = shopifyStorefrontService.getCapabilities();
  const cart = shopifyStorefrontCartService.getCapabilities();
  const product = shopifyStorefrontProductService.getCapabilities();
  const collection = shopifyStorefrontCollectionService.getCapabilities();
  const checkout = shopifyCheckoutPreviewService.getCapabilities();

  return [
    { foundation: 'Shopify Storefront API', adapterMode: storefront.adapterMode, dryRunOnly: storefront.dryRunOnly, liveCallsEnabled: storefront.liveCallsEnabled },
    { foundation: 'Storefront Cart Adapter', adapterMode: cart.adapterMode, dryRunOnly: cart.dryRunOnly, liveCallsEnabled: cart.liveCallsEnabled },
    { foundation: 'Storefront Product Sync', adapterMode: product.adapterMode, dryRunOnly: product.dryRunOnly, liveCallsEnabled: product.liveCallsEnabled },
    { foundation: 'Storefront Collection Sync', adapterMode: collection.adapterMode, dryRunOnly: collection.dryRunOnly, liveCallsEnabled: collection.liveCallsEnabled },
    {
      foundation: 'Checkout URL Preview',
      adapterMode: checkout.adapterMode,
      dryRunOnly: checkout.dryRunOnly,
      liveCallsEnabled: checkout.liveCallsEnabled,
      notes: checkout.checkoutRedirectDisabled ? 'Checkout redirect disabled' : undefined,
    },
  ];
}

function deriveRuntimeMode(rows: ShopifyStorefrontRuntimeCapabilityRow[]): ShopifyStorefrontRuntimeMode {
  const modes = new Set(rows.map((row) => row.adapterMode));
  if (modes.size === 1) {
    const [mode] = modes;
    return mode;
  }
  return 'mixed';
}

function buildFeatureFlags(capabilitySummary: ShopifyStorefrontCapabilitySummary, rows: ShopifyStorefrontRuntimeCapabilityRow[]): ShopifyStorefrontRuntimeFeatureFlag[] {
  return [
    {
      key: 'storefrontEnabled',
      label: 'Storefront API Enabled',
      enabled: capabilitySummary.storefrontApiEnabled,
      description: 'Reflects VITE_SHOPIFY_STOREFRONT_ENABLED. Does not select an adapter or enable any live call.',
    },
    {
      key: 'dryRunOnly',
      label: 'Dry Run Only',
      enabled: rows.every((row) => row.dryRunOnly),
      description: 'Every Storefront foundation only ever executes deterministic dry runs today.',
    },
    {
      key: 'liveCallsEnabled',
      label: 'Live Calls Enabled',
      enabled: rows.some((row) => row.liveCallsEnabled),
      description: 'Whether any Storefront foundation is currently configured to perform a real Shopify API call.',
    },
    {
      key: 'liveAdapterReady',
      label: 'Live Adapter Ready',
      enabled: capabilitySummary.liveAdapterReady,
      description: capabilitySummary.liveAdapterReadinessReason,
    },
    {
      key: 'checkoutRedirectDisabled',
      label: 'Checkout Redirect Disabled',
      enabled: true,
      description: 'No live Shopify checkout redirect exists in this codebase yet.',
    },
  ];
}

function buildDiagnostics(validation: ShopifyStorefrontConfigValidationResult): ShopifyStorefrontRuntimeDiagnostic[] {
  const diagnostics: ShopifyStorefrontRuntimeDiagnostic[] = [];
  const env = ((import.meta as unknown as { env?: Record<string, unknown> }).env) ?? {};
  const mode = typeof env.MODE === 'string' ? env.MODE : 'unknown';

  diagnostics.push({ code: 'env-mode', level: 'info', message: `Vite build mode: ${mode} (${env.PROD ? 'production' : 'development'}).` });

  validation.missingEnvVars.forEach((name) => {
    diagnostics.push({ code: 'missing-env-var', level: 'warning', message: `${name} is not set.` });
  });

  if (!validation.storefrontEnabled) {
    diagnostics.push({
      code: 'storefront-disabled',
      level: 'warning',
      message: 'VITE_SHOPIFY_STOREFRONT_ENABLED is not set to true; every Storefront foundation stays display-only.',
    });
  }

  diagnostics.push({ code: 'live-adapter-not-ready', level: 'info', message: LIVE_ADAPTER_NOT_READY_MESSAGE });

  return diagnostics;
}

function buildReadinessSummary(runtimeMode: ShopifyStorefrontRuntimeMode, validation: ShopifyStorefrontConfigValidationResult): string {
  if (validation.status === 'not-configured') {
    return 'Storefront environment variables are not set. Every foundation runs in its default unavailable mode with no live connectivity.';
  }
  if (validation.status === 'disabled') {
    return 'Storefront API is explicitly disabled via VITE_SHOPIFY_STOREFRONT_ENABLED. No live Shopify Storefront call will ever be attempted while this is set.';
  }
  if (validation.status === 'partially-configured') {
    return 'Storefront environment configuration is incomplete. Resolve the missing variables below before live mode can be considered.';
  }
  return `Storefront environment configuration is present, but live Storefront API calls remain disabled (current runtime mode: ${runtimeMode}) until a backend/proxy token strategy is implemented.`;
}

/**
 * Aggregates the existing Storefront Live Configuration Readiness summary
 * with every foundation's own getCapabilities() call into one developer-
 * facing runtime status snapshot. This module introduces no new adapter,
 * no new env variable, and no live Shopify API call — it is a read-only
 * reporting layer over the existing foundations.
 */
export function getRuntimeStatus(config: ShopifyStorefrontEnvironmentConfig = shopifyStorefrontConfigService.readEnvironmentConfig()): ShopifyStorefrontRuntimeStatus {
  const capabilitySummary = shopifyStorefrontConfigService.getCapabilitySummary(config);
  const capabilityMatrix = buildCapabilityMatrix();
  const runtimeMode = deriveRuntimeMode(capabilityMatrix);
  const featureFlags = buildFeatureFlags(capabilitySummary, capabilityMatrix);
  const diagnostics = buildDiagnostics(capabilitySummary.configValidation);
  const readinessSummary = buildReadinessSummary(runtimeMode, capabilitySummary.configValidation);

  const status: ShopifyStorefrontRuntimeStatus = {
    runtimeMode,
    capabilitySummary,
    capabilityMatrix,
    featureFlags,
    diagnostics,
    readinessSummary,
    checkedAt: new Date().toISOString(),
    metadata: { source: 'shopifyStorefrontRuntimeService' },
  };
  return shopifyStorefrontRuntimeStatusSchema.parse(status);
}

export interface ShopifyStorefrontRuntimeService {
  getRuntimeStatus(config?: ShopifyStorefrontEnvironmentConfig): ShopifyStorefrontRuntimeStatus;
}

export function createShopifyStorefrontRuntimeService(): ShopifyStorefrontRuntimeService {
  return { getRuntimeStatus };
}

export const shopifyStorefrontRuntimeService = createShopifyStorefrontRuntimeService();
