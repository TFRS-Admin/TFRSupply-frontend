import type { ContractPrice, ContractWindow, DealerContract, PriceSource, PricingContext, PricingSubject, PricingWarning, PromotionalBundle, QuantityBreak } from './pricing';

export type ContractWindowEvaluationStatus = 'active' | 'upcoming' | 'expiring-soon' | 'expired' | 'unknown';

export type DealerContractResolutionStatus = 'resolved' | 'no-match' | 'expired' | 'not-eligible' | 'invalid';

export interface ContractWindowEvaluation {
  status: ContractWindowEvaluationStatus;
  window: ContractWindow;
  evaluatedAt: string;
  daysUntilStart?: number;
  daysUntilExpiration?: number;
}

export interface DealerContractResolutionRequest extends PricingSubject {
  quantity: number;
  context: PricingContext;
  candidateContracts?: DealerContract[];
  candidateBundles?: PromotionalBundle[];
}

export interface DealerContractSelection {
  contract: DealerContract | null;
  contractPrice: ContractPrice | null;
  windowEvaluation?: ContractWindowEvaluation;
  source?: PriceSource;
}

export interface QuantityBreakSelection {
  quantity: number;
  applied: QuantityBreak | null;
  eligibleBreaks: QuantityBreak[];
}

export interface PromotionalBundleResolution {
  status: DealerContractResolutionStatus;
  bundle: PromotionalBundle | null;
  windowEvaluation?: ContractWindowEvaluation;
  reason?: string;
}

export interface DealerContractResolutionResult {
  status: DealerContractResolutionStatus;
  sku: string;
  productId?: string;
  quantity: number;
  contractSelection: DealerContractSelection;
  quantityBreakSelection: QuantityBreakSelection;
  bundleResolution: PromotionalBundleResolution | null;
  warnings: PricingWarning[];
  message?: string;
}
