import { unavailableShopifyInventoryAdapter, type ShopifyInventoryAdapter } from '@/adapters/shopifyInventory';
import { shopifyInventorySyncRequestSchema, shopifyInventorySyncResultSchema } from '@/schemas/shopifyInventory.schema';
import type { InventoryStatus, Product, ProductSkuRow } from '@/types';
import type { ShopifyInventoryAdjustment, ShopifyInventoryMapping, ShopifyInventorySyncItem, ShopifyInventorySyncRequest, ShopifyInventorySyncResult } from '@/types/shopifyInventory';

export interface ShopifyInventoryService {
  mapProductToInventoryItems(product: Product, request: Pick<ShopifyInventorySyncRequest, 'locations' | 'requestedAt' | 'source' | 'defaultQuantity' | 'reason'>): { items: ShopifyInventorySyncItem[]; mappings: ShopifyInventoryMapping[] };
  buildInventoryPayload(request: ShopifyInventorySyncRequest): { items: ShopifyInventorySyncItem[]; mappings: ShopifyInventoryMapping[] };
  syncInventory(request: ShopifyInventorySyncRequest): Promise<ShopifyInventorySyncResult>;
  getInventorySyncStatus(request: ShopifyInventorySyncRequest): Promise<ShopifyInventorySyncResult>;
}

const fallbackNow = '2026-07-02T00:00:00.000Z';
const productSku = (product: Product) => product.sku ?? product.commerce?.sku_root ?? product.id;
const quantityFrom = (row: ProductSkuRow | undefined, product: Product, fallback = 0) => {
  const value = row?.quantityAvailable ?? row?.inventoryQuantity ?? row?.quantity ?? product.commerce?.quantityAvailable ?? product.commerce?.inventoryQuantity ?? fallback;
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : fallback;
};
const inventoryStatus = (quantity: number, product: Product): InventoryStatus => ({ available: quantity > 0, state: quantity > 0 ? 'available' : 'unknown', quantityAvailable: quantity, message: typeof product.commerce?.availability === 'string' ? product.commerce.availability : undefined });
const shopifyString = (product: Product, key: string) => typeof product.shopify?.[key] === 'string' ? product.shopify[key] as string : null;
const variantRows = (product: Product) => product.commerce?.sku_table?.length ? product.commerce.sku_table : [{ sku: productSku(product) } as ProductSkuRow];

function adjustmentFor(sku: string, locationId: string, quantity: number, request: Pick<ShopifyInventorySyncRequest, 'reason'>): ShopifyInventoryAdjustment {
  return { sku, locationId, availableQuantity: quantity, delta: quantity, reason: request.reason ?? 'inventory-sync', metadata: { source: 'shopifyInventoryService' } };
}

export function mapProductToShopifyInventoryItems(product: Product, request: Pick<ShopifyInventorySyncRequest, 'locations' | 'requestedAt' | 'source' | 'defaultQuantity' | 'reason'>) {
  const rows = variantRows(product);
  const items = rows.map((row, index) => {
    const sku = String(row.sku ?? `${productSku(product)}-${index + 1}`);
    const quantity = quantityFrom(row, product, request.defaultQuantity ?? 0);
    const item: ShopifyInventorySyncItem = { productId: product.id, sku, status: 'mapped', inventoryStatus: inventoryStatus(quantity, product), locations: request.locations, adjustments: request.locations.map((location) => adjustmentFor(sku, location.locationId, quantity, request)), variantMapping: { sku, shopifyProductId: shopifyString(product, 'productId'), shopifyProductGid: shopifyString(product, 'productGid'), shopifyVariantId: typeof row.shopifyVariantId === 'string' ? row.shopifyVariantId : null, shopifyVariantGid: typeof row.shopifyVariantGid === 'string' ? row.shopifyVariantGid : null, productReference: { productId: product.id, sku } }, errors: [], metadata: { source: request.source ?? 'commerce-foundation', attributes: { productFamily: product.familyId ?? product.product_family ?? null } } };
    return item;
  });
  const mappings = items.map((item) => ({ productId: item.productId, sku: item.sku, shopifyProductId: item.variantMapping?.shopifyProductId ?? null, shopifyProductGid: item.variantMapping?.shopifyProductGid ?? null, shopifyVariantId: item.variantMapping?.shopifyVariantId ?? null, shopifyVariantGid: item.variantMapping?.shopifyVariantGid ?? null, inventoryItemId: null, inventoryItemGid: null, locationMappings: request.locations.map((location) => ({ locationId: location.locationId, shopifyLocationId: location.shopifyLocationId ?? null, shopifyLocationGid: location.shopifyLocationGid ?? null })), mappedAt: request.requestedAt ?? fallbackNow, warnings: [], metadata: { source: 'shopifyInventoryService' } } satisfies ShopifyInventoryMapping));
  return { items, mappings };
}

export function createShopifyInventoryService(adapter: ShopifyInventoryAdapter = unavailableShopifyInventoryAdapter): ShopifyInventoryService {
  function build(validated: ShopifyInventorySyncRequest) { return validated.products.reduce((payload, product) => { const mapped = mapProductToShopifyInventoryItems(product, validated); payload.items.push(...mapped.items); payload.mappings.push(...mapped.mappings); return payload; }, { items: [] as ShopifyInventorySyncItem[], mappings: [] as ShopifyInventoryMapping[] }); }
  async function validateMapAndRun(request: ShopifyInventorySyncRequest, action: (validated: ShopifyInventorySyncRequest) => Promise<ShopifyInventorySyncResult>) {
    const validated = shopifyInventorySyncRequestSchema.parse(request);
    const payload = build(validated);
    const adapterResult = await action(validated);
    return shopifyInventorySyncResultSchema.parse({ ...adapterResult, items: adapterResult.items.length ? adapterResult.items : payload.items, mappings: adapterResult.mappings.length ? adapterResult.mappings : payload.mappings, metadata: { ...adapterResult.metadata, attributes: { ...adapterResult.metadata?.attributes, mappedBy: 'shopifyInventoryService', dryRun: validated.dryRun } } });
  }
  return { mapProductToInventoryItems: mapProductToShopifyInventoryItems, buildInventoryPayload: (request) => build(shopifyInventorySyncRequestSchema.parse(request)), syncInventory: (request) => validateMapAndRun(request, adapter.syncInventory), getInventorySyncStatus: (request) => validateMapAndRun(request, adapter.getInventorySyncStatus) };
}

export const shopifyInventoryService = createShopifyInventoryService();
