import { mockShopifyCatalogAdapter } from '@/adapters/shopifyCatalog';
import { mockShopifyCustomerAdapter } from '@/adapters/shopifyCustomer';
import { mockShopifyFulfillmentAdapter } from '@/adapters/shopifyFulfillment';
import { mockShopifyInventoryAdapter } from '@/adapters/shopifyInventory';
import { createMockShopifyJobQueueAdapter } from '@/adapters/shopifyJobQueue';
import { mockShopifyOrderAdapter } from '@/adapters/shopifyOrder';
import { mockShopifyPricingAdapter } from '@/adapters/shopifyPricing';
import { mockShopifySyncDashboardScenario, type ShopifySyncDashboardScenario } from '@/adapters/shopifySyncDashboard';
import { mockShopifyWebhookAdapter } from '@/adapters/shopifyWebhook';
import { mockShopifyWebhookVerificationAdapter } from '@/adapters/shopifyWebhookVerification';
import { shopifySyncDashboardDataSchema } from '@/schemas/shopifySyncDashboard.schema';
import { createShopifyCatalogService, type ShopifyCatalogService } from '@/services/shopifyCatalog';
import { createShopifyCustomerService, type ShopifyCustomerService } from '@/services/shopifyCustomer';
import { createShopifyFulfillmentService, type ShopifyFulfillmentService } from '@/services/shopifyFulfillment';
import { createShopifyInventoryService, type ShopifyInventoryService } from '@/services/shopifyInventory';
import { createShopifyJobQueueService, type ShopifyJobQueueService } from '@/services/shopifyJobQueue';
import { createShopifyOrderService, type ShopifyOrderService } from '@/services/shopifyOrder';
import { createShopifyPricingService, type ShopifyPricingService } from '@/services/shopifyPricing';
import { createShopifySyncService } from '@/services/shopifySync';
import { createShopifySyncOrchestratorService, type ShopifySyncOrchestratorService } from '@/services/shopifySyncOrchestrator';
import { createShopifyWebhookService, type ShopifyWebhookService } from '@/services/shopifyWebhook';
import { createShopifyWebhookVerificationService, type ShopifyWebhookVerificationService } from '@/services/shopifyWebhookVerification';
import type { ShopifySyncDashboardData } from '@/types/shopifySyncDashboard';

export interface ShopifySyncDashboardServices {
  orchestrator: ShopifySyncOrchestratorService;
  jobQueue: ShopifyJobQueueService;
  catalog: ShopifyCatalogService;
  inventory: ShopifyInventoryService;
  pricing: ShopifyPricingService;
  customer: ShopifyCustomerService;
  order: ShopifyOrderService;
  fulfillment: ShopifyFulfillmentService;
  webhook: ShopifyWebhookService;
  webhookVerification: ShopifyWebhookVerificationService;
}

export interface ShopifySyncDashboardService {
  loadDashboard(): Promise<ShopifySyncDashboardData>;
}

export interface ShopifySyncDashboardServiceDependencies {
  services?: ShopifySyncDashboardServices;
  scenario?: ShopifySyncDashboardScenario;
  now?: () => string;
}

/**
 * Every dashboard-owned service instance below is wired to its domain's existing mock
 * adapter (the same adapters exercised by the foundation test suites). This composes the
 * real sync/mapping logic in each service without ever reaching a live Shopify adapter.
 */
function defaultDashboardServices(): ShopifySyncDashboardServices {
  const catalog = createShopifyCatalogService(mockShopifyCatalogAdapter);
  const inventory = createShopifyInventoryService(mockShopifyInventoryAdapter);
  const pricing = createShopifyPricingService(mockShopifyPricingAdapter);
  const customer = createShopifyCustomerService(mockShopifyCustomerAdapter);
  const order = createShopifyOrderService(mockShopifyOrderAdapter);
  const fulfillment = createShopifyFulfillmentService(mockShopifyFulfillmentAdapter);
  const webhook = createShopifyWebhookService(mockShopifyWebhookAdapter);
  const webhookVerification = createShopifyWebhookVerificationService(mockShopifyWebhookVerificationAdapter);
  const syncFoundation = createShopifySyncService();
  const orchestrator = createShopifySyncOrchestratorService({ catalog, inventory, pricing, customer, order, fulfillment, webhook, webhookVerification, syncFoundation });
  const jobQueue = createShopifyJobQueueService(createMockShopifyJobQueueAdapter(), orchestrator);
  return { orchestrator, jobQueue, catalog, inventory, pricing, customer, order, fulfillment, webhook, webhookVerification };
}

