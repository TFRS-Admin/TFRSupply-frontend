import type { UpfitBuilderStepId } from '@/types/upfitBuilder';
import { getUpfitCategoryLabel } from '@/domain/fleetBuilds/upfitCategories';
import { isCategoryStep } from './stepSequence';

const SETUP_STAGE_LABELS: Record<string, string> = {
  project: 'Fleet Project',
  build: 'Fleet Build',
  vehicle: 'Vehicle',
  standard: 'Department Standard',
  style: 'Build Style',
  review: 'Review',
};

/** Display label for any step id in the guided flow — a setup stage, an upfit category, or Review. */
export function getUpfitBuilderStepLabel(stepId: UpfitBuilderStepId): string {
  if (isCategoryStep(stepId)) return getUpfitCategoryLabel(stepId as Parameters<typeof getUpfitCategoryLabel>[0]);
  return SETUP_STAGE_LABELS[stepId] ?? stepId;
}
