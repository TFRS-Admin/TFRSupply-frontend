/**
 * components/upfitBuilder/UpfitBuilderSummarySidebar.jsx
 * Desktop-only build summary — active project/build/vehicle/style, overall
 * completion, and a missing-equipment count. Desktop only (`hidden lg:block`);
 * the same data is folded into the Review step for mobile.
 */
import React from 'react';
import { getBuildStyleLabel } from '@/domain/fleetBuilds';
import FleetBuildCompletionBadge from '@/components/fleetBuilds/FleetBuildCompletionBadge';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function toCompletionBadge(checklist) {
  const anyInstalled = checklist.requiredComplete + checklist.recommendedComplete + checklist.optionalComplete > 0;
  const color = checklist.overallPercent >= 100 ? 'green' : anyInstalled ? 'yellow' : 'red';
  return { percent: checklist.overallPercent, color };
}

export default function UpfitBuilderSummarySidebar({ project, build, standardName, checklist }) {
  const missingCount = checklist ? checklist.missingRequired.length + checklist.missingRecommended.length : 0;

  return (
    <aside
      className="hidden lg:block"
      data-testid="upfit-builder-summary-sidebar"
      style={{ ...FS, width: 260, flexShrink: 0 }}
    >
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '16px 18px', position: 'sticky', top: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: '0 0 10px' }}>
          Build Summary
        </p>
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 2px' }}>Project</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: '0 0 10px' }}>{project ? project.name : 'None selected'}</p>

        <p style={{ fontSize: 12, color: '#888', margin: '0 0 2px' }}>Fleet Build</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: '0 0 10px' }}>{build ? build.name : 'None selected'}</p>

        {build && (
          <>
            <p style={{ fontSize: 12, color: '#888', margin: '0 0 2px' }}>Vehicle</p>
            <p style={{ fontSize: 13, color: '#444', margin: '0 0 10px' }}>
              {build.vehicle ? `${build.vehicle.year} ${build.vehicle.make} ${build.vehicle.model}` : 'Not selected yet'}
            </p>

            <p style={{ fontSize: 12, color: '#888', margin: '0 0 2px' }}>Build Style</p>
            <p style={{ fontSize: 13, color: '#444', margin: '0 0 10px' }}>{getBuildStyleLabel(build.buildStyle)}</p>

            <p style={{ fontSize: 12, color: '#888', margin: '0 0 2px' }}>Department Standard</p>
            <p style={{ fontSize: 13, color: '#444', margin: '0 0 14px' }}>{standardName ?? 'None assigned'}</p>
          </>
        )}

        {checklist && (
          <>
            <FleetBuildCompletionBadge completion={toCompletionBadge(checklist)} />
            <p style={{ fontSize: 12, color: missingCount > 0 ? '#b91c1c' : '#16a34a', margin: '10px 0 0' }} data-testid="upfit-builder-missing-count">
              {missingCount > 0 ? `${missingCount} categor${missingCount === 1 ? 'y' : 'ies'} still missing equipment` : 'Nothing missing — nice work.'}
            </p>
          </>
        )}
      </div>
    </aside>
  );
}
