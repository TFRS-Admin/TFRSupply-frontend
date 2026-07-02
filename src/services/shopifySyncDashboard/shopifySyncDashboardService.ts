import {
  dashboardInventoryLocations,
  dashboardProduct,
  dashboardQuote,
  dashboardRequestedAt,
  dashboardWebhookHeaders,
  dashboardWebhookRawBody,
  dashboardWebhookVerificationRequest,
} from '@/adapters/shopifySyncDashboard';
import { createMockShopifyJobQueueAdapter } from '@/adapters/shopifyJobQueue';
import { mockShopifyCatalogAdapter } from '@/adapters/shopifyCatalog';
import { mockShopifyCustomerAdapter } from '@/adapters/shopifyCustomer';
import { mockShopifyFulfillmentAdapter } from '@/adapters/shopifyFulfillment';
import { mockShopifyInventoryAdapter } from '@/adapters/shopifyInventory';
import { mockShopifyOrderAdapter } from '@/adapters/shopifyOrder';
import { mockShopifyPricingAdapter } from '@/adapters/shopifyPricing';
import { mockShopifyWebhookAdapter } from '@/adapters/shopifyWebhook';
import { mockShopifyWebhookVerificationAdapter } from '@/adapters/shopifyWebhookVerification';
import { createShopifyCatalogService, type ShopifyCatalogService } from '@/services/shopifyCatalog';
import { createShopifyCustomerService, type ShopifyCustomerService } from '@/services/shopifyCustomer';
import { createShopifyFulfillmentService, type ShopifyFulfillmentService } from '@/services/shopifyFulfillment';
import { createShopifyInventoryService, type ShopifyInventoryService } from '@/services/shopifyInventory';
import { createShopifyJobQueueService, type ShopifyJobQueueService } from '@/services/shopifyJobQueue';
import { createShopifyOrderService, mapQuoteToShopifyOrder, type ShopifyOrderService } from '@/services/shopifyOrder';
import { createShopifyPricingService, type ShopifyPricingService } from '@/services/shopifyPricing';
import { createShopifySyncOrchestratorService, type ShopifySyncOrchestratorService } from '@/services/shopifySyncOrchestrator';
import { createShopifyWebhookService, type ShopifyWebhookService } from '@/services/shopifyWebhook';
import { createShopifyWebhookVerificationService, type ShopifyWebhookVerificationService } from '@/services/shopifyWebhookVerification';
import { shopifySyncDashboardDataSchema } from '@/schemas/shopifySyncDashboard.schema';
import type { ShopifyJobRequest, ShopifyJobType } from '@/types/shopifyJobQueue';
import type { ShopifySyncOperationRequest, ShopifySyncOrchestratorRequest } from '@/types/shopifySyncOrchestrator';
import type { ShopifySyncDashboardData } from '@/types/shopifySyncDashboard';

export interface ShopifySyncDashboardService {
  loadDashboard(): Promise<ShopifySyncDashboardData>;
}

export interface ShopifySyncDashboardServiceDependencies {
  catalog?: ShopifyCatalogService;
  inventory?: ShopifyInventoryService;
  pricing?: ShopifyPricingService;
  customer?: ShopifyCustomerService;
  order?: ShopifyOrderService;
  fulfillment?: ShopifyFulfillmentService;
  webhook?: ShopifyWebhookService;
  webhookVerification?: ShopifyWebhookVerificationService;
  orchestrator?: ShopifySyncOrchestratorService;
  jobQueue?: ShopifyJobQueueService;
  now?: () => string;
}

function buildDashboardRequests(): {
  catalog: ReturnType<typeof buildCatalogRequest>;
  inventory: ReturnType<typeof buildInventoryRequest>;
  pricing: ReturnType<typeof buildPricingRequest>;
  customer: ReturnType<typeof buildCustomerRequest>;
  order: ReturnType<typeof buildOrderRequest>;
  fulfillment: ReturnType<typeof buildFulfillmentRequest>;
  webhook: ReturnType<typeof buildWebhookRequest>;
  webhookVerification: ReturnType<typeof buildWebhookVerificationRequest>;
} {
  return {
    catalog: buildCatalogRequest(),
    inventory: buildInventoryRequest(),
    pricing: buildPricingRequest(),
    customer: buildCustomerRequest(),
    order: buildOrderRequest(),
    fulfillment: buildFulfillmentRequest(),
    webhook: buildWebhookRequest(),
    webhookVerification: buildWebhookVerificationRequest(),
  };
}

