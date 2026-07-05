import type { UpfitBuilderStageId, UpfitBuilderStepId } from '@/types/upfitBuilder';
import { ALL_UPFIT_CATEGORY_IDS } from '@/domain/fleetBuilds/upfitCategories';

/** The 5 setup stages, in guided order, before the 12 upfit-category steps. */
export const UPFIT_BUILDER_SETUP_STAGES: UpfitBuilderStageId[] = ['project', 'build', 'vehicle', 'standard', 'style'];

/** Every step in the guided flow, in order: setup stages, then the 12 fixed upfit categories, then Review. */
export const UPFIT_BUILDER_STEP_SEQUENCE: UpfitBuilderStepId[] = [
  ...UPFIT_BUILDER_SETUP_STAGES,
  ...ALL_UPFIT_CATEGORY_IDS,
  'review',
];

export function isSetupStage(stepId: UpfitBuilderStepId): stepId is UpfitBuilderStageId {
  return (UPFIT_BUILDER_SETUP_STAGES as string[]).includes(stepId);
}

export function isCategoryStep(stepId: UpfitBuilderStepId): boolean {
  return (ALL_UPFIT_CATEGORY_IDS as string[]).includes(stepId);
}

export function isReviewStep(stepId: UpfitBuilderStepId): boolean {
  return stepId === 'review';
}

export function getStepIndex(stepId: UpfitBuilderStepId): number {
  return UPFIT_BUILDER_STEP_SEQUENCE.indexOf(stepId);
}

export function getNextStepId(stepId: UpfitBuilderStepId): UpfitBuilderStepId | null {
  const index = getStepIndex(stepId);
  if (index < 0 || index >= UPFIT_BUILDER_STEP_SEQUENCE.length - 1) return null;
  return UPFIT_BUILDER_STEP_SEQUENCE[index + 1];
}

export function getPreviousStepId(stepId: UpfitBuilderStepId): UpfitBuilderStepId | null {
  const index = getStepIndex(stepId);
  if (index <= 0) return null;
  return UPFIT_BUILDER_STEP_SEQUENCE[index - 1];
}

/** Raw facts about a build's setup progress — no skip-state, no derived "decision" flags. */
export interface UpfitBuilderSetupState {
  hasActiveProject: boolean;
  hasActiveBuild: boolean;
  hasVehicle: boolean;
  hasStandard: boolean;
  hasStyle: boolean;
}

/**
 * Resolves where a build's guided flow should resume when it has no
 * persisted `currentStepId` yet (a brand-new build, or a build that has never
 * opened /upfit-builder) — the first setup stage whose underlying data isn't
 * set yet (skipping 'standard' if it was explicitly skipped, since assigning
 * a Department Standard is optional), or the first upfit-category step once
 * every setup stage is done/skipped. Once a step is persisted
 * (UpfitBuilderContext), this is never consulted again for that build until
 * its progress is reset.
 */
export function resolveDefaultStepId(state: UpfitBuilderSetupState, skippedStepIds: UpfitBuilderStepId[] = []): UpfitBuilderStepId {
  if (!state.hasActiveProject) return 'project';
  if (!state.hasActiveBuild) return 'build';
  if (!state.hasVehicle) return 'vehicle';
  if (!state.hasStandard && !skippedStepIds.includes('standard')) return 'standard';
  if (!state.hasStyle) return 'style';
  return ALL_UPFIT_CATEGORY_IDS[0];
}
