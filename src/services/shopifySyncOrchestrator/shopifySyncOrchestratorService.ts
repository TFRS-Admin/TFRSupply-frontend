import { shopifyCatalogService, type ShopifyCatalogService } from '@/services/shopifyCatalog';
import { shopifyCustomerService, type ShopifyCustomerService } from '@/services/shopifyCustomer';
import { shopifyFulfillmentService, type ShopifyFulfillmentService } from '@/services/shopifyFulfillment';
import { shopifyInventoryService, type ShopifyInventoryService } from '@/services/shopifyInventory';
import { shopifyOrderService, type ShopifyOrderService } from '@/services/shopifyOrder';
import { shopifyPricingService, type ShopifyPricingService } from '@/services/shopifyPricing';
import { shopifySyncService, type ShopifySyncService } from '@/services/shopifySync';
import { shopifyWebhookService, type ShopifyWebhookService } from '@/services/shopifyWebhook';
import { shopifyWebhookVerificationService, type ShopifyWebhookVerificationService } from '@/services/shopifyWebhookVerification';
import { shopifySyncExecutionPlanSchema, shopifySyncOrchestratorRequestSchema, shopifySyncOrchestratorResultSchema } from '@/schemas/shopifySyncOrchestrator.schema';
import type { ShopifySyncExecutionError, ShopifySyncExecutionPlan, ShopifySyncExecutionStatus, ShopifySyncOperationResult, ShopifySyncOrchestratorRequest, ShopifySyncOrchestratorResult } from '@/types';

export interface ShopifySyncOrchestratorDependencies { customer: ShopifyCustomerService; order: ShopifyOrderService; catalog: ShopifyCatalogService; inventory: ShopifyInventoryService; pricing: ShopifyPricingService; fulfillment: ShopifyFulfillmentService; webhook: ShopifyWebhookService; webhookVerification: ShopifyWebhookVerificationService; syncFoundation: ShopifySyncService; }
export interface ShopifySyncOrchestratorService { buildExecutionPlan(request: ShopifySyncOrchestratorRequest): ShopifySyncExecutionPlan; orchestrate(request: ShopifySyncOrchestratorRequest): Promise<ShopifySyncOrchestratorResult>; }

const fallbackNow = '2026-07-02T00:00:00.000Z';
const nowFor = (value?: string) => value ?? fallbackNow;

function statusFromServiceResult(result: unknown): ShopifySyncExecutionStatus {
  const status = typeof result === 'object' && result && 'status' in result ? String((result as { status?: unknown }).status) : 'failed';
  if (status === 'adapter-unavailable' || status === 'unavailable') return 'adapter-unavailable';
  if (status === 'failed') return 'failed';
  if (status === 'dry-run' || status === 'validated' || status === 'mapped' || status === 'verified' || status === 'routed' || status === 'normalized') return 'dry-run';
  if (status === 'succeeded' || status === 'accepted') return 'succeeded';
  return 'dry-run';
}

function errorsFromServiceResult(result: unknown, operationResult: Pick<ShopifySyncOperationResult, 'operationId' | 'operation'>): ShopifySyncExecutionError[] {
  const source = result as { errors?: unknown[]; failures?: unknown[] } | undefined;
  const rawErrors = Array.isArray(source?.errors) ? source.errors : Array.isArray(source?.failures) ? source.failures : [];
  return rawErrors.map((error) => {
    const item = error as { code?: string; message?: string; retryable?: boolean; fieldPath?: string; metadata?: unknown };
    return { code: item.code === 'adapter-unavailable' ? 'adapter-unavailable' : 'operation-failed', message: item.message ?? 'Shopify operation failed.', operationId: operationResult.operationId, operation: operationResult.operation, fieldPath: item.fieldPath, retryable: item.retryable ?? false, metadata: item.metadata as ShopifySyncExecutionError['metadata'] };
  });
}

function aggregateStatus(results: ShopifySyncOperationResult[], errors: ShopifySyncExecutionError[]): ShopifySyncExecutionStatus {
  if (errors.length && results.length === 0) return 'failed';
  if (results.some((result) => result.status === 'failed')) return results.some((result) => result.status === 'dry-run' || result.status === 'succeeded') ? 'partial' : 'failed';
  if (results.some((result) => result.status === 'adapter-unavailable')) return results.every((result) => result.status === 'adapter-unavailable') ? 'adapter-unavailable' : 'partial';
  if (results.some((result) => result.status === 'succeeded')) return 'succeeded';
  return 'dry-run';
}

