import type { ProcurementPackage, ProcurementPackagesSummary } from '@/types/procurementPackages';

/**
 * Package Count / Ready / Minor Issues / Needs Review / Blocked rollup —
 * powers both the Workspace "Procurement Packages" card and the
 * /procurement page's own summary header, so neither counts packages by
 * readiness level independently.
 */
export function summarizeProcurementPackages(packages: ProcurementPackage[]): ProcurementPackagesSummary {
  return {
    packageCount: packages.length,
    readyCount: packages.filter((pkg) => pkg.readiness.level === 'ready').length,
    minorIssuesCount: packages.filter((pkg) => pkg.readiness.level === 'minor_issues').length,
    needsReviewCount: packages.filter((pkg) => pkg.readiness.level === 'needs_review').length,
    blockedCount: packages.filter((pkg) => pkg.readiness.level === 'blocked').length,
  };
}
