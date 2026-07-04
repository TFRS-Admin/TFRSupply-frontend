/**
 * components/fleetBuilds/FleetBuildsWorkspaceSection.jsx
 * /workspace section — active fleet builds, completion colors, selected
 * vehicle/build style, and missing categories, with a CTA that opens the
 * Fleet Builds tab directly. Pure/presentational (props-driven), matching
 * WorkspaceDashboardView's existing convention of resolving context state in
 * the connected WorkspaceDashboard wrapper rather than inside each section.
 */
import React from 'react';
import { Truck, ArrowRight } from 'lucide-react';
import { calculateFleetBuildCompletion, getBuildStyleLabel, getUpfitCategoryLabel } from '@/domain/fleetBuilds';
import FleetBuildCompletionBadge from './FleetBuildCompletionBadge';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function FleetBuildSummaryRow({ build }) {
  const completion = calculateFleetBuildCompletion(build);

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: '12px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <p style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{build.name}</p>
        <FleetBuildCompletionBadge completion={completion} compact />
      </div>
      <p style={{ ...FS, fontSize: 12, color: '#666', margin: '0 0 4px' }}>
        {build.vehicle ? `${build.vehicle.year} ${build.vehicle.make} ${build.vehicle.model}` : 'No vehicle selected'}
        {' · '}{getBuildStyleLabel(build.buildStyle)}{' · Qty '}{build.quantity}
      </p>
      {completion.missingCategories.length > 0 && (
        <p style={{ ...FS, fontSize: 12, color: '#888', margin: 0 }}>
          Missing: {completion.missingCategories.map(getUpfitCategoryLabel).join(', ')}
        </p>
      )}
    </div>
  );
}

export default function FleetBuildsWorkspaceSection({ builds, onOpenFleetBuilds }) {
  return (
    <section style={{ marginBottom: 32 }} data-testid="fleet-builds-workspace-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <p style={{
          ...FS, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: '#1a2744', display: 'flex', alignItems: 'center', gap: 8, margin: 0,
        }}>
          <Truck size={14} /> Fleet Builds
        </p>
        <button
          type="button"
          onClick={onOpenFleetBuilds}
          style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#c8102e', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          Open Fleet Builds <ArrowRight size={12} />
        </button>
      </div>

      {builds.length > 0 ? (
        <div className="workspace-fleet-builds-grid grid grid-cols-1 md:grid-cols-2 gap-3">
          {builds.map((build) => <FleetBuildSummaryRow key={build.id} build={build} />)}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '24px 20px' }}>
          <p style={{ ...FS, fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>
            No fleet builds yet. Start one to plan upfits across multiple vehicles at once.
          </p>
          <button
            type="button"
            onClick={onOpenFleetBuilds}
            style={{ ...FS, marginTop: 12, fontSize: 12, fontWeight: 700, color: '#fff', background: '#c8102e', border: 'none', padding: '9px 16px', cursor: 'pointer' }}
          >
            Start a Fleet Build
          </button>
        </div>
      )}
    </section>
  );
}
