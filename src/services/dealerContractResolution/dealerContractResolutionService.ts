import { resolvePromotionalBundle, selectDealerContract, selectQuantityBreak } from '@/domain/dealerContractResolution';
import { dealerContractResolutionRequestSchema, dealerContractResolutionResultSchema } from '@/schemas/dealerContractResolution.schema';
import type { DealerContractResolutionRequest, DealerContractResolutionResult, PricingWarning } from '@/types';

export interface DealerContractResolutionService {
  resolve(request: DealerContractResolutionRequest): Promise<DealerContractResolutionResult>;
}

export function createDealerContractResolutionService(): DealerContractResolutionService {
  return {
    async resolve(request) {
      const validated = dealerContractResolutionRequestSchema.parse(request);
      const warnings: PricingWarning[] = [];

      const contractSelection = selectDealerContract(validated.candidateContracts, validated, validated.context);
      const quantityBreakSelection = selectQuantityBreak(contractSelection.contractPrice?.quantityBreaks, validated.quantity);
      const bundleResolution = validated.candidateBundles
        ? resolvePromotionalBundle(validated.candidateBundles, validated, validated.context)
        : null;

      if (!contractSelection.contractPrice) {
        warnings.push({
          code: 'dealer-contract-resolution.no-contract-match',
          severity: 'warning',
          message: `No active dealer contract price was found for SKU ${validated.sku}.`,
          sku: validated.sku,
          productId: validated.productId,
        });
      } else if (contractSelection.windowEvaluation?.status === 'expiring-soon') {
        warnings.push({
          code: 'dealer-contract-resolution.contract-expiring-soon',
          severity: 'review-required',
          message: `Dealer contract ${contractSelection.contract?.id ?? ''} for SKU ${validated.sku} is expiring soon.`,
          sku: validated.sku,
          productId: validated.productId,
        });
      }

      if (bundleResolution && bundleResolution.status !== 'resolved' && bundleResolution.status !== 'no-match') {
        warnings.push({
          code: `dealer-contract-resolution.bundle-${bundleResolution.status}`,
          severity: 'warning',
          message: bundleResolution.reason ?? 'Promotional bundle could not be resolved.',
          sku: validated.sku,
          productId: validated.productId,
        });
      }

      const status: DealerContractResolutionResult['status'] = contractSelection.contractPrice ? 'resolved' : 'no-match';

      return dealerContractResolutionResultSchema.parse({
        status,
        sku: validated.sku,
        productId: validated.productId,
        quantity: validated.quantity,
        contractSelection,
        quantityBreakSelection,
        bundleResolution,
        warnings,
      });
    },
  };
}

export const dealerContractResolutionService: DealerContractResolutionService = createDealerContractResolutionService();
