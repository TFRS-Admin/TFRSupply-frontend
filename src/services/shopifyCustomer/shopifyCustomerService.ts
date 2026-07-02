import { unavailableShopifyCustomerAdapter, type ShopifyCustomerAdapter } from '@/adapters/shopifyCustomer';
import { shopifyCustomerRequestSchema, shopifyCustomerResultSchema } from '@/schemas/shopifyCustomer.schema';
import type { Quote, QuoteCustomerMetadata, ShopifyCustomer, ShopifyCustomerMapping, ShopifyCustomerRequest, ShopifyCustomerResult } from '@/types';

export interface ShopifyCustomerService {
  buildCustomerPayload(request: ShopifyCustomerRequest): ShopifyCustomer;
  mapCustomerToShopify(request: ShopifyCustomerRequest): { customer: ShopifyCustomer; mapping: ShopifyCustomerMapping };
  createCustomer(request: ShopifyCustomerRequest): Promise<ShopifyCustomerResult>;
  getCustomerSyncStatus(request: ShopifyCustomerRequest): Promise<ShopifyCustomerResult>;
}

const fallbackNow = '2026-07-02T00:00:00.000Z';
const splitName = (name?: string) => {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  return { firstName: parts[0], lastName: parts.length > 1 ? parts.slice(1).join(' ') : undefined };
};
const customerFromRequest = (request: ShopifyCustomerRequest): QuoteCustomerMetadata | undefined => request.customer ?? request.quote?.customer;
const platformCustomerId = (request: ShopifyCustomerRequest, customer?: QuoteCustomerMetadata) => request.shopifyCustomer?.platformCustomerId ?? customer?.customerId ?? request.quote?.customerId ?? `quote-customer-${request.quote?.id ?? request.requestId}`;
const sourceFor = (request: ShopifyCustomerRequest) => request.shopifyCustomer ? 'request-customer' : request.customer ? 'platform-customer' : 'quote-customer';

export function mapQuoteCustomerToShopifyCustomer(request: ShopifyCustomerRequest): { customer: ShopifyCustomer; mapping: ShopifyCustomerMapping } {
  const validated = shopifyCustomerRequestSchema.parse(request);
  const quote: Quote | undefined = validated.quote;
  const sourceCustomer = customerFromRequest(validated);
  const names = splitName(sourceCustomer?.contactName);
  const platformId = platformCustomerId(validated, sourceCustomer);
  const shopifyCustomerId = validated.shopifyCustomer?.shopifyCustomerId ?? `shopify-customer-draft-${platformId}`;
  const customer: ShopifyCustomer = {
    id: shopifyCustomerId,
    platformCustomerId: platformId,
    shopifyCustomerId,
    quoteId: quote?.id,
    status: 'mapped',
    email: validated.shopifyCustomer?.email ?? sourceCustomer?.contactEmail,
    phone: validated.shopifyCustomer?.phone ?? sourceCustomer?.contactPhone,
    firstName: validated.shopifyCustomer?.firstName ?? names.firstName,
    lastName: validated.shopifyCustomer?.lastName ?? names.lastName,
    company: validated.shopifyCustomer?.company ?? sourceCustomer?.agencyName,
    taxExempt: validated.shopifyCustomer?.taxExempt,
    acceptsMarketing: validated.shopifyCustomer?.acceptsMarketing ?? false,
    tags: validated.tags ?? validated.shopifyCustomer?.tags ?? ['quote-builder-customer'],
    note: validated.note ?? validated.shopifyCustomer?.note,
    addresses: validated.addresses ?? validated.shopifyCustomer?.addresses,
    sourceName: 'tfrsupply-customer-sync',
    metadata: validated.metadata ?? validated.shopifyCustomer?.metadata ?? sourceCustomer,
  };
  const mapping: ShopifyCustomerMapping = { platformCustomerId: platformId, shopifyCustomerId, quoteId: quote?.id, mappedAt: validated.requestedAt ?? fallbackNow, source: sourceFor(validated), warnings: [], metadata: { source: 'shopifyCustomerService', attributes: { quoteId: quote?.id ?? null, requestId: validated.requestId } } };
  return { customer, mapping };
}

export function createShopifyCustomerService(adapter: ShopifyCustomerAdapter = unavailableShopifyCustomerAdapter): ShopifyCustomerService {
  async function validateMapAndRun(request: ShopifyCustomerRequest, action: (validated: ShopifyCustomerRequest) => Promise<ShopifyCustomerResult>) {
    const validated = shopifyCustomerRequestSchema.parse(request);
    const { customer, mapping } = mapQuoteCustomerToShopifyCustomer(validated);
    const adapterResult = await action(validated);
    return shopifyCustomerResultSchema.parse({ ...adapterResult, customer: adapterResult.customer ?? customer, mapping: adapterResult.mapping ?? mapping, metadata: { ...adapterResult.metadata, source: 'shopifyCustomerService' } });
  }
  return {
    buildCustomerPayload: (request) => mapQuoteCustomerToShopifyCustomer(request).customer,
    mapCustomerToShopify: mapQuoteCustomerToShopifyCustomer,
    createCustomer: (request) => validateMapAndRun(request, adapter.createCustomer),
    getCustomerSyncStatus: (request) => validateMapAndRun(request, adapter.getCustomerSyncStatus),
  };
}

export const shopifyCustomerService = createShopifyCustomerService();
