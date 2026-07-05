import React from 'react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * Shared readiness pill for the four Package Readiness levels
 * (src/domain/procurementPackages/packageReadiness.ts) — Ready/Minor
 * Issues/Needs Review/Blocked. Distinct color map from
 * src/components/fleetQuote/QuoteReadinessBadge.jsx since the level sets
 * differ ("needs_review" here vs. "incomplete" there).
 */
export const PACKAGE_READINESS_COLORS = {
  ready: { bg: '#dcfce7', fg: '#166534' },
  minor_issues: { bg: '#fef3c7', fg: '#92400e' },
  needs_review: { bg: '#e0e7ff', fg: '#3730a3' },
  blocked: { bg: '#fee2e2', fg: '#b91c1c' },
};

export default function PackageReadinessBadge({ readiness, compact = false, showReasons = true }) {
  const colors = PACKAGE_READINESS_COLORS[readiness.level] ?? PACKAGE_READINESS_COLORS.blocked;

  return (
    <div style={FS} data-testid="package-readiness-badge">
      <span
        data-testid="package-readiness-pill"
        style={{
          fontSize: compact ? 11 : 13, fontWeight: 700, padding: compact ? '2px 8px' : '4px 12px',
          borderRadius: 999, background: colors.bg, color: colors.fg, whiteSpace: 'nowrap', display: 'inline-block',
        }}
      >
        {readiness.label}
      </span>
      {showReasons && readiness.reasons.length > 0 && (
        <ul style={{ margin: '8px 0 0', padding: '0 0 0 16px', fontSize: 12, color: '#666', lineHeight: 1.7 }}>
          {readiness.reasons.map((reason) => <li key={reason}>{reason}</li>)}
        </ul>
      )}
    </div>
  );
}
