import type { FleetBuild } from '@/types/fleetBuilds';
import type { DepartmentStandard } from '@/types/departmentStandards';
import type { GuidedUpfitCategoryStep, GuidedUpfitChecklist, UpfitBuilderCategoryTier, UpfitBuilderStepId } from '@/types/upfitBuilder';
import { ALL_UPFIT_CATEGORY_IDS, getUpfitCategoryLabel } from '@/domain/fleetBuilds/upfitCategories';
import { calculateFleetBuildCompletion, getFilledUpfitCategories } from '@/domain/fleetBuilds/completion';
import { evaluateFleetBuildIntelligence } from '@/domain/departmentStandards/completionEngine';

const MISSING_COPY: Record<UpfitBuilderCategoryTier, string> = {
  required: 'Required for department compliance. Add a product or browse options.',
  recommended: 'Recommended for this build style. Add a product or browse options.',
  optional: 'Optional for this build — add one if it applies, or skip for now.',
};

/**
 * A category's tier is read from the build's effective Department Standard
 * when one is assigned (the Fleet Completion Engine's required/recommended/
 * optional tiers, FLEET_INTELLIGENCE.md); a category the standard doesn't
 * mention is treated as optional. With no standard assigned, the build
 * style's guidance-only priority categories become "recommended" and
 * everything else "optional" — never "required," since nothing is a hard
 * dependency gate without an explicit standard.
 */
function resolveCategoryTier(
  categoryId: (typeof ALL_UPFIT_CATEGORY_IDS)[number],
  standard: DepartmentStandard | null,
  styleReferenceCategories: string[],
): UpfitBuilderCategoryTier {
  if (standard) {
    if (standard.categories.required.includes(categoryId)) return 'required';
    if (standard.categories.recommended.includes(categoryId)) return 'recommended';
    return 'optional';
  }
  return styleReferenceCategories.includes(categoryId) ? 'recommended' : 'optional';
}

/**
 * Generates the Guided Upfit Builder's per-category checklist (the "Upfit
 * Steps" feature) for one build — reusing calculateFleetBuildCompletion (for
 * fill state and the build-style reference-category fallback) and
 * evaluateFleetBuildIntelligence (for department-standard tiers/compliance)
 * rather than re-deriving either. `skippedStepIds` is the guided flow's own
 * per-build skip-tracking (UpfitBuilderContext) — only optional-tier
 * categories are ever reported as `status: 'skipped'`.
 */
export function buildGuidedUpfitChecklist(
  build: FleetBuild,
  standard: DepartmentStandard | null,
  skippedStepIds: UpfitBuilderStepId[] = [],
): GuidedUpfitChecklist {
  const filled = new Set(getFilledUpfitCategories(build));
  const skipped = new Set(skippedStepIds);
  const completion = calculateFleetBuildCompletion(build);
  const intelligence = evaluateFleetBuildIntelligence(build, standard);

  const steps: GuidedUpfitCategoryStep[] = ALL_UPFIT_CATEGORY_IDS.map((categoryId) => {
    const tier = resolveCategoryTier(categoryId, standard, completion.referenceCategories);
    const isComplete = filled.has(categoryId);
    const canSkip = tier === 'optional';
    const status = isComplete ? 'complete' : (canSkip && skipped.has(categoryId)) ? 'skipped' : 'missing';

    return {
      categoryId,
      label: getUpfitCategoryLabel(categoryId),
      tier,
      status,
      selectedProducts: (build.selections[categoryId] ?? []).map((selection) => ({
        productId: selection.productId,
        label: selection.label,
      })),
      missingCopy: MISSING_COPY[tier],
      canSkip,
    };
  });

  const byTier = (tier: UpfitBuilderCategoryTier) => steps.filter((step) => step.tier === tier);
  const completeCount = (list: GuidedUpfitCategoryStep[]) => list.filter((step) => step.status === 'complete').length;

  const required = byTier('required');
  const recommended = byTier('recommended');
  const optional = byTier('optional');

  return {
    steps,
    requiredTotal: required.length,
    requiredComplete: completeCount(required),
    recommendedTotal: recommended.length,
    recommendedComplete: completeCount(recommended),
    optionalTotal: optional.length,
    optionalComplete: completeCount(optional),
    overallPercent: intelligence ? intelligence.completionPercent : completion.percent,
    missingRequired: required.filter((step) => step.status !== 'complete').map((step) => step.categoryId),
    missingRecommended: recommended.filter((step) => step.status !== 'complete').map((step) => step.categoryId),
    skippedOptional: optional.filter((step) => step.status === 'skipped').map((step) => step.categoryId),
    departmentCompliant: intelligence ? intelligence.departmentCompliant : null,
  };
}
