import { unavailableShopifyPricingAdapter, type ShopifyPricingAdapter } from '@/adapters/shopifyPricing';
import { shopifyPricingSyncRequestSchema, shopifyPricingSyncResultSchema } from '@/schemas/shopifyPricing.schema';
import type { Money, Product, ProductSkuRow } from '@/types';
import type { ShopifyPriceMapping, ShopifyPricingStrategy, ShopifyPricingSyncItem, ShopifyPricingSyncRequest, ShopifyPricingSyncResult } from '@/types/shopifyPricing';

export interface ShopifyPricingService {
  mapProductToPricingItems(product: Product, request: Pick<ShopifyPricingSyncRequest, 'requestedAt' | 'source' | 'strategy' | 'pricingLines' | 'listPrices' | 'dealerCosts' | 'contractPrices' | 'defaultCurrencyCode'>): { items: ShopifyPricingSyncItem[]; mappings: ShopifyPriceMapping[] };
  buildPricingPayload(request: ShopifyPricingSyncRequest): { items: ShopifyPricingSyncItem[]; mappings: ShopifyPriceMapping[] };
  syncPricing(request: ShopifyPricingSyncRequest): Promise<ShopifyPricingSyncResult>;
  getPricingSyncStatus(request: ShopifyPricingSyncRequest): Promise<ShopifyPricingSyncResult>;
}

const fallbackNow = '2026-07-02T00:00:00.000Z';
const productSku = (product: Product) => product.sku ?? product.commerce?.sku_root ?? product.id;
const shopifyString = (product: Product, key: string) => typeof product.shopify?.[key] === 'string' ? product.shopify[key] as string : null;
const variantRows = (product: Product) => product.commerce?.sku_table?.length ? product.commerce.sku_table : [{ sku: productSku(product) } as ProductSkuRow];
const parsePriceDisplay = (value: unknown): number | null => typeof value === 'string' ? Number.parseFloat(value.replace(/[^0-9.]/g, '')) : typeof value === 'number' ? value : null;
const money = (amount: number, currencyCode = 'USD'): Money => ({ amount: Number(amount.toFixed(2)), currencyCode });

function priceFor(sku: string, product: Product, request: Pick<ShopifyPricingSyncRequest, 'pricingLines' | 'listPrices' | 'dealerCosts' | 'contractPrices' | 'defaultCurrencyCode' | 'strategy'>) {
  const contract = request.contractPrices?.find((price) => price.sku === sku) ?? request.contractPrices?.find((price) => !price.sku && price.productId === product.id);
  if (contract) return { value: contract.sellingPrice, strategy: 'contract-price' as ShopifyPricingStrategy, compareAt: contract.listPrice?.price };
  const line = request.pricingLines?.find((price) => price.sku === sku) ?? request.pricingLines?.find((price) => !price.sku && price.productId === product.id);
  if (line?.requestedUnitPrice) return { value: line.requestedUnitPrice, strategy: request.strategy ?? 'quote-reference' as ShopifyPricingStrategy };
  const list = request.listPrices?.find((price) => price.sku === sku) ?? request.listPrices?.find((price) => !price.sku && price.productId === product.id);
  if (list) return { value: list.price, strategy: 'list-price' as ShopifyPricingStrategy };
  const cost = request.dealerCosts?.find((price) => price.sku === sku) ?? request.dealerCosts?.find((price) => !price.sku && price.productId === product.id);
  if (cost) return { value: cost.cost, strategy: 'dealer-cost' as ShopifyPricingStrategy };
  const display = parsePriceDisplay(product.commerce?.price_display ?? product.commerce?.msrp_display);
  return { value: money(display ?? 0, request.defaultCurrencyCode ?? 'USD'), strategy: request.strategy ?? 'manual' as ShopifyPricingStrategy };
}

export function mapProductToShopifyPricingItems(product: Product, request: Pick<ShopifyPricingSyncRequest, 'requestedAt' | 'source' | 'strategy' | 'pricingLines' | 'listPrices' | 'dealerCosts' | 'contractPrices' | 'defaultCurrencyCode'>) {
  const items = variantRows(product).map((row, index) => {
    const sku = String(row.sku ?? `${productSku(product)}-${index + 1}`);
    const resolved = priceFor(sku, product, request);
    const price = { ...resolved.value, compareAt: resolved.compareAt, taxable: true };
    const item: ShopifyPricingSyncItem = { productId: product.id, sku, status: 'mapped', strategy: resolved.strategy, price, adjustment: { sku, strategy: resolved.strategy, price: resolved.value, compareAtPrice: resolved.compareAt ?? null, reason: 'shopify-pricing-sync-foundation', metadata: { source: 'shopifyPricingService' } }, variantMapping: { sku, shopifyProductId: shopifyString(product, 'productId'), shopifyProductGid: shopifyString(product, 'productGid'), shopifyVariantId: typeof row.shopifyVariantId === 'string' ? row.shopifyVariantId : null, shopifyVariantGid: typeof row.shopifyVariantGid === 'string' ? row.shopifyVariantGid : null, price, productReference: { productId: product.id, sku } }, errors: [], metadata: { source: request.source ?? 'pricing-domain', attributes: { productFamily: product.familyId ?? product.product_family ?? null } } };
    return item;
  });
  const mappings = items.map((item) => ({ productId: item.productId, sku: item.sku, strategy: item.strategy, price: item.price, shopifyProductId: item.variantMapping?.shopifyProductId ?? null, shopifyProductGid: item.variantMapping?.shopifyProductGid ?? null, shopifyVariantId: item.variantMapping?.shopifyVariantId ?? null, shopifyVariantGid: item.variantMapping?.shopifyVariantGid ?? null, mappedAt: request.requestedAt ?? fallbackNow, warnings: [], metadata: { source: 'shopifyPricingService' } } satisfies ShopifyPriceMapping));
  return { items, mappings };
}

export function createShopifyPricingService(adapter: ShopifyPricingAdapter = unavailableShopifyPricingAdapter): ShopifyPricingService {
  function build(validated: ShopifyPricingSyncRequest) { return validated.products.reduce((payload, product) => { const mapped = mapProductToShopifyPricingItems(product, validated); payload.items.push(...mapped.items); payload.mappings.push(...mapped.mappings); return payload; }, { items: [] as ShopifyPricingSyncItem[], mappings: [] as ShopifyPriceMapping[] }); }
  async function validateMapAndRun(request: ShopifyPricingSyncRequest, action: (validated: ShopifyPricingSyncRequest) => Promise<ShopifyPricingSyncResult>) {
    const validated = shopifyPricingSyncRequestSchema.parse(request);
    const payload = build(validated);
    const adapterResult = await action(validated);
    return shopifyPricingSyncResultSchema.parse({ ...adapterResult, items: adapterResult.items.length ? adapterResult.items : payload.items, mappings: adapterResult.mappings.length ? adapterResult.mappings : payload.mappings, metadata: { ...adapterResult.metadata, attributes: { ...adapterResult.metadata?.attributes, mappedBy: 'shopifyPricingService', dryRun: validated.dryRun } } });
  }
  return { mapProductToPricingItems: mapProductToShopifyPricingItems, buildPricingPayload: (request) => build(shopifyPricingSyncRequestSchema.parse(request)), syncPricing: (request) => validateMapAndRun(request, adapter.syncPricing), getPricingSyncStatus: (request) => validateMapAndRun(request, adapter.getPricingSyncStatus) };
}

export const shopifyPricingService = createShopifyPricingService();
