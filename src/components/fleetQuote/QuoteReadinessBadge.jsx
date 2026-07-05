import React from 'react';
import StatusBadge from '@/components/design-system/StatusBadge';
import { FS } from '@/components/design-system/tokens';

const LEVEL_TONE = {
  ready: 'success',
  minor_issues: 'warning',
  incomplete: 'warning',
  blocked: 'danger',
};

/**
 * Shared readiness pill for the four Quote Readiness levels
 * (src/domain/fleetQuote/quoteReadiness.ts) — reused by the Project Summary
 * card, the Workspace Project Quote card, and the Guided Upfit Builder
 * Review step. Renders through the shared StatusBadge primitive
 * (design-system/StatusBadge) so its colors match every other status pill
 * in the app.
 */
export default function QuoteReadinessBadge({ readiness, compact = false, showReasons = true }) {
  return (
    <div style={FS} data-testid="quote-readiness-badge">
      <StatusBadge
        data-testid="quote-readiness-pill"
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
