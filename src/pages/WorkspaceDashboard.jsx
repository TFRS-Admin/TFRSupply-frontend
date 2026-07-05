/**
 * pages/WorkspaceDashboard.jsx — Project Workspace at /workspace.
 *
 * A client-side dashboard that lets a customer see everything they've
 * gathered while planning a vehicle build — saved products, recently
 * viewed items, the compare queue, cart summary, selected vehicle, and an
 * in-progress configuration — in one place. This is composition only: every
 * section reads from the existing SavedProducts/RecentlyViewed/Compare/
 * Vehicle/Configurator contexts, the Cart Workspace's useMiniCart(), and
 * catalogService.getProduct() — the same read paths SavedProductsPage,
 * ComparePage, and the homepage sections already use. No new persistence,
 * pricing, commerce, or configurator logic is introduced, and no
 * authentication or account system backs this page — it is not a CRM.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, GitCompare, ShoppingCart, Truck, Settings2, FileText, ArrowRight, X } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import VehicleSelectorModal from '@/components/navigator/VehicleSelectorModal';
import { PageLayout, PageHeader, PageSection, DataPanel, EmptyState, CTAButton } from '@/components/design-system';
import { useSavedProducts } from '@/context/SavedProductsContext';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import { useCompare, MAX_COMPARE_PRODUCTS } from '@/context/CompareContext';
import { useVehicle } from '@/context/VehicleContext';
import { useConfigurator } from '@/context/ConfiguratorContext';
import { useFleetBuilds } from '@/context/FleetBuildsContext';
import { useFleetTemplates } from '@/context/FleetTemplatesContext';
import { useFleetProject } from '@/context/FleetProjectContext';
import { useFleetProjectActions } from '@/hooks/useFleetProjectActions';
import { useDepartmentStandards } from '@/context/DepartmentStandardsContext';
import { useUpfitBuilder } from '@/context/UpfitBuilderContext';
import { useMiniCart } from '@/hooks/cartWorkspace';
import { catalogService } from '@/services/catalog';
import { resolveProductDetailPath } from '@/domain/catalog';
import { resolveSavedProducts } from '@/components/product/SavedProductsSection';
import { resolveRecentlyViewedProducts } from '@/components/product/RecentlyViewedProducts';
import FleetBuildsWorkspaceSection from '@/components/fleetBuilds/FleetBuildsWorkspaceSection';
import FleetTemplatesWorkspaceSection from '@/components/fleetBuilds/FleetTemplatesWorkspaceSection';
import FleetProjectsWorkspaceSection from '@/components/fleetProjects/FleetProjectsWorkspaceSection';
import WorkspaceFleetIntelligenceSection from '@/components/workspace/WorkspaceFleetIntelligenceSection';
import RecommendedNextActionsSection from '@/components/workspace/RecommendedNextActionsSection';
import DepartmentStandardsSection from '@/components/departmentStandards/DepartmentStandardsSection';
import GuidedUpfitBuilderWorkspaceSection from '@/components/upfitBuilder/GuidedUpfitBuilderWorkspaceSection';
import ProjectQuoteWorkspaceSection from '@/components/fleetQuote/ProjectQuoteWorkspaceSection';
import ProcurementPackagesWorkspaceSection from '@/components/procurementPackages/ProcurementPackagesWorkspaceSection';
import { summarizeFleetProject } from '@/domain/fleetProjects';
import { resolveEffectiveStandard } from '@/domain/departmentStandards';
import { buildGuidedUpfitChecklist, resolveDefaultStepId, getUpfitBuilderStepLabel } from '@/domain/upfitBuilder';
import { summarizeRecommendedNextActions, resolveRecommendationProducts } from '@/domain/recommendations';
import { aggregateProjectQuote, buildFleetQuoteEntries, calculateProjectTotals, groupQuoteItems } from '@/domain/fleetQuote';
import { aggregatePackageSummary, groupFleetQuoteEntriesIntoPackages, summarizeProcurementPackages } from '@/domain/procurementPackages';
import { toast } from '@/components/ui/use-toast';
import appConfig from '@/config/appConfig';

function toCardProps(product) {
  return {
    id: product.id,
    href: resolveProductDetailPath(product),
    label: product.title ?? product.label,
    image: product.media?.hero || product.images?.[0]?.src,
    tagline: product.subtitle,
    badges: product.marketing?.features?.slice(0, 2) ?? [],
    product,
  };
}

function formatMoney(money) {
  if (!money || typeof money.amount !== 'number') return '—';
  return money.amount.toLocaleString(undefined, { style: 'currency', currency: money.currencyCode || 'USD' });
}

/**
 * Resolves the compare queue's product ids to catalog products, dropping any
 * id that no longer resolves — the same silent-drop behavior CompareTray and
 * ComparePage already use. Exported so it is unit-testable without a
 * localStorage-backed context.
 */
