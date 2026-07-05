/**
 * pages/ProjectQuotePage.jsx — Fleet Quote Builder at /project-quote.
 *
 * The customer-facing workflow that turns an entire Fleet Project into a
 * professional quote package. This is composition on top of the existing
 * Fleet Projects/Fleet Builds/Fleet Templates/Department Standards/Fleet
 * Completion Engine/Guided Upfit Builder/Vehicle Build Recommendations
 * Engine foundations — no new quote system, no pricing, no checkout, no PDF
 * generation, no backend. Every value is recomputed from
 * FleetBuildsContext/FleetProjectContext/DepartmentStandardsContext state on
 * every render via src/domain/fleetQuote, mirroring how WorkspaceDashboard/
 * GuidedUpfitBuilderPage already compose their own read-only rollups.
 *
 * Split into a pure `ProjectQuotePageView` (fixture-testable) and a connected
 * default export, matching WorkspaceDashboardView/GuidedUpfitBuilderPageView's
 * convention.
 */
import React, { useState } from 'react';
import { Boxes } from 'lucide-react';
import { PageLayout, PageHeader, CTAButton, EmptyState } from '@/components/design-system';
import { useFleetProject } from '@/context/FleetProjectContext';
import { useFleetBuilds } from '@/context/FleetBuildsContext';
import { useFleetTemplates } from '@/context/FleetTemplatesContext';
import { useDepartmentStandards } from '@/context/DepartmentStandardsContext';
import { catalogService } from '@/services/catalog';
import { summarizeFleetProject } from '@/domain/fleetProjects';
import { getUpfitBuilderStepLabel } from '@/domain/upfitBuilder';
import {
  aggregateProjectQuote,
  aggregateVehicleQuote,
  buildExportPreview,
  buildFleetQuoteEntries,
  buildMissingEquipmentReport,
  buildVehicleQuoteSections,
  calculateProjectTotals,
  groupQuoteItems,
} from '@/domain/fleetQuote';
import { toast } from '@/components/ui/use-toast';
import ProjectQuoteSummaryCard from '@/components/fleetQuote/ProjectQuoteSummaryCard';
import VehicleSummarySection from '@/components/fleetQuote/VehicleSummarySection';
import QuoteItemsSection from '@/components/fleetQuote/QuoteItemsSection';
import ProjectTotalsSection from '@/components/fleetQuote/ProjectTotalsSection';
import MissingEquipmentReportSection from '@/components/fleetQuote/MissingEquipmentReportSection';
import ExportPreviewSection from '@/components/fleetQuote/ExportPreviewSection';

export function ProjectQuotePageView({
  hasActiveProject,
  projectSummary,
  vehicles = [],
  sections = [],
  groupedItems = [],
  totals,
  missingReport,
  exportPreview,
  quoteNotes = '',
  onChangeQuoteNotes,
  onAddRecommendedProduct,
}) {
  return (
    <PageLayout crumbs={[{ label: 'Home', to: '/' }, { label: 'My Workspace', to: '/workspace' }, { label: 'Project Quote' }]}>
      <PageHeader
        title="Project Quote"
        description="Turn this Fleet Project into a professional quote package — vehicle-by-vehicle equipment, missing items, and an export preview."
        actions={hasActiveProject && (
          <CTAButton
            variant="secondary"
            to="/procurement"
            data-testid="generate-procurement-package-link"
            icon={Boxes}
            iconPosition="leading"
          >
            Generate Procurement Package
          </CTAButton>
        )}
      />

      {!hasActiveProject ? (
        <EmptyState
          data-testid="project-quote-no-project"
          icon={Boxes}
          title="No active Fleet Project"
          description="No active Fleet Project. Create or select one from Workspace to generate a project quote."
          primaryAction={{ label: 'Go to Workspace', to: '/workspace' }}
        />
      ) : (
        <>
          <ProjectQuoteSummaryCard summary={projectSummary} />
          <VehicleSummarySection vehicles={vehicles} onAddRecommendedProduct={onAddRecommendedProduct} />
          <QuoteItemsSection sections={sections} groupedItems={groupedItems} />
          <ProjectTotalsSection totals={totals} />
          <MissingEquipmentReportSection report={missingReport} />
          <ExportPreviewSection preview={exportPreview} quoteNotes={quoteNotes} onChangeQuoteNotes={onChangeQuoteNotes} />
        </>
      )}
    </PageLayout>
  );
}

export default function ProjectQuotePage() {
  const { activeProject, activeProjectId } = useFleetProject();
  const { builds, allBuilds, addProductToBuild } = useFleetBuilds();
  const { allTemplates } = useFleetTemplates();
  const { companyStandards } = useDepartmentStandards();
  const [quoteNotes, setQuoteNotes] = useState('');

  const entries = buildFleetQuoteEntries(builds, activeProject, companyStandards);
  const projectSummaryRollup = activeProject ? summarizeFleetProject(activeProject, allBuilds, allTemplates) : null;
  const projectSummary = aggregateProjectQuote(activeProject, entries, projectSummaryRollup?.lastModified ?? null);

  const deps = { products: catalogService.listProducts(), getProduct: catalogService.getProduct };
  const vehicles = entries.map((entry) => aggregateVehicleQuote(entry, deps));
  const sections = buildVehicleQuoteSections(entries);
  const groupedItems = groupQuoteItems(entries);
  const totals = calculateProjectTotals(entries, groupedItems);
  const missingReport = buildMissingEquipmentReport(entries);
  const exportPreview = buildExportPreview({
    departmentLabel: projectSummary.departmentLabel,
    projectName: projectSummary.projectName,
    vehicleSummaries: vehicles,
    equipmentSummary: groupedItems,
    missingEquipment: missingReport,
    quoteNotes,
    generatedAt: Date.now(),
  });

  function handleAddRecommendedProduct(buildId, product, recommendation) {
    if (!recommendation.matchingCategoryId) return;
    addProductToBuild(buildId, recommendation.matchingCategoryId, product);
    toast({
      title: 'Added to build',
      description: `${product.title ?? product.label ?? 'Product'} added to ${getUpfitBuilderStepLabel(recommendation.matchingCategoryId)}.`,
    });
  }

  return (
    <ProjectQuotePageView
      hasActiveProject={Boolean(activeProjectId)}
      projectSummary={projectSummary}
      vehicles={vehicles}
      sections={sections}
      groupedItems={groupedItems}
      totals={totals}
      missingReport={missingReport}
      exportPreview={exportPreview}
      quoteNotes={quoteNotes}
      onChangeQuoteNotes={setQuoteNotes}
      onAddRecommendedProduct={handleAddRecommendedProduct}
    />
  );
}