function buildCatalogRequest() {
  return { requestId: 'shopify-sync-dashboard-catalog', products: [dashboardProduct()], dryRun: true as const, requestedAt: dashboardRequestedAt };
}

function buildInventoryRequest() {
  return { requestId: 'shopify-sync-dashboard-inventory', products: [dashboardProduct()], locations: dashboardInventoryLocations(), dryRun: true as const, requestedAt: dashboardRequestedAt };
}

function buildPricingRequest() {
  return { requestId: 'shopify-sync-dashboard-pricing', products: [dashboardProduct()], dryRun: true as const, requestedAt: dashboardRequestedAt, defaultCurrencyCode: 'USD' };
}

function buildCustomerRequest() {
  return { requestId: 'shopify-sync-dashboard-customer', quote: dashboardQuote(), dryRun: true as const, requestedAt: dashboardRequestedAt };
}

function buildOrderRequest() {
  return { requestId: 'shopify-sync-dashboard-order', quote: dashboardQuote(), dryRun: true as const, requestedAt: dashboardRequestedAt };
}

function buildFulfillmentRequest() {
  const { order } = mapQuoteToShopifyOrder(dashboardQuote(), { requestedAt: dashboardRequestedAt });
  return { requestId: 'shopify-sync-dashboard-fulfillment', order, dryRun: true as const, requestedAt: dashboardRequestedAt, locationId: 'warehouse-east' };
}

function buildWebhookRequest() {
  return { requestId: 'shopify-sync-dashboard-webhook', headers: dashboardWebhookHeaders(), rawBody: dashboardWebhookRawBody(), receivedAt: dashboardRequestedAt };
}

function buildWebhookVerificationRequest() {
  return dashboardWebhookVerificationRequest();
}

function buildOrchestratorRequest(requests: ReturnType<typeof buildDashboardRequests>): ShopifySyncOrchestratorRequest {
  return {
    requestId: 'shopify-sync-dashboard-orchestrator',
    dryRun: true,
    requestedAt: dashboardRequestedAt,
    operations: [
      { operationId: 'catalog-step', operation: 'catalog', request: requests.catalog },
      { operationId: 'inventory-step', operation: 'inventory', dependsOn: ['catalog-step'], request: requests.inventory },
      { operationId: 'pricing-step', operation: 'pricing', dependsOn: ['catalog-step'], request: requests.pricing },
      { operationId: 'customer-step', operation: 'customer', request: requests.customer },
      { operationId: 'order-step', operation: 'order', dependsOn: ['customer-step'], request: requests.order },
      { operationId: 'fulfillment-step', operation: 'fulfillment', dependsOn: ['order-step'], request: requests.fulfillment },
      { operationId: 'webhook-step', operation: 'webhook', request: requests.webhook },
      { operationId: 'webhook-verification-step', operation: 'webhook-verification', request: requests.webhookVerification },
    ],
  };
}

function buildJobRequests(requests: ReturnType<typeof buildDashboardRequests>): ShopifyJobRequest[] {
  const jobDefinitions: Array<{ jobId: string; jobType: ShopifyJobType; payload: ShopifySyncOperationRequest; dependsOn?: ShopifyJobRequest['dependsOn'] }> = [
    { jobId: 'catalog-job', jobType: 'catalog', payload: requests.catalog },
    { jobId: 'inventory-job', jobType: 'inventory', payload: requests.inventory, dependsOn: [{ dependsOnJobId: 'catalog-job', required: true }] },
    { jobId: 'pricing-job', jobType: 'pricing', payload: requests.pricing, dependsOn: [{ dependsOnJobId: 'catalog-job', required: true }] },
    { jobId: 'customer-job', jobType: 'customer', payload: requests.customer },
    { jobId: 'order-job', jobType: 'order', payload: requests.order, dependsOn: [{ dependsOnJobId: 'customer-job', required: true }] },
    { jobId: 'fulfillment-job', jobType: 'fulfillment', payload: requests.fulfillment, dependsOn: [{ dependsOnJobId: 'order-job', required: true }] },
    { jobId: 'webhook-job', jobType: 'webhook', payload: requests.webhook },
    { jobId: 'webhook-verification-job', jobType: 'webhook-verification', payload: requests.webhookVerification },
  ];
  return jobDefinitions.map((definition, index) => ({
    requestId: 'shopify-sync-dashboard-jobs',
    jobId: definition.jobId,
    jobType: definition.jobType,
    priority: index === 0 ? 'high' : 'normal',
    dryRun: true,
    requestedAt: dashboardRequestedAt,
    payload: definition.payload,
    dependsOn: definition.dependsOn,
  }));
}

