import React from 'react';
import { Link } from 'react-router-dom';
import CompareToggleButton from '@/components/product/CompareToggleButton';
import SaveForLaterButton from '@/components/product/SaveForLaterButton';
import AddToAllCompatibleBuildsButton from '@/components/fleetBuilds/AddToAllCompatibleBuildsButton';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * Shared product discovery card. Accepts a display-ready view model rather
 * than a raw Product/CategoryProductCard so it can render results from both
 * catalogService.searchProducts() and the denormalized category product
 * cards without either caller reshaping its data to match the other.
 *
 * `product` (the full catalog Product, optional) only powers the Add to All
 * Compatible Builds overlay — callers rendering denormalized category cards
 * with no full Product record simply omit it and the overlay stays absent,
 * matching how Compare/Save already tolerate an unresolvable product.
 */
export default function ProductCard({ id, href, label, image, imageAlt, tagline, specs = [], badges = [], product = null }) {
  const content = (
    <div className="pd-card border border-gray-200 overflow-hidden h-full flex flex-col bg-white"
      style={{ position: 'relative', transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c8102e'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      {href && <SaveForLaterButton productId={id} variant="icon" />}
      {href && <CompareToggleButton productId={id} variant="icon" />}
      {href && product && <AddToAllCompatibleBuildsButton product={product} variant="icon" />}
      {image && <img src={image} alt={imageAlt || label} className="w-full object-cover" style={{ height: 180 }} />}
      <div className="p-4 flex flex-col flex-1" style={FS}>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3, marginBottom: 3, letterSpacing: '-0.01em' }}>{label}</p>
        {tagline && <p style={{ fontSize: 12.5, fontWeight: 500, color: '#8a6d00', marginBottom: 8 }}>{tagline}</p>}
        {specs.length > 0 && (
          <ul style={{ fontSize: 12, color: '#666', paddingLeft: '1rem', flex: 1, lineHeight: 1.6 }}>
            {specs.map((spec) => <li key={spec}>{spec}</li>)}
          </ul>
        )}
        {badges.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
            {badges.map((badge) => (
              <span key={badge} style={{ fontSize: 10, fontWeight: 700, background: '#f0f4ff', color: '#1a2744', padding: '2px 6px', letterSpacing: '0.05em' }}>{badge}</span>
            ))}
          </div>
        )}
        <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #f0f0f0' }}>
          {href ? (
            <span className="pd-card-cta" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11.5, fontWeight: 700, color: '#c8102e',
              border: '1.5px solid #c8102e', borderRadius: 3,
              padding: '6px 12px', letterSpacing: '0.05em',
              transition: 'background-color 0.15s, color 0.15s',
            }}>
              VIEW DETAILS <span aria-hidden="true">&rarr;</span>
            </span>
          ) : (
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#999', letterSpacing: '0.04em' }}>
              DETAILS COMING SOON
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (!href) {
    return <div key={id} style={{ opacity: 0.85, cursor: 'default' }}>{content}</div>;
  }

  return (
    <Link key={id} to={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      {content}
    </Link>
  );
}
