import {
  liveShopifyStorefrontCollectionAdapter,
  mockShopifyStorefrontCollectionAdapter,
  unavailableShopifyStorefrontCollectionAdapter,
  type ShopifyStorefrontCollectionAdapter,
} from '@/adapters/shopifyStorefrontCollection';
import { shopifyStorefrontCollectionRequestSchema, shopifyStorefrontCollectionResultSchema } from '@/schemas/shopifyStorefrontCollection.schema';
import { catalogService, type CatalogService } from '@/services/catalog';
import type {
  Category,
  ShopifyStorefrontClientConfig,
  ShopifyStorefrontCollectionAdapterMode,
  ShopifyStorefrontCollectionCapabilities,
  ShopifyStorefrontCollectionMapping,
  ShopifyStorefrontCollectionPreview,
  ShopifyStorefrontCollectionRequest,
  ShopifyStorefrontCollectionResult,
} from '@/types';

export interface ShopifyStorefrontCollectionService {
  buildRequest(categoryId: string, overrides?: Partial<Omit<ShopifyStorefrontCollectionRequest, 'categoryId' | 'dryRun'>>): ShopifyStorefrontCollectionRequest;
  execute(request: ShopifyStorefrontCollectionRequest): Promise<ShopifyStorefrontCollectionResult>;
  previewCollection(categoryId: string, config?: Partial<ShopifyStorefrontClientConfig>): Promise<ShopifyStorefrontCollectionResult>;
  getCapabilities(): ShopifyStorefrontCollectionCapabilities;
}

let requestSequence = 0;

function nextRequestId(): string {
  requestSequence += 1;
  return `storefront-collection-request-${requestSequence}`;
}

function inferAdapterMode(adapter: ShopifyStorefrontCollectionAdapter): ShopifyStorefrontCollectionAdapterMode {
  if (adapter === mockShopifyStorefrontCollectionAdapter) return 'mock';
  if (adapter === liveShopifyStorefrontCollectionAdapter) return 'live';
  return 'unavailable';
}

/**
 * Derives a read-only ShopifyStorefrontCollectionMapping from an existing
 * catalog Category (Product Data Platform / Catalog Service) and its
 * associated product count. handle reuses category.slug, the same field
 * the Category Template already reads; productCount reuses
 * catalogService.searchProducts() rather than a new catalog lookup.
 * shopifyCollectionId/shopifyCollectionGid reuse the existing
 * Category.shopify metadata bag when a future data source populates it.
 */
export function buildStorefrontCollectionMapping(category: Category, productCount: number): ShopifyStorefrontCollectionMapping {
  const shopify = category.shopify ?? {};
  const shopifyCollectionId = typeof shopify.collectionId === 'string' ? shopify.collectionId : null;
  const shopifyCollectionGid = typeof shopify.collectionGid === 'string' ? shopify.collectionGid : null;

  return {
    categoryId: category.id,
    verticalId: category.verticalId,
    handle: category.slug,
    shopifyCollectionId,
    shopifyCollectionGid,
    mapped: Boolean(shopifyCollectionId || shopifyCollectionGid),
    productCount,
  };
}

/**
 * Builds the read-only Storefront collectionByHandle query preview — the
 * exact GraphQL operation/variables shape a real collection lookup would
 * send. This is a pure string/object builder; it performs no network I/O.
 */
function buildCollectionPreview(mapping: ShopifyStorefrontCollectionMapping): ShopifyStorefrontCollectionPreview {
  return {
    operationName: 'CollectionByHandlePreview',
    query: 'query CollectionByHandlePreview($handle: String!) { collectionByHandle(handle: $handle) { id handle products(first: 50) { edges { node { id } } } } }',
    variables: { handle: mapping.handle },
  };
}

export function createShopifyStorefrontCollectionService(
  adapter: ShopifyStorefrontCollectionAdapter = unavailableShopifyStorefrontCollectionAdapter,
  catalog: CatalogService = catalogService,
): ShopifyStorefrontCollectionService {
  const adapterMode = inferAdapterMode(adapter);

  function buildRequest(categoryId: string, overrides?: Partial<Omit<ShopifyStorefrontCollectionRequest, 'categoryId' | 'dryRun'>>): ShopifyStorefrontCollectionRequest {
    const request: ShopifyStorefrontCollectionRequest = {
      requestId: overrides?.requestId ?? nextRequestId(),
      dryRun: true,
      categoryId,
      config: overrides?.config,
      requestedAt: overrides?.requestedAt,
      metadata: overrides?.metadata,
    };
    return shopifyStorefrontCollectionRequestSchema.parse(request);
  }

  async function execute(request: ShopifyStorefrontCollectionRequest): Promise<ShopifyStorefrontCollectionResult> {
    const validated = shopifyStorefrontCollectionRequestSchema.parse(request);
    const category = catalog.getCategory(validated.categoryId);

    if (!category) {
      return shopifyStorefrontCollectionResultSchema.parse({
        requestId: validated.requestId,
        status: 'failed',
        categoryId: validated.categoryId,
        mapping: null,
        preview: null,
        errors: [{ code: 'validation-error', message: `No catalog category was found for categoryId "${validated.categoryId}".`, fieldPath: 'categoryId', retryable: false }],
        metadata: { source: 'shopifyStorefrontCollectionService', attributes: { adapterMode } },
      });
    }

    const { total } = catalog.searchProducts({ filter: { categoryId: category.id } });
    const mapping = buildStorefrontCollectionMapping(category, total);
    const preview = buildCollectionPreview(mapping);

    const result = await adapter.execute({
      requestId: validated.requestId,
      categoryId: validated.categoryId,
      mapping,
      preview,
      config: validated.config,
    });

    return shopifyStorefrontCollectionResultSchema.parse({
      ...result,
      metadata: { ...result.metadata, source: 'shopifyStorefrontCollectionService', attributes: { ...result.metadata?.attributes, adapterMode } },
    });
  }

  return {
    buildRequest,
    execute,

    /**
     * Convenience entry point for the Category Storefront Collection
     * panel: builds and executes a request for a single categoryId. Never
     * calls Shopify by default because the default adapter is
     * unavailableShopifyStorefrontCollectionAdapter.
     */
    async previewCollection(categoryId, config) {
      const request = buildRequest(categoryId, { config });
      return execute(request);
    },

    getCapabilities(): ShopifyStorefrontCollectionCapabilities {
      return {
        dryRunOnly: true,
        liveCallsEnabled: false,
        adapterMode,
      };
    },
  };
}

export const shopifyStorefrontCollectionService: ShopifyStorefrontCollectionService = createShopifyStorefrontCollectionService();
