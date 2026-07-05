/**
 * pages/ProcurementPage.jsx — Fleet Procurement Packages at /procurement.
 *
 * The customer's purchasing workspace: turns an entire Fleet Project into
 * named, procurement-ready packages (e.g. "Patrol," "SWAT," "K9," "Unassigned
 * Vehicles") grouped by each Fleet Build's effective Department Standard.
 * This is composition on top of the existing Fleet Projects/Fleet Builds/
 * Department Standards/Fleet Completion Engine/Guided Upfit Builder/Vehicle
 * Build Recommendations Engine/Fleet Quote Builder foundations — not
 * ordering, not a new quote system, no pricing, no checkout, no PDF
 * generation, no backend. Every value is recomputed from
 * FleetBuildsContext/FleetProjectContext/DepartmentStandardsContext state on
 * every render via src/domain/procurementPackages, mirroring how
 * ProjectQuotePage composes src/domain/fleetQuote.
 *
 * Split into a pure `ProcurementPageView` (fixture-testable) and a connected
 * default export, matching ProjectQuotePageView/WorkspaceDashboardView's
 * convention.
 */
import React, { useState } from 'react';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import PrototypeFooter from '@/components/PrototypeFooter';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import { useFleetProject } from '@/context/FleetProjectContext';
import { useFleetBuilds } from '@/context/FleetBuildsContext';
import { useDepartmentStandards } from '@/context/DepartmentStandardsContext';
import { catalogService } from '@/services/catalog';
import { aggregateVehicleQuote, buildFleetQuoteEntries, groupQuoteItems } from '@/domain/fleetQuote';
import { getUpfitBuilderStepLabel } from '@/domain/upfitBuilder';
import {
  MAX_COMPARISON_PACKAGES,
  aggregatePackageSummary,
  buildPackageContents,
  buildProcurementExportPreview,
  groupFleetQuoteEntriesIntoPackages,
  selectPackagesForComparison,
  summarizeProcurementPackages,
} from '@/domain/procurementPackages';
import { toast } from '@/components/ui/use-toast';
import ProcurementPackagesSummaryBar from '@/components/procurementPackages/ProcurementPackagesSummaryBar';
import PackageSummaryCard from '@/components/procurementPackages/PackageSummaryCard';
import PackageComparisonSection from '@/components/procurementPackages/PackageComparisonSection';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export function ProcurementPageView({
  hasActiveProject,
  packages = [],
  contentsByPackageId = {},
  summary,
  expandedPackageId,
  onToggleExpand,
  selectedIds = [],
  onToggleSelected,
  comparisonPackages = [],
  exportPreviews = {},
  notesByPackageId = {},
  onChangeNotes,
  onAddRecommendedProduct,
}) {
  return (
    <div className="min-h-screen" style={{ ...FS, background: '#f4f5f7' }}>
      <PrototypeBanner />
      <SiteHeader />
      <ProductBreadcrumb crumbs={[{ label: 'Home', to: '/' }, { label: 'My Workspace', to: '/workspace' }, { label: 'Procurement Packages' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 900, color: '#1a2744', marginBottom: 6 }}>Procurement Packages</h1>
          <p style={{ fontSize: 14, color: '#666', maxWidth: 680, lineHeight: 1.6 }}>
            Your purchasing workspace — this Fleet Project&apos;s vehicles grouped into procurement-ready packages by department. This is not ordering: no checkout, no pricing, no PDF is generated here.
          </p>
        </div>

        {!hasActiveProject ? (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '24px 20px' }} data-testid="procurement-no-project">
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>
              No active Fleet Project. Create or select one from Workspace to build its procurement packages.
            </p>
          </div>
        ) : (
          <>
            <ProcurementPackagesSummaryBar summary={summary} />

            {packages.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '24px 20px', marginBottom: 32 }} data-testid="procurement-no-packages">
                <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>
                  No fleet builds in this project yet. Add a vehicle from Fleet Builds to generate procurement packages.
                </p>
              </div>
            ) : (
              <section style={{ marginBottom: 32 }} data-testid="package-list-section">
                <div className="package-list-grid grid grid-cols-1 gap-4">
                  {packages.map((pkg) => (
                    <PackageSummaryCard
                      key={pkg.id}
                      pkg={pkg}
                      contents={contentsByPackageId[pkg.id]}
                      expanded={expandedPackageId === pkg.id}
                      onToggleExpand={() => onToggleExpand(pkg.id)}
                      selected={selectedIds.includes(pkg.id)}
                      selectionDisabled={!selectedIds.includes(pkg.id) && selectedIds.length >= MAX_COMPARISON_PACKAGES}
                      onToggleSelected={() => onToggleSelected(pkg.id)}
                      exportPreview={exportPreviews[pkg.id]}
                      notes={notesByPackageId[pkg.id] ?? ''}
                      onChangeNotes={(value) => onChangeNotes(pkg.id, value)}
                      onAddRecommendedProduct={onAddRecommendedProduct}
                    />
                  ))}
                </div>
              </section>
            )}

            <PackageComparisonSection packages={comparisonPackages} maxComparisonPackages={MAX_COMPARISON_PACKAGES} />
          </>
        )}
      </div>

      <PrototypeFooter />
    </div>
  );
}

