import type { Product, Quote, ShopifyInventoryLocation, ShopifyWebhookHeaders } from '@/types';

/**
 * Deterministic demo fixtures for the Admin Shopify Sync Dashboard.
 * No network access, no Shopify calls, no persistence — every value here is a fixed
 * input fed to the existing Shopify foundation services in dry-run mode.
 */
export const dashboardRequestedAt = '2026-07-02T00:00:00.000Z';

export const demoProducts: Product[] = [
  {
    id: 'navigator-lightbar',
    label: 'Navigator Lightbar',
    slug: 'navigator-lightbar',
    title: 'Navigator Lightbar',
    sku: 'NVG-ROOT',
    verticalIds: ['police'],
    categoryIds: ['light-bars'],
    vendor: 'Federal Signal',
    category: 'Light Bars',
    commerce: {
      sku_root: 'NVG',
      availability: 'Prototype inventory',
      price_display: '$1,250.00',
      sku_table: [
        { sku: 'NVG-48', model: '48-inch', quantityAvailable: 7, shopifyVariantGid: 'gid://shopify/ProductVariant/48' },
        { sku: 'NVG-54', model: '54-inch', quantityAvailable: 3, shopifyVariantGid: 'gid://shopify/ProductVariant/54' },
      ],
    },
    shopify: { productId: 'shopify-product-1', productGid: 'gid://shopify/Product/1' },
  },
  {
    id: 'sentinel-siren',
    label: 'Sentinel Siren Speaker',
    slug: 'sentinel-siren-speaker',
    title: 'Sentinel Siren Speaker',
    sku: 'SNT-ROOT',
    verticalIds: ['fire-ems'],
    categoryIds: ['sirens'],
    vendor: 'Federal Signal',
    category: 'Sirens',
    commerce: {
      sku_root: 'SNT',
      availability: 'Prototype inventory',
      price_display: '$499.00',
      sku_table: [{ sku: 'SNT-100', model: '100W', quantityAvailable: 12 }],
    },
    shopify: {},
  },
];

export const demoLocations: ShopifyInventoryLocation[] = [
  { locationId: 'warehouse-east', name: 'East Warehouse', shopifyLocationGid: 'gid://shopify/Location/1' },
];

export const demoQuote: Quote = {
  id: 'quote-admin-dashboard-001',
  label: 'Admin Dashboard Demo Quote',
  status: 'approved',
  customerId: 'customer-demo-1',
  customer: {
    customerId: 'customer-demo-1',
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
      productId: 'navigator-lightbar',
      label: 'Navigator Lightbar',
      quantity: 2,
      price: { amount: 625, currencyCode: 'USD', taxable: true },
      subtotal: { amount: 1250, currencyCode: 'USD' },
      lineType: 'product',
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
  total: { amount: 1400, currencyCode: 'USD' },
};

export const demoWebhookHeaders: ShopifyWebhookHeaders = {
  topic: 'orders/create',
  shopDomain: 'tfrsupply.myshopify.com',
  webhookId: 'webhook-admin-dashboard-001',
  apiVersion: '2025-01',
  triggeredAt: dashboardRequestedAt,
};

export const demoWebhookRawBody = JSON.stringify({ id: 88221, email: 'buyer@example.com', total_price: '1400.00' });

export const demoValidHmacHeader = 'mock-valid-shopify-hmac';
export const demoInvalidHmacHeader = 'aW52YWxpZC1zaWduYXR1cmU=';
