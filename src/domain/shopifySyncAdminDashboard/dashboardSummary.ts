import type { ShopifySyncAdminDashboardData, ShopifySyncAdminDashboardSummary } from '@/types/shopifySyncAdminDashboard';

interface ErrorBearing {
  errors?: Array<unknown>;
}

function countStatus(counts: Record<string, number>, status: string | undefined | null): void {
  if (!status) return;
  counts[status] = (counts[status] ?? 0) + 1;
}

function countErrors(...sections: Array<ErrorBearing | undefined>): number {
  return sections.reduce((sum, section) => sum + (section?.errors?.length ?? 0), 0);
}

function countFailures(...sections: Array<{ failures?: Array<unknown> } | undefined>): number {
  return sections.reduce((sum, section) => sum + (section?.failures?.length ?? 0), 0);
}

export function summarizeShopifySyncAdminDashboard(
  data: Omit<ShopifySyncAdminDashboardData, 'summary'>,
): ShopifySyncAdminDashboardSummary {
  const statusCounts: Record<string, number> = {};
  countStatus(statusCounts, data.orchestrator.result.status);
  countStatus(statusCounts, data.catalog.status);
  countStatus(statusCounts, data.inventory.status);
  countStatus(statusCounts, data.pricing.status);
  countStatus(statusCounts, data.customer.status);
  countStatus(statusCounts, data.order.status);
  countStatus(statusCounts, data.fulfillment.status);
  countStatus(statusCounts, data.webhook.received.status);
  countStatus(statusCounts, data.webhook.routed.status);
  countStatus(statusCounts, data.hmacVerification.valid.status);
  countStatus(statusCounts, data.hmacVerification.invalid.status);
  for (const job of data.jobQueue.jobs) countStatus(statusCounts, job.status);

  const errorCount = countErrors(
    data.orchestrator.result,
    data.catalog,
    data.inventory,
    data.pricing,
    data.customer,
    data.order,
    data.fulfillment,
    data.webhook.received,
    data.webhook.routed,
    ...data.jobQueue.jobs,
  ) + countFailures(data.hmacVerification.valid, data.hmacVerification.invalid);

  return {
    sectionCount: 10,
    operationCount: data.orchestrator.plan.operations.length,
    jobCount: data.jobQueue.jobs.length,
    errorCount,
    statusCounts,
  };
}
