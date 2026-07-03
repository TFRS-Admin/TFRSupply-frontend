import { liveShopifyStorefrontAdapter, mockShopifyStorefrontAdapter, unavailableShopifyStorefrontAdapter, type ShopifyStorefrontAdapter } from '@/adapters/shopifyStorefront';
import { shopifyStorefrontAvailabilitySchema, shopifyStorefrontRequestSchema, shopifyStorefrontResponseSchema } from '@/schemas/shopifyStorefront.schema';
import type { ShopifyStorefrontAdapterMode, ShopifyStorefrontAvailability, ShopifyStorefrontCapabilities, ShopifyStorefrontClientConfig, ShopifyStorefrontOperation, ShopifyStorefrontRequest, ShopifyStorefrontResponse } from '@/types';

const SUPPORTED_OPERATION_TYPES: ShopifyStorefrontCapabilities['supportedOperationTypes'] = [
  'shop-query',
  'product-query',
  'product-list-query',
  'collection-query',
  'cart-query',
];

export interface ShopifyStorefrontService {
  buildRequest(operation: ShopifyStorefrontOperation, overrides?: Partial<Omit<ShopifyStorefrontRequest, 'operation' | 'dryRun'>>): ShopifyStorefrontRequest;
  execute(request: ShopifyStorefrontRequest): Promise<ShopifyStorefrontResponse>;
  getAvailability(config?: Partial<ShopifyStorefrontClientConfig>): Promise<ShopifyStorefrontAvailability>;
  getCapabilities(): ShopifyStorefrontCapabilities;
}

let requestSequence = 0;

function nextRequestId(operation: ShopifyStorefrontOperation): string {
  requestSequence += 1;
  return `storefront-request-${operation.operationType}-${requestSequence}`;
}

function inferAdapterMode(adapter: ShopifyStorefrontAdapter): ShopifyStorefrontAdapterMode {
  if (adapter === mockShopifyStorefrontAdapter) return 'mock';
  if (adapter === liveShopifyStorefrontAdapter) return 'live';
  return 'unavailable';
}

export function createShopifyStorefrontService(adapter: ShopifyStorefrontAdapter = unavailableShopifyStorefrontAdapter): ShopifyStorefrontService {
  const adapterMode = inferAdapterMode(adapter);
  return {
    buildRequest(operation, overrides) {
      const request: ShopifyStorefrontRequest = {
        requestId: overrides?.requestId ?? nextRequestId(operation),
        dryRun: true,
        operation,
        config: overrides?.config,
        requestedAt: overrides?.requestedAt,
        metadata: overrides?.metadata,
      };
      return shopifyStorefrontRequestSchema.parse(request);
    },

    async execute(request) {
      const validated = shopifyStorefrontRequestSchema.parse(request);
      const response = await adapter.execute(validated);
      return shopifyStorefrontResponseSchema.parse({ ...response, metadata: { ...response.metadata, source: 'shopifyStorefrontService' } });
    },

    async getAvailability(config) {
      const availability = await adapter.getAvailability(config);
      return shopifyStorefrontAvailabilitySchema.parse({ ...availability, metadata: { ...availability.metadata, source: 'shopifyStorefrontService' } });
    },

    getCapabilities() {
      return {
        supportedOperationTypes: SUPPORTED_OPERATION_TYPES,
        dryRunOnly: true,
        liveCallsEnabled: false,
        adapterMode,
      };
    },
  };
}

export const shopifyStorefrontService = createShopifyStorefrontService();
