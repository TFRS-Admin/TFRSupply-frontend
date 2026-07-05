/**
 * components/workspace/RecommendedNextActionsSection.jsx
 * Vehicle Build Recommendations Engine — /workspace's "Recommended Next
 * Actions": for each fleet build with outstanding equipment, its missing
 * required categories plus its top scored product recommendations
 * (summarizeRecommendedNextActions), with a CTA back into the Guided Upfit
 * Builder/Fleet Builds and, via each recommendation card, straight into
 * product detail. Pure/presentational (props-driven), matching
 * WorkspaceFleetIntelligenceSection's convention of computing nothing itself.
 */
import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { getUpfitCategoryLabel } from '@/domain/fleetBuilds';
import RecommendationCard, { RecommendationCardGrid } from '@/components/recommendations/RecommendationCard';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function RecommendedNextActionsSection({ actions = [], hasFleetBuilds = false, onAddToBuild, onOpenFleetBuilds }) {
  return (
    <section style={{ marginBottom: 32 }} data-testid="workspace-recommended-next-actions-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <p style={{
          ...FS, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: '#1a2744', display: 'flex', alignItems: 'center', gap: 8, margin: 0,
        }}>
          <Sparkles size={14} /> Recommended Next Actions
        </p>
        {hasFleetBuilds && (
          <button
            type="button"
            onClick={onOpenFleetBuilds}
            style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#c8102e', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            Open Fleet Builds <ArrowRight size={12} />
          </button>
        )}
      </div>

      {!hasFleetBuilds ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '24px 20px' }}>
          <p style={{ ...FS, fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>
            Start a fleet build and assign a department standard to see recommended next actions here.
          </p>
        </div>
      ) : actions.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '24px 20px' }}>
          <p style={{ ...FS, fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>
            Nothing outstanding — every fleet build is fully equipped right now.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {actions.map((action) => (
            <div
              key={action.buildId}
              style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '18px 20px' }}
              data-testid="recommended-next-action-build"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                <p style={{ ...FS, fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{action.buildName}</p>
                <button
                  type="button"
                  onClick={onOpenFleetBuilds}
                  style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#1a2744', background: 'none', border: '1.5px solid #1a2744', borderRadius: 2, padding: '6px 10px', cursor: 'pointer' }}
                >
                  Continue in Guided Builder
                </button>
              </div>

              {action.missingRequiredCategories.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }} data-testid="recommended-next-action-missing-required">
                  {action.missingRequiredCategories.map((categoryId) => (
                    <span key={categoryId} style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c', background: '#fee2e2', padding: '3px 8px', borderRadius: 999 }}>
                      Missing {getUpfitCategoryLabel(categoryId)}
                    </span>
                  ))}
                </div>
              )}

              {action.recommendations.length > 0 && (
                <RecommendationCardGrid>
                  {action.recommendations.map(({ recommendation, product }) => (
                    <RecommendationCard
                      key={product.id}
                      recommendation={recommendation}
                      product={product}
                      onAddToBuild={(addedProduct, rec) => onAddToBuild(action.buildId, addedProduct, rec)}
                      addLabel="Add to Build"
                    />
                  ))}
                </RecommendationCardGrid>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