export function createShopifySyncOrchestratorService(dependencies: ShopifySyncOrchestratorDependencies = { customer: shopifyCustomerService, order: shopifyOrderService, catalog: shopifyCatalogService, inventory: shopifyInventoryService, pricing: shopifyPricingService, fulfillment: shopifyFulfillmentService, webhook: shopifyWebhookService, webhookVerification: shopifyWebhookVerificationService, syncFoundation: shopifySyncService }): ShopifySyncOrchestratorService {
  function buildExecutionPlan(request: ShopifySyncOrchestratorRequest): ShopifySyncExecutionPlan {
    const validated = shopifySyncOrchestratorRequestSchema.parse(request);
    const createdAt = nowFor(validated.requestedAt);
    const operations = validated.operations.filter((operation) => operation.enabled !== false).map((operation, index) => ({ operationId: operation.operationId ?? `${validated.requestId}-${operation.operation}-${index + 1}`, operation: operation.operation, sequence: index + 1, dependsOn: operation.dependsOn ?? [], request: operation.request, metadata: operation.metadata }));
    return shopifySyncExecutionPlanSchema.parse({ planId: `shopify-sync-plan-${validated.requestId}`, requestId: validated.requestId, status: 'planned', dryRun: true, operations, createdAt, metadata: { ...validated.metadata, source: 'shopifySyncOrchestratorService', attributes: { ...(validated.metadata?.attributes ?? {}), operationCount: operations.length } } });
  }

  async function runOperation(planOperation: ShopifySyncExecutionPlan['operations'][number]): Promise<ShopifySyncOperationResult> {
    const startedAt = fallbackNow;
    const serviceResult = await (async () => {
      switch (planOperation.operation) {
        case 'customer': return dependencies.customer.createCustomer(planOperation.request as never);
        case 'order': return dependencies.order.createOrder(planOperation.request as never);
        case 'catalog': return dependencies.catalog.syncCatalog(planOperation.request as never);
        case 'inventory': return dependencies.inventory.syncInventory(planOperation.request as never);
        case 'pricing': return dependencies.pricing.syncPricing(planOperation.request as never);
        case 'fulfillment': return dependencies.fulfillment.createFulfillment(planOperation.request as never);
        case 'webhook': return dependencies.webhook.receiveWebhook(planOperation.request as never);
        case 'webhook-verification': return dependencies.webhookVerification.verifyWebhookSignature(planOperation.request as never);
        case 'sync-foundation': return dependencies.syncFoundation.syncProduct(planOperation.request as never);
      }
    })();
    const base = { operationId: planOperation.operationId, operation: planOperation.operation };
    const errors = errorsFromServiceResult(serviceResult, base);
    return { ...base, status: statusFromServiceResult(serviceResult), startedAt, completedAt: fallbackNow, serviceResult, errors, metadata: { source: 'shopifySyncOrchestratorService', attributes: { sequence: planOperation.sequence, dryRun: true } } };
  }

  async function orchestrate(request: ShopifySyncOrchestratorRequest): Promise<ShopifySyncOrchestratorResult> {
    const startedAt = nowFor(request.requestedAt);
    const plan = buildExecutionPlan(request);
    const operationResults: ShopifySyncOperationResult[] = [];
    const errors: ShopifySyncExecutionError[] = [];
    for (const operation of plan.operations) {
      try { const result = await runOperation(operation); operationResults.push(result); errors.push(...result.errors); }
      catch (error) { const item = { code: 'operation-failed', message: error instanceof Error ? error.message : 'Shopify operation failed.', operationId: operation.operationId, operation: operation.operation, retryable: false } satisfies ShopifySyncExecutionError; operationResults.push({ operationId: operation.operationId, operation: operation.operation, status: 'failed', startedAt: fallbackNow, completedAt: fallbackNow, serviceResult: null, errors: [item], metadata: { source: 'shopifySyncOrchestratorService' } }); errors.push(item); }
    }
    return shopifySyncOrchestratorResultSchema.parse({ requestId: plan.requestId, plan: { ...plan, status: 'dry-run' }, status: aggregateStatus(operationResults, errors), operationResults, errors, startedAt, completedAt: fallbackNow, metadata: { source: 'shopifySyncOrchestratorService', attributes: { operationCount: operationResults.length, errorCount: errors.length, dryRun: true } } });
  }
  return { buildExecutionPlan, orchestrate };
}

export const shopifySyncOrchestratorService = createShopifySyncOrchestratorService();
