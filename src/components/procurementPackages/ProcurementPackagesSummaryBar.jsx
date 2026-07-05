/**
 * components/procurementPackages/ProcurementPackagesSummaryBar.jsx
 * /procurement's top summary row — Package Count and a readiness breakdown
 * (Ready/Minor Issues/Needs Review/Blocked). Pure, props-driven — reads only
 * from the already-computed ProcurementPackagesSummary
 * (src/domain/procurementPackages/summarize.ts).
 */
import React from 'react';
import { Boxes } from 'lucide-react';
import QuoteStat from '@/components/fleetQuote/QuoteStat';

export default function ProcurementPackagesSummaryBar({ summary }) {
  const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

  return (
    <div
      data-testid="procurement-packages-summary-bar"
      style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '18px 20px', marginBottom: 28 }}
    >
      <p style={{
        ...FS, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
        color: '#1a2744', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 14px',
      }}>
        <Boxes size={14} /> Procurement Packages
      </p>
      <div className="procurement-summary-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <QuoteStat label="Package Count" value={summary.packageCount} />
        <QuoteStat label="Ready" value={summary.readyCount} />
        <QuoteStat label="Minor Issues" value={summary.minorIssuesCount} />
        <QuoteStat label="Needs Review" value={summary.needsReviewCount} />
        <QuoteStat label="Blocked" value={summary.blockedCount} />
      </div>
    </div>
  );
}
