import type { FleetBuild } from '@/types/fleetBuilds';
import type { DuplicateConfigurationGroup } from '@/types/procurementPackages';
import { formatVehicleLabel } from '@/domain/fleetQuote';

/** Same vehicle spec + build style — the two things that make two Fleet Builds look like accidental duplicates of the same purchasing decision, rather than two intentionally different vehicle types in one package. */
function buildSignature(build: FleetBuild): string | null {
  if (!build.vehicle) return null;
  return `${build.vehicle.year}|${build.vehicle.make}|${build.vehicle.model}|${build.buildStyle ?? 'none'}`;
}

/**
 * Flags Fleet Builds within one package that share the same vehicle
 * (year/make/model) and build style — likely accidental duplicate entries a
 * customer should review before procuring, rather than two genuinely
 * different vehicle types. Never merges or removes anything; this is a
 * read-only signal surfaced on Package Readiness. Builds without a vehicle
 * assigned yet are excluded — "no vehicle selected" is already reported
 * separately and isn't a meaningful duplicate signature.
 */
export function detectDuplicateConfigurations(builds: FleetBuild[]): DuplicateConfigurationGroup[] {
  const bySignature = new Map<string, FleetBuild[]>();

  builds.forEach((build) => {
    const signature = buildSignature(build);
    if (!signature) return;
    const existing = bySignature.get(signature);
    if (existing) {
      existing.push(build);
      return;
    }
    bySignature.set(signature, [build]);
  });

  return Array.from(bySignature.entries())
    .filter(([, group]) => group.length > 1)
    .map(([signature, group]) => ({
      signature,
      vehicleLabel: formatVehicleLabel(group[0].vehicle),
      buildIds: group.map((build) => build.id),
      buildNames: group.map((build) => build.name),
    }));
}
