import { useEffect, useMemo, useState } from 'react';
import { resolveFromCatalog, shopifyVariantResolverService } from '@/services/shopifyVariantResolver';
import type { ShopifyVariantResolution } from '@/types';

export interface ShopifyVariantResolverState {
  resolution: ShopifyVariantResolution | null;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing Shopify Variant Resolver for a single SKU. Separate from
 * ConfiguratorModule's own UI selection state (filters, accessory toggles,
 * which row is selected) — this hook only answers "what does Shopify say
 * about this one SKU right now?"
 *
 * Resolves synchronously from the existing Shopify-export catalog data on
 * first render (so there is no loading flash under today's default setup),
 * then asks the live Commerce Foundation (`commerceService.getVariantMapping`)
 * and swaps in that answer once a real adapter is connected and reports a
 * ready mapping for the same SKU.
 */
export function useShopifyVariantResolver(sku: string | null | undefined): ShopifyVariantResolverState {
  const fallback = useMemo(() => (sku ? resolveFromCatalog(sku) : null), [sku]);
  const [live, setLive] = useState<{ sku: string; resolution: ShopifyVariantResolution } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    setLive(null);
    setError(null);

    if (!sku) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);

    shopifyVariantResolverService.resolveLive(sku)
      .then((resolution) => {
        if (!active) return;
        setLive(resolution ? { sku, resolution } : null);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [sku]);

  const resolution = (live && live.sku === sku ? live.resolution : null) ?? fallback;

  return { resolution, loading, error };
}
