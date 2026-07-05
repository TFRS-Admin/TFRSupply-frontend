/**
 * components/fleetBuilds/FinishYourUpfitPanel.jsx
 * "Finish Your Upfit" — product detail panel that shows how the current
 * product relates to the customer's active fleet build: completion, missing
 * categories, suggested next categories, and quick actions to add this
 * product to the active build or to every compatible build. Renders nothing
 * until the customer has started at least one fleet build, so it never
 * changes the page for shoppers using Shop by Vehicle only. Existing CTAs
 * (Configure/Quote/Cart/Contact in CommerceActionPanel) are unchanged.
 *
 * Split into a pure `FinishYourUpfitPanelView` (fixture-testable — builds/
 * activeBuild are props, not read from context) and a connected default
 * export, matching the ComparePageView/RecentlyViewedProductsView convention
 * used throughout src/pages and src/components/product.
 */
import React, { useState } from 'react';
import { Wrench, ArrowRight, Copy, ShieldCheck, ListChecks } from 'lucide-react';
import { useFleetBuilds } from '@/context/FleetBuildsContext';
import { useFleetTemplates } from '@/context/FleetTemplatesContext';
import { useFleetProject } from '@/context/FleetProjectContext';
import { useDepartmentStandards } from '@/context/DepartmentStandardsContext';
import { useUpfitBuilder } from '@/context/UpfitBuilderContext';
import {
  calculateFleetBuildCompletion,
  classifyProductUpfitCategory,
  cloneSourceFromBuild,
  getBuildStyleLabel,
  getTemplateById,
  getUpfitCategoryLabel,
} from '@/domain/fleetBuilds';
import { evaluateFleetBuildIntelligence, resolveEffectiveStandard } from '@/domain/departmentStandards';
import { isCategoryStep, getUpfitBuilderStepLabel } from '@/domain/upfitBuilder';
import { generateRecommendations, resolveRecommendationProducts, resolveRelatedProductIdsForBuild } from '@/domain/recommendations';
import { resolveProductQuoteInclusion } from '@/domain/fleetQuote';
import { resolveProductPackageInclusion } from '@/domain/procurementPackages';
import { catalogService } from '@/services/catalog';
import { toast } from '@/components/ui/use-toast';
import SectionHeading from '@/components/product/SectionHeading';
import VehicleSelectorModal from '@/components/navigator/VehicleSelectorModal';
import RecommendationCard, { RecommendationCardGrid } from '@/components/recommendations/RecommendationCard';
import FleetBuildCompletionBadge from './FleetBuildCompletionBadge';
import AddToAllCompatibleBuildsButton from './AddToAllCompatibleBuildsButton';
import CloneBuildDialog, { summarizeCompatibilityResult } from './CloneBuildDialog';

const MAX_RECOMMENDED_NEXT_PRODUCTS = 3;

/**
 * Vehicle Build Recommendations Engine — "top 3 products based on current
 * build gaps." Distinct from DepartmentStandardStatus's own "Recommended
 * Next Products" list above (which only names missing categories); this
 * shows real, scored catalog products with reasons, ranked by
 * generateRecommendations.
 */
function RecommendedNextProducts({ recommendedProducts, onAddToActiveBuild }) {
  return (
    <div style={{ ...FS, marginTop: 22, paddingTop: 18, borderTop: '1px solid #eee' }} data-testid="finish-your-upfit-recommended-products">
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>Recommended Products for This Build</h3>
      {recommendedProducts.length > 0 ? (
        <RecommendationCardGrid>
          {recommendedProducts.map(({ recommendation, product }) => (
            <RecommendationCard
              key={product.id}
              recommendation={recommendation}
              product={product}
              onAddToBuild={onAddToActiveBuild}
              addLabel="Add to Active Build"
            />
          ))}
        </RecommendationCardGrid>
      ) : (
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>No additional product recommendations right now.</p>
      )}
    </div>
  );
}

function browseCategoryHref(categoryLabel) {
  return `/search?q=${encodeURIComponent(categoryLabel)}`;
}

