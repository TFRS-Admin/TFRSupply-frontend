import {
  liveShopifyStorefrontProductAdapter,
  mockShopifyStorefrontProductAdapter,
  unavailableShopifyStorefrontProductAdapter,
  type ShopifyStorefrontProductAdapter,
} from '@/adapters/shopifyStorefrontProduct';
import { shopifyStorefrontProductRequestSchema, shopifyStorefrontProductResultSchema } from '@/schemas/shopifyStorefrontProduct.schema';
import { catalogService, type CatalogService } from '@/services/catalog';
import type {
  Product,
  ShopifyStorefrontClientConfig,
  ShopifyStorefrontProductAdapterMode,
  ShopifyStorefrontProductCapabilities,
  ShopifyStorefrontProductMapping,
  ShopifyStorefrontProductPreview,
  ShopifyStorefrontProductRequest,
  ShopifyStorefrontProductResult,
} from '@/types';

export interface ShopifyStorefrontProductService {
  buildRequest(productId: string, overrides?: Partial<Omit<ShopifyStorefrontProductRequest, 'productId' | 'dryRun'>>): ShopifyStorefrontProductRequest;
  execute(request: ShopifyStorefrontProductRequest): Promise<ShopifyStorefrontProductResult>;
  previewProduct(productId: string, config?: Partial<ShopifyStorefrontClientConfig>): Promise<ShopifyStorefrontProductResult>;
  getCapabilities(): ShopifyStorefrontProductCapabilities;
}

let requestSequence = 0;

function nextRequestId(): string {
  requestSequence += 1;
  return `storefront-product-request-${requestSequence}`;
}

function inferAdapterMode(adapter: ShopifyStorefrontProductAdapter): ShopifyStorefrontProductAdapterMode {
  if (adapter === mockShopifyStorefrontProductAdapter) return 'mock';
  if (adapter === liveShopifyStorefrontProductAdapter) return 'live';
  return 'unavailable';
}

/**
 * Derives a read-only ShopifyStorefrontProductMapping from an existing
 * catalog Product (Product Data Platform / Catalog Service). handle,
 * variantCount, and mediaCount reuse fields the Product Detail Experience
 * already reads (product.slug, commerce.sku_table, media.gallery); no new
 * catalog lookup or Shopify request produces them. shopifyProductId/
 * shopifyProductGid reuse the existing Product.shopify metadata bag when a
 * future data source populates it.
 */
export function buildStorefrontProductMapping(product: Product): ShopifyStorefrontProductMapping {
  const shopify = product.shopify ?? {};
  const shopifyProductId = typeof shopify.productId === 'string' ? shopify.productId : null;
  const shopifyProductGid = typeof shopify.productGid === 'string' ? shopify.productGid : null;
  const variantCount = Array.isArray(product.commerce?.sku_table) && product.commerce.sku_table.length > 0
    ? product.commerce.sku_table.length
    : (product.sku ? 1 : 0);
  const mediaCount = (product.media?.gallery?.length ?? 0) + (product.media?.hero ? 1 : 0);

  return {
    productId: product.id,
    sku: product.sku,
    handle: product.slug,
    shopifyProductId,
    shopifyProductGid,
    mapped: Boolean(shopifyProductId || shopifyProductGid),
    variantCount,
    mediaCount,
  };
}

/**
 * Builds the read-only Storefront productByHandle query preview — the
 * exact GraphQL operation/variables shape a real product lookup would
 * send. This is a pure string/object builder; it performs no network I/O.
 */
function buildProductPreview(mapping: ShopifyStorefrontProductMapping): ShopifyStorefrontProductPreview {
  return {
    operationName: 'ProductByHandlePreview',
    query: 'query ProductByHandlePreview($handle: String!) { productByHandle(handle: $handle) { id handle variants(first: 50) { edges { node { id } } } media(first: 50) { edges { node { id } } } } }',
    variables: { handle: mapping.handle },
  };
}

export function createShopifyStorefrontProductService(
  adapter: ShopifyStorefrontProductAdapter = unavailableShopifyStorefrontProductAdapter,
  catalog: CatalogService = catalogService,
): ShopifyStorefrontProductService {
  const adapterMode = inferAdapterMode(adapter);

  function buildRequest(productId: string, overrides?: Partial<Omit<ShopifyStorefrontProductRequest, 'productId' | 'dryRun'>>): ShopifyStorefrontProductRequest {
    const request: ShopifyStorefrontProductRequest = {
      requestId: overrides?.requestId ?? nextRequestId(),
      dryRun: true,
      productId,
      config: overrides?.config,
      requestedAt: overrides?.requestedAt,
      metadata: overrides?.metadata,
    };
    return shopifyStorefrontProductRequestSchema.parse(request);
  }

  async function execute(request: ShopifyStorefrontProductRequest): Promise<ShopifyStorefrontProductResult> {
    const validated = shopifyStorefrontProductRequestSchema.parse(request);
    const product = catalog.getProduct(validated.productId);

    if (!product) {
      return shopifyStorefrontProductResultSchema.parse({
        requestId: validated.requestId,
        status: 'failed',
        productId: validated.productId,
        mapping: null,
        preview: null,
        errors: [{ code: 'validation-error', message: `No catalog product was found for productId "${validated.productId}".`, fieldPath: 'productId', retryable: false }],
        metadata: { source: 'shopifyStorefrontProductService', attributes: { adapterMode } },
      });
    }

    const mapping = buildStorefrontProductMapping(product);
    const preview = buildProductPreview(mapping);

    const result = await adapter.execute({
      requestId: validated.requestId,
      productId: validated.productId,
      mapping,
      preview,
      config: validated.config,
    });

    return shopifyStorefrontProductResultSchema.parse({
      ...result,
      metadata: { ...result.metadata, source: 'shopifyStorefrontProductService', attributes: { ...result.metadata?.attributes, adapterMode } },
    });
  }

  return {
    buildRequest,
    execute,

    /**
     * Convenience entry point for the Product Detail Storefront Product
     * panel: builds and executes a request for a single productId. Never
     * calls Shopify by default because the default adapter is
     * unavailableShopifyStorefrontProductAdapter.
     */
    async previewProduct(productId, config) {
      const request = buildRequest(productId, { config });
      return execute(request);
    },

    getCapabilities(): ShopifyStorefrontProductCapabilities {
      return {
        dryRunOnly: true,
        liveCallsEnabled: false,
        adapterMode,
      };
    },
  };
}

export const shopifyStorefrontProductService: ShopifyStorefrontProductService = createShopifyStorefrontProductService();
