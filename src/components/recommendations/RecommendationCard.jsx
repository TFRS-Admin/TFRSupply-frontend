/**
 * components/recommendations/RecommendationCard.jsx
 * Vehicle Build Recommendations Engine — the one compact recommendation card
 * every integration surface (Guided Upfit Builder, Finish Your Upfit,
 * Product Search, Workspace) renders for a ProductRecommendation
 * (src/types/recommendations.ts). Mobile-safe: stacks to one column, tap
 * targets are at least 44px tall.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { resolveProductDetailPath } from '@/domain/catalog';
import { getUpfitCategoryLabel } from '@/domain/fleetBuilds';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const TYPE_STYLES = {
  required: { bg: '#fee2e2', fg: '#b91c1c', label: 'Required' },
  recommended: { bg: '#fef3c7', fg: '#92400e', label: 'Recommended' },
  optional: { bg: '#eef1f8', fg: '#1a2744', label: 'Optional' },
  replacement: { bg: '#fee2e2', fg: '#b91c1c', label: 'Replacement' },
  companion: { bg: '#e0f2fe', fg: '#075985', label: 'Companion' },
  upgrade: { bg: '#ede9fe', fg: '#5b21b6', label: 'Upgrade' },
};

export function RecommendationTypeBadge({ type }) {
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.recommended;
  return (
    <span
      data-testid="recommendation-type-badge"
      style={{
        ...FS, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
        background: style.bg, color: style.fg, whiteSpace: 'nowrap',
      }}
    >
      {style.label}
    </span>
  );
}

/** Mobile-safe grid shell — one column on phones, up to three on desktop, never horizontal overflow. */
export function RecommendationCardGrid({ children }) {
  return <div className="recommendation-card-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{children}</div>;
}

export default function RecommendationCard({ recommendation, product, onAddToBuild, addLabel = 'Add to Build' }) {
  const href = resolveProductDetailPath(product);
  const categoryLabel = recommendation.matchingCategoryId ? getUpfitCategoryLabel(recommendation.matchingCategoryId) : null;

  return (
    <div
      className="recommendation-card"
      data-testid="recommendation-card"
      style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <p style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{product.title ?? product.label ?? product.id}</p>
        <RecommendationTypeBadge type={recommendation.recommendationType} />
      </div>

      {categoryLabel && (
        <p style={{ ...FS, fontSize: 11, color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{categoryLabel}</p>
      )}

      {recommendation.reasons.length > 0 && (
        <ul style={{ ...FS, fontSize: 12, color: '#555', lineHeight: 1.6, margin: 0, paddingLeft: '1.1rem' }}>
          {recommendation.reasons.map((reason) => <li key={reason}>{reason}</li>)}
        </ul>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 8 }}>
        {href && (
          <Link
            to={href}
            style={{
              ...FS, fontSize: 12, fontWeight: 700, color: '#1a2744', border: '2px solid #1a2744',
              padding: '8px 12px', minHeight: 44, display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            }}
          >
            View Product
          </Link>
        )}
        {onAddToBuild && (
          <button
            type="button"
            onClick={() => onAddToBuild(product, recommendation)}
            style={{
              ...FS, fontSize: 12, fontWeight: 700, color: '#fff', background: '#c8102e', border: 'none',
              padding: '8px 12px', minHeight: 44, cursor: 'pointer',
            }}
          >
            {addLabel}
          </button>
        )}
      </div>
    </div>
  );
}