export function resolveCompareQueueProducts(productIds, { getProduct = catalogService.getProduct } = {}) {
  return productIds.map((id) => getProduct(id)).filter(Boolean);
}

function EmptyNote({ children }) {
  return <p className="text-[13px] text-gray-500 leading-relaxed m-0">{children}</p>;
}

function TextLink({ to, children }) {
  return (
    <Link to={to} className="text-xs font-bold text-brand no-underline whitespace-nowrap hover:text-brand-hover min-h-[44px] inline-flex items-center">
      {children}
    </Link>
  );
}

function TextButton({ onClick, children, ariaLabel }) {
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel}
      className="text-xs font-bold text-gray-500 bg-transparent border-0 cursor-pointer whitespace-nowrap min-h-[44px] hover:text-gray-700">
      {children}
    </button>
  );
}

export function WorkspaceDashboardView({
  savedProducts,
  recentlyViewedProducts,
  compareProducts,
  fleetBuilds = [],
  fleetTemplates = [],
  fleetProjects,
  fleetIntelligenceEntries = [],
  recommendedNextActions = [],
  departmentStandards,
  guidedUpfitBuilder = {},
  projectQuote = {},
  procurementPackages = {},
  cartSummary,
  cartLoading,
  selectedVehicle,
  configuratorState,
  onClearSaved,
  onClearRecentlyViewed,
  onRemoveFromCompare,
  onClearCompare,
  onOpenVehicleModal,
  onOpenFleetBuilds,
  onAddRecommendedProductToBuild,
}) {
  const cartHasItems = (cartSummary?.itemCount ?? 0) > 0;
  const hasInProgressConfiguration = Boolean(configuratorState?.selectedFamily);
  const accessoryCount = configuratorState?.accessories?.length ?? 0;

  return (
    <PageLayout crumbs={[{ label: 'Home', to: '/' }, { label: 'My Workspace' }]}>
      <PageHeader
        title="My Workspace"
        description="Everything you've saved, compared, and configured while planning your build — all in one place."
      />

      <div className="workspace-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">

        {/* Selected Vehicle */}
        <DataPanel icon={Truck} title="Selected Vehicle" padding="compact">
          {selectedVehicle ? (
            <>
              <p className="text-[15px] font-bold text-gray-900 mb-3">
                {`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}${selectedVehicle.trim ? ` ${selectedVehicle.trim}` : ''}`}
              </p>
              <CTAButton variant="outline" onClick={onOpenVehicleModal}>Change Vehicle</CTAButton>
            </>
          ) : (
            <>
              <EmptyNote>No vehicle selected yet. Choose your vehicle to see compatible products and fitment.</EmptyNote>
              <div className="mt-3"><CTAButton variant="primary" onClick={onOpenVehicleModal}>Select Your Vehicle</CTAButton></div>
            </>
          )}
        </DataPanel>

        {/* Cart Summary */}
        <DataPanel icon={ShoppingCart} title="Cart Summary" padding="compact" actions={cartHasItems && <TextLink to="/cart">View Cart</TextLink>}>
          {cartLoading ? (
            <EmptyNote>Loading cart…</EmptyNote>
          ) : cartHasItems ? (
            <>
              <p className="text-[13px] text-gray-600 mb-1.5">
                {`${cartSummary.lineCount} line item${cartSummary.lineCount === 1 ? '' : 's'}, ${cartSummary.itemCount} unit${cartSummary.itemCount === 1 ? '' : 's'}`}
              </p>
              <p className="text-xl font-extrabold text-ink">{formatMoney(cartSummary.subtotal)}</p>
            </>
          ) : (
            <>
              <EmptyNote>Your cart is empty.</EmptyNote>
              <div className="mt-3"><TextLink to="/search">Browse Products</TextLink></div>
            </>
          )}
        </DataPanel>

        {/* Compare Queue */}
        <DataPanel
          icon={GitCompare}
          title={`Compare Queue (${compareProducts.length}/${MAX_COMPARE_PRODUCTS})`}
          padding="compact"
          actions={compareProducts.length > 0 && <TextButton onClick={onClearCompare}>Clear</TextButton>}
        >
          {compareProducts.length > 0 ? (
            <>
              <div className="workspace-compare-chips flex gap-2 overflow-x-auto mb-3" style={{ WebkitOverflowScrolling: 'touch' }}>
                {compareProducts.map((product) => (
                  <div key={product.id} className="relative shrink-0">
                    {(product.media?.hero || product.images?.[0]?.src) ? (
                      <img
                        src={product.media?.hero || product.images?.[0]?.src}
                        alt={product.title ?? product.label}
                        className="w-11 h-11 object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-11 h-11 bg-gray-100 border border-gray-200" />
                    )}
                    <button type="button" onClick={() => onRemoveFromCompare(product.id)}
                      aria-label={`Remove ${product.title ?? product.label} from comparison`}
                      className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-ink text-white border-0 flex items-center justify-center cursor-pointer p-0">
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
              <TextLink to="/compare">Compare Now →</TextLink>
            </>
          ) : (
            <>
              <EmptyNote>{`Select up to ${MAX_COMPARE_PRODUCTS} products while browsing to compare them side by side.`}</EmptyNote>
              <div className="mt-3"><TextLink to="/search">Browse Products</TextLink></div>
            </>
          )}
        </DataPanel>

        {/* Recent Configurations — placeholder using existing ConfiguratorContext state */}
        <DataPanel icon={Settings2} title="Recent Configurations" padding="compact">
          {hasInProgressConfiguration ? (
            <>
              <p className="text-[13px] font-bold text-gray-900 mb-1">
                {`In progress: ${configuratorState.selectedFamily}`}
              </p>
              <p className="text-xs text-gray-500 m-0">
                {`${accessoryCount} accessor${accessoryCount === 1 ? 'y' : 'ies'} selected`}
              </p>
            </>
          ) : (
            <EmptyNote>No recent configurations yet. Start configuring a product to see it here.</EmptyNote>
          )}
        </DataPanel>

        {/* Quote Builder shortcut */}
        <DataPanel icon={FileText} title="Quote Builder" padding="compact">
          <EmptyNote>Request a formal quote for the products in your cart, or start from any product page.</EmptyNote>
          <div className="mt-3 flex flex-col gap-2 items-start">
            <CTAButton variant="primary" href={`mailto:${appConfig.quoteRecipientEmail}?subject=${encodeURIComponent('Quote Request')}`}>
              Request a Quote
            </CTAButton>
            <TextLink to="/cart">Review Cart &amp; Request Quote →</TextLink>
          </div>
        </DataPanel>

        {/* Continue Shopping CTA */}
        <DataPanel title="Keep Building" padding="compact">
          <EmptyNote>Head back to the catalog to add more products to your build.</EmptyNote>
          <div className="mt-3">
            <CTAButton variant="secondary" to="/search" icon={ArrowRight}>Continue Shopping</CTAButton>
          </div>
        </DataPanel>
      </div>

      <WorkspaceFleetIntelligenceSection entries={fleetIntelligenceEntries} onOpenFleetBuilds={onOpenFleetBuilds} />

      <RecommendedNextActionsSection
        actions={recommendedNextActions}
        hasFleetBuilds={fleetBuilds.length > 0}
        onAddToBuild={onAddRecommendedProductToBuild}
        onOpenFleetBuilds={onOpenFleetBuilds}
      />

      {fleetProjects && <FleetProjectsWorkspaceSection {...fleetProjects} />}

      {departmentStandards && <DepartmentStandardsSection {...departmentStandards} />}

      <GuidedUpfitBuilderWorkspaceSection {...guidedUpfitBuilder} />

      <ProjectQuoteWorkspaceSection {...projectQuote} />

      <ProcurementPackagesWorkspaceSection {...procurementPackages} />

      <FleetBuildsWorkspaceSection builds={fleetBuilds} onOpenFleetBuilds={onOpenFleetBuilds} />

      <FleetTemplatesWorkspaceSection templates={fleetTemplates} builds={fleetBuilds} onOpenFleetBuilds={onOpenFleetBuilds} />

      {/* Saved Products */}
      <PageSection
        icon={Heart}
        title="Saved Products"
        toolbar={savedProducts.length > 0 && (
          <div className="flex items-center gap-4">
            <TextLink to="/saved-products">View All Saved</TextLink>
            <TextButton onClick={onClearSaved}>Clear</TextButton>
          </div>
        )}
      >
        {savedProducts.length > 0 ? (
          <div className="workspace-saved-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {savedProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} {...toCardProps(product)} />
            ))}
          </div>
        ) : (
          <EmptyState
            size="compact"
            icon={Heart}
            title="No saved products yet"
            description="You haven't saved any products yet. Tap the heart icon on any product to save it here."
            primaryAction={{ label: 'Browse Products', to: '/search' }}
          />
        )}
      </PageSection>

      {/* Recently Viewed */}
      <PageSection
        icon={Clock}
        title="Recently Viewed"
        spacing="tight"
        toolbar={recentlyViewedProducts.length > 0 && (
          <TextButton onClick={onClearRecentlyViewed}>Clear Recently Viewed</TextButton>
        )}
      >
        {recentlyViewedProducts.length > 0 ? (
          <div className="workspace-recent-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentlyViewedProducts.map((product) => (
              <ProductCard key={product.id} {...toCardProps(product)} />
            ))}
          </div>
        ) : (
          <EmptyState
            size="compact"
            icon={Clock}
            title="Nothing viewed yet"
            description="Products you view will show up here so you can pick up where you left off."
          />
        )}
      </PageSection>
    </PageLayout>
  );
}

