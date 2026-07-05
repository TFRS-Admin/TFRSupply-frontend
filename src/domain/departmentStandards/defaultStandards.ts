import type { DepartmentStandard, DepartmentStandardKey } from '@/types/departmentStandards';

/**
 * The 12 shipped Department Standards. Each maps its required/recommended/
 * optional equipment onto the existing 12 UpfitCategoryId values (see
 * src/domain/fleetBuilds/upfitCategories.ts) rather than a new taxonomy — no
 * hardcoded products, per docs/architecture/FLEET_INTELLIGENCE.md. Some named
 * equipment concepts from real-world department packages (Cargo Light, Gun
 * Lock, ALPR, Camera Systems) have no dedicated upfit category yet and are
 * grouped under the closest existing category (usually 'accessories') — see
 * that doc's Known Limitations.
 *
 * These are read-only (`isCustom: false`); `id` equals `key`, `createdAt`/
 * `updatedAt` are 0 as a sentinel meaning "shipped default, not user-created."
 * Users clone one into an editable company standard via
 * src/domain/departmentStandards/standardRules.ts's cloneDepartmentStandard.
 */
function standard(
  key: DepartmentStandardKey,
  name: string,
  description: string,
  required: DepartmentStandard['categories']['required'],
  recommended: DepartmentStandard['categories']['recommended'],
  optional: DepartmentStandard['categories']['optional'],
): DepartmentStandard {
  return {
    id: key,
    key,
    name,
    description,
    categories: { required, recommended, optional },
    isCustom: false,
    basedOnId: null,
    createdAt: 0,
    updatedAt: 0,
  };
}

export const DEFAULT_DEPARTMENT_STANDARDS: DepartmentStandard[] = [
  standard(
    'patrol',
    'Patrol',
    'Standard marked patrol package for routine response and traffic stops.',
    ['roof_lighting', 'siren', 'speaker', 'console', 'push_bumper', 'rear_warning'],
    ['perimeter_lighting', 'accessories', 'partition'],
    ['scene_lighting', 'graphics_markings'],
  ),
  standard(
    'slicktop',
    'Slicktop',
    'Low-profile, roof-bar-free patrol package relying on perimeter and interior warning lighting.',
    ['perimeter_lighting', 'siren', 'speaker', 'console', 'rear_warning'],
    ['interior_lighting', 'partition', 'accessories'],
    ['scene_lighting', 'graphics_markings'],
  ),
  standard(
    'supervisor',
    'Supervisor',
    'Discreet command package emphasizing interior/perimeter lighting over a full roof warning package.',
    ['interior_lighting', 'perimeter_lighting', 'siren', 'console'],
    ['speaker', 'accessories', 'graphics_markings'],
    ['scene_lighting', 'rear_warning'],
  ),
  standard(
    'traffic_enforcement',
    'Traffic Enforcement',
    'Rear warning and traffic-control accessories for stops and lane control.',
    ['rear_warning', 'roof_lighting', 'siren', 'accessories'],
    ['perimeter_lighting', 'graphics_markings', 'speaker'],
    ['scene_lighting', 'console'],
  ),
  standard(
    'pursuit',
    'Pursuit',
    'Full warning lighting, siren, push bumper, and console for high-speed response.',
    ['roof_lighting', 'siren', 'push_bumper', 'console', 'speaker'],
    ['rear_warning', 'partition', 'perimeter_lighting'],
    ['scene_lighting', 'accessories'],
  ),
  standard(
    'k9',
    'K9',
    'Partitioned transport package with climate/kennel safety accessories for a K9 unit.',
    ['partition', 'interior_lighting', 'console', 'rear_warning'],
    ['perimeter_lighting', 'accessories', 'siren'],
    ['scene_lighting', 'graphics_markings'],
  ),
  standard(
    'swat',
    'SWAT',
    'Tactical response package with scene lighting and a full push bumper/console setup.',
    ['roof_lighting', 'siren', 'push_bumper', 'console', 'scene_lighting'],
    ['perimeter_lighting', 'partition', 'accessories'],
    ['rear_warning', 'graphics_markings'],
  ),
  standard(
    'fire_command',
    'Fire Command',
    'Command/interior lighting, siren, and scene lighting for incident command vehicles.',
    ['interior_lighting', 'siren', 'scene_lighting', 'console'],
    ['roof_lighting', 'speaker', 'accessories'],
    ['graphics_markings', 'rear_warning'],
  ),
  standard(
    'ems_supervisor',
    'EMS Supervisor',
    'Interior and perimeter warning lighting with scene lighting for on-scene EMS command.',
    ['interior_lighting', 'perimeter_lighting', 'console', 'siren'],
    ['scene_lighting', 'accessories', 'speaker'],
    ['graphics_markings', 'rear_warning'],
  ),
  standard(
    'dot_truck',
    'DOT Truck',
    'Roof warning, rear warning, and required DOT graphics/markings for a department transport truck.',
    ['roof_lighting', 'rear_warning', 'graphics_markings', 'accessories'],
    ['scene_lighting', 'perimeter_lighting'],
    ['interior_lighting', 'console'],
  ),
  standard(
    'utility',
    'Utility',
    'Roof warning and scene lighting for a general-purpose utility vehicle.',
    ['roof_lighting', 'scene_lighting', 'accessories'],
    ['rear_warning', 'perimeter_lighting', 'graphics_markings'],
    ['interior_lighting', 'console'],
  ),
  standard(
    'construction',
    'Construction',
    'Roof warning, scene lighting, and jobsite graphics/markings for a construction/work zone vehicle.',
    ['roof_lighting', 'scene_lighting', 'graphics_markings', 'accessories'],
    ['rear_warning', 'perimeter_lighting'],
    ['interior_lighting', 'siren'],
  ),
];

const DEFAULT_STANDARD_BY_ID: Record<string, DepartmentStandard> = DEFAULT_DEPARTMENT_STANDARDS.reduce(
  (byId, def) => ({ ...byId, [def.id]: def }),
  {} as Record<string, DepartmentStandard>,
);

export function getDefaultStandardById(id: string | null | undefined): DepartmentStandard | null {
  if (!id) return null;
  return DEFAULT_STANDARD_BY_ID[id] ?? null;
}
