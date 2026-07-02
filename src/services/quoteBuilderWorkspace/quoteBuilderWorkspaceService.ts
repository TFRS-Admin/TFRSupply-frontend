import { createLivePricingAdapter } from '@/adapters/pricing';
import { createInMemoryQuoteBuilderAdapter } from '@/adapters/quoteBuilder';
import { dealerContracts, dealerCosts, listPrices, promotionalBundles, quoteBuilderWorkspaceScenarios } from '@/adapters/quoteBuilderWorkspace';
import { createPricingService } from '@/services/pricing';
import { createQuoteBuilderService } from '@/services/quoteBuilder';
import { createQuotePipelineService } from '@/services/quotePipeline';
import { createLiveQuoteBuilderService, type LiveQuoteBuilderService } from '@/services/liveQuoteBuilder';
import type { LiveQuoteBuilderResult } from '@/types';

export interface QuoteBuilderWorkspaceScenarioResult {
  id: string;
  label: string;
  description: string;
  result: LiveQuoteBuilderResult;
}

export interface QuoteBuilderWorkspaceService {
  loadScenarios(): Promise<QuoteBuilderWorkspaceScenarioResult[]>;
}

/**
 * Wires the existing Quote Builder foundation (quotePipelineService,
 * quoteBuilderService, liveQuoteBuilderService) to the existing Live Pricing
 * Engine (pricingService + livePricingAdapter + dealerContractResolutionService)
 * using deterministic fixture pricing records. No pricing calculation logic
 * lives here — this only composes already-existing services for the workspace demo.
 */
function buildLiveQuoteBuilderService(): LiveQuoteBuilderService {
  const pricing = createPricingService(createLivePricingAdapter({ listPrices, dealerCosts, dealerContracts, promotionalBundles }));
  const quoteBuilder = createQuoteBuilderService(createInMemoryQuoteBuilderAdapter());
  const quotePipeline = createQuotePipelineService({ pricing, quoteBuilder });
  return createLiveQuoteBuilderService({ quotePipeline, quoteBuilder });
}

export function createQuoteBuilderWorkspaceService(liveQuoteBuilder: LiveQuoteBuilderService = buildLiveQuoteBuilderService()): QuoteBuilderWorkspaceService {
  return {
    async loadScenarios() {
      const results: QuoteBuilderWorkspaceScenarioResult[] = [];
      for (const scenario of quoteBuilderWorkspaceScenarios) {
        const result = await liveQuoteBuilder.generateQuote(scenario.request);
        results.push({ id: scenario.id, label: scenario.label, description: scenario.description, result });
      }
      return results;
    },
  };
}

export const quoteBuilderWorkspaceService: QuoteBuilderWorkspaceService = createQuoteBuilderWorkspaceService();
