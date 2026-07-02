import { unavailableShopifyOrderAdapter, type ShopifyOrderAdapter } from '@/adapters/shopifyOrder';
import { shopifyOrderRequestSchema, shopifyOrderResultSchema } from '@/schemas/shopifyOrder.schema';
import type { ShopifyOrder, ShopifyOrderCustomer, ShopifyOrderMapping, ShopifyOrderRequest, ShopifyOrderResult, Quote, QuoteLine } from '@/types';

export interface ShopifyOrderService {
  buildOrderPayload(request: ShopifyOrderRequest): ShopifyOrder;
  mapQuoteToOrder(quote: Quote, request?: Partial<ShopifyOrderRequest>): { order: ShopifyOrder; mapping: ShopifyOrderMapping };
  createOrder(request: ShopifyOrderRequest): Promise<ShopifyOrderResult>;
  getOrderSyncStatus(request: ShopifyOrderRequest): Promise<ShopifyOrderResult>;
}

const fallbackNow = '2026-07-02T00:00:00.000Z';
const money = (amount: number, currencyCode = 'USD') => ({ amount, currencyCode });
const lineTotal = (line: QuoteLine) => line.subtotal ?? (line.price ? money(line.price.amount * line.quantity, line.price.currencyCode) : undefined);
const customerFromQuote = (quote: Quote): ShopifyOrderCustomer | undefined => quote.customer ? { customerId: quote.customer.customerId ?? quote.customerId, email: quote.customer.contactEmail, phone: quote.customer.contactPhone, company: quote.customer.agencyName, metadata: quote.customer } : undefined;

export function mapQuoteToShopifyOrder(quote: Quote, request: Partial<ShopifyOrderRequest> = {}) {
  const currencyCode = quote.total?.currencyCode ?? quote.lines.find((line) => line.subtotal?.currencyCode || line.price?.currencyCode)?.subtotal?.currencyCode ?? quote.lines.find((line) => line.price?.currencyCode)?.price?.currencyCode ?? 'USD';
  const orderId = `shopify-order-draft-${quote.id}`;
  const lines = quote.lines.map((line, index) => ({
    id: `shopify-order-line-${line.id || index + 1}`,
    quoteLineId: line.id,
    sku: line.sku,
    shopifyVariantId: line.metadata?.attributes?.shopifyVariantId ? String(line.metadata.attributes.shopifyVariantId) : undefined,
    title: line.label,
    quantity: line.quantity,
    unitPrice: line.price,
    total: lineTotal(line),
    taxable: line.price?.taxable,
    requiresShipping: line.lineType !== 'service',
    properties: { quoteLineId: line.id, productId: line.productId ?? '', lineType: line.lineType ?? '' },
    metadata: line.metadata,
  }));
  const computedSubtotal = lines.reduce((sum, line) => sum + (line.total?.amount ?? 0), 0);
  const order: ShopifyOrder = { id: orderId, quoteId: quote.id, status: 'mapped', customer: request.customer ?? customerFromQuote(quote), billingAddress: request.billingAddress, shippingAddress: request.shippingAddress, lines, subtotal: computedSubtotal ? money(computedSubtotal, currencyCode) : quote.total, total: quote.total ?? (computedSubtotal ? money(computedSubtotal, currencyCode) : undefined), currencyCode, tags: request.tags ?? ['quote-builder', quote.status], note: request.note, sourceName: 'tfrsupply-quote-builder', metadata: request.metadata ?? quote.metadata };
  const mapping: ShopifyOrderMapping = { quoteId: quote.id, orderId, mappedAt: request.requestedAt ?? fallbackNow, lineMappings: lines.map((line) => ({ quoteLineId: line.quoteLineId ?? line.id, orderLineId: line.id, sku: line.sku, shopifyVariantId: line.shopifyVariantId })), warnings: [] };
  return { order, mapping };
}

export function createShopifyOrderService(adapter: ShopifyOrderAdapter = unavailableShopifyOrderAdapter): ShopifyOrderService {
  async function validateMapAndRun(request: ShopifyOrderRequest, action: (validated: ShopifyOrderRequest) => Promise<ShopifyOrderResult>) {
    const validated = shopifyOrderRequestSchema.parse(request);
    const { order, mapping } = mapQuoteToShopifyOrder(validated.quote, validated);
    const adapterResult = await action(validated);
    return shopifyOrderResultSchema.parse({ ...adapterResult, order: adapterResult.order ?? order, mapping: adapterResult.mapping ?? mapping, metadata: { ...adapterResult.metadata, mappedBy: 'shopifyOrderService' } });
  }
  return {
    buildOrderPayload: (request) => mapQuoteToShopifyOrder(shopifyOrderRequestSchema.parse(request).quote, request).order,
    mapQuoteToOrder: mapQuoteToShopifyOrder,
    createOrder: (request) => validateMapAndRun(request, adapter.createOrder),
    getOrderSyncStatus: (request) => validateMapAndRun(request, adapter.getOrderSyncStatus),
  };
}

export const shopifyOrderService = createShopifyOrderService();