export function createShopifySyncDashboardService(dependencies: ShopifySyncDashboardServiceDependencies = {}): ShopifySyncDashboardService {
  const services = dependencies.services ?? defaultDashboardServices();
  const scenario = dependencies.scenario ?? mockShopifySyncDashboardScenario;
  const now = dependencies.now ?? (() => new Date().toISOString());

  return {
    async loadDashboard(): Promise<ShopifySyncDashboardData> {
      const requestedAt = scenario.requestedAt;

      const catalogRequest = { requestId: 'dashboard-catalog-001', products: [scenario.product], dryRun: true as const, requestedAt, source: 'catalog-service' as const };
      const inventoryRequest = { requestId: 'dashboard-inventory-001', products: [scenario.product], locations: scenario.locations, dryRun: true as const, requestedAt, source: 'commerce-foundation' as const };
      const pricingRequest = { requestId: 'dashboard-pricing-001', products: [scenario.product], dryRun: true as const, requestedAt, defaultCurrencyCode: 'USD' };
      const customerRequest = { requestId: 'dashboard-customer-001', quote: scenario.quote, dryRun: true as const, requestedAt };
      const orderRequest = { requestId: 'dashboard-order-001', quote: scenario.quote, dryRun: true as const, requestedAt };
      const mappedOrder = services.order.buildOrderPayload(orderRequest);
      const fulfillmentRequest = { requestId: 'dashboard-fulfillment-001', order: mappedOrder, dryRun: true as const, requestedAt, locationId: scenario.locations[0]?.locationId };
      const webhookRequest = { requestId: 'dashboard-webhook-001', headers: scenario.webhookHeaders, rawBody: scenario.webhookRawBody, receivedAt: requestedAt };
      const verifiedRequest = { requestId: 'dashboard-webhook-verification-verified-001', rawBody: scenario.webhookRawBody, hmacHeader: 'mock-valid-shopify-hmac', secretReference: 'shopify-webhook-secret-ref', shopDomain: scenario.webhookHeaders.shopDomain, topic: scenario.webhookHeaders.topic, receivedAt: requestedAt, triggeredAt: requestedAt };
      const mismatchedRequest = { ...verifiedRequest, requestId: 'dashboard-webhook-verification-mismatch-001', hmacHeader: 'ZmFrZS1zaWduYXR1cmU=' };

      const orchestratorRequest = {
        requestId: 'dashboard-orchestrator-001',
        dryRun: true as const,
        requestedAt,
        operations: [
          { operationId: 'catalog-step', operation: 'catalog' as const, request: catalogRequest },
          { operationId: 'inventory-step', operation: 'inventory' as const, dependsOn: ['catalog-step'], request: inventoryRequest },
          { operationId: 'pricing-step', operation: 'pricing' as const, dependsOn: ['catalog-step'], request: pricingRequest },
          { operationId: 'customer-step', operation: 'customer' as const, request: customerRequest },
          { operationId: 'order-step', operation: 'order' as const, dependsOn: ['customer-step'], request: orderRequest },
          { operationId: 'fulfillment-step', operation: 'fulfillment' as const, dependsOn: ['order-step'], request: fulfillmentRequest },
        ],
      };

      const executionPlan = services.orchestrator.buildExecutionPlan(orchestratorRequest);
      const orchestratorResult = await services.orchestrator.orchestrate(orchestratorRequest);

      const jobResults = await services.jobQueue.queueJobs([
        { requestId: 'dashboard-jobs-001', jobId: 'dashboard-catalog-job', jobType: 'catalog', dryRun: true, requestedAt, payload: catalogRequest },
        { requestId: 'dashboard-jobs-001', jobId: 'dashboard-inventory-job', jobType: 'inventory', dryRun: true, requestedAt, payload: inventoryRequest, dependsOn: [{ dependsOnJobId: 'dashboard-catalog-job', required: true }] },
        { requestId: 'dashboard-jobs-001', jobId: 'dashboard-pricing-job', jobType: 'pricing', dryRun: true, requestedAt, payload: pricingRequest, dependsOn: [{ dependsOnJobId: 'dashboard-catalog-job', required: true }] },
      ]);

      const [catalogResult, inventoryResult, pricingResult, customerResult, orderResult, fulfillmentResult, webhookReceivedResult, verifiedResult, mismatchedResult] = await Promise.all([
        services.catalog.syncCatalog(catalogRequest),
        services.inventory.syncInventory(inventoryRequest),
        services.pricing.syncPricing(pricingRequest),
        services.customer.createCustomer(customerRequest),
        services.order.createOrder(orderRequest),
        services.fulfillment.createFulfillment(fulfillmentRequest),
        services.webhook.receiveWebhook(webhookRequest),
        services.webhookVerification.verifyWebhookSignature(verifiedRequest),
        services.webhookVerification.verifyWebhookSignature(mismatchedRequest),
      ]);

      const webhookEvent = services.webhook.normalizeWebhookRequest(webhookRequest);
      const webhookRoutedResult = await services.webhook.routeWebhookEvent(webhookEvent);

      const dashboardData: ShopifySyncDashboardData = {
        generatedAt: now(),
        orchestrator: { executionPlan, result: orchestratorResult },
        jobQueue: { jobs: jobResults },
        catalog: catalogResult,
        inventory: inventoryResult,
        pricing: pricingResult,
        customer: customerResult,
        order: orderResult,
        fulfillment: fulfillmentResult,
        webhook: { received: webhookReceivedResult, routed: webhookRoutedResult },
        webhookVerification: { verified: verifiedResult, mismatched: mismatchedResult },
        summary: {
          sectionCount: 10,
          statusesByArea: {
            orchestrator: orchestratorResult.status,
            jobQueue: jobResults.every((result) => result.status === 'dry-run') ? 'dry-run' : 'mixed',
            catalog: catalogResult.status,
            inventory: inventoryResult.status,
            pricing: pricingResult.status,
            customer: customerResult.status,
            order: orderResult.status,
            fulfillment: fulfillmentResult.status,
            webhook: webhookReceivedResult.status,
            webhookVerification: verifiedResult.status,
          },
        },
      };

      return shopifySyncDashboardDataSchema.parse(dashboardData);
    },
  };
}

export const shopifySyncDashboardService: ShopifySyncDashboardService = createShopifySyncDashboardService();
