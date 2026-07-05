import React from 'react';
import StatusBadge from '@/components/design-system/StatusBadge';
import { FS } from '@/components/design-system/tokens';

const LEVEL_TONE = {
  ready: 'success',
  minor_issues: 'warning',
  needs_review: 'info',
  blocked: 'danger',
};

/**
 * Shared readiness pill for the four Package Readiness levels
 * (src/domain/procurementPackages/packageReadiness.ts) — Ready/Minor
 * Issues/Needs Review/Blocked. Renders through the shared StatusBadge
 * primitive (design-system/StatusBadge) so its colors match every other
 * status pill in the app.
 */
export default function PackageReadinessBadge({ readiness, compact = false, showReasons = true }) {
  return (
    <div style={FS} data-testid="package-readiness-badge">
      <StatusBadge
        data-testid="package-readiness-pill"
        status={readiness.level}
        label={readiness.label}
        tone={LEVEL_TONE[readiness.level]}
        compact={compact}
      />
      {showReasons && readiness.reasons.length > 0 && (
        <ul className="mt-2 pl-4 text-xs text-gray-500 leading-[1.7] list-disc">
          {readiness.reasons.map((reason) => <li key={reason}>{reason}</li>)}
        </ul>
      )}
    </div>
  );
}
