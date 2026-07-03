import { useCallback, useMemo, useState } from 'react';
import { shopifyStorefrontConfigService } from '@/services/shopifyStorefrontConfig';
import type { ShopifyStorefrontCapabilitySummary, ShopifyStorefrontConfigValidationResult, ShopifyStorefrontEnvironmentConfig } from '@/types';

/**
 * React-facing entry point for the frontend-safe Storefront env config and
 * its validation result. Reading and validating env config is synchronous
 * (Vite inlines import.meta.env at build time) — this hook computes both
 * once via useMemo and exposes refresh() so a readiness panel can force a
 * recompute without remounting. Never reads or exposes a Storefront access
 * token.
 */
export function useShopifyStorefrontConfig() {
  const [nonce, setNonce] = useState(0);

  const config: ShopifyStorefrontEnvironmentConfig = useMemo(() => shopifyStorefrontConfigService.readEnvironmentConfig(), [nonce]);
  const validation: ShopifyStorefrontConfigValidationResult = useMemo(() => shopifyStorefrontConfigService.validateConfig(config), [config]);

  const refresh = useCallback(() => {
    setNonce((current) => current + 1);
  }, []);

  return { config, validation, refresh };
}

interface ShopifyStorefrontCapabilitiesState {
  summary: ShopifyStorefrontCapabilitySummary | null;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing entry point for the aggregated Storefront capability summary
 * (Shopify Storefront Live Configuration Readiness). Computes once on
 * mount via shopifyStorefrontConfigService.getCapabilitySummary() — which
 * only reads existing services' getCapabilities() and never performs a
 * live Shopify API call — and exposes refresh() for manual re-checks.
 */
export function useShopifyStorefrontCapabilities() {
  const [state, setState] = useState<ShopifyStorefrontCapabilitiesState>(() => {
    try {
      return { summary: shopifyStorefrontConfigService.getCapabilitySummary(), loading: false, error: null };
    } catch (error) {
      return { summary: null, loading: false, error };
    }
  });

  const refresh = useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const summary = shopifyStorefrontConfigService.getCapabilitySummary();
      setState({ summary, loading: false, error: null });
      return summary;
    } catch (error) {
      setState({ summary: null, loading: false, error });
      throw error;
    }
  }, []);

  return { ...state, refresh };
}
