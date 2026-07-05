/**
 * components/departmentStandards/DepartmentStandardBadge.jsx
 * Shared presentation helpers for Department Standards / Fleet Intelligence
 * surfaces — a tier chip (Required/Recommended/Optional) and an adapter that
 * turns a FleetBuildIntelligence report into the same {percent,color} shape
 * FleetBuildCompletionBadge already renders, so the completion pill/progress
 * bar UI is never re-implemented for department-standard scoring.
 */
import React from 'react';
import StatusBadge from '@/components/design-system/StatusBadge';

const TIER_LABEL = {
  required: 'Required',
  recommended: 'Recommended',
  optional: 'Optional',
};

/**
 * Renders through the shared StatusBadge primitive (design-system/
 * StatusBadge) so Required/Recommended/Optional match the same
 * danger/warning/neutral colors used by every other status pill.
 */
export function StandardTierChip({ tier, compact = false }) {
  return (
    <StatusBadge
      status={tier}
      label={TIER_LABEL[tier] ?? TIER_LABEL.optional}
      compact={compact}
    />
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
