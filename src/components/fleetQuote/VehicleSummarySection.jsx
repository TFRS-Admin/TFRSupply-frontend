/**
 * components/fleetQuote/VehicleSummarySection.jsx
 * "Vehicle Summary" — one VehicleQuoteCard per Fleet Build in the active
 * project, each independently expandable. Owns the expand/collapse state
 * itself so ProjectQuotePage stays a thin composition layer.
 */
import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import SectionHeading from '@/components/product/SectionHeading';
import VehicleQuoteCard from './VehicleQuoteCard';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function VehicleSummarySection({ vehicles, onAddRecommendedProduct }) {
  const [expandedBuildId, setExpandedBuildId] = useState(null);

  return (
    <section style={{ marginBottom: 32 }} data-testid="vehicle-summary-section">
      <SectionHeading icon={Truck}>{`Vehicle Summary (${vehicles.length})`}</SectionHeading>

      {vehicles.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '24px 20px' }}>
          <p style={{ ...FS, fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>
            No fleet builds in this project yet. Add a vehicle from Fleet Builds to see it here.
          </p>
        </div>
      ) : (
        <div className="vehicle-summary-grid grid grid-cols-1 lg:grid-cols-2 gap-4">
          {vehicles.map((vehicle) => (
            <VehicleQuoteCard
              key={vehicle.buildId}
              vehicle={vehicle}
              expanded={expandedBuildId === vehicle.buildId}
              onToggleExpand={() => setExpandedBuildId((current) => (current === vehicle.buildId ? null : vehicle.buildId))}
              onAddRecommendedProduct={onAddRecommendedProduct}
            />
          ))}
        </div>
      )}
    </section>
  );
}
