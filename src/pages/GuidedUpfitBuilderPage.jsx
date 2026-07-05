/**
 * pages/GuidedUpfitBuilderPage.jsx — Guided Vehicle Upfit Builder at
 * /upfit-builder.
 *
 * A guided, step-by-step wrapper around the existing Fleet Projects/Fleet
 * Builds/Department Standards/Fleet Completion Engine foundations: select a
 * Fleet Project, select or create a Fleet Build, select its vehicle, assign a
 * Department Standard, pick a Build Style, then work through the 12 upfit
 * categories one at a time, and finish on a Review step summarizing missing
 * equipment before handing off to Cart or a Quote request. This is
 * composition, not a new configurator, backend, or Shopify integration — no
 * product/build/standard data model is duplicated; the only new state is
 * which step a build's guided flow is on and which optional steps it
 * skipped (UpfitBuilderContext).
 *
 * Split into a pure `GuidedUpfitBuilderPageView` (fixture-testable) and a
 * connected default export, matching WorkspaceDashboardView/
 * FinishYourUpfitPanelView's convention.
 */
import React, { useEffect } from 'react';
import { PageLayout, PageHeader } from '@/components/design-system';
import { useFleetProject } from '@/context/FleetProjectContext';
import { useFleetBuilds } from '@/context/FleetBuildsContext';
import { useDepartmentStandards } from '@/context/DepartmentStandardsContext';
import { useUpfitBuilder } from '@/context/UpfitBuilderContext';
import { catalogService } from '@/services/catalog';
import { resolveEffectiveStandard } from '@/domain/departmentStandards';
import {
  buildGuidedUpfitChecklist,
  buildUpfitBuilderStepperItems,
  resolveDefaultStepId,
  getNextStepId,
  getPreviousStepId,
  getStepIndex,
  isCategoryStep,
  isReviewStep,
  resolveSuggestedProductsForCategory,
  resolveUpfitBrowseHref,
  getUpfitBuilderStepLabel,
  UPFIT_BUILDER_STEP_SEQUENCE,
} from '@/domain/upfitBuilder';
import { generateRecommendations, resolveRecommendationProducts, resolveRelatedProductIdsForBuild } from '@/domain/recommendations';
import { buildFleetQuoteEntries, meetsProjectQuoteReadinessThreshold, resolveQuoteReadiness } from '@/domain/fleetQuote';
import { toast } from '@/components/ui/use-toast';
import appConfig from '@/config/appConfig';
import UpfitBuilderStepperSidebar from '@/components/upfitBuilder/UpfitBuilderStepperSidebar';
import UpfitBuilderSummarySidebar from '@/components/upfitBuilder/UpfitBuilderSummarySidebar';
import UpfitBuilderMobileProgress from '@/components/upfitBuilder/UpfitBuilderMobileProgress';
import {
  SelectProjectStep, SelectBuildStep, SelectVehicleStep, SelectStandardStep, SelectStyleStep,
} from '@/components/upfitBuilder/UpfitBuilderSetupSteps';
import UpfitBuilderCategoryStep from '@/components/upfitBuilder/UpfitBuilderCategoryStep';
import UpfitBuilderReviewStep from '@/components/upfitBuilder/UpfitBuilderReviewStep';