export default function ProcurementPage() {
  const { activeProject, activeProjectId } = useFleetProject();
  const { builds, addProductToBuild } = useFleetBuilds();
  const { companyStandards } = useDepartmentStandards();
  const [expandedPackageId, setExpandedPackageId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [notesByPackageId, setNotesByPackageId] = useState({});

  const entries = buildFleetQuoteEntries(builds, activeProject, companyStandards);
  const groups = groupFleetQuoteEntriesIntoPackages(entries);
  const deps = { products: catalogService.listProducts(), getProduct: catalogService.getProduct };

  const packages = groups.map((group) => aggregatePackageSummary(group, deps));
  const contentsByPackageId = Object.fromEntries(groups.map((group) => [group.id, buildPackageContents(group)]));
  const summary = summarizeProcurementPackages(packages);
  const comparisonPackages = selectPackagesForComparison(packages, selectedIds);

  const exportPreviews = Object.fromEntries(groups.map((group) => {
    const pkg = packages.find((candidate) => candidate.id === group.id);
    return [group.id, buildProcurementExportPreview({
      departmentLabel: pkg.departmentLabel,
      packageName: pkg.name,
      vehicleSummaries: group.entries.map((entry) => aggregateVehicleQuote(entry, deps)),
      equipment: groupQuoteItems(group.entries),
      missingEquipment: pkg.missingEquipment,
      procurementNotes: notesByPackageId[group.id] ?? '',
      generatedAt: Date.now(),
    })];
  }));

  function handleToggleSelected(packageId) {
    setSelectedIds((current) => {
      if (current.includes(packageId)) return current.filter((id) => id !== packageId);
      if (current.length >= MAX_COMPARISON_PACKAGES) return current;
      return [...current, packageId];
    });
  }

  function handleAddRecommendedProduct(pkg, product, recommendation) {
    const buildId = pkg.buildIds[0];
    if (!buildId || !recommendation.matchingCategoryId) return;
    addProductToBuild(buildId, recommendation.matchingCategoryId, product);
    toast({
      title: 'Added to package',
      description: `${product.title ?? product.label ?? 'Product'} added to ${getUpfitBuilderStepLabel(recommendation.matchingCategoryId)} on "${pkg.name}".`,
    });
  }

  return (
    <ProcurementPageView
      hasActiveProject={Boolean(activeProjectId)}
      packages={packages}
      contentsByPackageId={contentsByPackageId}
      summary={summary}
      expandedPackageId={expandedPackageId}
      onToggleExpand={(packageId) => setExpandedPackageId((current) => (current === packageId ? null : packageId))}
      selectedIds={selectedIds}
      onToggleSelected={handleToggleSelected}
      comparisonPackages={comparisonPackages}
      exportPreviews={exportPreviews}
      notesByPackageId={notesByPackageId}
      onChangeNotes={(packageId, value) => setNotesByPackageId((current) => ({ ...current, [packageId]: value }))}
      onAddRecommendedProduct={handleAddRecommendedProduct}
    />
  );
}
