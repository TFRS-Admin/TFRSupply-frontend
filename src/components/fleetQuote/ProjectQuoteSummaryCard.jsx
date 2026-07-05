/**
 * components/fleetQuote/ProjectQuoteSummaryCard.jsx
 * Project Summary block for /project-quote: Project Name, Department, Fleet
 * Health, Vehicle Count, Completion %, Quote Status, Last Updated. Pure,
 * props-driven — reads only from the already-computed ProjectQuoteSummary
 * (src/domain/fleetQuote/projectQuoteSummary.ts).
 */
import React from 'react';
import { ClipboardList } from 'lucide-react';
import QuoteStat from './QuoteStat';
import QuoteReadinessBadge from './QuoteReadinessBadge';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const HEALTH_COLORS = {
  red: { bg: '#fee2e2', fg: '#b91c1c' },
  yellow: { bg: '#fef3c7', fg: '#92400e' },
  green: { bg: '#dcfce7', fg: '#166534' },
};

const HEALTH_LABELS = { red: 'Needs Attention', yellow: 'In Progress', green: 'On Track' };

function formatDate(timestamp) {
  if (!timestamp) return 'Never';
  return new Date(timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ProjectQuoteSummaryCard({ summary }) {
  const healthColors = HEALTH_COLORS[summary.fleetHealthColor] ?? HEALTH_COLORS.red;

  return (
    <div data-testid="project-quote-summary-card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '20px 22px', marginBottom: 28 }}>
      <p style={{
        ...FS, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
        color: '#1a2744', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 4px',
      }}>
        <ClipboardList size={14} /> Project Summary
      </p>
      <h1 style={{ ...FS, fontSize: 'clamp(1.3rem,3vw,1.7rem)', fontWeight: 900, color: '#1a2744', margin: '0 0 18px' }}>
        {summary.projectName}
      </h1>

      <div className="project-quote-summary-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <QuoteStat label="Department" value={summary.departmentLabel} />
        <div>
          <p style={{ ...FS, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: '0 0 4px' }}>Fleet Health</p>
          <span
            data-testid="project-quote-fleet-health-pill"
            style={{ fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: healthColors.bg, color: healthColors.fg }}
          >
            {HEALTH_LABELS[summary.fleetHealthColor] ?? HEALTH_LABELS.red}
          </span>
        </div>
        <QuoteStat label="Vehicle Count" value={summary.vehicleCount} />
        <QuoteStat label="Completion %" value={`${summary.completionPercent}%`} />
        <div>
          <p style={{ ...FS, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: '0 0 4px' }}>Quote Status</p>
          <QuoteReadinessBadge readiness={summary.quoteStatus} compact showReasons={false} />
        </div>
        <QuoteStat label="Last Updated" value={formatDate(summary.lastUpdated)} />
      </div>

      {summary.quoteStatus.reasons.length > 0 && (
        <div style={{ borderTop: '1px solid #eee', marginTop: 18, paddingTop: 14 }}>
          <p style={{ ...FS, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: '0 0 8px' }}>Readiness Notes</p>
          <ul style={{ ...FS, margin: 0, padding: '0 0 0 18px', fontSize: 13, color: '#666', lineHeight: 1.8 }}>
            {summary.quoteStatus.reasons.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
