import type { ContractPrice, DealerContract, DealerContractSelection, PricingContext, PricingSubject } from '@/types';
import { evaluateContractWindow, isContractWindowEligible } from './contractWindowEvaluator';

function matchesContext(contract: DealerContract, context: PricingContext): boolean {
  if (context.contractId && contract.id !== context.contractId) return false;
  if (context.dealerId && contract.dealerId && contract.dealerId !== context.dealerId) return false;
  if (context.agencyId && contract.agencyId && contract.agencyId !== context.agencyId) return false;
  return true;
}

function findContractPrice(contract: DealerContract, subject: PricingSubject): ContractPrice | null {
  return contract.prices?.find(
    (price) => price.sku === subject.sku && (!subject.productId || !price.productId || price.productId === subject.productId),
  ) ?? null;
}

export function selectDealerContract(
  candidates: DealerContract[] | undefined,
  subject: PricingSubject,
  context: PricingContext,
): DealerContractSelection {
  const eligible = (candidates ?? [])
    .filter((contract) => matchesContext(contract, context))
    .map((contract) => ({ contract, windowEvaluation: evaluateContractWindow(contract.window, context.pricingDate) }))
    .filter(({ windowEvaluation }) => isContractWindowEligible(windowEvaluation))
    .map(({ contract, windowEvaluation }) => ({ contract, windowEvaluation, contractPrice: findContractPrice(contract, subject) }))
    .filter((candidate): candidate is typeof candidate & { contractPrice: ContractPrice } => candidate.contractPrice !== null)
    .sort((a, b) => (b.contract.source?.priority ?? 0) - (a.contract.source?.priority ?? 0));

  const best = eligible[0];
  if (!best) {
    return { contract: null, contractPrice: null };
  }

  return {
    contract: best.contract,
    contractPrice: best.contractPrice,
    windowEvaluation: best.windowEvaluation,
    source: best.contract.source,
  };
}
