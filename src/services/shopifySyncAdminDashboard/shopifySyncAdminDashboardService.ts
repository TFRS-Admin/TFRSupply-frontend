import {
  dashboardRequestedAt,
  demoInvalidHmacHeader,
  demoLocations,
  demoProducts,
  demoQuote,
  demoValidHmacHeader,
  demoWebhookHeaders,
  demoWebhookRawBody,
} from '@/adapters/shopifySyncAdminDashboard';
import { createMockShopifyJobQueueAdapter } from '@/adapters/shopifyJobQueue';
import { mockShopifyCatalogAdapter } from '@/adapters/shopifyCatalog';
import { mockShopifyCustomerAdapter } from '@/adapters/shopifyCustomer';
import { mockShopifyFulfillmentAdapter } from '@/adapters/shopifyFulfillment';
import { mockShopifyInventoryAdapter } from '@/adapters/shopifyInventory';
import { mockShopifyOrderAdapter } from '@/adapters/shopifyOrder';
import { mockShopifyPricingAdapter } from '@/adapters/shopifyPricing';
import { mockShopifyWebhookAdapter } from '@/adapters/shopifyWebhook';
import { mockShopifyWebhookVerificationAdapter } from '@/adapters/shopifyWebhookVerification';
import { summarizeShopifySyncAdminDashboard } from '@/domain/shopifySyncAdminDashboard';
import { shopifySyncAdminDashboardDataSchema } from '@/schemas/shopifySyncAdminDashboard.schema';
import { createShopifyCatalogService } from '@/services/shopifyCatalog';
import { createShopifyCustomerService } from '@/services/shopifyCustomer';
import { createShopifyFulfillmentService } from '@/services/shopifyFulfillment';
import { createShopifyInventoryService } from '@/services/shopifyInventory';
import { createShopifyJobQueueService } from '@/services/shopifyJobQueue';
import { createShopifyOrderService } from '@/services/shopifyOrder';
import { createShopifyPricingService } from '@/services/shopifyPricing';
import { shopifySyncService } from '@/services/shopifySync';
import { createShopifySyncOrchestratorService } from '@/services/shopifySyncOrchestrator';
import { createShopifyWebhookService } from '@/services/shopifyWebhook';
import { createShopifyWebhookVerificationService } from '@/services/shopifyWebhookVerification';
import type {
  ShopifyCatalogSyncRequest,
  ShopifyInventorySyncRequest,
  ShopifyJobRequest,
  ShopifyPricingSyncRequest,
  ShopifySyncOrchestratorRequest,
  ShopifyWebhookRequest,
  ShopifyWebhookVerificationRequest,
} from '@/types';
import type { ShopifySyncAdminDashboardData } from '@/types/shopifySyncAdminDashboard';

export interface ShopifySyncAdminDashboardService {
  loadDashboard(): Promise<ShopifySyncAdminDashboardData>;
}

/**
 * Builds the Shopify sub-services once, wired to the existing deterministic mock
 * adapters (never the unavailable/live adapters) so this dashboard never makes a
 * real Shopify call and never persists anything. All business logic — mapping,
 * validation, orchestration, dependency ordering — comes from the existing
 * shopify* services; this module only supplies fixed demo inputs and aggregates
 * the resulting typed outputs for display.
 */
function buildServices() {
  const catalog = createShopifyCatalogService(mockShopifyCatalogAdapter);
  const inventory = createShopifyInventoryService(mockShopifyInventoryAdapter);
  const pricing = createShopifyPricingService(mockShopifyPricingAdapter);
  const customer = createShopifyCustomerService(mockShopifyCustomerAdapter);
  const order = createShopifyOrderService(mockShopifyOrderAdapter);
  const fulfillment = createShopifyFulfillmentService(mockShopifyFulfillmentAdapter);
  const webhook = createShopifyWebhookService(mockShopifyWebhookAdapter);
  const webhookVerification = createShopifyWebhookVerificationService(mockShopifyWebhookVerificationAdapter);
  const orchestrator = createShopifySyncOrchestratorService({
    catalog,
    inventory,
    pricing,
    customer,
    order,
    fulfillment,
    webhook,
    webhookVerification,
    syncFoundation: shopifySyncService,
  });
  const jobQueue = createShopifyJobQueueService(createMockShopifyJobQueueAdapter(), orchestrator);
  return { catalog, inventory, pricing, customer, order, fulfillment, webhook, webhookVerification, orchestrator, jobQueue };
}