export function createShopifySyncDashboardService(dependencies: ShopifySyncDashboardServiceDependencies = {}): ShopifySyncDashboardService {
  const catalog = dependencies.catalog ?? createShopifyCatalogService(mockShopifyCatalogAdapter);
  const inventory = dependencies.inventory ?? createShopifyInventoryService(mockShopifyInventoryAdapter);
  const pricing = dependencies.pricing ?? createShopifyPricingService(mockShopifyPricingAdapter);
  const customer = dependencies.customer ?? createShopifyCustomerService(mockShopifyCustomerAdapter);
  const order = dependencies.order ?? createShopifyOrderService(mockShopifyOrderAdapter);
  const fulfillment = dependencies.fulfillment ?? createShopifyFulfillmentService(mockShopifyFulfillmentAdapter);
  const webhook = dependencies.webhook ?? createShopifyWebhookService(mockShopifyWebhookAdapter);
  const webhookVerification = dependencies.webhookVerification ?? createShopifyWebhookVerificationService(mockShopifyWebhookVerificationAdapter);
  const orchestrator = dependencies.orchestrator ?? createShopifySyncOrchestratorService({
    catalog, inventory, pricing, customer, order, fulfillment, webhook, webhookVerification,
    syncFoundation: { syncProduct: async () => { throw new Error('shopifySyncDashboardService does not exercise the sync-foundation operation.'); }, syncVariant: async () => { throw new Error('unused'); }, syncInventory: async () => { throw new Error('unused'); }, syncPricingReference: async () => { throw new Error('unused'); }, getSyncStatus: async () => { throw new Error('unused'); } },
  });
  const jobQueue = dependencies.jobQueue ?? createShopifyJobQueueService(createMockShopifyJobQueueAdapter(), orchestrator);
  const now = dependencies.now ?? (() => new Date().toISOString());

  return {
    async loadDashboard(): Promise<ShopifySyncDashboardData> {
      const requests = buildDashboardRequests();

      const [catalogResult, inventoryResult, pricingResult, customerResult, orderResult, fulfillmentResult] = await Promise.all([
        catalog.syncCatalog(requests.catalog),
        inventory.syncInventory(requests.inventory),
        pricing.syncPricing(requests.pricing),
        customer.createCustomer(requests.customer),
        order.createOrder(requests.order),
        fulfillment.createFulfillment(requests.fulfillment),
      ]);

      const receivedWebhook = await webhook.receiveWebhook(requests.webhook);
      const routedWebhook = receivedWebhook.event ? await webhook.routeWebhookEvent(receivedWebhook.event) : receivedWebhook;
      const webhookVerificationResult = await webhookVerification.verifyWebhookSignature(requests.webhookVerification);

      const orchestratorRequest = buildOrchestratorRequest(requests);
      const orchestratorPlan = orchestrator.buildExecutionPlan(orchestratorRequest);
      const orchestratorResult = await orchestrator.orchestrate(orchestratorRequest);

      const jobResults = await jobQueue.queueJobs(buildJobRequests(requests));

      const dashboardData = {
        generatedAt: now(),
        orchestrator: { plan: orchestratorPlan, result: orchestratorResult },
        jobQueue: { jobs: jobResults },
        catalog: catalogResult,
        inventory: inventoryResult,
        pricing: pricingResult,
        customer: customerResult,
        order: orderResult,
        fulfillment: fulfillmentResult,
        webhook: { received: receivedWebhook, routed: routedWebhook },
        webhookVerification: webhookVerificationResult,
        metadata: { source: 'shopifySyncDashboardService', attributes: { dryRun: true } },
      };

      return shopifySyncDashboardDataSchema.parse(dashboardData);
    },
  };
}

export const shopifySyncDashboardService: ShopifySyncDashboardService = createShopifySyncDashboardService();