/**
 * Feature 4: Department-standard-aware "Finish Your Upfit" expansion —
 * Missing Required/Recommended Equipment, the standard's name, and
 * Recommended Next Products (Add for the current product's own category,
 * Browse — reusing the existing /search free-text query, no new
 * recommendation engine — for every other missing category).
 */
function DepartmentStandardStatus({ report, currentProductCategoryId, onAddToActiveBuild }) {
  const nextCategories = [...report.missingRequired, ...report.missingRecommended].slice(0, 5);

  return (
    <div style={{ ...FS, marginTop: 22, paddingTop: 18, borderTop: '1px solid #eee' }} data-testid="finish-your-upfit-standard-status">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={13} /> Department Standard: {report.standardName}
        </p>
        <FleetBuildCompletionBadge
          completion={{ percent: report.completionPercent, color: report.departmentCompliant ? 'green' : (report.requiredInstalled > 0 ? 'yellow' : 'red') }}
          compact
        />
      </div>
      <div className="fyu-standard-grid grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>Missing Required Equipment</h3>
          {report.missingRequired.length > 0 ? (
            <ul style={{ fontSize: 13, color: '#b91c1c', lineHeight: 1.8, paddingLeft: '1.1rem', margin: 0 }}>
              {report.missingRequired.map((categoryId) => <li key={categoryId}>{getUpfitCategoryLabel(categoryId)}</li>)}
            </ul>
          ) : (
            <p style={{ fontSize: 13, color: '#16a34a', margin: 0 }}>Fully department-compliant.</p>
          )}
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginTop: 16, marginBottom: 10 }}>Missing Recommended Equipment</h3>
          {report.missingRecommended.length > 0 ? (
            <ul style={{ fontSize: 13, color: '#92400e', lineHeight: 1.8, paddingLeft: '1.1rem', margin: 0 }}>
              {report.missingRecommended.map((categoryId) => <li key={categoryId}>{getUpfitCategoryLabel(categoryId)}</li>)}
            </ul>
          ) : (
            <p style={{ fontSize: 13, color: '#888', margin: 0 }}>—</p>
          )}
        </div>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>Recommended Next Products</h3>
          {nextCategories.length > 0 ? (
            <ul style={{ fontSize: 13, lineHeight: 2.1, paddingLeft: 0, margin: 0, listStyle: 'none' }}>
              {nextCategories.map((categoryId) => (
                categoryId === currentProductCategoryId ? (
                  <li key={categoryId}>
                    <button
                      type="button"
                      onClick={onAddToActiveBuild}
                      style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#c8102e', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Add {getUpfitCategoryLabel(categoryId)}
                    </button>
                  </li>
                ) : (
                  <li key={categoryId}>
                    <a href={browseCategoryHref(getUpfitCategoryLabel(categoryId))} style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#1a2744', textDecoration: 'underline' }}>
                      Browse {getUpfitCategoryLabel(categoryId)}
                    </a>
                  </li>
                )
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Nothing outstanding.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * Guided Vehicle Upfit Builder integration — a "Continue Guided Build" CTA
 * plus, when the guided flow's current step is one of the 12 upfit
 * categories, an "Add to This Step" action that adds the current product
 * directly to that category (bypassing classifyProductUpfitCategory, since
 * the guided step already names the target category explicitly). Renders
 * even with no guided progress yet, as a "Start Guided Build" entry point.
 */
function GuidedBuildStatus({ stepId, onAddToStep }) {
  const stepLabel = stepId ? getUpfitBuilderStepLabel(stepId) : null;
  const canAddHere = Boolean(stepId) && isCategoryStep(stepId);

  return (
    <div
      style={{ ...FS, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 10 }}
      data-testid="finish-your-upfit-guided-status"
    >
      {stepLabel && (
        <span style={{ fontSize: 12, color: '#666' }}>
          Guided Step: <strong style={{ color: '#1a1a1a' }}>{stepLabel}</strong>
        </span>
      )}
      {canAddHere && (
        <button
          type="button"
          onClick={onAddToStep}
          style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#1a2744', background: 'none', border: '1.5px solid #1a2744', borderRadius: 2, padding: '6px 10px', cursor: 'pointer' }}
        >
          Add to This Step
        </button>
      )}
      <a
        href="/upfit-builder"
        style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#c8102e', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4 }}
      >
        <ListChecks size={12} /> {stepLabel ? 'Continue Guided Build' : 'Start Guided Build'} <ArrowRight size={12} />
      </a>
    </div>
  );
}

/**
 * Fleet Quote Builder integration — is this product already selected in one
 * of the active Fleet Project's Fleet Builds? Reuses the existing
 * FleetBuildsContext add/remove actions (no new cart/quote state); "Add to
 * Quote" is the same action as "Add to Active Build" above, "Remove from
 * Quote" removes it from whichever build actually has it.
 */
function ProductQuoteInclusionStatus({ inclusion, canAdd, onAdd, onRemove }) {
  return (
    <div style={{ ...FS, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 10 }} data-testid="finish-your-upfit-quote-inclusion">
      <span
        data-testid="finish-your-upfit-quote-inclusion-badge"
        style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
          background: inclusion.included ? '#dcfce7' : '#f4f5f7',
          color: inclusion.included ? '#166534' : '#666',
        }}
      >
        {inclusion.included ? `Included In Quote — ${inclusion.buildName}` : 'Not Yet Included'}
      </span>
      {inclusion.included ? (
        <button
          type="button"
          onClick={onRemove}
          style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#b91c1c', background: 'none', border: '1.5px solid #fca5a5', borderRadius: 2, padding: '6px 10px', cursor: 'pointer' }}
        >
          Remove from Quote
        </button>
      ) : (
        canAdd && (
          <button
            type="button"
            onClick={onAdd}
            style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#1a2744', background: 'none', border: '1.5px solid #1a2744', borderRadius: 2, padding: '6px 10px', cursor: 'pointer' }}
          >
            Add to Quote
          </button>
        )
      )}
    </div>
  );
}

/**
 * Fleet Procurement Packages integration — is this product already selected
 * in one of the active Fleet Project's Fleet Builds, and if so, which
 * procurement package (Department Standard grouping) does that build belong
 * to? Reuses the exact same FleetBuildsContext add/remove actions as
 * ProductQuoteInclusionStatus above (no new cart/quote/package state) — a
 * procurement package is a read-only grouping over the same build
 * selections, not a separate purchasing cart.
 */
function ProductPackageInclusionStatus({ inclusion, canAdd, onAdd, onRemove }) {
  return (
    <div style={{ ...FS, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 10 }} data-testid="finish-your-upfit-package-inclusion">
      <span
        data-testid="finish-your-upfit-package-inclusion-badge"
        style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
          background: inclusion.included ? '#dcfce7' : '#f4f5f7',
          color: inclusion.included ? '#166534' : '#666',
        }}
      >
        {inclusion.included ? `Included In Procurement Package — ${inclusion.packageName}` : 'Not Included'}
      </span>
      {inclusion.included ? (
        <button
          type="button"
          onClick={onRemove}
          style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#b91c1c', background: 'none', border: '1.5px solid #fca5a5', borderRadius: 2, padding: '6px 10px', cursor: 'pointer' }}
        >
          Remove from Package
        </button>
      ) : (
        canAdd && (
          <button
            type="button"
            onClick={onAdd}
            style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#1a2744', background: 'none', border: '1.5px solid #1a2744', borderRadius: 2, padding: '6px 10px', cursor: 'pointer' }}
          >
            Add to Package
          </button>
        )
      )}
    </div>
  );
}

function getProductVerticalIds(productId) {
  return catalogService.getProduct(productId)?.verticalIds ?? null;
}

function TemplatePickerForm({ templates, onApply }) {
  const [selected, setSelected] = useState(templates[0]?.id ?? '');

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (selected) onApply(selected); }}
      style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
    >
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        aria-label="Select a template to apply"
        style={{ ...FS, fontSize: 12.5, padding: '9px 8px', border: '1.5px solid #d0d0d0', borderRadius: 2, background: '#fff', color: '#1a1a1a' }}
      >
        {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
      </select>
      <button
        type="submit"
        style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#fff', background: '#1a2744', border: 'none', padding: '10px 16px', minHeight: 44, cursor: 'pointer' }}
      >
        Apply Template
      </button>
    </form>
  );
}

