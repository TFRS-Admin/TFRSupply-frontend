import React from 'react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const COLOR_STYLES = {
  red: { bg: '#fee2e2', fg: '#b91c1c', bar: '#dc2626' },
  yellow: { bg: '#fef3c7', fg: '#92400e', bar: '#d97706' },
  green: { bg: '#dcfce7', fg: '#166534', bar: '#16a34a' },
};

/**
 * Shared completion pill + progress bar — red/yellow/green per
 * FleetBuildCompletion.color. `compact` hides the progress bar for tight
 * layouts (workspace summary rows).
 */
export default function FleetBuildCompletionBadge({ completion, compact = false }) {
  const colors = COLOR_STYLES[completion.color] ?? COLOR_STYLES.red;

  return (
    <div style={{ ...FS, display: 'flex', alignItems: 'center', gap: 8, minWidth: compact ? undefined : 120 }}>
      <span
        data-testid="fleet-build-completion-pill"
        style={{
          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
          background: colors.bg, color: colors.fg, letterSpacing: '0.03em', whiteSpace: 'nowrap',
        }}
      >
        {completion.percent}% Complete
      </span>
      {!compact && (
        <div style={{ flex: 1, minWidth: 60, height: 6, background: '#eee', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${completion.percent}%`, height: '100%', background: colors.bar }} />
        </div>
      )}
    </div>
  );
}
