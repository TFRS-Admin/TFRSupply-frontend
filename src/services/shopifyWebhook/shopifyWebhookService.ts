import { unavailableShopifyWebhookAdapter, type ShopifyWebhookAdapter } from '@/adapters/shopifyWebhook';
import { shopifyWebhookEventSchema, shopifyWebhookRequestSchema, shopifyWebhookResultSchema } from '@/schemas/shopifyWebhook.schema';
import type { ShopifyWebhookDomain, ShopifyWebhookError, ShopifyWebhookEvent, ShopifyWebhookRequest, ShopifyWebhookResult, ShopifyWebhookTopic } from '@/types';

export interface ShopifyWebhookService {
  normalizeWebhookRequest(request: ShopifyWebhookRequest): ShopifyWebhookEvent;
  receiveWebhook(request: ShopifyWebhookRequest): Promise<ShopifyWebhookResult>;
  routeWebhookEvent(event: ShopifyWebhookEvent): Promise<ShopifyWebhookResult>;
}

export const SHOPIFY_WEBHOOK_TOPIC_DOMAINS: Record<ShopifyWebhookTopic, ShopifyWebhookDomain> = {
  'orders/create': 'orders',
  'orders/updated': 'orders',
  'orders/cancelled': 'orders',
  'orders/fulfilled': 'orders',
  'customers/create': 'customers',
  'customers/update': 'customers',
  'customers/delete': 'customers',
  'products/create': 'products',
  'products/update': 'products',
  'products/delete': 'products',
  'inventory_levels/update': 'inventory',
  'inventory_items/update': 'inventory',
  'metafields/create': 'pricing',
  'metafields/update': 'pricing',
  'metafields/delete': 'pricing',
  'fulfillments/create': 'fulfillments',
  'fulfillments/update': 'fulfillments',
};

const fallbackNow = '2026-07-02T00:00:00.000Z';

export class ShopifyWebhookNormalizationError extends Error {
  readonly webhookError: ShopifyWebhookError;

  constructor(webhookError: ShopifyWebhookError) {
    super(webhookError.message);
    this.name = 'ShopifyWebhookNormalizationError';
    this.webhookError = webhookError;
  }
}

export function normalizeShopifyWebhookRequest(request: ShopifyWebhookRequest): ShopifyWebhookEvent {
  const { headers, rawBody, receivedAt } = request;
  const domain = SHOPIFY_WEBHOOK_TOPIC_DOMAINS[headers.topic];
  if (!domain) {
    throw new ShopifyWebhookNormalizationError({ code: 'unsupported-topic', message: `Shopify webhook topic "${headers.topic}" is not supported by this foundation.`, fieldPath: 'headers.topic', retryable: false });
  }

  let payload: Record<string, unknown>;
  try {
    payload = rawBody.trim().length ? JSON.parse(rawBody) : {};
  } catch {
    throw new ShopifyWebhookNormalizationError({ code: 'malformed-payload', message: 'Shopify webhook rawBody is not valid JSON.', fieldPath: 'rawBody', retryable: false });
  }

  return {
    id: `shopify-webhook-event-${headers.webhookId}`,
    topic: headers.topic,
    domain,
    shopDomain: headers.shopDomain,
    webhookId: headers.webhookId,
    payload,
    receivedAt: receivedAt ?? fallbackNow,
    metadata: { source: 'shopifyWebhookService' },
  };
}

export function createShopifyWebhookService(adapter: ShopifyWebhookAdapter = unavailableShopifyWebhookAdapter): ShopifyWebhookService {
  async function receiveWebhook(request: ShopifyWebhookRequest): Promise<ShopifyWebhookResult> {
    const validated = shopifyWebhookRequestSchema.parse(request);

    let event: ShopifyWebhookEvent;
    try {
      event = normalizeShopifyWebhookRequest(validated);
    } catch (error) {
      if (error instanceof ShopifyWebhookNormalizationError) {
        return shopifyWebhookResultSchema.parse({
          requestId: validated.requestId,
          status: 'failed',
          topic: validated.headers.topic,
          domain: SHOPIFY_WEBHOOK_TOPIC_DOMAINS[validated.headers.topic] ?? null,
          event: null,
          errors: [error.webhookError],
          processedAt: validated.receivedAt ?? fallbackNow,
          metadata: { source: 'shopifyWebhookService' },
        });
      }
      throw error;
    }

    const adapterResult = await adapter.verifyAndReceive(validated);
    return shopifyWebhookResultSchema.parse({
      ...adapterResult,
      topic: adapterResult.topic ?? event.topic,
      domain: adapterResult.domain ?? event.domain,
      event: adapterResult.event ?? event,
      metadata: { ...adapterResult.metadata, attributes: { ...adapterResult.metadata?.attributes, normalizedBy: 'shopifyWebhookService' } },
    });
  }

  async function routeWebhookEvent(event: ShopifyWebhookEvent): Promise<ShopifyWebhookResult> {
    const validated = shopifyWebhookEventSchema.parse(event);
    const adapterResult = await adapter.routeEvent(validated);
    return shopifyWebhookResultSchema.parse({
      ...adapterResult,
      topic: adapterResult.topic ?? validated.topic,
      domain: adapterResult.domain ?? validated.domain,
      event: adapterResult.event ?? validated,
      metadata: { ...adapterResult.metadata, attributes: { ...adapterResult.metadata?.attributes, routedBy: 'shopifyWebhookService' } },
    });
  }

  return { normalizeWebhookRequest: normalizeShopifyWebhookRequest, receiveWebhook, routeWebhookEvent };
}

export const shopifyWebhookService = createShopifyWebhookService();