function OpenFleetBuildsButton({ onOpen, label = 'Open Fleet Builds' }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#1a2744', background: '#fff', border: '2px solid #1a2744', padding: '10px 16px', minHeight: 44, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
    >
      {label} <ArrowRight size={14} />
    </button>
  );
}

export function FinishYourUpfitPanelView({
  builds, activeBuild, product, templates = [], appliedTemplate = null, activeProject = null,
  effectiveStandard = null, currentGuidedStepId = null, recommendedProducts = [],
  quoteInclusion = null, packageInclusion = null,
  onAddToActiveBuild, onOpenFleetBuilds, onApplyTemplate, onCloneActiveBuild, onAddToCurrentStep, onAddRecommendedProduct,
  onRemoveFromQuote, onRemoveFromPackage,
}) {
  if (!builds || builds.length === 0) return null;

  const completion = activeBuild ? calculateFleetBuildCompletion(activeBuild) : null;
  const standardReport = activeBuild ? evaluateFleetBuildIntelligence(activeBuild, effectiveStandard) : null;
  const currentProductCategoryId = classifyProductUpfitCategory(product);

  return (
    <div className="border-t border-gray-200 bg-white" id="finish-your-upfit" data-testid="finish-your-upfit-panel">
      <div className="max-w-7xl mx-auto px-6 py-8 sm:py-10">
        <SectionHeading icon={Wrench} description="See how this product fits into your active fleet build.">
          Finish Your Upfit
        </SectionHeading>

        <div style={{ ...FS, display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20, fontSize: 12, color: '#666' }}>
          <span data-testid="current-project-label">
            <strong style={{ color: '#1a1a1a' }}>Current Project:</strong> {activeProject ? activeProject.name : 'None'}
          </span>
          <span data-testid="current-fleet-build-label">
            <strong style={{ color: '#1a1a1a' }}>Current Fleet Build:</strong> {activeBuild ? activeBuild.name : 'None'}
          </span>
          <span data-testid="current-template-summary-label">
            <strong style={{ color: '#1a1a1a' }}>Current Template:</strong> {appliedTemplate ? appliedTemplate.name : 'None applied'}
          </span>
        </div>

        <GuidedBuildStatus stepId={currentGuidedStepId} onAddToStep={onAddToCurrentStep} />

        {activeProject && quoteInclusion && (
          <ProductQuoteInclusionStatus
            inclusion={quoteInclusion}
            canAdd={Boolean(activeBuild)}
            onAdd={onAddToActiveBuild}
            onRemove={onRemoveFromQuote}
          />
        )}

        {activeProject && packageInclusion && (
          <ProductPackageInclusionStatus
            inclusion={packageInclusion}
            canAdd={Boolean(activeBuild)}
            onAdd={onAddToActiveBuild}
            onRemove={onRemoveFromPackage}
          />
        )}

        {!activeBuild ? (
          <>
            <p style={{ ...FS, fontSize: 13, color: '#888', marginBottom: 14 }}>
              You have fleet builds started, but none is active right now. Open Fleet Builds to choose one.
            </p>
            <OpenFleetBuildsButton onOpen={onOpenFleetBuilds} />
          </>
        ) : (
          <>
            <div className="fyu-grid grid grid-cols-1 md:grid-cols-3 gap-8" style={FS}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>Active Build</h3>
                <p style={{ fontSize: 13, color: '#444', marginBottom: 4 }}>{activeBuild.name}</p>
                <p style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>
                  {activeBuild.vehicle ? `${activeBuild.vehicle.year} ${activeBuild.vehicle.make} ${activeBuild.vehicle.model}` : 'No vehicle selected'}
                  {' · '}{getBuildStyleLabel(activeBuild.buildStyle)}
                </p>
                <FleetBuildCompletionBadge completion={completion} />
              </div>

              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>Missing Upfit Categories</h3>
                {completion.missingCategories.length > 0 ? (
                  <ul style={{ fontSize: 13, color: '#444', lineHeight: 1.8, paddingLeft: '1.1rem', margin: 0 }}>
                    {completion.missingCategories.map((categoryId) => (
                      <li key={categoryId}>{getUpfitCategoryLabel(categoryId)}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: 13, color: '#16a34a', margin: 0 }}>Nothing missing — nice work.</p>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>Suggested Next Categories</h3>
                {completion.suggestedNextCategories.length > 0 ? (
                  <ul style={{ fontSize: 13, color: '#444', lineHeight: 1.8, paddingLeft: '1.1rem', margin: 0 }}>
                    {completion.suggestedNextCategories.map((categoryId) => (
                      <li key={categoryId}>{getUpfitCategoryLabel(categoryId)}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: 13, color: '#888', margin: 0 }}>—</p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
              <button
                type="button"
                onClick={onAddToActiveBuild}
                style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#fff', background: '#c8102e', border: 'none', padding: '12px 16px', minHeight: 44, cursor: 'pointer' }}
              >
                Add to Active Build
              </button>
              <AddToAllCompatibleBuildsButton product={product} variant="inline" />
              <OpenFleetBuildsButton onOpen={onOpenFleetBuilds} label="Fleet Builds" />
            </div>

            {standardReport && (
              <DepartmentStandardStatus
                report={standardReport}
                currentProductCategoryId={currentProductCategoryId}
                onAddToActiveBuild={onAddToActiveBuild}
              />
            )}

            <RecommendedNextProducts recommendedProducts={recommendedProducts} onAddToActiveBuild={onAddRecommendedProduct} />

            <div style={{ ...FS, marginTop: 20, paddingTop: 16, borderTop: '1px solid #eee' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>
                Current Template
              </p>
              <p style={{ fontSize: 13, color: '#444', marginBottom: 14 }} data-testid="current-template-label">
                {appliedTemplate ? appliedTemplate.name : 'No template applied to this build yet.'}
              </p>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                {templates.length > 0 && <TemplatePickerForm templates={templates} onApply={onApplyTemplate} />}
                <button
                  type="button"
                  onClick={onCloneActiveBuild}
                  style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#1a2744', background: '#fff', border: '2px solid #1a2744', padding: '10px 16px', minHeight: 44, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <Copy size={14} /> Clone Current Build
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function FinishYourUpfitPanel({ product }) {
  const { builds, activeBuild, addProductToActiveBuild, removeProductFromBuild, applyTemplate, cloneBuild } = useFleetBuilds();
  const { templates, touchUsage } = useFleetTemplates();
  const { activeProject } = useFleetProject();
  const { companyStandards } = useDepartmentStandards();
  const { getCurrentStepId } = useUpfitBuilder();
  const [modalOpen, setModalOpen] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);

  const effectiveStandard = activeBuild ? resolveEffectiveStandard(activeBuild, activeProject, companyStandards) : null;
  const currentGuidedStepId = activeBuild ? getCurrentStepId(activeBuild.id) : null;
  const quoteInclusion = resolveProductQuoteInclusion(builds, product.id);
  const packageInclusion = resolveProductPackageInclusion(builds, product.id, activeProject, companyStandards);

  const appliedTemplate = getTemplateById(templates, activeBuild?.templateId);

  const recommendedProducts = activeBuild
    ? resolveRecommendationProducts(
      generateRecommendations(catalogService.listProducts(), {
        build: activeBuild,
        standard: effectiveStandard,
        currentStepCategoryId: isCategoryStep(currentGuidedStepId) ? currentGuidedStepId : null,
        relatedProductIds: resolveRelatedProductIdsForBuild(activeBuild, { getProduct: catalogService.getProduct }),
      }, { limit: MAX_RECOMMENDED_NEXT_PRODUCTS }),
      catalogService.getProduct,
    )
    : [];

  function handleAddToActiveBuild() {
    const category = classifyProductUpfitCategory(product);
    if (!category) {
      toast({
        title: 'Could not determine an upfit category',
        description: 'This product could not be matched to an upfit category automatically.',
      });
      return;
    }
    addProductToActiveBuild(category, product);
    toast({
      title: 'Added to active build',
      description: `${product.title ?? product.label ?? 'Product'} added to ${getUpfitCategoryLabel(category)} for "${activeBuild.name}".`,
    });
  }

  function handleAddToCurrentStep() {
    if (!activeBuild || !isCategoryStep(currentGuidedStepId)) return;
    addProductToActiveBuild(currentGuidedStepId, product);
    toast({
      title: 'Added to guided step',
      description: `${product.title ?? product.label ?? 'Product'} added to ${getUpfitBuilderStepLabel(currentGuidedStepId)} for "${activeBuild.name}".`,
    });
  }

  function handleAddRecommendedProduct(recommendedProduct, recommendation) {
    const category = recommendation.matchingCategoryId ?? classifyProductUpfitCategory(recommendedProduct);
    if (!activeBuild || !category) return;
    addProductToActiveBuild(category, recommendedProduct);
    toast({
      title: 'Added to active build',
      description: `${recommendedProduct.title ?? recommendedProduct.label ?? 'Product'} added to ${getUpfitCategoryLabel(category)} for "${activeBuild.name}".`,
    });
  }

  function handleRemoveFromQuote() {
    if (!quoteInclusion.included) return;
    removeProductFromBuild(quoteInclusion.buildId, quoteInclusion.categoryId, product.id);
    toast({
      title: 'Removed from quote',
      description: `${product.title ?? product.label ?? 'Product'} removed from "${quoteInclusion.buildName}".`,
    });
  }

  function handleRemoveFromPackage() {
    if (!packageInclusion.included) return;
    removeProductFromBuild(packageInclusion.buildId, packageInclusion.categoryId, product.id);
    toast({
      title: 'Removed from package',
      description: `${product.title ?? product.label ?? 'Product'} removed from "${packageInclusion.packageName}".`,
    });
  }

  function handleApplyTemplate(templateId) {
    const template = templates.find((item) => item.id === templateId);
    if (!template || !activeBuild) return;
    const result = applyTemplate(activeBuild.id, template, getProductVerticalIds);
    if (!result) return;
    touchUsage(template.id);
    toast(summarizeCompatibilityResult(result, `Applied "${template.name}"`));
  }

  function handleCloneActiveBuild(destination) {
    if (!activeBuild) return;
    const result = cloneBuild(cloneSourceFromBuild(activeBuild), destination, getProductVerticalIds);
    setCloneDialogOpen(false);
    if (!result) {
      toast({ title: 'Fleet build limit reached', description: 'Remove a build to clone another.' });
      return;
    }
    toast(summarizeCompatibilityResult(result, `Cloned to "${destination.name}"`));
  }

  return (
    <>
      <FinishYourUpfitPanelView
        builds={builds}
        activeBuild={activeBuild}
        product={product}
        templates={templates}
        appliedTemplate={appliedTemplate}
        activeProject={activeProject}
        effectiveStandard={effectiveStandard}
        currentGuidedStepId={currentGuidedStepId}
        recommendedProducts={recommendedProducts}
        quoteInclusion={quoteInclusion}
        packageInclusion={packageInclusion}
        onAddToActiveBuild={handleAddToActiveBuild}
        onOpenFleetBuilds={() => setModalOpen(true)}
        onApplyTemplate={handleApplyTemplate}
        onCloneActiveBuild={() => setCloneDialogOpen(true)}
        onAddToCurrentStep={handleAddToCurrentStep}
        onAddRecommendedProduct={handleAddRecommendedProduct}
        onRemoveFromQuote={handleRemoveFromQuote}
        onRemoveFromPackage={handleRemoveFromPackage}
      />
      {modalOpen && <VehicleSelectorModal initialTab="fleet" onClose={() => setModalOpen(false)} />}
      {cloneDialogOpen && activeBuild && (
        <CloneBuildDialog
          sourceLabel="Build"
          sourceName={activeBuild.name}
          sourceVehicle={activeBuild.vehicle}
          sourceQuantity={activeBuild.quantity}
          onClose={() => setCloneDialogOpen(false)}
          onClone={handleCloneActiveBuild}
        />
      )}
    </>
  );
}
