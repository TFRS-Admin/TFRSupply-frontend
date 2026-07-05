/**
 * components/fleetQuote/ProjectTotalsSection.jsx
 * "Project Totals" — Total Vehicles, Total Line Items, Total Equipment
 * Pieces, Completion %, Required/Recommended Equipment Remaining. No
 * pricing, no taxes — see src/domain/fleetQuote/projectTotals.ts.
 */
import React from 'react';
import { Calculator } from 'lucide-react';
import SectionHeading from '@/components/product/SectionHeading';
import QuoteStat from './QuoteStat';

export default function ProjectTotalsSection({ totals }) {
  return (
    <section style={{ marginBottom: 32 }} data-testid="project-totals-section">
      <SectionHeading icon={Calculator}>Project Totals</SectionHeading>
      <div
        className="project-totals-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '18px 20px' }}
      >
        <QuoteStat label="Total Vehicles" value={totals.totalVehicles} />
        <QuoteStat label="Total Line Items" value={totals.totalLineItems} />
        <QuoteStat label="Total Equipment Pieces" value={totals.totalEquipmentPieces} />
        <QuoteStat label="Completion %" value={`${totals.completionPercent}%`} />
        <QuoteStat label="Required Remaining" value={totals.requiredEquipmentRemaining} />
        <QuoteStat label="Recommended Remaining" value={totals.recommendedEquipmentRemaining} />
      </div>
    </section>
  );
}
