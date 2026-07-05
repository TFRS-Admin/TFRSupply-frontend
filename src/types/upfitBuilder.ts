/**
 * Guided Vehicle Upfit Builder — client-side, localStorage-only domain
 * contracts. This feature does not introduce a new build/product/standard
 * model: it sequences the *existing* Fleet Project → Fleet Build → Vehicle →
 * Department Standard → Build Style → upfit-category setup already exposed by
 * FleetProjectContext/FleetBuildsContext/DepartmentStandardsContext into one
 * guided flow, and layers a small amount of new state on top — which step a
 * build's guided flow is currently on, and which optional steps were
 * explicitly skipped. No backend, authentication, or Shopify data is
 * involved.
 */
import type { UpfitCategoryId } from './fleetBuilds';

/** The five setup stages that precede the 12 upfit-category steps. */
export type UpfitBuilderStageId = 'project' | 'build' | 'vehicle' | 'standard' | 'style';

/**
 * Every step in the guided flow, in order: the 5 setup stages, then the 12
 * upfit categories (src/domain/fleetBuilds/upfitCategories.ts — the existing,
 * fixed 12-category taxonomy, not a new one), then a final review step.
 */
export type UpfitBuilderStepId = UpfitBuilderStageId | UpfitCategoryId | 'review';

export type UpfitBuilderStepStatus = 'complete' | 'missing' | 'skipped';

export type UpfitBuilderCategoryTier = 'required' | 'recommended' | 'optional';

/**
 * Per-build guided-flow state — the only new persistence this feature adds.
 * Everything else (active project/build, vehicle, standard, build style,
 * category selections) already persists via the existing Fleet Projects/
 * Fleet Builds/Department Standards contexts.
 */
export interface UpfitBuilderProgress {
  /** The step this build's guided flow last stopped on. Absent = not started. */
  currentStepId?: UpfitBuilderStepId;
  /**
   * Steps explicitly skipped rather than completed — either the optional
   * 'standard' setup stage ("Continue without a Department Standard") or an
   * optional-tier upfit category. Required/recommended steps are never
   * skippable — see docs/architecture/GUIDED_UPFIT_BUILDER.md.
   */
  skippedStepIds: UpfitBuilderStepId[];
}

export interface GuidedUpfitCategoryStep {
  categoryId: UpfitCategoryId;
  label: string;
  tier: UpfitBuilderCategoryTier;
  status: UpfitBuilderStepStatus;
  selectedProducts: Array<{ productId: string; label: string }>;
  missingCopy: string;
  canSkip: boolean;
}

/**
 * The generated checklist for one build — Feature "Upfit Steps" — derived
 * from the build's effective Department Standard (Fleet Completion Engine,
 * FLEET_INTELLIGENCE.md) when assigned, or its Build Style's priority
 * categories as guidance otherwise. Never a hard dependency gate.
 */
export interface GuidedUpfitChecklist {
  steps: GuidedUpfitCategoryStep[];
  requiredTotal: number;
  requiredComplete: number;
  recommendedTotal: number;
  recommendedComplete: number;
  optionalTotal: number;
  optionalComplete: number;
  /** The effective Department Standard's completionPercent when assigned, else the build-style completion percent. */
  overallPercent: number;
  missingRequired: UpfitCategoryId[];
  missingRecommended: UpfitCategoryId[];
  skippedOptional: UpfitCategoryId[];
  /** Null when no Department Standard is assigned — compliance is only meaningful against one. */
  departmentCompliant: boolean | null;
}
