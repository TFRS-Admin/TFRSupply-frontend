/**
 * components/workspace/WorkspaceFleetIntelligenceSection.jsx
 * /workspace top section — Feature 3 (Workspace Fleet Intelligence) and the
 * Fleet Health portion of Feature 8 (Workspace Command Center): an overall
 * fleet readiness bar plus Department Compliance / Vehicles Ready / In
 * Progress / Missing Equipment / Need Review cards and a Critical Missing
 * Equipment list, aggregated across every Fleet Project's builds via
 * summarizeFleetHealth. Pure/presentational (props-driven), matching
 * FleetBuildsWorkspaceSection's convention of computing derived data from raw
 * props rather than reading context directly.
 */
import React from 'react';
import { Gauge, ArrowRight } from 'lucide-react';
import { summarizeFleetHealth } from '@/domain/departmentStandards';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const HEALTH_COLORS = {
  red: { bg: '#fee2e2', fg: '#b91c1c', bar: '#dc2626' },
  yellow: { bg: '#fef3c7', fg: '#92400e', bar: '#d97706' },
  green: { bg: '#dcfce7', fg: '#166534', bar: '#16a34a' },
};

function Stat({ label, value }) {
  return (
    <div>
      <p style={{ ...FS, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: '0 0 4px' }}>{label}</p>
      <p style={{ ...FS, fontSize: 22, fontWeight: 800, color: '#1a2744', margin: 0 }}>{value}</p>
    </div>
  );
}

export default function WorkspaceFleetIntelligenceSection({ entries = [], onOpenFleetBuilds }) {
  if (entries.length === 0) {
    return (
      <section style={{ marginBottom: 32 }} data-testid="workspace-fleet-intelligence-section">
        <p style={{
          ...FS, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: '#1a2744', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px',
        }}>
          <Gauge size={14} /> Fleet Readiness
        </p>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '24px 20px' }}>
          <p style={{ ...FS, fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>
            No fleet builds yet. Start a fleet build and assign a department standard to see your fleet&apos;s readiness here.
          </p>
        </div>
      </section>
    );
  }

  const health = summarizeFleetHealth(entries);
  const colors = HEALTH_COLORS[health.color] ?? HEALTH_COLORS.red;

  return (
    <section style={{ marginBottom: 32 }} data-testid="workspace-fleet-intelligence-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <p style={{
          ...FS, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: '#1a2744', display: 'flex', alignItems: 'center', gap: 8, margin: 0,
        }}>
          <Gauge size={14} /> Fleet Readiness
        </p>
        <button
          type="button"
          onClick={onOpenFleetBuilds}
          style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#c8102e', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          Open Fleet Builds <ArrowRight size={12} />
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '18px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
          <span
            data-testid="workspace-fleet-readiness-percent"
            style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999, background: colors.bg, color: colors.fg }}
          >
            {health.overallCompletionPercent}%
          </span>
          <p style={{ ...FS, fontSize: 13, color: '#666', margin: 0 }}>
            {health.vehicleCount} Vehicle{health.vehicleCount === 1 ? '' : 's'}
            {' · '}{health.vehiclesReady} Complete
            {' · '}{health.vehiclesInProgress + health.vehiclesMissingEquipment} Missing Equipment
            {' · '}{health.vehiclesNeedReview} Need Review
          </p>
        </div>
        <div style={{ height: 8, background: '#eee', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${health.overallCompletionPercent}%`, height: '100%', background: colors.bar }} />
        </div>
      </div>

      <div className="workspace-fleet-intelligence-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" style={{ marginBottom: health.criticalGaps.length > 0 ? 16 : 0 }}>
        <Stat label="Department Compliance" value={`${health.departmentCompliancePercent}%`} />
        <Stat label="Vehicles Ready" value={health.vehiclesReady} />
        <Stat label="Vehicles In Progress" value={health.vehiclesInProgress} />
        <Stat label="Vehicles Missing Equipment" value={health.vehiclesMissingEquipment} />
        <Stat label="Vehicles Need Review" value={health.vehiclesNeedReview} />
      </div>

      {health.criticalGaps.length > 0 && (
        <div data-testid="workspace-fleet-critical-missing">
          <p style={{ ...FS, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: '0 0 8px' }}>
            Critical Missing Equipment
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {health.criticalGaps.map((gap) => (
              <span key={gap.categoryId} style={{ fontSize: 12, color: '#b91c1c', background: '#fee2e2', padding: '4px 10px', borderRadius: 999 }}>
                {gap.vehicleCount} Vehicle{gap.vehicleCount === 1 ? '' : 's'} Missing {gap.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
