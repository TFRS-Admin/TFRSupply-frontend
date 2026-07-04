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
import { Wrench, ArrowRight } from 'lucide-react';
import { useFleetBuilds } from '@/context/FleetBuildsContext';
import { calculateFleetBuildCompletion, classifyProductUpfitCategory, getBuildStyleLabel, getUpfitCategoryLabel } from '@/domain/fleetBuilds';
import { toast } from '@/components/ui/use-toast';
import SectionHeading from '@/components/product/SectionHeading';
import VehicleSelectorModal from '@/components/navigator/VehicleSelectorModal';
import FleetBuildCompletionBadge from './FleetBuildCompletionBadge';
import AddToAllCompatibleBuildsButton from './AddToAllCompatibleBuildsButton';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

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

export function FinishYourUpfitPanelView({ builds, activeBuild, product, onAddToActiveBuild, onOpenFleetBuilds }) {
  if (!builds || builds.length === 0) return null;

  const completion = activeBuild ? calculateFleetBuildCompletion(activeBuild) : null;

  return (
    <div className="border-t border-gray-200 bg-white" id="finish-your-upfit" data-testid="finish-your-upfit-panel">
      <div className="max-w-7xl mx-auto px-6 py-8 sm:py-10">
        <SectionHeading icon={Wrench} description="See how this product fits into your active fleet build.">
          Finish Your Upfit
        </SectionHeading>

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
          </>
        )}
      </div>
    </div>
  );
}

export default function FinishYourUpfitPanel({ product }) {
  const { builds, activeBuild, addProductToActiveBuild } = useFleetBuilds();
  const [modalOpen, setModalOpen] = useState(false);

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

  return (
    <>
      <FinishYourUpfitPanelView
        builds={builds}
        activeBuild={activeBuild}
        product={product}
        onAddToActiveBuild={handleAddToActiveBuild}
        onOpenFleetBuilds={() => setModalOpen(true)}
      />
      {modalOpen && <VehicleSelectorModal initialTab="fleet" onClose={() => setModalOpen(false)} />}
    </>
  );
}
