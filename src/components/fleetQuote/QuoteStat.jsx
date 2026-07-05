import React from 'react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export const quoteStatLabelStyle = {
  ...FS, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: '0 0 4px',
};

/** Shared label/value stat block reused across every Fleet Quote Builder section (mirrors ProjectSummaryCard/WorkspaceFleetIntelligenceSection's Stat convention). */
export default function QuoteStat({ label, value }) {
  return (
    <div>
      <p style={quoteStatLabelStyle}>{label}</p>
      <p style={{ ...FS, fontSize: 18, fontWeight: 800, color: '#1a2744', margin: 0 }}>{value}</p>
    </div>
  );
}