export default function WorkspaceDashboard() {
  const { productIds: savedIds, clearSavedProducts } = useSavedProducts();
  const { productIds: recentIds, clearRecentlyViewed } = useRecentlyViewed();
  const { productIds: compareIds, removeFromCompare, clearCompare } = useCompare();
  const { selectedVehicle } = useVehicle();
  const { state: configuratorState } = useConfigurator();
  const { builds: fleetBuilds, allBuilds, activeBuild, addProductToBuild } = useFleetBuilds();
  const { templates: fleetTemplates, allTemplates } = useFleetTemplates();
  const {
    projects, activeProject, activeProjectId, isFull: projectsFull,
    createProject, renameProject, archiveProject, unarchiveProject, setActiveProject,
    assignDepartmentStandard: assignProjectStandard,
  } = useFleetProject();
  const { duplicateProjectWithContents, deleteProjectWithContents } = useFleetProjectActions();
  const {
    defaultStandards, companyStandards, isFull: standardsFull,
    cloneStandard, renameStandard, deleteStandard, addCategory, removeCategory,
  } = useDepartmentStandards();
  const { getCurrentStepId, getSkippedSteps } = useUpfitBuilder();
  const { summary: cartSummary, loading: cartLoading } = useMiniCart();
  // null = closed; 'shop' | 'fleet' selects which VehicleSelectorModal tab
  // opens — the Selected Vehicle card and the Fleet Builds section share one
  // modal instance instead of each managing its own.
  const [vehicleModalTab, setVehicleModalTab] = useState(null);
  const [showArchivedProjects, setShowArchivedProjects] = useState(false);

  const savedProducts = resolveSavedProducts(savedIds);
  const recentlyViewedProducts = resolveRecentlyViewedProducts(recentIds);
  const compareProducts = resolveCompareQueueProducts(compareIds);

  const activeProjectsList = projects.filter((project) => !project.archived);
  const archivedProjectsList = projects.filter((project) => project.archived);
  const projectSummaries = Object.fromEntries(
    projects.map((project) => [project.id, summarizeFleetProject(project, allBuilds, allTemplates)]),
  );

  // Fleet Intelligence & Department Standards — every build's effective
  // standard (its own assignment, falling back to its project's), grouped
  // per project for each Fleet Project's Fleet Health card and flattened for
  // the workspace-wide Fleet Readiness section. Builds whose project no
  // longer exists (should not happen outside test fixtures) resolve against
  // a null project, i.e. no inherited standard.
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const fleetIntelligenceEntries = allBuilds.map((build) => ({
    build,
    standard: resolveEffectiveStandard(build, projectById.get(build.projectId) ?? null, companyStandards),
  }));
  const entriesByProjectId = fleetIntelligenceEntries.reduce((byProjectId, entry) => {
    const projectId = entry.build.projectId;
    if (!byProjectId[projectId]) byProjectId[projectId] = [];
    byProjectId[projectId].push(entry);
    return byProjectId;
  }, {});

  // Vehicle Build Recommendations Engine — "Recommended Next Actions," reusing
  // the same fleetIntelligenceEntries computed above rather than re-resolving
  // each build's effective standard a second time.
  const recommendedNextActions = summarizeRecommendedNextActions(
    fleetIntelligenceEntries,
    catalogService.listProducts(),
    { getProduct: catalogService.getProduct },
  ).map((action) => ({
    ...action,
    recommendations: resolveRecommendationProducts(action.recommendations, catalogService.getProduct),
  }));

  // Guided Vehicle Upfit Builder — the active Fleet Build's guided progress
  // (reusing the same effective-standard resolution already computed above
  // for fleetIntelligenceEntries) and its next recommended step, for the
  // /workspace shortcut into /upfit-builder.
  const activeBuildStandard = activeBuild
    ? fleetIntelligenceEntries.find((entry) => entry.build.id === activeBuild.id)?.standard ?? null
    : null;
  const guidedSkippedStepIds = activeBuild ? getSkippedSteps(activeBuild.id) : [];
  const guidedChecklist = activeBuild ? buildGuidedUpfitChecklist(activeBuild, activeBuildStandard, guidedSkippedStepIds) : null;
  const guidedCurrentStepId = activeBuild
    ? (getCurrentStepId(activeBuild.id) ?? resolveDefaultStepId({
      hasActiveProject: Boolean(activeProject),
      hasActiveBuild: true,
      hasVehicle: Boolean(activeBuild.vehicle),
      hasStandard: Boolean(activeBuildStandard),
      hasStyle: Boolean(activeBuild.buildStyle),
    }, guidedSkippedStepIds))
    : null;
  const guidedUpfitBuilderProps = {
    activeBuild,
    checklist: guidedChecklist,
    currentStepLabel: guidedCurrentStepId ? getUpfitBuilderStepLabel(guidedCurrentStepId) : null,
  };

  // Fleet Quote Builder — the active Fleet Project's quote readiness and
  // outstanding-equipment counts, for the /project-quote shortcut. `builds`
  // is already scoped to the active project by FleetBuildsContext.
  const projectQuoteEntries = buildFleetQuoteEntries(fleetBuilds, activeProject, companyStandards);
  const projectQuoteSummary = aggregateProjectQuote(activeProject, projectQuoteEntries, null);
  const projectQuoteTotals = calculateProjectTotals(projectQuoteEntries, groupQuoteItems(projectQuoteEntries));
  const projectQuoteProps = {
    hasActiveProject: Boolean(activeProject),
    projectName: activeProject?.name ?? null,
    quoteStatus: projectQuoteSummary.quoteStatus,
    requiredEquipmentRemaining: projectQuoteTotals.requiredEquipmentRemaining,
    recommendedEquipmentRemaining: projectQuoteTotals.recommendedEquipmentRemaining,
  };

  // Fleet Procurement Packages — the active Fleet Project's builds grouped
  // into named packages by effective Department Standard, for the
  // /procurement shortcut. Reuses the same projectQuoteEntries computed
  // above rather than re-resolving each build's standard/checklist again.
  const procurementPackagesList = groupFleetQuoteEntriesIntoPackages(projectQuoteEntries).map(
    (group) => aggregatePackageSummary(group, { products: catalogService.listProducts(), getProduct: catalogService.getProduct }),
  );
  const procurementPackagesProps = {
    hasActiveProject: Boolean(activeProject),
    summary: summarizeProcurementPackages(procurementPackagesList),
  };

  function handleAddRecommendedProductToBuild(buildId, product, recommendation) {
    if (!recommendation.matchingCategoryId) return;
    addProductToBuild(buildId, recommendation.matchingCategoryId, product);
    toast({ title: 'Added to build', description: `${product.title ?? product.label ?? 'Product'} added to ${getUpfitBuilderStepLabel(recommendation.matchingCategoryId)}.` });
  }

  function handleCreateProject() {
    const created = createProject();
    if (!created) {
      toast({ title: 'Project limit reached', description: 'Delete a project to add another.' });
      return;
    }
    toast({ title: 'Project created', description: `"${created.name}" is ready to plan.` });
  }

  function handleOpenProject(projectId) {
    setActiveProject(projectId);
    setVehicleModalTab('fleet');
  }

  function handleDuplicateProject(projectId) {
    const source = projects.find((project) => project.id === projectId);
    const created = duplicateProjectWithContents(projectId);
    if (!created) return;
    toast({ title: 'Project duplicated', description: `"${source?.name ?? 'Project'}" copied to "${created.name}".` });
  }

  function handleDeleteProject(projectId) {
    const source = projects.find((project) => project.id === projectId);
    deleteProjectWithContents(projectId);
    toast({ title: 'Project deleted', description: `"${source?.name ?? 'Project'}" and its fleet builds/templates were removed.` });
  }

  const fleetProjectsProps = {
    projects: activeProjectsList,
    archivedProjects: archivedProjectsList,
    activeProjectId,
    summaries: projectSummaries,
    isFull: projectsFull,
    showArchived: showArchivedProjects,
    onToggleShowArchived: () => setShowArchivedProjects((value) => !value),
    onCreate: handleCreateProject,
    onOpen: handleOpenProject,
    onDuplicate: handleDuplicateProject,
    onRename: (projectId, name) => renameProject(projectId, name),
    onArchive: (projectId) => archiveProject(projectId),
    onUnarchive: (projectId) => unarchiveProject(projectId),
    onDelete: handleDeleteProject,
    defaultStandards,
    companyStandards,
    onAssignStandard: (projectId, standardId) => assignProjectStandard(projectId, standardId),
    entriesByProjectId,
  };

  function handleCloneStandard(standard) {
    const created = cloneStandard(standard);
    if (!created) {
      toast({ title: 'Company standards limit reached', description: 'Delete a company standard to clone another.' });
      return;
    }
    toast({ title: 'Standard cloned', description: `"${created.name}" is now available as a Company Standard.` });
  }

  const departmentStandardsProps = {
    defaultStandards,
    companyStandards,
    isFull: standardsFull,
    onClone: handleCloneStandard,
    onRename: (standardId, name) => renameStandard(standardId, name),
    onDelete: (standardId) => deleteStandard(standardId),
    onAddCategory: (standardId, tier, categoryId) => addCategory(standardId, tier, categoryId),
    onRemoveCategory: (standardId, tier, categoryId) => removeCategory(standardId, tier, categoryId),
  };

  return (
    <>
      <WorkspaceDashboardView
        savedProducts={savedProducts}
        recentlyViewedProducts={recentlyViewedProducts}
        compareProducts={compareProducts}
        fleetBuilds={fleetBuilds}
        fleetTemplates={fleetTemplates}
        fleetProjects={fleetProjectsProps}
        fleetIntelligenceEntries={fleetIntelligenceEntries}
        recommendedNextActions={recommendedNextActions}
        departmentStandards={departmentStandardsProps}
        guidedUpfitBuilder={guidedUpfitBuilderProps}
        projectQuote={projectQuoteProps}
        procurementPackages={procurementPackagesProps}
        cartSummary={cartSummary}
        cartLoading={cartLoading}
        selectedVehicle={selectedVehicle}
        configuratorState={configuratorState}
        onClearSaved={clearSavedProducts}
        onClearRecentlyViewed={clearRecentlyViewed}
        onRemoveFromCompare={removeFromCompare}
        onClearCompare={clearCompare}
        onOpenVehicleModal={() => setVehicleModalTab('shop')}
        onOpenFleetBuilds={() => setVehicleModalTab('fleet')}
        onAddRecommendedProductToBuild={handleAddRecommendedProductToBuild}
      />
      {vehicleModalTab && <VehicleSelectorModal initialTab={vehicleModalTab} onClose={() => setVehicleModalTab(null)} />}
    </>
  );
}
