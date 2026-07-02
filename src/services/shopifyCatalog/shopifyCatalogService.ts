import { unavailableShopifyCatalogAdapter, type ShopifyCatalogAdapter } from '@/adapters/shopifyCatalog';
import { shopifyCatalogSyncRequestSchema, shopifyCatalogSyncResultSchema } from '@/schemas/shopifyCatalog.schema';
import type { Money, Product, ProductSkuRow, ShopifyCatalogMapping, ShopifyCatalogPublishAction, ShopifyCatalogSyncItem, ShopifyCatalogSyncRequest, ShopifyCatalogSyncResult } from '@/types';

export interface ShopifyCatalogService {
  mapProductToCatalogItem(product: Product, request?: Partial<ShopifyCatalogSyncRequest>): { item: ShopifyCatalogSyncItem; mapping: ShopifyCatalogMapping };
  buildCatalogPayload(request: ShopifyCatalogSyncRequest): { items: ShopifyCatalogSyncItem[]; mappings: ShopifyCatalogMapping[] };
  syncCatalog(request: ShopifyCatalogSyncRequest): Promise<ShopifyCatalogSyncResult>;
  getCatalogSyncStatus(request: ShopifyCatalogSyncRequest): Promise<ShopifyCatalogSyncResult>;
}

const fallbackNow = '2026-07-02T00:00:00.000Z';
const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const parsePrice = (value: unknown): Money | undefined => typeof value === 'number' ? { amount: value, currencyCode: 'USD' } : undefined;
const productSku = (product: Product) => product.sku ?? product.commerce?.sku_root ?? product.id;

function variantFromSkuRow(row: ProductSkuRow, index: number, fallbackSku: string) {
  const sku = String(row.sku ?? `${fallbackSku}-${index + 1}`);
  const optionValues = Object.fromEntries(Object.entries(row).filter(([key, value]) => key !== 'sku' && value != null).map(([key, value]) => [key, String(value)]));
  return { sku, title: optionValues.model ?? optionValues.name ?? sku, optionValues: Object.keys(optionValues).length ? optionValues : undefined, metadata: { source: 'product-commerce-sku-table' } };
}

export function mapProductToShopifyCatalogItem(product: Product, request: Partial<ShopifyCatalogSyncRequest> = {}) {
  const action: ShopifyCatalogPublishAction = request.action ?? 'update';
  const sku = productSku(product);
  const handle = slugify(product.slug || product.id);
  const shopify = product.shopify ?? {};
  const variants = product.commerce?.sku_table?.length ? product.commerce.sku_table.map((row, index) => variantFromSkuRow(row, index, sku)) : [{ sku, title: product.title ?? product.label, metadata: { source: 'product-primary-sku' } }];
  const item: ShopifyCatalogSyncItem = {
    productId: product.id,
    sku,
    action,
    status: 'mapped',
    title: product.title ?? product.label,
    handle,
    vendor: product.vendor,
    productType: product.category,
    tags: [...new Set([...(product.verticalIds ?? []), ...(product.categoryIds ?? []), ...(product.verticals ?? [])])],
    description: product.description ?? product.subtitle,
    imageUrls: [product.media?.hero, ...(product.media?.gallery?.map((image) => image.src) ?? []), ...(product.images?.map((image) => image.src) ?? [])].filter(Boolean) as string[],
    price: parsePrice(product.commerce?.price ?? product.commerce?.msrp),
    variants,
    errors: [],
    metadata: { source: request.source ?? 'catalog-service', attributes: { productFamily: product.familyId ?? product.product_family ?? null, configuratorId: product.configuratorId ?? null } },
  };
  const mapping: ShopifyCatalogMapping = { productId: product.id, shopifyProductId: typeof shopify.productId === 'string' ? shopify.productId : null, shopifyProductGid: typeof shopify.productGid === 'string' ? shopify.productGid : null, handle, action, mappedAt: request.requestedAt ?? fallbackNow, variantMappings: variants.map((variant) => ({ sku: variant.sku, action })), warnings: [], metadata: { source: 'shopifyCatalogService' } };
  return { item, mapping };
}

export function createShopifyCatalogService(adapter: ShopifyCatalogAdapter = unavailableShopifyCatalogAdapter): ShopifyCatalogService {
  function build(validated: ShopifyCatalogSyncRequest) { return { items: validated.products.map((product) => mapProductToShopifyCatalogItem(product, validated).item), mappings: validated.products.map((product) => mapProductToShopifyCatalogItem(product, validated).mapping) }; }
  async function validateMapAndRun(request: ShopifyCatalogSyncRequest, action: (validated: ShopifyCatalogSyncRequest) => Promise<ShopifyCatalogSyncResult>) {
    const validated = shopifyCatalogSyncRequestSchema.parse(request);
    const payload = build(validated);
    const adapterResult = await action(validated);
    return shopifyCatalogSyncResultSchema.parse({ ...adapterResult, items: adapterResult.items.length ? adapterResult.items : payload.items, mappings: adapterResult.mappings.length ? adapterResult.mappings : payload.mappings, metadata: { ...adapterResult.metadata, source: adapterResult.metadata?.source, attributes: { ...adapterResult.metadata?.attributes, mappedBy: 'shopifyCatalogService', dryRun: validated.dryRun } } });
  }
  return { mapProductToCatalogItem: mapProductToShopifyCatalogItem, buildCatalogPayload: (request) => build(shopifyCatalogSyncRequestSchema.parse(request)), syncCatalog: (request) => validateMapAndRun(request, adapter.publishCatalog), getCatalogSyncStatus: (request) => validateMapAndRun(request, adapter.getCatalogSyncStatus) };
}

export const shopifyCatalogService = createShopifyCatalogService();
