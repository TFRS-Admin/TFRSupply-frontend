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
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import PrototypeFooter from '@/components/PrototypeFooter';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
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

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

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
    <div className="min-h-screen" style={{ ...FS, background: '#f4f5f7' }}>
      <PrototypeBanner />
      <SiteHeader />
      <ProductBreadcrumb crumbs={[{ label: 'Home', to: '/' }, { label: 'My Workspace', to: '/workspace' }, { label: 'Project Quote' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 900, color: '#1a2744', marginBottom: 6 }}>Project Quote</h1>
          <p style={{ fontSize: 14, color: '#666', maxWidth: 640, lineHeight: 1.6 }}>
            Turn this Fleet Project into a professional quote package — vehicle-by-vehicle equipment, missing items, and an export preview.
          </p>
        </div>

        {!hasActiveProject ? (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '24px 20px' }} data-testid="project-quote-no-project">
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>
              No active Fleet Project. Create or select one from Workspace to generate a project quote.
            </p>
          </div>
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
      </div>

      <PrototypeFooter />
    </div>
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