function buildRequests() {
  const catalogRequest: ShopifyCatalogSyncRequest = {
    requestId: 'admin-dashboard-catalog', products: demoProducts, dryRun: true, requestedAt: dashboardRequestedAt, source: 'catalog-service',
  };
  const inventoryRequest: ShopifyInventorySyncRequest = {
    requestId: 'admin-dashboard-inventory', products: demoProducts, locations: demoLocations, dryRun: true, requestedAt: dashboardRequestedAt, source: 'commerce-foundation',
  };
  const pricingRequest: ShopifyPricingSyncRequest = {
    requestId: 'admin-dashboard-pricing', products: demoProducts, dryRun: true, requestedAt: dashboardRequestedAt, defaultCurrencyCode: 'USD', source: 'pricing-domain',
  };
  const customerRequest = { requestId: 'admin-dashboard-customer', quote: demoQuote, dryRun: true as const, requestedAt: dashboardRequestedAt };
  const orderRequest = { requestId: 'admin-dashboard-order', quote: demoQuote, dryRun: true as const, requestedAt: dashboardRequestedAt };
  const webhookRequest: ShopifyWebhookRequest = {
    requestId: 'admin-dashboard-webhook', headers: demoWebhookHeaders, rawBody: demoWebhookRawBody, receivedAt: dashboardRequestedAt,
  };
  const hmacValidRequest: ShopifyWebhookVerificationRequest = {
    requestId: 'admin-dashboard-hmac-valid', rawBody: demoWebhookRawBody, hmacHeader: demoValidHmacHeader, secretReference: 'shopify-webhook-secret-ref', shopDomain: demoWebhookHeaders.shopDomain, topic: 'orders/create', receivedAt: dashboardRequestedAt, triggeredAt: dashboardRequestedAt,
  };
  const hmacInvalidRequest: ShopifyWebhookVerificationRequest = { ...hmacValidRequest, requestId: 'admin-dashboard-hmac-invalid', hmacHeader: demoInvalidHmacHeader };

  const orchestratorRequest: ShopifySyncOrchestratorRequest = {
    requestId: 'admin-dashboard-orchestrator',
    dryRun: true,
    requestedAt: dashboardRequestedAt,
    operations: [
      { operationId: 'catalog-step', operation: 'catalog', request: catalogRequest },
      { operationId: 'inventory-step', operation: 'inventory', dependsOn: ['catalog-step'], request: inventoryRequest },
      { operationId: 'pricing-step', operation: 'pricing', dependsOn: ['catalog-step'], request: pricingRequest },
    ],
  };

  const jobRequests: ShopifyJobRequest[] = [
    { requestId: 'admin-dashboard-jobs', jobId: 'job-catalog', jobType: 'catalog', priority: 'high', dryRun: true, requestedAt: dashboardRequestedAt, payload: catalogRequest },
    { requestId: 'admin-dashboard-jobs', jobId: 'job-inventory', jobType: 'inventory', priority: 'normal', dryRun: true, requestedAt: dashboardRequestedAt, payload: inventoryRequest, dependsOn: [{ dependsOnJobId: 'job-catalog', required: true }] },
    { requestId: 'admin-dashboard-jobs', jobId: 'job-pricing', jobType: 'pricing', priority: 'normal', dryRun: true, requestedAt: dashboardRequestedAt, payload: pricingRequest, dependsOn: [{ dependsOnJobId: 'job-catalog', required: true }] },
    { requestId: 'admin-dashboard-jobs', jobId: 'job-webhook-verification', jobType: 'webhook-verification', priority: 'critical', dryRun: true, requestedAt: dashboardRequestedAt, payload: hmacValidRequest },
  ];

  return { catalogRequest, inventoryRequest, pricingRequest, customerRequest, orderRequest, webhookRequest, hmacValidRequest, hmacInvalidRequest, orchestratorRequest, jobRequests };
}

export function createShopifySyncAdminDashboardService(): ShopifySyncAdminDashboardService {
  return {
    async loadDashboard(): Promise<ShopifySyncAdminDashboardData> {
      const services = buildServices();
      const requests = buildRequests();

      const [plan, orchestratorResult] = [
        services.orchestrator.buildExecutionPlan(requests.orchestratorRequest),
        await services.orchestrator.orchestrate(requests.orchestratorRequest),
      ];
      const jobs = await services.jobQueue.queueJobs(requests.jobRequests);

      const catalog = await services.catalog.syncCatalog(requests.catalogRequest);
      const inventory = await services.inventory.syncInventory(requests.inventoryRequest);
      const pricing = await services.pricing.syncPricing(requests.pricingRequest);
      const customer = await services.customer.createCustomer(requests.customerRequest);
      const order = await services.order.createOrder(requests.orderRequest);

      const orderPayload = services.order.buildOrderPayload(requests.orderRequest);
      const fulfillment = await services.fulfillment.createFulfillment({
        requestId: 'admin-dashboard-fulfillment', order: orderPayload, dryRun: true, requestedAt: dashboardRequestedAt, locationId: demoLocations[0].locationId,
      });

      const webhookReceived = await services.webhook.receiveWebhook(requests.webhookRequest);
      const webhookEvent = webhookReceived.event ?? services.webhook.normalizeWebhookRequest(requests.webhookRequest);
      const webhookRouted = await services.webhook.routeWebhookEvent(webhookEvent);

      const hmacValid = await services.webhookVerification.verifyWebhookSignature(requests.hmacValidRequest);
      const hmacInvalid = await services.webhookVerification.verifyWebhookSignature(requests.hmacInvalidRequest);

      const dashboardWithoutSummary = {
        generatedAt: dashboardRequestedAt,
        orchestrator: { plan, result: orchestratorResult },
        jobQueue: { jobs },
        catalog,
        inventory,
        pricing,
        customer,
        order,
        fulfillment,
        webhook: { received: webhookReceived, routed: webhookRouted },
        hmacVerification: { valid: hmacValid, invalid: hmacInvalid },
        metadata: { source: 'shopifySyncAdminDashboardService', attributes: { dryRun: true, liveShopifyCalls: false } },
      };

      return shopifySyncAdminDashboardDataSchema.parse({
        ...dashboardWithoutSummary,
        summary: summarizeShopifySyncAdminDashboard(dashboardWithoutSummary),
      });
    },
  };
}

export const shopifySyncAdminDashboardService: ShopifySyncAdminDashboardService = createShopifySyncAdminDashboardService();
