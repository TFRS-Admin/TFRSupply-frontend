import React from 'react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * Shared readiness pill for the four Quote Readiness levels
 * (src/domain/fleetQuote/quoteReadiness.ts) — reused by the Project Summary
 * card, the Workspace Project Quote card, and the Guided Upfit Builder
 * Review step.
 */
export const QUOTE_READINESS_COLORS = {
  ready: { bg: '#dcfce7', fg: '#166534' },
  minor_issues: { bg: '#fef3c7', fg: '#92400e' },
  incomplete: { bg: '#ffedd5', fg: '#c2410c' },
  blocked: { bg: '#fee2e2', fg: '#b91c1c' },
};

export default function QuoteReadinessBadge({ readiness, compact = false, showReasons = true }) {
  const colors = QUOTE_READINESS_COLORS[readiness.level] ?? QUOTE_READINESS_COLORS.blocked;

  return (
    <div style={FS} data-testid="quote-readiness-badge">
      <span
        data-testid="quote-readiness-pill"
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
