/**
 * components/upfitBuilder/UpfitBuilderCategoryStep.jsx
 * One upfit-category step's panel — tier, completion state, the product(s)
 * already selected for this category, suggested catalog products, a Browse
 * CTA into Product Discovery, an Add-to-build action, and (optional tier
 * only) a Skip action. This is the "Upfit Steps" feature's per-step UI.
 */
import React from 'react';
import { X } from 'lucide-react';
import { resolveProductDetailPath } from '@/domain/catalog';
import ProductCard from '@/components/product/ProductCard';
import { StandardTierChip } from '@/components/departmentStandards/DepartmentStandardBadge';
import RecommendationCard, { RecommendationCardGrid } from '@/components/recommendations/RecommendationCard';
import UpfitBuilderStepPanelShell from './UpfitBuilderStepPanelShell';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const secondaryButtonStyle = {
  ...FS, fontSize: 12, fontWeight: 700, color: '#1a2744', background: '#fff', border: '2px solid #1a2744',
  padding: '9px 14px', minHeight: 40, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
};

const STATUS_COPY = {
  complete: 'Complete',
  missing: 'Not started',
  skipped: 'Skipped',
};

function SuggestedProductTile({ product, onAdd }) {
  return (
    <div data-testid="upfit-builder-suggested-product">
      <ProductCard
        id={product.id}
        href={resolveProductDetailPath(product)}
        label={product.title ?? product.label}
        image={product.media?.hero || product.images?.[0]?.src}
        tagline={product.subtitle}
        product={product}
      />
      <button
        type="button"
        onClick={() => onAdd(product)}
        style={{ ...FS, marginTop: 8, width: '100%', fontSize: 12, fontWeight: 700, color: '#fff', background: '#c8102e', border: 'none', padding: '9px 10px', minHeight: 40, cursor: 'pointer' }}
      >
        Add to This Build
      </button>
    </div>
  );
}

export default function UpfitBuilderCategoryStep({
  step, suggestedProducts = [], recommendations = [], browseHref, onAddProduct, onRemoveProduct, onSkip, onUnskip, onNext, onBack,
}) {
  return (
    <UpfitBuilderStepPanelShell
      title={step.label}
      onBack={onBack}
      onNext={onNext}
      nextLabel={step.status === 'complete' ? 'Continue' : 'Continue Anyway'}
      extraActions={step.canSkip && step.status !== 'complete' && (
        step.status === 'skipped'
          ? <button type="button" style={secondaryButtonStyle} onClick={onUnskip}>Unskip</button>
          : <button type="button" style={secondaryButtonStyle} onClick={onSkip}>Skip This Step</button>
      )}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <StandardTierChip tier={step.tier} />
        <span
          data-testid="upfit-builder-step-status"
          style={{ fontSize: 12, fontWeight: 700, color: step.status === 'complete' ? '#16a34a' : step.status === 'skipped' ? '#999' : '#b91c1c' }}
        >
          {STATUS_COPY[step.status] ?? step.status}
        </span>
      </div>

      {step.selectedProducts.length > 0 ? (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: '0 0 8px' }}>
            Selected for {step.label}
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {step.selectedProducts.map((item) => (
              <li key={item.productId} style={{ fontSize: 13, color: '#1a2744', background: '#f0f4ff', padding: '6px 10px', borderRadius: 2, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {item.label}
                <button
                  type="button"
                  onClick={() => onRemoveProduct(item.productId)}
                  aria-label={`Remove ${item.label} from ${step.label}`}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}
                >
                  <X size={12} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 16 }} data-testid="upfit-builder-missing-copy">
          {step.missingCopy}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: 0 }}>
          {recommendations.length > 0 ? 'Recommended Products' : 'Suggested Products'}
        </p>
        <a href={browseHref} style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#c8102e', textDecoration: 'underline' }}>
          Browse More {step.label} Products
        </a>
      </div>

      {recommendations.length > 0 ? (
        <RecommendationCardGrid>
          {recommendations.map(({ recommendation, product }) => (
            <RecommendationCard
              key={product.id}
              recommendation={recommendation}
              product={product}
              onAddToBuild={onAddProduct}
              addLabel="Add to This Build"
            />
          ))}
        </RecommendationCardGrid>
      ) : suggestedProducts.length > 0 ? (
        <div className="upfit-builder-suggested-grid grid grid-cols-2 sm:grid-cols-3 gap-3">
          {suggestedProducts.map((product) => (
            <SuggestedProductTile key={product.id} product={product} onAdd={onAddProduct} />
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: '#888' }}>No matching products found in the catalog yet — try Browse to search more broadly.</p>
      )}
    </UpfitBuilderStepPanelShell>
  );
}
