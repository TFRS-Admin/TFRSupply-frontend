/**
 * components/upfitBuilder/GuidedUpfitBuilderWorkspaceSection.jsx
 * /workspace shortcut into the Guided Upfit Builder — the active Fleet
 * Build's guided progress (overall percent, next recommended step) and a
 * link into /upfit-builder. Pure/presentational, matching
 * FleetBuildsWorkspaceSection's convention of computing derived data from raw
 * props rather than reading context directly.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, ArrowRight } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function GuidedUpfitBuilderWorkspaceSection({ activeBuild, checklist, currentStepLabel }) {
  return (
    <section style={{ marginBottom: 32 }} data-testid="guided-upfit-builder-workspace-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <p style={{
          ...FS, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: '#1a2744', display: 'flex', alignItems: 'center', gap: 8, margin: 0,
        }}>
          <ListChecks size={14} /> Guided Upfit Builder
        </p>
        <Link
          to="/upfit-builder"
          style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#c8102e', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          {activeBuild ? 'Continue Guided Build' : 'Start Guided Build'} <ArrowRight size={12} />
        </Link>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '18px 20px' }}>
        {activeBuild && checklist ? (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <span
                data-testid="guided-upfit-workspace-percent"
                style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999, background: checklist.overallPercent >= 100 ? '#dcfce7' : '#fef3c7', color: checklist.overallPercent >= 100 ? '#166534' : '#92400e' }}
              >
                {checklist.overallPercent}%
              </span>
              <p style={{ ...FS, fontSize: 13, color: '#444', margin: 0 }}>
                <strong>{activeBuild.name}</strong> — next up: {currentStepLabel}
              </p>
            </div>
            <div style={{ height: 8, background: '#eee', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${checklist.overallPercent}%`, height: '100%', background: '#c8102e' }} />
            </div>
          </>
        ) : (
          <p style={{ ...FS, fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>
            Walk through a step-by-step build: pick a Fleet Project and Build, your vehicle, a Department Standard, and fill in each upfit category.
          </p>
        )}
      </div>
    </section>
  );
}
