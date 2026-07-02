import type { Product, Quote } from '@/types';
import type { ShopifyInventoryLocation } from '@/types/shopifyInventory';
import type { ShopifyWebhookHeaders } from '@/types/shopifyWebhook';

/**
 * One deterministic, inline demo scenario (Metro PD ordering Navigator Lightbars) reused
 * across every dashboard section so the preview reads as one coherent sync run instead of
 * unrelated fixtures per panel. No network access, file I/O, or persistence — every value
 * here is a static fixture consumed by the real Shopify sync services in dry-run mode.
 */
export interface ShopifySyncDashboardScenario {
  requestedAt: string;
  product: Product;
  locations: ShopifyInventoryLocation[];
  quote: Quote;
  webhookHeaders: ShopifyWebhookHeaders;
  webhookRawBody: string;
}

export const mockShopifySyncDashboardScenario: ShopifySyncDashboardScenario = {
  requestedAt: '2026-07-02T00:00:00.000Z',
  product: {
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
      sku_table: [{ sku: 'NVG-48', quantityAvailable: 7, shopifyVariantGid: 'gid://shopify/ProductVariant/48' }],
    },
    shopify: { productId: 'shopify-product-1', productGid: 'gid://shopify/Product/1' },
  },
  locations: [
    { locationId: 'warehouse-east', name: 'East Warehouse', shopifyLocationGid: 'gid://shopify/Location/1' },
  ],
  quote: {
    id: 'quote-shopify-sync-dashboard-001',
    label: 'Admin Dashboard Preview Quote',
    status: 'approved',
    customerId: 'customer-metro-pd',
    customer: {
      customerId: 'customer-metro-pd',
      agencyName: 'Metro Police Department',
      contactName: 'Jordan Buyer',
      contactEmail: 'buyer@metropd.example.gov',
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
      },
    ],
    total: { amount: 2500, currencyCode: 'USD' },
  },
  webhookHeaders: {
    topic: 'orders/create',
    shopDomain: 'tfrsupply.myshopify.com',
    webhookId: 'webhook-dashboard-001',
    apiVersion: '2025-01',
    triggeredAt: '2026-07-02T00:00:00.000Z',
  },
  webhookRawBody: JSON.stringify({ id: 987654, email: 'buyer@metropd.example.gov', note: 'Shopify sync dashboard preview order' }),
};
