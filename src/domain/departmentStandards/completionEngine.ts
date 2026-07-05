import type { FleetBuild } from '@/types/fleetBuilds';
import type { DepartmentStandard, FleetBuildIntelligence } from '@/types/departmentStandards';
import { getFilledUpfitCategories } from '@/domain/fleetBuilds/completion';

/** Required categories count for more of the score than recommended/optional ones. Renormalized when a tier is empty. */
const TIER_WEIGHTS = { required: 0.7, recommended: 0.2, optional: 0.1 } as const;

/**
 * The Fleet Completion Engine (Feature 2) — pure, deterministic scoring of
 * one FleetBuild against one DepartmentStandard. Builds on
 * getFilledUpfitCategories (the same "does this category have a product"
 * rule calculateFleetBuildCompletion already uses) rather than re-deriving
 * fill state; layers required/recommended/optional tiers and department
 * compliance on top.
 *
 * Returns null when no standard is assigned — callers should fall back to
 * calculateFleetBuildCompletion's build-style-based scoring in that case, so
 * a build never goes unscored just because it has no department standard yet.
 */
export function evaluateFleetBuildIntelligence(
  build: FleetBuild,
  standard: DepartmentStandard | null,
): FleetBuildIntelligence | null {
  if (!standard) return null;

  const filledSet = new Set(getFilledUpfitCategories(build));
  const { required, recommended, optional } = standard.categories;

  const missingRequired = required.filter((categoryId) => !filledSet.has(categoryId));
  const missingRecommended = recommended.filter((categoryId) => !filledSet.has(categoryId));
  const missingOptional = optional.filter((categoryId) => !filledSet.has(categoryId));

  const requiredInstalled = required.length - missingRequired.length;
  const recommendedInstalled = recommended.length - missingRecommended.length;
  const optionalInstalled = optional.length - missingOptional.length;

  const tiers = [
    { installed: requiredInstalled, total: required.length, weight: TIER_WEIGHTS.required },
    { installed: recommendedInstalled, total: recommended.length, weight: TIER_WEIGHTS.recommended },
    { installed: optionalInstalled, total: optional.length, weight: TIER_WEIGHTS.optional },
  ].filter((tier) => tier.total > 0);
  const weightSum = tiers.reduce((sum, tier) => sum + tier.weight, 0);
  const completionPercent = weightSum === 0
    ? 0
    : Math.round((tiers.reduce((sum, tier) => sum + (tier.installed / tier.total) * tier.weight, 0) / weightSum) * 100);

  return {
    buildId: build.id,
    standardId: standard.id,
    standardName: standard.name,
    completionPercent,
    requiredTotal: required.length,
    requiredInstalled,
    missingRequired,
    recommendedTotal: recommended.length,
    recommendedInstalled,
    missingRecommended,
    optionalTotal: optional.length,
    optionalInstalled,
    missingOptional,
    departmentCompliant: missingRequired.length === 0,
    criticalBlockers: missingRequired,
  };
}
