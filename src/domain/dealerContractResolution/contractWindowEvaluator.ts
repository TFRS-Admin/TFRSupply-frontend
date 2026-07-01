import type { ContractWindow, ContractWindowEvaluation } from '@/types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / MS_PER_DAY);
}

export function evaluateContractWindow(window: ContractWindow, evaluatedAt: string): ContractWindowEvaluation {
  const startsAt = new Date(window.startsAt).getTime();
  const endsAt = new Date(window.endsAt).getTime();
  const at = new Date(evaluatedAt).getTime();

  if (Number.isNaN(startsAt) || Number.isNaN(endsAt) || Number.isNaN(at)) {
    return { status: 'unknown', window, evaluatedAt };
  }

  if (at < startsAt) {
    return { status: 'upcoming', window, evaluatedAt, daysUntilStart: daysBetween(evaluatedAt, window.startsAt) };
  }

  if (at > endsAt) {
    return { status: 'expired', window, evaluatedAt };
  }

  const daysUntilExpiration = daysBetween(evaluatedAt, window.endsAt);
  if (window.expirationAlertDays != null && daysUntilExpiration <= window.expirationAlertDays) {
    return { status: 'expiring-soon', window, evaluatedAt, daysUntilExpiration };
  }

  return { status: 'active', window, evaluatedAt, daysUntilExpiration };
}

export function isContractWindowEligible(evaluation: ContractWindowEvaluation): boolean {
  return evaluation.status === 'active' || evaluation.status === 'expiring-soon';
}
