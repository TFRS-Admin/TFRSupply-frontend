/**
 * Fleet Projects — client-side, localStorage-only domain contracts. A "fleet
 * project" is the top-level planning object that groups multiple Fleet
 * Builds and Fleet Templates into a single customer program (e.g. "2026
 * Patrol Vehicle Replacement"). No backend, authentication, or Shopify data
 * is involved — see src/domain/fleetBuilds for the builds/templates a
 * project groups.
 */

export interface FleetProject {
  id: string;
  name: string;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
}

export type FleetProjectCompletionColor = 'red' | 'yellow' | 'green';

/** One build style in use within a project, with how many builds use it. */
export interface FleetProjectBuildStyleUsage {
  styleId: string;
  label: string;
  count: number;
}

/**
 * A read-only snapshot of one project's fleet builds/templates, derived from
 * FleetBuildsContext/FleetTemplatesContext data — never stored on its own.
 * No pricing: estimatedProductCount counts selected line items, not dollars.
 */
export interface FleetProjectSummary {
  projectId: string;
  buildCount: number;
  vehicleCount: number;
  templateCount: number;
  averageCompletionPercent: number;
  completionColor: FleetProjectCompletionColor;
  completedBuildCount: number;
  incompleteBuildCount: number;
  estimatedProductCount: number;
  templateUsageCount: number;
  buildStyles: FleetProjectBuildStyleUsage[];
  /** Most recent of the project's own updatedAt and its builds'/templates' timestamps, or null if nothing to go on. */
  lastModified: number | null;
}
