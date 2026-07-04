import { listTypedCategories } from '@/data/loaders';
import { catalogAdapterStatusSnapshotSchema, categorySchema, productSchema } from '@/schemas';
import {
  createLiveShopifyStorefrontCatalogAdapter,
  mockCatalogAdapter,
  unavailableCatalogAdapter,
  type CatalogAdapter,
} from '@/adapters/catalog';
import type {
  Category,
  CatalogAdapterCapabilities,
  CatalogAdapterError,
  CatalogAdapterFetchStatus,
  CatalogAdapterMode,
  CatalogAdapterStatusSnapshot,
  CatalogMappingIssue,
  CatalogMappingValidationResult,
  Product,
  ShopifyStorefrontClientConfig,
} from '@/types';

/**
 * Reads the same three frontend-safe Storefront env variables
 * shopifyStorefrontConfigService reads (VITE_SHOPIFY_STOREFRONT_ENABLED,
 * VITE_SHOPIFY_STORE_DOMAIN, VITE_SHOPIFY_STOREFRONT_API_VERSION) directly
 * rather than importing that service. shopifyStorefrontConfigService
 * transitively imports shopifyStorefrontProductService/
 * shopifyStorefrontCollectionService, which both import catalogService —
 * and catalogService imports this module, so importing
 * shopifyStorefrontConfigService here would create a module cycle. This
 * duplicates a handful of lines of env parsing, not any validation or
 * business logic.
 */
function resolveInitialMode(env: Record<string, unknown> = (import.meta as unknown as { env: Record<string, unknown> }).env ?? {}): CatalogAdapterMode {
  const enabledRaw = env.VITE_SHOPIFY_STOREFRONT_ENABLED;
  const enabled = typeof enabledRaw === 'string' && enabledRaw.trim().toLowerCase() === 'true';
  if (!enabled) return 'mock';

  const hasDomain = typeof env.VITE_SHOPIFY_STORE_DOMAIN === 'string' && env.VITE_SHOPIFY_STORE_DOMAIN.trim() !== '';
  const hasApiVersion = typeof env.VITE_SHOPIFY_STOREFRONT_API_VERSION === 'string' && env.VITE_SHOPIFY_STOREFRONT_API_VERSION.trim() !== '';
  return hasDomain && hasApiVersion ? 'unavailable' : 'mock';
}

function adapterForMode(mode: CatalogAdapterMode): CatalogAdapter {
  return mode === 'mock' ? mockCatalogAdapter : unavailableCatalogAdapter;
}

function validateProducts(products: Product[]): { valid: Product[]; issues: CatalogMappingIssue[] } {
  const valid: Product[] = [];
  const issues: CatalogMappingIssue[] = [];
  for (const product of products) {
    const parsed = productSchema.safeParse(product);
    if (parsed.success) {
      valid.push(parsed.data);
    } else {
      issues.push({ entityType: 'product', identifier: product.id ?? product.slug ?? 'unknown', reason: parsed.error.issues.map((issue) => issue.message).join('; ') });
    }
  }
  return { valid, issues };
}

function validateCategories(categories: Category[]): { valid: Category[]; issues: CatalogMappingIssue[] } {
  const valid: Category[] = [];
  const issues: CatalogMappingIssue[] = [];
  for (const category of categories) {
    const parsed = categorySchema.safeParse(category);
    if (parsed.success) {
      valid.push(parsed.data);
    } else {
      issues.push({ entityType: 'category', identifier: category.id ?? category.slug ?? 'unknown', reason: parsed.error.issues.map((issue) => issue.message).join('; ') });
    }
  }
  return { valid, issues };
}

export interface CatalogAdapterService {
  getMode(): CatalogAdapterMode;
  configureLiveAdapter(config: Partial<ShopifyStorefrontClientConfig>, fetchImpl?: typeof fetch): void;
  resetToDefaultAdapter(): void;
  sync(): Promise<CatalogAdapterStatusSnapshot>;
  getStatus(): CatalogAdapterStatusSnapshot;
  getSyncedProducts(): Product[] | null;
  getSyncedCategories(): Category[] | null;
  getCapabilities(): CatalogAdapterCapabilities;
}

/**
 * Owns runtime Catalog Adapter selection and the synced in-memory snapshot
 * `catalogService` reads through. The default mode is always 'mock' unless
 * the Storefront Runtime Configuration foundation (VITE_SHOPIFY_STOREFRONT_*)
 * reports the Storefront API enabled and configured, in which case it starts
 * as 'unavailable' — opted in, but requiring an explicit credential before
 * any live call can be attempted (no Storefront access token is ever read
 * from build-time env, matching SHOPIFY_STOREFRONT_LIVE_CONFIG_READINESS.md).
 * 'live' is only reachable via `configureLiveAdapter()`, an explicit,
 * developer-supplied action (the /dev/storefront dashboard's manual
 * credential form). `sync()` never throws — every adapter failure mode
 * resolves to a status the synchronous CatalogService read path can safely
 * fall back from.
 */
