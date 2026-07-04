import type { ShopifyStorefrontCartResult } from './shopifyStorefrontCart';

/**
 * Mirrors CatalogAdapterMode's three-state shape. 'mock' is the safe
 * default when the Storefront API is not enabled; 'unavailable' is the
 * opted-in-but-uncredentialed state; 'live' is only reachable through an
 * explicit configureLiveAdapter() call (the /dev/storefront dashboard's
 * manual credential form) and still never performs a real Storefront
 * mutation — liveShopifyStorefrontCartAdapter remains a request-building
 * stub only.
 */
export type CartAdapterMode = 'mock' | 'unavailable' | 'live';

/**
 * One unmapped Cart Workspace line — a SKU the existing Commerce Foundation
 * has not (yet) resolved to a Shopify variant ID, so no live cart mutation
 * could ever include it.
 */
export interface CartMappingIssue {
  cartLineId: string;
  sku: string;
  reason: string;
}

export interface CartMappingValidationResult {
  totalLineCount: number;
  mappedLineCount: number;
  unmappedLineCount: number;
  issues: CartMappingIssue[];
}

export type CartAdapterDiagnosticLevel = 'info' | 'warning' | 'error';
export type CartAdapterDiagnosticCode =
  | 'adapter-mode'
  | 'live-calls-disabled'
  | 'unmapped-merchandise'
  | 'empty-cart'
  | 'live-config-incomplete';

export interface CartAdapterDiagnostic {
  code: CartAdapterDiagnosticCode;
  level: CartAdapterDiagnosticLevel;
  message: string;
}

export interface CartAdapterStatusSnapshot {
  adapterMode: CartAdapterMode;
  lastPreview: ShopifyStorefrontCartResult | null;
  lastPreviewedAt: string | null;
  mappingValidation: CartMappingValidationResult | null;
  diagnostics: CartAdapterDiagnostic[];
  usedFallback: boolean;
  fallbackReason?: string;
}