export function GuidedUpfitBuilderPageView({
  projects, activeProject, activeProjectId, isProjectsFull, onCreateProject, onSelectProject,
  builds, activeBuild, activeBuildId, isBuildsFull, onCreateBuild, onSelectBuild,
  onUpdateVehicle, onUpdateStyle,
  defaultStandards, companyStandards, effectiveStandard, onAssignStandard,
  currentStepId, onGoToStep, onNext, onBack, canGoBack,
  stepperItems,
  checklist,
  suggestedProducts,
  recommendations = [],
  browseHref,
  onAddProductToCategory, onRemoveProductFromCategory,
  onSkipStep, onUnskipStep,
  quoteRecipientEmail,
  showGenerateProjectQuote = false,
}) {
  const stepIndex = getStepIndex(currentStepId);
  const stepLabel = getUpfitBuilderStepLabel(currentStepId);
  const backHandler = canGoBack ? onBack : undefined;

  function renderActiveStep() {
    if (currentStepId === 'project') {
      return (
        <SelectProjectStep
          projects={projects}
          activeProjectId={activeProjectId}
          isFull={isProjectsFull}
          onCreateProject={onCreateProject}
          onSelectProject={onSelectProject}
          onNext={onNext}
        />
      );
    }
    if (currentStepId === 'build') {
      return (
        <SelectBuildStep
          builds={builds}
          activeBuildId={activeBuildId}
          isFull={isBuildsFull}
          onCreateBuild={onCreateBuild}
          onSelectBuild={onSelectBuild}
          onNext={onNext}
          onBack={backHandler}
        />
      );
    }
    if (currentStepId === 'vehicle') {
      return <SelectVehicleStep build={activeBuild} onUpdateVehicle={onUpdateVehicle} onNext={onNext} onBack={backHandler} />;
    }
    if (currentStepId === 'standard') {
      return (
        <SelectStandardStep
          build={activeBuild}
          defaultStandards={defaultStandards}
          companyStandards={companyStandards}
          onAssignStandard={onAssignStandard}
          onSkip={() => { onSkipStep('standard'); onNext(); }}
          onNext={onNext}
          onBack={backHandler}
        />
      );
    }
    if (currentStepId === 'style') {
      return <SelectStyleStep build={activeBuild} onUpdateStyle={onUpdateStyle} onNext={onNext} onBack={backHandler} />;
    }
    if (isReviewStep(currentStepId)) {
      return (
        <UpfitBuilderReviewStep
          build={activeBuild}
          checklist={checklist}
          onGoToStep={onGoToStep}
          quoteRecipientEmail={quoteRecipientEmail}
          onBack={backHandler}
          showGenerateProjectQuote={showGenerateProjectQuote}
        />
      );
    }
    if (isCategoryStep(currentStepId) && checklist) {
      const step = checklist.steps.find((item) => item.categoryId === currentStepId);
      return (
        <UpfitBuilderCategoryStep
          step={step}
          suggestedProducts={suggestedProducts}
          recommendations={recommendations}
          browseHref={browseHref}
          onAddProduct={(product) => onAddProductToCategory(currentStepId, product)}
          onRemoveProduct={(productId) => onRemoveProductFromCategory(currentStepId, productId)}
          onSkip={() => onSkipStep(currentStepId)}
          onUnskip={() => onUnskipStep(currentStepId)}
          onNext={onNext}
          onBack={backHandler}
        />
      );
    }
    return null;
  }

  return (
    <PageLayout
      crumbs={[{ label: 'Home', to: '/' }, { label: 'My Workspace', to: '/workspace' }, { label: 'Guided Upfit Builder' }]}
      contentClassName="py-6 sm:py-10"
      beforeContent={(
        <UpfitBuilderMobileProgress
          stepLabel={stepLabel}
          stepNumber={stepIndex + 1}
          stepCount={UPFIT_BUILDER_STEP_SEQUENCE.length}
          percent={checklist?.overallPercent ?? 0}
        />
      )}
    >
      <PageHeader
        title="Guided Vehicle Upfit Builder"
        description="Work through your fleet build one step at a time — project, build, vehicle, department standard, build style, and every upfit category."
      />

      <div className="upfit-builder-layout flex gap-6 items-start flex-wrap">
        <UpfitBuilderStepperSidebar items={stepperItems} currentStepId={currentStepId} onGoToStep={onGoToStep} />
        {renderActiveStep()}
        <UpfitBuilderSummarySidebar project={activeProject} build={activeBuild} standardName={effectiveStandard?.name ?? null} checklist={checklist} />
      </div>
    </PageLayout>
  );
}

