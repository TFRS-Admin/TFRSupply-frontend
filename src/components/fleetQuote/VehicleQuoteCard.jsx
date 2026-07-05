/**
 * components/fleetQuote/VehicleQuoteCard.jsx
 * One Fleet Build's Vehicle Summary card: vehicle, department standard,
 * completion, quantity, estimated equipment count, recommendation status,
 * and missing required equipment — expandable to Installed Products/Missing
 * Products/Recommended Additions. Pure, props-driven.
 */
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import FleetBuildCompletionBadge from '@/components/fleetBuilds/FleetBuildCompletionBadge';
import RecommendationCard, { RecommendationCardGrid } from '@/components/recommendations/RecommendationCard';
import QuoteStat, { quoteStatLabelStyle } from './QuoteStat';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const RECOMMENDATION_STATUS_LABEL = {
  fully_equipped: 'Fully Equipped',
  has_recommendations: 'Recommendations Available',
  no_recommendations: 'No Recommendations Yet',
};

function completionColorFromPercent(percent) {
  return percent >= 100 ? 'green' : percent > 0 ? 'yellow' : 'red';
}

export default function VehicleQuoteCard({ vehicle, expanded, onToggleExpand, onAddRecommendedProduct }) {
  const completion = { percent: vehicle.completionPercent, color: completionColorFromPercent(vehicle.completionPercent) };

  return (
    <div data-testid="vehicle-quote-card" data-build-id={vehicle.buildId} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '16px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <p style={{ ...FS, fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>{vehicle.buildName}</p>
          <p style={{ ...FS, fontSize: 12, color: '#666', margin: 0 }}>{vehicle.vehicleLabel} · {vehicle.buildStyleLabel}</p>
        </div>
        <button
          type="button"
          onClick={onToggleExpand}
          data-testid="vehicle-quote-card-toggle"
          style={{
            ...FS, fontSize: 12, fontWeight: 700, color: '#1a2744', background: 'none', border: '1.5px solid #1a2744',
            borderRadius: 2, padding: '6px 10px', minHeight: 36, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {expanded ? 'Hide Details' : 'View Details'}
        </button>
      </div>

      <div className="vehicle-quote-card-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" style={{ marginBottom: 14 }}>
        <QuoteStat label="Department Standard" value={vehicle.departmentStandardName ?? 'Not Assigned'} />
        <QuoteStat label="Quantity" value={vehicle.quantity} />
        <QuoteStat label="Est. Equipment Count" value={vehicle.estimatedEquipmentCount} />
        <div>
          <p style={quoteStatLabelStyle}>Completion</p>
          <FleetBuildCompletionBadge completion={completion} compact />
        </div>
        <QuoteStat label="Recommendation Status" value={RECOMMENDATION_STATUS_LABEL[vehicle.recommendationStatus]} />
      </div>

      <div style={{ marginBottom: expanded ? 14 : 0 }}>
        <p style={{ ...quoteStatLabelStyle, color: vehicle.missingRequiredCategories.length > 0 ? '#b91c1c' : '#999' }}>Missing Required Equipment</p>
        {vehicle.missingRequiredCategories.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {vehicle.missingRequiredCategories.map((label) => (
              <span key={label} style={{ fontSize: 12, color: '#b91c1c', background: '#fee2e2', padding: '3px 9px', borderRadius: 999 }}>{label}</span>
            ))}
          </div>
        ) : (
          <p style={{ ...FS, fontSize: 13, color: '#16a34a', margin: 0 }}>Nothing missing.</p>
        )}
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #eee', paddingTop: 16 }} data-testid="vehicle-quote-card-expanded">
          <div className="vehicle-quote-card-expanded-grid grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: 18 }}>
            <div>
              <p style={quoteStatLabelStyle}>Installed Products</p>
              {vehicle.installedProducts.length > 0 ? (
                <ul style={{ ...FS, margin: 0, padding: '0 0 0 18px', fontSize: 13, color: '#444', lineHeight: 1.8 }}>
                  {vehicle.installedProducts.map((product) => (
                    <li key={`${product.categoryId}-${product.productId}`}>
                      {product.label} <span style={{ color: '#999' }}>({product.categoryLabel})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>Nothing installed yet.</p>
              )}
            </div>

            <div>
              <p style={quoteStatLabelStyle}>Missing Products</p>
              {vehicle.missingProducts.length > 0 ? (
                <ul style={{ ...FS, margin: 0, padding: '0 0 0 18px', fontSize: 13, lineHeight: 1.8 }}>
                  {vehicle.missingProducts.map((missing) => (
                    <li key={missing.categoryId} style={{ color: missing.tier === 'required' ? '#b91c1c' : missing.tier === 'recommended' ? '#92400e' : '#666' }}>
                      {missing.categoryLabel} <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>({missing.tier})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ ...FS, fontSize: 13, color: '#16a34a', margin: 0 }}>Nothing missing.</p>
              )}
            </div>
          </div>

          <div>
            <p style={quoteStatLabelStyle}>Recommended Additions</p>
            {vehicle.recommendedAdditions.length > 0 ? (
              <RecommendationCardGrid>
                {vehicle.recommendedAdditions.map(({ recommendation, product }) => (
                  <RecommendationCard
                    key={product.id}
                    recommendation={recommendation}
                    product={product}
                    onAddToBuild={onAddRecommendedProduct ? (addedProduct, addedRecommendation) => onAddRecommendedProduct(vehicle.buildId, addedProduct, addedRecommendation) : undefined}
                    addLabel="Add to Build"
                  />
                ))}
              </RecommendationCardGrid>
            ) : (
              <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>No additional recommendations right now.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
