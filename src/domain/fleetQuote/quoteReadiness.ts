import type { FleetQuoteBuildEntry, QuoteReadiness, QuoteReadinessLevel } from '@/types/fleetQuote';

const LEVEL_LABELS: Record<QuoteReadinessLevel, string> = {
  ready: 'Ready',
  minor_issues: 'Minor Issues',
  incomplete: 'Incomplete',
  blocked: 'Blocked',
};

/**
 * Deterministic quote readiness scoring — no probability model, no AI. Rules
 * run in a fixed priority order; see docs/architecture/FLEET_QUOTE_BUILDER.md's
 * Readiness Model for the rule table this function implements. Reuses each
 * entry's already-computed Guided Upfit Builder checklist
 * (buildGuidedUpfitChecklist) rather than re-deriving tier/completion facts.
 */
export function resolveQuoteReadiness(hasActiveProject: boolean, entries: FleetQuoteBuildEntry[]): QuoteReadiness {
  if (!hasActiveProject) {
    return { level: 'blocked', label: LEVEL_LABELS.blocked, reasons: ['No active Fleet Project selected.'] };
  }
  if (entries.length === 0) {
    return { level: 'blocked', label: LEVEL_LABELS.blocked, reasons: ['No vehicles have been added to this project yet.'] };
  }

  const reasons: string[] = [];

  const buildsWithoutVehicle = entries.filter((entry) => !entry.build.vehicle).length;
  if (buildsWithoutVehicle > 0) {
    reasons.push(`${buildsWithoutVehicle} fleet build${buildsWithoutVehicle === 1 ? '' : 's'} missing a vehicle assignment.`);
  }

  const buildsWithoutStandard = entries.filter((entry) => !entry.standard).length;
  if (buildsWithoutStandard === entries.length) {
    reasons.push('No Department Standard assigned to any fleet build.');
  } else if (buildsWithoutStandard > 0) {
    reasons.push(`${buildsWithoutStandard} fleet build${buildsWithoutStandard === 1 ? '' : 's'} has no Department Standard assigned.`);
  }

  const missingRequiredCount = entries.reduce((sum, entry) => sum + entry.checklist.missingRequired.length, 0);
  if (missingRequiredCount > 0) {
    reasons.push(`${missingRequiredCount} required equipment item${missingRequiredCount === 1 ? '' : 's'} missing across the fleet.`);
  }

  const missingRecommendedCount = entries.reduce((sum, entry) => sum + entry.checklist.missingRecommended.length, 0);
  const incompleteBuildCount = entries.filter((entry) => entry.checklist.overallPercent < 100).length;

  let level: QuoteReadinessLevel;
  if (missingRequiredCount > 0 || buildsWithoutVehicle > 0) {
    level = 'incomplete';
  } else if (buildsWithoutStandard > 0 || missingRecommendedCount > 0 || incompleteBuildCount > 0) {
    level = 'minor_issues';
  } else {
    level = 'ready';
  }

  return { level, label: LEVEL_LABELS[level], reasons };
}

/** Guided Upfit Builder's "Generate Project Quote" button shows at these readiness levels — edit this list to change the threshold. */
export const PROJECT_QUOTE_READY_LEVELS: QuoteReadinessLevel[] = ['ready', 'minor_issues'];

export function meetsProjectQuoteReadinessThreshold(readiness: QuoteReadiness): boolean {
  return PROJECT_QUOTE_READY_LEVELS.includes(readiness.level);
}
