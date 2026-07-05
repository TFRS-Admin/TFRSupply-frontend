/**
 * components/procurementPackages/PackageSummaryCard.jsx
 * One procurement package's summary card — Package Name, Department,
 * Vehicles, Equipment Count, Completion, Readiness, Missing Equipment,
 * Recommended Additions — expandable to Package Contents (Vehicle Types,
 * Products/Grouped Quantities, Required/Recommended/Optional Equipment) and
 * a per-package Export Preview. Pure, props-driven; every field is read from
 * the already-computed ProcurementPackage/PackageContents
 * (src/domain/procurementPackages).
 */
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import FleetBuildCompletionBadge from '@/components/fleetBuilds/FleetBuildCompletionBadge';
import QuoteStat, { quoteStatLabelStyle } from '@/components/fleetQuote/QuoteStat';
import RecommendationCard, { RecommendationCardGrid } from '@/components/recommendations/RecommendationCard';
import PackageReadinessBadge from './PackageReadinessBadge';
import PackageContentsPanel from './PackageContentsPanel';
import ProcurementExportPreviewSection from './ProcurementExportPreviewSection';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function completionColorFromPercent(percent) {
  return percent >= 100 ? 'green' : percent > 0 ? 'yellow' : 'red';
}

export default function PackageSummaryCard({
  pkg, contents, expanded, onToggleExpand,
  selected, onToggleSelected, selectionDisabled,
  exportPreview, notes, onChangeNotes,
  onAddRecommendedProduct,
}) {
  const completion = { percent: pkg.completionPercent, color: completionColorFromPercent(pkg.completionPercent) };
  const missingCount = pkg.missingEquipment.critical.length + pkg.missingEquipment.recommended.length + pkg.missingEquipment.optional.length;

  return (
    <div data-testid="package-summary-card" data-package-id={pkg.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '18px 20px', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <p style={{ ...FS, fontSize: 16, fontWeight: 800, color: '#1a2744', margin: '0 0 4px' }}>{pkg.name}</p>
          <p style={{ ...FS, fontSize: 12, color: '#666', margin: 0 }}>{pkg.departmentLabel}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ ...FS, fontSize: 12, color: '#444', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: selectionDisabled ? 'not-allowed' : 'pointer' }}>
            <input
              type="checkbox"
              checked={selected}
              disabled={selectionDisabled}
              onChange={onToggleSelected}
              data-testid="package-compare-checkbox"
            />
            Compare
          </label>
          <button
            type="button"
            onClick={onToggleExpand}
            data-testid="package-summary-card-toggle"
            style={{
              ...FS, fontSize: 12, fontWeight: 700, color: '#1a2744', background: 'none', border: '1.5px solid #1a2744',
              borderRadius: 2, padding: '6px 10px', minHeight: 36, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {expanded ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>

      <div className="package-summary-card-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" style={{ marginBottom: 14 }}>
        <QuoteStat label="Vehicles" value={pkg.vehicleCount} />
        <QuoteStat label="Equipment Count" value={pkg.equipmentCount} />
        <div>
          <p style={quoteStatLabelStyle}>Completion</p>
          <FleetBuildCompletionBadge completion={completion} compact />
        </div>
        <div>
          <p style={quoteStatLabelStyle}>Readiness</p>
          <PackageReadinessBadge readiness={pkg.readiness} compact showReasons={false} />
        </div>
        <QuoteStat label="Recommended Additions" value={pkg.recommendedAdditions.length} />
      </div>

      <div style={{ marginBottom: expanded ? 14 : 0 }}>
        <p style={{ ...quoteStatLabelStyle, color: missingCount > 0 ? '#b91c1c' : '#999' }}>Missing Equipment</p>
        {missingCount > 0 ? (
          <p style={{ ...FS, fontSize: 13, color: '#666', margin: 0 }}>
            {pkg.missingEquipment.critical.length} critical · {pkg.missingEquipment.recommended.length} recommended · {pkg.missingEquipment.optional.length} optional
          </p>
        ) : (
          <p style={{ ...FS, fontSize: 13, color: '#16a34a', margin: 0 }}>Nothing missing.</p>
        )}
      </div>

      {pkg.readiness.reasons.length > 0 && (
        <div style={{ marginBottom: expanded ? 14 : 0 }}>
          <ul style={{ ...FS, margin: 0, padding: '0 0 0 18px', fontSize: 12, color: '#666', lineHeight: 1.7 }}>
            {pkg.readiness.reasons.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
        </div>
      )}

      {expanded && (
        <>
          <PackageContentsPanel contents={contents} />

          <div style={{ borderTop: '1px solid #eee', marginTop: 16, paddingTop: 16 }}>
            <p style={quoteStatLabelStyle}>Recommended Additions</p>
            {pkg.recommendedAdditions.length > 0 ? (
              <RecommendationCardGrid>
                {pkg.recommendedAdditions.map(({ recommendation, product }) => (
                  <RecommendationCard
                    key={product.id}
                    recommendation={recommendation}
                    product={product}
                    onAddToBuild={onAddRecommendedProduct ? (addedProduct, addedRecommendation) => onAddRecommendedProduct(pkg, addedProduct, addedRecommendation) : undefined}
                    addLabel="Add to Package"
                  />
                ))}
              </RecommendationCardGrid>
            ) : (
              <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>No additional recommendations right now.</p>
            )}
          </div>

          <ProcurementExportPreviewSection preview={exportPreview} notes={notes} onChangeNotes={onChangeNotes} />
        </>
      )}
    </div>
  );
}
