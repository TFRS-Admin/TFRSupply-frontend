/**
 * components/fleetProjects/ProjectSummaryCard.jsx
 * Fleet Builder's "Project Summary" card — a read-only snapshot of the
 * active Fleet Project's plan: vehicle count, estimated total products,
 * completed vs. incomplete builds, how many builds came from a template, and
 * which build styles are in play. No pricing — estimatedProductCount
 * (from summarizeFleetProject) counts selected line items, never $ amounts.
 */
import React from 'react';
import { ClipboardList } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function Stat({ label, value }) {
  return (
    <div>
      <p style={{ ...FS, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: '0 0 4px' }}>{label}</p>
      <p style={{ ...FS, fontSize: 20, fontWeight: 800, color: '#1a2744', margin: 0 }}>{value}</p>
    </div>
  );
}

export default function ProjectSummaryCard({ projectName, summary }) {
  return (
    <div data-testid="project-summary-card" style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: '16px 18px', marginBottom: 20, background: '#f8f9fb' }}>
      <p style={{
        ...FS, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
        color: '#1a2744', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 14px',
      }}>
        <ClipboardList size={14} /> {`Project Summary — ${projectName}`}
      </p>
      <div className="project-summary-stats-grid grid grid-cols-2 sm:grid-cols-3 gap-4" style={{ marginBottom: summary.buildStyles.length > 0 ? 14 : 0 }}>
        <Stat label="Vehicles" value={summary.vehicleCount} />
        <Stat label="Estimated Products" value={summary.estimatedProductCount} />
        <Stat label="Completed Builds" value={summary.completedBuildCount} />
        <Stat label="Incomplete Builds" value={summary.incompleteBuildCount} />
        <Stat label="Template Usage" value={summary.templateUsageCount} />
      </div>
      {summary.buildStyles.length > 0 && (
        <div>
          <p style={{ ...FS, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: '0 0 6px' }}>Build Styles</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {summary.buildStyles.map((style) => (
              <span key={style.styleId} style={{ fontSize: 11, fontWeight: 700, color: '#1a2744', background: '#eef1f8', padding: '3px 8px', borderRadius: 999 }}>
                {`${style.label} × ${style.count}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
