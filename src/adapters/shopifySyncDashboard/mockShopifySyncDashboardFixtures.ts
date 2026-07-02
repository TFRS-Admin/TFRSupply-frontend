import type { Product } from '@/types/product';
import type { Quote } from '@/types/quote';
import type { ShopifyInventoryLocation } from '@/types/shopifyInventory';
import type { ShopifyWebhookHeaders } from '@/types/shopifyWebhook';
import type { ShopifyWebhookVerificationRequest } from '@/types/shopifyWebhookVerification';

/**
 * Deterministic demo fixtures for the Shopify Sync Admin Dashboard. Every value is a
 * fixed, hand-authored fixture — no live product catalog, quote data, or Shopify
 * credentials are read. These fixtures exist only so the dashboard can exercise the
 * existing Shopify services end to end without a live Shopify connection.
 */

export const dashboardRequestedAt = '2026-07-02T00:00:00.000Z';

export function dashboardProduct(): Product {
  return {
    id: 'navigator',
    label: 'Navigator Lightbar',
    slug: 'navigator-lightbar',
    title: 'Navigator Lightbar',
    sku: 'NVG-ROOT',
    verticalIds: ['police'],
    categoryIds: ['light-bars'],
    commerce: {
      sku_root: 'NVG',
      availability: 'Prototype inventory',
      price_display: '$1,250.00',
      sku_table: [
        { sku: 'NVG-48', quantityAvailable: 7, shopifyVariantGid: 'gid://shopify/ProductVariant/48' },
        { sku: 'NVG-54', quantityAvailable: 3, shopifyVariantGid: 'gid://shopify/ProductVariant/54' },
      ],
    },
    shopify: { productId: 'shopify-product-1', productGid: 'gid://shopify/Product/1' },
  } as Product;
}

export function dashboardInventoryLocations(): ShopifyInventoryLocation[] {
  return [{ locationId: 'warehouse-east', name: 'East Warehouse', shopifyLocationGid: 'gid://shopify/Location/1' }];
}

export function dashboardQuote(): Quote {
  return {
    id: 'quote-dashboard-001',
    label: 'Dashboard Demo Quote',
    status: 'approved',
    customerId: 'customer-1',
    customer: {
      customerId: 'customer-1',
      agencyName: 'Example Police Department',
      contactName: 'Jordan Buyer',
      contactEmail: 'buyer@example.com',
      contactPhone: '555-0100',
    },
    workflow: { status: 'approved', approvalStatus: 'approved' },
    lines: [
      {
        id: 'line-1',
        sku: 'NVG-48',
        productId: 'navigator',
        label: 'Navigator Lightbar',
        quantity: 2,
        price: { amount: 1250, currencyCode: 'USD', taxable: true },
        subtotal: { amount: 2500, currencyCode: 'USD' },
        lineType: 'product',
        metadata: { attributes: { shopifyVariantId: 'gid://shopify/ProductVariant/48' } },
      },
      {
        id: 'line-2',
        sku: 'INSTALL-SVC',
        label: 'Installation Service',
        quantity: 1,
        price: { amount: 150, currencyCode: 'USD' },
        subtotal: { amount: 150, currencyCode: 'USD' },
        lineType: 'service',
      },
    ],
    total: { amount: 2650, currencyCode: 'USD' },
  } as Quote;
}

export function dashboardWebhookHeaders(): ShopifyWebhookHeaders {
  return {
    topic: 'orders/create',
    shopDomain: 'tfrsupply.myshopify.com',
    webhookId: 'webhook-dashboard-001',
    apiVersion: '2025-01',
    triggeredAt: dashboardRequestedAt,
  };
}

export function dashboardWebhookRawBody(): string {
  return JSON.stringify({ id: 987654, email: 'buyer@example.com', line_items: [{ sku: 'NVG-48', quantity: 2 }] });
}

export function dashboardWebhookVerificationRequest(): ShopifyWebhookVerificationRequest {
  return {
    requestId: 'shopify-sync-dashboard-hmac-001',
    rawBody: dashboardWebhookRawBody(),
    hmacHeader: 'mock-valid-shopify-hmac',
    secretReference: 'shopify-webhook-secret-ref',
    shopDomain: 'tfrsupply.myshopify.com',
    topic: 'orders/create',
    receivedAt: dashboardRequestedAt,
    triggeredAt: dashboardRequestedAt,
  };
}
