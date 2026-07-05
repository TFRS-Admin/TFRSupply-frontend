import type { FleetBuild, FleetBuildVehicle } from '@/types/fleetBuilds';
import { getBuildStyleLabel } from '@/domain/fleetBuilds';

/** Plain "{year} {make} {model}" label, or a fallback when no vehicle is assigned yet. */
export function formatVehicleLabel(vehicle: FleetBuildVehicle | null): string {
  if (!vehicle) return 'No Vehicle Selected';
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim();
}

/** "{Model} {Build Style} x{quantity}" — e.g. "Explorer Patrol x18," matching the Quote Items section heading example. */
export function formatVehicleSectionLabel(build: FleetBuild): string {
  const modelLabel = build.vehicle?.model || build.name;
  const styleLabel = build.buildStyle ? ` ${getBuildStyleLabel(build.buildStyle)}` : '';
  return `${modelLabel}${styleLabel} x${build.quantity}`;
}
