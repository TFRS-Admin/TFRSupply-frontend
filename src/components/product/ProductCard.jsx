import React from 'react';
import { Link } from 'react-router-dom';
import CompareToggleButton from '@/components/product/CompareToggleButton';
import SaveForLaterButton from '@/components/product/SaveForLaterButton';
import AddToAllCompatibleBuildsButton from '@/components/fleetBuilds/AddToAllCompatibleBuildsButton';
import { formatPrice } from '@/lib/pricing';

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
export default function ProductCard({ id, href, label, image, imageAlt, tagline, specs = [], badges = [], product = null, price = null, compareAtPrice = null }) {
  const content = (
    <div
      className="pd-card group relative flex h-full flex-col overflow-hidden bg-white transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_2.5rem_2rem_-1.25rem_rgba(0,0,0,0.3)]"
      style={{ border: '1px solid #002a3a', borderRadius: '5px 20px 5px 20px', boxShadow: '0 20px 40px rgba(0,0,0,0.16)' }}
    >
      {href && <SaveForLaterButton productId={id} variant="icon" />}
      {href && <CompareToggleButton productId={id} variant="icon" />}
      {href && product && <AddToAllCompatibleBuildsButton product={product} variant="icon" />}
      {image && <img src={image} alt={imageAlt || label} className="h-[200px] w-full object-cover" />}
      <div className="flex flex-1 flex-col p-[30px]" style={{ background: '#002a3a' }}>
        <p className="font-heading mb-1 text-lg font-bold uppercase leading-tight" style={{ color: '#f2f2f2' }}>{label}</p>
        {tagline && <p className="font-body mb-2 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{tagline}</p>}
        {specs.length > 0 && (
          <ul className="font-body flex-1 list-disc pl-4 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {specs.map((spec) => <li key={spec}>{spec}</li>)}
          </ul>
        )}
        {badges.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {badges.map((badge) => (
              <span key={badge} className="font-body px-1.5 py-0.5 text-[10px] font-bold tracking-wide" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>{badge}</span>
            ))}
          </div>
        )}
        {price != null && (
          <div className="mt-2 mb-1">
            {compareAtPrice != null && compareAtPrice > price && (
              <span className="font-body block text-xs line-through" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {formatPrice(compareAtPrice)} MSRP
              </span>
            )}
            <span className="font-heading text-xl font-bold" style={{ color: '#F5B942' }}>
              {formatPrice(price)}
            </span>
          </div>
        )}
        <div className="mt-3">
          {href ? (
            <span
              className="pd-card-cta mt-auto block w-full px-4 py-2 text-center font-heading text-sm font-bold uppercase text-white transition-colors"
              style={{ background: '#e21938', borderRadius: '20px 2px 20px 2px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#ec0025'}
              onMouseLeave={e => e.currentTarget.style.background = '#e21938'}
            >
              Learn More ›
            </span>
          ) : (
            <span className="font-body block text-center text-xs font-semibold tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
