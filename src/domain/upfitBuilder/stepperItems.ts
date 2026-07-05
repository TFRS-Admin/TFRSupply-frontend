import type { GuidedUpfitChecklist } from '@/types/upfitBuilder';
import type { UpfitBuilderCategoryTier, UpfitBuilderStepId, UpfitBuilderStepStatus } from '@/types/upfitBuilder';
import { UPFIT_BUILDER_STEP_SEQUENCE, isCategoryStep, type UpfitBuilderSetupState } from './stepSequence';
import { getUpfitBuilderStepLabel } from './stepLabels';

export interface UpfitBuilderStepperItem {
  stepId: UpfitBuilderStepId;
  label: string;
  status: UpfitBuilderStepStatus | 'upcoming';
  tier?: UpfitBuilderCategoryTier;
}

const SETUP_STAGE_COMPLETE: Record<string, (state: UpfitBuilderSetupState) => boolean> = {
  project: (state) => state.hasActiveProject,
  build: (state) => state.hasActiveBuild,
  vehicle: (state) => state.hasVehicle,
  standard: (state) => state.hasStandard,
  style: (state) => state.hasStyle,
};

/**
 * Builds the ordered list the Guided Upfit Builder's stepper sidebar renders
 * — every setup stage, upfit-category step, and the final Review step, each
 * with a display label and status. Pure so the stepper's status logic (what
 * counts as complete/missing/skipped for a setup stage vs. a category step)
 * is unit-testable without rendering anything.
 *
 * `checklist` is nullable — before a Fleet Build is selected there is nothing
 * to score yet, but the customer should still see every upcoming step, so
 * category steps fall back to an "upcoming"/optional placeholder rather than
 * disappearing from the list.
 */
export function buildUpfitBuilderStepperItems(
  setupState: UpfitBuilderSetupState,
  checklist: GuidedUpfitChecklist | null,
  skippedStepIds: UpfitBuilderStepId[] = [],
): UpfitBuilderStepperItem[] {
  const skipped = new Set(skippedStepIds);
  const checklistByCategory = new Map((checklist?.steps ?? []).map((step) => [step.categoryId, step]));

  return UPFIT_BUILDER_STEP_SEQUENCE.map((stepId) => {
    if (stepId === 'review') {
      return { stepId, label: getUpfitBuilderStepLabel(stepId), status: 'upcoming' as const };
    }
    if (isCategoryStep(stepId)) {
      const step = checklistByCategory.get(stepId as never);
      if (!step) return { stepId, label: getUpfitBuilderStepLabel(stepId), status: 'upcoming' as const, tier: 'optional' as const };
      return { stepId, label: step.label, status: step.status, tier: step.tier };
    }
    const isComplete = SETUP_STAGE_COMPLETE[stepId]?.(setupState) ?? false;
    const status: UpfitBuilderStepStatus = isComplete ? 'complete' : skipped.has(stepId) ? 'skipped' : 'missing';
    return { stepId, label: getUpfitBuilderStepLabel(stepId), status };
  });
}
