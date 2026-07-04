/**
 * components/fleetBuilds/FleetBuildsPanel.jsx
 * "Fleet Builds" tab — add/switch/remove builds and edit each build's
 * vehicle, quantity, build style, and upfit selections via FleetBuildCard.
 * All state comes from useFleetBuilds() (localStorage-backed, client-only).
 */
import React, { useState } from 'react';
import { Plus, LayoutGrid } from 'lucide-react';
import { useFleetBuilds } from '@/context/FleetBuildsContext';
import { useFleetTemplates } from '@/context/FleetTemplatesContext';
import { MAX_FLEET_BUILDS, cloneSourceFromBuild } from '@/domain/fleetBuilds';
import { catalogService } from '@/services/catalog';
import { toast } from '@/components/ui/use-toast';
import FleetBuildCard from './FleetBuildCard';
import FleetTemplatesSection from './FleetTemplatesSection';
import CloneBuildDialog, { summarizeCompatibilityResult } from './CloneBuildDialog';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function getProductVerticalIds(productId) {
  return catalogService.getProduct(productId)?.verticalIds ?? null;
}

export default function FleetBuildsPanel() {
  const {
    builds, activeBuildId, isFull,
    addBuild, removeBuild, setActiveBuild, renameBuild,
    updateVehicle, updateQuantity, updateStyle, removeProductFromBuild,
    cloneBuild,
  } = useFleetBuilds();
  const { saveTemplateFromBuild } = useFleetTemplates();
  const [cloneSourceBuild, setCloneSourceBuild] = useState(null);

  function handleSaveAsTemplate(build) {
    const template = saveTemplateFromBuild(build);
    if (!template) {
      toast({ title: 'Template limit reached', description: 'Delete a saved template to save another.' });
      return;
    }
    toast({ title: 'Saved as template', description: `"${template.name}" is now available in Fleet Templates.` });
  }

  function handleCloneSubmit(destination) {
    if (!cloneSourceBuild) return;
    const result = cloneBuild(cloneSourceFromBuild(cloneSourceBuild), destination, getProductVerticalIds);
    setCloneSourceBuild(null);
    if (!result) {
      toast({ title: 'Fleet build limit reached', description: 'Remove a build to clone another.' });
      return;
    }
    toast(summarizeCompatibilityResult(result, `Cloned to "${destination.name}"`));
  }

  return (
    <div data-testid="fleet-builds-panel">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <p style={{ ...FS, fontSize: 12, color: '#666', lineHeight: 1.6, margin: 0, maxWidth: 380 }}>
          Create a build per vehicle spec, then switch between them while you shop — each tracks its own upfit progress.
        </p>
        <button
          type="button"
          onClick={addBuild}
          disabled={isFull}
          style={{
            ...FS, flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#fff',
            background: isFull ? '#e5e5e5' : '#c8102e', border: 'none', borderRadius: 2,
            padding: '9px 14px', cursor: isFull ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
          }}
        >
          <Plus size={14} /> Add Build
        </button>
      </div>

      {builds.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', border: '1.5px dashed #d0d0d0' }}>
          <LayoutGrid size={22} style={{ color: '#bbb', marginBottom: 10 }} />
          <p style={{ ...FS, fontSize: 13, color: '#888', marginBottom: 14 }}>
            No fleet builds yet. Add your first build to start planning upfits across your fleet.
          </p>
          <button
            type="button"
            onClick={addBuild}
            style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#fff', background: '#c8102e', border: 'none', padding: '10px 18px', cursor: 'pointer' }}
          >
            Add Your First Build
          </button>
        </div>
      ) : (
        <div>
          {builds.map((build) => (
            <FleetBuildCard
              key={build.id}
              build={build}
              isActive={build.id === activeBuildId}
              onSetActive={() => setActiveBuild(build.id)}
              onRemove={() => removeBuild(build.id)}
              onRename={(name) => renameBuild(build.id, name)}
              onUpdateVehicle={(vehicle) => updateVehicle(build.id, vehicle)}
              onUpdateQuantity={(quantity) => updateQuantity(build.id, quantity)}
              onUpdateStyle={(styleId) => updateStyle(build.id, styleId)}
              onRemoveProduct={(categoryId, productId) => removeProductFromBuild(build.id, categoryId, productId)}
              onSaveAsTemplate={() => handleSaveAsTemplate(build)}
              onCloneBuild={() => setCloneSourceBuild(build)}
            />
          ))}
          {isFull && (
            <p style={{ ...FS, fontSize: 11, color: '#999', textAlign: 'center', margin: 0 }}>
              You&apos;ve reached the {MAX_FLEET_BUILDS}-build limit for this workspace. Remove a build to add another.
            </p>
          )}
        </div>
      )}

      <FleetTemplatesSection />

      {cloneSourceBuild && (
        <CloneBuildDialog
          sourceLabel="Build"
          sourceName={cloneSourceBuild.name}
          sourceVehicle={cloneSourceBuild.vehicle}
          sourceQuantity={cloneSourceBuild.quantity}
          onClose={() => setCloneSourceBuild(null)}
          onClone={handleCloneSubmit}
        />
      )}
    </div>
  );
}
