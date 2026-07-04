import type { FleetBuildStyleDefinition, FleetBuildStyleId } from '@/types/fleetBuilds';

/**
 * The 7 supported build styles and the upfit categories each one prioritizes.
 * `priorityCategories` is guidance used for completion/missing-category
 * suggestions — never a hard dependency gate that blocks adding any product
 * to any build (see docs/architecture/FLEET_VEHICLE_SHOPPING_MODES.md).
 */
export const BUILD_STYLES: FleetBuildStyleDefinition[] = [
  {
    id: 'patrol',
    label: 'Patrol',
    guidance: 'Standard marked patrol package — roof lighting, siren, speaker, and console.',
    priorityCategories: ['roof_lighting', 'siren', 'speaker', 'console'],
  },
  {
    id: 'slicktop',
    label: 'Slicktop',
    guidance: 'Low-profile, roof-bar-free build — perimeter and interior lighting, siren, speaker, and console.',
    priorityCategories: ['perimeter_lighting', 'interior_lighting', 'siren', 'speaker', 'console'],
  },
  {
    id: 'supervisor',
    label: 'Supervisor',
    guidance: 'Discreet interior/perimeter lighting and command accessories over a full roof warning package.',
    priorityCategories: ['interior_lighting', 'perimeter_lighting', 'accessories'],
  },
  {
    id: 'traffic_enforcement',
    label: 'Traffic Enforcement',
    guidance: 'Rear warning, roof lighting, and traffic-control accessories for stops and lane control.',
    priorityCategories: ['rear_warning', 'roof_lighting', 'accessories'],
  },
  {
    id: 'pursuit',
    label: 'Pursuit',
    guidance: 'Full warning lighting, siren, push bumper, and console for high-speed response.',
    priorityCategories: ['roof_lighting', 'siren', 'push_bumper', 'console'],
  },
  {
    id: 'fire_command',
    label: 'Fire Command',
    guidance: 'Command/interior lighting, siren, and scene lighting for incident command vehicles.',
    priorityCategories: ['interior_lighting', 'siren', 'scene_lighting'],
  },
  {
    id: 'work_truck',
    label: 'Work Truck',
    guidance: 'Amber roof warning, scene lighting, and job-site accessories.',
    priorityCategories: ['roof_lighting', 'scene_lighting', 'accessories'],
  },
];

export const ALL_BUILD_STYLE_IDS: FleetBuildStyleId[] = BUILD_STYLES.map((style) => style.id);

const BUILD_STYLE_BY_ID: Record<FleetBuildStyleId, FleetBuildStyleDefinition> = BUILD_STYLES.reduce(
  (styles, style) => ({ ...styles, [style.id]: style }),
  {} as Record<FleetBuildStyleId, FleetBuildStyleDefinition>,
);

export function getBuildStyleDefinition(styleId: FleetBuildStyleId | null | undefined): FleetBuildStyleDefinition | null {
  if (!styleId) return null;
  return BUILD_STYLE_BY_ID[styleId] ?? null;
}

export function getBuildStyleLabel(styleId: FleetBuildStyleId | null | undefined): string {
  return getBuildStyleDefinition(styleId)?.label ?? 'No Style Selected';
}