export function createCatalogAdapterService(): CatalogAdapterService {
  let mode: CatalogAdapterMode = resolveInitialMode();
  let activeAdapter: CatalogAdapter = adapterForMode(mode);

  let syncedProducts: Product[] | null = null;
  let syncedCategories: Category[] | null = null;
  let lastSyncedAt: string | null = null;
  let lastMappingValidation: CatalogMappingValidationResult | null = null;
  let lastProductFetchStatus: CatalogAdapterFetchStatus = 'idle';
  let lastCollectionFetchStatus: CatalogAdapterFetchStatus = 'idle';
  let lastErrors: CatalogAdapterError[] = [];

  function getMode(): CatalogAdapterMode {
    return mode;
  }

  function configureLiveAdapter(config: Partial<ShopifyStorefrontClientConfig>, fetchImpl?: typeof fetch): void {
    mode = 'live';
    activeAdapter = createLiveShopifyStorefrontCatalogAdapter(config, fetchImpl);
    syncedProducts = null;
    syncedCategories = null;
  }

  function resetToDefaultAdapter(): void {
    mode = resolveInitialMode();
    activeAdapter = adapterForMode(mode);
    syncedProducts = null;
    syncedCategories = null;
    lastSyncedAt = null;
    lastMappingValidation = null;
    lastProductFetchStatus = 'idle';
    lastCollectionFetchStatus = 'idle';
    lastErrors = [];
  }

  async function sync(): Promise<CatalogAdapterStatusSnapshot> {
    const baselineCategories = listTypedCategories();
    const [productsResult, collectionsResult] = await Promise.all([
      activeAdapter.fetchProducts(baselineCategories),
      activeAdapter.fetchCollections(baselineCategories),
    ]);

    lastProductFetchStatus = productsResult.status;
    lastCollectionFetchStatus = collectionsResult.status;
    lastErrors = [...productsResult.errors, ...collectionsResult.errors];
    lastSyncedAt = new Date().toISOString();

    const productValidation = validateProducts(productsResult.products);
    const categoryValidation = validateCategories(collectionsResult.categories);
    lastMappingValidation = {
      validProductCount: productValidation.valid.length,
      invalidProductCount: productValidation.issues.length,
      validCategoryCount: categoryValidation.valid.length,
      unmatchedCollectionCount: collectionsResult.unmatchedCollectionHandles.length,
      issues: [...productValidation.issues, ...categoryValidation.issues],
    };

    const fetchSucceeded = productsResult.status === 'success' && collectionsResult.status === 'success';
    if (fetchSucceeded && productValidation.valid.length > 0) {
      syncedProducts = productValidation.valid;
      syncedCategories = categoryValidation.valid;
    } else {
      syncedProducts = null;
      syncedCategories = null;
    }

    return getStatus();
  }

  function getStatus(): CatalogAdapterStatusSnapshot {
    const usedFallback = mode !== 'mock' && syncedProducts === null;
    const fallbackReason = usedFallback
      ? (lastSyncedAt
        ? 'Live sync did not produce usable catalog data; serving mock catalog data as a safe fallback.'
        : 'Live adapter selected but not yet synced; serving mock catalog data as a safe fallback.')
      : undefined;

    return catalogAdapterStatusSnapshotSchema.parse({
      adapterMode: mode,
      productFetchStatus: lastProductFetchStatus,
      collectionFetchStatus: lastCollectionFetchStatus,
      lastSyncedAt,
      productCount: syncedProducts?.length ?? 0,
      categoryCount: syncedCategories?.length ?? 0,
      usedFallback,
      fallbackReason,
      mappingValidation: lastMappingValidation,
      errors: lastErrors,
    });
  }

  function getSyncedProducts(): Product[] | null {
    return syncedProducts;
  }

  function getSyncedCategories(): Category[] | null {
    return syncedCategories;
  }

  function getCapabilities(): CatalogAdapterCapabilities {
    return { adapterMode: mode, supportsLiveFetch: mode === 'live' };
  }

  return {
    getMode,
    configureLiveAdapter,
    resetToDefaultAdapter,
    sync,
    getStatus,
    getSyncedProducts,
    getSyncedCategories,
    getCapabilities,
  };
}

export const catalogAdapterService: CatalogAdapterService = createCatalogAdapterService();
