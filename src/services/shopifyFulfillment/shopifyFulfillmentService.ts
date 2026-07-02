import { unavailableShopifyFulfillmentAdapter, type ShopifyFulfillmentAdapter } from '@/adapters/shopifyFulfillment';
import { shopifyFulfillmentRequestSchema, shopifyFulfillmentResultSchema } from '@/schemas/shopifyFulfillment.schema';
import type { ShopifyFulfillmentItem, ShopifyFulfillmentMapping, ShopifyFulfillmentRequest, ShopifyFulfillmentResult, ShopifyOrder, ShopifyShipment } from '@/types';

export interface ShopifyFulfillmentService {
  mapOrderToFulfillment(order: ShopifyOrder, request?: Partial<ShopifyFulfillmentRequest>): { items: ShopifyFulfillmentItem[]; shipment: ShopifyShipment; mapping: ShopifyFulfillmentMapping };
  buildFulfillmentPayload(request: ShopifyFulfillmentRequest): { items: ShopifyFulfillmentItem[]; shipment: ShopifyShipment; mapping: ShopifyFulfillmentMapping };
  createFulfillment(request: ShopifyFulfillmentRequest): Promise<ShopifyFulfillmentResult>;
  getFulfillmentSyncStatus(request: ShopifyFulfillmentRequest): Promise<ShopifyFulfillmentResult>;
}

const fallbackNow = '2026-07-02T00:00:00.000Z';

export function mapOrderToShopifyFulfillment(order: ShopifyOrder, request: Partial<ShopifyFulfillmentRequest> = {}) {
  const shippableLines = order.lines.filter((line) => line.requiresShipping !== false);
  const items: ShopifyFulfillmentItem[] = request.items?.length
    ? request.items
    : shippableLines.map((line) => ({ orderLineId: line.id, shopifyLineItemId: line.shopifyVariantId ?? null, sku: line.sku, quantity: line.quantity, locationId: request.locationId }));

  const fulfillmentId = `shopify-fulfillment-draft-${order.id}`;
  const shipment: ShopifyShipment = {
    id: `shopify-shipment-draft-${order.id}`,
    fulfillmentId,
    items,
    tracking: request.trackingInfo,
    status: 'label-pending',
    originLocationId: request.locationId,
    destinationAddress: order.shippingAddress,
    metadata: request.metadata,
  };
  const mapping: ShopifyFulfillmentMapping = {
    orderId: order.id,
    fulfillmentId,
    shopifyOrderId: null,
    shopifyFulfillmentId: null,
    mappedAt: request.requestedAt ?? fallbackNow,
    itemMappings: items.map((item) => ({ orderLineId: item.orderLineId, fulfillmentItemId: `${fulfillmentId}-${item.orderLineId}`, sku: item.sku, shopifyLineItemId: item.shopifyLineItemId })),
    warnings: [],
    metadata: { source: 'shopifyFulfillmentService' },
  };
  return { items, shipment, mapping };
}

export function createShopifyFulfillmentService(adapter: ShopifyFulfillmentAdapter = unavailableShopifyFulfillmentAdapter): ShopifyFulfillmentService {
  async function validateMapAndRun(request: ShopifyFulfillmentRequest, action: (validated: ShopifyFulfillmentRequest) => Promise<ShopifyFulfillmentResult>) {
    const validated = shopifyFulfillmentRequestSchema.parse(request);
    const { items, shipment, mapping } = mapOrderToShopifyFulfillment(validated.order, validated);
    const adapterResult = await action(validated);
    return shopifyFulfillmentResultSchema.parse({
      ...adapterResult,
      items: adapterResult.items.length ? adapterResult.items : items,
      shipment: adapterResult.shipment ?? shipment,
      mapping: adapterResult.mapping ?? mapping,
      metadata: { ...adapterResult.metadata, attributes: { ...adapterResult.metadata?.attributes, mappedBy: 'shopifyFulfillmentService', dryRun: validated.dryRun } },
    });
  }
  return {
    mapOrderToFulfillment: mapOrderToShopifyFulfillment,
    buildFulfillmentPayload: (request) => { const validated = shopifyFulfillmentRequestSchema.parse(request); return mapOrderToShopifyFulfillment(validated.order, validated); },
    createFulfillment: (request) => validateMapAndRun(request, adapter.createFulfillment),
    getFulfillmentSyncStatus: (request) => validateMapAndRun(request, adapter.getFulfillmentSyncStatus),
  };
}

export const shopifyFulfillmentService = createShopifyFulfillmentService();
