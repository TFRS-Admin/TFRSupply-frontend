import type { Product } from '@/types/product';
import type { FleetBuild } from '@/types/fleetBuilds';
import type { DepartmentStandard } from '@/types/departmentStandards';
import type { ProductRecommendation } from '@/types/recommendations';
import type { UpfitCategoryId } from '@/types/fleetBuilds';
import { evaluateFleetBuildIntelligence } from '@/domain/departmentStandards/completionEngine';
import { generateRecommendations } from './generateRecommendations';
import { resolveRelatedProductIdsForBuild, type RelatedProductIdsDeps } from './buildContext';

export interface RecommendedNextAction {
  buildId: string;
  buildName: string;
  projectId?: string;
  missingRequiredCategories: UpfitCategoryId[];
  recommendations: ProductRecommendation[];
}

export interface FleetBuildStandardEntry {
  build: FleetBuild;
  standard: DepartmentStandard | null;
}

export interface SummarizeRecommendedNextActionsOptions {
  /** Max recommended products per build. Defaults to 3. */
  limitPerBuild?: number;
  /** Max builds surfaced, most-urgent (most missing required categories) first. Defaults to 5. */
  limitBuilds?: number;
}

/**
 * Workspace's "Recommended Next Actions" summary — for each build with
 * outstanding equipment, its missing required categories (Fleet Completion
 * Engine, only meaningful once a Department Standard is assigned — see
 * evaluateFleetBuildIntelligence) plus its top scored product
 * recommendations (generateRecommendations). A build is omitted once it has
 * no required gap AND nothing worth recommending, so the workspace never
 * lists every build in the account just because a style-optional category
 * happens to be empty; the rest are sorted most-urgent-first and capped.
 */
export function summarizeRecommendedNextActions(
  entries: FleetBuildStandardEntry[],
  products: Product[],
  deps: RelatedProductIdsDeps,
  options: SummarizeRecommendedNextActionsOptions = {},
): RecommendedNextAction[] {
  const { limitPerBuild = 3, limitBuilds = 5 } = options;

  const actions = entries
    .map(({ build, standard }): RecommendedNextAction | null => {
      const intelligence = standard ? evaluateFleetBuildIntelligence(build, standard) : null;
      const missingRequiredCategories = intelligence ? intelligence.missingRequired : [];

      const context = { build, standard, relatedProductIds: resolveRelatedProductIdsForBuild(build, deps) };
      const recommendations = generateRecommendations(products, context, { limit: limitPerBuild });

      const hasNothingOutstanding = missingRequiredCategories.length === 0 && recommendations.length === 0;
      if (hasNothingOutstanding) return null;

      return {
        buildId: build.id,
        buildName: build.name,
        projectId: build.projectId,
        missingRequiredCategories,
        recommendations,
      };
    })
    .filter((entry): entry is RecommendedNextAction => Boolean(entry))
    .sort((a, b) => b.missingRequiredCategories.length - a.missingRequiredCategories.length);

  return actions.slice(0, limitBuilds);
}
