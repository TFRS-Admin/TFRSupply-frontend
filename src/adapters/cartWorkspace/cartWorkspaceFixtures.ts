import type { CartLineItem } from '@/types';

/**
 * Deterministic seed cart lines for the mock adapter. Mirrors the
 * "mock adapter reads a fixed fixture set" pattern used by
 * mockCustomerWorkspaceAdapter — no network, database, or Shopify calls
 * occur here. Quantities and unit prices are fixed so totals are
 * reproducible in tests and in the demo workspace.
 */
export const cartWorkspaceFixtureLines: CartLineItem[] = [
  {
    id: 'cart-line-1',
    productId: 'nav-light-bar',
    sku: 'NAV-SKU',
    label: 'Navigator Full-Size Light Bar',
    image: { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=200&q=80', alt: 'Navigator Full-Size Light Bar' },
    quantity: 2,
    unitPrice: { amount: 1000, currencyCode: 'USD' },
    lineTotal: { amount: 2000, currencyCode: 'USD' },
    availability: 'available',
    configurationStatus: 'complete',
    isPackage: false,
    source: 'configurator',
  },
  {
    id: 'cart-line-2',
    productId: 'siren-speaker',
    sku: 'SIREN-SKU',
    label: 'Dual-Tone Siren Speaker',
    image: { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80', alt: 'Dual-Tone Siren Speaker' },
    quantity: 1,
    unitPrice: { amount: 450, currencyCode: 'USD' },
    lineTotal: { amount: 450, currencyCode: 'USD' },
    availability: 'available',
    configurationStatus: 'not-required',
    isPackage: false,
    source: 'product',
  },
  {
    id: 'cart-line-3',
    productId: 'patrol-package',
    sku: 'PKG-PATROL-01',
    label: 'Patrol Vehicle Upfit Package',
    image: { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=200&q=80', alt: 'Patrol Vehicle Upfit Package' },
    quantity: 1,
    unitPrice: { amount: 3200, currencyCode: 'USD' },
    lineTotal: { amount: 3200, currencyCode: 'USD' },
    availability: 'backorder',
    configurationStatus: 'incomplete',
    isPackage: true,
    packageId: 'patrol-package',
    source: 'package',
  },
];
