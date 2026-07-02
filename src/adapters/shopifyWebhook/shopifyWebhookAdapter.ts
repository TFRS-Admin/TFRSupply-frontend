import type { ShopifyWebhookEvent, ShopifyWebhookRequest, ShopifyWebhookResult } from '@/types';

export interface ShopifyWebhookAdapter {
  verifyAndReceive(request: ShopifyWebhookRequest): Promise<ShopifyWebhookResult>;
  routeEvent(event: ShopifyWebhookEvent): Promise<ShopifyWebhookResult>;
}

const fallbackNow = '2026-07-02T00:00:00.000Z';

function unavailableReceiveResult(request: ShopifyWebhookRequest): ShopifyWebhookResult {
  return {
    requestId: request.requestId,
    status: 'adapter-unavailable',
    topic: request.headers.topic,
    domain: null,
    event: null,
    errors: [{ code: 'adapter-unavailable', message: 'Shopify webhook adapter is not connected; no live signature verification was performed.', retryable: true }],
    processedAt: request.receivedAt,
    metadata: { source: 'unavailable-shopify-webhook-adapter' },
  };
}

function unavailableRouteResult(event: ShopifyWebhookEvent): ShopifyWebhookResult {
  return {
    requestId: event.id,
    status: 'adapter-unavailable',
    topic: event.topic,
    domain: event.domain,
    event,
    errors: [{ code: 'adapter-unavailable', message: 'Shopify webhook routing adapter is not connected; no downstream handler was invoked.', retryable: true }],
    processedAt: event.receivedAt,
    metadata: { source: 'unavailable-shopify-webhook-adapter' },
  };
}

export const unavailableShopifyWebhookAdapter: ShopifyWebhookAdapter = {
  async verifyAndReceive(request) { return unavailableReceiveResult(request); },
  async routeEvent(event) { return unavailableRouteResult(event); },
};

export const mockShopifyWebhookAdapter: ShopifyWebhookAdapter = {
  async verifyAndReceive(request) {
    return {
      requestId: request.requestId,
      status: 'validated',
      topic: request.headers.topic,
      domain: null,
      event: null,
      errors: [],
      processedAt: request.receivedAt ?? fallbackNow,
      metadata: { source: 'mock-shopify-webhook-adapter' },
    };
  },
  async routeEvent(event) {
    return {
      requestId: event.id,
      status: 'routed',
      topic: event.topic,
      domain: event.domain,
      event,
      errors: [],
      processedAt: fallbackNow,
      metadata: { source: 'mock-shopify-webhook-adapter', attributes: { routedTo: `${event.domain}-handler-placeholder` } },
    };
  },
};
