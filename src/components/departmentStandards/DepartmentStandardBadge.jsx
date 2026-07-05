/**
 * components/departmentStandards/DepartmentStandardBadge.jsx
 * Shared presentation helpers for Department Standards / Fleet Intelligence
 * surfaces — a tier chip (Required/Recommended/Optional) and an adapter that
 * turns a FleetBuildIntelligence report into the same {percent,color} shape
 * FleetBuildCompletionBadge already renders, so the completion pill/progress
 * bar UI is never re-implemented for department-standard scoring.
 */
import React from 'react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const TIER_STYLES = {
  required: { bg: '#fee2e2', fg: '#b91c1c', label: 'Required' },
  recommended: { bg: '#fef3c7', fg: '#92400e', label: 'Recommended' },
  optional: { bg: '#eef1f8', fg: '#1a2744', label: 'Optional' },
};

export function StandardTierChip({ tier, compact = false }) {
  const style = TIER_STYLES[tier] ?? TIER_STYLES.optional;
  return (
    <span style={{
      ...FS, fontSize: compact ? 10 : 11, fontWeight: 700, padding: compact ? '1px 6px' : '2px 8px',
      borderRadius: 999, background: style.bg, color: style.fg, whiteSpace: 'nowrap',
    }}>
      {style.label}
    </span>
  );
}

/**
 * Maps a Fleet Completion Engine report onto FleetBuildCompletionBadge's
 * `completion` prop shape: green when fully department-compliant, yellow
 * when something is installed but required equipment is still missing, red
 * when nothing against the standard has been installed yet.
 */
export function toStandardCompletionBadge(report) {
  const color = report.departmentCompliant
    ? 'green'
    : (report.requiredInstalled + report.recommendedInstalled + report.optionalInstalled) > 0 ? 'yellow' : 'red';
  return { percent: report.completionPercent, color };
}