export default function GuidedUpfitBuilderPage() {
  const {
    projects, activeProject, activeProjectId, isFull: isProjectsFull, createProject, setActiveProject,
  } = useFleetProject();
  const {
    builds, activeBuild, activeBuildId, isFull: isBuildsFull,
    addBuild, setActiveBuild, updateVehicle, updateStyle, addProductToActiveBuild, removeProductFromBuild,
    assignDepartmentStandard,
  } = useFleetBuilds();
  const { defaultStandards, companyStandards } = useDepartmentStandards();
  const { getCurrentStepId, setCurrentStepId, getSkippedSteps, skipStep, unskipStep } = useUpfitBuilder();

  const effectiveStandard = activeBuild ? resolveEffectiveStandard(activeBuild, activeProject, companyStandards) : null;
  const skippedStepIds = getSkippedSteps(activeBuild?.id);

  const setupState = {
    hasActiveProject: Boolean(activeProject),
    hasActiveBuild: Boolean(activeBuild),
    hasVehicle: Boolean(activeBuild?.vehicle),
    hasStandard: Boolean(effectiveStandard),
    hasStyle: Boolean(activeBuild?.buildStyle),
  };

  const currentStepId = activeBuild
    ? (getCurrentStepId(activeBuild.id) ?? resolveDefaultStepId(setupState, skippedStepIds))
    : resolveDefaultStepId(setupState, skippedStepIds);

  // Persist the resolved default the moment a build first lands on it so it
  // sticks — otherwise resolveDefaultStepId re-evaluates on every render, and
  // filling in a step's own field (e.g. picking a vehicle) would silently
  // fast-forward the guided flow past later un-persisted steps (e.g.
  // Department Standard) before the customer ever saw them.
  useEffect(() => {
    if (activeBuild && getCurrentStepId(activeBuild.id) == null) {
      setCurrentStepId(activeBuild.id, currentStepId);
    }
    // Only re-run when the active build (or its persisted step) changes — see comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBuild?.id, getCurrentStepId(activeBuild?.id)]);

  const checklist = activeBuild ? buildGuidedUpfitChecklist(activeBuild, effectiveStandard, skippedStepIds) : null;
  const stepperItems = buildUpfitBuilderStepperItems(setupState, checklist, skippedStepIds);

  // Fleet Quote Builder — the Review step's "Generate Project Quote" button
  // only appears once the active Fleet Project's overall quote readiness
  // meets a configurable threshold (see PROJECT_QUOTE_READY_LEVELS,
  // src/domain/fleetQuote/quoteReadiness.ts).
  const projectQuoteEntries = buildFleetQuoteEntries(builds, activeProject, companyStandards);
  const projectQuoteReadiness = resolveQuoteReadiness(Boolean(activeProject), projectQuoteEntries);
  const showGenerateProjectQuote = meetsProjectQuoteReadinessThreshold(projectQuoteReadiness);

  const suggestedProducts = isCategoryStep(currentStepId)
    ? resolveSuggestedProductsForCategory(currentStepId, { searchProducts: catalogService.searchProducts })
    : [];
  const recommendations = isCategoryStep(currentStepId)
    ? resolveRecommendationProducts(
      generateRecommendations(catalogService.listProducts(), {
        build: activeBuild,
        standard: effectiveStandard,
        currentStepCategoryId: currentStepId,
        relatedProductIds: resolveRelatedProductIdsForBuild(activeBuild, { getProduct: catalogService.getProduct }),
      }, { limit: 4 }),
      catalogService.getProduct,
    )
    : [];
  const browseHref = isCategoryStep(currentStepId)
    ? resolveUpfitBrowseHref(currentStepId, { fleetProjectId: activeProjectId, fleetBuildId: activeBuild?.id })
    : '/search';

  function goToStep(stepId) {
    if (activeBuild) setCurrentStepId(activeBuild.id, stepId);
  }

  function handleNext() {
    const next = getNextStepId(currentStepId);
    if (next) goToStep(next);
  }

  function handleBack() {
    const previous = getPreviousStepId(currentStepId);
    if (previous) goToStep(previous);
  }

  function handleCreateProject() {
    const created = createProject();
    if (!created) {
      toast({ title: 'Project limit reached', description: 'Delete a project to add another.' });
      return;
    }
    toast({ title: 'Project created', description: `"${created.name}" is ready to plan.` });
  }

  function handleCreateBuild() {
    const newId = addBuild();
    if (!newId) {
      toast({ title: 'Fleet build limit reached', description: 'Remove a build to add another.' });
    }
  }

  function handleAddProductToCategory(categoryId, product) {
    addProductToActiveBuild(categoryId, product);
    toast({ title: 'Added to build', description: `${product.title ?? product.label ?? 'Product'} added to ${getUpfitBuilderStepLabel(categoryId)}.` });
  }

  return (
    <GuidedUpfitBuilderPageView
      projects={projects}
      activeProject={activeProject}
      activeProjectId={activeProjectId}
      isProjectsFull={isProjectsFull}
      onCreateProject={handleCreateProject}
      onSelectProject={setActiveProject}
      builds={builds}
      activeBuild={activeBuild}
      activeBuildId={activeBuildId}
      isBuildsFull={isBuildsFull}
      onCreateBuild={handleCreateBuild}
      onSelectBuild={setActiveBuild}
      onUpdateVehicle={(vehicle) => activeBuild && updateVehicle(activeBuild.id, vehicle)}
      onUpdateStyle={(style) => activeBuild && updateStyle(activeBuild.id, style)}
      defaultStandards={defaultStandards}
      companyStandards={companyStandards}
      effectiveStandard={effectiveStandard}
      onAssignStandard={(standardId) => activeBuild && assignDepartmentStandard(activeBuild.id, standardId)}
      currentStepId={currentStepId}
      onGoToStep={goToStep}
      onNext={handleNext}
      onBack={handleBack}
      canGoBack={Boolean(getPreviousStepId(currentStepId))}
      stepperItems={stepperItems}
      checklist={checklist}
      suggestedProducts={suggestedProducts}
      recommendations={recommendations}
      browseHref={browseHref}
      onAddProductToCategory={handleAddProductToCategory}
      onRemoveProductFromCategory={(categoryId, productId) => activeBuild && removeProductFromBuild(activeBuild.id, categoryId, productId)}
      onSkipStep={(stepId) => activeBuild && skipStep(activeBuild.id, stepId)}
      onUnskipStep={(stepId) => activeBuild && unskipStep(activeBuild.id, stepId)}
      quoteRecipientEmail={appConfig.quoteRecipientEmail}
      showGenerateProjectQuote={showGenerateProjectQuote}
    />
  );
}
