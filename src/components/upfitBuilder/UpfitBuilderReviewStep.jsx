/**
 * components/upfitBuilder/UpfitBuilderReviewStep.jsx
 * Final guided step — Missing Equipment Summary (required/recommended still
 * outstanding, optional categories explicitly skipped) and the hand-off to
 * Cart or a Quote request. No new cart/quote logic: "Continue to Cart" links
 * to the existing /cart route and "Request a Quote" reuses the same
 * mailto:appConfig.quoteRecipientEmail pattern CommerceActionPanel/
 * WorkspaceDashboard already use.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingCart } from 'lucide-react';
import { getUpfitCategoryLabel } from '@/domain/fleetBuilds';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function MissingList({ title, categoryIds, tone, onGoToStep }) {
  if (categoryIds.length === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px' }}>{title}</p>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {categoryIds.map((categoryId) => (
          <li key={categoryId}>
            <button
              type="button"
              onClick={() => onGoToStep(categoryId)}
              style={{ ...FS, fontSize: 12, fontWeight: 700, color: tone, background: 'none', border: `1.5px solid ${tone}`, borderRadius: 999, padding: '4px 10px', cursor: 'pointer' }}
            >
              {getUpfitCategoryLabel(categoryId)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function UpfitBuilderReviewStep({ build, checklist, onGoToStep, quoteRecipientEmail, onBack }) {
  const nothingMissing = checklist.missingRequired.length === 0 && checklist.missingRecommended.length === 0;

  return (
    <div
      className="upfit-builder-step-panel"
      data-testid="upfit-builder-review-step"
      style={{ ...FS, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '20px 22px', flex: 1, minWidth: 0 }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2744', margin: '0 0 6px' }}>Review Missing Equipment</h2>
      <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: '0 0 18px', maxWidth: 560 }}>
        {build ? `Here's where "${build.name}" stands before you move on to Cart or a Quote.` : 'Select a Fleet Build to see its readiness.'}
      </p>

      <div style={{ marginBottom: 20 }}>
        <span
          data-testid="upfit-builder-review-percent"
          style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: checklist.overallPercent >= 100 ? '#dcfce7' : '#fef3c7', color: checklist.overallPercent >= 100 ? '#166534' : '#92400e' }}
        >
          {checklist.overallPercent}% Complete
        </span>
      </div>

      {nothingMissing ? (
        <p style={{ fontSize: 14, color: '#16a34a', fontWeight: 700, marginBottom: 20 }}>
          Nothing missing — this build is ready for Cart or a Quote.
        </p>
      ) : (
        <>
          <MissingList title="Missing Required Equipment" categoryIds={checklist.missingRequired} tone="#b91c1c" onGoToStep={onGoToStep} />
          <MissingList title="Missing Recommended Equipment" categoryIds={checklist.missingRecommended} tone="#92400e" onGoToStep={onGoToStep} />
        </>
      )}

      {checklist.skippedOptional.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px' }}>Skipped Optional Categories</p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {checklist.skippedOptional.map((categoryId) => (
              <li key={categoryId} style={{ fontSize: 12, color: '#666', background: '#f4f5f7', padding: '4px 10px', borderRadius: 999 }}>
                {getUpfitCategoryLabel(categoryId)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', borderTop: '1px solid #eee', paddingTop: 16 }}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#1a2744', background: 'none', border: '2px solid #1a2744', padding: '10px 16px', minHeight: 44, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <div style={{ flex: 1 }} />
        <Link
          to="/cart"
          style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#1a2744', background: '#fff', border: '2px solid #1a2744', padding: '10px 16px', minHeight: 44, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <ShoppingCart size={14} /> Continue to Cart
        </Link>
        <a
          href={`mailto:${quoteRecipientEmail}?subject=${encodeURIComponent(`Quote Request${build ? ` — ${build.name}` : ''}`)}`}
          style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#fff', background: '#c8102e', padding: '12px 18px', minHeight: 44, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          Request a Quote <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}
